'use client';

import { Item } from '@/app/page';

export default function PhotoCard({ item, onClick }: { item: Item; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group block w-full text-left">
      <div className="overflow-hidden rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
        <img
          src={`/i/${item.id}?q=preview`}
          alt={item.originalFileName || ''}
          loading="lazy"
          className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
    </button>
  );
}
