'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === 'dark' || resolvedTheme === 'dark' : false;

  const handleClick = () => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    requestAnimationFrame(() => {
      setTheme(isDark ? 'light' : 'dark');
      setTimeout(() => root.classList.remove('theme-transition'), 350);
    });
  };

  return (
    <button
      aria-label="Toggle theme"
      onClick={handleClick}
      className="group inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm
                 bg-surface2 hover:bg-surface transition-colors"
    >
      <span
        className="relative inline-flex h-4 w-4 items-center justify-center"
        suppressHydrationWarning
      >
        <Sun
          className={`h-4 w-4 transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-100'}`}
          aria-hidden={isDark}
        />
        <Moon
          className={`h-4 w-4 absolute inset-0 transition-opacity duration-200 ${isDark ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={!isDark}
        />
      </span>
    </button>
  );
}
