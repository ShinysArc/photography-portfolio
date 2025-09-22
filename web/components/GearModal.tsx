'use client';

import { AnimatePresence, motion, Transition } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import type { GearItem, GearPhoto } from '@/data/gear';

type Props = {
  item: GearItem | null;
  open: boolean;
  onClose: () => void;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
};

const TRANSITION: Transition = { duration: 0.22, ease: 'easeOut' };

function srcFromPhoto(p: GearPhoto, q: 'preview' | 'fullsize' = 'fullsize') {
  return p.kind === 'immich' ? `/i/${p.assetId}?q=${q}` : p.src;
}

export default function GearModal({
  item,
  open,
  onClose,
  closeOnBackdrop = true,
  closeOnEsc = true,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock scroll (no padding compensation — CSS reserves gutter)
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflowY;
    root.style.overflowY = 'hidden';
    return () => {
      root.style.overflowY = prev;
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeOnEsc, onClose]);

  const [active, setActive] = useState<GearPhoto | null>(null);
  useEffect(() => setActive(null), [item?.name]);

  const primary = useMemo(
    () => (!item ? null : (active ?? item.gallery?.[0] ?? item.photo)),
    [item, active],
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && item && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={closeOnBackdrop ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITION}
          />
          {/* Dialog */}
          <div className="relative z-10 flex h-full w-full items-center justify-center overflow-y-auto p-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)]">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${item.name} details`}
              className="relative w-full max-w-6xl max-h-[90vh] overflow-auto rounded-xl bg-white p-4 shadow-xl dark:bg-neutral-900"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={TRANSITION}
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full bg-neutral-100 px-2 py-1 text-sm hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                aria-label="Close"
              >
                &#x2715;
              </button>

              <motion.div
                className="grid grid-cols-1 gap-6 lg:grid-cols-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={TRANSITION}
              >
                <div className="lg:col-span-3">
                  {primary && (
                    <motion.img
                      key={srcFromPhoto(primary, 'fullsize')}
                      src={srcFromPhoto(primary, 'fullsize')}
                      alt={item.name}
                      className="h-auto w-full rounded-xl border border-neutral-200/60 dark:border-neutral-800/60"
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.985, opacity: 0 }}
                      transition={TRANSITION}
                    />
                  )}
                  {(item.gallery?.length ?? 0) > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[item.photo, ...(item.gallery || [])].map((p, i) => {
                        const isActive = primary && srcFromPhoto(p) === srcFromPhoto(primary);
                        return (
                          <button
                            key={i}
                            onClick={() => setActive(p)}
                            className={`h-16 w-24 overflow-hidden rounded-md border transition-colors ${
                              isActive
                                ? 'border-black dark:border-white'
                                : 'border-neutral-200/60 dark:border-neutral-800/60'
                            }`}
                            aria-label={`Thumbnail ${i + 1}`}
                          >
                            <img
                              src={srcFromPhoto(p, 'preview')}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  {item.about ? (
                    <p className="whitespace-pre-wrap text-sm leading-6 opacity-90">{item.about}</p>
                  ) : (
                    <p className="text-sm opacity-70">No notes yet.</p>
                  )}
                  {item.note && (
                    <p className="text-xs opacity-60">
                      <strong>Note:</strong> {item.note}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
