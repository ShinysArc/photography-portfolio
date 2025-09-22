package middleware

import (
	"net/http"
	"strings"
)

func WithCORS(allowed string, next http.Handler) http.Handler {
	allowAll := strings.TrimSpace(allowed) == "*" || allowed == ""
	allowedOrigins := splitCSV(allowed)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		if allowAll {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		} else if origin != "" && contains(allowedOrigins, origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		// Echo requested headers so browser is happy even if the set is custom
		reqHdrs := r.Header.Get("Access-Control-Request-Headers")
		if reqHdrs == "" {
			reqHdrs = "Content-Type, X-Admin-Token"
		}
		w.Header().Set("Access-Control-Allow-Headers", reqHdrs)
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		w.Header().Set("Access-Control-Expose-Headers", "X-Request-ID, Content-Type, Content-Length")
		w.Header().Set("Access-Control-Max-Age", "600")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func splitCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	for i := range parts {
		parts[i] = strings.TrimSpace(parts[i])
	}
	return parts
}
func contains(list []string, v string) bool {
	for _, s := range list {
		if s == v {
			return true
		}
	}
	return false
}
