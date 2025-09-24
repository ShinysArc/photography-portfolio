export type GearPhoto =
  | { kind: 'immich'; assetId: string } // served via /i/:id
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
    group: 'Camera',
    items: [
      {
        name: 'Canon R6 Mark II',
        photo: { kind: 'url', src: '/gear/canon_r6m2.jpg' },
        about:
          'I really like that camera for its great low-light performance, fast and accurate autofocus, and solid image quality in a compact full-frame body.',
        note: 'My camera, perfect for my usage.',
      },
    ],
  },
  {
    group: 'Lenses',
    items: [
      {
        name: 'Tamron 35mm f/1.4',
        photo: { kind: 'url', src: '/gear/tamron_35mm.jpg' },
        about:
          'I use the Tamron 35mm f/1.4 for its sharpness, fast aperture, and smooth, creamy bokeh that makes subjects stand out.',
        note: 'Main prime lens',
      },
    ],
  },
];
