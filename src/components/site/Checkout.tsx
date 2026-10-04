'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  QrCode,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import type { Course, PaymentSettings } from '@/lib/types';
import { fetchCourseById, watchPaymentSettings, DEFAULT_PAYMENT_SETTINGS } from '@/lib/queries';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { PageHero } from '@/components/site/PageHero';
import {
  Button,
  EmptyState,
  Field,
  Input,
  LinkButton,
  PageLoader,
  Section,
  Textarea,
} from '@/components/ui';
import { FileUpload } from '@/components/ui/FileUpload';
import { formatINR } from '@/lib/utils';

export function Checkout({ courseId }: { courseId: string }) {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [course, setCourse] = useState<Course | null | undefined>(undefined);
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [utr, setUtr] = useState('');
  const [note, setNote] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<'none' | 'pending' | 'approved'>('none');

  useEffect(() => {
    fetchCourseById(courseId).then(setCourse);
  }, [courseId]);

  useEffect(() => watchPaymentSettings(setSettings), []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?next=${encodeURIComponent(`/checkout/${courseId}`)}`);
    }
  }, [authLoading, user, courseId, router]);

  // Has this student already paid / been approved for this course?
  useEffect(() => {
    if (!user) return;
    (async () => {
      const enr = await getDoc(doc(db, 'enrollments', `${user.uid}_${courseId}`));
      if (enr.exists() && enr.data()?.active) {
        setExisting('approved');
        return;
      }
      const pay = await getDoc(doc(db, 'payments', `${user.uid}_${courseId}`));
      if (pay.exists() && pay.data()?.status === 'pending') setExisting('pending');
    })();
  }, [user, courseId]);

  if (authLoading || course === undefined) return <PageLoader label="Preparing checkout…" />;
  if (!user) return <PageLoader label="Redirecting to login…" />;

  if (course === null) {
    return (
      <Section>
        <div className="container max-w-xl">
          <EmptyState
            icon={<AlertCircle size={22} />}
            title="Course not found"
            action={
              <LinkButton href="/courses" className="mt-2">
                Browse courses
              </LinkButton>
            }
          />
        </div>
      </Section>
    );
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !course) return;

    if (!utr.trim()) {
      toast('Please enter the UTR / transaction reference number.', 'error');
      return;
    }
    if (!screenshotUrl) {
      toast('Please upload the payment screenshot.', 'error');
      return;
    }

    setBusy(true);
    try {
      await setDoc(doc(db, 'payments', `${user.uid}_${course.id}`), {
        userId: user.uid,
        userName: profile?.name || user.displayName || '',
        userEmail: profile?.email || user.email || '',
        userPhone: profile?.phone || '',
        courseId: course.id,
        courseTitle: course.title,
        amount: course.price,
        utr: utr.trim().toUpperCase(),
        screenshotUrl,
        note: note.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setExisting('pending');
      toast('Payment proof submitted. We will verify it within 24 working hours.', 'success');
    } catch {
      toast('Could not submit your payment proof. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
    toast('Copied to clipboard.', 'success');
  }

  const upiLink = settings.upiId
    ? `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(
        settings.accountName,
      )}&am=${course.price}&cu=INR&tn=${encodeURIComponent(course.title.slice(0, 40))}`
    : '';

  return (
    <>
      <PageHero
        title="Complete your enrollment"
        subtitle="Pay the course fee by UPI, then submit the UTR number and payment screenshot. Your lessons unlock the moment our team verifies it."
        crumbs={[
          { label: 'Courses', href: '/courses' },
          { label: course.title, href: `/courses/${course.slug}` },
          { label: 'Checkout' },
        ]}
      />

      <Section>
        <div className="container grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            {existing === 'approved' ? (
              <div className="surface border-emerald-300 bg-emerald-50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-950/40">
                <CheckCircle2 size={38} className="mx-auto text-emerald-600" />
                <h2 className="mt-4 font-display text-xl font-bold text-emerald-900 dark:text-emerald-200">
                  You are already enrolled
                </h2>
                <p className="mt-2 text-[14px] text-emerald-800 dark:text-emerald-300">
                  Your payment for this course has been verified. Head to your dashboard to start
                  learning.
                </p>
                <LinkButton href={`/dashboard/learn/${course.id}`} className="mt-6">
                  Go to course <ArrowRight size={16} />
                </LinkButton>
              </div>
            ) : existing === 'pending' ? (
              <div className="surface border-amber-300 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-950/40">
                <Clock size={38} className="mx-auto text-amber-600" />
                <h2 className="mt-4 font-display text-xl font-bold text-amber-900 dark:text-amber-200">
                  Payment under verification
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-amber-800 dark:text-amber-300">
                  We have received your payment proof for this course. Our team verifies UTR numbers
                  and screenshots within 24 working hours — you will see the course in your
                  dashboard as soon as it is approved.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <LinkButton href="/dashboard/payments">View payment status</LinkButton>
                  <LinkButton href="/courses" variant="outline">
                    Browse more courses
                  </LinkButton>
                </div>
              </div>
            ) : (
              <>
                {/* ------------------------------------------- Step 1: Pay */}
                <div className="surface p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 font-display text-sm font-bold text-white">
                      1
                    </span>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Pay {formatINR(course.price)} using any UPI app
                    </h2>
                  </div>

                  <p className="mt-3 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {settings.instructions}
                  </p>

                  <div className="mt-6 grid gap-6 sm:grid-cols-[200px_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800">
                      {settings.qrImageUrl ? (
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                          <Image
                            src={settings.qrImageUrl}
                            alt="UPI payment QR code"
                            fill
                            sizes="200px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="grid aspect-square w-full place-items-center rounded-xl bg-slate-100 text-center dark:bg-slate-800">
                          <div className="px-4">
                            <QrCode size={30} className="mx-auto text-slate-400" />
                            <p className="mt-2 text-[12px] text-slate-500">
                              QR code not uploaded yet. Please call{' '}
                              {settings.supportPhone || '+91-9612909791'}.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {settings.upiId && (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                              UPI ID
                            </p>
                            <p className="truncate text-[14px] font-semibold text-slate-900 dark:text-white">
                              {settings.upiId}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copy(settings.upiId)}
                            className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                            aria-label="Copy UPI ID"
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      )}

                      <div className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          Payee
                        </p>
                        <p className="text-[14px] font-semibold text-slate-900 dark:text-white">
                          {settings.accountName}
                        </p>
                      </div>

                      <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-900 dark:bg-brand-950/40">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-brand-700 dark:text-brand-400">
                          Amount to pay
                        </p>
                        <p className="font-display text-xl font-extrabold text-brand-900 dark:text-brand-200">
                          {formatINR(course.price)}
                        </p>
                      </div>

                      {upiLink && (
                        <a
                          href={upiLink}
                          className="flex items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-[13.5px] font-semibold text-white transition hover:bg-ink-800 sm:hidden"
                        >
                          <Smartphone size={16} /> Open UPI app
                        </a>
                      )}
                    </div>
                  </div>

                  {settings.accountNumber && (
                    <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-[13px] sm:grid-cols-3 dark:bg-slate-900/50">
                      <div>
                        <p className="text-[11px] font-bold uppercase text-slate-500">Bank</p>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {settings.bankName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase text-slate-500">A/C No.</p>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {settings.accountNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase text-slate-500">IFSC</p>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {settings.ifsc}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ------------------------------- Step 2: Submit the proof */}
                <form onSubmit={submitPayment} className="surface mt-6 p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 font-display text-sm font-bold text-white">
                      2
                    </span>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Submit your payment proof
                    </h2>
                  </div>

                  <div className="mt-6 space-y-5">
                    <Field
                      label="UTR / Transaction Reference Number"
                      required
                      hint="The 12-digit UTR appears in your UPI app right after the payment succeeds."
                    >
                      <Input
                        value={utr}
                        onChange={(e) => setUtr(e.target.value)}
                        placeholder="e.g. 412345678901"
                        className="font-mono uppercase tracking-wide"
                        required
                      />
                    </Field>

                    <FileUpload
                      kind="payment-proof"
                      accept="image/*"
                      label="Payment screenshot *"
                      hint="PNG or JPG, max 10 MB"
                      maxMb={10}
                      value={screenshotUrl}
                      onUploaded={(r) => setScreenshotUrl(r.url)}
                      onClear={() => setScreenshotUrl('')}
                    />

                    <Field label="Note for our team (optional)">
                      <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="min-h-20"
                        placeholder="Anything we should know about this payment"
                      />
                    </Field>
                  </div>

                  <Button type="submit" loading={busy} size="lg" className="mt-6 w-full">
                    Submit for verification
                  </Button>

                  <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-slate-500">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brand-600" />
                    We never ask for your UPI PIN, OTP or card details. Only the UTR number and a
                    screenshot are needed to confirm your payment.
                  </p>
                </form>
              </>
            )}
          </div>

          {/* ------------------------------------------------ Order summary */}
          <aside className="surface lg:sticky lg:top-28">
            <div className="border-b border-slate-200 p-6 dark:border-slate-800">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
                Order Summary
              </h3>
            </div>
            <div className="p-6">
              <div className="flex gap-4">
                {course.thumbnailUrl && (
                  <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </span>
                )}
                <div className="min-w-0">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="line-clamp-2 text-[14.5px] font-semibold text-slate-900 hover:text-brand-600 dark:text-white"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-1 text-[12.5px] text-slate-500">{course.category}</p>
                </div>
              </div>

              <dl className="mt-6 space-y-2.5 border-t border-slate-200 pt-5 text-[14px] dark:border-slate-800">
                {course.mrp && course.mrp > course.price && (
                  <div className="flex justify-between text-slate-500">
                    <dt>Course price</dt>
                    <dd className="line-through">{formatINR(course.mrp)}</dd>
                  </div>
                )}
                {course.mrp && course.mrp > course.price && (
                  <div className="flex justify-between text-emerald-600">
                    <dt>Discount</dt>
                    <dd>− {formatINR(course.mrp - course.price)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
                  <dt className="font-semibold text-slate-900 dark:text-white">Total payable</dt>
                  <dd className="font-display text-lg font-extrabold text-slate-900 dark:text-white">
                    {formatINR(course.price)}
                  </dd>
                </div>
              </dl>

              <ol className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-[13px] text-slate-600 dark:border-slate-800 dark:text-slate-400">
                {[
                  'Scan the QR and pay the exact amount',
                  'Enter the UTR number and upload the screenshot',
                  'Our admin verifies it (within 24 working hours)',
                  'The course appears in your dashboard — start learning',
                ].map((step, i) => (
                  <li key={step} className="flex gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
