package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net"
	"net/http"
	"strings"
	"time"
)

type recorder struct {
	http.ResponseWriter
	status int
	bytes  int
}

func (w *recorder) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

func (w *recorder) Write(b []byte) (int, error) {
	if w.status == 0 {
		w.status = http.StatusOK
	}
	n, err := w.ResponseWriter.Write(b)
	w.bytes += n
	return n, err
}

func WithLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		reqID := r.Header.Get("X-Request-ID")
		if reqID == "" {
			reqID = newReqID()
		}
		w.Header().Set("X-Request-ID", reqID)

		rec := &recorder{ResponseWriter: w}

		next.ServeHTTP(rec, r)
		ip := clientIP(r)

		ua := r.UserAgent()
		if len(ua) > 120 {
			ua = ua[:117] + "..."
		}

		path := r.URL.Path
		if qs := r.URL.RawQuery; qs != "" {
			path += "?" + qs
		}

		dur := time.Since(start)
		log.Printf("[%s] %d %s %s %dB %s ip=%s ua=%q",
			reqID, rec.status, r.Method, path, rec.bytes, dur.Truncate(time.Microsecond), ip, ua)
	})
}

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	if xrip := r.Header.Get("X-Real-IP"); xrip != "" {
		return strings.TrimSpace(xrip)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func newReqID() string {
	var b [8]byte
	if _, err := rand.Read(b[:]); err == nil {
		return hex.EncodeToString(b[:]) // 16 hex chars
	}
	return time.Now().UTC().Format("150405.000")
}
