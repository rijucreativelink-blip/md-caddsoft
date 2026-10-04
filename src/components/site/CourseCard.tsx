import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Award, BookOpen, Clock, Star, Users } from 'lucide-react';
import type { Course } from '@/lib/types';
import { Badge } from '@/components/ui';
import { formatINR } from '@/lib/utils';

export function CourseCard({ course }: { course: Course }) {
  const discount =
    course.mrp && course.mrp > course.price
      ? Math.round(((course.mrp - course.price) / course.mrp) * 100)
      : 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group surface flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lift"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <BookOpen size={40} className="text-white/30" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-ink-950/80 to-transparent p-3">
          <Badge tone="slate" className="border-white/20 bg-white/15 text-white backdrop-blur">
            {course.category}
          </Badge>
          {discount > 0 && (
            <span className="rounded-full bg-accent-500 px-2.5 py-0.5 text-[11px] font-bold text-ink-900">
              {discount}% OFF
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-display text-[16.5px] font-bold leading-snug text-slate-900 dark:text-white">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">
          {course.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Award size={13} /> {course.level}
          </span>
          {course.durationWeeks ? (
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {course.durationWeeks} weeks
            </span>
          ) : null}
          {course.studentsCount ? (
            <span className="flex items-center gap-1.5">
              <Users size={13} /> {course.studentsCount}
            </span>
          ) : null}
          {course.rating ? (
            <span className="flex items-center gap-1.5 text-amber-600">
              <Star size={13} className="fill-current" /> {course.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <div>
            <span className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
              {course.price > 0 ? formatINR(course.price) : 'Free'}
            </span>
            {discount > 0 && (
              <span className="ml-2 text-[13px] text-slate-400 line-through">
                {formatINR(course.mrp!)}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-bold uppercase tracking-wider text-brand-600 transition group-hover:gap-2 dark:text-brand-400">
            View <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
