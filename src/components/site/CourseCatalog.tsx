'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import type { Course } from '@/lib/types';
import { watchCourses } from '@/lib/queries';
import { CourseCard } from './CourseCard';
import { EmptyState, Input, LinkButton, Select, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'title';

export function CourseCatalog() {
  const params = useSearchParams();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [q, setQ] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? 'All');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState<SortKey>('newest');

  useEffect(() => {
    const unsub = watchCourses((list) => setCourses(list), { publishedOnly: true });
    return () => unsub();
  }, []);

  const categories = useMemo(() => {
    const set = new Set((courses ?? []).map((c) => c.category).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [courses]);

  const visible = useMemo(() => {
    if (!courses) return [];
    const needle = q.trim().toLowerCase();

    let list = courses.filter((c) => {
      if (category !== 'All' && c.category !== category) return false;
      if (level !== 'All' && c.level !== level) return false;
      if (!needle) return true;
      return [c.title, c.shortDescription, c.category, c.software]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(needle));
    });

    list = [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'title') return a.title.localeCompare(b.title);
      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });

    return list;
  }, [courses, q, category, level, sort]);

  if (courses === null) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="surface overflow-hidden">
            <Skeleton className="aspect-[16/9] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Filter bar */}
      <div className="surface mb-8 flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses, software, category…"
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="hidden items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-slate-500 sm:flex">
            <SlidersHorizontal size={14} /> Filter
          </span>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-auto">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All categories' : c}
              </option>
            ))}
          </Select>
          <Select value={level} onChange={(e) => setLevel(e.target.value)} className="w-auto">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((l) => (
              <option key={l} value={l}>
                {l === 'All' ? 'All levels' : l}
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-auto"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="title">Title A–Z</option>
          </Select>
        </div>
      </div>

      {/* Category chips */}
      {categories.length > 2 && (
        <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-semibold transition',
                category === c
                  ? 'border-brand-600 bg-brand-600 text-white shadow-lift'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400',
              )}
            >
              {c === 'All' ? 'All courses' : c}
            </button>
          ))}
        </div>
      )}

      <p className="mb-5 text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{visible.length}</span>{' '}
        of {courses.length} course{courses.length === 1 ? '' : 's'}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={22} />}
          title={courses.length === 0 ? 'No courses published yet' : 'No courses match your filters'}
          description={
            courses.length === 0
              ? 'Our team is adding courses right now. Meanwhile, browse the programs or send us an enquiry.'
              : 'Try clearing the search box or picking a different category.'
          }
          action={
            courses.length === 0 ? (
              <LinkButton href="/programs/civil-cadd" className="mt-2">
                Explore programs
              </LinkButton>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </>
  );
}
