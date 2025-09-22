package cache

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"sync"

	"github.com/ShinysArc/photography-portfolio/server/internal/config"
	"github.com/ShinysArc/photography-portfolio/server/internal/immich"
	"github.com/ShinysArc/photography-portfolio/server/internal/store"
)

type Item struct {
	ID               string       `json:"id"`
	OriginalFileName *string      `json:"originalFileName,omitempty"`
	Exif             immich.Exif  `json:"exif"`
	Tags             []immich.Tag `json:"tags"`
}

type File struct {
	Album struct {
		ID         string `json:"id"`
		Name       string `json:"name"`
		AssetCount int    `json:"assetCount"`
	} `json:"album"`
	Items []Item `json:"items"`
}

func path(cfg config.Config) string {
	return filepath.Join(cfg.DataDir, "cache.json")
}

func EnsureDir(cfg config.Config) error {
	return os.MkdirAll(cfg.DataDir, 0o755)
}

func Refresh(ctx context.Context, cfg config.Config) (File, error) {
	meta, ids, err := immich.GetAlbumMetaAndIDs(ctx, cfg)
	if err != nil {
		return File{}, err
	}

	// Build metadata cache
	out := File{}
	out.Album.ID = meta.ID
	out.Album.Name = meta.AlbumName
	out.Album.AssetCount = meta.AssetCount
	out.Items = make([]Item, len(ids))

	const workers = 8
	var wg sync.WaitGroup
	var mu sync.Mutex
	idx := 0

	type res struct {
		i    int
		item Item
		err  error
	}
	ch := make(chan res, len(ids))

	worker := func() {
		defer wg.Done()
		for {
			mu.Lock()
			if idx >= len(ids) {
				mu.Unlock()
				return
			}
			i := idx
			id := ids[i]
			idx++
			mu.Unlock()

			full, e := immich.GetAsset(ctx, cfg, id)
			if e != nil {
				ch <- res{err: e}
				continue
			}
			ex := immich.Exif{}
			if full.ExifInfo != nil {
				ex = *full.ExifInfo
			}

			ch <- res{i: i, item: Item{
				ID:               full.ID,
				OriginalFileName: full.OriginalFileName,
				Exif:             ex,
				Tags:             full.Tags,
			}}
		}
	}

	wg.Add(workers)
	for i := 0; i < workers; i++ {
		go worker()
	}
	wg.Wait()
	close(ch)

	for r := range ch {
		if r.err != nil {
			return File{}, r.err
		}
		out.Items[r.i] = r.item
	}

	// Write metadata cache
	if err := EnsureDir(cfg); err != nil {
		return File{}, err
	}
	b, _ := json.MarshalIndent(out, "", "  ")
	if err := os.WriteFile(path(cfg), b, 0o644); err != nil {
		return File{}, err
	}

	// Prefetch both variants and prune stale files ----
	_ = store.EnsureDirs(cfg)
	_ = store.Prefetch(ctx, cfg, ids, []string{"preview", "fullsize"})
	keep := make(map[string]struct{}, len(ids))
	for _, id := range ids {
		keep[id] = struct{}{}
	}
	_ = store.Prune(cfg, keep)

	return out, nil
}

func Read(cfg config.Config) ([]byte, error) {
	return os.ReadFile(path(cfg))
}
