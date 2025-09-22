import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// tiny .env loader (supports .env.local or .env)
async function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    try {
      const txt = await fs.readFile(f, 'utf8');
      txt.split('\n').forEach((line) => {
        const l = line.trim();
        if (!l || l.startsWith('#')) return;
        const i = l.indexOf('=');
        if (i > 0) process.env[l.slice(0, i)] = l.slice(i + 1);
      });
      break;
    } catch {}
  }
}

await loadEnv();

const BASE = process.env.IMMICH_URL;
const KEY = process.env.IMMICH_API_KEY;
const ALBUM = process.env.IMMICH_ALBUM_ID;
if (!BASE || !KEY || !ALBUM) {
  console.error('Please set IMMICH_URL, IMMICH_API_KEY, IMMICH_ALBUM_ID in .env.local');
  process.exit(1);
}

const headers = { Accept: 'application/json', 'x-api-key': KEY };

async function getAlbumWithAssets(id) {
  const url = `${BASE}/api/albums/${id}?withoutAssets=false`;
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`Album ${id}: ${r.status}`);
  return r.json();
}
async function getAssetInfo(id) {
  const url = `${BASE}/api/assets/${id}`;
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`Asset ${id}: ${r.status}`);
  return r.json();
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CACHE_FILE = path.join(DATA_DIR, 'cache.json');
await fs.mkdir(DATA_DIR, { recursive: true });

console.log(`Refreshing album ${ALBUM} …`);
const album = await getAlbumWithAssets(ALBUM);
const assets = Array.isArray(album.assets?.items) ? album.assets.items : album.assets || [];

let idx = 0;
const limit = 10;
const out = new Array(assets.length);
async function worker() {
  while (idx < assets.length) {
    const i = idx++;
    const a = assets[i];
    const id = a.id || a.assetId || a;
    const full = await getAssetInfo(id);
    const exif = full.exifInfo || {};
    out[i] = {
      id: full.id,
      originalFileName: full.originalFileName,
      exif,
      tags: full.tags || [],
    };
    process.stdout.write(`\r${i + 1}/${assets.length}`);
  }
}

await Promise.all(Array.from({ length: limit }, worker));

const payload = {
  album: { id: album.id, name: album.albumName, assetCount: album.assetCount },
  items: out.filter(Boolean),
};
await fs.writeFile(CACHE_FILE, JSON.stringify(payload, null, 2), 'utf8');
console.log(`\nWrote ${payload.items.length} items → ${CACHE_FILE}`);
