'use client';

import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { BadgeCheck, Search, ShieldAlert } from 'lucide-react';
import { db } from '@/lib/firebase';
import { Button, Field, Input } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { StudentCertificate } from '@/lib/types';

type Result = { state: 'idle' } | { state: 'found'; data: StudentCertificate } | { state: 'missing' };

export function VerificationForm() {
  const [regNo, setRegNo] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>({ state: 'idle' });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const key = regNo.trim().toUpperCase();
    if (!key) return;

    setBusy(true);
    setResult({ state: 'idle' });
    try {
      const snap = await getDoc(doc(db, 'certificates', key));
      if (snap.exists()) {
        setResult({
          state: 'found',
          data: { id: snap.id, ...(snap.data() as Omit<StudentCertificate, 'id'>) },
        });
      } else {
        setResult({ state: 'missing' });
      }
    } catch {
      setResult({ state: 'missing' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface p-7 sm:p-9">
      <form onSubmit={onSubmit} className="space-y-5">
        <Field
          label="Enter Registration No"
          required
          hint="The registration number is printed on your certificate, next to the hologram."
        >
          <Input
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            placeholder="e.g. CSTS/2024/0142"
            className="uppercase"
            required
          />
        </Field>
        <Button type="submit" loading={busy} size="lg" className="w-full">
          {!busy && <Search size={16} />}
          Verify Certificate
        </Button>
      </form>

      {result.state === 'found' && (
        <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 animate-fade-up dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
            <BadgeCheck size={22} />
            <h3 className="font-display text-lg font-bold">
              {result.data.valid ? 'Certificate Verified' : 'Certificate Found — Not Valid'}
            </h3>
          </div>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            {[
              ['Registration No', result.data.registrationNo || result.data.id],
              ['Student Name', result.data.studentName],
              ['Course', result.data.courseName],
              ['Grade', result.data.grade || '—'],
              ['Issued On', formatDate(result.data.issuedOn)],
              ['Status', result.data.valid ? 'Valid' : 'Revoked'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-emerald-700/70 dark:text-emerald-400/70">
                  {k}
                </dt>
                <dd className="mt-0.5 font-medium text-emerald-900 dark:text-emerald-100">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {result.state === 'missing' && (
        <div className="mt-7 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 animate-fade-up dark:border-amber-900 dark:bg-amber-950/40">
          <ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" />
          <div>
            <h3 className="font-display text-base font-bold text-amber-900 dark:text-amber-200">
              No record found
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-amber-800 dark:text-amber-300">
              We could not find a certificate for that registration number. Please re-check the
              number exactly as printed, or call us on +91-9612909791 / +91-9383040112.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
