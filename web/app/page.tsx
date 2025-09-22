'use client';
import { useEffect, useMemo, useState } from 'react';

import Masonry from '@/components/Masonry';
import Modal from '@/components/Modal';
import PhotoCard from '@/components/PhotoCard';
import { TagFilter } from '@/components/TagFilter';

export type Tag = { id: string; name: string; value?: string | null };
export type Exif = {
  make?: string;
  model?: string;
  lensModel?: string;
  fNumber?: number;
  exposureTime?: string | number;
  iso?: number;
  focalLength?: number;
  dateTimeOriginal?: string;
  exifImageWidth?: number;
  exifImageHeight?: number;
};

export type Item = {
  id: string;
  width?: number;
  height?: number;
  originalFileName?: string;
  originalMimeType?: string;
  fileCreatedAt?: string;
  fileModifiedAt?: string;
  exif: Exif;
  tags: Tag[];
};
export type Cache = { album: { id: string; name: string; assetCount: number }; items: Item[] };

export default function Page() {
  const [data, setData] = useState<Cache | null>(null);
  const [selected, setSelected] = useState<Item | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/cache', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setData(j))
      .catch(() => setData({ album: { id: '', name: 'Unknown', assetCount: 0 }, items: [] }));
  }, []);

  const allTags = useMemo(() => {
    const set = new Map<string, string>();
    data?.items.forEach((it) => it.tags?.forEach((t) => set.set(t.id, t.name || t.value || 'tag')));
    return Array.from(set, ([id, label]) => ({ id, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (activeTags.length === 0) return data.items;
    const want = new Set(activeTags);
    return data.items.filter((it) => (it.tags || []).some((t) => want.has(t.id)));
  }, [data, activeTags]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data?.album?.name || 'Album'}</h1>
          <p className="text-sm opacity-80">{data?.items?.length ?? 0} photos</p>
        </div>
        <div className="flex-1" />
        <TagFilter tags={allTags} active={activeTags} onChange={(next) => setActiveTags(next)} />
      </div>

      <Masonry>
        {filtered.map((it) => (
          <PhotoCard key={it.id} item={it} onClick={() => setSelected(it)} />
        ))}
      </Masonry>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <img
                src={`/api/img/${selected.id}?q=full`}
                alt={selected.originalFileName || ''}
                className="w-full h-auto rounded-xl shadow"
              />
            </div>
            <div className="lg:col-span-2 space-y-2 text-sm">
              <h3 className="text-lg font-semibold">EXIF</h3>
              <dl className="grid grid-cols-2 gap-y-2">
                <dt className="opacity-70">Camera</dt>
                <dd>{selected.exif.model}</dd>
                <dt className="opacity-70">Lens</dt>
                <dd>{selected.exif.lensModel || '—'}</dd>
                <dt className="opacity-70">Aperture</dt>
                <dd>{selected.exif.fNumber ? `𝘧/${selected.exif.fNumber}` : '—'}</dd>
                <dt className="opacity-70">Shutter</dt>
                <dd>{selected.exif.exposureTime || '—'}</dd>
                <dt className="opacity-70">ISO</dt>
                <dd>{selected.exif.iso ?? '—'}</dd>
                <dt className="opacity-70">Focal</dt>
                <dd>{selected.exif.focalLength ? `${selected.exif.focalLength} mm` : '—'}</dd>
                <dt className="opacity-70">Taken</dt>
                <dd>
                  {selected.exif.dateTimeOriginal
                    ? new Date(selected.exif.dateTimeOriginal).toLocaleString()
                    : '—'}
                </dd>
              </dl>
              <div className="pt-4">
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {(selected.tags || []).map((t) => (
                    <span
                      key={t.id}
                      className="px-2 py-1 rounded-full text-xs bg-neutral-200 dark:bg-neutral-800"
                    >
                      {t.name || t.value || 'tag'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
