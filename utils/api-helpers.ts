// API Helper Functions for Interview System
import { io } from 'socket.io-client';

import { 
  InitializeInterviewPayload, 
  AIConversationPayload, 
  CodeExecutionPayload,
  CompleteInterviewPayload,
  GetAIResponsePayload 
} from '@/types/interview-payloads';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Enhanced API interfaces
interface EnhancedConversationPayload {
  sessionId: string;
  message: string;
  questionId?: string;
  responseTime: number;
  metadata?: { messageType: string };
  codeContext?: {
    isCodeSubmission: boolean;
    questionId?: string;
    language: string;
    code: string;
    stdin?: string;
  };
}

interface StartInterviewPayload {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    experience: number;
    skills: string[];
    goals?: string;
  };
  configuration: {
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    duration: number;
    hasCodeEditor: boolean;
    language: string;
  };
}

// 1. Initialize Interview Session
export async function initializeInterview(payload: InitializeInterviewPayload) {
  const response = await fetch(`${API_URL}/interview/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// 2. Send Message to AI (Real-time conversation)
export async function sendMessageToAI(payload: AIConversationPayload) {
  const response = await fetch(`${API_URL}/interview/ai-conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// 3. Execute Code
export async function executeCode(payload: CodeExecutionPayload) {
  const response = await fetch(`${API_URL}/interview/execute-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// 4. Update Interview Progress (Real-time updates)
export async function updateInterviewProgress(payload: any) {
  const response = await fetch(`${API_URL}/interview/progress`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// 5. Complete Interview
export async function completeInterview(payload: CompleteInterviewPayload) {
  const response = await fetch(`${API_URL}/interview/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// 6. Get AI Response (Alternative endpoint)
export async function getAIResponse(payload: GetAIResponsePayload) {
  const response = await fetch(`${API_URL}/ai/interview-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// Helper function to build user profile from Redux state
export function buildUserProfile(user: any) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    experience: user.experience,
    skills: user.tech_stack ? user.tech_stack.split(',') : [],
    goals: user.goals,
    education: user.education || [],
    workExperience: user.work_experience || [],
    resumeUrl: user.resume_url,
    profileCompletion: user.profile_completion
  };
}

// Add this helper function at the top of the file
function mapLevelToBackend(frontendLevel: string): 'beginner' | 'intermediate' | 'advanced' {
  const levelMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
    'entry': 'beginner',
    'mid': 'intermediate', 
    'senior': 'advanced',
    'lead': 'advanced'
  };
  return levelMap[frontendLevel] || 'intermediate';
}

// Helper function to build interview configuration
export function buildInterviewConfig(level: string, category: string, duration: string) {
  const hasCodeEditor = !['hr', 'product-manager'].includes(category);
  
  return {
    level: mapLevelToBackend(level), // Map the level here
    category: category as any,
    duration: parseInt(duration),
    hasCodeEditor,
    language: getDefaultLanguage(category)
  };
}

// Helper function to get default programming language
function getDefaultLanguage(category: string): string {
  switch (category) {
    case 'frontend': return 'javascript';
    case 'backend': return 'python';
    case 'fullstack': return 'javascript';
    case 'sql': return 'sql';
    case 'data-analyst': return 'python';
    case 'aws': return 'yaml';
    case 'devops': return 'bash';
    default: return 'javascript';
  }
}

// Socket.IO Integration Functions
export const initializeSocket = (serverUrl: string) => {
  const socket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const socketInitInterview = (socket: any, payload: StartInterviewPayload) => {
  return new Promise((resolve, reject) => {
    socket.emit('init-interview', payload);
    
    socket.once('interview-initialized', (response: any) => {
      logAPICall('socket:init-interview', payload, response);
      resolve(response);
    });
    
    socket.once('error', (error: any) => {
      logAPICall('socket:init-interview', payload, { error });
      reject(error);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Socket initialization timeout'));
    }, 10000);
  });
};

export const socketSubmitAnswer = (socket: any, sessionId: string, answer: string, responseTime?: number) => {
  return new Promise((resolve, reject) => {
    const payload = { sessionId, answer, responseTime };
    socket.emit('submit-answer', payload);
    
    socket.once('answer-processed', (response: any) => {
      logAPICall('socket:submit-answer', payload, response);
      resolve(response);
    });
    
    socket.once('error', (error: any) => {
      logAPICall('socket:submit-answer', payload, { error });
      reject(error);
    });
    
    // Timeout after 15 seconds
    setTimeout(() => {
      reject(new Error('Socket answer submission timeout'));
    }, 15000);
  });
};

export const socketGetNextQuestion = (socket: any, sessionId: string) => {
  return new Promise((resolve, reject) => {
    const payload = { sessionId };
    socket.emit('get-next-question', payload);
    
    socket.once('next-question', (response: any) => {
      logAPICall('socket:get-next-question', payload, response);
      resolve(response);
    });
    
    socket.once('error', (error: any) => {
      logAPICall('socket:get-next-question', payload, { error });
      reject(error);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Socket get next question timeout'));
    }, 10000);
  });
};

// Enhanced API Functions from testInterview.html

// Start Interview (Enhanced)
export async function startInterview(payload: StartInterviewPayload) {
  const response = await fetch(`${API_URL}/interview/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// Enhanced Conversation API
export async function sendEnhancedConversation(payload: EnhancedConversationPayload) {
  const response = await fetch(`${API_URL}/interview/conversation/enhanced`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// Get Next Question
export async function getNextQuestion(sessionId: string) {
  const response = await fetch(`${API_URL}/interview/question/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    }
  });
  
  return await response.json();
}

// Submit Answer (Simple)
export async function submitAnswer(sessionId: string, questionId: string, answer: string, responseTime: number = 20) {
  const payload = {
    sessionId,
    questionId,
    answer,
    responseTime,
    timestamp: new Date().toISOString()
  };
  
  const response = await fetch(`${API_URL}/interview/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// Execute Code (Enhanced)
export async function executeCodeEnhanced(sessionId: string, code: string, language: string, questionId?: string, stdin?: string) {
  const payload = {
    sessionId,
    code,
    language,
    questionId,
    stdin: stdin || ''
  };
  
  const response = await fetch(`${API_URL}/interview/code/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// Get Conversation History
export async function getConversationHistory(sessionId: string) {
  const response = await fetch(`${API_URL}/interview/conversation/history/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    }
  });
  
  return await response.json();
}

// End Interview
export async function endInterview(sessionId: string, results?: any) {
  const payload = {
    sessionId,
    endTime: new Date().toISOString(),
    results: results || {
      overallScore: 85,
      technicalScore: 88,
      communicationScore: 82,
      problemSolvingScore: 87,
      feedback: 'Good performance overall',
      recommendations: ['Practice more complex algorithms', 'Improve explanation clarity']
    }
  };
  
  const response = await fetch(`${API_URL}/interview/end`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

// Get Interview Results
export async function getInterviewResults(sessionId: string) {
  const response = await fetch(`${API_URL}/interview/results/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    }
  });
  
  return await response.json();
}

// Enhanced Response Processing
export const processInterviewResponse = (response: any) => {
  const processed = {
    success: response.success || false,
    message: response.message || response.data?.message || '',
    data: {
      aiResponse: response.data?.aiResponse || response.data?.response || response.response,
      nextQuestion: response.data?.nextQuestion || response.data?.currentQuestion,
      progress: {
        questionsAnswered: response.data?.progress?.questionsAnswered || response.data?.questionsAnswered || 0,
        totalQuestions: response.data?.progress?.totalQuestions || response.data?.totalQuestions || 0,
        completionPercentage: response.data?.progress?.completionPercentage || response.data?.completionPercentage || 0,
        currentQuestionNumber: response.data?.progress?.currentQuestionNumber || response.data?.questionNumber || 0
      },
      sessionInfo: {
        sessionId: response.data?.sessionId || response.sessionId,
        userId: response.data?.userId || response.userId,
        interviewType: response.data?.interviewType || 'voice',
        category: response.data?.category,
        level: response.data?.level,
        duration: response.data?.duration
      },
      codeExecution: response.data?.codeExecution || response.data?.execution,
      metadata: response.data?.metadata || {}
    },
    errors: response.errors || [],
    warnings: response.warnings || []
  };

  return processed;
};

// Session Management Utilities
export const validateSession = async (sessionId: string): Promise<boolean> => {
  try {
    logAPICall('/interview/session/validate', { sessionId });
    
    const response = await fetch(`${API_URL}/interview/session/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();
    logAPICall('/interview/session/validate', { sessionId }, data);
    
    return data.valid === true;
  } catch (error) {
    handleAPIError('Session validation failed', error);
    return false;
  }
};

export const cleanupSession = async (sessionId: string): Promise<void> => {
  try {
    logAPICall('/interview/session/cleanup', { sessionId });
    
    const response = await fetch(`${API_URL}/interview/session/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();
    logAPICall('/interview/session/cleanup', { sessionId }, data);
    
    if (!data.success) {
      throw new Error(data.message || 'Session cleanup failed');
    }
  } catch (error) {
    handleAPIError('Session cleanup failed', error);
    throw error;
  }
};

export const recoverSession = async (sessionId: string): Promise<any> => {
  try {
    logAPICall('/interview/session/recover', { sessionId });
    
    const response = await fetch(`${API_URL}/interview/session/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();
    logAPICall('/interview/session/recover', { sessionId }, data);
    
    if (!data.success) {
      throw new Error(data.message || 'Session recovery failed');
    }
    
    return processInterviewResponse(data);
  } catch (error) {
    handleAPIError('Session recovery failed', error);
    throw error;
  }
};

export const getSessionStatus = async (sessionId: string): Promise<any> => {
  try {
    logAPICall('/interview/session/status', { sessionId });
    
    const response = await fetch(`${API_URL}/interview/session/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();
    logAPICall('/interview/session/status', { sessionId }, data);
    
    return {
      isActive: data.isActive || false,
      progress: data.progress || 0,
      questionsAnswered: data.questionsAnswered || 0,
      totalQuestions: data.totalQuestions || 0,
      timeRemaining: data.timeRemaining || 0,
      currentQuestion: data.currentQuestion,
      ...data
    };
  } catch (error) {
    handleAPIError('Get session status failed', error);
    throw error;
  }
};

export const saveSessionState = (sessionId: string, state: any): void => {
  try {
    const sessionData = {
      sessionId,
      timestamp: Date.now(),
      ...state
    };
    
    localStorage.setItem(`interview_session_${sessionId}`, JSON.stringify(sessionData));
    console.log('💾 Session state saved to localStorage:', sessionId);
  } catch (error) {
    console.error('❌ Failed to save session state:', error);
  }
};

export const loadSessionState = (sessionId: string): any | null => {
  try {
    const savedData = localStorage.getItem(`interview_session_${sessionId}`);
    if (savedData) {
      const sessionData = JSON.parse(savedData);
      console.log('📂 Session state loaded from localStorage:', sessionId);
      return sessionData;
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to load session state:', error);
    return null;
  }
};

export const clearSessionState = (sessionId: string): void => {
  try {
    localStorage.removeItem(`interview_session_${sessionId}`);
    console.log('🗑️ Session state cleared from localStorage:', sessionId);
  } catch (error) {
    console.error('❌ Failed to clear session state:', error);
  }
};

export const extractQuestionData = (questionData: any) => {
  if (!questionData) return null;
  
  return {
    id: questionData.id || questionData._id || `q_${Date.now()}`,
    question: questionData.question || questionData.text || questionData.content,
    questionNumber: questionData.questionNumber || questionData.number || 1,
    totalQuestions: questionData.totalQuestions || questionData.total || 0,
    category: questionData.category,
    difficulty: questionData.difficulty || questionData.level,
    expectedAnswer: questionData.expectedAnswer,
    hints: questionData.hints || [],
    timeLimit: questionData.timeLimit,
    codeRequired: questionData.codeRequired || false,
    language: questionData.language
  };
};

export const extractProgressData = (progressData: any) => {
  if (!progressData) return null;
  
  return {
    questionsAnswered: progressData.questionsAnswered || 0,
    totalQuestions: progressData.totalQuestions || 0,
    completionPercentage: progressData.completionPercentage || progressData.percentage || 0,
    currentQuestionNumber: progressData.currentQuestionNumber || progressData.questionNumber || 0,
    timeElapsed: progressData.timeElapsed || 0,
    timeRemaining: progressData.timeRemaining || 0,
    score: progressData.score || 0,
    performance: {
      averageResponseTime: progressData.performance?.averageResponseTime || 0,
      communicationScore: progressData.performance?.communicationScore || 0,
      technicalScore: progressData.performance?.technicalScore || 0,
      codeQuality: progressData.performance?.codeQuality || 'N/A'
    }
  };
};

// Debug logging utility
export function logAPICall(endpoint: string, payload?: any, response?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔗 API Call: ${endpoint}`);
    if (payload) console.log('📤 Payload:', payload);
    if (response) console.log('📥 Response:', response);
    console.groupEnd();
  }
}

// Error handling utility
export function handleAPIError(error: any, context: string) {
  console.error(`❌ API Error in ${context}:`, error);
  
  if (error.response?.status === 401) {
    // Handle unauthorized access
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
  
  return {
    success: false,
    error: error.message || 'An unexpected error occurred',
    context
  };
}