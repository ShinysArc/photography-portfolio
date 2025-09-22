import { NextResponse } from 'next/server';

import { refreshAlbumToCache } from '@/lib/refresh';

export async function POST(req: Request) {
  const token = process.env.ADMIN_TOKEN || '';
  const got = req.headers.get('x-admin-token') || '';
  if (!token || got !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const albumId = process.env.IMMICH_ALBUM_ID!;
  const data = await refreshAlbumToCache(albumId);
  return NextResponse.json({ ok: true, count: data.items.length, album: data.album });
}
