package store

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/ShinysArc/photography-portfolio/server/internal/config"
)

type Paths struct {
	Preview  string // e.g. "preview/<id>.jpg"
	Fullsize string // e.g. "fullsize/<id>.jpg"
}

// BuildPathIndex scans DATA_DIR/{preview,fullsize} and returns id -> Paths.
// If only preview exists, Fullsize will fall back to the same preview path.
func BuildPathIndex(cfg config.Config) (map[string]Paths, error) {
	root := cfg.DataDir
	index := map[string]Paths{}

	scan := func(variant string) error {
		dir := filepath.Join(root, variant)
		ents, err := os.ReadDir(dir)
		if err != nil {
			if os.IsNotExist(err) {
				return nil
			}
			return err
		}
		for _, e := range ents {
			if e.IsDir() {
				continue
			}
			name := e.Name() // "<id>.<ext>"
			if dot := strings.LastIndexByte(name, '.'); dot > 0 {
				id := name[:dot]
				p := index[id]
				rel := filepath.ToSlash(filepath.Join(variant, name))
				if variant == "preview" {
					p.Preview = rel
					if p.Fullsize == "" {
						p.Fullsize = rel
					}
				} else {
					p.Fullsize = rel
				}
				index[id] = p
			}
		}
		return nil
	}

	_ = os.MkdirAll(filepath.Join(root, "preview"), 0o755)
	_ = os.MkdirAll(filepath.Join(root, "fullsize"), 0o755)

	if err := scan("preview"); err != nil {
		return nil, err
	}
	if err := scan("fullsize"); err != nil {
		return nil, err
	}
	return index, nil
}
