'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

const LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Courses', href: '/courses' },
  { label: 'Our Approach', href: '/training-methodology' },
  { label: 'Programs', href: '/programs/civil-cadd' },
  { label: 'Verification', href: '/verification' },
];

/** Minimal white header: wordmark left, links centred, two pill buttons right. */
export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="text-[17px] font-semibold tracking-tight text-neutral-950">
          /CADD
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-[13.5px] text-neutral-700 transition hover:text-neutral-950',
                pathname.startsWith(l.href) && 'text-neutral-950',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link
            href="/contact"
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-neutral-800"
          >
            Contact Us
          </Link>
          <Link
            href={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'}
            className="rounded-full border border-neutral-950 px-5 py-2.5 text-[13px] font-medium text-neutral-950 transition hover:bg-neutral-950 hover:text-white"
          >
            {user ? 'Dashboard' : 'Sign In'}
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-neutral-300 lg:hidden"
          aria-label="Menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-neutral-200 bg-white px-5 pb-6 pt-2 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block border-b border-neutral-100 py-3.5 text-[15px] text-neutral-800"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-5 flex gap-2.5">
            <Link
              href="/contact"
              className="flex-1 rounded-full bg-neutral-950 py-3 text-center text-[14px] font-medium text-white"
            >
              Contact Us
            </Link>
            <Link
              href={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'}
              className="flex-1 rounded-full border border-neutral-950 py-3 text-center text-[14px] font-medium"
            >
              {user ? 'Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
