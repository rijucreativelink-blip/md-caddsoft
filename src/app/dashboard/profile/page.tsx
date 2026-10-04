'use client';

import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { KeyRound, Save } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Button, Field, Input, PageLoader } from '@/components/ui';
import { formatDate, initials } from '@/lib/utils';

export default function ProfilePage() {
  const { user, profile, resetPassword } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', phone: '', city: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', phone: profile.phone || '', city: profile.city || '' });
    }
  }, [profile]);

  if (!user || !profile) return <PageLoader />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
      });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: form.name.trim() });
      }
      toast('Profile updated.', 'success');
    } catch {
      toast('Could not save your profile. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="surface flex items-center gap-4 p-6">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 font-display text-xl font-extrabold text-white">
          {initials(profile.name)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-bold text-slate-900 dark:text-white">
            {profile.name}
          </h2>
          <p className="truncate text-[13.5px] text-slate-500">{profile.email}</p>
          <p className="mt-1 text-[12px] text-slate-400">
            Member since {formatDate(profile.createdAt)} · Role:{' '}
            <span className="font-semibold uppercase">{profile.role}</span>
          </p>
        </div>
      </div>

      <form onSubmit={onSave} className="surface p-6">
        <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
          Account details
        </h3>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" required className="sm:col-span-2">
            <Input value={form.name} onChange={set('name')} required />
          </Field>
          <Field label="Email Address" hint="Email cannot be changed here.">
            <Input value={profile.email} disabled />
          </Field>
          <Field label="Phone Number">
            <Input value={form.phone} onChange={set('phone')} type="tel" placeholder="Mobile number" />
          </Field>
          <Field label="City" className="sm:col-span-2">
            <Input value={form.city} onChange={set('city')} placeholder="e.g. Agartala" />
          </Field>
        </div>

        <Button type="submit" loading={busy} className="mt-6">
          {!busy && <Save size={16} />} Save changes
        </Button>
      </form>

      <div className="surface p-6">
        <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
          Password
        </h3>
        <p className="mt-1.5 text-[13.5px] text-slate-500">
          We will email you a secure link to set a new password.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={async () => {
            try {
              await resetPassword(profile.email);
              toast('Password reset link sent to your email.', 'success');
            } catch {
              toast('Could not send the reset link.', 'error');
            }
          }}
        >
          <KeyRound size={16} /> Send password reset link
        </Button>
      </div>
    </div>
  );
}
