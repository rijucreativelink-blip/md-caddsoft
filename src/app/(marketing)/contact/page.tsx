import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { Section } from '@/components/ui';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import { enquiryCourseOptions, site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Contact ${site.name}, ${site.address.city}, ${site.address.state}.`,
};

const CARDS = [
  {
    icon: MapPin,
    title: 'Address',
    lines: [site.address.line1, site.address.line2, site.address.city, `${site.address.state} - ${site.address.pin}`],
  },
  {
    icon: Phone,
    title: 'Mobile',
    lines: site.phones,
    hrefs: site.phones.map((p) => `tel:${p.replace(/[^+\d]/g, '')}`),
  },
  {
    icon: Mail,
    title: 'Email',
    lines: [site.email],
    hrefs: [`mailto:${site.email}`],
  },
  {
    icon: Clock,
    title: 'Office Hours',
    lines: [site.phoneHours, 'Monday to Saturday'],
  },
];

export default function ContactPage() {
  const mapQuery = encodeURIComponent(
    `${site.address.line2}, ${site.address.city}, ${site.address.state} ${site.address.pin}`,
  );

  return (
    <>
      <PageHero
        title="Contact us"
        subtitle="Talk to an advisor about courses, batches, fees and placement assistance."
        crumbs={[{ label: 'Contact Us' }]}
      />

      <Section>
        <div className="container">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((c) => (
              <div key={c.title} className="surface p-6 transition hover:-translate-y-1 hover:shadow-lift">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                  <c.icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                  {c.title}
                </h3>
                <div className="mt-2.5 space-y-0.5 text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {c.lines.map((l, i) =>
                    c.hrefs?.[i] ? (
                      <a
                        key={l}
                        href={c.hrefs[i]}
                        className="block break-words transition hover:text-brand-600"
                      >
                        {l}
                      </a>
                    ) : (
                      <p key={l}>{l}</p>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="surface overflow-hidden">
              <iframe
                title="CADD Software location map"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-[430px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <EnquiryForm
              options={[...enquiryCourseOptions]}
              source="contact"
              title="Send us a message"
              submitLabel="SEND MESSAGE"
            />
          </div>
        </div>
      </Section>
    </>
  );
}
