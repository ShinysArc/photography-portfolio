import { thumbHashToRGBA } from 'thumbhash';

function base64ToBytes(b64: string): Uint8Array {
  // Trim whitespace/newlines and normalize URL-safe base64 (-,_ -> +,/)
  let s = b64.trim().replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);

  // Decode in browser or Node
  let bin: string;
  if (typeof atob === 'function') {
    bin = atob(s);
  } else {
    bin = Buffer.from(s, 'base64').toString('binary');
  }
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Convert base64 ThumbHash → PNG data URL
export function thumbhashToDataURL(b64: string): string | null {
  try {
    if (!b64) return null;
    const bytes = base64ToBytes(b64);
    const { w, h, rgba } = thumbHashToRGBA(bytes);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const imgData = new ImageData(new Uint8ClampedArray(rgba), w, h);
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  } catch {
    return null; // fallback gracefully
  }
}
