# Web (Next.js App)

Frontend of my photography portfolio.

## Requirements

- Node 18+ (20+ recommended)
- Next.js 14
- TailwindCSS

## Setup

```
npm i
cp .env.local.example .env.production.local  # or create manually
```

- .env.production.local

```
# Go API base used by Next rewrites
NEXT_PUBLIC_API_BASE=http://server:8083
```

- next.config.mjs (rewrites → Go API)

```
export default {
  async rewrites() {
    reactStrictMode: true,
    allowedDevOrigins: ['http://example.com'],
    return [
      { source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_BASE}/api/:path*` },
    ];
  },
};
```

> With this, the browser fetches `/api/*` from your domain, and Next proxies to the Go server — no CORS headaches.

## Run

```
npm run dev
# visit http://localhost:3000 (or the printed URL)
```

## Build

```
npm run build
npm run start
```

## Lint & Format

```
npm run lint
npm run lint:fix
npm run format
```
