'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Play, 
  Trophy, 
  Users, 
  Calendar, 
  Settings, 
  DollarSign,
  BookOpen,
  BarChart3,
  User,
  Target,
  Award,
  MessageSquare,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  userType: 'learner' | 'mentor';
}

export default function Sidebar({ userType }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const learnerMenuItems = [
    { icon: Home, label: 'Dashboard', href: '/learner' },
    { icon: Play, label: 'AI Interview', href: '/learner/Interview' },
    { icon: Trophy, label: 'Scorecard', href: '/learner/scorecard' },
    { icon: Users, label: 'Find Mentors', href: '/learner/mentors' },
    { icon: Calendar, label: 'Sessions', href: '/learner/sessions' },
    { icon: BookOpen, label: 'Resources', href: '/learner/resources' },
    { icon: Award, label: 'Achievements', href: '/learner/achievements' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const mentorMenuItems = [
    { icon: Home, label: 'Dashboard', href: '/mentor' },
    { icon: Calendar, label: 'Sessions', href: '/mentor/sessions' },
    { icon: DollarSign, label: 'Earnings', href: '/mentor/earnings' },
    { icon: User, label: 'Profile', href: '/mentor/profile' },
    { icon: BarChart3, label: 'Analytics', href: '/mentor/analytics' },
    { icon: Clock, label: 'Availability', href: '/mentor/availability' },
    { icon: MessageSquare, label: 'Reviews', href: '/mentor/reviews' },
    { icon: BookOpen, label: 'Resources', href: '/mentor/resources' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const menuItems = userType === 'learner' ? learnerMenuItems : mentorMenuItems;

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#0A0A0A] border-r border-[#00FFB2]/20 transition-all duration-300 z-40 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-[#00FFB2] rounded-full flex items-center justify-center text-black hover:bg-[#00CC8E] transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Menu Items */}
      <div className="p-4 space-y-2">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#00FFB2]/20 text-[#00FFB2] border border-[#00FFB2]/30' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <IconComponent size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-16 bg-black border border-[#00FFB2]/20 px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-card p-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#00FFB2] rounded-full flex items-center justify-center mr-3">
                <User size={16} className="text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {userType === 'learner' ? 'John Doe' : 'Sarah Chen'}
                </div>
                <div className="text-xs text-gray-400 capitalize">{userType}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}