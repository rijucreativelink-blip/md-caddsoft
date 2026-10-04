import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { cloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

type UploadKind = 'payment-proof' | 'course-video' | 'course-thumbnail' | 'payment-qr';

const FOLDERS: Record<UploadKind, string> = {
  'payment-proof': 'cadd/payment-proofs',
  'course-video': 'cadd/course-videos',
  'course-thumbnail': 'cadd/course-thumbnails',
  'payment-qr': 'cadd/payment-qr',
};

/** Uploads only an admin may perform. */
const ADMIN_ONLY: UploadKind[] = ['course-video', 'course-thumbnail', 'payment-qr'];

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!idToken) {
      return NextResponse.json({ error: 'Missing authentication token.' }, { status: 401 });
    }

    const decoded = await adminAuth().verifyIdToken(idToken);

    const body = (await request.json()) as { kind?: UploadKind };
    const kind = body.kind;
    if (!kind || !(kind in FOLDERS)) {
      return NextResponse.json({ error: 'Unknown upload kind.' }, { status: 400 });
    }

    if (ADMIN_ONLY.includes(kind)) {
      const profile = await adminDb().collection('users').doc(decoded.uid).get();
      if (profile.data()?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
      }
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = FOLDERS[kind];

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET as string,
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not sign the upload.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
