'use client';

import { auth } from '@/lib/firebase';

export type UploadKind = 'payment-proof' | 'course-video' | 'course-thumbnail' | 'payment-qr';

export interface UploadResult {
  url: string;
  publicId: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  bytes: number;
  format: string;
  resourceType: string;
}

interface SignResponse {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
  error?: string;
}

/**
 * Uploads a file straight to Cloudinary using a short-lived signature minted by
 * our own API route (which checks the Firebase session and the admin role).
 * `onProgress` receives 0-100.
 */
export async function uploadToCloudinary(
  file: File,
  kind: UploadKind,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to upload.');

  const idToken = await user.getIdToken();

  const signRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ kind }),
  });

  const sign = (await signRes.json()) as SignResponse;
  if (!signRes.ok) throw new Error(sign.error || 'Could not prepare the upload.');

  const resourceType = kind === 'course-video' ? 'video' : 'image';
  const endpoint = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`;

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);

  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error(data?.error?.message || 'Upload failed.'));
          return;
        }
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          durationSeconds: data.duration ? Math.round(data.duration) : undefined,
          width: data.width,
          height: data.height,
          bytes: data.bytes,
          format: data.format,
          resourceType: data.resource_type,
        });
      } catch {
        reject(new Error('Unexpected response from Cloudinary.'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error while uploading.'));
    xhr.send(form);
  });
}
