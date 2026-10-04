'use client';

import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

/**
 * `auth` and `db` are lazy proxies: Firebase is only really initialised the
 * first time a property is touched, which always happens in the browser (inside
 * effects and event handlers). Initialising at module scope would run during
 * prerendering on the server, where the public config is not meaningful.
 */
function lazy<T extends object>(resolve: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      const value = Reflect.get(resolve() as object, prop, receiver);
      return typeof value === 'function' ? value.bind(resolve()) : value;
    },
    set(_target, prop, value) {
      return Reflect.set(resolve() as object, prop, value);
    },
    has(_target, prop) {
      return Reflect.has(resolve() as object, prop);
    },
    getPrototypeOf() {
      return Reflect.getPrototypeOf(resolve() as object);
    },
  });
}

export const auth: Auth = lazy(getFirebaseAuth);
export const db: Firestore = lazy(getDb);

/** True when the FIREBASE_* env vars are present. */
export const isFirebaseConfigured = Boolean(
  process.env.FIREBASE_API_KEY && process.env.FIREBASE_PROJECT_ID,
);

/** Google Analytics — browser only, skipped where unsupported (SSR, blockers). */
let analyticsInstance: Analytics | null = null;
export async function initAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined' || !isFirebaseConfigured) return null;
  if (analyticsInstance) return analyticsInstance;
  if (!(await isSupported())) return null;
  analyticsInstance = getAnalytics(getFirebaseApp());
  return analyticsInstance;
}
