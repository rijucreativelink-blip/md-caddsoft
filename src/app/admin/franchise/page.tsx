'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { Check, Mail, Phone, Search, Store } from 'lucide-react';
import { db } from '@/lib/firebase';
import { toMillis } from '@/lib/queries';
import type { FranchiseApplication } from '@/lib/types';
import { useToast } from '@/components/providers/ToastProvider';
import { Badge, Button, EmptyState, Input, Select, Skeleton } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function AdminFranchisePage() {
  const toast = useToast();
  const [items, setItems] = useState<FranchiseApplication[] | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'handled'>('new');

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'franchiseApplications'), orderBy('createdAt', 'desc')),
        (snap) =>
          setItems(
            snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
              createdAt: toMillis(d.data().createdAt),
            })) as FranchiseApplication[],
          ),
      ),
    [],
  );

  const visible = useMemo(() => {
    if (!items) return [];
    const needle = q.trim().toLowerCase();
    return items.filter((a) => {
      if (filter === 'new' && a.handled) return false;
      if (filter === 'handled' && !a.handled) return false;
      if (!needle) return true;
      return [a.name, a.email, a.phone, a.location, a.businessCategory]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(needle));
    });
  }, [items, q, filter]);

  async function toggleHandled(a: FranchiseApplication) {
    try {
      await updateDoc(doc(db, 'franchiseApplications', a.id), { handled: !a.handled });
    } catch {
      toast('Could not update this application.', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="surface flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search applications…"
            className="pl-10"
          />
        </div>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="w-auto"
        >
          <option value="new">New only</option>
          <option value="handled">Handled</option>
          <option value="all">All</option>
        </Select>
      </div>

      {items === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Store size={22} />}
          title={filter === 'new' ? 'No new franchise applications' : 'No applications match'}
          description="Applications submitted on the Franchise page appear here."
        />
      ) : (
        <div className="space-y-4">
          {visible.map((a) => (
            <article key={a.id} className="surface p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-[16px] font-bold text-slate-900 dark:text-white">
                    {a.name}
                  </h3>
                  <p className="mt-0.5 text-[12.5px] text-slate-500">
                    {a.qualification} · {formatDate(a.createdAt)}
                  </p>
                </div>
                <Badge tone={a.handled ? 'green' : 'amber'}>{a.handled ? 'Handled' : 'New'}</Badge>
              </div>

              <dl className="mt-5 grid gap-4 text-[13px] sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['Interested location', a.location],
                  ['Investment range', a.investmentRange],
                  ['Business category', a.businessCategory],
                  ['Job / Business', `${a.occupation}${a.field ? ` (${a.field})` : ''}`],
                  ['Address', a.address],
                  ['Heard about us via', a.referral],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      {k}
                    </dt>
                    <dd className="mt-0.5 text-slate-800 dark:text-slate-200">{v || '—'}</dd>
                  </div>
                ))}
              </dl>

              {(a.otherInfo || a.queries) && (
                <div className="mt-4 space-y-2">
                  {a.otherInfo && (
                    <p className="rounded-lg bg-slate-50 p-3 text-[13px] text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                      <span className="font-semibold">Other info:</span> {a.otherInfo}
                    </p>
                  )}
                  {a.queries && (
                    <p className="rounded-lg bg-slate-50 p-3 text-[13px] text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                      <span className="font-semibold">Queries:</span> {a.queries}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                <a
                  href={`tel:${a.phone}`}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:underline"
                >
                  <Phone size={14} /> {a.phone}
                </a>
                <a
                  href={`mailto:${a.email}`}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:underline"
                >
                  <Mail size={14} /> {a.email}
                </a>
                <Button
                  variant={a.handled ? 'ghost' : 'outline'}
                  size="sm"
                  className="ml-auto"
                  onClick={() => toggleHandled(a)}
                >
                  <Check size={14} /> {a.handled ? 'Mark as new' : 'Mark handled'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
