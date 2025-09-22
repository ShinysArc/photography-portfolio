'use client';

import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from 'next-themes';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: 'easeOut' }}>
        {children}
      </MotionConfig>
    </ThemeProvider>
  );
}
