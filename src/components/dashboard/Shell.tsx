'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, LogOut, Menu, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Logo } from '@/components/site/Logo';
import { Button, LinkButton, PageLoader } from '@/components/ui';
import { cn, initials } from '@/lib/utils';

export interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
  badge?: number;
}

export function DashboardShell({
  links,
  title,
  requireAdmin = false,
  children,
}: {
  links: NavLink[];
  title: string;
  requireAdmin?: boolean;
  children: ReactNode;
}) {
  const { user, profile, loading, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (loading || !user) return <PageLoader label="Checking your session…" />;

  // Profile still syncing on first paint.
  if (requireAdmin && !profile) return <PageLoader label="Verifying access…" />;

  if (requireAdmin && !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-5">
        <div className="surface max-w-md p-9 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50">
            <ShieldAlert size={26} />
          </span>
          <h1 className="mt-5 font-display text-xl font-bold text-slate-900 dark:text-white">
            Admin access required
          </h1>
          <p className="mt-2 text-[14px] text-slate-500">
            Your account does not have admin permissions. If you believe this is a mistake, ask an
            existing admin to set your role to <code className="font-mono">admin</code>.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <LinkButton href="/dashboard">Go to my dashboard</LinkButton>
            <LinkButton href="/" variant="outline">
              Back to site
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (link: NavLink) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
        <Logo />
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition',
              isActive(l)
                ? 'bg-brand-600 text-white shadow-lift'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white',
            )}
          >
            <l.icon size={17} className="shrink-0" />
            <span className="flex-1">{l.label}</span>
            {l.badge ? (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-bold',
                  isActive(l) ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                )}
              >
                {l.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800/70"
        >
          <ArrowLeft size={16} /> Back to website
        </Link>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-ink-950">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900/60">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl dark:bg-slate-900">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/85 px-5 backdrop-blur-xl dark:border-slate-800 dark:bg-ink-950/85">
          <Button
            variant="ghost"
            size="sm"
            className="px-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </Button>

          <h1 className="flex-1 truncate font-display text-[17px] font-bold text-slate-900 dark:text-white">
            {title}
          </h1>

          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <span className="hidden rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-700 sm:inline dark:border-brand-900 dark:bg-brand-950/60 dark:text-brand-300">
                Admin
              </span>
            )}
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-[12px] font-bold text-white">
              {initials(profile?.name || user.displayName)}
            </span>
            <div className="hidden sm:block">
              <p className="max-w-32 truncate text-[13px] font-semibold text-slate-900 dark:text-white">
                {profile?.name || 'Student'}
              </p>
              <p className="max-w-32 truncate text-[11.5px] text-slate-500">{profile?.email}</p>
            </div>
          </div>
        </header>

        <main className="p-5 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
