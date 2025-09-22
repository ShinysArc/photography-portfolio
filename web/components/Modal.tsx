// components/Modal.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional: close when pressing ESC (default: true) */
  closeOnEsc?: boolean;
  /** Optional: close when clicking the backdrop (default: true) */
  closeOnBackdrop?: boolean;
};

export default function Modal({
  open,
  onClose,
  children,
  closeOnEsc = true,
  closeOnBackdrop = true,
}: ModalProps) {
  // Only render on client (avoids hydration/SSR issues)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeOnEsc, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence initial={false}>
      {open && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={closeOnBackdrop ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Perfect centering wrapper */}
          <div className="relative z-10 flex h-full w-full items-center justify-center overflow-y-auto p-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)]">
            {/* Dialog */}
            <motion.div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-6xl max-h-[90vh] overflow-auto rounded-xl bg-white p-4 shadow-xl dark:bg-neutral-900"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full bg-neutral-100 px-2 py-1 text-sm hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                aria-label="Close"
              >
                &#x2715;
              </button>
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
