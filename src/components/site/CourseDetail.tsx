'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  Lock,
  PlayCircle,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import type { Course, Lesson } from '@/lib/types';
import { fetchCourseBySlug, fetchLessons, isEnrolled } from '@/lib/queries';
import { useAuth } from '@/components/providers/AuthProvider';
import { PageHero } from '@/components/site/PageHero';
import {
  Badge,
  EmptyState,
  LinkButton,
  PageLoader,
  Section,
} from '@/components/ui';
import { formatINR, secondsToClock } from '@/lib/utils';

export function CourseDetail({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null | undefined>(undefined);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await fetchCourseBySlug(slug);
      if (cancelled) return;
      setCourse(c);
      if (c) setLessons(await fetchLessons(c.id));
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!user || !course) return;
    isEnrolled(user.uid, course.id).then(setEnrolled);
  }, [user, course]);

  if (course === undefined) return <PageLoader label="Loading course…" />;

  if (course === null) {
    return (
      <Section>
        <div className="container max-w-xl">
          <EmptyState
            icon={<BookOpen size={22} />}
            title="Course not found"
            description="This course may have been unpublished or the link is incorrect."
            action={
              <LinkButton href="/courses" className="mt-2">
                Browse all courses
              </LinkButton>
            }
          />
        </div>
      </Section>
    );
  }

  const discount =
    course.mrp && course.mrp > course.price
      ? Math.round(((course.mrp - course.price) / course.mrp) * 100)
      : 0;

  const totalSeconds = lessons.reduce((sum, l) => sum + (l.durationSeconds || 0), 0);

  return (
    <>
      <PageHero
        title={course.title}
        subtitle={course.shortDescription}
        crumbs={[{ label: 'Courses', href: '/courses' }, { label: course.title }]}
      />

      <Section className="pt-12">
        <div className="container grid items-start gap-10 lg:grid-cols-[1fr_380px]">
          {/* -------------------------------------------------------- Main */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{course.category}</Badge>
              <Badge tone="slate">{course.level}</Badge>
              {course.software && <Badge tone="amber">{course.software}</Badge>}
              {course.certificate && (
                <Badge tone="green">
                  <Award size={11} /> Certificate
                </Badge>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-slate-600 dark:text-slate-400">
              {course.durationWeeks ? (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-brand-600" /> {course.durationWeeks} weeks
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <PlayCircle size={14} className="text-brand-600" /> {lessons.length} lesson
                {lessons.length === 1 ? '' : 's'}
              </span>
              {totalSeconds > 0 && (
                <span className="flex items-center gap-1.5">
                  <BookOpen size={14} className="text-brand-600" /> {secondsToClock(totalSeconds)}{' '}
                  total
                </span>
              )}
              {course.language && (
                <span className="flex items-center gap-1.5">
                  <Globe size={14} className="text-brand-600" /> {course.language}
                </span>
              )}
              {course.studentsCount ? (
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-brand-600" /> {course.studentsCount} enrolled
                </span>
              ) : null}
              {course.rating ? (
                <span className="flex items-center gap-1.5 text-amber-600">
                  <Star size={14} className="fill-current" /> {course.rating.toFixed(1)}
                </span>
              ) : null}
            </div>

            <div className="prose-site mt-9">
              <h3 className="!mt-0">About this course</h3>
              {course.description.split('\n').filter(Boolean).map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>

            {course.outcomes?.length > 0 && (
              <div className="surface mt-9 p-7">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  What you will learn
                </h3>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {course.outcomes.map((o) => (
                    <li
                      key={o}
                      className="flex items-start gap-2.5 text-[14px] text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.syllabus?.length > 0 && (
              <div className="mt-9">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Syllabus
                </h3>
                <ol className="mt-5 space-y-2">
                  {course.syllabus.map((s, i) => (
                    <li
                      key={s}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-[14px] text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand-50 text-[11px] font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-400">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Curriculum */}
            <div className="mt-9">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Course content
              </h3>
              {lessons.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  Lessons for this course are being uploaded. You can still enroll now — they will
                  appear in your dashboard as soon as they are published.
                </p>
              ) : (
                <ul className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {lessons.map((l, i) => {
                    const open = enrolled || l.isFreePreview;
                    return (
                      <li
                        key={l.id}
                        className="flex items-center gap-4 bg-white px-5 py-3.5 dark:bg-slate-900/50"
                      >
                        <span className="w-6 shrink-0 text-[12px] font-bold text-slate-400">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {open ? (
                          <PlayCircle size={17} className="shrink-0 text-brand-600" />
                        ) : (
                          <Lock size={15} className="shrink-0 text-slate-400" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-slate-800 dark:text-slate-200">
                            {l.title}
                          </p>
                          {l.description && (
                            <p className="truncate text-[12.5px] text-slate-500">{l.description}</p>
                          )}
                        </div>
                        {l.isFreePreview && !enrolled && <Badge tone="green">Free preview</Badge>}
                        {l.durationSeconds ? (
                          <span className="shrink-0 text-[12px] tabular-nums text-slate-500">
                            {secondsToClock(l.durationSeconds)}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ------------------------------------------------------ Sidebar */}
          <aside className="lg:sticky lg:top-28">
            <div className="surface overflow-hidden">
              <div className="relative aspect-[16/9] bg-gradient-to-br from-brand-600 to-brand-900">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    sizes="380px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <GraduationCap size={44} className="text-white/30" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-end gap-3">
                  <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
                    {course.price > 0 ? formatINR(course.price) : 'Free'}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="pb-1 text-[15px] text-slate-400 line-through">
                        {formatINR(course.mrp!)}
                      </span>
                      <span className="mb-1 rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-bold text-ink-900">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-6 space-y-2.5">
                  {enrolled ? (
                    <LinkButton href={`/dashboard/learn/${course.id}`} size="lg" className="w-full">
                      <PlayCircle size={17} /> Go to course
                    </LinkButton>
                  ) : user ? (
                    <LinkButton href={`/checkout/${course.id}`} size="lg" className="w-full">
                      Enroll Now
                    </LinkButton>
                  ) : (
                    <>
                      <LinkButton
                        href={`/login?next=${encodeURIComponent(`/checkout/${course.id}`)}`}
                        size="lg"
                        className="w-full"
                      >
                        Log in to Enroll
                      </LinkButton>
                      <LinkButton href="/register" variant="outline" size="lg" className="w-full">
                        Create an account
                      </LinkButton>
                    </>
                  )}
                </div>

                {enrolled && (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-emerald-600">
                    <CheckCircle2 size={14} /> You are enrolled in this course
                  </p>
                )}

                <ul className="mt-6 space-y-3 border-t border-slate-200 pt-6 text-[13.5px] text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  {[
                    { icon: PlayCircle, label: 'Full lifetime access to recorded lessons' },
                    { icon: Award, label: 'CADD Software International Certificate' },
                    { icon: ShieldCheck, label: 'Manual UPI verification — no card needed' },
                    { icon: Users, label: 'Placement assistance & advisor support' },
                  ].map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5">
                      <f.icon size={15} className="mt-0.5 shrink-0 text-brand-600" />
                      {f.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="surface mt-4 p-5">
              <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                Questions about this course?{' '}
                <Link href="/contact" className="font-semibold text-brand-600 hover:underline">
                  Talk to an advisor
                </Link>{' '}
                or call <span className="font-semibold">+91-9612909791</span>.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
