"use client";

import { useState } from "react";
import {
  Play,
  MessageSquare,
  Code,
  Square,
  FileText,
  Send,
  Terminal,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";

import config from "@/config/apiConfig";
import { callOpenAI, InterviewSession, executeCode } from '@/utils/external-api-helpers';

// Using external APIs instead of internal backend
const API_URL = config.apiUrl; // This now points to external APIs

export default function APITestClient() {
  const [sessionId, setSessionId] = useState<string>("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready to test APIs");
  const [error, setError] = useState<string | null>(null);

  const makeAPICall = async (
    endpoint: string,
    method: string = "POST",
    payload?: any
  ) => {
    setLoading(true);
    setError(null);
    setStatus(`Calling ${method} ${endpoint}...`);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const config: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // "ngrok-skip-browser-warning": "true",
        },
      };

      if (payload) {
        config.body = JSON.stringify(payload);
      }

      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      setResponse(data);
      setStatus(`✅ ${method} ${endpoint} - Status: ${response.status}`);

      // Extract sessionId from start interview response
      if (endpoint === "/interview/start" && data.sessionId) {
        setSessionId(data.sessionId);
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      setStatus(`❌ ${method} ${endpoint} - Error: ${err.message}`);
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const initializeInterview = () => {
    const payload = {
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "testuser@example.com",
        role: "user",
        experience: "3 years in full-stack development",
        skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
        goals: "Land a senior developer role",
        education: [
          {
            degree: "B.Tech in Computer Science",
            institution: "Indian Institute of Technology, Delhi",
            year: 2019,
          },
        ],
        workExperience: [
          {
            title: "Full-Stack Developer",
            company: "TechNova Solutions",
            duration: "Jan 2021 - Present",
            description:
              "Led development of scalable web applications using React and Node.js. Integrated RESTful APIs and optimized performance across multiple products.",
          },
          {
            title: "Frontend Developer Intern",
            company: "CodeCraft Inc.",
            duration: "Jun 2020 - Dec 2020",
            description:
              "Worked on enhancing user interfaces with React and Material UI. Assisted in building reusable component libraries and responsive layouts.",
          },
        ],
        profileCompletion: 85,
      },
      configuration: {
        level: "mid",
        category: "fullstack",
        duration: 30,
        hasCodeEditor: true,
        language: "javascript",
      },
      context: {
        sessionId: `session_${Date.now()}`,
        startTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isFreeInterview: true,
      },
    };

    makeAPICall("/interview/start", "POST", payload);
  };

  const sendMessage = () => {
    if (!sessionId) {
      setError("Please initialize interview first to get a session ID");
      return;
    }

    const message = prompt("Enter your message:");
    if (!message) return;

    const payload = {
      sessionId: sessionId,
      message: message,
    };

    makeAPICall("/interview/conversation", "POST", payload);
  };

  const executeCode = () => {
    if (!sessionId) {
      setError("Please initialize interview first to get a session ID");
      return;
    }

    const code = prompt(
      "Enter your code:",
      `function printFibonacci(n) {
  let fib = [0, 1];

  for (let i = 2; i < n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }

  console.log("Fibonacci Series:");
  for (let i = 0; i < n; i++) {
    console.log(fib[i]);
  }
}

// Example: Print first 10 Fibonacci numbers
printFibonacci(10);`
    );

    if (!code) return;

    const payload = {
      sessionId: sessionId,
      code: code,
      language: "JS",
      codeContext: {
        questionId: "code_challenge_1",
        question: "Write a function to generate Fibonacci series",
      },
    };

    makeAPICall("/interview/code/execute", "POST", payload);
  };

  const endInterview = () => {
    if (!sessionId) {
      setError("Please initialize interview first to get a session ID");
      return;
    }

    const payload = {
      sessionId: sessionId,
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "testuser@example.com",
        role: "user",
      },
      configuration: {
        level: "mid",
        category: "fullstack",
        duration: 30,
        hasCodeEditor: true,
        language: "javascript",
      },
      results: {
        status: "completed",
        endTime: new Date().toISOString(),
        totalTimeSpent: 1800,
        questionsAnswered: 3,
        totalQuestions: 6,
        completionPercentage: 50,
        terminationReason: "user_ended",
      },
      conversationHistory: [
        {
          id: "msg_001",
          type: "ai",
          content: "Hello! Let's start the interview.",
          timestamp: new Date().toISOString(),
        },
        {
          id: "msg_002",
          type: "user",
          content: "I'm ready to begin.",
          timestamp: new Date().toISOString(),
        },
      ],
      performanceMetrics: {
        averageResponseTime: 8.5,
        totalSpeakingTime: 720,
        totalListeningTime: 480,
        communicationQuality: 85,
        technicalAccuracy: 88,
        problemSolvingApproach: 82,
      },
      violations: [],
      deviceMetrics: {
        tabSwitchCount: 0,
        fullscreenExits: 0,
        microphoneIssues: 0,
        cameraIssues: 0,
        networkInterruptions: 0,
      },
    };

    makeAPICall("/interview/end", "POST", payload);
  };

  const getResults = () => {
    if (!sessionId) {
      setError("Please initialize interview first to get a session ID");
      return;
    }

    makeAPICall(`/interview/results/${sessionId}`, "GET");
  };

  const endpoints = [
    {
      method: "POST",
      path: "/interview/start",
      description: "Start interview",
    },
    {
      method: "POST",
      path: "/interview/conversation",
      description: "Chat message",
    },
    {
      method: "POST",
      path: "/interview/code/execute",
      description: "Code execution",
    },
    { method: "POST", path: "/interview/end", description: "End interview" },
    {
      method: "GET",
      path: "/interview/results/:sessionId",
      description: "Fetch results",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="container-custom max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">TopPlaced AI</span> Interview REST
              API Test Client
            </h1>
            <p className="text-gray-400 text-lg">
              Test all interview API endpoints with real backend integration
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Controls */}
            <div className="space-y-6">
              {/* Endpoint Info */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Terminal size={24} className="text-[#00FFB2] mr-2" />
                  Available Endpoints
                </h2>
                <div className="space-y-3">
                  {endpoints.map((endpoint, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-mono ${
                            endpoint.method === "POST"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="text-[#00FFB2] text-sm">
                          {endpoint.path}
                        </code>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {endpoint.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Info */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Session Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg">
                    <span className="text-gray-400">API URL:</span>
                    <code className="text-[#00FFB2] text-sm">{API_URL}</code>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg">
                    <span className="text-gray-400">Session ID:</span>
                    <code className="text-[#00FFB2] text-sm">
                      {sessionId || "Not initialized"}
                    </code>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg">
                    <span className="text-gray-400">Status:</span>
                    <div className="flex items-center space-x-2">
                      {loading ? (
                        <Clock
                          size={16}
                          className="text-yellow-400 animate-spin"
                        />
                      ) : error ? (
                        <XCircle size={16} className="text-red-400" />
                      ) : (
                        <CheckCircle size={16} className="text-green-400" />
                      )}
                      <span
                        className={`text-sm ${
                          error ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">API Controls</h3>
                <div className="space-y-3">
                  <button
                    onClick={initializeInterview}
                    disabled={loading}
                    className="w-full btn-primary py-3 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Play size={20} />
                    <span>Initialize Interview (/start)</span>
                  </button>

                  <button
                    onClick={sendMessage}
                    disabled={loading || !sessionId}
                    className="w-full btn-outline py-3 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <MessageSquare size={20} />
                    <span>Send Message (/conversation)</span>
                  </button>

                  <button
                    onClick={executeCode}
                    disabled={loading || !sessionId}
                    className="w-full btn-outline py-3 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Code size={20} />
                    <span>Execute Code (/code/execute)</span>
                  </button>

                  <button
                    onClick={endInterview}
                    disabled={loading || !sessionId}
                    className="w-full btn-outline py-3 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Square size={20} />
                    <span>End Interview (/end)</span>
                  </button>

                  <button
                    onClick={getResults}
                    disabled={loading || !sessionId}
                    className="w-full btn-outline py-3 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <FileText size={20} />
                    <span>Get Results (/results/:sessionId)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Response Display */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Send size={24} className="text-[#00FFB2] mr-2" />
                  API Response
                </h2>
                {response && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(response, null, 2)
                      );
                      setStatus("Response copied to clipboard!");
                    }}
                    className="btn-outline py-1 px-3 text-sm"
                  >
                    Copy JSON
                  </button>
                )}
              </div>

              <div className="bg-[#0A0A0A] border border-gray-600 rounded-lg p-4 h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FFB2] mx-auto mb-4"></div>
                      <p className="text-gray-400">Making API call...</p>
                    </div>
                  </div>
                ) : response ? (
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Terminal
                        size={48}
                        className="text-gray-500 mx-auto mb-4"
                      />
                      <p className="text-gray-400">No API response yet</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Click &quot;Initialize Interview&quot; to start testing
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle size={16} className="text-red-400" />
                    <span className="text-red-400 font-semibold">Error:</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* API Documentation */}
          <div className="mt-8 glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">API Testing Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-[#00FFB2] mb-2">
                  Testing Flow:
                </h3>
                <ol className="text-sm text-gray-300 space-y-1">
                  <li>1. Click &quot;Initialize Interview&quot; to start</li>
                  <li>2. Use &quot;Send Message&quot; to test conversation</li>
                  <li>3. Try &quot;Execute Code&quot; for code challenges</li>
                  <li>4. &quot;End Interview&quot; to complete session</li>
                  <li>5. &quot;Get Results&quot; to fetch final scores</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-[#00FFB2] mb-2">Features:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Real backend API integration</li>
                  <li>• Session state management</li>
                  <li>• JSON response formatting</li>
                  <li>• Error handling and status updates</li>
                  <li>• Copy response to clipboard</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sample Payloads */}
          <div className="mt-8 glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Sample API Payloads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-[#00FFB2] mb-2">
                  Conversation Payload:
                </h3>
                <pre className="text-xs text-gray-300 bg-[#1A1A1A] p-3 rounded-lg overflow-x-auto">
                  {`{
  "sessionId": "session_123456",
  "message": "I have 3 years of experience..."
}`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-[#00FFB2] mb-2">
                  Code Execution Payload:
                </h3>
                <pre className="text-xs text-gray-300 bg-[#1A1A1A] p-3 rounded-lg overflow-x-auto">
                  {`{
  "sessionId": "session_123456",
  "code": "function fibonacci(n) { ... }",
  "language": "JS",
  "codeContext": {
    "questionId": "code_1",
    "question": "Fibonacci series"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
