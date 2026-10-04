'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { mainNav } from '@/content/nav';
import { site } from '@/content/site';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn, initials } from '@/lib/utils';
import { Button, LinkButton } from '@/components/ui';
import { Logo } from './Logo';

export function Header() {
  const pathname = usePathname();
  const { user, profile, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (href?: string) =>
    href && (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      {/* Top utility bar */}
      <div className="hidden bg-ink-900 text-slate-300 lg:block">
        <div className="container flex h-10 items-center justify-between text-[12.5px]">
          <p className="tracking-wide">
            CIN: <span className="text-slate-100">{site.cin}</span> · Agartala, Tripura
          </p>
          <div className="flex items-center gap-5">
            <a
              href={`tel:${site.phones[0].replace(/[^+\d]/g, '')}`}
              className="flex items-center gap-1.5 transition hover:text-white"
            >
              <Phone size={13} />
              {site.phones.join(' / ')} ({site.phoneHours})
            </a>
            <Link href="/verification" className="transition hover:text-white">
              Student Verification
            </Link>
          </div>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-slate-200/80 bg-white/85 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-ink-950/85'
            : 'bg-white dark:bg-ink-950',
        )}
      >
        <div className="container flex h-[68px] items-center justify-between gap-3">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden min-w-0 items-center gap-0.5 lg:flex">
            {mainNav.map((item) => {
              const hasPanel = item.children || item.columns;
              if (!hasPanel) {
                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className={cn(
                      'whitespace-nowrap rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition',
                      item.secondary && 'hidden xl:block',
                      isActive(item.href)
                        ? 'text-brand-700 dark:text-brand-300'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    className={cn(
                      'flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition',
                      openMenu === item.label
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800/60 dark:text-white'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60',
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      className={cn('transition', openMenu === item.label && 'rotate-180')}
                    />
                  </button>

                  {openMenu === item.label && (
                    <div
                      className={cn(
                        'absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 animate-fade-in',
                        item.columns ? 'w-[min(92vw,60rem)]' : 'w-80',
                      )}
                    >
                      <div className="surface overflow-hidden p-5 shadow-lift">
                        {item.children && (
                          <ul className="space-y-1">
                            {item.children.map((c) => (
                              <li key={c.href}>
                                <Link
                                  href={c.href}
                                  className="block rounded-xl px-3 py-2.5 transition hover:bg-brand-50 dark:hover:bg-brand-950/40"
                                >
                                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                                    {c.label}
                                  </span>
                                  {c.description && (
                                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                                      {c.description}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}

                        {item.columns && (
                          <div className="grid grid-cols-4 gap-6">
                            {item.columns.map((col) => (
                              <div key={col.title}>
                                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
                                  {col.title}
                                </p>
                                <ul className="space-y-0.5">
                                  {col.items.map((c) => (
                                    <li key={c.href + c.label}>
                                      <Link
                                        href={c.href}
                                        className="block rounded-lg px-2 py-1.5 text-[13px] text-slate-600 transition hover:bg-slate-100 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-brand-300"
                                      >
                                        {c.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {!user ? (
              <>
                <LinkButton href="/login" variant="ghost" size="sm" className="hidden whitespace-nowrap sm:inline-flex">
                  Log in
                </LinkButton>
                <LinkButton href="/register" size="sm" className="hidden whitespace-nowrap sm:inline-flex">
                  Enroll Now
                </LinkButton>
              </>
            ) : (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 transition hover:border-brand-300 dark:border-slate-700"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {initials(profile?.name || user.displayName)}
                  </span>
                  <span className="max-w-24 truncate text-[13px] font-medium text-slate-700 dark:text-slate-300">
                    {profile?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {accountOpen && (
                  <div className="surface absolute right-0 top-full mt-2 w-60 overflow-hidden p-1.5 shadow-lift animate-fade-in">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {profile?.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">{profile?.email}</p>
                    </div>
                    <hr className="my-1" />
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard size={15} /> My Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <ShieldCheck size={15} /> Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <User size={15} /> Profile
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="px-2 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <Menu size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(88vw,22rem)] flex-col bg-white shadow-2xl dark:bg-ink-950 animate-fade-in">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <Logo compact />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {mainNav.map((item) => {
                const flat = item.children ?? item.columns?.flatMap((c) => c.items);
                if (!flat) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href!}
                      className={cn(
                        'block rounded-xl px-3 py-2.5 text-[15px] font-medium',
                        isActive(item.href)
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                          : 'text-slate-700 dark:text-slate-300',
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <details key={item.label} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                      <ChevronDown size={16} className="transition group-open:rotate-180" />
                    </summary>
                    <ul className="mb-1 ml-3 space-y-0.5 border-l pl-3">
                      {flat.map((c) => (
                        <li key={c.href + c.label}>
                          <Link
                            href={c.href}
                            className="block rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-400"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                );
              })}
            </nav>

            <div className="space-y-2 border-t p-4">
              {user ? (
                <>
                  <LinkButton href="/dashboard" className="w-full">
                    My Dashboard
                  </LinkButton>
                  {isAdmin && (
                    <LinkButton href="/admin" variant="outline" className="w-full">
                      Admin Panel
                    </LinkButton>
                  )}
                  <Button variant="ghost" className="w-full" onClick={() => logout()}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <LinkButton href="/register" className="w-full">
                    Enroll Now
                  </LinkButton>
                  <LinkButton href="/login" variant="outline" className="w-full">
                    Log in
                  </LinkButton>
                </>
              )}
              <a
                href={`tel:${site.phones[0].replace(/[^+\d]/g, '')}`}
                className="flex items-center justify-center gap-2 pt-1 text-sm text-slate-500"
              >
                <Phone size={14} /> {site.phones[0]}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
