import Link from 'next/link';
import { ArrowLeft, Award, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { Logo } from '@/components/site/Logo';
import { site } from '@/content/site';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-brand-600"
          >
            <ArrowLeft size={14} /> Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <p className="text-center text-[12px] text-slate-400">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div className="absolute inset-0 bg-grid-dark [background-size:48px_48px] opacity-50" />
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl animate-float" />

        <div className="relative flex h-full flex-col justify-center px-14">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-300">
            Student & Admin Portal
          </span>

          <h2 className="mt-7 max-w-md text-balance font-display text-4xl font-extrabold leading-tight text-white">
            Unleash The Power of{' '}
            <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              Engineering
            </span>
          </h2>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-300">
            Buy any CADD Software course online, upload your payment proof, and watch your recorded
            lessons the moment our team verifies it.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              { icon: GraduationCap, label: 'Recorded video lessons, lifetime access' },
              { icon: ShieldCheck, label: 'Simple UPI payment with manual verification' },
              { icon: Award, label: 'Hologram-verified international certificate' },
              { icon: Users, label: 'Placement assistance and advisor support' },
            ].map((f) => (
              <li key={f.label} className="flex items-center gap-3.5 text-[14px] text-slate-300">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-brand-400">
                  <f.icon size={17} />
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
