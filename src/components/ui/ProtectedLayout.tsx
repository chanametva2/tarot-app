'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ReactNode } from 'react';

interface ProtectedLayoutProps {
  children: ReactNode;
  allowedRoles?: ('user' | 'admin')[];
}

export function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900">
        <div className="text-amber-100 text-xl">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const userRole = (session?.user as any)?.role;
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 p-4">
        <div className="text-amber-100 text-2xl mb-4">Access Denied</div>
        <p className="text-amber-200/70 mb-6">You do not have permission to access this page.</p>
        <button
          onClick={() => router.push('/decks')}
          className="text-amber-400 hover:text-amber-300"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
