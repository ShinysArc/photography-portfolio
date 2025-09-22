'use client';

import clsx from 'clsx';

import type { GearItem } from '@/data/gear';

export default function GearCard({ item, onClick }: { item: GearItem; onClick: () => void }) {
  const src =
    item.photo.kind === 'immich' ? `/api/img/${item.photo.assetId}?q=preview` : item.photo.src;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'group w-full text-left rounded-xl border',
        'border-neutral-200/60 dark:border-neutral-800/60',
        'overflow-hidden bg-white dark:bg-neutral-900',
      )}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={src}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-3">
        <div className="font-medium">{item.name}</div>
        {item.note && <div className="text-xs opacity-70 mt-1">{item.note}</div>}
      </div>
    </button>
  );
}
