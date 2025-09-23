package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Port        string
	DataDir     string
	AllowOrigin string

	ImmichURL     string
	ImmichAPIKey  string
	ImmichAlbumID string

	AdminToken string

	SMTPHost    string
	SMTPPort    int
	SMTPUser    string
	SMTPPass    string
	ContactFrom string
	ContactTo   string
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
func mustenv(k string) string {
	v := os.Getenv(k)
	if v == "" {
		fmt.Fprintf(os.Stderr, "missing required env: %s\n", k)
		os.Exit(1)
	}
	return v
}

func Load() Config {
	p := getenv("PORT", "8080")
	sp, _ := strconv.Atoi(getenv("SMTP_PORT", "587"))

	return Config{
		Port:        p,
		DataDir:     getenv("DATA_DIR", "data"),
		AllowOrigin: getenv("ALLOW_ORIGIN", "*"),

		ImmichURL:     mustenv("IMMICH_URL"),
		ImmichAPIKey:  mustenv("IMMICH_API_KEY"),
		ImmichAlbumID: mustenv("IMMICH_ALBUM_ID"),

		AdminToken: mustenv("ADMIN_TOKEN"),

		SMTPHost:    getenv("SMTP_HOST", ""),
		SMTPPort:    sp,
		SMTPUser:    getenv("SMTP_USER", ""),
		SMTPPass:    getenv("SMTP_PASS", ""),
		ContactFrom: getenv("CONTACT_FROM", ""),
		ContactTo:   getenv("CONTACT_TO", ""),
	}
}
