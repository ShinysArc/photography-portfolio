package store

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/ShinysArc/photography-portfolio/server/internal/config"
)

type Paths struct {
	Preview string // e.g. "preview/<id>.jpg"
}

// BuildPathIndex scans DATA_DIR/preview and returns id -> Paths.
func BuildPathIndex(cfg config.Config) (map[string]Paths, error) {
	root := cfg.DataDir
	index := map[string]Paths{}

	dir := filepath.Join(root, "preview")
	_ = os.MkdirAll(dir, 0o755)

	ents, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return index, nil
		}
		return nil, err
	}

	for _, e := range ents {
		if e.IsDir() {
			continue
		}
		name := e.Name() // "<id>.<ext>"
		if dot := strings.LastIndexByte(name, '.'); dot > 0 {
			id := name[:dot]
			index[id] = Paths{Preview: filepath.ToSlash(filepath.Join("preview", name))}
		}
	}
	return index, nil
}
