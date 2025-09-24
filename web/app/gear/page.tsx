'use client';

import { useState } from 'react';

import GearCard from '@/components/GearCard';
import GearModal from '@/components/GearModal';
import { gear, type GearItem } from '@/data/gear';

export default function GearPage() {
  const [selected, setSelected] = useState<GearItem | null>(null);

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Gear</h1>
        <p className="opacity-80">My current gear, click any item to read how and why I use it.</p>
      </header>

      {gear.map((g) => (
        <div key={g.group} className="space-y-4">
          <h2 className="text-lg font-semibold">{g.group}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((item) => (
              <GearCard key={item.name} item={item} onClick={() => setSelected(item)} />
            ))}
          </div>
        </div>
      ))}

      <GearModal item={selected} open={!!selected} onClose={() => setSelected(null)} />
    </section>
  );
}
