'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import FacultyNavbar from '@/components/layout/FacultyNavbar';

interface FacultyLayoutProps {
  children: ReactNode;
}

export default function FacultyLayout({ children }: FacultyLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Check if user is logged in and is a faculty member
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'faculty') {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <FacultyNavbar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
