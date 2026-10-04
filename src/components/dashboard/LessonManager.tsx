'use client';

import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import type { Lesson } from '@/lib/types';
import { watchLessons } from '@/lib/queries';
import { useToast } from '@/components/providers/ToastProvider';
import { Badge, Button, Field, Input, Textarea } from '@/components/ui';
import { FileUpload } from '@/components/ui/FileUpload';
import { secondsToClock } from '@/lib/utils';

const EMPTY = {
  title: '',
  description: '',
  videoUrl: '',
  videoPublicId: '',
  durationSeconds: 0,
  resourceUrl: '',
  isFreePreview: false,
};

export function LessonManager({ courseId }: { courseId: string }) {
  const toast = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => watchLessons(courseId, setLessons), [courseId]);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startAdd() {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(lesson: Lesson) {
    setForm({
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl,
      videoPublicId: lesson.videoPublicId || '',
      durationSeconds: lesson.durationSeconds || 0,
      resourceUrl: lesson.resourceUrl || '',
      isFreePreview: lesson.isFreePreview || false,
    });
    setEditingId(lesson.id);
    setShowForm(true);
  }

  async function saveLesson(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast('Lesson title is required.', 'error');
      return;
    }
    if (!form.videoUrl) {
      toast('Upload the lesson video before saving.', 'error');
      return;
    }

    setBusy(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'courses', courseId, 'lessons', editingId), {
          title: form.title.trim(),
          description: form.description.trim(),
          videoUrl: form.videoUrl,
          videoPublicId: form.videoPublicId,
          durationSeconds: form.durationSeconds,
          resourceUrl: form.resourceUrl.trim(),
          isFreePreview: form.isFreePreview,
        });
        toast('Lesson updated.', 'success');
      } else {
        await addDoc(collection(db, 'courses', courseId, 'lessons'), {
          courseId,
          title: form.title.trim(),
          description: form.description.trim(),
          videoUrl: form.videoUrl,
          videoPublicId: form.videoPublicId,
          durationSeconds: form.durationSeconds,
          resourceUrl: form.resourceUrl.trim(),
          isFreePreview: form.isFreePreview,
          order: lessons.length,
          createdAt: serverTimestamp(),
        });
        toast('Lesson added.', 'success');
      }
      setShowForm(false);
      setForm(EMPTY);
      setEditingId(null);
    } catch {
      toast('Could not save the lesson.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function removeLesson(lesson: Lesson) {
    if (!window.confirm(`Delete lesson "${lesson.title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'courses', courseId, 'lessons', lesson.id));
      toast('Lesson deleted.', 'success');
    } catch {
      toast('Could not delete the lesson.', 'error');
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= lessons.length) return;
    const a = lessons[index];
    const b = lessons[target];
    try {
      await Promise.all([
        updateDoc(doc(db, 'courses', courseId, 'lessons', a.id), { order: target }),
        updateDoc(doc(db, 'courses', courseId, 'lessons', b.id), { order: index }),
      ]);
    } catch {
      toast('Could not reorder lessons.', 'error');
    }
  }

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-6 dark:border-slate-800">
        <div>
          <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
            Video lessons
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            {lessons.length} lesson{lessons.length === 1 ? '' : 's'} · uploaded to Cloudinary
          </p>
        </div>
        {!showForm && (
          <Button type="button" size="sm" onClick={startAdd}>
            <Plus size={15} /> Add lesson
          </Button>
        )}
      </div>

      {/* Lesson form — nested inside the course form, so it is a div, not a <form>. */}
      {showForm && (
        <div className="border-b border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[14px] font-bold text-slate-900 dark:text-white">
              {editingId ? 'Edit lesson' : 'New lesson'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 dark:hover:bg-slate-800"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Lesson Title" required>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. 01 — Interface & co-ordinate systems"
              />
            </Field>

            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="min-h-20"
                placeholder="What this lesson covers"
              />
            </Field>

            <FileUpload
              kind="course-video"
              accept="video/*"
              label="Lesson video *"
              hint="MP4 / MOV / WebM, max 500 MB"
              maxMb={500}
              value={form.videoUrl}
              onUploaded={(r) => {
                set('videoUrl', r.url);
                set('videoPublicId', r.publicId);
                if (r.durationSeconds) set('durationSeconds', r.durationSeconds);
              }}
              onClear={() => {
                set('videoUrl', '');
                set('videoPublicId', '');
                set('durationSeconds', 0);
              }}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Duration (seconds)" hint="Filled in automatically after upload.">
                <Input
                  type="number"
                  min={0}
                  value={form.durationSeconds}
                  onChange={(e) => set('durationSeconds', Number(e.target.value))}
                />
              </Field>
              <Field label="Resource link (optional)" hint="PDF, drawing file or reference URL.">
                <Input
                  value={form.resourceUrl}
                  onChange={(e) => set('resourceUrl', e.target.value)}
                  placeholder="https://…"
                />
              </Field>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-900/60">
              <input
                type="checkbox"
                checked={form.isFreePreview}
                onChange={(e) => set('isFreePreview', e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                <span className="block text-[13.5px] font-semibold text-slate-900 dark:text-white">
                  Free preview
                </span>
                <span className="block text-[12px] text-slate-500">
                  Anyone can watch this lesson without buying the course.
                </span>
              </span>
            </label>

            <div className="flex gap-3">
              <Button type="button" loading={busy} onClick={saveLesson}>
                {editingId ? 'Save lesson' : 'Add lesson'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson list */}
      {lessons.length === 0 ? (
        <div className="p-10 text-center">
          <Video size={28} className="mx-auto text-slate-400" />
          <p className="mt-3 text-[14px] font-medium text-slate-700 dark:text-slate-300">
            No lessons yet
          </p>
          <p className="mt-1 text-[13px] text-slate-500">
            Upload your first video lesson — students see it as soon as they are enrolled.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {lessons.map((l, i) => (
            <li key={l.id} className="flex items-center gap-4 p-4">
              <span className="w-7 shrink-0 text-center text-[12px] font-bold text-slate-400">
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="grid h-10 w-14 shrink-0 place-items-center rounded-lg bg-ink-900 text-white">
                <Video size={16} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[14px] font-semibold text-slate-900 dark:text-white">
                    {l.title}
                  </p>
                  {l.isFreePreview && <Badge tone="green">Free preview</Badge>}
                </div>
                <p className="mt-0.5 truncate text-[12px] text-slate-500">
                  {l.durationSeconds ? secondsToClock(l.durationSeconds) : 'Duration unknown'}
                  {l.description ? ` · ${l.description}` : ''}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800"
                  aria-label="Move up"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === lessons.length - 1}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800"
                  aria-label="Move down"
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(l)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                  aria-label="Edit lesson"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => removeLesson(l)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                  aria-label="Delete lesson"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
