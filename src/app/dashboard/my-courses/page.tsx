'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, GraduationCap, PlayCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { watchCourses, watchMyEnrollments } from '@/lib/queries';
import type { Course, Enrollment } from '@/lib/types';
import { Badge, EmptyState, LinkButton, Skeleton } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) return;
    const a = watchMyEnrollments(user.uid, setEnrollments);
    const b = watchCourses(setCourses, { publishedOnly: true });
    return () => {
      a();
      b();
    };
  }, [user]);

  if (enrollments === null) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  const byId = new Map(courses.map((c) => [c.id, c]));
  const items = enrollments
    .filter((e) => e.active)
    .map((e) => ({ enrollment: e, course: byId.get(e.courseId) }))
    .filter((x) => x.course);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<GraduationCap size={22} />}
        title="You have no active courses"
        description="Once an admin verifies your payment, the course appears here with all its video lessons."
        action={
          <LinkButton href="/courses" className="mt-2">
            Browse courses
          </LinkButton>
        }
      />
    );
  }

  return (
    <>
      <p className="mb-6 text-[14px] text-slate-500">
        You have{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{items.length}</span>{' '}
        active course{items.length === 1 ? '' : 's'}.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ enrollment, course }) => (
          <Link
            key={enrollment.id}
            href={`/dashboard/learn/${course!.id}`}
            className="group surface flex flex-col overflow-hidden transition hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lift"
          >
            <div className="relative aspect-[16/9] bg-gradient-to-br from-brand-600 to-brand-900">
              {course!.thumbnailUrl ? (
                <Image
                  src={course!.thumbnailUrl}
                  alt={course!.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <BookOpen size={36} className="text-white/30" />
                </div>
              )}
              <span className="absolute inset-0 grid place-items-center bg-ink-950/45 opacity-0 transition group-hover:opacity-100">
                <PlayCircle size={44} className="text-white drop-shadow" />
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <Badge>{course!.category}</Badge>
              <h3 className="mt-3 line-clamp-2 flex-1 font-display text-[15.5px] font-bold text-slate-900 dark:text-white">
                {course!.title}
              </h3>
              <p className="mt-3 text-[12px] text-slate-500">
                Enrolled {formatDate(enrollment.enrolledAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
