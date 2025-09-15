'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  MessageSquare,
  Loader2,
  Minus,
  Calendar,
  Clock,
  User,
  Award
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { RootState } from '@/store/store';

interface SkillAnalysis {
  label: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

interface ScorecardData {
  overallScore: number;
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  skillsAnalysis: SkillAnalysis[];
  strengths: string;
  improvements: string;
  recommendations: string;
  interviewDate: string;
  role: string;
}

export default function ScorecardPage() {
  const [scorecardData, setScorecardData] = useState<ScorecardData>({
    overallScore: 85,
    technicalSkills: 92,
    communication: 78,
    problemSolving: 85,
    role: 'Software Engineer',
    interviewDate: new Date().toISOString(),
    skillsAnalysis: [
      { skill: 'Data Structures & Algorithms', score: 92, trend: 'up', feedback: 'Excellent problem-solving approach' },
      { skill: 'System Design', score: 75, trend: 'stable', feedback: 'Good understanding, focus on scalability' },
      { skill: 'JavaScript Proficiency', score: 88, trend: 'up', feedback: 'Strong fundamentals and clean code' },
      { skill: 'Communication', score: 78, trend: 'down', feedback: 'Work on explaining complex concepts clearly' }
    ],
    keyInsights: [
      { title: 'Strong Technical Foundation', description: 'Excellent performance in data structures and algorithms. Your problem-solving approach is methodical and efficient.', type: 'strength' },
      { title: 'Communication Needs Improvement', description: 'Consider practicing explaining your thought process more clearly. Work on articulating complex concepts in simpler terms.', type: 'improvement' },
      { title: 'System Design Understanding', description: 'Good grasp of scalability concepts. Focus on trade-offs and real-world implementation details.', type: 'neutral' }
    ],
    nextSteps: [
      { title: 'Practice System Design', description: 'Focus on scalability and trade-offs in distributed systems', priority: 'high' },
      { title: 'Improve Communication', description: 'Work on explaining complex concepts clearly and concisely', priority: 'medium' },
      { title: 'Schedule Mock Interview', description: 'Book a session with our expert mentors for targeted practice', priority: 'low' }
    ],
    strengths: 'Excellent problem-solving approach and clean code implementation. Strong understanding of JavaScript fundamentals.',
    improvements: 'Work on explaining your thought process more clearly. Practice system design concepts for large-scale applications.',
    recommendations: 'Schedule a session with a system design mentor. Practice mock interviews focusing on communication skills.'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { token } = useSelector((state: RootState) => state.auth);
  const searchParams = useSearchParams();
  const router = useRouter();
  const interviewId = searchParams.get('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If no specific interview ID, get the latest interview results
        const endpoint = interviewId 
          ? `/api/interviews/${interviewId}/results`
          : '/api/interviews/latest/results';
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch scorecard data');
        }

        const data = await response.json();
        setScorecardData(transformApiData(data));
      } catch (err) {
        console.error('Error fetching scorecard data:', err);
        setError('API not available - using sample data');
        // Keep the existing mock data in state
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we want to try the API, otherwise use the default mock data
    // fetchData();
  }, [interviewId, token]);

  const transformApiData = (apiData: any): ScorecardData => {
    return {
      overallScore: apiData.overallScore || 0,
      technicalSkills: apiData.technicalSkills || 0,
      communication: apiData.communication || 0,
      problemSolving: apiData.problemSolving || 0,
      skillsAnalysis: apiData.skillsAnalysis || [],
      strengths: apiData.feedback?.strengths || 'No strengths data available',
      improvements: apiData.feedback?.improvements || 'No improvement suggestions available',
      recommendations: apiData.feedback?.recommendations || 'No recommendations available',
      interviewDate: apiData.createdAt || new Date().toISOString(),
      role: apiData.role || 'Software Engineer'
    };
  };

  const getMockScorecardData = (): ScorecardData => {
    return {
      overallScore: 85,
      technicalSkills: 92,
      communication: 78,
      problemSolving: 85,
      skillsAnalysis: [
        { label: 'JavaScript Proficiency', score: 92, trend: 'up' },
        { label: 'System Design', score: 78, trend: 'down' },
        { label: 'Data Structures', score: 88, trend: 'up' },
        { label: 'Communication', score: 74, trend: 'down' }
      ],
      strengths: 'Excellent problem-solving approach and clean code implementation. Strong understanding of JavaScript fundamentals.',
      improvements: 'Work on explaining your thought process more clearly. Practice system design concepts for large-scale applications.',
      recommendations: 'Schedule a session with a system design mentor. Practice mock interviews focusing on communication skills.',
      interviewDate: new Date().toISOString(),
      role: 'Software Engineer'
    };
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-[#00FFB2]';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressBarWidth = (score: number): string => {
    const percentage = Math.round(score / 10) * 10;
    const widthMap: { [key: number]: string } = {
      100: 'w-full',
      90: 'w-11/12',
      80: 'w-4/5',
      70: 'w-3/4',
      60: 'w-3/5',
      50: 'w-1/2',
      40: 'w-2/5',
      30: 'w-1/3',
      20: 'w-1/5',
      10: 'w-1/12',
      0: 'w-0'
    };
    return widthMap[percentage] || 'w-0';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-[#00FFB2] to-[#00D4AA]';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />
        <div className="ml-64 pt-20 pb-12">
          <div className="container-custom flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#00FFB2] mx-auto mb-4" />
              <p className="text-gray-400">Loading your scorecard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !scorecardData) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />
        <div className="ml-64 pt-20 pb-12">
          <div className="container-custom flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => {
                  setScorecardData(getMockScorecardData());
                  setError(null);
                }}
                className="btn-primary"
              >
                Use Sample Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!scorecardData) {
    return null;
  }
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Sidebar userType="learner" />

      <div className="ml-64 pt-20 pb-12">
        <div className="container-custom space-y-10">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Interview <span className="gradient-text">Scorecard</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Detailed analysis of your {scorecardData.role} interview performance
            </p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400 text-sm">
                Using sample data - {error}
              </div>
            )}
          </div>

          {/* Overall Score */}
          <div className="glass-card text-center p-8">
            <div className="mb-6">
              <div className={`text-6xl font-bold neon-text mb-2 ${getScoreColor(scorecardData.overallScore)}`}>
                {scorecardData.overallScore}%
              </div>
              <div className="text-xl text-gray-400">Overall Score</div>
              <div className="text-sm text-gray-500 mt-2">
                {new Date(scorecardData.interviewDate).toLocaleDateString()}
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(scorecardData.technicalSkills)}`}>
                  {scorecardData.technicalSkills}%
                </div>
                <div className="text-sm text-gray-400">Technical Skills</div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(scorecardData.communication)}`}>
                  {scorecardData.communication}%
                </div>
                <div className="text-sm text-gray-400">Communication</div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(scorecardData.problemSolving)}`}>
                  {scorecardData.problemSolving}%
                </div>
                <div className="text-sm text-gray-400">Problem Solving</div>
              </div>
            </div>
          </div>

          {/* Skills + Insights */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Skills Analysis */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">Skills Analysis</h2>
              <div className="space-y-6">
                {scorecardData.skillsAnalysis.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{skill.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className={getScoreColor(skill.score)}>{skill.score}%</span>
                        {getTrendIcon(skill.trend)}
                      </div>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <div className={`h-2 rounded-full bg-accent ${getProgressBarWidth(skill.score)}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">Key Insights</h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-400 mb-1">Strengths</div>
                      <p className="text-sm text-gray-400">
                        {scorecardData.strengths}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Brain className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-400 mb-1">Areas to Improve</div>
                      <p className="text-sm text-gray-400">
                        {scorecardData.improvements}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-400 mb-1">Recommendations</div>
                      <p className="text-sm text-gray-400">
                        {scorecardData.recommendations}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Recommended Actions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <button 
                onClick={() => router.push('/practice')}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Target className="h-5 w-5" />
                <span>Start Practice Session</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => router.push('/interviews')}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Schedule Mock Interview</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
