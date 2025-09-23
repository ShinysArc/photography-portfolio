package store

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/ShinysArc/photography-portfolio/server/internal/config"
	"github.com/ShinysArc/photography-portfolio/server/internal/immich"
)

/*
Directory layout:

DATA_DIR/
  img/
    preview/   <id>.<ext>
    fullsize/  <id>.<ext>
*/

var knownExts = []string{".jpg", ".jpeg", ".webp", ".png", ".avif"}

var mimeFromExt = map[string]string{
	".jpg":  "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".png":  "image/png",
	".avif": "image/avif",
}

var extFromMime = map[string]string{
	"image/jpeg": ".jpg",
	"image/webp": ".webp",
	"image/png":  ".png",
	"image/avif": ".avif",
}

func dirFor(cfg config.Config, variant string) string {
	return filepath.Join(cfg.DataDir, variant)
}

func EnsureDirs(cfg config.Config) error {
	for _, v := range []string{"preview", "fullsize"} {
		if err := os.MkdirAll(dirFor(cfg, v), 0o755); err != nil {
			return err
		}
		_ = os.Chmod(dirFor(cfg, v), 0o755)
	}
	return nil
}

func FindCached(cfg config.Config, variant, id string) (string, string, bool) {
	base := dirFor(cfg, variant)
	for _, ext := range knownExts {
		p := filepath.Join(base, id+ext)
		if st, err := os.Stat(p); err == nil && !st.IsDir() {
			return p, mimeFromExt[ext], true
		}
	}
	return "", "", false
}

func saveFile(cfg config.Config, variant, id, contentType string, r io.Reader) (string, error) {
	ext := extFromMime[strings.ToLower(strings.TrimSpace(contentType))]
	if ext == "" {
		ext = ".jpg"
	}
	dir := dirFor(cfg, variant)

	tmp := filepath.Join(dir, id+".tmp")
	out, err := os.Create(tmp)
	if err != nil {
		return "", err
	}
	if _, err := io.Copy(out, r); err != nil {
		_ = out.Close()
		_ = os.Remove(tmp)
		return "", err
	}
	if err := out.Close(); err != nil {
		_ = os.Remove(tmp)
		return "", err
	}

	final := filepath.Join(dir, id+ext)
	_ = os.Remove(final)
	if err := os.Rename(tmp, final); err != nil {
		_ = os.Remove(tmp)
		return "", err
	}

	_ = os.Chmod(final, 0o644)

	return final, nil
}

// DownloadAndCache fetches image from Immich and writes it to disk.
func DownloadAndCache(ctx context.Context, cfg config.Config, id, variant string) (string, string, error) {
	url := immich.ImageURL(cfg, id, variant)
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	req.Header.Set("x-api-key", cfg.ImmichAPIKey)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", "", err
	}
	defer func() { _ = res.Body.Close() }()
	if res.StatusCode < 200 || res.StatusCode > 299 {
		b, _ := io.ReadAll(res.Body)
		return "", "", fmt.Errorf("download %s %s -> %s %s", variant, id, res.Status, string(b))
	}
	ct := res.Header.Get("Content-Type")
	path, err := saveFile(cfg, variant, id, ct, res.Body)
	if err != nil {
		return "", "", err
	}
	return path, ct, nil
}

// Prefetch downloads given variants for all IDs with concurrency.
func Prefetch(ctx context.Context, cfg config.Config, ids []string, variants []string) error {
	if err := EnsureDirs(cfg); err != nil {
		return err
	}

	type job struct{ id, variant string }
	var jobs []job
	for _, id := range ids {
		for _, v := range variants {
			// skip if already cached
			if _, _, ok := FindCached(cfg, v, id); ok {
				continue
			}
			jobs = append(jobs, job{id: id, variant: v})
		}
	}
	if len(jobs) == 0 {
		return nil
	}

	const workers = 8
	var wg sync.WaitGroup
	var mu sync.Mutex
	next := 0
	errs := make(chan error, len(jobs))

	worker := func() {
		defer wg.Done()
		for {
			mu.Lock()
			if next >= len(jobs) {
				mu.Unlock()
				return
			}
			j := jobs[next]
			next++
			mu.Unlock()

			if _, _, err := DownloadAndCache(ctx, cfg, j.id, j.variant); err != nil {
				errs <- err
			}
		}
	}

	wg.Add(workers)
	for i := 0; i < workers; i++ {
		go worker()
	}
	wg.Wait()
	close(errs)

	for e := range errs {
		return e
	}
	return nil
}

// Prune removes cached files for IDs that are no longer in the album.
func Prune(cfg config.Config, keepIDs map[string]struct{}) error {
	for _, v := range []string{"preview", "fullsize"} {
		dir := dirFor(cfg, v)
		entries, err := os.ReadDir(dir)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return err
		}
		for _, e := range entries {
			if e.IsDir() {
				continue
			}
			name := e.Name() // "<id>.<ext>"
			dot := strings.LastIndexByte(name, '.')
			if dot <= 0 {
				continue
			}
			id := name[:dot]
			if _, ok := keepIDs[id]; !ok {
				_ = os.Remove(filepath.Join(dir, name))
			}
		}
	}
	return nil
}
