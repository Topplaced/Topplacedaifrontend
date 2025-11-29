'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RootState } from '@/store/store';
import { useAuthPersistence } from '@/hooks/useAuthPersistence';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { isHydrated } = useAuthPersistence();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect if hydration is complete and user is not authenticated
    if (isHydrated && (!auth.token || !auth.user)) {
      router.replace('/auth/login');
    }
  }, [auth, router, isHydrated]);

  const Loader = (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  );

  // Always render a stable wrapper to avoid hydration mismatches
  return (
    <div suppressHydrationWarning>
      {!mounted || !isHydrated
        ? Loader
        : auth.token && auth.user
          ? children
          : Loader}
    </div>
  );
}
