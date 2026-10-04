'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Plus,
  QrCode,
  Users,
} from 'lucide-react';
import { watchAllPayments, watchCourses, watchStudents } from '@/lib/queries';
import type { Course, Payment, UserProfile } from '@/lib/types';
import { Badge, LinkButton, Skeleton } from '@/components/ui';
import { formatDate, formatINR } from '@/lib/utils';

export default function AdminOverview() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [students, setStudents] = useState<UserProfile[] | null>(null);

  useEffect(() => {
    const a = watchAllPayments(setPayments);
    const b = watchCourses(setCourses);
    const c = watchStudents(setStudents);
    return () => {
      a();
      b();
      c();
    };
  }, []);

  const pending = (payments ?? []).filter((p) => p.status === 'pending');
  const approved = (payments ?? []).filter((p) => p.status === 'approved');
  const revenue = approved.reduce((s, p) => s + (p.amount || 0), 0);

  const stats = [
    {
      label: 'Pending verification',
      value: payments ? pending.length : null,
      icon: Clock,
      tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
      href: '/admin/payments',
    },
    {
      label: 'Verified revenue',
      value: payments ? formatINR(revenue) : null,
      icon: IndianRupee,
      tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
      href: '/admin/payments',
    },
    {
      label: 'Published courses',
      value: courses ? courses.filter((c) => c.published).length : null,
      icon: BookMarked,
      tone: 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400',
      href: '/admin/courses',
    },
    {
      label: 'Registered students',
      value: students ? students.filter((s) => s.role === 'student').length : null,
      icon: Users,
      tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      href: '/admin/students',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <LinkButton href="/admin/courses/new">
          <Plus size={16} /> Add new course
        </LinkButton>
        <LinkButton href="/admin/payments" variant="outline">
          <CreditCard size={16} /> Verify payments
          {pending.length > 0 && (
            <span className="ml-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {pending.length}
            </span>
          )}
        </LinkButton>
        <LinkButton href="/admin/settings" variant="ghost">
          <QrCode size={16} /> Payment QR & UPI
        </LinkButton>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="surface group p-5 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}>
                <s.icon size={19} />
              </span>
              <ArrowRight
                size={16}
                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
              />
            </div>
            {s.value === null ? (
              <Skeleton className="mt-4 h-7 w-20" />
            ) : (
              <p className="mt-4 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                {s.value}
              </p>
            )}
            <p className="mt-1 text-[12.5px] text-slate-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Pending queue */}
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              Payments awaiting verification
            </h2>
            <Link
              href="/admin/payments"
              className="text-[13px] font-semibold text-brand-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {payments === null ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle2 size={28} className="mx-auto text-emerald-500" />
              <p className="mt-3 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                All caught up
              </p>
              <p className="mt-1 text-[13px] text-slate-500">No payments are waiting for review.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {pending.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link
                    href="/admin/payments"
                    className="flex items-center gap-4 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50">
                      <Clock size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-slate-900 dark:text-white">
                        {p.userName || p.userEmail}
                      </p>
                      <p className="truncate text-[12px] text-slate-500">
                        {p.courseTitle} · UTR {p.utr}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-[13.5px] font-bold text-slate-900 dark:text-white">
                        {formatINR(p.amount)}
                      </p>
                      <p className="text-[11px] text-slate-400">{formatDate(p.createdAt)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent courses */}
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              Recently added courses
            </h2>
            <Link
              href="/admin/courses"
              className="text-[13px] font-semibold text-brand-600 hover:underline"
            >
              Manage
            </Link>
          </div>

          {courses === null ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="p-10 text-center">
              <BookMarked size={28} className="mx-auto text-slate-400" />
              <p className="mt-3 text-[14px] font-medium text-slate-700 dark:text-slate-300">
                No courses yet
              </p>
              <LinkButton href="/admin/courses/new" size="sm" className="mt-4">
                <Plus size={15} /> Add your first course
              </LinkButton>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {courses.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/courses/${c.id}`}
                    className="flex items-center gap-4 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-slate-900 dark:text-white">
                        {c.title}
                      </p>
                      <p className="truncate text-[12px] text-slate-500">{c.category}</p>
                    </div>
                    <Badge tone={c.published ? 'green' : 'slate'}>
                      {c.published ? 'Published' : 'Draft'}
                    </Badge>
                    <span className="shrink-0 font-display text-[13.5px] font-bold text-slate-900 dark:text-white">
                      {formatINR(c.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
