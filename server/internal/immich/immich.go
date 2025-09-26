package immich

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/ShinysArc/photography-portfolio/server/internal/config"
)

type Tag struct {
	ID    string  `json:"id"`
	Name  *string `json:"name,omitempty"`
	Value *string `json:"value,omitempty"`
}

type Exif struct {
	Make            *string  `json:"make,omitempty"`
	Model           *string  `json:"model,omitempty"`
	LensModel       *string  `json:"lensModel,omitempty"`
	FNumber         *float64 `json:"fNumber,omitempty"`
	ExposureTime    *string  `json:"exposureTime,omitempty"`
	ISO             *int     `json:"iso,omitempty"`
	FocalLength     *float64 `json:"focalLength,omitempty"`
	DateTimeOrig    *string  `json:"dateTimeOriginal,omitempty"`
	TimeZone        *string  `json:"timeZone,omitempty"`
	ExifImageWidth  *int     `json:"exifImageWidth,omitempty"`
	ExifImageHeight *int     `json:"exifImageHeight,omitempty"`
}

type Asset struct {
	ID               string  `json:"id"`
	OriginalFileName *string `json:"originalFileName,omitempty"`
	ExifInfo         *Exif   `json:"exifInfo,omitempty"`
	Tags             []Tag   `json:"tags,omitempty"`
}

type albumResp struct {
	ID         string          `json:"id"`
	AlbumName  string          `json:"albumName"`
	AssetCount int             `json:"assetCount"`
	Assets     json.RawMessage `json:"assets"`
}

type AlbumMeta struct {
	ID         string
	AlbumName  string
	AssetCount int
}

func getJSON[T any](ctx context.Context, cfg config.Config, url string, v *T) error {
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("x-api-key", cfg.ImmichAPIKey)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer func() { _ = res.Body.Close() }()
	if res.StatusCode < 200 || res.StatusCode > 299 {
		b, _ := io.ReadAll(res.Body)
		return fmt.Errorf("immich %s -> %s: %s", url, res.Status, string(b))
	}
	return json.NewDecoder(res.Body).Decode(v)
}

func parseAssetIDs(raw json.RawMessage) ([]string, error) {
	var wrap struct {
		Items []struct {
			ID string `json:"id"`
		} `json:"items"`
	}
	if err := json.Unmarshal(raw, &wrap); err == nil && len(wrap.Items) > 0 {
		ids := make([]string, 0, len(wrap.Items))
		for _, it := range wrap.Items {
			if it.ID != "" {
				ids = append(ids, it.ID)
			}
		}
		if len(ids) > 0 {
			return ids, nil
		}
	}

	var arrObj []struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(raw, &arrObj); err == nil && len(arrObj) > 0 {
		ids := make([]string, 0, len(arrObj))
		for _, it := range arrObj {
			if it.ID != "" {
				ids = append(ids, it.ID)
			}
		}
		if len(ids) > 0 {
			return ids, nil
		}
	}

	var arrStr []string
	if err := json.Unmarshal(raw, &arrStr); err == nil && len(arrStr) > 0 {
		return arrStr, nil
	}

	return []string{}, nil
}

// Get album meta + list of asset IDs
func GetAlbumMetaAndIDs(ctx context.Context, cfg config.Config) (AlbumMeta, []string, error) {
	var out albumResp
	url := fmt.Sprintf("%s/api/albums/%s?withoutAssets=false", cfg.ImmichURL, cfg.ImmichAlbumID)
	if err := getJSON(ctx, cfg, url, &out); err != nil {
		return AlbumMeta{}, nil, err
	}
	ids, err := parseAssetIDs(out.Assets)
	if err != nil {
		return AlbumMeta{}, nil, err
	}
	meta := AlbumMeta{ID: out.ID, AlbumName: out.AlbumName, AssetCount: out.AssetCount}
	return meta, ids, nil
}

func GetAsset(ctx context.Context, cfg config.Config, id string) (Asset, error) {
	var out Asset
	url := fmt.Sprintf("%s/api/assets/%s", cfg.ImmichURL, id)
	return out, getJSON(ctx, cfg, url, &out)
}

func ImageURL(cfg config.Config, id, q string) string {
	switch strings.ToLower(q) {
	case "thumbnail":
		fallthrough
	case "preview":
		return fmt.Sprintf("%s/api/assets/%s/thumbnail?size=preview", cfg.ImmichURL, id)
	default:
		return fmt.Sprintf("%s/api/assets/%s/thumbnail?size=preview", cfg.ImmichURL, id)
	}
}
