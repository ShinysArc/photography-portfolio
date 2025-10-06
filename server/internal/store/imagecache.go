package store

import (
	"context"
	"encoding/base64"
	"fmt"
	"image"
	_ "image/jpeg"
    _ "image/png"
    _ "golang.org/x/image/webp"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"

	thumbhash "github.com/galdor/go-thumbhash"

	"github.com/ShinysArc/photography-portfolio/server/internal/config"
	"github.com/ShinysArc/photography-portfolio/server/internal/immich"
)

/*
Directory layout:

DATA_DIR/
  img/
    preview/   <id>.<ext>
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

func ComputeThumbHashFromFile(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer func() { _ = f.Close() }()

	img, _, err := image.Decode(f)
	if err != nil {
		return "", err
	}

	h := thumbhash.EncodeImage(img)
	return base64.StdEncoding.EncodeToString(h), nil
}

func dirFor(cfg config.Config) string {
	return filepath.Join(cfg.DataDir, "preview")
}

func EnsureDirs(cfg config.Config) error {
	dir := dirFor(cfg)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	_ = os.Chmod(dir, 0o755)
	return nil
}

func FindCached(cfg config.Config, id string) (string, string, bool) {
	base := dirFor(cfg)
	for _, ext := range knownExts {
		p := filepath.Join(base, id+ext)
		if st, err := os.Stat(p); err == nil && !st.IsDir() {
			return p, mimeFromExt[ext], true
		}
	}
	return "", "", false
}

func savePreviewFile(cfg config.Config, id, contentType string, r io.Reader) (string, error) {
	ext := extFromMime[strings.ToLower(strings.TrimSpace(contentType))]
	if ext == "" {
		ext = ".jpg"
	}
	dir := dirFor(cfg)

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

// DownloadAndCache fetches images from Immich and writes it to disk.
func DownloadAndCache(ctx context.Context, cfg config.Config, id string) (string, string, error) {
	if p, ct, ok := FindCached(cfg, id); ok {
		return p, ct, nil
	}

	url := immich.ImageURL(cfg, id, "preview")
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	req.Header.Set("x-api-key", cfg.ImmichAPIKey)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", "", err
	}
	defer func() { _ = res.Body.Close() }()

	if res.StatusCode < 200 || res.StatusCode > 299 {
		b, _ := io.ReadAll(res.Body)
		return "", "", fmt.Errorf("download image %s -> %s %s", id, res.Status, string(b))
	}

	ct := res.Header.Get("Content-Type")
	path, err := savePreviewFile(cfg, id, ct, res.Body)
	if err != nil {
		return "", "", err
	}
	return path, ct, nil
}

// Prefetch downloads images for all provided IDs with concurrency.
func Prefetch(ctx context.Context, cfg config.Config, ids []string) error {
	if err := EnsureDirs(cfg); err != nil {
		return err
	}

	seen := make(map[string]struct{}, len(ids))
	unique := make([]string, 0, len(ids))
	for _, id := range ids {
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		unique = append(unique, id)
	}

	type job struct{ id string }
	jobs := make([]job, 0, len(unique))
	for _, id := range unique {
		if _, _, ok := FindCached(cfg, id); ok {
			continue
		}
		jobs = append(jobs, job{id: id})
	}
	if len(jobs) == 0 {
		return nil
	}

	const workers = 8
	var (
		wg   sync.WaitGroup
		mu   sync.Mutex
		next = 0
	)
	errs := make(chan error, 1)

	worker := func() {
		defer wg.Done()
		for {
			// cancellation
			select {
			case <-ctx.Done():
				mu.Lock()
				select {
				case errs <- ctx.Err():
				default:
				}
				mu.Unlock()
				return
			default:
			}

			// take next job
			mu.Lock()
			if next >= len(jobs) {
				mu.Unlock()
				return
			}
			j := jobs[next]
			next++
			mu.Unlock()

			if _, _, err := DownloadAndCache(ctx, cfg, j.id); err != nil {
				mu.Lock()
				select {
				case errs <- err:
				default:
				}
				mu.Unlock()
			}
		}
	}

	wg.Add(workers)
	for i := 0; i < workers; i++ {
		go worker()
	}
	wg.Wait()
	close(errs)

	if e, ok := <-errs; ok && e != nil {
		return e
	}
	return nil
}

// Prune removes cached files for IDs that are no longer in the album.
func Prune(cfg config.Config, keepIDs map[string]struct{}) error {
	dir := dirFor(cfg)

	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name() // "<id>.<ext>"
		if dot := strings.LastIndexByte(name, '.'); dot > 0 {
			id := name[:dot]
			if _, ok := keepIDs[id]; !ok {
				_ = os.Remove(filepath.Join(dir, name))
			}
		}
	}
	return nil
}
