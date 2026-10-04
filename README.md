# CADD Software Training Services — Next.js Platform

A full rebuild of **caddsoftware.in** in Next.js 15 (App Router) + TypeScript + Tailwind CSS +
Firebase, with an online course marketplace, manual UPI payment verification, Cloudinary video
hosting, and separate student and admin dashboards.

All copy from the original site has been carried across verbatim — About, Training Methodology,
the five CADD programs with every software description and topic list, Contact, Franchise, Career
and Student Verification. The design is new.

---

## 1. What is in here

### Public site

| Route | Content |
| --- | --- |
| `/` | Hero, "What We Help You Do", programs grid, software marquee, Foundation banner + enquiry form |
| `/about` | About CADD Software, why this institute, who can benefit, vision/mission/commitment |
| `/training-methodology` | All six methodology sections with a sticky index |
| `/programs/[slug]` | Civil, Mechanical, Project Management, Electrical, Architecture — each with a tabbed software reference |
| `/courses` | Live catalog from Firestore, with search, category / level filters and sorting |
| `/courses/[slug]` | Course detail, curriculum, outcomes, syllabus, price and enroll button |
| `/checkout/[courseId]` | QR / UPI payment, UTR entry, screenshot upload |
| `/contact` | Contact cards, embedded map, message form |
| `/franchise` | Franchise benefits + the full free-franchise application form |
| `/career` | Foundation courses, "Register your Query" form, vision/mission |
| `/verification` | Certificate lookup by registration number |
| `/login`, `/register` | Firebase email/password auth |

### Student dashboard — `/dashboard`

- Overview with stats, pending-payment alerts and "continue learning"
- **My Courses** — every course whose payment has been approved
- **Learn** — video player, curriculum sidebar, per-lesson progress tracking
- **Payments** — status of every submitted payment, with the admin's note
- **Profile** — edit details, send a password reset link

### Admin dashboard — `/admin`

- Overview with revenue, pending queue and recent courses
- **Courses** — create / edit / publish / delete, upload thumbnails
- **Lessons** — upload videos straight to Cloudinary, reorder, mark free previews
- **Payments** — see the screenshot and UTR side by side, approve (unlocks the course
  automatically) or reject with a reason
- **Students** — search, promote to admin, block
- **Enquiries** and **Franchise** — every form submission, markable as handled
- **Payment Settings** — upload the UPI QR code, set the UPI ID, bank details and instructions

---

## 2. Setup

### Prerequisites

- Node.js 18.18+ (this project was verified on Node 24)
- A Firebase project
- A Cloudinary account

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

**Firebase client** — Firebase console → Project settings → General → Your apps → Web app → SDK
setup and configuration. Copy the six `NEXT_PUBLIC_FIREBASE_*` values.

**Firebase Admin** — Firebase console → Project settings → Service accounts → *Generate new
private key*. From the downloaded JSON take `project_id`, `client_email` and `private_key`. Keep
the `\n` escapes in the private key and wrap the whole value in double quotes.

**Cloudinary** — Cloudinary dashboard → Product Environment Credentials. `CLOUD_NAME` is public;
the API key and secret stay server-side.

### Firebase console setup

1. **Authentication** → Sign-in method → enable **Email/Password**.
2. **Firestore Database** → Create database (production mode, region `asia-south1` is closest).
3. **Rules** → paste the contents of `firestore.rules` and publish.
4. **Indexes** → the catalog query needs one composite index on `courses`
   (`published` ASC, `createdAt` DESC). Either deploy it with the Firebase CLI:

   ```bash
   npx firebase deploy --only firestore:rules,firestore:indexes
   ```

   …or open `/courses` once and follow the index-creation link Firestore prints in the browser
   console.

### Seed starter data

```bash
npm run seed
```

This creates six published courses, writes the default payment settings, adds a sample certificate
(`CSTS/2024/0001`) and — if `SEED_ADMIN_EMAIL` is set — promotes that account to admin.

> Register the admin email at `/register` **first**, then run the seed so it has an account to
> promote. You can also flip the `role` field to `admin` by hand in the Firestore console.

### Run

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## 3. The payment flow

```
Student                          Admin
───────                          ─────
1. Opens /checkout/<courseId>
2. Scans the QR / taps the UPI
   deep-link and pays
3. Enters the UTR number
4. Uploads the payment
   screenshot  ──────────────►   5. Sees it in /admin/payments,
                                    screenshot and UTR side by side
                                 6. Approves  ─┐
                                               │ creates enrollments/<uid>_<courseId>
                                               │ with active: true
7. Course appears in            ◄──────────────┘
   /dashboard/my-courses and
   all video lessons unlock
```

Payments live at the deterministic id `<uid>_<courseId>`, so a student can never create two
pending payments for the same course. A rejected payment can be resubmitted from
`/dashboard/payments`; the security rules permit that single `rejected → pending` transition and
nothing else.

---

## 4. Video hosting

Videos and images never pass through the Next.js server. The browser asks
`POST /api/cloudinary/sign` for a short-lived signature; that route verifies the caller's Firebase
ID token and, for videos, thumbnails and the payment QR, checks that the caller's `users/<uid>`
document has `role: 'admin'`. The upload then goes browser → Cloudinary directly, with a progress
bar.

Uploads are foldered by kind:

| Kind | Folder | Who may upload |
| --- | --- | --- |
| `payment-proof` | `cadd/payment-proofs` | any signed-in student |
| `course-video` | `cadd/course-videos` | admin only |
| `course-thumbnail` | `cadd/course-thumbnails` | admin only |
| `payment-qr` | `cadd/payment-qr` | admin only |

---

## 5. Firestore data model

```
users/{uid}                     name, email, phone, role: student|admin, blocked, createdAt
courses/{courseId}              title, slug, category, software, price, mrp, level,
                                shortDescription, description, outcomes[], syllabus[],
                                durationWeeks, thumbnailUrl, published, studentsCount
  lessons/{lessonId}            title, description, videoUrl, videoPublicId,
                                durationSeconds, order, isFreePreview, resourceUrl
payments/{uid}_{courseId}       userId, userName, userEmail, courseId, courseTitle, amount,
                                utr, screenshotUrl, status, note, adminNote, reviewedAt/By
enrollments/{uid}_{courseId}    userId, courseId, paymentId, active, enrolledAt,
                                progress: { lessonId: true }
settings/payment                upiId, accountName, qrImageUrl, bankName, accountNumber,
                                ifsc, instructions, supportPhone
certificates/{registrationNo}   registrationNo, studentName, courseName, grade, issuedOn, valid
enquiries/{id}                  name, phone, email, courseCategory, message, source, handled
franchiseApplications/{id}      the full franchise form, plus handled
```

`certificates` is public-read so the verification page works without a login; write access is
admin-only. Add certificates from the Firestore console using the registration number as the
document id.

---

## 6. Project layout

```
src/
  app/
    (marketing)/       public site, shares Header + Footer
    (auth)/            login, register — split-screen layout
    dashboard/         student area, guarded by DashboardShell
    admin/             admin area, guarded by DashboardShell requireAdmin
    api/cloudinary/    signed-upload endpoint
  components/
    site/              Header, Footer, forms, course cards, checkout
    dashboard/         Shell, LearnPlayer, CourseEditor, LessonManager
    providers/         AuthProvider, ToastProvider
    ui/                Button, Input, Field, Badge, Section, FileUpload, …
  content/
    site.ts            every piece of copy from the original site
    programs.ts        the five programs and all software descriptions
    nav.ts             header and footer navigation
  lib/
    firebase.ts        client SDK (lazily initialised)
    firebase-admin.ts  admin SDK (lazily initialised)
    queries.ts         typed Firestore readers and live subscriptions
    upload.ts          Cloudinary direct upload
    types.ts, utils.ts
firestore.rules        security rules — paste into the Firebase console
scripts/seed.ts        starter data
```

---

## 7. Deploying

Vercel is the straightforward route:

1. Push the repo to GitHub and import it into Vercel.
2. Add every variable from `.env.local` under Project Settings → Environment Variables.
   `FIREBASE_PRIVATE_KEY` must keep its `\n` escapes.
3. Deploy. `npm run build` is already verified clean.
4. Firebase console → Authentication → Settings → Authorized domains → add your production domain.

---

## 8. Notes

- Without the `NEXT_PUBLIC_FIREBASE_*` variables the site still runs — auth is skipped and the
  course catalog shows its empty state — so you can review the design before wiring Firebase up.
- The admin role is stored on `users/{uid}.role` and enforced in the Firestore rules, in the
  upload-signing route, and in the dashboard shell.
- `studentsCount` is incremented best-effort on approval; it is a display counter, not a source of
  truth.
