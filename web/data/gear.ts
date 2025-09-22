// data/gear.ts
export type GearPhoto =
  | { kind: 'immich'; assetId: string } // served via /api/img/:id
  | { kind: 'url'; src: string }; // served from /public or any URL

export type GearItem = {
  name: string;
  photo: GearPhoto;
  about?: string;
  gallery?: GearPhoto[];
  note?: string;
};

export type GearGroup = {
  group: string;
  items: GearItem[];
};

export const gear: GearGroup[] = [
  {
    group: 'Cameras',
    items: [
      {
        name: 'Canon R6 Mark II',
        photo: { kind: 'url', src: '/gear/canon_r6m2.jpg' },
        about:
          'My workhorse body. I use it for travel and low light. Eye-AF plus the 24–70/2.8 covers 90% of what I shoot.',
        note: 'lololol',
      },
    ],
  },
  {
    group: 'Lenses',
    items: [{ name: 'Tamron 35mm f/1.4', photo: { kind: 'url', src: '/gear/tamron_35mm.jpg' } }],
  },
  {
    group: 'Accessories',
    items: [
      { name: 'Peak Design Slide Lite', photo: { kind: 'url', src: '/gear/pd-slide-lite.jpg' } },
    ],
  },
];
