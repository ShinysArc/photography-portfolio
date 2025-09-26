'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import Masonry from '@/components/Masonry';
import Modal from '@/components/Modal';
import { TagFilter } from '@/components/TagFilter';

export type Tag = { id: string; name?: string | null; value?: string | null };
export type Exif = {
  make?: string;
  model?: string;
  lensModel?: string;
  fNumber?: number;
  exposureTime?: string | number;
  iso?: number;
  focalLength?: number;
  dateTimeOriginal?: string;
  timeZone?: string;
  exifImageWidth?: number;
  exifImageHeight?: number;
};

export type Item = {
  id: string;
  originalFileName?: string;
  exif: Exif;
  tags: Tag[];
  previewPath?: string; // "preview/<id>.jpg"
  fullsizePath?: string; // "fullsize/<id>.jpg"
};

export type Cache = { album: { id: string; name: string; assetCount: number }; items: Item[] };

export default function Page() {
  const [data, setData] = useState<Cache | null>(null);
  const [selected, setSelected] = useState<Item | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('./photos/cache.json', { cache: 'force-cache' });
        const json = res.ok
          ? await res.json()
          : { album: { id: '', name: 'Unknown', assetCount: 0 }, items: [] };
        setData(json);
      } catch {
        setData({ album: { id: '', name: 'Unknown', assetCount: 0 }, items: [] });
      }
    })();
  }, []);

  const allTags = useMemo(() => {
    const set = new Map<string, string>();
    data?.items.forEach((it) =>
      it.tags?.forEach((t) => set.set(t.id, (t.name || t.value || 'tag').toString())),
    );
    return Array.from(set, ([id, label]) => ({ id, label })).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const base = activeTags.length
      ? data.items.filter((it) => it.tags?.some((t) => activeTags.includes(t.id)))
      : data.items;
    return base.filter((it) => !!it.previewPath);
  }, [data, activeTags]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data?.album?.name || 'Album'}</h1>
          <p className="text-sm opacity-80">
            {filtered.length} photo{filtered.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex-1" />
        <TagFilter tags={allTags} active={activeTags} onChange={setActiveTags} />
      </div>

      <Masonry>
        {filtered.map((it) => (
          <button
            key={it.id}
            onClick={() => setSelected(it)}
            className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
          >
            <Image
              src={`/photos/${it.previewPath}`}
              alt={it.originalFileName || ''}
              loading="lazy"
              className="w-full h-auto rounded-lg object-cover transition-transform duration-300 hover:scale-[1.02]"
            />
          </button>
        ))}
      </Masonry>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="flex flex-col lg:flex-row lg:items-start gap-y-6 lg:gap-x-4">
            <div className="shrink-0">
              <Image
                src={`/photos/${selected.fullsizePath || selected.previewPath}`}
                alt={selected.originalFileName || ''}
                className="max-h-[85vh] max-w-[85vw] h-auto w-auto object-contain rounded-xl shadow"
              />
            </div>
            <div className="min-w-[260px] lg:max-w-[40vw] grow overflow-auto space-y-2 text-sm">
              <h3 className="text-lg font-semibold">EXIF</h3>
              <dl className="grid grid-cols-2 gap-y-2">
                <dt className="opacity-70">Camera</dt>
                <dd>{selected.exif.model || '—'}</dd>
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
                    ? new Date(selected.exif.dateTimeOriginal).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
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
