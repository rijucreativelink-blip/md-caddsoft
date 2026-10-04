'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, initAnalytics, isFirebaseConfigured } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    void initAnalytics();
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, 'users', nextUser.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        // First sign-in for an account created outside the app.
        const seed: Omit<UserProfile, 'createdAt'> = {
          uid: nextUser.uid,
          name: nextUser.displayName || nextUser.email?.split('@')[0] || 'Student',
          email: nextUser.email || '',
          role: 'student',
          photoURL: nextUser.photoURL,
        };
        await setDoc(ref, { ...seed, createdAt: serverTimestamp() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Live profile so an admin role change / block takes effect immediately.
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setProfile({ uid: snap.id, ...(snap.data() as Omit<UserProfile, 'uid'>) });
      }
      setLoading(false);
    }, (err) => {
      // Expected for a moment after sign-out (the listener outlives the auth
      // token) or when Firestore rules are not published yet.
      if (err.code !== 'permission-denied') console.warn('Profile listener:', err.code);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
      phone,
    }: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name,
        email,
        phone: phone || '',
        role: 'student',
        blocked: false,
        createdAt: serverTimestamp(),
      });
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      signUp,
      signIn,
      logout,
      resetPassword,
    }),
    [user, profile, loading, signUp, signIn, logout, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
