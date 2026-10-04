import type { Metadata } from 'next';
import { PageHero } from '@/components/site/PageHero';
import { Section } from '@/components/ui';
import { methodologyPage } from '@/content/site';

export const metadata: Metadata = {
  title: 'Our Training Methodology',
  description: methodologyPage.lead,
};

export default function MethodologyPage() {
  return (
    <>
      <PageHero
        title={methodologyPage.title}
        subtitle={methodologyPage.lead}
        crumbs={[{ label: 'Our Training Methodology' }]}
      />

      <Section>
        <div className="container grid gap-12 lg:grid-cols-[260px_1fr]">
          {/* Sticky index */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
                On this page
              </p>
              <ul className="space-y-1 border-l border-slate-200 dark:border-slate-800">
                {methodologyPage.sections.map((s, i) => (
                  <li key={s.title}>
                    <a
                      href={`#section-${i}`}
                      className="-ml-px block border-l-2 border-transparent py-2 pl-4 text-[13px] leading-snug text-slate-600 transition hover:border-brand-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="max-w-3xl">
            <div className="rounded-2xl border-l-4 border-brand-600 bg-brand-50/60 p-6 dark:bg-brand-950/30">
              <p className="font-display text-lg font-bold text-brand-900 dark:text-brand-200">
                {methodologyPage.lead}
              </p>
            </div>

            <div className="mt-8 space-y-5">
              {methodologyPage.intro.map((p) => (
                <p key={p} className="text-[15.5px] leading-[1.85] text-slate-700 dark:text-slate-300">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-14 space-y-14">
              {methodologyPage.sections.map((s, i) => (
                <article key={s.title} id={`section-${i}`} className="scroll-mt-28">
                  <div className="flex items-start gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-display text-[13px] font-bold text-white shadow-lift">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2 className="pt-1 font-display text-[19px] font-bold leading-snug text-slate-900 dark:text-white">
                      {s.title}
                    </h2>
                  </div>
                  <div className="mt-4 space-y-4 pl-[52px]">
                    {s.body.map((p) => (
                      <p
                        key={p.slice(0, 40)}
                        className="text-[15px] leading-[1.85] text-slate-600 dark:text-slate-400"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
