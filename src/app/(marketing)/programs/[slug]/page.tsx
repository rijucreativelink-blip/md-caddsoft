import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Cpu } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { SoftwareTabs } from '@/components/site/SoftwareTabs';
import { LinkButton, Section } from '@/components/ui';
import { getProgram, programs } from '@/content/programs';

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return { title: 'Program not found' };
  return { title: program.heading, description: program.intro[0].slice(0, 160) };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();

  return (
    <>
      <PageHero
        title={program.heading}
        crumbs={[
          { label: 'Courses & Programs', href: '/courses' },
          { label: program.breadcrumb },
        ]}
      />

      <Section className="pb-10">
        <div className="container grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-5">
            {program.intro.map((p) => (
              <p
                key={p.slice(0, 40)}
                className="text-[15.5px] leading-[1.85] text-slate-700 dark:text-slate-300"
              >
                {p}
              </p>
            ))}
          </div>

          <div className="surface h-fit overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-slate-900 dark:text-white">
                <Cpu size={16} className="text-brand-600" />
                Software covered in this program
              </h3>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {program.software.map((s) => (
                <li key={s.name}>
                  <Link
                    href={`#${s.name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '')}`}
                    className="flex items-center justify-between gap-3 px-6 py-3 text-[13.5px] font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-brand-950/30"
                  >
                    {s.name}
                    <ArrowRight size={14} className="shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-200 p-5 dark:border-slate-800">
              <LinkButton href={`/courses?category=${encodeURIComponent(program.name)}`} className="w-full">
                See buyable courses
              </LinkButton>
            </div>
          </div>
        </div>
      </Section>

      <Section className="border-y border-slate-200 bg-slate-50 py-14 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="container">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {program.softwareNote.title}
          </h2>
          <div className="mt-4 max-w-4xl space-y-4">
            {program.softwareNote.body.map((p) => (
              <p
                key={p.slice(0, 40)}
                className="text-[15px] leading-[1.85] text-slate-600 dark:text-slate-400"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container">
          <SoftwareTabs software={program.software} />
        </div>
      </Section>

      <Section className="pt-0">
        <div className="container">
          <div className="surface flex flex-col items-center gap-5 p-10 text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Ready to start the {program.name} program?
              </h3>
              <p className="mt-2 text-[14.5px] text-slate-600 dark:text-slate-400">
                Enroll online, upload your payment proof and start learning as soon as we verify it.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-center gap-3">
              <LinkButton href="/courses">Browse Courses</LinkButton>
              <LinkButton href="/contact" variant="outline">
                Contact Us
              </LinkButton>
            </div>
          </div>
        </div>
      </Section>

      {/* Other programs */}
      <Section className="pt-0">
        <div className="container">
          <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
            Other Programs
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {programs
              .filter((p) => p.slug !== program.slug)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/programs/${p.slug}`}
                  className="group surface flex items-center justify-between gap-3 p-4 text-[14px] font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-brand-300 dark:text-slate-200"
                >
                  {p.name}
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
                  />
                </Link>
              ))}
          </div>
        </div>
      </Section>
    </>
  );
}
