'use client';

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Send } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/providers/ToastProvider';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';

const INVESTMENT_RANGES = [
  'Below ₹2,00,000',
  '₹2,00,000 - ₹5,00,000',
  '₹5,00,000 - ₹10,00,000',
  '₹10,00,000 - ₹20,00,000',
  'Above ₹20,00,000',
];

const BUSINESS_CATEGORIES = [
  'Training Centre',
  'Education Consultancy',
  'IT Services',
  'Engineering Services',
  'Other',
];

const REFERRALS = [
  'Google / Web search',
  'Social media',
  'Friend or relative',
  'Newspaper / Advertisement',
  'Existing franchisee',
  'Other',
];

const EMPTY = {
  name: '',
  qualification: '',
  phone: '',
  email: '',
  address: '',
  occupation: '',
  field: '',
  businessCategory: '',
  location: '',
  investmentRange: '',
  otherInfo: '',
  referral: '',
  queries: '',
};

export function FranchiseForm() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const set =
    (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'franchiseApplications'), {
        ...form,
        handled: false,
        createdAt: serverTimestamp(),
      });
      toast('Application submitted. Our franchise team will contact you shortly.', 'success');
      setForm(EMPTY);
    } catch {
      toast('Could not submit right now. Please call us on +91-9612909791.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface p-6 sm:p-9">
      <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
        Apply for Franchise @ Free of Cost
      </h3>
      <p className="mt-1.5 text-sm text-slate-500">
        No franchise fee. Tell us about yourself and the location you have in mind.
      </p>

      <fieldset className="mt-8">
        <legend className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
          Personal Info
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <Input value={form.name} onChange={set('name')} required placeholder="Your full name" />
          </Field>
          <Field label="Qualification" required>
            <Input
              value={form.qualification}
              onChange={set('qualification')}
              required
              placeholder="e.g. B.Tech Civil"
            />
          </Field>
          <Field label="Phone Number" required>
            <Input value={form.phone} onChange={set('phone')} type="tel" required placeholder="Mobile number" />
          </Field>
          <Field label="Email Address" required>
            <Input value={form.email} onChange={set('email')} type="email" required placeholder="you@example.com" />
          </Field>
          <Field label="Address" required className="sm:col-span-2">
            <Textarea
              value={form.address}
              onChange={set('address')}
              required
              className="min-h-20"
              placeholder="Full postal address"
            />
          </Field>
          <Field label="Job / Business" required>
            <Input
              value={form.occupation}
              onChange={set('occupation')}
              required
              placeholder="Current occupation"
            />
          </Field>
          <Field label="In Which Field" required>
            <Input value={form.field} onChange={set('field')} required placeholder="Industry / sector" />
          </Field>
          <Field label="Category of Business" required className="sm:col-span-2">
            <Select value={form.businessCategory} onChange={set('businessCategory')} required>
              <option value="">Select a category</option>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-9">
        <legend className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
          Franchise Info
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Interested Location" required>
            <Input
              value={form.location}
              onChange={set('location')}
              required
              placeholder="City / district / state"
            />
          </Field>
          <Field label="Investment Range" required>
            <Select value={form.investmentRange} onChange={set('investmentRange')} required>
              <option value="">Select a range</option>
              {INVESTMENT_RANGES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Other Info" required className="sm:col-span-2">
            <Textarea
              value={form.otherInfo}
              onChange={set('otherInfo')}
              required
              className="min-h-20"
              placeholder="Space available, existing setup, team, timeline…"
            />
          </Field>
          <Field
            label="How did you get to know about CADD Software Training Services Franchise?"
            required
            className="sm:col-span-2"
          >
            <Select value={form.referral} onChange={set('referral')} required>
              <option value="">Select an option</option>
              {REFERRALS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Any Queries?" required className="sm:col-span-2">
            <Textarea
              value={form.queries}
              onChange={set('queries')}
              required
              placeholder="Anything you would like to ask us"
            />
          </Field>
        </div>
      </fieldset>

      <Button type="submit" loading={busy} size="lg" className="mt-8 w-full sm:w-auto">
        {!busy && <Send size={16} />}
        Submit
      </Button>
    </form>
  );
}
