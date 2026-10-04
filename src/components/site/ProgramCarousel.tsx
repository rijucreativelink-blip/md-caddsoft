'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Compass, Cpu, Layers, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CarouselItem {
  slug: string;
  name: string;
  body: string;
}

const ICONS: Record<string, typeof Building2> = {
  'civil-cadd': Building2,
  'mechanical-cadd': Cpu,
  'project-management': Layers,
  'electrical-cadd': Zap,
  'architecture-cadd': Compass,
};

/** Horizontal card carousel with a progress bar and round prev / next arrows. */
export function ProgramCarousel({ items }: { items: CarouselItem[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function go(dir: 1 | -1) {
    const next = Math.min(items.length - 1, Math.max(0, active + dir));
    setActive(next);
    const el = track.current?.children[next] as HTMLElement | undefined;
    if (el && track.current) {
      track.current.scrollTo({ left: el.offsetLeft - track.current.offsetLeft, behavior: 'smooth' });
    }
  }

  const progress = ((active + 1) / items.length) * 100;

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative h-[2px] w-40 bg-neutral-300">
          <span
            className="absolute inset-y-0 left-0 bg-neutral-950 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => go(-1)}
            disabled={active === 0}
            aria-label="Previous"
            className="grid h-9 w-9 place-items-center rounded-full border border-neutral-400 text-neutral-800 transition hover:bg-neutral-950 hover:text-white disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-neutral-800"
          >
            <ArrowLeft size={15} />
          </button>
          <button
            onClick={() => go(1)}
            disabled={active === items.length - 1}
            aria-label="Next"
            className="grid h-9 w-9 place-items-center rounded-full border border-neutral-400 text-neutral-800 transition hover:bg-neutral-950 hover:text-white disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-neutral-800"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div
        ref={track}
        className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((p, i) => {
          const Icon = ICONS[p.slug] ?? Layers;
          const on = i === active;
          return (
            <Link
              key={p.slug}
              href={`/programs/${p.slug}`}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'flex h-[300px] w-[260px] shrink-0 snap-start flex-col rounded-2xl p-6 transition-colors duration-300',
                on
                  ? 'bg-neutral-800 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-950',
              )}
            >
              <span
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-full',
                  on ? 'bg-white/15 text-white' : 'bg-neutral-950 text-white',
                )}
              >
                <Icon size={18} />
              </span>
              <h3 className="mt-auto text-[16px] font-semibold">{p.name}</h3>
              <p
                className={cn(
                  'mt-2 line-clamp-3 text-[12.5px] leading-relaxed',
                  on ? 'text-neutral-300' : 'text-neutral-500',
                )}
              >
                {p.body}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
