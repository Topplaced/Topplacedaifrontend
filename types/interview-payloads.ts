// Complete AI Interview Backend Payload Types and Structures

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'mentor';
  experience?: string;
  skills?: string[];
  goals?: string;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  workExperience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  resumeUrl?: string;
  profileCompletion?: number;
}

export interface InterviewConfiguration {
  level: 'entry' | 'mid' | 'senior' | 'lead';
  category: 'hr' | 'product-manager' | 'fullstack' | 'frontend' | 'backend' | 'sql' | 'data-analyst' | 'aws' | 'devops';
  duration: number; // in minutes
  hasCodeEditor: boolean;
  language?: string; // programming language if applicable
  interviewType: 'voice' | 'text' | 'voice+code';
  questionsLimit: number;
}

// 1. START INTERVIEW PAYLOAD
export interface StartInterviewPayload {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'mentor';
    experience: string;
    skills: string[];
    goals: string;
    education: Array<{
      degree: string;
      institution: string;
      year: number;
    }>;
    workExperience: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    profileCompletion: number;
    resumeUrl?: string;
    linkedinProfile?: string;
    phone?: string;
    location?: string;
  };
  configuration: {
    level: 'entry' | 'mid' | 'senior' | 'lead';
    category: 'hr' | 'product-manager' | 'fullstack' | 'frontend' | 'backend' | 'sql' | 'data-analyst' | 'aws' | 'devops';
    duration: number;
    hasCodeEditor: boolean;
    language: string;
    interviewType: 'voice' | 'text' | 'voice+code';
    questionsLimit: number;
    aiPersonality: 'professional' | 'friendly';
  };
  context: {
    sessionId: string;
    startTime: string; // ISO timestamp
    userAgent: string;
    timezone: string;
    isFreeInterview: boolean;
    deviceInfo: {
      platform: string;
      browser: string;
      screenResolution: string;
    };
  };
  preferences: {
    voiceEnabled: boolean;
    cameraEnabled: boolean;
    microphoneEnabled: boolean;
    fullscreenMode: boolean;
  };
}

// 2. CHAT/CONVERSATION PAYLOAD (Real-time during interview)
export interface ChatConversationPayload {
  sessionId: string;
  user: {
    id: string;
    name: string;
    level: string;
    category: string;
  };
  message: {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
    audioData?: {
      duration: number;
      audioUrl?: string;
      transcriptionConfidence?: number;
    };
  };
  conversationHistory: Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
    audioData?: {
      duration: number;
      audioUrl?: string;
    };
  }>;
  currentContext: {
    questionNumber: number;
    timeElapsed: number; // seconds
    timeRemaining: number; // seconds
    currentTopic: string;
    difficulty: string;
    expectedResponseType: 'text' | 'code' | 'explanation';
  };
  userPerformance: {
    responseTime: number; // seconds taken to respond
    communicationScore: number; // 0-100
    confidenceLevel: number; // 0-100
  };
  interviewState: {
    tabSwitchCount: number;
    violations: Array<{
      type: 'tab_switch' | 'fullscreen_exit' | 'right_click' | 'keyboard_shortcut';
      timestamp: string;
      description: string;
    }>;
    isFullscreen: boolean;
    microphoneActive: boolean;
    cameraActive: boolean;
  };
  codeContext?: {
    hasCodeEditor: boolean;
    currentCode: string;
    language: string;
    codeSubmissions: number;
    lastCodeExecution?: {
      timestamp: string;
      result: string;
      executionTime: number;
    };
  };
}

// 3. CODE EXECUTION PAYLOAD (When user runs code)
export interface CodeExecutionPayload {
  sessionId: string;
  user: {
    id: string;
    name: string;
    level: string;
    category: string;
  };
  code: {
    content: string;
    language: string;
    questionContext: string;
    submissionNumber: number;
    timestamp: string;
  };
  interviewContext: {
    timeElapsed: number;
    currentQuestion: string;
    expectedOutput?: string;
    testCases?: Array<{
      input: any;
      expectedOutput: any;
      description: string;
    }>;
  };
  executionEnvironment: {
    timeout: number; // seconds
    memoryLimit: string; // e.g., "128MB"
    allowedLibraries: string[];
  };
}

// 4. END INTERVIEW PAYLOAD
export interface EndInterviewPayload {
  sessionId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  configuration: {
    level: string;
    category: string;
    duration: number;
    hasCodeEditor: boolean;
    language: string;
    interviewType: string;
    questionsLimit: number;
  };
  results: {
    status: 'completed' | 'terminated' | 'incomplete';
    endTime: string; // ISO timestamp
    totalTimeSpent: number; // seconds
    questionsAnswered: number;
    totalQuestions: number;
    completionPercentage: number;
    terminationReason?: 'time_up' | 'user_ended' | 'violations' | 'technical_error';
  };
  conversationHistory: Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
    audioData?: {
      duration: number;
      audioUrl?: string;
    };
  }>;
  codeSubmissions?: Array<{
    questionId: string;
    question: string;
    code: string;
    language: string;
    submittedAt: string;
    executionResult?: {
      output: string;
      error?: string;
      executionTime: number;
      memoryUsed: string;
    };
    testResults?: Array<{
      testCase: string;
      passed: boolean;
      expected: any;
      actual: any;
    }>;
  }>;
  performanceMetrics: {
    averageResponseTime: number;
    totalSpeakingTime: number;
    totalListeningTime: number;
    communicationQuality: number; // 0-100
    technicalAccuracy: number; // 0-100
    problemSolvingApproach: number; // 0-100
  };
  violations: Array<{
    type: 'tab_switch' | 'fullscreen_exit' | 'right_click' | 'keyboard_shortcut' | 'copy_paste';
    timestamp: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  deviceMetrics: {
    tabSwitchCount: number;
    fullscreenExits: number;
    microphoneIssues: number;
    cameraIssues: number;
    networkInterruptions: number;
  };
}

// 5. INTERVIEW RESULTS PAYLOAD (Backend Response)
export interface InterviewResultsPayload {
  sessionId: string;
  user: {
    id: string;
    name: string;
  };
  interviewSummary: {
    category: string;
    level: string;
    duration: number;
    completedAt: string;
    status: 'completed' | 'terminated' | 'incomplete';
  };
  scores: {
    overall: number; // 0-100
    technical: number; // 0-100
    communication: number; // 0-100
    problemSolving: number; // 0-100
    codeQuality?: number; // 0-100 (if applicable)
    timeManagement: number; // 0-100
    professionalPresentation: number; // 0-100
  };
  detailedAnalysis: {
    strengths: string[];
    improvements: string[];
    detailedFeedback: {
      technical?: string;
      communication?: string;
      problemSolving?: string;
      codeQuality?: string;
      overallPerformance?: string;
    };
    recommendations: string[];
    nextSteps: string[];
  };
  questionAnalysis: Array<{
    questionNumber: number;
    question: string;
    userAnswer: string;
    aiEvaluation: {
      score: number; // 0-100
      feedback: string;
      keyPoints: string[];
      missedOpportunities: string[];
    };
    responseMetrics: {
      responseTime: number;
      wordCount: number;
      relevanceScore: number;
    };
  }>;
  codeAnalysis?: Array<{
    questionId: string;
    question: string;
    submittedCode: string;
    language: string;
    analysis: {
      correctness: number; // 0-100
      efficiency: number; // 0-100
      readability: number; // 0-100
      bestPractices: number; // 0-100
      testCasesPassed: number;
      totalTestCases: number;
    };
    feedback: {
      positive: string[];
      improvements: string[];
      suggestions: string[];
    };
  }>;
  comparisonMetrics: {
    percentileRank: number; // compared to other candidates
    categoryAverage: number;
    levelAverage: number;
    improvementFromLastInterview?: number;
  };
  certificateData?: {
    eligible: boolean;
    certificateUrl?: string;
    badgeUrl?: string;
    shareableLink?: string;
  };
  nextRecommendations: {
    suggestedMentors: Array<{
      id: string;
      name: string;
      expertise: string[];
      rating: number;
      hourlyRate: number;
    }>;
    practiceAreas: string[];
    resourceLinks: Array<{
      title: string;
      url: string;
      type: 'article' | 'video' | 'course' | 'book';
    }>;
    nextInterviewSuggestion: {
      category: string;
      level: string;
      estimatedReadiness: string; // e.g., "2 weeks"
    };
  };
}

// EXAMPLE PAYLOADS FOR BACKEND DEVELOPER

// Example 1: Start Interview
export const EXAMPLE_START_INTERVIEW: StartInterviewPayload = {
  user: {
    id: "user_12345",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "user",
    experience: "3 years in full-stack development",
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "MongoDB", "Express.js"],
    goals: "Land a senior developer role at a FAANG company",
    education: [
      {
        degree: "Bachelor of Technology in Computer Science",
        institution: "Massachusetts Institute of Technology",
        year: 2020
      }
    ],
    workExperience: [
      {
        title: "Full-Stack Developer",
        company: "Tech Innovators Inc.",
        duration: "January 2021 - Present",
        description: "Built scalable web applications using React, Node.js, and MongoDB. Led a team of 3 developers and improved application performance by 40%."
      },
      {
        title: "Junior Software Developer",
        company: "StartupXYZ",
        duration: "June 2020 - December 2020",
        description: "Developed frontend components using React and integrated with REST APIs."
      }
    ],
    profileCompletion: 85,
    resumeUrl: "https://example.com/resumes/john_doe_resume.pdf",
    linkedinProfile: "https://linkedin.com/in/johndoe",
    phone: "+1-555-123-4567",
    location: "San Francisco, CA"
  },
  configuration: {
    level: "mid",
    category: "fullstack",
    duration: 30,
    hasCodeEditor: true,
    language: "javascript",
    interviewType: "voice+code",
    questionsLimit: 10,
    aiPersonality: "professional"
  },
  context: {
    sessionId: "session_2024_01_20_123456",
    startTime: "2024-01-20T10:00:00.000Z",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    timezone: "America/New_York",
    isFreeInterview: true,
    deviceInfo: {
      platform: "MacOS",
      browser: "Chrome 120.0",
      screenResolution: "1920x1080"
    }
  },
  preferences: {
    voiceEnabled: true,
    cameraEnabled: true,
    microphoneEnabled: true,
    fullscreenMode: true
  }
};

// Example 2: Chat Conversation
export const EXAMPLE_CHAT_CONVERSATION: ChatConversationPayload = {
  sessionId: "session_2024_01_20_123456",
  user: {
    id: "user_12345",
    name: "John Doe",
    level: "mid",
    category: "fullstack"
  },
  message: {
    id: "msg_001",
    type: "user",
    content: "I have 3 years of experience in full-stack development, primarily working with React for frontend and Node.js with Express for backend. I've built several e-commerce applications and have experience with both SQL and NoSQL databases like PostgreSQL and MongoDB.",
    timestamp: "2024-01-20T10:05:30.000Z",
    audioData: {
      duration: 15.5,
      transcriptionConfidence: 0.95
    }
  },
  conversationHistory: [
    {
      id: "msg_000",
      type: "ai",
      content: "Hello John! I'm your AI interviewer for today's full-stack developer interview. Let's start with a brief introduction - please tell me about your experience and background in software development.",
      timestamp: "2024-01-20T10:00:15.000Z",
      audioData: {
        duration: 8.2,
        audioUrl: "/static/ai_intro.mp3"
      }
    }
  ],
  currentContext: {
    questionNumber: 1,
    timeElapsed: 330, // 5.5 minutes
    timeRemaining: 1470, // 24.5 minutes
    currentTopic: "introduction_and_experience",
    difficulty: "mid",
    expectedResponseType: "explanation"
  },
  userPerformance: {
    responseTime: 12.5,
    communicationScore: 85,
    confidenceLevel: 78
  },
  interviewState: {
    tabSwitchCount: 0,
    violations: [],
    isFullscreen: true,
    microphoneActive: true,
    cameraActive: true
  },
  codeContext: {
    hasCodeEditor: true,
    currentCode: "",
    language: "javascript",
    codeSubmissions: 0
  }
};

// Example 3: End Interview
export const EXAMPLE_END_INTERVIEW: EndInterviewPayload = {
  sessionId: "session_2024_01_20_123456",
  user: {
    id: "user_12345",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "user"
  },
  configuration: {
    level: "mid",
    category: "fullstack",
    duration: 30,
    hasCodeEditor: true,
    language: "javascript",
    interviewType: "voice+code",
    questionsLimit: 10
  },
  results: {
    status: "completed",
    endTime: "2024-01-20T10:30:00.000Z",
    totalTimeSpent: 1800, // 30 minutes
    questionsAnswered: 9,
    totalQuestions: 10,
    completionPercentage: 90,
    terminationReason: "time_up"
  },
  conversationHistory: [
    {
      id: "msg_000",
      type: "ai",
      content: "Hello John! Let's start with your introduction.",
      timestamp: "2024-01-20T10:00:15.000Z"
    },
    {
      id: "msg_001",
      type: "user",
      content: "I have 3 years of experience in full-stack development...",
      timestamp: "2024-01-20T10:05:30.000Z"
    }
    // ... more conversation history
  ],
  codeSubmissions: [
    {
      questionId: "q_005",
      question: "Write a function to reverse a string in JavaScript",
      code: "function reverseString(str) {\n  return str.split('').reverse().join('');\n}",
      language: "javascript",
      submittedAt: "2024-01-20T10:15:45.000Z",
      executionResult: {
        output: "gnirts",
        executionTime: 0.002,
        memoryUsed: "1.2KB"
      },
      testResults: [
        {
          testCase: "reverseString('string')",
          passed: true,
          expected: "gnirts",
          actual: "gnirts"
        }
      ]
    }
  ],
  performanceMetrics: {
    averageResponseTime: 8.5,
    totalSpeakingTime: 720, // 12 minutes
    totalListeningTime: 480, // 8 minutes
    communicationQuality: 85,
    technicalAccuracy: 88,
    problemSolvingApproach: 82
  },
  violations: [],
  deviceMetrics: {
    tabSwitchCount: 0,
    fullscreenExits: 0,
    microphoneIssues: 0,
    cameraIssues: 0,
    networkInterruptions: 0
  }
};

// Example 4: Interview Results (Backend Response)
export const EXAMPLE_INTERVIEW_RESULTS: InterviewResultsPayload = {
  sessionId: "session_2024_01_20_123456",
  user: {
    id: "user_12345",
    name: "John Doe"
  },
  interviewSummary: {
    category: "fullstack",
    level: "mid",
    duration: 30,
    completedAt: "2024-01-20T10:30:00.000Z",
    status: "completed"
  },
  scores: {
    overall: 87,
    technical: 92,
    communication: 78,
    problemSolving: 85,
    codeQuality: 89,
    timeManagement: 88,
    professionalPresentation: 82
  },
  detailedAnalysis: {
    strengths: [
      "Excellent technical knowledge of JavaScript and React",
      "Clear problem-solving approach with systematic thinking",
      "Good understanding of full-stack architecture",
      "Clean and efficient code implementation"
    ],
    improvements: [
      "Could improve explanation of complex technical concepts",
      "Practice system design for large-scale applications",
      "Work on providing more specific examples from experience"
    ],
    detailedFeedback: {
      technical: "Strong technical foundation with excellent knowledge of JavaScript, React, and Node.js. Code implementations were clean and efficient with good understanding of algorithms and data structures.",
      communication: "Good verbal communication skills but could improve on explaining complex technical concepts in simpler terms. Responses were clear but sometimes lacked specific examples.",
      problemSolving: "Demonstrated excellent analytical thinking and approached problems systematically. Good at breaking down complex problems into smaller components.",
      codeQuality: "Code was well-structured with proper naming conventions and good commenting practices. Shows understanding of best practices and clean code principles.",
      overallPerformance: "Solid performance overall with strong technical skills. With some improvement in communication and system design knowledge, would be ready for senior-level positions."
    },
    recommendations: [
      "Practice explaining technical concepts to non-technical audiences",
      "Study system design patterns and scalability concepts",
      "Work on providing concrete examples from past projects",
      "Consider taking a system design course or reading relevant books"
    ],
    nextSteps: [
      "Schedule a session with a system design mentor",
      "Practice mock interviews focusing on communication skills",
      "Review system design fundamentals",
      "Prepare specific examples from past work experience"
    ]
  },
  questionAnalysis: [
    {
      questionNumber: 1,
      question: "Tell me about your experience and background in software development.",
      userAnswer: "I have 3 years of experience in full-stack development, primarily working with React for frontend and Node.js with Express for backend...",
      aiEvaluation: {
        score: 85,
        feedback: "Good introduction covering relevant experience. Could have included more specific achievements or metrics.",
        keyPoints: ["Mentioned relevant technologies", "Clear timeline of experience", "Covered both frontend and backend"],
        missedOpportunities: ["Could have mentioned specific achievements", "No metrics or quantifiable results", "Didn't highlight leadership experience"]
      },
      responseMetrics: {
        responseTime: 12.5,
        wordCount: 87,
        // clarityScore: 90,
        relevanceScore: 88
      }
    }
  ],
  codeAnalysis: [
    {
      questionId: "q_005",
      question: "Write a function to reverse a string in JavaScript",
      submittedCode: "function reverseString(str) {\n  return str.split('').reverse().join('');\n}",
      language: "javascript",
      analysis: {
        correctness: 100,
        efficiency: 85,
        readability: 95,
        bestPractices: 90,
        testCasesPassed: 3,
        totalTestCases: 3
      },
      feedback: {
        positive: [
          "Correct and concise implementation",
          "Good use of built-in JavaScript methods",
          "Clean and readable code"
        ],
        improvements: [
          "Could add input validation for edge cases",
          "Consider performance implications for very large strings"
        ],
        suggestions: [
          "Add error handling for null/undefined inputs",
          "Consider alternative approaches for better performance"
        ]
      }
    }
  ],
  comparisonMetrics: {
    percentileRank: 78, // Better than 78% of candidates
    categoryAverage: 82,
    levelAverage: 79,
    improvementFromLastInterview: 12
  },
  certificateData: {
    eligible: true,
    certificateUrl: "https://certificates.topplaced.com/cert_user_12345_session_123456.pdf",
    badgeUrl: "https://badges.topplaced.com/badge_fullstack_mid_87.png",
    shareableLink: "https://topplaced.com/share/interview/session_123456"
  },
  nextRecommendations: {
    suggestedMentors: [
      {
        id: "mentor_001",
        name: "Sarah Chen",
        expertise: ["System Design", "JavaScript", "React", "Node.js"],
        rating: 4.9,
        hourlyRate: 150
      },
      {
        id: "mentor_002",
        name: "Michael Rodriguez",
        expertise: ["Full-Stack Architecture", "Leadership", "System Design"],
        rating: 4.8,
        hourlyRate: 200
      }
    ],
    practiceAreas: [
      "System Design Fundamentals",
      "Communication Skills for Technical Interviews",
      "Advanced JavaScript Concepts",
      "Database Design and Optimization"
    ],
    resourceLinks: [
      {
        title: "System Design Interview Guide",
        url: "https://example.com/system-design-guide",
        type: "article"
      },
      {
        title: "Advanced JavaScript Patterns",
        url: "https://example.com/js-patterns-course",
        type: "course"
      }
    ],
    nextInterviewSuggestion: {
      category: "system-design",
      level: "mid",
      estimatedReadiness: "2 weeks"
    }
  }
};