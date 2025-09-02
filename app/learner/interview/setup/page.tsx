'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Code, Users, Brain, Database, Cloud, Briefcase } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  CreateInterviewPayload, 
  InterviewLevel, 
  InterviewCategory
} from '@/types/interview-schema';
import { startInterview } from '@/utils/interview-api';
import { buildInterviewConfig } from '@/utils/api-helpers';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('45');
  const [freeInterviewsUsed, setFreeInterviewsUsed] = useState(0);
  const [hasPaidPlan, setHasPaidPlan] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check free trial usage on component mount
  useState(() => {
    const checkFreeTrialUsage = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${user?._id}/interview-usage`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          console.warn('API not available, using default values');
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
        console.warn('Error checking trial usage, using default values:', error instanceof Error ? error.message : String(error));
        setFreeInterviewsUsed(0);
        setHasPaidPlan(false);
      }
    };

    if (user?._id && token) {
      checkFreeTrialUsage();
    }
  });
  const interviewLevels = [
    {
      id: InterviewLevel.BEGINNER,
      name: 'Beginner Level',
      description: 'For beginners and fresh graduates',
      icon: '🌱',
      difficulty: 'Easy'
    },
    {
      id: InterviewLevel.INTERMEDIATE,
      name: 'Intermediate Level',
      description: '2-5 years of experience',
      icon: '🚀',
      difficulty: 'Medium'
    },
    {
      id: InterviewLevel.ADVANCED,
      name: 'Advanced Level',
      description: '5+ years of experience',
      icon: '⭐',
      difficulty: 'Hard'
    }
  ];

  const interviewCategories = [
    {
      id: InterviewCategory.FRONTEND,
      name: 'Frontend Developer',
      description: 'React, JavaScript, CSS, UI/UX',
      icon: Code,
      color: 'text-yellow-400',
      hasCodeEditor: true
    },
    {
      id: InterviewCategory.BACKEND,
      name: 'Backend Developer',
      description: 'APIs, databases, server architecture',
      icon: Database,
      color: 'text-red-400',
      hasCodeEditor: true
    },
    {
      id: InterviewCategory.FULLSTACK,
      name: 'Full-Stack Developer',
      description: 'Frontend, backend, and system design',
      icon: Code,
      color: 'text-[#00FFB2]',
      hasCodeEditor: true
    },
    {
      id: InterviewCategory.MOBILE,
      name: 'Mobile Developer',
      description: 'iOS, Android, React Native, Flutter',
      icon: Code,
      color: 'text-purple-400',
      hasCodeEditor: true
    }
  ];

  const durations = [
    { value: '30', label: '30 minutes', description: 'Quick assessment' },
    { value: '45', label: '45 minutes', description: 'Standard interview' },
    { value: '60', label: '60 minutes', description: 'Comprehensive interview' },
    { value: '90', label: '90 minutes', description: 'In-depth technical interview' }
  ];

  const handleStartInterview = async () => {
    if (!selectedLevel || !selectedCategory) {
      alert('Please select both interview level and category');
      return;
    }

    // Check if user has exceeded free interviews
    if (freeInterviewsUsed >= 2 && !hasPaidPlan) {
      router.push('/pricing');
      return;
    }

    if (!user?._id || !user?.name || !user?.email) {
      alert('User information is missing. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      const selectedCategoryData = interviewCategories.find(cat => cat.id === selectedCategory);
      
      // Get the proper language for the category
      const config = buildInterviewConfig(selectedLevel, selectedCategory, selectedDuration);
      
      // Create interview payload matching backend schema
      const interviewPayload: CreateInterviewPayload = {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        level: selectedLevel as InterviewLevel,
        category: selectedCategory as InterviewCategory,
        duration: parseInt(selectedDuration),
        language: config.language, // Use the mapped language instead of hardcoded 'javascript'
        hasCodeEditor: selectedCategoryData?.hasCodeEditor || false,
        isFreeInterview: !hasPaidPlan
      };

      // Start interview session using the API helper
      const { sessionId } = await startInterview(interviewPayload, token);

      // Navigate to the interview session page with all necessary parameters
      const params = new URLSearchParams({
        sessionId,
        level: selectedLevel,
        category: selectedCategory,
        duration: selectedDuration,
        language: config.language, // Pass the correct language
        hasCodeEditor: (selectedCategoryData?.hasCodeEditor || false).toString()
      });
      
      router.push(`/learner/interview/voice-session?${params.toString()}`);
      
    } catch (error) {
      console.error('Error starting interview:', error);
      alert(`Failed to start interview: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const canStartFreeInterview = freeInterviewsUsed < 2 || hasPaidPlan;
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Sidebar userType="learner" />

      <div className="ml-64 pt-20 pb-12">
        <div className="container-custom space-y-10">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Setup Your <span className="gradient-text">AI Interview</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Choose your interview preferences and let our AI conduct a personalized session
            </p>
            
            {/* Free Trial Status */}
            <div className="mt-6 max-w-md mx-auto">
              {!hasPaidPlan && (
                <div className={`p-4 rounded-lg border ${
                  freeInterviewsUsed >= 2 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-[#00FFB2]/10 border-[#00FFB2]/20 text-[#00FFB2]'
                }`}>
                  <p className="text-sm">
                    {freeInterviewsUsed >= 2 
                      ? '🚫 Free interviews exhausted. Upgrade to continue.' 
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
              )}
            </div>
          </div>

          {/* Interview Level Selection */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold mb-6">Select Interview Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviewLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  disabled={!canStartFreeInterview}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedLevel === level.id
                      ? 'border-[#00FFB2] bg-[#00FFB2]/10'
                      : 'border-[#333] hover:border-[#00FFB2]/50'
                  } ${!canStartFreeInterview ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-3xl mb-3">{level.icon}</div>
                  <h3 className="font-semibold mb-2">{level.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{level.description}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    level.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    level.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    level.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {level.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interview Category Selection */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold mb-6">Select Interview Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    disabled={!canStartFreeInterview}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      selectedCategory === category.id
                        ? 'border-[#00FFB2] bg-[#00FFB2]/10'
                        : 'border-[#333] hover:border-[#00FFB2]/50'
                    } ${!canStartFreeInterview ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center mb-4">
                      <IconComponent size={24} className={`${category.color} mr-3`} />
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{category.name}</h3>
                        {category.hasCodeEditor && (
                          <span className="text-xs bg-[#00FFB2]/20 text-[#00FFB2] px-2 py-1 rounded-full">
                            Code Editor
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{category.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold mb-6">Interview Duration</h2>
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>Note:</strong> Only 30-minute interviews are available for free users. 
                Upgrade to access longer durations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {durations.map((duration) => (
                <button
                  key={duration.value}
                  onClick={() => setSelectedDuration(duration.value)}
                  disabled={!canStartFreeInterview || (!hasPaidPlan && duration.value !== '30')}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedDuration === duration.value
                      ? 'border-[#00FFB2] bg-[#00FFB2]/10'
                      : 'border-[#333] hover:border-[#00FFB2]/50'
                  } ${(!canStartFreeInterview || (!hasPaidPlan && duration.value !== '30')) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-xl font-bold mb-1">{duration.label}</div>
                  <div className="text-sm text-gray-400">{duration.description}</div>
                  {!hasPaidPlan && duration.value !== '30' && (
                    <div className="text-xs text-yellow-400 mt-1">Pro Only</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Start Interview Button */}
          <div className="text-center">
            <button
              onClick={handleStartInterview}
              disabled={!selectedLevel || !selectedCategory || !canStartFreeInterview || loading}
              className="btn-primary px-8 py-4 text-lg flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-5 w-5 mr-2" />
              {loading ? 'Starting...' : 
               !canStartFreeInterview ? 'Upgrade Required' : 
               'Start AI Interview'}
            </button>
            {(!selectedLevel || !selectedCategory) && canStartFreeInterview && (
              <p className="text-red-400 text-sm mt-2">
                Please select both interview level and category to continue
              </p>
            )}
            {!canStartFreeInterview && (
              <p className="text-red-400 text-sm mt-2">
                You have used your 2 free interviews. Please upgrade to continue.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}