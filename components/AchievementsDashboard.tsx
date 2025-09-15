'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Award, Share2, Download, Lock, Calendar, Target } from 'lucide-react';
import SocialShare from './SocialShare';

interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  tier: string;
}

interface UserAchievement {
  _id: string;
  achievementId: Achievement;
  unlockedAt: string;
  isShared: boolean;
  certificateUrl?: string;
  metadata: any;
}

interface UserStats {
  totalAchievements: number;
  totalPoints: number;
  achievementsByTier: Record<string, number>;
  recentAchievements: UserAchievement[];
}

export default function AchievementsDashboard() {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unlocked' | 'all'>('unlocked');
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    achievement: Achievement | null;
    shareUrl: string;
  }>({ isOpen: false, achievement: null, shareUrl: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [userAchievementsRes, allAchievementsRes, userStatsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/achievements/user`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/achievements`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/achievements/user/stats`, { headers })
      ]);

      if (userAchievementsRes.ok) {
        const userAchievementsData = await userAchievementsRes.json();
        setUserAchievements(userAchievementsData);
      }

      if (allAchievementsRes.ok) {
        const allAchievementsData = await allAchievementsRes.json();
        setAllAchievements(allAchievementsData);
      }

      if (userStatsRes.ok) {
        const userStatsData = await userStatsRes.json();
        setUserStats(userStatsData);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (achievement: Achievement) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/achievements/${achievement._id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShareModal({
          isOpen: true,
          achievement,
          shareUrl: data.shareUrl
        });
      }
    } catch (error) {
      console.error('Error sharing achievement:', error);
    }
  };

  const handleGenerateCertificate = async (achievementId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/achievements/${achievementId}/certificate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data, '_blank');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-400';
      case 'platinum': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getTierBg = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-600/20 border-amber-600/30';
      case 'silver': return 'bg-gray-400/20 border-gray-400/30';
      case 'gold': return 'bg-yellow-400/20 border-yellow-400/30';
      case 'platinum': return 'bg-purple-400/20 border-purple-400/30';
      default: return 'bg-gray-400/20 border-gray-400/30';
    }
  };

  const unlockedAchievementIds = userAchievements.map(ua => ua.achievementId._id);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>

      {/* Social Share Modal */}
      <SocialShare
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, achievement: null, shareUrl: '' })}
        achievement={shareModal.achievement!}
        shareUrl={shareModal.shareUrl}
      />
    </div>
  );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Achievements</h1>
          <p className="text-gray-400">Track your progress and unlock rewards</p>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="text-[#00FFB2]" size={32} />
          <span className="text-2xl font-bold">{userStats?.totalPoints || 0}</span>
          <span className="text-gray-400">points</span>
        </div>
      </div>

      {/* Stats Cards */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-[#00FFB2] mb-1">
              {userStats.totalAchievements}
            </div>
            <div className="text-sm text-gray-400">Total Unlocked</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {userStats.achievementsByTier.gold || 0}
            </div>
            <div className="text-sm text-gray-400">Gold Tier</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-gray-400 mb-1">
              {userStats.achievementsByTier.silver || 0}
            </div>
            <div className="text-sm text-gray-400">Silver Tier</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {userStats.achievementsByTier.bronze || 0}
            </div>
            <div className="text-sm text-gray-400">Bronze Tier</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#1A1A1A] p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('unlocked')}
          className={`px-4 py-2 rounded-md transition-all ${
            activeTab === 'unlocked'
              ? 'bg-[#00FFB2] text-black font-semibold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Unlocked ({userAchievements.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md transition-all ${
            activeTab === 'all'
              ? 'bg-[#00FFB2] text-black font-semibold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          All ({allAchievements.length})
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'unlocked' ? (
          userAchievements.map((userAchievement) => {
            const achievement = userAchievement.achievementId;
            return (
              <div
                key={userAchievement._id}
                className={`glass-card p-6 ${getTierBg(achievement.tier)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleShare(achievement)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Share Achievement"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={() => handleGenerateCertificate(achievement._id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Generate Certificate"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star size={14} className={getTierColor(achievement.tier)} />
                    <span className={`text-sm font-medium ${getTierColor(achievement.tier)}`}>
                      {achievement.tier.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy size={14} className="text-[#00FFB2]" />
                    <span className="text-sm font-medium">{achievement.points}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar size={12} className="mr-1" />
                    Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          allAchievements.map((achievement) => {
            const isUnlocked = unlockedAchievementIds.includes(achievement._id);
            return (
              <div
                key={achievement._id}
                className={`glass-card p-6 ${
                  isUnlocked ? getTierBg(achievement.tier) : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">
                    {isUnlocked ? achievement.icon : '🔒'}
                  </div>
                  {!isUnlocked && (
                    <Lock size={16} className="text-gray-500" />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star size={14} className={getTierColor(achievement.tier)} />
                    <span className={`text-sm font-medium ${getTierColor(achievement.tier)}`}>
                      {achievement.tier.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy size={14} className="text-[#00FFB2]" />
                    <span className="text-sm font-medium">{achievement.points}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeTab === 'unlocked' && userAchievements.length === 0 && (
        <div className="text-center py-12">
          <Target size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No achievements yet</h3>
          <p className="text-gray-400">Complete interviews and improve your skills to unlock achievements!</p>
        </div>
      )}
    </div>
  );
}