import fs from 'fs/promises';
import path from 'path';

import { getAlbumWithAssets, getAssetInfo } from './immich';

import type { CacheFile, CacheItem } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CACHE_FILE = path.join(DATA_DIR, 'cache.json');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function refreshAlbumToCache(albumId: string) {
  await ensureDataDir();
  const album = await getAlbumWithAssets(albumId);
  const assets = Array.isArray(album.assets?.items) ? album.assets.items : album.assets || [];

  // simple concurrency limiter
  const limit = 10;
  let idx = 0;
  const results: CacheItem[] = new Array(assets.length);
  async function worker() {
    while (idx < assets.length) {
      const i = idx++;
      const a = assets[i];
      const id = a.id || a.assetId || a;
      const full = await getAssetInfo(id);
      const exif = full.exifInfo || {};
      results[i] = {
        id: full.id,
        originalFileName: full.originalFileName,
        exif,
        tags: full.tags || [],
      };
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));

  const payload: CacheFile = {
    album: { id: album.id, name: album.albumName, assetCount: album.assetCount },
    items: results.filter(Boolean),
  };

  await fs.writeFile(CACHE_FILE, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}
