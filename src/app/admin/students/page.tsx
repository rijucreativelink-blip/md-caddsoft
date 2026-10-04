'use client';

import { useEffect, useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { Search, ShieldCheck, User, UserX } from 'lucide-react';
import { db } from '@/lib/firebase';
import { watchStudents } from '@/lib/queries';
import type { Role, UserProfile } from '@/lib/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Badge, Button, EmptyState, Input, Select, Skeleton } from '@/components/ui';
import { formatDate, initials } from '@/lib/utils';

export default function AdminStudentsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [people, setPeople] = useState<UserProfile[] | null>(null);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => watchStudents(setPeople), []);

  const visible = useMemo(() => {
    if (!people) return [];
    const needle = q.trim().toLowerCase();
    return people.filter((p) => {
      if (roleFilter !== 'all' && p.role !== roleFilter) return false;
      if (!needle) return true;
      return [p.name, p.email, p.phone, p.city]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(needle));
    });
  }, [people, q, roleFilter]);

  async function setRole(person: UserProfile, role: Role) {
    if (person.uid === user?.uid && role !== 'admin') {
      toast('You cannot remove your own admin access.', 'error');
      return;
    }
    setBusyId(person.uid);
    try {
      await updateDoc(doc(db, 'users', person.uid), { role });
      toast(`${person.name || person.email} is now ${role === 'admin' ? 'an admin' : 'a student'}.`, 'success');
    } catch {
      toast('Could not change the role.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function toggleBlock(person: UserProfile) {
    if (person.uid === user?.uid) {
      toast('You cannot block your own account.', 'error');
      return;
    }
    setBusyId(person.uid);
    try {
      await updateDoc(doc(db, 'users', person.uid), { blocked: !person.blocked });
      toast(person.blocked ? 'Account unblocked.' : 'Account blocked.', 'success');
    } catch {
      toast('Could not update the account.', 'error');
    } finally {
      setBusyId(null);
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
            placeholder="Search by name, email, phone or city…"
            className="pl-10"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className="w-auto"
        >
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </Select>
      </div>

      {people === null ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<User size={22} />}
          title="No accounts match"
          description="Try a different search term or role filter."
        />
      ) : (
        <div className="surface divide-y divide-slate-200 overflow-hidden dark:divide-slate-800">
          {visible.map((p) => (
            <div key={p.uid} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-[13px] font-bold text-white">
                {initials(p.name)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[14.5px] font-semibold text-slate-900 dark:text-white">
                    {p.name || 'Unnamed'}
                  </p>
                  {p.role === 'admin' && (
                    <Badge tone="brand">
                      <ShieldCheck size={11} /> Admin
                    </Badge>
                  )}
                  {p.blocked && <Badge tone="red">Blocked</Badge>}
                </div>
                <p className="mt-0.5 truncate text-[12.5px] text-slate-500">
                  {p.email}
                  {p.phone ? ` · ${p.phone}` : ''}
                  {p.city ? ` · ${p.city}` : ''}
                </p>
                <p className="mt-0.5 text-[11.5px] text-slate-400">
                  Joined {formatDate(p.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  loading={busyId === p.uid}
                  onClick={() => setRole(p, p.role === 'admin' ? 'student' : 'admin')}
                >
                  {p.role === 'admin' ? 'Make student' : 'Make admin'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={p.blocked ? 'text-emerald-600' : 'text-rose-600'}
                  disabled={busyId === p.uid}
                  onClick={() => toggleBlock(p)}
                >
                  <UserX size={15} /> {p.blocked ? 'Unblock' : 'Block'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
