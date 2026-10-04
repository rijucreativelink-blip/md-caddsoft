'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { Check, Mail, MessageSquare, Phone, Search } from 'lucide-react';
import { db } from '@/lib/firebase';
import { toMillis } from '@/lib/queries';
import type { Enquiry } from '@/lib/types';
import { useToast } from '@/components/providers/ToastProvider';
import { Badge, Button, EmptyState, Input, Select, Skeleton } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function AdminEnquiriesPage() {
  const toast = useToast();
  const [items, setItems] = useState<Enquiry[] | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'handled'>('new');

  useEffect(
    () =>
      onSnapshot(query(collection(db, 'enquiries'), orderBy('createdAt', 'desc')), (snap) =>
        setItems(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: toMillis(d.data().createdAt),
          })) as Enquiry[],
        ),
      ),
    [],
  );

  const visible = useMemo(() => {
    if (!items) return [];
    const needle = q.trim().toLowerCase();
    return items.filter((e) => {
      if (filter === 'new' && e.handled) return false;
      if (filter === 'handled' && !e.handled) return false;
      if (!needle) return true;
      return [e.name, e.email, e.phone, e.courseCategory, e.message]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(needle));
    });
  }, [items, q, filter]);

  async function toggleHandled(e: Enquiry) {
    try {
      await updateDoc(doc(db, 'enquiries', e.id), { handled: !e.handled });
    } catch {
      toast('Could not update this enquiry.', 'error');
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
            placeholder="Search enquiries…"
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
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={22} />}
          title={filter === 'new' ? 'No new enquiries' : 'No enquiries match'}
          description="Course enquiries from the home, contact and career pages land here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((e) => (
            <article key={e.id} className="surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-[15px] font-bold text-slate-900 dark:text-white">
                    {e.name}
                  </h3>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    {formatDate(e.createdAt)} · via {e.source} page
                  </p>
                </div>
                <Badge tone={e.handled ? 'green' : 'amber'}>{e.handled ? 'Handled' : 'New'}</Badge>
              </div>

              {e.courseCategory && (
                <p className="mt-3">
                  <Badge tone="brand">{e.courseCategory}</Badge>
                </p>
              )}

              {e.message && (
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-[13.5px] leading-relaxed text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                  {e.message}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                <a
                  href={`tel:${e.phone}`}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:underline"
                >
                  <Phone size={14} /> {e.phone}
                </a>
                <a
                  href={`mailto:${e.email}`}
                  className="inline-flex items-center gap-1.5 truncate text-[13px] font-semibold text-brand-600 hover:underline"
                >
                  <Mail size={14} /> {e.email}
                </a>
                <Button
                  variant={e.handled ? 'ghost' : 'outline'}
                  size="sm"
                  className="ml-auto"
                  onClick={() => toggleHandled(e)}
                >
                  <Check size={14} /> {e.handled ? 'Mark as new' : 'Mark handled'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
