import type { Metadata } from 'next';
import { PageHero } from '@/components/site/PageHero';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import { Section, SectionHeading } from '@/components/ui';
import { careerCourseOptions, foundationBanner, visionMission } from '@/content/site';

export const metadata: Metadata = {
  title: 'Career',
  description: foundationBanner.body,
};

export default function CareerPage() {
  return (
    <>
      <PageHero
        title="Kickstart Your Career"
        subtitle="Build your career with knowledge and a thoughtful plan. Our advisors are here to help you make effective career decisions and to gain the confidence of knowing you are building a successful future."
        crumbs={[{ label: 'Career' }]}
      />

      <Section>
        <div className="container grid items-start gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div className="lg:sticky lg:top-28">
            <span className="eyebrow mb-4">Foundation / Certificate Courses</span>
            <h2 className="text-balance font-display text-3xl font-bold leading-tight text-slate-900 dark:text-white">
              {foundationBanner.title}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
              {foundationBanner.body}
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  t: 'Placement assistance',
                  d: 'We help you present your project work and skills to hiring partners.',
                },
                {
                  t: 'Internationally recognized certificate',
                  d: 'Hologram-verified CADD Software International Certificate on completion.',
                },
                {
                  t: 'Part time employment opportunities',
                  d: 'Opportunities during your higher studies, so you earn while you learn.',
                },
              ].map((x) => (
                <div key={x.t} className="surface p-5">
                  <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
                    {x.t}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] text-slate-600 dark:text-slate-400">{x.d}</p>
                </div>
              ))}
            </div>
          </div>

          <EnquiryForm
            options={[...careerCourseOptions]}
            source="career"
            title="Register your Query"
            submitLabel="REGISTER"
          />
        </div>
      </Section>

      <Section className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="container">
          <SectionHeading
            eyebrow="What We Stand For"
            title="Vision, Mission and Commitment"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {visionMission.map((v) => (
              <article key={v.title} className="surface p-7">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {v.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
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
