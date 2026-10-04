export type Role = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  photoURL?: string | null;
  city?: string;
  createdAt?: number;
  blocked?: boolean;
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;          // Civil CADD | Mechanical CADD | ...
  software?: string;         // AutoCAD, Revit ...
  shortDescription: string;
  description: string;
  outcomes: string[];
  syllabus: string[];
  price: number;
  mrp?: number;
  durationWeeks?: number;
  level: CourseLevel;
  language?: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  certificate?: boolean;
  published: boolean;
  studentsCount?: number;
  rating?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  videoUrl: string;
  videoPublicId?: string;
  durationSeconds?: number;
  order: number;
  isFreePreview?: boolean;
  resourceUrl?: string;
  createdAt?: number;
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  utr: string;
  screenshotUrl: string;
  status: PaymentStatus;
  note?: string;
  adminNote?: string;
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

export interface Enrollment {
  id: string;              // `${userId}_${courseId}`
  userId: string;
  courseId: string;
  courseTitle: string;
  paymentId: string;
  active: boolean;
  enrolledAt: number;
  progress?: Record<string, boolean>;
}

export interface PaymentSettings {
  upiId: string;
  accountName: string;
  qrImageUrl: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  instructions: string;
  supportPhone?: string;
  updatedAt?: number;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  courseCategory: string;
  message: string;
  source: 'home' | 'career' | 'contact';
  handled?: boolean;
  createdAt: number;
}

export interface FranchiseApplication {
  id: string;
  name: string;
  qualification: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  field: string;
  businessCategory: string;
  location: string;
  investmentRange: string;
  otherInfo?: string;
  referral?: string;
  queries?: string;
  handled?: boolean;
  createdAt: number;
}

export interface StudentCertificate {
  id: string;              // registration number
  registrationNo: string;
  studentName: string;
  courseName: string;
  grade?: string;
  issuedOn: number;
  valid: boolean;
}
