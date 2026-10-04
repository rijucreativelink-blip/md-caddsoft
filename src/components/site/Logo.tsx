import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ compact, light }: { compact?: boolean; light?: boolean }) {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5">
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-lift transition group-hover:scale-105">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden>
          <path d="M6 23V9l10 6.2L26 9v14" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="15.2" r="1.9" fill="#F7C948" />
        </svg>
      </span>
      <span className={cn('leading-tight', compact && 'hidden sm:block')}>
        <span
          className={cn(
            'block font-display text-[15px] font-extrabold tracking-tight',
            light ? 'text-white' : 'text-slate-900 dark:text-white',
          )}
        >
          CADD <span className="text-brand-600 dark:text-brand-400">SOFTWARE</span>
        </span>
        <span
          className={cn(
            'block text-[9.5px] font-semibold uppercase tracking-[0.16em]',
            light ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400',
          )}
        >
          Training Services Pvt. Ltd.
        </span>
      </span>
    </Link>
  );
}
