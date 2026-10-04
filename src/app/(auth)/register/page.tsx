'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Button, Field, Input, PageLoader } from '@/components/ui';

/**
 * Maps a Firebase error to a message for the form. Only the error *code* is
 * ever shown — never the request payload, so the password cannot leak.
 */
function registerErrorMessage(err: unknown): string {
  const code =
    err instanceof FirebaseError
      ? err.code
      : typeof err === 'object' && err && 'code' in err
        ? String((err as { code: unknown }).code)
        : '';
  const raw = err instanceof Error ? err.message : '';

  if (code === 'auth/email-already-in-use' || raw.includes('EMAIL_EXISTS'))
    return 'This email is already registered. Please login instead.';
  if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
  if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
  if (code === 'auth/operation-not-allowed' || raw.includes('OPERATION_NOT_ALLOWED'))
    return 'Email/password registration is not enabled in Firebase.';

  return code
    ? `Registration failed. Firebase error code: ${code}`
    : 'Registration failed. Please try again.';
}

function RegisterForm() {
  const { signUp, logout } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = params.get('next') || '/dashboard';

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      // Firebase signs the new user in automatically; sign out so they log in
      // themselves on the login page.
      await logout();
      toast('Account created successfully! Please log in.', 'success');
      const qs = new URLSearchParams({ registered: '1' });
      if (params.get('next')) qs.set('next', next);
      router.push(`/login?${qs.toString()}`);
    } catch (err) {
      setError(registerErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
        Create your student account
      </h1>
      <p className="mt-2 text-[14px] text-slate-500">
        It takes less than a minute and it is completely free.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Full Name" required>
          <Input value={form.name} onChange={set('name')} placeholder="Your full name" required />
        </Field>

        <Field label="Email Address" required>
          <Input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </Field>

        <Field label="Phone Number" hint="So our advisors can reach you about batches and fees.">
          <Input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="10-digit mobile number"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" required>
            <div className="relative">
              <Input
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="At least 6 characters"
                autoComplete="new-password"
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

          <Field label="Confirm Password" required>
            <Input
              type={show ? 'text' : 'password'}
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Repeat password"
              autoComplete="new-password"
              required
            />
          </Field>
        </div>

        <Button type="submit" loading={busy} size="lg" className="w-full">
          {!busy && <UserPlus size={16} />} Create account
        </Button>

        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-[13.5px] text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RegisterForm />
    </Suspense>
  );
}
