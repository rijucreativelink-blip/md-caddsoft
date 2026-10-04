'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, FileVideo, ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { uploadToCloudinary, type UploadKind, type UploadResult } from '@/lib/upload';
import { useToast } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';

export function FileUpload({
  kind,
  accept,
  label,
  hint,
  value,
  onUploaded,
  onClear,
  maxMb = 25,
  className,
}: {
  kind: UploadKind;
  accept: string;
  label: string;
  hint?: string;
  value?: string;
  onUploaded: (result: UploadResult) => void;
  onClear?: () => void;
  maxMb?: number;
  className?: string;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const isVideo = kind === 'course-video';

  async function handleFile(file?: File | null) {
    if (!file) return;

    if (file.size > maxMb * 1024 * 1024) {
      toast(`File is too large. Maximum size is ${maxMb} MB.`, 'error');
      return;
    }

    setBusy(true);
    setProgress(0);
    try {
      const result = await uploadToCloudinary(file, kind, setProgress);
      onUploaded(result);
      toast('Upload complete.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setBusy(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={className}>
      <span className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            {isVideo ? (
              <span className="grid h-16 w-24 shrink-0 place-items-center rounded-lg bg-ink-900 text-white">
                <FileVideo size={22} />
              </span>
            ) : (
              <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-white">
                <Image src={value} alt={label} fill sizes="96px" className="object-contain" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={14} /> Uploaded
              </p>
              <p className="mt-0.5 truncate text-[11.5px] text-emerald-700/80 dark:text-emerald-400/70">
                {value}
              </p>
            </div>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="rounded-lg p-1.5 text-emerald-700 transition hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!busy) handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => !busy && inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-5 py-8 text-center transition',
            dragging
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
              : 'border-slate-300 bg-slate-50/60 hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-brand-950/20',
            busy && 'pointer-events-none opacity-80',
          )}
        >
          {busy ? (
            <>
              <Loader2 size={22} className="animate-spin text-brand-600" />
              <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                Uploading… {progress}%
              </p>
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60">
                {isVideo ? <FileVideo size={20} /> : <ImageIcon size={20} />}
              </span>
              <p className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-200">
                <span className="text-brand-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-[12px] text-slate-500">{hint ?? `Max ${maxMb} MB`}</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {!value && !busy && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-600 hover:underline"
        >
          <Upload size={13} /> Choose file
        </button>
      )}
    </div>
  );
}
