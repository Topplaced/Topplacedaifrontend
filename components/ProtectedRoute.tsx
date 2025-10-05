'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RootState } from '@/store/store';
import { useAuthPersistence } from '@/hooks/useAuthPersistence';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { isHydrated } = useAuthPersistence();

  useEffect(() => {
    // Only redirect if hydration is complete and user is not authenticated
    if (isHydrated && (!auth.token || !auth.user)) {
      router.replace('/');
    }
  }, [auth, router, isHydrated]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show content only if authenticated
  if (!auth.token || !auth.user) {
    return null;
  }

  return <>{children}</>;
}
