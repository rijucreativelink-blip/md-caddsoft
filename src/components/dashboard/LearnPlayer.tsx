'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  Lock,
  PlayCircle,
  Video,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import type { Course, Enrollment, Lesson } from '@/lib/types';
import { fetchCourseById, watchLessons } from '@/lib/queries';
import { useAuth } from '@/components/providers/AuthProvider';
import { Badge, Button, EmptyState, LinkButton, PageLoader } from '@/components/ui';
import { cn, secondsToClock } from '@/lib/utils';

export function LearnPlayer({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null | undefined>(undefined);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null | undefined>(undefined);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseById(courseId).then(setCourse);
  }, [courseId]);

  useEffect(() => watchLessons(courseId, setLessons), [courseId]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'enrollments', `${user.uid}_${courseId}`), (snap) => {
      setEnrollment(snap.exists() ? ({ id: snap.id, ...snap.data() } as Enrollment) : null);
    }, () => setEnrollment(null));
  }, [user, courseId]);

  const progress = enrollment?.progress ?? {};

  const activeIndex = useMemo(() => {
    const i = lessons.findIndex((l) => l.id === activeId);
    return i >= 0 ? i : 0;
  }, [lessons, activeId]);

  const active = lessons[activeIndex];

  const completedCount = lessons.filter((l) => progress[l.id]).length;
  const percent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  async function toggleComplete(lessonId: string) {
    if (!user) return;
    await setDoc(
      doc(db, 'enrollments', `${user.uid}_${courseId}`),
      { progress: { ...progress, [lessonId]: !progress[lessonId] } },
      { merge: true },
    );
  }

  if (course === undefined || enrollment === undefined) {
    return <PageLoader label="Loading your course…" />;
  }

  if (course === null) {
    return (
      <EmptyState
        title="Course not found"
        description="This course may have been removed."
        action={
          <LinkButton href="/dashboard/my-courses" className="mt-2">
            My courses
          </LinkButton>
        }
      />
    );
  }

  if (!enrollment?.active) {
    return (
      <EmptyState
        icon={<Lock size={22} />}
        title="You are not enrolled in this course"
        description="Buy the course and, once our team verifies your payment, all lessons unlock here."
        action={
          <LinkButton href={`/courses/${course.slug}`} className="mt-2">
            View course details
          </LinkButton>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/my-courses"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-brand-600"
      >
        <ArrowLeft size={14} /> Back to my courses
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* ------------------------------------------------------- Player */}
        <div>
          <div className="overflow-hidden rounded-2xl bg-ink-950 shadow-lift">
            {active?.videoUrl ? (
              <video
                key={active.id}
                src={active.videoUrl}
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="aspect-video w-full bg-black"
                poster={course.thumbnailUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="grid aspect-video w-full place-items-center text-center">
                <div className="px-6">
                  <Video size={38} className="mx-auto text-slate-600" />
                  <p className="mt-3 text-[14px] font-medium text-slate-400">
                    No lessons uploaded yet
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Your instructor is adding video lessons to this course. They will appear here
                    automatically.
                  </p>
                </div>
              </div>
            )}
          </div>

          {active && (
            <div className="surface mt-5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
                    Lesson {activeIndex + 1} of {lessons.length}
                  </p>
                  <h2 className="mt-1.5 font-display text-xl font-bold text-slate-900 dark:text-white">
                    {active.title}
                  </h2>
                </div>
                <Button
                  variant={progress[active.id] ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => toggleComplete(active.id)}
                >
                  {progress[active.id] ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                  {progress[active.id] ? 'Completed' : 'Mark complete'}
                </Button>
              </div>

              {active.description && (
                <p className="mt-4 text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {active.description}
                </p>
              )}

              {active.resourceUrl && (
                <a
                  href={active.resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-[13.5px] font-semibold text-slate-700 transition hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
                >
                  <Download size={15} /> Lesson resources
                </a>
              )}

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveId(lessons[activeIndex - 1]?.id ?? null)}
                >
                  <ChevronLeft size={15} /> Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={activeIndex >= lessons.length - 1}
                  onClick={() => setActiveId(lessons[activeIndex + 1]?.id ?? null)}
                >
                  Next <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- Curriculum */}
        <aside className="surface h-fit overflow-hidden xl:sticky xl:top-24">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <Badge>{course.category}</Badge>
            <h3 className="mt-2.5 font-display text-[15.5px] font-bold leading-snug text-slate-900 dark:text-white">
              {course.title}
            </h3>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[12px] font-medium">
                <span className="text-slate-500">
                  {completedCount} / {lessons.length} completed
                </span>
                <span className="text-brand-600 dark:text-brand-400">{percent}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          <ul className="max-h-[560px] divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">
            {lessons.length === 0 && (
              <li className="p-6 text-center text-[13.5px] text-slate-500">
                No lessons published yet.
              </li>
            )}
            {lessons.map((l, i) => (
              <li key={l.id}>
                <button
                  onClick={() => setActiveId(l.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-5 py-3.5 text-left transition',
                    l.id === active?.id
                      ? 'bg-brand-50 dark:bg-brand-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                  )}
                >
                  {progress[l.id] ? (
                    <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                  ) : l.id === active?.id ? (
                    <PlayCircle size={17} className="shrink-0 text-brand-600" />
                  ) : (
                    <Circle size={16} className="shrink-0 text-slate-300 dark:text-slate-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-[13.5px] font-medium',
                        l.id === active?.id
                          ? 'text-brand-800 dark:text-brand-200'
                          : 'text-slate-700 dark:text-slate-300',
                      )}
                    >
                      {i + 1}. {l.title}
                    </p>
                    {l.durationSeconds ? (
                      <p className="text-[11.5px] tabular-nums text-slate-500">
                        {secondsToClock(l.durationSeconds)}
                      </p>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
