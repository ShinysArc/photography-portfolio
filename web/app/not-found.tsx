'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="text-center max-w-xl"
      >
        <div
          className="inline-flex items-center justify-center h-16 w-16 rounded-2xl
                        bg-accent/10 text-accent mb-6"
        >
          <span className="text-lg font-bold select-none">404</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Page not found</h1>
        <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 mb-6">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
                       bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            ← Back to Gallery
          </Link>
        </div>

        <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-500">
          If you think this is a mistake, feel free to&nbsp;
          <Link
            href="/contact"
            className="font-medium text-accent underline decoration-accent/60 decoration-2 underline-offset-4
                       hover:decoration-4"
          >
            reach out
          </Link>
          .
        </p>
      </motion.section>
    </main>
  );
}
