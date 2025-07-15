'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push('/login');
      return;
    }

    const userRole = session.user?.accountType;

    if (userRole === 'recruiter') {
      router.push('/recruiter/profile');
    } else if (userRole === 'candidate') {
      router.push('/candidate/profile');
    } else {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-lg">Redirecting to your profile...</p>
      </div>
    </div>
  );
}
