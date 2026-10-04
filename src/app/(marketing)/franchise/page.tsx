import type { Metadata } from 'next';
import { BadgeCheck, LifeBuoy, PackageCheck, Users } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { FranchiseForm } from '@/components/site/FranchiseForm';
import { Section, SectionHeading } from '@/components/ui';
import { franchiseBenefits } from '@/content/site';

export const metadata: Metadata = {
  title: 'Free Franchise Opportunities',
  description:
    'Apply for a CADD Software Training Services franchise at free of cost. Franchise support, brand name, lower inventory prices and easier staff recruiting.',
};

const ICONS = { LifeBuoy, BadgeCheck, PackageCheck, Users } as const;

export default function FranchisePage() {
  return (
    <>
      <PageHero
        title="Free Franchise Opportunities"
        subtitle="We support you in finding the best talent. We provide the training of our method of training in full and support you in any barrier along the way."
        crumbs={[{ label: 'Franchise' }]}
      />

      <Section>
        <div className="container">
          <SectionHeading
            eyebrow="Our Franchise Benefits"
            title="In business for yourself, but not by yourself"
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {franchiseBenefits.map((b) => {
              const Icon = ICONS[b.icon];
              return (
                <article
                  key={b.title}
                  className="group surface relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
                >
                  <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent-500/10 transition-transform duration-500 group-hover:scale-150" />
                  <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 text-ink-900 shadow-lift">
                    <Icon size={22} />
                  </span>
                  <h3 className="relative mt-5 font-display text-base font-bold text-slate-900 dark:text-white">
                    {b.title}
                  </h3>
                  <p className="relative mt-2.5 text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {b.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </Section>

      <Section className="border-t border-slate-200 bg-slate-50 pt-16 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="container max-w-3xl">
          <FranchiseForm />
        </div>
      </Section>
    </>
  );
}
