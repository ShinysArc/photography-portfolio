const BASE = process.env.IMMICH_URL!;
const KEY = process.env.IMMICH_API_KEY!;

const defaultHeaders: HeadersInit = { Accept: 'application/json', 'x-api-key': KEY };

export async function getAlbumWithAssets(albumId: string) {
  const url = `${BASE}/api/albums/${albumId}?withoutAssets=false`;
  const r = await fetch(url, { headers: defaultHeaders, cache: 'no-store' });
  if (!r.ok) throw new Error(`Album ${albumId}: ${r.status}`);
  return r.json();
}

export async function getAssetInfo(assetId: string) {
  const url = `${BASE}/api/assets/${assetId}`; // includes exifInfo + tags
  const r = await fetch(url, { headers: defaultHeaders, cache: 'no-store' });
  if (!r.ok) throw new Error(`Asset ${assetId}: ${r.status}`);
  return r.json();
}

export function thumbUrl(assetId: string, size: 'thumbnail' | 'preview' | 'fullsize' = 'preview') {
  return `${BASE}/api/assets/${assetId}/thumbnail?size=${size}`; // proxied in /api/img
}

export function originalUrl(assetId: string) {
  return `${BASE}/api/assets/${assetId}/original`; // proxied in /api/img
}
