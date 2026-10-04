import type { Metadata } from 'next';
import { PageHero } from '@/components/site/PageHero';
import { VerificationForm } from '@/components/site/VerificationForm';
import { Section } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Student Verification',
  description:
    'Verify a CADD Software International Certificate by entering the student registration number.',
};

export default function VerificationPage() {
  return (
    <>
      <PageHero
        title="Student Verification"
        subtitle="All our certificates carry a special hologram with logo, confirming the authenticity of the participant. Enter a registration number below to verify a certificate."
        crumbs={[{ label: 'Student Verification' }]}
      />

      <Section>
        <div className="container max-w-2xl">
          <VerificationForm />
        </div>
      </Section>
    </>
  );
}
