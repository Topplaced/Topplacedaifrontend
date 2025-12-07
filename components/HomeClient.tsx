'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';

export default function HomeClient() {
  const [isVisible, setIsVisible] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (auth.token && auth.user) {
      const role = auth.user.role;
      if (role === 'mentor') {
        router.replace('/mentor');
      } else if (role === 'user') {
        router.replace('/learner');
      }
    }
  }, [auth, router]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return <Navbar />;
}