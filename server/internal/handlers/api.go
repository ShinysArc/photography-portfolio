package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/ShinysArc/photography-portfolio/server/internal/cache"
	"github.com/ShinysArc/photography-portfolio/server/internal/config"
	"github.com/ShinysArc/photography-portfolio/server/internal/mail"
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
			if _, err := w.Write([]byte(`{"album":null,"items":[]}`)); err != nil {
				http.Error(w, "write error", http.StatusInternalServerError)
				return
			}
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-store")
		if _, err := w.Write(b); err != nil {
			http.Error(w, "write error", http.StatusInternalServerError)
			return
		}
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
		if err := json.NewEncoder(w).Encode(map[string]any{
			"ok":    true,
			"count": len(data.Items),
			"album": data.Album,
		}); err != nil {
			http.Error(w, "encode error", http.StatusInternalServerError)
			return
		}
		// after responding:
		log.Printf("refresh ok: album=%s count=%d", data.Album.ID, len(data.Items))
	})

	// Contact (SMTP via go-mail)
	mux.HandleFunc("POST /api/contact", func(w http.ResponseWriter, r *http.Request) {
		if mailer == nil {
			http.Error(w, "mail not configured", 500)
			return
		}
		var p contactPayload
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, "bad json", 400)
			return
		}
		if strings.TrimSpace(p.Name) == "" || strings.TrimSpace(p.Email) == "" || strings.TrimSpace(p.Message) == "" {
			http.Error(w, "missing fields", 400)
			return
		}
		if p.HP != nil && strings.TrimSpace(*p.HP) != "" {
			w.Header().Set("Content-Type", "application/json")
			if _, err := w.Write([]byte(`{"ok":true}`)); err != nil {
				http.Error(w, "write error", http.StatusInternalServerError)
				return
			}
		}
		if p.StartedAt != nil && time.Since(time.UnixMilli(*p.StartedAt)) < 3*time.Second {
			w.Header().Set("Content-Type", "application/json")
			if _, err := w.Write([]byte(`{"ok":true}`)); err != nil {
				http.Error(w, "write error", http.StatusInternalServerError)
				return
			}
		}

		subj := "[Portfolio] " + p.Name
		if s := strings.TrimSpace(p.Subject); s != "" {
			subj += " — " + s
		}
		text := "From: " + p.Name + " <" + p.Email + ">\n\n" + p.Message
		html := `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">` +
			`<p><strong>From:</strong> ` + esc(p.Name) + ` &lt;` + esc(p.Email) + `&gt;</p>` +
			func() string {
				if strings.TrimSpace(p.Subject) == "" {
					return ""
				}
				return `<p><strong>Subject:</strong> ` + esc(p.Subject) + `</p>`
			}() +
			`<hr/><pre style="white-space:pre-wrap;font:inherit">` + esc(p.Message) + `</pre></div>`

		ctx, cancel := context.WithTimeout(r.Context(), 20*time.Second)
		defer cancel()
		if err := mailer.Send(ctx, p.Email, subj, text, html); err != nil {
			http.Error(w, "send failed: "+err.Error(), 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		if _, err := w.Write([]byte(`{"ok":true}`)); err != nil {
			http.Error(w, "write error", http.StatusInternalServerError)
			return
		}
	})
}

func esc(s string) string {
	r := strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;", `"`, "&quot;", "'", "&#39;")
	return r.Replace(s)
}
