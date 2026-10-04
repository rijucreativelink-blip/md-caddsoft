'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import type { SoftwareTopic } from '@/content/programs';
import { cn, slugify } from '@/lib/utils';

export function SoftwareTabs({ software }: { software: SoftwareTopic[] }) {
  const [active, setActive] = useState(0);

  // Deep-link support: /programs/civil-cadd#staadpro
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    if (!hash) return;
    const idx = software.findIndex((s) => slugify(s.name) === hash);
    if (idx >= 0) setActive(idx);
  }, [software]);

  const current = software[active];
  if (!current) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Software covered"
        className="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-28 lg:h-fit lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {software.map((s, i) => (
          <button
            key={s.name}
            role="tab"
            aria-selected={i === active}
            id={slugify(s.name)}
            onClick={() => setActive(i)}
            className={cn(
              'flex shrink-0 scroll-mt-28 items-center justify-between gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-[13.5px] font-semibold transition-all lg:w-full lg:whitespace-normal',
              i === active
                ? 'bg-brand-600 text-white shadow-lift'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-white',
            )}
          >
            {s.name}
            <ChevronRight
              size={14}
              className={cn('hidden shrink-0 transition lg:block', i === active && 'translate-x-0.5')}
            />
          </button>
        ))}
      </div>

      {/* Panel */}
      <div role="tabpanel" className="surface p-7 sm:p-9">
        <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {current.name}
        </h3>
        <p className="mt-4 text-[15px] leading-[1.85] text-slate-600 dark:text-slate-400">
          {current.body}
        </p>

        {current.topics && current.topics.length > 0 && (
          <>
            <h4 className="mt-9 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
              Topics Covered
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </h4>
            <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {current.topics.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-2.5 text-[13.5px] leading-snug text-slate-700 dark:text-slate-300"
                >
                  <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                  {t}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
