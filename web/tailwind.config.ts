import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: 'hsl(var(--color-surface))',
        surface2: 'hsl(var(--color-surface-2))',
        card: 'hsl(var(--color-card))',
        border: 'hsl(var(--color-border))',
        text: 'hsl(var(--color-text))',
        muted: 'hsl(var(--color-text-muted))',
        accent: 'hsl(var(--color-accent))',
        accentFg: 'hsl(var(--color-accent-foreground))',
      },
    },
  },
  plugins: [],
} satisfies Config;
