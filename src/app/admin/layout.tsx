'use client';

import { useEffect, useState } from 'react';
import {
  BookMarked,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Store,
  Users,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DashboardShell, type NavLink } from '@/components/dashboard/Shell';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [pendingPayments, setPendingPayments] = useState(0);
  const [newEnquiries, setNewEnquiries] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    const a = onSnapshot(
      query(collection(db, 'payments'), where('status', '==', 'pending')),
      (snap) => setPendingPayments(snap.size),
      () => setPendingPayments(0),
    );
    const b = onSnapshot(
      query(collection(db, 'enquiries'), where('handled', '==', false)),
      (snap) => setNewEnquiries(snap.size),
      () => setNewEnquiries(0),
    );
    return () => {
      a();
      b();
    };
  }, [isAdmin]);

  const links: NavLink[] = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Courses', href: '/admin/courses', icon: BookMarked },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard, badge: pendingPayments },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare, badge: newEnquiries },
    { label: 'Franchise', href: '/admin/franchise', icon: Store },
    { label: 'Payment Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <DashboardShell links={links} title="Admin Dashboard" requireAdmin>
      {children}
    </DashboardShell>
  );
}
