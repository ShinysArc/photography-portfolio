'use client';

import { Camera, Info, Settings2, Mail } from 'lucide-react';
import Link from 'next/link';

import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-border bg-surface/70">
      <nav className="mx-auto w-full max-w-[var(--container-w)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" prefetch className="flex items-center gap-2 font-semibold">
            <Camera className="h-5 w-5" /> <span>Gallery</span>
          </Link>
          <Link
            href="/about"
            prefetch
            className="flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
          >
            <Info className="h-4 w-4" /> About
          </Link>
          <Link
            href="/gear"
            prefetch
            className="flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
          >
            <Settings2 className="h-4 w-4" /> Gear
          </Link>
          <Link
            href="/contact"
            prefetch
            className="flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
          >
            <Mail className="h-4 w-4" /> Contact
          </Link>
        </div>
        <ThemeToggle />
      </nav>
    </header>
  );
}
