'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Eye, Plus, Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { Course, CourseLevel } from '@/lib/types';
import { fetchCourseById } from '@/lib/queries';
import { useToast } from '@/components/providers/ToastProvider';
import { Button, Field, Input, PageLoader, Select, Textarea } from '@/components/ui';
import { FileUpload } from '@/components/ui/FileUpload';
import { LessonManager } from './LessonManager';
import { programs } from '@/content/programs';
import { slugify } from '@/lib/utils';

const CATEGORIES = [
  ...programs.map((p) => p.name),
  'Computer Courses',
  'Foundation / Certificate',
];

const LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

const EMPTY = {
  title: '',
  slug: '',
  category: CATEGORIES[0],
  software: '',
  shortDescription: '',
  description: '',
  outcomes: '',
  syllabus: '',
  price: 0,
  mrp: 0,
  durationWeeks: 8,
  level: 'Beginner' as CourseLevel,
  language: 'English / Bengali',
  thumbnailUrl: '',
  certificate: true,
  published: false,
};

export function CourseEditor({ courseId }: { courseId: string }) {
  const isNew = courseId === 'new';
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(isNew ? null : courseId);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const c = await fetchCourseById(courseId);
      if (c) {
        setForm({
          title: c.title,
          slug: c.slug,
          category: c.category,
          software: c.software || '',
          shortDescription: c.shortDescription,
          description: c.description,
          outcomes: (c.outcomes || []).join('\n'),
          syllabus: (c.syllabus || []).join('\n'),
          price: c.price,
          mrp: c.mrp || 0,
          durationWeeks: c.durationWeeks || 8,
          level: c.level,
          language: c.language || 'English / Bengali',
          thumbnailUrl: c.thumbnailUrl || '',
          certificate: c.certificate ?? true,
          published: c.published,
        });
      }
      setLoading(false);
    })();
  }, [courseId, isNew]);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast('Course title is required.', 'error');
      return;
    }

    const slug = (form.slug || slugify(form.title)).trim();

    const payload: Omit<Course, 'id'> = {
      title: form.title.trim(),
      slug,
      category: form.category,
      software: form.software.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      outcomes: form.outcomes.split('\n').map((s) => s.trim()).filter(Boolean),
      syllabus: form.syllabus.split('\n').map((s) => s.trim()).filter(Boolean),
      price: Number(form.price) || 0,
      mrp: Number(form.mrp) || 0,
      durationWeeks: Number(form.durationWeeks) || 0,
      level: form.level,
      language: form.language,
      thumbnailUrl: form.thumbnailUrl,
      certificate: form.certificate,
      published: form.published,
    };

    setBusy(true);
    try {
      if (savedId) {
        await updateDoc(doc(db, 'courses', savedId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        toast('Course saved.', 'success');
      } else {
        const ref = await addDoc(collection(db, 'courses'), {
          ...payload,
          studentsCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setSavedId(ref.id);
        toast('Course created. You can now upload video lessons below.', 'success');
        router.replace(`/admin/courses/${ref.id}`);
      }
    } catch {
      toast('Could not save the course. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <PageLoader label="Loading course…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-brand-600"
        >
          <ArrowLeft size={14} /> All courses
        </Link>

        {savedId && form.published && (
          <Link
            href={`/courses/${form.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:underline"
          >
            <Eye size={14} /> View public page
          </Link>
        )}
      </div>

      <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* --------------------------------------------------------- Main */}
        <div className="space-y-6">
          <section className="surface p-6">
            <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              Course basics
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Course Title" required className="sm:col-span-2">
                <Input
                  value={form.title}
                  onChange={(e) => {
                    set('title', e.target.value);
                    if (!slugTouched) set('slug', slugify(e.target.value));
                  }}
                  placeholder="e.g. AutoCAD 2D + 3D for Civil Engineers"
                  required
                />
              </Field>

              <Field
                label="URL Slug"
                hint={`Public URL: /courses/${form.slug || 'your-slug'}`}
                className="sm:col-span-2"
              >
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('slug', slugify(e.target.value));
                  }}
                  placeholder="autocad-2d-3d-civil"
                />
              </Field>

              <Field label="Category" required>
                <Select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  required
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Primary Software" hint="Shown as a tag on the course card.">
                <Input
                  value={form.software}
                  onChange={(e) => set('software', e.target.value)}
                  placeholder="e.g. AutoCAD"
                />
              </Field>

              <Field label="Short Description" required className="sm:col-span-2">
                <Textarea
                  value={form.shortDescription}
                  onChange={(e) => set('shortDescription', e.target.value)}
                  className="min-h-20"
                  placeholder="One or two lines shown on the course card and search results."
                  required
                />
              </Field>

              <Field label="Full Description" className="sm:col-span-2">
                <Textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  className="min-h-40"
                  placeholder="The complete course description. Leave a blank line between paragraphs."
                />
              </Field>
            </div>
          </section>

          <section className="surface p-6">
            <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              Learning outcomes & syllabus
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">One item per line.</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="What you will learn">
                <Textarea
                  value={form.outcomes}
                  onChange={(e) => set('outcomes', e.target.value)}
                  className="min-h-44 font-mono text-[13px]"
                  placeholder={'Draft accurate 2D plans\nBuild 3D solid models\nPlot to scale'}
                />
              </Field>
              <Field label="Syllabus">
                <Textarea
                  value={form.syllabus}
                  onChange={(e) => set('syllabus', e.target.value)}
                  className="min-h-44 font-mono text-[13px]"
                  placeholder={'Introduction & interface\nCo-ordinate systems\nDraw commands'}
                />
              </Field>
            </div>
          </section>

          {savedId ? (
            <LessonManager courseId={savedId} />
          ) : (
            <section className="surface border-dashed p-8 text-center">
              <Plus size={26} className="mx-auto text-slate-400" />
              <h2 className="mt-3 font-display text-[15px] font-bold text-slate-900 dark:text-white">
                Video lessons
              </h2>
              <p className="mt-1.5 text-[13.5px] text-slate-500">
                Save the course first — then you can upload video lessons to Cloudinary here.
              </p>
            </section>
          )}
        </div>

        {/* ------------------------------------------------------ Sidebar */}
        <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
          <section className="surface p-6">
            <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              Publish
            </h2>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-brand-300 dark:border-slate-800">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set('published', e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                <span className="block text-[13.5px] font-semibold text-slate-900 dark:text-white">
                  Published
                </span>
                <span className="block text-[12px] text-slate-500">
                  Visible in the public catalog and buyable by students.
                </span>
              </span>
            </label>

            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-brand-300 dark:border-slate-800">
              <input
                type="checkbox"
                checked={form.certificate}
                onChange={(e) => set('certificate', e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                <span className="block text-[13.5px] font-semibold text-slate-900 dark:text-white">
                  Certificate on completion
                </span>
                <span className="block text-[12px] text-slate-500">
                  Shows the certificate badge on the course page.
                </span>
              </span>
            </label>

            <Button type="submit" loading={busy} size="lg" className="mt-5 w-full">
              {!busy && <Save size={16} />}
              {savedId ? 'Save changes' : 'Create course'}
            </Button>
          </section>

          <section className="surface p-6">
            <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              Pricing
            </h2>
            <div className="mt-4 space-y-4">
              <Field label="Selling Price (₹)" required>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => set('price', Number(e.target.value))}
                  required
                />
              </Field>
              <Field label="MRP (₹)" hint="Leave 0 to hide the strike-through price.">
                <Input
                  type="number"
                  min={0}
                  value={form.mrp}
                  onChange={(e) => set('mrp', Number(e.target.value))}
                />
              </Field>
            </div>
          </section>

          <section className="surface p-6">
            <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              Details
            </h2>
            <div className="mt-4 space-y-4">
              <Field label="Level">
                <Select
                  value={form.level}
                  onChange={(e) => set('level', e.target.value as CourseLevel)}
                >
                  {LEVELS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Duration (weeks)">
                <Input
                  type="number"
                  min={0}
                  value={form.durationWeeks}
                  onChange={(e) => set('durationWeeks', Number(e.target.value))}
                />
              </Field>
              <Field label="Language">
                <Input value={form.language} onChange={(e) => set('language', e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="surface p-6">
            <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              Thumbnail
            </h2>
            <FileUpload
              kind="course-thumbnail"
              accept="image/*"
              label="Course cover image"
              hint="16:9 recommended, max 8 MB"
              maxMb={8}
              className="mt-4"
              value={form.thumbnailUrl}
              onUploaded={(r) => set('thumbnailUrl', r.url)}
              onClear={() => set('thumbnailUrl', '')}
            />
          </section>
        </aside>
      </form>
    </div>
  );
}
