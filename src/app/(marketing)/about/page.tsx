import type { Metadata } from 'next';
import { Check, Users } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { LinkButton, Section, SectionHeading } from '@/components/ui';
import { aboutPage, site, visionMission } from '@/content/site';

export const metadata: Metadata = {
  title: 'About CADD Software',
  description: aboutPage.intro,
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title={aboutPage.title}
        subtitle={site.tagline}
        crumbs={[{ label: 'About CADD Software' }]}
      />

      <Section>
        <div className="container grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="eyebrow mb-4">Who We Are</span>
            <p className="text-[15.5px] leading-[1.85] text-slate-700 dark:text-slate-300">
              {aboutPage.intro}
            </p>
            <p className="mt-5 text-[15.5px] leading-[1.85] text-slate-700 dark:text-slate-300">
              {site.whoWeAre}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/courses">Browse Courses</LinkButton>
              <LinkButton href="/training-methodology" variant="outline">
                Our Training Methodology
              </LinkButton>
            </div>
          </div>

          <aside className="surface h-fit p-7">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Company Facts
            </h3>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ['Legal name', site.name],
                ['CIN', site.cin],
                ['Corporate office', `${site.address.city}, ${site.address.state} (West)`],
                ['Registrations', 'Govt. of India (MCA), MSME, ASCB, IRQAO'],
                ['Phone', site.phones.join(' / ')],
                ['Email', site.email],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[100px_1fr] gap-3">
                  <dt className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-500">
                    {k}
                  </dt>
                  <dd className="break-words text-slate-800 dark:text-slate-200">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Section>

      <Section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="container grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {aboutPage.whyTitle}
            </h2>
            <ul className="mt-6 space-y-3">
              {aboutPage.why.map((item, i) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-white p-3.5 shadow-soft transition hover:-translate-y-0.5 dark:bg-slate-900/60"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-600 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-[14.5px] text-slate-700 dark:text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="flex items-center gap-2.5 font-display text-2xl font-bold text-slate-900 dark:text-white">
              <Users size={22} className="text-brand-600" />
              {aboutPage.benefitTitle}
            </h2>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {aboutPage.benefits.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5 text-[14px] text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                >
                  <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container">
          <SectionHeading
            eyebrow="Our Purpose"
            title="Vision, Mission and Commitment"
            description="What drives every classroom, every project and every certificate we issue."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {visionMission.map((v, i) => (
              <article
                key={v.title}
                className="surface relative overflow-hidden p-7 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="absolute right-5 top-4 font-display text-6xl font-extrabold text-slate-100 dark:text-slate-800/70">
                  0{i + 1}
                </span>
                <h3 className="relative font-display text-lg font-bold text-slate-900 dark:text-white">
                  {v.title}
                </h3>
                <p className="relative mt-3 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {v.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
