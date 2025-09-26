# Server (Go API + Cache + Image Store)

A compact Go service that talks to **Immich**, builds a JSON metadata cache, **downloads & serves images locally**, and sends contact emails via SMTP.

## Endpoints

| Method | Path                 | Description |
|---|---|---|
| GET  | /healthz              | 204 liveness |
| GET  | /api/cache            | Album + items JSON (tags, EXIF, filenames, sizes) |
| POST | /api/refresh          | Rebuild cache **and** prefetch images. Requires `x-admin-token`. |
| POST | /api/contact          | Send email via SMTP (go-mail). Payload: `{ name, email, subject, message, hp?, startedAt? }` |

## Image caching

- Stored under `DATA_DIR/preview/<assetID>.<ext>`
- `/api/refresh` flow:
  1) Read album + asset IDs  
  2) Write `data/cache.json` metadata  
  3) **Prefetch** missing files  
  4) **Prune** local files for assets no longer in the album

## Requirements

- Go 1.22+
- An Immich instance and album
- (Optional) SMTP provider (MXroute etc.)

## Configure

- server/.env

```
# Server
PORT=8083
DATA_DIR=./data
ALLOW_ORIGIN=http://localhost:3000,https://yourdomain.com

# Immich
IMMICH_URL=https://immich.example.com
IMMICH_API_KEY=YOUR_KEY
IMMICH_ALBUM_ID=ALBUM_UUID

# Protect /api/refresh
ADMIN_TOKEN=super-long-random-string

# SMTP (optional for /api/contact)
SMTP_HOST=mail.mxlogin.com
SMTP_PORT=587     # or 465 (implicit TLS)
SMTP_USER=contact@yourdomain.com
SMTP_PASS=********
CONTACT_FROM=Portfolio <contact+photo@yourdomain.com>
CONTACT_TO=me@yourdomain.com
```

Load and run:

```
set -a && source .env && set +a
go mod tidy
go run ./cmd/server
```

## Logs

Access log per request with a short request ID:

```
[4f8c1a98b7e32a1d] 200 GET /api/img/abcd?q=preview 12345B 6.1ms ip=192.168.1.42 ua="Mozilla/5.0 ..."
```

## Curl examples

Health:
```
curl -i http://localhost:8083/healthz
```

Cache (JSON):
```
curl -s http://localhost:8083/api/cache | jq .
```

Refresh (requires token):
```
curl -X POST -H "x-admin-token: $ADMIN_TOKEN" http://localhost:8083/api/refresh
```

One image (preview):
```
curl -I "http://localhost:8083/api/img/<ASSET_ID>?q=preview"
```

Contact (SMTP must be configured):
```
curl -X POST http://localhost:8083/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"me@example.com","subject":"Hi","message":"Hello","hp":"","startedAt": 1727010000000}'
```

## Data layout
```
DATA_DIR/
  cache.json
  preview/
    <id>.jpg|.webp|.png|.avif
```
