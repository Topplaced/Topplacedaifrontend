'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  MessageSquare,
  Code,
  Clock,
  Star,
  Download,
  Share2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function InterviewResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [isVisible, setIsVisible] = useState(false);
  const [freeInterviewsUsed, setFreeInterviewsUsed] = useState(0);
  const [hasPaidPlan, setHasPaidPlan] = useState(false);
  const [interviewData, setInterviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const interviewId = searchParams.get('id');

  useEffect(() => {
    setIsVisible(true);
    
    const fetchInterviewData = async () => {
      if (!interviewId || !user?._id || !token) {
        setError('Missing interview ID or authentication');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // First check localStorage for fresh interview results
        const storedResults = localStorage.getItem('interviewResults');
        if (storedResults) {
          try {
            const parsedResults = JSON.parse(storedResults);
            console.log('📊 Using stored interview results:', parsedResults);
            
            // Convert the formatted results back to the expected structure
            const formattedData = {
              sessionId: interviewId,
              scores: {
                overall: parsedResults.overallScore,
                technical: parsedResults.scores.technical,
                communication: parsedResults.scores.communication,
                problemSolving: parsedResults.scores.problemSolving,
                codeQuality: parsedResults.scores.codeQuality
              },
              configuration: {
                category: parsedResults.category,
                level: parsedResults.level,
                duration: parseInt(parsedResults.duration) || 0
              },
              createdAt: parsedResults.completedAt,
              results: {
                detailedAnalysis: {
                  strengths: parsedResults.strengths,
                  improvements: parsedResults.improvements
                },
                technicalFeedback: parsedResults.detailedFeedback.technical,
                communicationFeedback: parsedResults.detailedFeedback.communication,
                problemSolvingFeedback: parsedResults.detailedFeedback.problemSolving,
                codeQualityFeedback: parsedResults.detailedFeedback.codeQuality,
                codeSubmissions: parsedResults.codeSubmissions
              }
            };
            
            setInterviewData(formattedData);
            // Clear localStorage after using it
            localStorage.removeItem('interviewResults');
            return;
          } catch (parseError) {
            console.warn('Failed to parse stored results, falling back to API:', parseError);
          }
        }
        
        // Fallback to API if no localStorage data
        const response = await fetch(`${API_URL}/users/${user._id}/interview-history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch interview data');
        }
        
        const data = await response.json();
        const interview = data.interviews?.find((int: any) => int.sessionId === interviewId);
        
        if (!interview) {
          throw new Error('Interview not found');
        }
        
        console.log('Interview data structure:', interview);
        console.log('Scores object:', interview.scores);
        console.log('Scoreboard object:', interview.scoreboard);
        setInterviewData(interview);
      } catch (error) {
        console.error('Error fetching interview data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load interview data');
      } finally {
        setLoading(false);
      }
    };
    
    // Check updated free trial usage
    const checkFreeTrialUsage = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${user?._id}/interview-usage`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          console.warn('API endpoint not available, using default values');
          setFreeInterviewsUsed(0);
          setHasPaidPlan(false);
          return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('API returned non-JSON response, using default values');
          setFreeInterviewsUsed(0);
          setHasPaidPlan(false);
          return;
        }
        
        const data = await response.json();
        setFreeInterviewsUsed(data.freeInterviewsUsed || 0);
        setHasPaidPlan(data.hasPaidPlan || false);
      } catch (error) {
        console.warn('Backend API not available, using default values');
        setFreeInterviewsUsed(0);
        setHasPaidPlan(false);
      }
    };

    if (user?._id && token) {
      fetchInterviewData();
      checkFreeTrialUsage();
    }
  }, [interviewId, user?._id, token]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />
        <div className="ml-64 pt-20 pb-12">
          <div className="container-custom flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#00FFB2] mx-auto mb-4" />
              <p className="text-gray-400">Loading interview results...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !interviewData) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />
        <div className="ml-64 pt-20 pb-12">
          <div className="container-custom flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2">Interview Not Found</h2>
              <p className="text-gray-400 mb-6">{error || 'The requested interview could not be found.'}</p>
              <button 
                onClick={() => router.push('/learner/history')}
                className="btn-primary"
              >
                Back to History
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const results = {
    overallScore: interviewData.scores?.overall || 0,
    category: interviewData.configuration?.category || 'Interview',
    level: interviewData.configuration?.level || 'Unknown',
    duration: `${interviewData.configuration?.duration || 0} minutes`,
    completedAt: interviewData.createdAt ? new Date(interviewData.createdAt).toLocaleDateString() : 'Unknown',
    scores: {
      technical: interviewData.scores?.technical || interviewData.scoreboard?.detailedScores?.technical || 0,
      communication: interviewData.scores?.communication || interviewData.scoreboard?.detailedScores?.communication || 0,
      problemSolving: interviewData.scores?.problemSolving || interviewData.scoreboard?.detailedScores?.problemSolving || 0,
      codeQuality: interviewData.scores?.codeQuality || interviewData.scoreboard?.detailedScores?.codeQuality || 0
    },
    strengths: interviewData.results?.detailedAnalysis?.strengths || [
      'Completed the interview successfully',
      'Demonstrated problem-solving skills',
      'Showed technical knowledge'
    ],
    improvements: interviewData.results?.detailedAnalysis?.improvements || [
      'Continue practicing coding challenges',
      'Work on communication skills',
      'Review technical concepts'
    ],
    detailedFeedback: {
      technical: interviewData.results?.technicalFeedback || 'Technical performance was evaluated based on problem-solving approach and code quality.',
      communication: interviewData.results?.communicationFeedback || 'Communication skills were assessed throughout the interview process.',
      problemSolving: interviewData.results?.problemSolvingFeedback || 'Problem-solving approach and analytical thinking were evaluated.',
      codeQuality: interviewData.results?.codeQualityFeedback || 'Code structure, readability, and best practices were reviewed.'
    },
    codeSubmissions: interviewData.results?.codeSubmissions || []
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-[#00FFB2]';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const canTakeAnotherFreeInterview = freeInterviewsUsed < 2 || hasPaidPlan;
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Sidebar userType="learner" />

      <div className="ml-64 pt-20 pb-12">
        <div className="container-custom space-y-8">
          {/* Header */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Interview <span className="gradient-text">Results</span>
                </h1>
                <p className="text-gray-400 text-lg">
                  {results.category} • {results.level} • Completed on {results.completedAt}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="btn-outline flex items-center">
                  <Download size={16} className="mr-2" />
                  Download Report
                </button>
                <button className="btn-outline flex items-center">
                  <Share2 size={16} className="mr-2" />
                  Share Results
                </button>
                {canTakeAnotherFreeInterview ? (
                  <button 
                    onClick={() => router.push('/learner/interview/setup')}
                    className="btn-primary flex items-center"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Take Another Interview
                  </button>
                ) : (
                  <button 
                    onClick={() => router.push('/pricing')}
                    className="btn-primary flex items-center"
                  >
                    <Star size={16} className="mr-2" />
                    Upgrade to Continue
                  </button>
                )}
              </div>
            </div>
            
            {/* Free Trial Status */}
            {!hasPaidPlan && (
              <div className="mt-6">
                <div className={`p-4 rounded-lg border ${
                  freeInterviewsUsed >= 2 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-[#00FFB2]/10 border-[#00FFB2]/20 text-[#00FFB2]'
                }`}>
                  <p className="text-sm">
                    {freeInterviewsUsed >= 2 
                      ? '🚫 You have used all your free interviews. Upgrade to continue practicing!' 
                      : `🎉 Free interviews remaining: ${2 - freeInterviewsUsed}/2`
                    }
                  </p>
                  {freeInterviewsUsed >= 2 && (
                    <button
                      onClick={() => router.push('/pricing')}
                      className="mt-2 text-sm underline hover:no-underline"
                    >
                      View Pricing Plans
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Overall Score */}
          <div className="glass-card text-center p-8 neon-glow">
            <div className="mb-6">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(results.overallScore)}`}>
                {results.overallScore}%
              </div>
              <div className="text-xl text-gray-400">Overall Score</div>
              <div className="flex items-center justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    className={`${i < Math.floor(results.overallScore / 20) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(results.scores.technical)}`}>
                  {results.scores.technical}%
                </div>
                <div className="text-sm text-gray-400">Technical Skills</div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(results.scores.communication)}`}>
                  {results.scores.communication}%
                </div>
                <div className="text-sm text-gray-400">Communication</div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(results.scores.problemSolving)}`}>
                  {results.scores.problemSolving}%
                </div>
                <div className="text-sm text-gray-400">Problem Solving</div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(results.scores.codeQuality)}`}>
                  {results.scores.codeQuality}%
                </div>
                <div className="text-sm text-gray-400">Code Quality</div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skills Breakdown */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Target className="h-6 w-6 text-[#00FFB2] mr-2" />
                Skills Analysis
              </h2>
              <div className="space-y-6">
                {Object.entries(results.scores).map(([skill, score]) => (
                  <div key={skill}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                      <div className="flex items-center space-x-2">
                        <span className={getScoreColor(score)}>{score}%</span>
                        {getScoreIcon(score)}
                      </div>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r from-[#00FFB2] to-[#00CC8E]`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Brain className="h-6 w-6 text-[#00FFB2] mr-2" />
                Key Insights
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-400 mb-2">Strengths</div>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {results.strengths.map((strength: string, index: number) => (
                          <li key={index}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-400 mb-2">Areas for Improvement</div>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {results.improvements.map((improvement: string, index: number) => (
                          <li key={index}>• {improvement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <MessageSquare className="h-6 w-6 text-[#00FFB2] mr-2" />
              Detailed Feedback
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(results.detailedFeedback).map(([category, feedback]) => (
                <div key={category} className="p-4 bg-[#1A1A1A] rounded-lg">
                  <h3 className="font-semibold mb-2 capitalize text-[#00FFB2]">
                    {category.replace(/([A-Z])/g, ' $1')}
                  </h3>
                  <p className="text-sm text-gray-300">{feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Code Submissions */}
          {results.codeSubmissions.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Code className="h-6 w-6 text-[#00FFB2] mr-2" />
                Code Submissions
              </h2>
              
              <div className="space-y-4">
                {results.codeSubmissions.map((submission: any, index: number) => (
                  <div key={index} className="p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{submission.question}</h3>
                        <p className="text-sm text-gray-400">{submission.language}</p>
                      </div>
                      <div className={`text-xl font-bold ${getScoreColor(submission.score)}`}>
                        {submission.score}%
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{submission.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">Next Steps</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* <div className="p-6 bg-[#111] rounded-lg">
                <h3 className="font-semibold mb-3">Find a Mentor</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Connect with an expert to improve your weak areas
                </p>
                <button 
                  onClick={() => router.push('/learner/mentors')}
                  className="btn-primary w-full py-2 text-sm"
                >
                  Browse Mentors
                </button>
              </div> */}

              <div className="p-6 bg-[#111] rounded-lg">
                <h3 className="font-semibold mb-3">Practice More</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {canTakeAnotherFreeInterview 
                    ? 'Take another interview to track your improvement'
                    : 'Upgrade to continue practicing and improving your skills'
                  }
                </p>
                {canTakeAnotherFreeInterview ? (
                  <button 
                    onClick={() => router.push('/learner/interview/setup')}
                    className="btn-outline w-full py-2 text-sm"
                  >
                    Start New Interview
                  </button>
                ) : (
                  <button 
                    onClick={() => router.push('/pricing')}
                    className="btn-primary w-full py-2 text-sm"
                  >
                    Upgrade Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewResultsPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen bg-black">
          <Navbar />
          <Sidebar userType="learner" />
          <div className="ml-64 pt-20 pb-12">
            <div className="container-custom flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#00FFB2] mx-auto mb-4" />
                <p className="text-gray-400">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }>
        <InterviewResultsContent />
      </Suspense>
    </ProtectedRoute>
  );
}