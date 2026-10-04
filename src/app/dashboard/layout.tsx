'use client';

import { CreditCard, LayoutDashboard, Library, User } from 'lucide-react';
import { DashboardShell, type NavLink } from '@/components/dashboard/Shell';

const LINKS: NavLink[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'My Courses', href: '/dashboard/my-courses', icon: Library },
  { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell links={LINKS} title="Student Dashboard">
      {children}
    </DashboardShell>
  );
}
