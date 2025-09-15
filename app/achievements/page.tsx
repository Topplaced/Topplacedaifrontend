'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AchievementsDashboard from '@/components/AchievementsDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AchievementsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-20 pb-12">
          <div className="container-custom">
            <AchievementsDashboard />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}