'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Button, Field, Input, PageLoader } from '@/components/ui';

function friendlyError(code: string) {
  if (code.includes('invalid-credential') || code.includes('wrong-password'))
    return 'Incorrect email or password.';
  if (code.includes('user-not-found')) return 'No account found for that email address.';
  if (code.includes('too-many-requests'))
    return 'Too many attempts. Please wait a few minutes and try again.';
  if (code.includes('invalid-email')) return 'That email address does not look valid.';
  if (code.includes('network')) return 'Network problem. Check your connection and try again.';
  if (code.includes('configuration-not-found') || code.includes('operation-not-allowed'))
    return 'Email/Password sign-in is not enabled in Firebase (Authentication → Sign-in method).';
  if (code.includes('api-key')) return 'The Firebase API key is invalid or restricted.';
  return 'Could not sign you in. Please try again.' + (code ? ` (${code})` : '');
}

function LoginForm() {
  const { signIn, resetPassword } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const next = params.get('next') || '/dashboard';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      toast('Welcome back!', 'success');
      // Admins land on the admin dashboard unless a specific page was requested.
      let dest = next;
      if (!params.get('next') && auth.currentUser) {
        try {
          const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (snap.data()?.role === 'admin') dest = '/admin';
        } catch {
          // Profile unreadable (e.g. rules not published) — fall back to /dashboard.
        }
      }
      router.push(dest);
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      toast(friendlyError(code), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function onForgot() {
    if (!email.trim()) {
      toast('Enter your email address first, then click "Forgot password".', 'info');
      return;
    }
    try {
      await resetPassword(email.trim());
      toast('Password reset link sent. Check your inbox.', 'success');
    } catch {
      toast('Could not send a reset link for that address.', 'error');
    }
  }

  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
        Log in to your account
      </h1>
      <p className="mt-2 text-[14px] text-slate-500">
        Access your courses, lessons and payment status.
      </p>

      {params.get('registered') && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          Your account was created successfully. Please log in.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Email Address" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </Field>

        <Field label="Password" required>
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgot}
            className="text-[13px] font-semibold text-brand-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" loading={busy} size="lg" className="w-full">
          {!busy && <LogIn size={16} />} Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-[13.5px] text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Create one free
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginForm />
    </Suspense>
  );
}
