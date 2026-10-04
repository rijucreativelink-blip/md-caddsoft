import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { footerNav } from '@/content/nav';
import { site } from '@/content/site';
import { Logo } from './Logo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-ink-950 text-slate-400">
      <div className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo light />
            <h3 className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-400">
              Who We Are
            </h3>
            <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed">{site.whoWeAre}</p>
          </div>

          {footerNav.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-400">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="link-underline text-[13.5px] transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 border-t border-slate-800 pt-10 sm:grid-cols-3">
          <div className="flex gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-brand-400" />
            <div className="text-[13.5px] leading-relaxed">
              <p className="font-semibold text-slate-200">Address:</p>
              <p>{site.address.line2}</p>
              <p>{site.address.city}</p>
              <p>
                {site.address.state}-{site.address.pin}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone size={18} className="mt-0.5 shrink-0 text-brand-400" />
            <div className="text-[13.5px] leading-relaxed">
              <p className="font-semibold text-slate-200">Mobile:</p>
              {site.phones.map((p) => (
                <a
                  key={p}
                  href={`tel:${p.replace(/[^+\d]/g, '')}`}
                  className="block transition hover:text-white"
                >
                  {p}
                </a>
              ))}
              <p className="mt-1 text-xs text-slate-500">{site.phoneHours}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Mail size={18} className="mt-0.5 shrink-0 text-brand-400" />
            <div className="text-[13.5px] leading-relaxed">
              <p className="font-semibold text-slate-200">Email:</p>
              <a href={`mailto:${site.email}`} className="break-all transition hover:text-white">
                {site.email}
              </a>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-slate-800 pt-8 text-[12.5px] leading-relaxed text-slate-500">
          {site.footerNote}
        </p>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p>{site.registrations}</p>
        </div>
      </div>
    </footer>
  );
}
