'use client';

import { useState } from 'react';
import { Calendar, Clock, Video, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

// ✅ Consistent date formatter to avoid hydration error
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

const sessions = [
  {
    id: 1,
    mentor: 'Sarah Chen',
    topic: 'System Design Basics',
    date: '2025-07-01',
    time: '2:00 PM',
    status: 'upcoming',
    type: '1-on-1 Mentorship'
  },
  {
    id: 2,
    mentor: 'Michael Rodriguez',
    topic: 'Leadership & Tech',
    date: '2025-06-10',
    time: '4:30 PM',
    status: 'past',
    type: 'Mock Interview'
  },
  {
    id: 3,
    mentor: 'Emily Watson',
    topic: 'Data-Driven PM',
    date: '2025-07-05',
    time: '6:00 PM',
    status: 'upcoming',
    type: '1-on-1 Mentorship'
  },
  {
    id: 4,
    mentor: 'Sarah Chen',
    topic: 'Advanced System Design',
    date: '2025-06-01',
    time: '12:00 PM',
    status: 'past',
    type: 'Mock Interview'
  }
];

const SessionCard = ({
  mentor,
  topic,
  date,
  time,
  type,
  status
}: {
  mentor: string;
  topic: string;
  date: string;
  time: string;
  type: string;
  status: string;
}) => {
  return (
    <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Info */}
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-[#00FFB2] rounded-full flex items-center justify-center text-black">
          <User size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{topic}</h3>
          <p className="text-sm text-gray-400 mb-2">{type} with {mentor}</p>
          <div className="flex flex-wrap items-center text-sm text-gray-400 gap-x-4 gap-y-1">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Button or Status */}
      <div className="md:self-auto self-end">
        {status === 'upcoming' ? (
          <button className="btn-primary flex items-center space-x-2 px-4 py-2 whitespace-nowrap">
            <Video className="h-4 w-4" />
            <span>Join Session</span>
          </button>
        ) : (
          <span className="text-sm text-green-400 border border-green-400 px-3 py-1 rounded-full whitespace-nowrap">
            Completed
          </span>
        )}
      </div>
    </div>
  );
};

export default function SessionsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const filteredSessions = sessions.filter((s) => s.status === tab);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />

      <div className="ml-64 pt-20 pb-12">
        <div className="container-custom space-y-10">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              Your <span className="gradient-text">Sessions</span>
            </h1>
            <p className="text-gray-400 text-lg">Track your upcoming and completed sessions</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-[#333] pb-2">
            <button
              onClick={() => setTab('upcoming')}
              className={`text-sm font-medium pb-2 ${tab === 'upcoming'
                ? 'text-[#00FFB2] border-b-2 border-[#00FFB2]'
                : 'text-gray-400 hover:text-white'
              }`}
            >
              Upcoming Sessions
            </button>
            <button
              onClick={() => setTab('past')}
              className={`text-sm font-medium pb-2 ${tab === 'past'
                ? 'text-[#00FFB2] border-b-2 border-[#00FFB2]'
                : 'text-gray-400 hover:text-white'
              }`}
            >
              Session History
            </button>
          </div>

          {/* Session List */}
          <div className="space-y-6">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <SessionCard key={session.id} {...session} />
              ))
            ) : (
              <div className="text-center text-gray-500 mt-10">
                No {tab === 'upcoming' ? 'upcoming' : 'past'} sessions yet.
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
