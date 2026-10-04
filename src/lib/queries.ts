'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  where,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Course, Enrollment, Lesson, Payment, PaymentSettings, UserProfile } from '@/lib/types';

/** Firestore Timestamp | number | undefined -> epoch millis */
export function toMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  const ts = value as { toMillis?: () => number; seconds?: number };
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.seconds === 'number') return ts.seconds * 1000;
  return 0;
}

function mapDoc<T>(id: string, data: DocumentData): T {
  return {
    id,
    ...data,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  } as T;
}

/* ------------------------------------------------------------------ Courses */

export async function fetchPublishedCourses(): Promise<Course[]> {
  const snap = await getDocs(
    query(collection(db, 'courses'), where('published', '==', true), orderBy('createdAt', 'desc')),
  );
  return snap.docs.map((d) => mapDoc<Course>(d.id, d.data()));
}

export function watchCourses(
  cb: (courses: Course[]) => void,
  opts: { publishedOnly?: boolean } = {},
) {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => undefined;
  }
  const constraints: QueryConstraint[] = [];
  if (opts.publishedOnly) constraints.push(where('published', '==', true));
  constraints.push(orderBy('createdAt', 'desc'));

  return onSnapshot(query(collection(db, 'courses'), ...constraints), (snap) => {
    cb(snap.docs.map((d) => mapDoc<Course>(d.id, d.data())));
  });
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  if (!isFirebaseConfigured) return null;
  const snap = await getDocs(
    query(collection(db, 'courses'), where('slug', '==', slug), fbLimit(1)),
  );
  const d = snap.docs[0];
  return d ? mapDoc<Course>(d.id, d.data()) : null;
}

export async function fetchCourseById(id: string): Promise<Course | null> {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(db, 'courses', id));
  return snap.exists() ? mapDoc<Course>(snap.id, snap.data()) : null;
}

/* ------------------------------------------------------------------ Lessons */

export function watchLessons(courseId: string, cb: (lessons: Lesson[]) => void) {
  if (!isFirebaseConfigured) {
    cb([]);
    return () => undefined;
  }
  return onSnapshot(
    query(collection(db, 'courses', courseId, 'lessons'), orderBy('order', 'asc')),
    (snap) => cb(snap.docs.map((d) => mapDoc<Lesson>(d.id, d.data()))),
  );
}

export async function fetchLessons(courseId: string): Promise<Lesson[]> {
  if (!isFirebaseConfigured) return [];
  const snap = await getDocs(
    query(collection(db, 'courses', courseId, 'lessons'), orderBy('order', 'asc')),
  );
  return snap.docs.map((d) => mapDoc<Lesson>(d.id, d.data()));
}

/* -------------------------------------------------------------- Enrollments */

export function watchMyEnrollments(userId: string, cb: (list: Enrollment[]) => void) {
  return onSnapshot(
    query(collection(db, 'enrollments'), where('userId', '==', userId)),
    (snap) =>
      cb(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          enrolledAt: toMillis(d.data().enrolledAt),
        })) as Enrollment[],
      ),
  );
}

export async function isEnrolled(userId: string, courseId: string) {
  const snap = await getDoc(doc(db, 'enrollments', `${userId}_${courseId}`));
  return snap.exists() && snap.data()?.active === true;
}

/* ----------------------------------------------------------------- Payments */

export function watchMyPayments(userId: string, cb: (list: Payment[]) => void) {
  return onSnapshot(
    query(collection(db, 'payments'), where('userId', '==', userId)),
    (snap) => {
      const list = snap.docs.map((d) => mapDoc<Payment>(d.id, d.data()));
      list.sort((a, b) => b.createdAt - a.createdAt);
      cb(list);
    },
  );
}

export function watchAllPayments(cb: (list: Payment[]) => void) {
  return onSnapshot(query(collection(db, 'payments'), orderBy('createdAt', 'desc')), (snap) =>
    cb(snap.docs.map((d) => mapDoc<Payment>(d.id, d.data()))),
  );
}

/* ----------------------------------------------------------------- Settings */

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: '',
  accountName: 'CADD Software Training Services Private Limited',
  qrImageUrl: '',
  instructions:
    'Scan the QR code with any UPI app, pay the exact course fee, then enter the 12-digit UTR / reference number and upload the payment screenshot below. Our team verifies payments within 24 working hours.',
  supportPhone: '+91-9612909791',
};

export function watchPaymentSettings(cb: (settings: PaymentSettings) => void) {
  if (!isFirebaseConfigured) {
    cb(DEFAULT_PAYMENT_SETTINGS);
    return () => undefined;
  }
  return onSnapshot(doc(db, 'settings', 'payment'), (snap) => {
    cb(
      snap.exists()
        ? { ...DEFAULT_PAYMENT_SETTINGS, ...(snap.data() as Partial<PaymentSettings>) }
        : DEFAULT_PAYMENT_SETTINGS,
    );
  });
}

export async function fetchPaymentSettings(): Promise<PaymentSettings> {
  if (!isFirebaseConfigured) return DEFAULT_PAYMENT_SETTINGS;
  const snap = await getDoc(doc(db, 'settings', 'payment'));
  return snap.exists()
    ? { ...DEFAULT_PAYMENT_SETTINGS, ...(snap.data() as Partial<PaymentSettings>) }
    : DEFAULT_PAYMENT_SETTINGS;
}

/* -------------------------------------------------------------------- Users */

export function watchStudents(cb: (list: UserProfile[]) => void) {
  return onSnapshot(collection(db, 'users'), (snap) => {
    const list = snap.docs.map((d) => ({
      uid: d.id,
      ...d.data(),
      createdAt: toMillis(d.data().createdAt),
    })) as UserProfile[];
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    cb(list);
  });
}
