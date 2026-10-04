'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, Clock, CreditCard, ExternalLink, XCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { watchMyPayments } from '@/lib/queries';
import type { Payment } from '@/lib/types';
import { Badge, EmptyState, LinkButton, Skeleton } from '@/components/ui';
import { formatDate, formatINR } from '@/lib/utils';

const STATUS = {
  pending: { tone: 'amber' as const, label: 'Under verification', icon: Clock },
  approved: { tone: 'green' as const, label: 'Approved', icon: CheckCircle2 },
  rejected: { tone: 'red' as const, label: 'Rejected', icon: XCircle },
};

export default function StudentPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    if (!user) return;
    return watchMyPayments(user.uid, setPayments);
  }, [user]);

  if (payments === null) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard size={22} />}
        title="No payments yet"
        description="When you buy a course and submit your UTR number and screenshot, the verification status shows up here."
        action={
          <LinkButton href="/courses" className="mt-2">
            Browse courses
          </LinkButton>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((p) => {
        const s = STATUS[p.status];
        return (
          <div key={p.id} className="surface p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row">
              {/* Screenshot */}
              {p.screenshotUrl && (
                <a
                  href={p.screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative h-32 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:w-44 dark:border-slate-800 dark:bg-slate-900"
                >
                  <Image
                    src={p.screenshotUrl}
                    alt="Payment screenshot"
                    fill
                    sizes="176px"
                    className="object-contain"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-ink-950/50 opacity-0 transition group-hover:opacity-100">
                    <ExternalLink size={20} className="text-white" />
                  </span>
                </a>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-[16px] font-bold text-slate-900 dark:text-white">
                      {p.courseTitle}
                    </h3>
                    <p className="mt-0.5 text-[12.5px] text-slate-500">
                      Submitted {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <Badge tone={s.tone}>
                    <s.icon size={11} /> {s.label}
                  </Badge>
                </div>

                <dl className="mt-4 grid gap-3 text-[13px] sm:grid-cols-3">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Amount
                    </dt>
                    <dd className="mt-0.5 font-display font-bold text-slate-900 dark:text-white">
                      {formatINR(p.amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      UTR / Reference
                    </dt>
                    <dd className="mt-0.5 font-mono text-slate-800 dark:text-slate-200">{p.utr}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Reviewed
                    </dt>
                    <dd className="mt-0.5 text-slate-800 dark:text-slate-200">
                      {p.reviewedAt ? formatDate(p.reviewedAt) : '—'}
                    </dd>
                  </div>
                </dl>

                {p.note && (
                  <p className="mt-4 rounded-lg bg-slate-50 p-3 text-[13px] text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                    <span className="font-semibold">Your note:</span> {p.note}
                  </p>
                )}

                {p.adminNote && (
                  <p
                    className={`mt-3 rounded-lg p-3 text-[13px] ${
                      p.status === 'rejected'
                        ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    <span className="font-semibold">Message from our team:</span> {p.adminNote}
                  </p>
                )}

                {p.status === 'approved' && (
                  <LinkButton
                    href={`/dashboard/learn/${p.courseId}`}
                    size="sm"
                    className="mt-4"
                  >
                    Start learning
                  </LinkButton>
                )}

                {p.status === 'rejected' && (
                  <LinkButton
                    href={`/checkout/${p.courseId}`}
                    size="sm"
                    variant="outline"
                    className="mt-4"
                  >
                    Resubmit payment proof
                  </LinkButton>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
