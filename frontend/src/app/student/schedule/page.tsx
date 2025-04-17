'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ClassSchedule from '@/components/schedule/ClassSchedule';

export default function SchedulePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Course Schedule</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-gray-600">
          View your class schedule for the Jan-May 2025 session. You can filter by day to see your classes.
          The system will also show your upcoming classes to help you stay on track.
        </p>
      </div>
      
      <ClassSchedule />
    </div>
  );
}
