import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const q = req.nextUrl.searchParams.get('q') || 'preview';
  const IMMICH_URL = process.env.IMMICH_URL!;
  const IMMICH_API_KEY = process.env.IMMICH_API_KEY!;

  let target = '';
  if (q === 'full') {
    target = `${IMMICH_URL}/api/assets/${id}/original`;
  } else {
    const size = q === 'thumbnail' ? 'thumbnail' : q === 'fullsize' ? 'fullsize' : 'preview';
    target = `${IMMICH_URL}/api/assets/${id}/thumbnail?size=${size}`;
  }

  const res = await fetch(target, { headers: { 'x-api-key': IMMICH_API_KEY } });
  const contentType = res.headers.get('content-type') || 'image/jpeg';

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
    },
  });
}
