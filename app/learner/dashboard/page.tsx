'use client';

import { useEffect } from 'react';

export default function DashboardPage() {
  // Auto-refresh dashboard data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh user stats, recent interviews, etc.
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Interviews</h2>
          <p className="text-gray-600 dark:text-gray-400">No recent interviews found.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Performance Stats</h2>
          <p className="text-gray-600 dark:text-gray-400">Stats will be displayed here.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
          <p className="text-gray-600 dark:text-gray-400">No upcoming sessions.</p>
        </div>
      </div>
    </div>
  );
}