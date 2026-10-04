'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Button, Field, Input, PageLoader } from '@/components/ui';

function friendlyError(code: string) {
  if (code.includes('email-already-in-use'))
    return 'An account with that email already exists. Try logging in.';
  if (code.includes('weak-password')) return 'Password is too weak — use at least 6 characters.';
  if (code.includes('invalid-email')) return 'That email address does not look valid.';
  return 'Could not create your account. Please try again.';
}

function RegisterForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const next = params.get('next') || '/dashboard';

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password.length < 6) {
      toast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (form.password !== form.confirm) {
      toast('The two passwords do not match.', 'error');
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
      toast('Account created. Welcome to CADD Software!', 'success');
      router.push(next);
    } catch (err) {
      toast(friendlyError(err instanceof Error ? err.message : ''), 'error');
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
