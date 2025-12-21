# AI Interview System - API Endpoints Documentation

## Overview

This document outlines all the API endpoints and payload structures needed for the AI Interview System backend implementation.

## Base URL

```
Production: https://stagingapi.topplaced.com/v1
Development: https://localhost:8000/api/v1
```

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <user_jwt_token>
```

---

## 1. START INTERVIEW

### Endpoint

```http
POST /interview/start
```

### Request Payload

```json
{
  "user": {
    "id": "user_12345",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "experience": "3 years in full-stack development",
    "skills": ["JavaScript", "React", "Node.js", "Python", "SQL"],
    "goals": "Land a senior developer role at a FAANG company",
    "education": [
      {
        "degree": "Bachelor of Technology in Computer Science",
        "institution": "Massachusetts Institute of Technology",
        "year": 2020
      }
    ],
    "workExperience": [
      {
        "title": "Full-Stack Developer",
        "company": "Tech Innovators Inc.",
        "duration": "January 2021 - Present",
        "description": "Built scalable web applications using React, Node.js, and MongoDB."
      }
    ],
    "profileCompletion": 85,
    "resumeUrl": "https://example.com/resumes/john_doe_resume.pdf",
    "linkedinProfile": "https://linkedin.com/in/johndoe",
    "phone": "+1-555-123-4567",
    "location": "San Francisco, CA"
  },
  "configuration": {
    "level": "mid",
    "category": "fullstack",
    "duration": 30,
    "hasCodeEditor": true,
    "language": "javascript",
    "interviewType": "voice+code",
    "questionsLimit": 10,
    "aiPersonality": "professional"
  },
  "context": {
    "sessionId": "session_2024_01_20_123456",
    "startTime": "2024-01-20T10:00:00.000Z",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "timezone": "America/New_York",
    "isFreeInterview": true,
    "deviceInfo": {
      "platform": "MacOS",
      "browser": "Chrome 120.0",
      "screenResolution": "1920x1080"
    }
  },
  "preferences": {
    "voiceEnabled": true,
    "cameraEnabled": true,
    "microphoneEnabled": true,
    "fullscreenMode": true
  }
}
```

### Response

```json
{
  "success": true,
  "sessionId": "session_2024_01_20_123456",
  "message": "Interview session initialized successfully",
  "aiWelcomeMessage": {
    "text": "Hello John! I'm your AI interviewer for today's full-stack developer interview. Let's begin!",
    "audioUrl": "https://tts.googleapis.com/v1/text:synthesize/audio_123.mp3"
  },
  "firstQuestion": {
    "questionNumber": 1,
    "text": "Let's start with a brief introduction - please tell me about your experience and background in software development.",
    "audioUrl": "https://tts.googleapis.com/v1/text:synthesize/audio_124.mp3",
    "expectedResponseType": "explanation",
    "timeLimit": 180
  },
  "interviewConfig": {
    "totalQuestions": 10,
    "estimatedDuration": 30,
    "hasCodeEditor": true,
    "language": "javascript"
  }
}
```

---

## 2. CHAT/CONVERSATION (Real-time during interview)

### Endpoint

```http
POST /interview/conversation
```

### Request Payload

```json
{
  "sessionId": "session_2024_01_20_123456",
  "user": {
    "id": "user_12345",
    "name": "John Doe",
    "level": "mid",
    "category": "fullstack"
  },
  "message": {
    "id": "msg_001",
    "type": "user",
    "content": "I have 3 years of experience in full-stack development, primarily working with React for frontend and Node.js with Express for backend. I've built several e-commerce applications and have experience with both SQL and NoSQL databases like PostgreSQL and MongoDB.",
    "timestamp": "2024-01-20T10:05:30.000Z",
    "audioData": {
      "duration": 15.5,
      "transcriptionConfidence": 0.95,
      "audioUrl": "https://storage.googleapis.com/user_audio/msg_001.wav"
    }
  },
  "conversationHistory": [
    {
      "id": "msg_000",
      "type": "ai",
      "content": "Hello John! Let's start with your introduction.",
      "timestamp": "2024-01-20T10:00:15.000Z"
    }
  ],
  "currentContext": {
    "questionNumber": 1,
    "timeElapsed": 330,
    "timeRemaining": 1470,
    "currentTopic": "introduction_and_experience",
    "difficulty": "mid",
    "expectedResponseType": "explanation"
  },
  "userPerformance": {
    "responseTime": 12.5,
    "communicationScore": 85,
    "clarityScore": 90,
    "confidenceLevel": 78
  },
  "interviewState": {
    "tabSwitchCount": 0,
    "violations": [],
    "isFullscreen": true,
    "microphoneActive": true,
    "cameraActive": true
  },
  "codeContext": {
    "hasCodeEditor": true,
    "currentCode": "",
    "language": "javascript",
    "codeSubmissions": 0
  }
}
```

### Response

```json
{
  "success": true,
  "aiResponse": {
    "messageId": "ai_msg_002",
    "content": "Great background, John! I can see you have solid experience with the MERN stack. Now let's dive deeper into React. Can you explain the difference between state and props in React, and when you would use each?",
    "audioUrl": "https://tts.googleapis.com/v1/text:synthesize/audio_125.mp3",
    "timestamp": "2024-01-20T10:06:00.000Z"
  },
  "nextQuestion": {
    "questionNumber": 2,
    "topic": "react_fundamentals",
    "difficulty": "mid",
    "expectedResponseType": "technical_explanation",
    "timeLimit": 120,
    "hints": ["Think about data flow", "Consider component communication"]
  },
  "userEvaluation": {
    "currentScore": 85,
    "feedback": "Good comprehensive answer covering both frontend and backend experience",
    "strengths": ["Mentioned specific technologies", "Clear timeline"],
    "improvements": ["Could include more specific achievements"]
  },
  "interviewProgress": {
    "questionsCompleted": 1,
    "totalQuestions": 10,
    "progressPercentage": 10,
    "estimatedTimeRemaining": 25
  }
}
```

---

## 3. CODE EXECUTION

### Endpoint

```http
POST /interview/code/execute
```

### Request Payload

```json
{
  "sessionId": "session_2024_01_20_123456",
  "user": {
    "id": "user_12345",
    "name": "John Doe",
    "level": "mid",
    "category": "fullstack"
  },
  "code": {
    "content": "function reverseString(str) {\n  return str.split('').reverse().join('');\n}",
    "language": "javascript",
    "questionContext": "Write a function to reverse a string in JavaScript",
    "submissionNumber": 1,
    "timestamp": "2024-01-20T10:15:45.000Z"
  },
  "interviewContext": {
    "timeElapsed": 945,
    "currentQuestion": "Write a function to reverse a string in JavaScript",
    "expectedOutput": "gnirts",
    "testCases": [
      {
        "input": "string",
        "expectedOutput": "gnirts",
        "description": "Basic string reversal"
      },
      {
        "input": "hello world",
        "expectedOutput": "dlrow olleh",
        "description": "String with spaces"
      },
      {
        "input": "",
        "expectedOutput": "",
        "description": "Empty string edge case"
      }
    ]
  },
  "executionEnvironment": {
    "timeout": 5,
    "memoryLimit": "128MB",
    "allowedLibraries": ["lodash", "moment"]
  }
}
```

### Response

```json
{
  "success": true,
  "executionResult": {
    "output": "gnirts",
    "error": null,
    "executionTime": 0.002,
    "memoryUsed": "1.2KB",
    "status": "success"
  },
  "testResults": [
    {
      "testCase": "reverseString('string')",
      "passed": true,
      "expected": "gnirts",
      "actual": "gnirts",
      "executionTime": 0.001
    },
    {
      "testCase": "reverseString('hello world')",
      "passed": true,
      "expected": "dlrow olleh",
      "actual": "dlrow olleh",
      "executionTime": 0.001
    },
    {
      "testCase": "reverseString('')",
      "passed": true,
      "expected": "",
      "actual": "",
      "executionTime": 0.001
    }
  ],
  "codeAnalysis": {
    "correctness": 100,
    "efficiency": 85,
    "readability": 95,
    "bestPractices": 90,
    "overallScore": 92
  },
  "feedback": {
    "positive": [
      "Correct and concise implementation",
      "Good use of built-in JavaScript methods",
      "Clean and readable code"
    ],
    "improvements": [
      "Could add input validation for edge cases",
      "Consider performance implications for very large strings"
    ],
    "suggestions": [
      "Add error handling for null/undefined inputs",
      "Consider alternative approaches for better performance"
    ]
  },
  "aiResponse": {
    "content": "Excellent solution! Your code is clean and uses JavaScript's built-in methods effectively. All test cases passed. Let's move on to the next question.",
    "audioUrl": "https://tts.googleapis.com/v1/text:synthesize/audio_126.mp3"
  }
}
```

---

## 4. END INTERVIEW

### Endpoint

```http
POST /interview/end
```

### Request Payload

```json
{
  "sessionId": "session_2024_01_20_123456",
  "user": {
    "id": "user_12345",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user"
  },
  "configuration": {
    "level": "mid",
    "category": "fullstack",
    "duration": 30,
    "hasCodeEditor": true,
    "language": "javascript",
    "interviewType": "voice+code",
    "questionsLimit": 10
  },
  "results": {
    "status": "completed",
    "endTime": "2024-01-20T10:30:00.000Z",
    "totalTimeSpent": 1800,
    "questionsAnswered": 9,
    "totalQuestions": 10,
    "completionPercentage": 90,
    "terminationReason": "time_up"
  },
  "conversationHistory": [
    {
      "id": "msg_000",
      "type": "ai",
      "content": "Hello John! Let's start with your introduction.",
      "timestamp": "2024-01-20T10:00:15.000Z"
    },
    {
      "id": "msg_001",
      "type": "user",
      "content": "I have 3 years of experience in full-stack development...",
      "timestamp": "2024-01-20T10:05:30.000Z"
    }
  ],
  "codeSubmissions": [
    {
      "questionId": "q_005",
      "question": "Write a function to reverse a string in JavaScript",
      "code": "function reverseString(str) {\n  return str.split('').reverse().join('');\n}",
      "language": "javascript",
      "submittedAt": "2024-01-20T10:15:45.000Z",
      "executionResult": {
        "output": "gnirts",
        "executionTime": 0.002,
        "memoryUsed": "1.2KB"
      },
      "testResults": [
        {
          "testCase": "reverseString('string')",
          "passed": true,
          "expected": "gnirts",
          "actual": "gnirts"
        }
      ]
    }
  ],
  "performanceMetrics": {
    "averageResponseTime": 8.5,
    "totalSpeakingTime": 720,
    "totalListeningTime": 480,
    "communicationQuality": 85,
    "technicalAccuracy": 88,
    "problemSolvingApproach": 82
  },
  "violations": [],
  "deviceMetrics": {
    "tabSwitchCount": 0,
    "fullscreenExits": 0,
    "microphoneIssues": 0,
    "cameraIssues": 0,
    "networkInterruptions": 0
  }
}
```

### Response

```json
{
  "success": true,
  "message": "Interview completed successfully",
  "processingStatus": "analyzing",
  "estimatedResultsTime": "2-3 minutes",
  "preliminaryFeedback": {
    "overall": "Great performance! You demonstrated strong technical skills and clear communication.",
    "highlights": [
      "Excellent problem-solving approach",
      "Clean code implementation",
      "Good understanding of full-stack concepts"
    ]
  },
  "nextSteps": {
    "resultsUrl": "/interview/results/session_2024_01_20_123456",
    "transcriptUrl": "/interview/transcript/session_2024_01_20_123456",
    "certificateEligible": true
  }
}
```

---

## 5. GET INTERVIEW RESULTS

### Endpoint

```http
GET /interview/results/{sessionId}
```

### Response Payload

```json
{
  "success": true,
  "sessionId": "session_2024_01_20_123456",
  "user": {
    "id": "user_12345",
    "name": "John Doe"
  },
  "interviewSummary": {
    "category": "fullstack",
    "level": "mid",
    "duration": 30,
    "completedAt": "2024-01-20T10:30:00.000Z",
    "status": "completed"
  },
  "scores": {
    "overall": 87,
    "technical": 92,
    "communication": 78,
    "problemSolving": 85,
    "codeQuality": 89,
    "timeManagement": 88,
    "professionalPresentation": 82
  },
  "detailedAnalysis": {
    "strengths": [
      "Excellent technical knowledge of JavaScript and React",
      "Clear problem-solving approach with systematic thinking",
      "Good understanding of full-stack architecture",
      "Clean and efficient code implementation"
    ],
    "improvements": [
      "Could improve explanation of complex technical concepts",
      "Practice system design for large-scale applications",
      "Work on providing more specific examples from experience"
    ],
    "detailedFeedback": {
      "technical": "Strong technical foundation with excellent knowledge of JavaScript, React, and Node.js. Code implementations were clean and efficient.",
      "communication": "Good verbal communication skills but could improve on explaining complex technical concepts in simpler terms.",
      "problemSolving": "Demonstrated excellent analytical thinking and approached problems systematically.",
      "codeQuality": "Code was well-structured with proper naming conventions and good commenting practices.",
      "overallPerformance": "Solid performance overall with strong technical skills. Ready for senior-level positions with some improvements."
    },
    "recommendations": [
      "Practice explaining technical concepts to non-technical audiences",
      "Study system design patterns and scalability concepts",
      "Work on providing concrete examples from past projects"
    ],
    "nextSteps": [
      "Schedule a session with a system design mentor",
      "Practice mock interviews focusing on communication skills",
      "Review system design fundamentals"
    ]
  },
  "questionAnalysis": [
    {
      "questionNumber": 1,
      "question": "Tell me about your experience and background in software development.",
      "userAnswer": "I have 3 years of experience in full-stack development...",
      "aiEvaluation": {
        "score": 85,
        "feedback": "Good introduction covering relevant experience. Could have included more specific achievements.",
        "keyPoints": [
          "Mentioned relevant technologies",
          "Clear timeline of experience"
        ],
        "missedOpportunities": [
          "Could have mentioned specific achievements",
          "No metrics provided"
        ]
      },
      "responseMetrics": {
        "responseTime": 12.5,
        "wordCount": 87,
        "relevanceScore": 88
      }
    }
  ],
  "codeAnalysis": [
    {
      "questionId": "q_005",
      "question": "Write a function to reverse a string in JavaScript",
      "submittedCode": "function reverseString(str) {\n  return str.split('').reverse().join('');\n}",
      "language": "javascript",
      "analysis": {
        "correctness": 100,
        "efficiency": 85,
        "readability": 95,
        "bestPractices": 90,
        "testCasesPassed": 3,
        "totalTestCases": 3
      },
      "feedback": {
        "positive": [
          "Correct and concise implementation",
          "Good use of built-in methods"
        ],
        "improvements": ["Could add input validation for edge cases"],
        "suggestions": ["Add error handling for null/undefined inputs"]
      }
    }
  ],
  "comparisonMetrics": {
    "percentileRank": 78,
    "categoryAverage": 82,
    "levelAverage": 79,
    "improvementFromLastInterview": 12
  },
  "certificateData": {
    "eligible": true,
    "certificateUrl": "https://certificates.topplaced.com/cert_user_12345.pdf",
    "badgeUrl": "https://badges.topplaced.com/badge_fullstack_mid_87.png",
    "shareableLink": "https://topplaced.com/share/interview/session_123456"
  },
  "nextRecommendations": {
    "suggestedMentors": [
      {
        "id": "mentor_001",
        "name": "Sarah Chen",
        "expertise": ["System Design", "JavaScript", "React"],
        "rating": 4.9,
        "hourlyRate": 150
      }
    ],
    "practiceAreas": [
      "System Design Fundamentals",
      "Communication Skills for Technical Interviews"
    ],
    "resourceLinks": [
      {
        "title": "System Design Interview Guide",
        "url": "https://example.com/system-design-guide",
        "type": "article"
      }
    ],
    "nextInterviewSuggestion": {
      "category": "system-design",
      "level": "mid",
      "estimatedReadiness": "2 weeks"
    }
  }
}
```

---

## Additional Endpoints

### Speech-to-Text

```http
POST /speech/transcribe
Content-Type: multipart/form-data

Response:
{
  "transcript": "I have experience in full-stack development",
  "confidence": 0.95,
  "duration": 5.2
}
```

### Text-to-Speech

```http
POST /speech/synthesize
{
  "text": "Hello, let's begin the interview",
  "voice": "en-US-Wavenet-F",
  "speed": 0.9
}

Response:
{
  "audioUrl": "https://tts.googleapis.com/audio_123.mp3",
  "duration": 3.5
}
```

### Interview History

```http
GET /user/{userId}/interviews

Response:
{
  "interviews": [
    {
      "sessionId": "session_123",
      "category": "fullstack",
      "level": "mid",
      "score": 87,
      "completedAt": "2024-01-20T10:30:00.000Z",
      "status": "completed"
    }
  ],
  "totalInterviews": 5,
  "averageScore": 84
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SESSION",
    "message": "Interview session not found or expired",
    "details": "Session ID: session_123456 is invalid"
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## WebSocket Events (Real-time)

### Connection

```
wss://api.topplaced.com/interview/ws/{sessionId}
```

### Events

```json
// AI Question
{
  "type": "ai_question",
  "content": "Tell me about yourself",
  "audioUrl": "https://tts.googleapis.com/audio_123.mp3",
  "questionNumber": 1,
  "timeLimit": 180
}

// User Answer
{
  "type": "user_answer",
  "content": "I have 3 years of experience...",
  "questionNumber": 1,
  "responseTime": 15.5
}

// Interview Complete
{
  "type": "interview_complete",
  "sessionId": "session_123456",
  "finalScore": 87,
  "resultsUrl": "/interview/results/session_123456"
}
```
