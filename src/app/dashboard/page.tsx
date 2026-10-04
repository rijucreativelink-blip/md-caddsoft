'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  GraduationCap,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { watchCourses, watchMyEnrollments, watchMyPayments } from '@/lib/queries';
import type { Course, Enrollment, Payment } from '@/lib/types';
import { Badge, EmptyState, LinkButton, Skeleton } from '@/components/ui';
import { formatDate, formatINR } from '@/lib/utils';

export default function StudentOverview() {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) return;
    const a = watchMyEnrollments(user.uid, setEnrollments);
    const b = watchMyPayments(user.uid, setPayments);
    const c = watchCourses(setCourses, { publishedOnly: true });
    return () => {
      a();
      b();
      c();
    };
  }, [user]);

  const pending = (payments ?? []).filter((p) => p.status === 'pending');
  const enrolledIds = new Set((enrollments ?? []).map((e) => e.courseId));
  const myCourses = courses.filter((c) => enrolledIds.has(c.id));
  const suggestions = courses.filter((c) => !enrolledIds.has(c.id)).slice(0, 3);

  const stats = [
    {
      label: 'Enrolled courses',
      value: enrollments?.length ?? null,
      icon: GraduationCap,
      tone: 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400',
    },
    {
      label: 'Awaiting verification',
      value: payments ? pending.length : null,
      icon: Clock,
      tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    },
    {
      label: 'Approved payments',
      value: payments ? payments.filter((p) => p.status === 'approved').length : null,
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    {
      label: 'Total paid',
      value: payments
        ? formatINR(
            payments.filter((p) => p.status === 'approved').reduce((s, p) => s + (p.amount || 0), 0),
          )
        : null,
      icon: CreditCard,
      tone: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-7 text-white shadow-lift">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-brand-200">
            Welcome back
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold">
            {profile?.name?.split(' ')[0] || 'Student'} 👋
          </h2>
          <p className="mt-2 max-w-lg text-[14px] text-brand-100">
            {myCourses.length > 0
              ? 'Pick up where you left off, or explore a new course from the catalog.'
              : 'You have not enrolled in any course yet. Browse the catalog and start learning today.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/courses" variant="secondary" size="sm">
              Browse courses
            </LinkButton>
            {myCourses.length > 0 && (
              <LinkButton
                href="/dashboard/my-courses"
                variant="outline"
                size="sm"
                className="border-white/25 bg-white/10 text-white hover:border-white/50 hover:text-white"
              >
                My courses <ArrowRight size={15} />
              </LinkButton>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface p-5">
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}>
                <s.icon size={19} />
              </span>
            </div>
            {s.value === null ? (
              <Skeleton className="mt-4 h-7 w-16" />
            ) : (
              <p className="mt-4 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                {s.value}
              </p>
            )}
            <p className="mt-1 text-[12.5px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending payments alert */}
      {pending.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
          <div className="flex items-start gap-3">
            <Clock size={19} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <h3 className="font-display text-[15px] font-bold text-amber-900 dark:text-amber-200">
                {pending.length} payment{pending.length === 1 ? '' : 's'} awaiting verification
              </h3>
              <p className="mt-1 text-[13.5px] text-amber-800 dark:text-amber-300">
                Our team checks UTR numbers and screenshots within 24 working hours. Courses unlock
                automatically once approved.
              </p>
              <Link
                href="/dashboard/payments"
                className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-amber-900 hover:underline dark:text-amber-200"
              >
                View payment status <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Continue learning */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Continue learning
          </h2>
          {myCourses.length > 0 && (
            <Link
              href="/dashboard/my-courses"
              className="text-[13px] font-semibold text-brand-600 hover:underline"
            >
              See all
            </Link>
          )}
        </div>

        {enrollments === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : myCourses.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={22} />}
            title="No enrolled courses yet"
            description="Buy a course to see it here. Payment is a simple UPI transfer with manual verification."
            action={
              <LinkButton href="/courses" className="mt-2">
                Browse courses
              </LinkButton>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCourses.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/learn/${c.id}`}
                className="group surface flex flex-col p-5 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift"
              >
                <Badge>{c.category}</Badge>
                <h3 className="mt-3 line-clamp-2 flex-1 font-display text-[15.5px] font-bold text-slate-900 dark:text-white">
                  {c.title}
                </h3>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wider text-brand-600 transition group-hover:gap-2.5 dark:text-brand-400">
                  <PlayCircle size={15} /> Continue
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent payments */}
      {payments && payments.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">
            Recent payments
          </h2>
          <div className="surface divide-y divide-slate-200 overflow-hidden dark:divide-slate-800">
            {payments.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    p.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50'
                      : p.status === 'rejected'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50'
                  }`}
                >
                  {p.status === 'approved' ? (
                    <CheckCircle2 size={17} />
                  ) : p.status === 'rejected' ? (
                    <XCircle size={17} />
                  ) : (
                    <Clock size={17} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-slate-900 dark:text-white">
                    {p.courseTitle}
                  </p>
                  <p className="text-[12px] text-slate-500">
                    UTR {p.utr} · {formatDate(p.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 font-display text-sm font-bold text-slate-900 dark:text-white">
                  {formatINR(p.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">
            Recommended for you
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.slug}`}
                className="group surface flex flex-col p-5 transition hover:-translate-y-1 hover:border-brand-300"
              >
                <Badge tone="slate">{c.category}</Badge>
                <h3 className="mt-3 line-clamp-2 flex-1 font-display text-[15px] font-bold text-slate-900 dark:text-white">
                  {c.title}
                </h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                    {c.price > 0 ? formatINR(c.price) : 'Free'}
                  </span>
                  <ArrowRight
                    size={15}
                    className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
