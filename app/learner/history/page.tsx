'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Trophy,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Search,
  BarChart3,
  Target,
  Code,
  Users,
  Brain,
  Database,
  Cloud,
  Briefcase,
  Star,
  Gift,
  CreditCard
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface InterviewRecord {
  id: string;
  category: string;
  level: string;
  duration: number; // minutes (UI)
  overallScore: number; // 0-100
  scores: {
    technical: number;
    communication: number;
    problemSolving: number;
    codeQuality?: number;
  };
  completedAt: string;
  timeSpent: number; // seconds
  tabSwitchCount: number;
  codeSubmissions?: number;
  status: 'completed' | 'terminated' | 'incomplete';
  isFreeInterview?: boolean;
  role?: string;
}

export default function InterviewHistoryPage() {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [isVisible, setIsVisible] = useState(false);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [totalInterviews, setTotalInterviews] = useState(0);
  const [usageStats, setUsageStats] = useState({
    freeInterviewsUsed: 0,
    freeInterviewsLimit: 2,
    totalInterviews: 0,
    averageScore: 0
  });

  // ---------- helpers ----------
  const clampScore = (n: any) => {
    if (typeof n !== 'number' || Number.isNaN(n)) return 0;
    const pct = n <= 1 ? n * 100 : n; // supports 0-1 or 0-100
    return Math.max(0, Math.min(100, Math.round(pct)));
  };

  // Remove underscores/hyphens + Title Case
  const humanizeLabel = (value?: string) => {
    if (!value) return '';
    return value
      .toString()
      .replace(/[_-]+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };

  const formatInterviewTitle = (category?: string, role?: string) => {
    const base = role || category || 'Interview';
    return humanizeLabel(base);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hr':
        return Users;
      case 'product-manager':
        return Briefcase;
      case 'fullstack':
        return Code;
      case 'frontend':
        return Code;
      case 'backend':
        return Database;
      case 'sql':
        return Database;
      case 'data-analyst':
        return Brain;
      case 'aws':
        return Cloud;
      case 'devops':
        return Cloud;
      default:
        return Code;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hr':
        return 'text-blue-400';
      case 'product-manager':
        return 'text-purple-400';
      case 'fullstack':
        return 'text-[#00FFB2]';
      case 'frontend':
        return 'text-yellow-400';
      case 'backend':
        return 'text-red-400';
      case 'sql':
        return 'text-orange-400';
      case 'data-analyst':
        return 'text-pink-400';
      case 'aws':
        return 'text-cyan-400';
      case 'devops':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-[#00FFB2]';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'terminated':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'incomplete':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const sec = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // ---------- Mock fallback ----------
  const mockInterviews: InterviewRecord[] = [
    {
      id: '1',
      category: 'fullstack',
      level: 'mid',
      duration: 45,
      overallScore: 87,
      scores: {
        technical: 92,
        communication: 78,
        problemSolving: 85,
        codeQuality: 89
      },
      completedAt: '2024-01-20T14:30:00Z',
      timeSpent: 2700,
      tabSwitchCount: 0,
      codeSubmissions: 3,
      status: 'completed',
      isFreeInterview: true,
      role: 'Full Stack Developer'
    },
    {
      id: '2',
      category: 'frontend',
      level: 'senior',
      duration: 60,
      overallScore: 92,
      scores: {
        technical: 95,
        communication: 88,
        problemSolving: 90,
        codeQuality: 94
      },
      completedAt: '2024-01-18T10:15:00Z',
      timeSpent: 3600,
      tabSwitchCount: 1,
      codeSubmissions: 2,
      status: 'completed',
      isFreeInterview: true,
      role: 'Frontend Developer'
    }
  ];

  // ---------- API ----------
  const fetchUsageStats = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${user?._id}/interview-usage`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsageStats({
          freeInterviewsUsed: data.freeInterviewsUsed || 0,
          freeInterviewsLimit: data.freeInterviewsLimit || 2,
          totalInterviews: data.totalInterviews || 0,
          averageScore: data.averageScore || 0
        });
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const fetchInterviewHistory = async () => {
    try {
      setLoading(true);

      if (!user?._id || !token) {
        setInterviews(mockInterviews);
        setTotalInterviews(mockInterviews.length);
        return;
      }

      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: ((page - 1) * PAGE_SIZE).toString(),
        category: filterCategory,
        level: filterLevel,
        type: filterType,
        sortBy,
        sortOrder,
        search: searchTerm
      });

      const response = await fetch(`${API_URL}/users/${user._id}/interview-history?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        setInterviews(mockInterviews);
        setTotalInterviews(mockInterviews.length);
        return;
      }

      const data = await response.json();

      const transformedInterviews: InterviewRecord[] = (data.interviews || []).map((interview: any) => {
        const scores = interview.scores || {};
        const overallScore = clampScore(scores.overall ?? interview.score ?? 0);

        const durationSeconds = typeof interview.duration === 'number' ? interview.duration : 0;
        const durationMinutes = Math.max(0, Math.round(durationSeconds / 60));

        const prettyRole = interview.role ? humanizeLabel(interview.role) : humanizeLabel(interview.category);

        return {
          id: interview.sessionId,
          category: interview.category,
          level: interview.level,
          duration: durationMinutes,
          overallScore: overallScore,
          scores: {
            technical: clampScore(scores.technical ?? scores.overall ?? interview.score ?? 0),
            communication: clampScore(scores.communication ?? scores.overall ?? interview.score ?? 0),
            problemSolving: clampScore(scores.problemSolving ?? scores.overall ?? interview.score ?? 0),
            codeQuality: interview.hasCodeEditor
              ? clampScore(scores.codeQuality ?? scores.technical ?? scores.overall ?? interview.score ?? 0)
              : undefined
          },
          completedAt: interview.endTime || interview.startTime,
          timeSpent: durationSeconds || 0,
          tabSwitchCount: interview.tabSwitchCount || 0,
          codeSubmissions:
            interview.codeSubmissions ??
            (interview.hasCodeEditor ? Math.floor(Math.random() * 5) + 1 : undefined),
          status:
            interview.status === 'completed'
              ? 'completed'
              : interview.status === 'terminated'
              ? 'terminated'
              : 'incomplete',
          isFreeInterview: interview.isFreeInterview || false,
          role: prettyRole
        };
      });

      setInterviews(transformedInterviews);
      setTotalInterviews(data.totalInterviews || transformedInterviews.length || 0);
    } catch (error) {
      console.warn('Backend API not available, using mock data:', error);
      setInterviews(mockInterviews);
      setTotalInterviews(mockInterviews.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    fetchInterviewHistory();
    if (user && token) fetchUsageStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, page, filterCategory, filterLevel, filterType, sortBy, sortOrder, searchTerm]);

  // ---------- Page stats ----------
  const averageScore = useMemo(() => {
    if (interviews.length === 0) return 0;
    return Math.round(interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length);
  }, [interviews]);

  const completedInterviews = useMemo(
    () => interviews.filter((i) => i.status === 'completed').length,
    [interviews]
  );

  const totalTimeSpent = useMemo(
    () => interviews.reduce((sum, i) => sum + (i.timeSpent || 0), 0),
    [interviews]
  );

  // ---------- Loading ----------
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          <Navbar />
          <Sidebar userType="learner" />
          <div className="md:ml-64 ml-0 pt-16 md:pt-20 pb-24 md:pb-12 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFB2] mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your interview history...</p>
            </div>
          </div>
          <BottomNav />
        </div>
      </ProtectedRoute>
    );
  }

  // ---------- UI classes ----------
  const inputBase =
    'h-10 w-full bg-[#1A1A1A] border border-gray-600 rounded-md text-sm text-white ' +
    'focus:outline-none focus:ring-2 focus:ring-[#00FFB2]/60 focus:border-[#00FFB2]/40 transition';

  const selectBase = `${inputBase} px-3`;
  const searchInput = `${inputBase} py-2 pl-9 pr-3`;

  const smallBtn =
    'h-9 px-4 rounded-md border border-[#00FFB2]/50 text-[#00FFB2] bg-black/20 hover:bg-white/5 ' +
    'transition flex items-center justify-center gap-2 text-sm font-semibold';

  const squareBtn = 'px-3 py-1.5 text-sm border bg-[#1A1A1A] rounded-none transition';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black overflow-x-hidden">
        <Navbar />
        <Sidebar userType="learner" />

        <div className="md:ml-64 ml-0 pt-16 md:pt-20 pb-24 md:pb-12">
          <div className="container-custom space-y-8">
            {/* Header */}
            <div
              className={`transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Interview <span className="gradient-text">History</span>
              </h1>
              <p className="text-gray-400 text-lg">Track your progress and review past interview performances</p>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Gift size={24} className="text-[#00FFB2]" />
                    <h3 className="text-lg font-semibold">Free Interviews</h3>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm ${
                      usageStats.freeInterviewsUsed >= usageStats.freeInterviewsLimit
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {usageStats.freeInterviewsUsed >= usageStats.freeInterviewsLimit ? 'Limit Reached' : 'Available'}
                  </div>
                </div>

                <div className="text-2xl font-bold mb-2">
                  {usageStats.freeInterviewsUsed} / {usageStats.freeInterviewsLimit}
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div
                    className="bg-[#00FFB2] h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (usageStats.freeInterviewsUsed / usageStats.freeInterviewsLimit) * 100
                      )}%`
                    }}
                  ></div>
                </div>

                <p className="text-sm text-gray-400">
                  {usageStats.freeInterviewsUsed >= usageStats.freeInterviewsLimit
                    ? 'You have used all your free interviews. Purchase credits to continue.'
                    : `${usageStats.freeInterviewsLimit - usageStats.freeInterviewsUsed} free interviews remaining`}
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CreditCard size={24} className="text-[#00FFB2]" />
                  <h3 className="text-lg font-semibold">Interview Credits</h3>
                </div>
                <div className="text-2xl font-bold mb-2">{interviews.filter((i) => !i.isFreeInterview).length}</div>
                <p className="text-sm text-gray-400">Total paid interviews completed</p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card p-6 text-center">
                <Trophy size={24} className="text-[#00FFB2] mx-auto mb-3" />
                <div className="text-2xl font-bold">{interviews.length}</div>
                <div className="text-sm text-gray-400">Total Interviews</div>
              </div>

              <div className="glass-card p-6 text-center">
                <Target size={24} className="text-[#00FFB2] mx-auto mb-3" />
                <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>{averageScore}%</div>
                <div className="text-sm text-gray-400">Average Score</div>
              </div>

              <div className="glass-card p-6 text-center">
                <Star size={24} className="text-[#00FFB2] mx-auto mb-3" />
                <div className="text-2xl font-bold">{completedInterviews}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>

              <div className="glass-card p-6 text-center">
                <Clock size={24} className="text-[#00FFB2] mx-auto mb-3" />
                <div className="text-2xl font-bold">{Math.round(totalTimeSpent / 3600)}h</div>
                <div className="text-sm text-gray-400">Total Time</div>
              </div>
            </div>

            {/* Filters (one row, small, smooth) */}
            {/* Filters (perfect, equal-width, smooth, no big buttons) */}



            {/* Interview Records */}
            <div className="space-y-4">
              {interviews.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <BarChart3 size={48} className="text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Interview Records Found</h3>
                  <p className="text-gray-400 mb-6">
                    You haven&apos;t taken any interviews yet. Start your first interview to see your progress here.
                  </p>
                  <button onClick={() => router.push('/learner/interview/setup')} className="btn-primary">
                    Start Your First Interview
                  </button>
                </div>
              ) : (
                interviews.map((interview) => {
                  const IconComponent = getCategoryIcon(interview.category);
                  const categoryColor = getCategoryColor(interview.category);
                  const prettyTitle = formatInterviewTitle(interview.category, interview.role);

                  return (
                    <div
                      key={interview.id}
                      className="glass-card p-6 hover:border-[#00FFB2]/40 transition-all duration-300"
                    >
                      {/* Header row */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center">
                            <IconComponent size={22} className={categoryColor} />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold">
                                {prettyTitle} Interview
                              </h3>

                              <div
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${
                                  interview.isFreeInterview
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                }`}
                              >
                                {interview.isFreeInterview ? (
                                  <>
                                    <Gift size={12} />
                                    <span>Free</span>
                                  </>
                                ) : (
                                  <>
                                    <CreditCard size={12} />
                                    <span>Paid</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center text-sm text-gray-400 flex-wrap gap-x-3 gap-y-1">
                              <span className="capitalize">{humanizeLabel(interview.level)} Level</span>
                              <span className="opacity-50">•</span>
                              <span>{interview.duration} minutes</span>
                              <span className="opacity-50">•</span>
                              <span>{formatDate(interview.completedAt)}</span>

                              <span className="opacity-50">•</span>
                              <span>{prettyTitle}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 md:self-auto self-end">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(interview.overallScore)}`}>
                              {interview.overallScore}%
                            </div>
                            <div className="text-sm text-gray-400">Overall Score</div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getStatusColor(
                              interview.status
                            )}`}
                          >
                            {interview.status}
                          </div>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${getScoreColor(interview.scores.technical)}`}>
                              {interview.scores.technical}%
                            </div>
                            <div className="text-xs text-gray-400">Technical</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${getScoreColor(interview.scores.communication)}`}>
                              {interview.scores.communication}%
                            </div>
                            <div className="text-xs text-gray-400">Communication</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${getScoreColor(interview.scores.problemSolving)}`}>
                              {interview.scores.problemSolving}%
                            </div>
                            <div className="text-xs text-gray-400">Problem Solving</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${getScoreColor(interview.scores.codeQuality ?? 0)}`}>
                              {interview.scores.codeQuality !== undefined ? `${interview.scores.codeQuality}%` : '—'}
                            </div>
                            <div className="text-xs text-gray-400">Code Quality</div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-gray-600 mt-4">
                        <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>Time: {formatDuration(interview.timeSpent)}</span>
                          </div>

                          {interview.codeSubmissions !== undefined && (
                            <div className="flex items-center gap-2">
                              <Code size={14} />
                              <span>{interview.codeSubmissions} code submissions</span>
                            </div>
                          )}

                          {interview.tabSwitchCount > 0 && (
                            <div className="text-yellow-400">⚠️ {interview.tabSwitchCount} tab switches</div>
                          )}
                        </div>

                        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
                          <button
                            onClick={() => router.push(`/learner/interview/results?id=${interview.id}`)}
                            className={`${smallBtn} w-full sm:w-auto min-w-[140px]`}
                          >
                            <Eye size={14} />
                            View Details
                          </button>

                          <button
                            className={`${smallBtn} w-full sm:w-auto min-w-[140px]`}
                            onClick={() => {
                              // TODO: Add real download handler
                            }}
                          >
                            <Download size={14} />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination (square, small) */}
            {totalInterviews > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`${squareBtn} border-[#00FFB2]/50 text-[#00FFB2] hover:bg-white/5 disabled:opacity-40`}
                >
                  Prev
                </button>

                {Array.from({ length: Math.ceil(totalInterviews / PAGE_SIZE) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx + 1)}
                    className={`${squareBtn} ${
                      page === idx + 1
                        ? 'border-[#00FFB2] text-[#00FFB2]'
                        : 'border-gray-700 text-gray-300 hover:border-[#00FFB2]/40 hover:text-[#00FFB2]/90'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  disabled={page >= Math.ceil(totalInterviews / PAGE_SIZE)}
                  onClick={() =>
                    setPage((p) => Math.min(Math.ceil(totalInterviews / PAGE_SIZE), p + 1))
                  }
                  className={`${squareBtn} border-[#00FFB2]/50 text-[#00FFB2] hover:bg-white/5 disabled:opacity-40`}
                >
                  Next
                </button>
              </div>
            )}

            {/* Performance Trends */}
            {interviews.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <TrendingUp className="h-6 w-6 text-[#00FFB2] mr-2" />
                  Performance Trends
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-[#1A1A1A] rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-[#00FFB2] mb-1">
                      {Math.max(...interviews.map((i) => i.overallScore))}%
                    </div>
                    <div className="text-sm text-gray-400">Best Score</div>
                  </div>

                  <div className="text-center p-4 bg-[#1A1A1A] rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-[#00FFB2] mb-1">
                      {interviews.filter((i) => i.overallScore >= 80).length}
                    </div>
                    <div className="text-sm text-gray-400">High Scores (80%+)</div>
                  </div>

                  <div className="text-center p-4 bg-[#1A1A1A] rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-[#00FFB2] mb-1">
                      {new Set(interviews.map((i) => i.category)).size}
                    </div>
                    <div className="text-sm text-gray-400">Categories Explored</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <BottomNav />
      </div>

      {/* Add this in global CSS once:
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      */}
    </ProtectedRoute>
  );
}
