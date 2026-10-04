import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string;
}

export function PageHero({
  title,
  subtitle,
  crumbs = [],
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-ink-950">
      <div className="absolute inset-0 bg-grid-dark [background-size:48px_48px] opacity-50" />
      <div className="absolute inset-0 bg-hero-glow opacity-70" />
      <div className="container relative py-14 sm:py-18 lg:py-20">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-400">
            <li>
              <Link href="/" className="flex items-center gap-1.5 transition hover:text-white">
                <Home size={13} /> Home
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <ChevronRight size={13} className="text-slate-600" />
                {c.href ? (
                  <Link href={c.href} className="transition hover:text-white">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-brand-300">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="mt-5 max-w-4xl text-balance font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-300">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
