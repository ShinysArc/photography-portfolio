package main

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/ShinysArc/photography-portfolio/server/internal/config"
	"github.com/ShinysArc/photography-portfolio/server/internal/handlers"
	"github.com/ShinysArc/photography-portfolio/server/internal/mail"
	"github.com/ShinysArc/photography-portfolio/server/internal/middleware"
)

func main() {
	cfg := config.Load()

	mailer, err := mail.NewMailer(cfg)
	if err != nil {
		log.Printf("mail disabled: %v", err)
	}

	mux := http.NewServeMux()
	handlers.RegisterAll(mux, cfg, mailer)

	// Order: Logging -> CORS -> Handlers
	var handler http.Handler = mux
	handler = middleware.WithLogging(handler)
	handler = middleware.WithCORS(cfg.AllowOrigin, handler)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           handler,
		ReadTimeout:       10 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	log.Printf("Go API listening on :%s (CORS allow: %s)", cfg.Port, cfg.AllowOrigin)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
