package handlers

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/ShinysArc/photography-portfolio/server/internal/cache"
	"github.com/ShinysArc/photography-portfolio/server/internal/config"
	"github.com/ShinysArc/photography-portfolio/server/internal/immich"
	"github.com/ShinysArc/photography-portfolio/server/internal/mail"
	"github.com/ShinysArc/photography-portfolio/server/internal/store"
)

type contactPayload struct {
	Name      string  `json:"name"`
	Email     string  `json:"email"`
	Subject   string  `json:"subject"`
	Message   string  `json:"message"`
	HP        *string `json:"hp"`
	StartedAt *int64  `json:"startedAt"`
}

func RegisterAll(mux *http.ServeMux, cfg config.Config, mailer *mail.Mailer) {
	mux.HandleFunc("GET /healthz", healthz)

	// Cache read
	mux.HandleFunc("GET /api/cache", func(w http.ResponseWriter, r *http.Request) {
		b, err := cache.Read(cfg)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"album":null,"items":[]}`))
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-store")
		w.Write(b)
	})

	// Refresh
	mux.HandleFunc("POST /api/refresh", func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("x-admin-token") != cfg.AdminToken {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), 60*time.Second)
		defer cancel()
		data, err := cache.Refresh(ctx, cfg)
		if err != nil {
			http.Error(w, "refresh failed: "+err.Error(), 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"ok":    true,
			"count": len(data.Items),
			"album": data.Album,
		})
		// after responding:
		log.Printf("refresh ok: album=%s count=%d", data.Album.ID, len(data.Items))
	})

	// Image proxy
	mux.HandleFunc("GET /api/img/", func(w http.ResponseWriter, r *http.Request) {
		id := strings.TrimPrefix(r.URL.Path, "/api/img/")
		if id == "" {
			http.Error(w, "missing id", 400)
			return
		}
		q := strings.ToLower(r.URL.Query().Get("q"))
		switch q {
		case "thumbnail":
			q = "preview"
		case "", "preview", "fullsize":
			// ok
		default:
			q = "preview"
		}

		if p, ct, ok := store.FindCached(cfg, q, id); ok {
			w.Header().Set("Content-Type", ct)
			w.Header().Set("Cache-Control", "public, max-age=604800, immutable")
			http.ServeFile(w, r, p)
			return
		}

		ctx := r.Context()
		p, ct, err := store.DownloadAndCache(ctx, cfg, id, q)
		if err == nil {
			w.Header().Set("Content-Type", ct)
			w.Header().Set("Cache-Control", "public, max-age=604800, immutable")
			http.ServeFile(w, r, p)
			return
		}

		target := immich.ImageURL(cfg, id, q)
		req, _ := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
		req.Header.Set("x-api-key", cfg.ImmichAPIKey)
		res, err2 := http.DefaultClient.Do(req)
		if err2 != nil {
			http.Error(w, "proxy error: "+err2.Error(), 502)
			return
		}
		defer res.Body.Close()
		if ct := res.Header.Get("Content-Type"); ct != "" {
			w.Header().Set("Content-Type", ct)
		}
		w.Header().Set("Cache-Control", "public, max-age=86400, immutable")
		w.WriteHeader(res.StatusCode)
		io.Copy(w, res.Body)
	})

	// Contact (SMTP via go-mail)
	mux.HandleFunc("POST /api/contact", func(w http.ResponseWriter, r *http.Request) {
		if mailer == nil {
			http.Error(w, "mail not configured", 500)
			return
		}
		var p contactPayload
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, "bad json", 400); return
		}
		if strings.TrimSpace(p.Name) == "" || strings.TrimSpace(p.Email) == "" || strings.TrimSpace(p.Message) == "" {
			http.Error(w, "missing fields", 400); return
		}
		if p.HP != nil && strings.TrimSpace(*p.HP) != "" {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"ok":true}`)); return
		}
		if p.StartedAt != nil && time.Since(time.UnixMilli(*p.StartedAt)) < 3*time.Second {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"ok":true}`)); return
		}

		subj := "[Portfolio] " + p.Name
		if s := strings.TrimSpace(p.Subject); s != "" { subj += " — " + s }
		text := "From: " + p.Name + " <" + p.Email + ">\n\n" + p.Message
		html := `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">` +
			`<p><strong>From:</strong> ` + esc(p.Name) + ` &lt;` + esc(p.Email) + `&gt;</p>` +
			func() string {
				if strings.TrimSpace(p.Subject) == "" { return "" }
				return `<p><strong>Subject:</strong> ` + esc(p.Subject) + `</p>`
			}() +
			`<hr/><pre style="white-space:pre-wrap;font:inherit">` + esc(p.Message) + `</pre></div>`

		ctx, cancel := context.WithTimeout(r.Context(), 20*time.Second)
		defer cancel()
		if err := mailer.Send(ctx, p.Email, subj, text, html); err != nil {
			http.Error(w, "send failed: "+err.Error(), 500); return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"ok":true}`))
	})
}

func esc(s string) string {
	r := strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;", `"`, "&quot;", "'", "&#39;")
	return r.Replace(s)
}
