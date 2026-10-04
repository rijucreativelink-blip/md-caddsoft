import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHero } from '@/components/site/PageHero';
import { CourseCatalog } from '@/components/site/CourseCatalog';
import { PageLoader, Section } from '@/components/ui';

export const metadata: Metadata = {
  title: 'All Courses',
  description:
    'Browse every CADD Software course available online — Civil, Mechanical, Electrical, Architecture and Project Management. Buy online and start learning after payment verification.',
};

export default function CoursesPage() {
  return (
    <>
      <PageHero
        title="Courses & Programs"
        subtitle="Every course below can be bought online. Pay by UPI, upload your payment proof, and your lessons unlock as soon as our team verifies it."
        crumbs={[{ label: 'Courses' }]}
      />

      <Section>
        <div className="container">
          <Suspense fallback={<PageLoader label="Loading courses…" />}>
            <CourseCatalog />
          </Suspense>
        </div>
      </Section>
    </>
  );
}
