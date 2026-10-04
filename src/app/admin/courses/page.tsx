'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import {
  BookMarked,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { watchCourses } from '@/lib/queries';
import type { Course } from '@/lib/types';
import { useToast } from '@/components/providers/ToastProvider';
import { Badge, Button, EmptyState, Input, LinkButton, Select, Skeleton } from '@/components/ui';
import { formatDate, formatINR } from '@/lib/utils';

export default function AdminCoursesPage() {
  const toast = useToast();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => watchCourses(setCourses), []);

  const visible = useMemo(() => {
    if (!courses) return [];
    const needle = q.trim().toLowerCase();
    return courses.filter((c) => {
      if (status === 'published' && !c.published) return false;
      if (status === 'draft' && c.published) return false;
      if (!needle) return true;
      return [c.title, c.category, c.software].filter(Boolean).some((f) => f!.toLowerCase().includes(needle));
    });
  }, [courses, q, status]);

  async function togglePublish(course: Course) {
    setBusyId(course.id);
    try {
      await updateDoc(doc(db, 'courses', course.id), { published: !course.published });
      toast(course.published ? 'Course unpublished.' : 'Course is now live.', 'success');
    } catch {
      toast('Could not update the course.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(course: Course) {
    if (
      !window.confirm(
        `Delete "${course.title}"?\n\nThis removes the course from the catalog permanently. Students who already bought it will lose access. This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusyId(course.id);
    try {
      await deleteDoc(doc(db, 'courses', course.id));
      toast('Course deleted.', 'success');
    } catch {
      toast('Could not delete the course.', 'error');
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
            placeholder="Search courses…"
            className="pl-10"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="w-auto"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </Select>
        <LinkButton href="/admin/courses/new">
          <Plus size={16} /> New course
        </LinkButton>
      </div>

      {courses === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<BookMarked size={22} />}
          title={courses.length === 0 ? 'No courses yet' : 'No courses match your filters'}
          description={
            courses.length === 0
              ? 'Create your first course, then upload video lessons to it.'
              : 'Try clearing the search box or changing the status filter.'
          }
          action={
            courses.length === 0 ? (
              <LinkButton href="/admin/courses/new" className="mt-2">
                <Plus size={16} /> Add a course
              </LinkButton>
            ) : undefined
          }
        />
      ) : (
        <div className="surface divide-y divide-slate-200 overflow-hidden dark:divide-slate-800">
          {visible.map((c) => (
            <div key={c.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <span className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 sm:w-32">
                {c.thumbnailUrl ? (
                  <Image src={c.thumbnailUrl} alt={c.title} fill sizes="128px" className="object-cover" />
                ) : (
                  <span className="grid h-full place-items-center">
                    <BookMarked size={20} className="text-white/40" />
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/courses/${c.id}`}
                    className="truncate font-display text-[15.5px] font-bold text-slate-900 hover:text-brand-600 dark:text-white"
                  >
                    {c.title}
                  </Link>
                  <Badge tone={c.published ? 'green' : 'slate'}>
                    {c.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-[12.5px] text-slate-500">
                  {c.category}
                  {c.software ? ` · ${c.software}` : ''} · {c.level} · Added {formatDate(c.createdAt)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
                  <span className="font-display text-[14px] font-bold text-slate-900 dark:text-white">
                    {formatINR(c.price)}
                  </span>
                  {c.studentsCount ? (
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {c.studentsCount} enrolled
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  loading={busyId === c.id}
                  onClick={() => togglePublish(c)}
                >
                  {c.published ? <EyeOff size={15} /> : <Eye size={15} />}
                  {c.published ? 'Unpublish' : 'Publish'}
                </Button>
                <LinkButton href={`/admin/courses/${c.id}`} size="sm">
                  <Pencil size={15} /> Edit & lessons
                </LinkButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  onClick={() => remove(c)}
                  aria-label={`Delete ${c.title}`}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
