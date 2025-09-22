import fs from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const file = await fs.readFile(path.join(process.cwd(), 'data', 'cache.json'), 'utf8');
    return new NextResponse(file, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ album: null, items: [] });
  }
}
