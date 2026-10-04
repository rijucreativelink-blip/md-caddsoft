'use client';

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Send } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/providers/ToastProvider';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';

export function EnquiryForm({
  options,
  source = 'home',
  title = 'Register for course',
  submitLabel = 'REGISTER',
}: {
  options: string[];
  source?: 'home' | 'career' | 'contact';
  title?: string;
  submitLabel?: string;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    courseCategory: '',
    message: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast('Name, phone number and email address are required.', 'error');
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, 'enquiries'), {
        ...form,
        source,
        handled: false,
        createdAt: serverTimestamp(),
      });
      toast('Thank you! Your enquiry has been registered. Our advisor will call you shortly.', 'success');
      setForm({ name: '', phone: '', email: '', courseCategory: '', message: '' });
    } catch {
      toast('Could not submit right now. Please call us on +91-9612909791.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface p-6 sm:p-8">
      <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-500">
        Fill in your details and an advisor will get in touch within one working day.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <Input value={form.name} onChange={set('name')} placeholder="Your full name" required />
        </Field>
        <Field label="Phone Number" required>
          <Input
            value={form.phone}
            onChange={set('phone')}
            type="tel"
            inputMode="tel"
            placeholder="10-digit mobile number"
            required
          />
        </Field>
        <Field label="Email Address" required className="sm:col-span-2">
          <Input
            value={form.email}
            onChange={set('email')}
            type="email"
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="Select Course Category" className="sm:col-span-2">
          <Select value={form.courseCategory} onChange={set('courseCategory')}>
            <option value="">Select Course Category</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Your Message" className="sm:col-span-2">
          <Textarea
            value={form.message}
            onChange={set('message')}
            placeholder="Tell us what you would like to learn…"
          />
        </Field>
      </div>

      <Button type="submit" loading={busy} size="lg" className="mt-6 w-full">
        {!busy && <Send size={16} />}
        {submitLabel}
      </Button>
    </form>
  );
}
