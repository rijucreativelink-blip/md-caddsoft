'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, LayoutDashboard, Library, User } from 'lucide-react';
import { DashboardShell, type NavLink } from '@/components/dashboard/Shell';
import { useAuth } from '@/components/providers/AuthProvider';

const LINKS: NavLink[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'My Courses', href: '/dashboard/my-courses', icon: Library },
  { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  // Admins belong on the admin dashboard, not the student one.
  useEffect(() => {
    if (!loading && isAdmin) router.replace('/admin');
  }, [loading, isAdmin, router]);

  return (
    <DashboardShell links={LINKS} title="Student Dashboard">
      {children}
    </DashboardShell>
  );
}
