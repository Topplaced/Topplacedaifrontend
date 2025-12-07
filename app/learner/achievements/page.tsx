'use client';

import { Trophy, Star, Target, Award, Medal, Crown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';

export default function AchievementsPage() {
  const achievements = [
    {
      id: 1,
      title: 'First Interview',
      description: 'Complete your first AI mock interview',
      icon: Trophy,
      earned: true,
      earnedDate: '2024-01-15',
      points: 100,
      rarity: 'common'
    },
    {
      id: 2,
      title: 'Interview Specialist',
      description: 'Complete 10 mock interviews',
      icon: Star,
      earned: true,
      earnedDate: '2024-01-20',
      points: 500,
      rarity: 'rare'
    },
    {
      id: 3,
      title: 'Perfect Score',
      description: 'Achieve 100% score in any interview',
      icon: Target,
      earned: false,
      points: 1000,
      rarity: 'epic'
    },
    {
      id: 4,
      title: 'Mentor Connection',
      description: 'Book your first mentor session',
      icon: Award,
      earned: true,
      earnedDate: '2024-01-18',
      points: 200,
      rarity: 'common'
    },
    {
      id: 5,
      title: 'Skill Master',
      description: 'Improve 5 different skills',
      icon: Medal,
      earned: false,
      points: 750,
      rarity: 'rare'
    },
    {
      id: 6,
      title: 'Interview Legend',
      description: 'Complete 50 mock interviews',
      icon: Crown,
      earned: false,
      points: 2000,
      rarity: 'legendary'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-400 border-gray-400';
      case 'rare':
        return 'text-blue-400 border-blue-400';
      case 'epic':
        return 'text-purple-400 border-purple-400';
      case 'legendary':
        return 'text-yellow-400 border-yellow-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);
  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />

      <div className="md:ml-64 ml-0 pt-16 md:pt-20 pb-24 md:pb-12">
        <div className="container-custom space-y-10">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Your <span className="gradient-text">Achievements</span></h1>
            <p className="text-gray-400 text-lg">Track your progress and unlock milestone rewards</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card text-center p-6">
              <Trophy className="h-8 w-8 text-[#00FFB2] mx-auto mb-3" />
              <div className="text-2xl font-bold">{earnedCount}</div>
              <div className="text-gray-400 text-sm">Achievements Earned</div>
            </div>
            <div className="glass-card text-center p-6">
              <Star className="h-8 w-8 text-[#00FFB2] mx-auto mb-3" />
              <div className="text-2xl font-bold">{totalPoints}</div>
              <div className="text-gray-400 text-sm">Total Points</div>
            </div>
            <div className="glass-card text-center p-6">
              <Target className="h-8 w-8 text-[#00FFB2] mx-auto mb-3" />
              <div className="text-2xl font-bold">
                {Math.round((earnedCount / achievements.length) * 100)}%
              </div>
              <div className="text-gray-400 text-sm">Completion Rate</div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((a) => {
              const Icon = a.icon;
              const rarity = getRarityColor(a.rarity);
              const [textColor, borderColor] = rarity.split(' ');

              return (
                <div
                  key={a.id}
                  className={`glass-card text-center border-2 p-6 transition-all duration-300 ${
                    a.earned ? `${textColor} ${borderColor} neon-glow-hover` : 'border-[#333] opacity-60'
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 flex items-center justify-center ${a.earned ? `${borderColor}` : 'border-[#333]'}`}>
                    <Icon className={`h-8 w-8 ${a.earned ? textColor : 'text-gray-500'}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{a.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{a.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full border capitalize ${rarity}`}>{a.rarity}</span>
                    <span className="text-[#00FFB2] font-medium">{a.points} pts</span>
                  </div>
                  {a.earned && a.earnedDate && (
                    <div className="mt-3 pt-3 border-t border-[#333]">
                      <span className="text-xs text-gray-500">
                        Earned on {new Date(a.earnedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next Milestones */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">Next Milestones</h2>
            <div className="space-y-4">
              {achievements
                .filter((a) => !a.earned)
                .slice(0, 3)
                .map((a) => {
                  const Icon = a.icon;
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-4 bg-[#111] rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 text-gray-400" />
                        <div>
                          <div className="font-medium">{a.title}</div>
                          <div className="text-sm text-gray-400">{a.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#00FFB2] font-medium">{a.points} pts</div>
                        <div className="text-xs text-gray-500 capitalize">{a.rarity}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
      </div>
      </div>
      <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
