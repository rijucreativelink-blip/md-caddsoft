'use client';

import { useEffect, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Info, QrCode, Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { PaymentSettings } from '@/lib/types';
import { DEFAULT_PAYMENT_SETTINGS, fetchPaymentSettings } from '@/lib/queries';
import { useToast } from '@/components/providers/ToastProvider';
import { Button, Field, Input, PageLoader, Textarea } from '@/components/ui';
import { FileUpload } from '@/components/ui/FileUpload';

export default function AdminPaymentSettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchPaymentSettings().then(setSettings);
  }, []);

  if (!settings) return <PageLoader label="Loading payment settings…" />;

  function set<K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setBusy(true);
    try {
      await setDoc(
        doc(db, 'settings', 'payment'),
        { ...settings, updatedAt: serverTimestamp() },
        { merge: true },
      );
      toast('Payment settings saved. Students see the new QR immediately.', 'success');
    } catch {
      toast('Could not save the payment settings.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="max-w-4xl space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-900 dark:bg-brand-950/40">
        <Info size={19} className="mt-0.5 shrink-0 text-brand-600" />
        <p className="text-[13.5px] leading-relaxed text-brand-900 dark:text-brand-200">
          These details appear on every course checkout page. A student scans the QR code, pays,
          then submits the UTR number and a screenshot — which you approve under{' '}
          <strong>Payments</strong>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="surface h-fit p-6">
          <h2 className="flex items-center gap-2 font-display text-[15px] font-bold text-slate-900 dark:text-white">
            <QrCode size={17} className="text-brand-600" /> Payment QR code
          </h2>
          <p className="mt-1.5 text-[13px] text-slate-500">
            Upload the UPI QR image from your bank or payment app.
          </p>
          <FileUpload
            kind="payment-qr"
            accept="image/*"
            label="QR code image"
            hint="PNG or JPG, square, max 5 MB"
            maxMb={5}
            className="mt-5"
            value={settings.qrImageUrl}
            onUploaded={(r) => set('qrImageUrl', r.url)}
            onClear={() => set('qrImageUrl', '')}
          />
        </section>

        <div className="space-y-6">
          <section className="surface p-6">
            <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              UPI details
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="UPI ID" hint="Shown with a copy button and used for the UPI deep-link.">
                <Input
                  value={settings.upiId}
                  onChange={(e) => set('upiId', e.target.value)}
                  placeholder="yourbusiness@okhdfcbank"
                />
              </Field>
              <Field label="Payee / Account Name" required>
                <Input
                  value={settings.accountName}
                  onChange={(e) => set('accountName', e.target.value)}
                  required
                />
              </Field>
              <Field label="Support Phone">
                <Input
                  value={settings.supportPhone ?? ''}
                  onChange={(e) => set('supportPhone', e.target.value)}
                  placeholder="+91-9612909791"
                />
              </Field>
            </div>
          </section>

          <section className="surface p-6">
            <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              Bank transfer (optional)
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Leave blank to hide the bank block on checkout.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Field label="Bank Name">
                <Input
                  value={settings.bankName ?? ''}
                  onChange={(e) => set('bankName', e.target.value)}
                />
              </Field>
              <Field label="Account Number">
                <Input
                  value={settings.accountNumber ?? ''}
                  onChange={(e) => set('accountNumber', e.target.value)}
                />
              </Field>
              <Field label="IFSC">
                <Input
                  value={settings.ifsc ?? ''}
                  onChange={(e) => set('ifsc', e.target.value)}
                  className="uppercase"
                />
              </Field>
            </div>
          </section>

          <section className="surface p-6">
            <h2 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              Instructions for students
            </h2>
            <Field label="Checkout instructions" className="mt-5">
              <Textarea
                value={settings.instructions}
                onChange={(e) => set('instructions', e.target.value)}
                className="min-h-32"
                placeholder={DEFAULT_PAYMENT_SETTINGS.instructions}
              />
            </Field>
          </section>

          <Button type="submit" loading={busy} size="lg">
            {!busy && <Save size={16} />} Save payment settings
          </Button>
        </div>
      </div>
    </form>
  );
}
