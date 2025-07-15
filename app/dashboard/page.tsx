'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-lg">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return; // Still loading session

    if (!session) {
      router.push('/login');
      return;
    }

    const redirectToDashboard = async () => {
      setIsRedirecting(true);
      
      try {
        const response = await fetch('/api/user/account-type');
        const data = await response.json();
        
        if (data.accountType === 'recruiter') {
          router.push('/dashboard/recruiter');
        } else if (data.accountType === 'candidate') {
          router.push('/dashboard/candidate');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      }
    };

    redirectToDashboard();
  }, [session, status, router]);

  // Always show loading state
  return <DashboardLoading />;
}
