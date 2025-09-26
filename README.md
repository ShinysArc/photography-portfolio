# Photography Portfolio (Immich + Next.js + Go)

My photography portfolio, it fetches from **Immich**, pre-caches images on a **Go** backend, and renders a **Next.js** frontend.

## ✨ Highlights

- Zero hotlinking: Go server downloads & serves local **previews**.
- Fast gallery: Frontend uses low-weight previews.
- Rich metadata: EXIF panel, Immich album name, and tag filtering.
- Animations: Page transitions (no blip) and theme-change animations.
- Contact form: Emails via SMTP (MXroute/Blizzard etc.) using `go-mail`.
- Tooling: ESLint + Prettier, Tailwind tokens for warm neutral palette.

## 🏗️ Architecture

```
web/ (Next.js)
  ├─ routes/pages (Gallery, About, Gear, Contact)
  ├─ template.tsx (route transitions)
  ├─ rewrites → /api/* (same-origin to avoid CORS)
  └─ images fetched from /api/img/:id?q=preview

server/ (Go)
  ├─ /api/cache            # JSON cache
  ├─ /api/refresh          # Rebuild cache
  ├─ /api/img/:id          # Serve cached image; fetch on miss
  ├─ /api/contact          # Send email via SMTP
  └─ /healthz              # 204 liveness
```

## 📂 Repo Layout

```
web/            # Next.js frontend
server/         # Go API + cache + image store
```

## 🚀 Quickstart (Dev)

1) Start the Go API

```
cd server
cp .env.example .env   # if present; otherwise create using the table below
set -a && source .env && set +a
go mod tidy
go run ./cmd/server
```

2) Start the Next.js app

```
cd ../web
cp .env.local.example .env.local
npm i
npm run dev
# open the URL printed by Next (e.g., http://localhost:3000)
```

> The web app proxies `/api/*` to the Go server via Next **rewrites**, so the browser never talks cross-origin.

## 🔁 Update the album

Trigger cache/thumbnail refresh:
```
curl -X POST "http://<GO_HOST>:<PORT>/api/refresh" \
  -H "x-admin-token: <ADMIN_TOKEN>"
```

## ⚙️ Environment (summary)

- server/.env

| Var | Required | Example |
|---|---|---|
| PORT | no | 8083 |
| DATA_DIR | no | ./data |
| ALLOW_ORIGIN | no | http://localhost:3000,https://yourdomain.com (or *) |
| IMMICH_URL | yes | https://immich.example.com |
| IMMICH_API_KEY | yes | (Immich API key) |
| IMMICH_ALBUM_ID | yes | d8dbb145-...-... |
| ADMIN_TOKEN | yes | long random string |
| SMTP_HOST | optional | mail.mxlogin.com |
| SMTP_PORT | optional | 587 (or 465) |
| SMTP_USER | optional | contact@yourdomain.com |
| SMTP_PASS | optional | ******** |
| CONTACT_FROM | optional | Portfolio <contact+photo@yourdomain.com> |
| CONTACT_TO | optional | me@yourdomain.com |

- web/.env.local

| Var | Required | Example |
|---|---|---|
| NEXT_PUBLIC_API_BASE | yes | http://localhost:8080 |

## 🧰 Scripts

```
web/:  npm run dev, npm run build, npm run start, npm run lint, npm run lint:fix, npm run format
server/:  go run ./cmd/server, go build ./cmd/server
```

## 🪵 Logs

The server prints one access line per request:

```
[4f8c1a98b7e32a1d] 200 GET /api/cache 54321B 4.3ms ip=127.0.0.1 ua="Mozilla/5.0 ..."
```

## 🛟 Troubleshooting

- Images refetching: run `/api/refresh` to prefetch; check DATA_DIR/img/preview.
- No data in UI: confirm `GET /api/cache` returns JSON and Next rewrites point to NEXT_PUBLIC_API_BASE.
