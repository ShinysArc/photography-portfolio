'use client';

import clsx from 'clsx';

export function TagFilter({
  tags,
  active,
  onChange,
}: {
  tags: { id: string; label: string }[];
  active: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    const has = active.includes(id);
    onChange(has ? active.filter((x) => x !== id) : [...active, id]);
  };

  const clear = () => onChange([]);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={clear}
        className={clsx(
          'px-2 py-1 rounded-full text-xs border',
          active.length === 0
            ? 'bg-accent/90 text-white dark:decoration-accent/60 dark:text-black border-black/0 dark:border-white/0'
            : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
        )}
      >
        All
      </button>
      {tags.map((t) => (
        <button
          key={t.id}
          onClick={() => toggle(t.id)}
          className={clsx(
            'px-2 py-1 rounded-full text-xs border',
            active.includes(t.id)
              ? 'bg-accent/90 text-white dark:decoration-accent/60 dark:text-black border-black/0 dark:border-white/0'
              : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
