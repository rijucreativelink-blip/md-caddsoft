import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-3 text-[14.5px] text-slate-500">
          The page you are looking for has moved or no longer exists.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Home size={16} /> Back to home
          </Link>
          <Link
            href="/courses"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-brand-400 dark:border-slate-700 dark:text-slate-300"
          >
            <Search size={16} /> Browse courses
          </Link>
        </div>
      </div>
    </div>
  );
}
