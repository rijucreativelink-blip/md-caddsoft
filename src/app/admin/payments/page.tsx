'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { doc, serverTimestamp, setDoc, updateDoc, increment } from 'firebase/firestore';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Search,
  XCircle,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { watchAllPayments } from '@/lib/queries';
import type { Payment, PaymentStatus } from '@/lib/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Badge, Button, EmptyState, Input, Skeleton, Textarea } from '@/components/ui';
import { cn, formatDate, formatINR } from '@/lib/utils';

const STATUS_META = {
  pending: { tone: 'amber' as const, label: 'Pending', icon: Clock },
  approved: { tone: 'green' as const, label: 'Approved', icon: CheckCircle2 },
  rejected: { tone: 'red' as const, label: 'Rejected', icon: XCircle },
};

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('pending');
  const [q, setQ] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => watchAllPayments(setPayments), []);

  const visible = useMemo(() => {
    if (!payments) return [];
    const needle = q.trim().toLowerCase();
    return payments.filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (!needle) return true;
      return [p.userName, p.userEmail, p.userPhone, p.courseTitle, p.utr]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(needle));
    });
  }, [payments, filter, q]);

  async function review(payment: Payment, status: 'approved' | 'rejected') {
    if (!user) return;
    const adminNote = notes[payment.id]?.trim() || '';

    if (status === 'rejected' && !adminNote) {
      toast('Please add a short reason before rejecting, so the student knows what to fix.', 'error');
      return;
    }

    setBusyId(payment.id);
    try {
      await updateDoc(doc(db, 'payments', payment.id), {
        status,
        adminNote,
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
      });

      const enrollmentId = `${payment.userId}_${payment.courseId}`;

      if (status === 'approved') {
        await setDoc(
          doc(db, 'enrollments', enrollmentId),
          {
            userId: payment.userId,
            courseId: payment.courseId,
            courseTitle: payment.courseTitle,
            paymentId: payment.id,
            active: true,
            enrolledAt: serverTimestamp(),
          },
          { merge: true },
        );
        // Best-effort counter; never block the approval on it.
        updateDoc(doc(db, 'courses', payment.courseId), {
          studentsCount: increment(1),
        }).catch(() => undefined);
        toast(`Approved. ${payment.userName || 'The student'} can now watch the course.`, 'success');
      } else {
        await setDoc(doc(db, 'enrollments', enrollmentId), { active: false }, { merge: true });
        toast('Payment rejected. The student has been told why.', 'info');
      }

      setNotes((n) => ({ ...n, [payment.id]: '' }));
    } catch {
      toast('Could not update this payment. Please try again.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  const counts = {
    all: payments?.length ?? 0,
    pending: payments?.filter((p) => p.status === 'pending').length ?? 0,
    approved: payments?.filter((p) => p.status === 'approved').length ?? 0,
    rejected: payments?.filter((p) => p.status === 'rejected').length ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="surface flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by student, email, phone, course or UTR…"
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-3.5 py-2 text-[13px] font-semibold capitalize transition',
                filter === f
                  ? 'bg-brand-600 text-white shadow-lift'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400',
              )}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {payments === null ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={22} />}
          title={filter === 'pending' ? 'Nothing waiting for review' : 'No payments match'}
          description={
            filter === 'pending'
              ? 'Every submitted payment has been reviewed. New submissions appear here instantly.'
              : 'Try a different filter or clear the search box.'
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((p) => {
            const meta = STATUS_META[p.status];
            const busy = busyId === p.id;
            return (
              <div key={p.id} className="surface overflow-hidden">
                <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row">
                  {/* Screenshot */}
                  <a
                    href={p.screenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative h-56 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 lg:h-auto lg:w-56 dark:border-slate-800 dark:bg-slate-900"
                  >
                    {p.screenshotUrl ? (
                      <Image
                        src={p.screenshotUrl}
                        alt="Payment screenshot"
                        fill
                        sizes="224px"
                        className="object-contain"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-[13px] text-slate-400">
                        No screenshot
                      </span>
                    )}
                    <span className="absolute inset-0 grid place-items-center bg-ink-950/55 opacity-0 transition group-hover:opacity-100">
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                        <ExternalLink size={15} /> Open full size
                      </span>
                    </span>
                  </a>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-[16.5px] font-bold text-slate-900 dark:text-white">
                          {p.userName || 'Unnamed student'}
                        </h3>
                        <p className="truncate text-[13px] text-slate-500">
                          {p.userEmail}
                          {p.userPhone ? ` · ${p.userPhone}` : ''}
                        </p>
                      </div>
                      <Badge tone={meta.tone}>
                        <meta.icon size={11} /> {meta.label}
                      </Badge>
                    </div>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Course
                        </dt>
                        <dd className="mt-0.5 text-[13.5px] font-medium text-slate-900 dark:text-white">
                          {p.courseTitle}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Amount
                        </dt>
                        <dd className="mt-0.5 font-display text-[15px] font-extrabold text-slate-900 dark:text-white">
                          {formatINR(p.amount)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          UTR / Reference
                        </dt>
                        <dd className="mt-0.5 select-all font-mono text-[13.5px] font-semibold text-brand-700 dark:text-brand-300">
                          {p.utr}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Submitted
                        </dt>
                        <dd className="mt-0.5 text-[13px] text-slate-700 dark:text-slate-300">
                          {formatDate(p.createdAt)}
                        </dd>
                      </div>
                    </dl>

                    {p.note && (
                      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-[13px] text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                        <span className="font-semibold">Student note:</span> {p.note}
                      </p>
                    )}

                    {p.status === 'pending' ? (
                      <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
                        <Textarea
                          value={notes[p.id] ?? ''}
                          onChange={(e) => setNotes((n) => ({ ...n, [p.id]: e.target.value }))}
                          placeholder="Note for the student (required when rejecting) — e.g. 'UTR does not match our bank statement'"
                          className="min-h-16"
                        />
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Button
                            variant="success"
                            loading={busy}
                            onClick={() => review(p, 'approved')}
                          >
                            <CheckCircle2 size={16} /> Approve & unlock course
                          </Button>
                          <Button
                            variant="danger"
                            disabled={busy}
                            onClick={() => review(p, 'rejected')}
                          >
                            <XCircle size={16} /> Reject
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                        <p className="text-[12.5px] text-slate-500">
                          Reviewed {formatDate(p.reviewedAt)}
                        </p>
                        {p.adminNote && (
                          <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-400">
                            <span className="font-semibold">Your note:</span> {p.adminNote}
                          </p>
                        )}
                        {p.status === 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            loading={busy}
                            onClick={() => review(p, 'approved')}
                          >
                            Approve after all
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
