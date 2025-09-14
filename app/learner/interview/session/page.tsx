"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Settings,
  Play,
  Square,
  Send,
  Code,
  Terminal,
  FileText,
  Clock,
  User,
  Bot,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import CodeEditor from "@/components/CodeEditor";
import AIAvatar from "@/components/AIAvatar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  initializeInterview,
  sendMessageToAI,
  executeCode,
  completeInterview,
  buildUserProfile,
  buildInterviewConfig,
} from "@/utils/api-helpers";
import {
  StartInterviewPayload,
  ChatConversationPayload,
  CodeExecutionPayload,
} from "@/types/interview-payloads";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function InterviewSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Interview configuration
  const level = searchParams.get("level");
  const category = searchParams.get("category");
  const duration = searchParams.get("duration");
  const hasCodeEditorParam = searchParams.get("hasCodeEditor");
  const selectedLanguage = searchParams.get("language"); // Get selected language from URL

  // Get the correct language for the category
  const config = buildInterviewConfig(
    level || "mid",
    category || "fullstack",
    duration || "45"
  );
  const hasCodeEditor = hasCodeEditorParam !== null ? hasCodeEditorParam === "true" : config.hasCodeEditor;
  const defaultLanguage = selectedLanguage || config.language; // Use selected language first, fallback to config

  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(
    parseInt(duration || "45") * 60
  );
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      type: "ai" | "user";
      content: string;
      timestamp: Date;
    }>
  >([]);
  const [userInput, setUserInput] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(defaultLanguage); // Use the selected language from URL or fallback to mapped language
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Cleanup media streams
  const cleanupMediaStreams = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      setMediaStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsMicOn(false);
    setIsCameraOn(false);
  }, [mediaStream]);

  // Check free trial usage
  useEffect(() => {
    const checkFreeTrialUsage = async () => {
      try {
        const response = await fetch(
          `${API_URL}/users/${user?._id}/interview-usage`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (data.freeInterviewsUsed >= 2 && !data.hasPaidPlan) {
          setWarningMessage(
            "You have used your 2 free interviews. Please upgrade to continue."
          );
          setShowWarning(true);
          setTimeout(() => {
            router.push("/pricing");
          }, 3000);
        }
      } catch (error) {
        console.error("Error checking trial usage:", error);
      }
    };

    if (user?._id && token) {
      checkFreeTrialUsage();
    }
  }, [user, token, router]);

  // Prevent tab switching and navigation
  useEffect(() => {
    if (!interviewStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setWarningMessage(
          `Warning: Tab switching detected! This is attempt ${
            tabSwitchCount + 1
          }. Your interview may be terminated.`
        );
        setShowWarning(true);

        if (tabSwitchCount >= 2) {
          setWarningMessage(
            "Interview terminated due to multiple tab switches. This violates interview guidelines."
          );
          setShowWarning(true);
          setTimeout(() => {
            handleEndInterview();
          }, 2000);
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Are you sure you want to leave the interview? Your progress will be lost.";
      return e.returnValue;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common shortcuts that could be used to cheat
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "t" ||
          e.key === "n" ||
          e.key === "w" ||
          e.key === "r" ||
          e.key === "Tab" ||
          e.key === "F12" ||
          e.key === "I")
      ) {
        e.preventDefault();
        setWarningMessage(
          "Keyboard shortcuts are disabled during the interview."
        );
        setShowWarning(true);
      }

      // Prevent F12, F11, etc.
      if (e.key.startsWith("F") && e.key !== "F5") {
        e.preventDefault();
        setWarningMessage("Function keys are disabled during the interview.");
        setShowWarning(true);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setWarningMessage("Right-click is disabled during the interview.");
      setShowWarning(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [interviewStarted, tabSwitchCount]);

  // Enter fullscreen when interview starts
  useEffect(() => {
    if (interviewStarted && !isFullscreen) {
      const enterFullscreen = async () => {
        try {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } catch (error) {
          console.error("Failed to enter fullscreen:", error);
          setWarningMessage("Please enable fullscreen mode for the interview.");
          setShowWarning(true);
        }
      };
      enterFullscreen();
    }
  }, [interviewStarted, isFullscreen]);

  // Handle fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && interviewStarted) {
        setWarningMessage("Fullscreen mode is required during the interview.");
        setShowWarning(true);
        // Try to re-enter fullscreen
        setTimeout(() => {
          document.documentElement.requestFullscreen().catch(console.error);
        }, 1000);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [interviewStarted]);
  // Initialize camera and microphone
  useEffect(() => {
    async function initializeMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to access media devices:", err);
        setWarningMessage(
          "Camera and microphone access is required for the interview."
        );
        setShowWarning(true);
      }
    }

    initializeMedia();

    // Cleanup will be handled by cleanupMediaStreams
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!interviewStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupMediaStreams();
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
  }, [cleanupMediaStreams]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleMic = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  const startInterview = async () => {
    // Initialize interview with comprehensive payload
    try {
      const sessionId = `session_${Date.now()}_${user?._id}`;

      const initPayload: StartInterviewPayload = {
        user: buildUserProfile(user),
        configuration: buildInterviewConfig(
          level || "mid",
          category || "fullstack",
          duration || "30"
        ),
        context: {
          sessionId,
          startTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          isFreeInterview: true,
          deviceInfo: {
            platform: navigator.platform || "Unknown",
            browser: navigator.userAgent.split(" ").pop() || "Unknown",
            screenResolution: `${screen.width}x${screen.height}`,
          },
        },
        preferences: {
          voiceEnabled: true,
          cameraEnabled: false,
          microphoneEnabled: true,
          fullscreenMode: false,
        },
      };

      const response = await initializeInterview(initPayload);
      console.log("Interview initialized:", response);
    } catch (error) {
      console.error("Error recording interview start:", error);
    }

    setInterviewStarted(true);
    setIsAISpeaking(true);

    // Initialize interview with AI
    const welcomeMessage = `Hello! I'm your AI interviewer for today's ${category} interview at ${level} level. This session will last ${duration} minutes. Let's begin with a brief introduction - please tell me about yourself and your experience.`;

    setMessages([
      {
        id: Date.now().toString(),
        type: "ai",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);

    // Simulate AI speaking
    setTimeout(() => {
      setIsAISpeaking(false);
    }, 3000);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: userInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsAISpeaking(true);

    try {
      // Send comprehensive AI conversation payload
      const conversationPayload: ChatConversationPayload = {
        sessionId: `session_${Date.now()}_${user?._id}`,
        user: {
          id: user?._id || "",
          name: user?.name || "",
          level: level || "mid",
          category: category || "fullstack",
        },
        message: {
          id: userMessage.id,
          type: "user",
          content: userInput,
          timestamp: new Date().toISOString(),
        },
        conversationHistory: messages.map((msg) => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
        currentContext: {
          questionNumber: messages.filter((m) => m.type === "ai").length + 1,
          timeElapsed: parseInt(duration || "45") * 60 - timeRemaining,
          timeRemaining,
          currentTopic: category || "general",
          difficulty: level || "mid",
          expectedResponseType: hasCodeEditor
            ? "code"
            : ("text" as "text" | "code" | "explanation"),
        },
        userPerformance: {
          responseTime: 0,
          communicationScore: 85,
          clarityScore: 80,
          confidenceLevel: 75,
        },
        interviewState: {
          tabSwitchCount: 0,
          violations: [],
          isFullscreen: false,
          microphoneActive: true,
          cameraActive: false,
        },
        codeContext: hasCodeEditor
          ? {
              hasCodeEditor: true,
              currentCode: code,
              language,
              codeSubmissions: messages.filter((m) => m.content.includes("```"))
                .length,
            }
          : undefined,
      };

      const response = await sendMessageToAI(conversationPayload);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai" as const,
        content:
          response.response ||
          "I understand. Let me ask you another question...",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (response.nextQuestion) {
        setCurrentQuestion(response.nextQuestion);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai" as const,
        content:
          "I apologize, but I encountered a technical issue. Let's continue with the next question.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAISpeaking(false);
    }
  };

  const runCode = async () => {
    if (!code.trim()) return;

    try {
      const codePayload: CodeExecutionPayload = {
        sessionId: `session_${Date.now()}_${user?._id}`,
        user: {
          id: user?._id || "",
          name: user?.name || "",
          level: level || "mid",
          category: category || "fullstack",
        },
        code: {
          content: code,
          language,
          questionContext: currentQuestion || "Code execution",
          submissionNumber:
            messages.filter((m) => m.content.includes("Code execution result"))
              .length + 1,
          timestamp: new Date().toISOString(),
        },
        interviewContext: {
          timeElapsed: parseInt(duration || "45") * 60 - timeRemaining,
          currentQuestion: currentQuestion || "Code Challenge",
          expectedOutput: undefined,
          testCases: [],
        },
        executionEnvironment: {
          timeout: 30,
          memoryLimit: "128MB",
          allowedLibraries: ["standard"],
        },
      };

      const result = await executeCode(codePayload);

      const codeResultMessage = {
        id: Date.now().toString(),
        type: "ai" as const,
        content: `Code execution result:\n\`\`\`\n${
          result.output || result.error
        }\n\`\`\`\n\n${result.feedback || "Good work! Let's continue."}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, codeResultMessage]);
    } catch (error) {
      console.error("Error executing code:", error);
    }
  };

  const handleEndInterview = async () => {
    // Send comprehensive completion payload
    try {
      const completionPayload = {
        sessionId: `session_${Date.now()}_${user?._id}`,
        user: buildUserProfile(user),
        configuration: buildInterviewConfig(
          level || "mid",
          category || "fullstack",
          duration || "30"
        ),
        results: {
          status: (tabSwitchCount >= 3 ? "terminated" : "completed") as
            | "terminated"
            | "completed"
            | "incomplete",
          endTime: new Date().toISOString(),
          totalTimeSpent: parseInt(duration || "45") * 60 - timeRemaining,
          questionsAnswered: messages.filter((m) => m.type === "user").length,
          totalQuestions: messages.filter((m) => m.type === "ai").length,
          completionPercentage: Math.round(
            (messages.filter((m) => m.type === "user").length /
              Math.max(messages.filter((m) => m.type === "ai").length, 1)) *
              100
          ),
          terminationReason: (tabSwitchCount >= 3
            ? "violations"
            : "user_ended") as
            | "time_up"
            | "user_ended"
            | "violations"
            | "technical_error",
        },
        conversationHistory: messages.map((msg) => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
        codeSubmissions: hasCodeEditor
          ? [
              {
                questionId: "final_code",
                question: currentQuestion || "Final code submission",
                code,
                language,
                submittedAt: new Date().toISOString(),
                executionResult: undefined,
              },
            ]
          : undefined,
        violations: Array.from({ length: tabSwitchCount }, (_, i) => ({
          type: "tab_switch" as
            | "tab_switch"
            | "fullscreen_exit"
            | "right_click"
            | "keyboard_shortcut"
            | "copy_paste",
          timestamp: new Date().toISOString(),
          description: `Tab switch violation #${i + 1}`,
          severity: "medium" as "low" | "medium" | "high",
        })),
        performanceMetrics: {
          averageResponseTime: 30,
          totalSpeakingTime: 0,
          totalListeningTime: 0,
          communicationQuality: 75,
          technicalAccuracy: 70,
          problemSolvingApproach: 80,
        },
        deviceMetrics: {
          tabSwitchCount: tabSwitchCount,
          fullscreenExits: 0,
          microphoneIssues: 0,
          cameraIssues: 0,
          networkInterruptions: 0,
        },
        aiAnalysis: {
          strengths: [],
          improvements: [],
          detailedFeedback: {},
          recommendations: [],
        },
      };

      await completeInterview(completionPayload);
    } catch (error) {
      console.error("Error recording interview completion:", error);
    }

    // Cleanup media streams
    cleanupMediaStreams();

    // Exit fullscreen
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error("Error exiting fullscreen:", error);
      }
    }

    setInterviewStarted(false);
    setIsFullscreen(false);

    // Store results for the results page and redirect with sessionId
    const sessionId = `session_${Date.now()}_${user?._id}`;
    localStorage.setItem("lastInterviewSessionId", sessionId);
    router.push(`/learner/interview/results?id=${sessionId}`);
  };

  const getLanguageOptions = () => {
    switch (category) {
      case "frontend":
        return [
          "javascript",
          "typescript",
          "html",
          "css",
          "react",
          "vue",
          "angular",
          "sass",
          "nextjs",
        ];
      case "backend":
        return [
          "javascript",
          "python",
          "java",
          "go",
          "csharp",
          "php",
          "ruby",
          "rust",
          "cpp",
          "c",
          "scala",
          "kotlin",
        ];
      case "fullstack":
        return [
          "javascript",
          "typescript",
          "python",
          "java",
          "php",
          "ruby",
          "go",
          "rust",
          "csharp",
        ];
      case "mobile":
        return [
          "react-native",
          "flutter",
          "swift",
          "kotlin",
          "java",
          "dart",
          "objective-c",
          "xamarin",
          "ionic",
          "cordova",
        ];
      case "sql":
        return ["sql"];
      case "data-analyst":
        return ["python", "r", "sql"];
      case "aws":
        return ["yaml", "json", "bash"];
      default:
        return [
          "javascript",
          "python",
          "java",
          "typescript",
          "go",
          "rust",
          "cpp",
        ];
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="glass-card p-8 max-w-md text-center border-2 border-red-500/50">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4 text-red-400">
              Interview Warning
            </h3>
            <p className="text-gray-300 mb-6">{warningMessage}</p>
            <button
              onClick={() => setShowWarning(false)}
              className="btn-primary px-6 py-2"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      <div className="pt-16">
        {/* Header Bar */}
        <div className="bg-[#0A0A0A] border-b border-[#00FFB2]/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-[#00FFB2]" />
                <span className="font-mono text-lg">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {category?.toUpperCase()} • {level?.toUpperCase()} Level
              </div>
              {tabSwitchCount > 0 && (
                <div className="text-sm text-red-400">
                  Tab Switches: {tabSwitchCount}/3
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleMic}
                className={`p-2 rounded-full ${
                  isMicOn
                    ? "bg-[#00FFB2]/20 text-[#00FFB2]"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <button
                onClick={toggleCamera}
                className={`p-2 rounded-full ${
                  isCameraOn
                    ? "bg-[#00FFB2]/20 text-[#00FFB2]"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              <button
                onClick={handleEndInterview}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Phone size={16} />
                <span>End Interview</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Panel - Video and Chat */}
          <div className="w-1/2 flex flex-col border-r border-[#00FFB2]/20">
            {/* Video Section */}
            <div className="h-1/2 bg-[#0A0A0A] p-4">
              <div className="grid grid-cols-2 gap-4 h-full">
                {/* User Video */}
                <div className="bg-[#111] rounded-lg overflow-hidden relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                    You
                  </div>
                </div>

                {/* AI Avatar */}
                <div className="bg-[#111] rounded-lg overflow-hidden relative">
                  <AIAvatar isActive={isAISpeaking} />
                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                    AI Interviewer
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Section */}
            <div className="h-1/2 flex flex-col bg-[#0A0A0A]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-[#00FFB2] text-black"
                          : "bg-[#1A1A1A] text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.type === "user" ? (
                          <User size={16} />
                        ) : (
                          <Bot size={16} className="text-[#00FFB2]" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-[#00FFB2]/20">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type your response..."
                    className="flex-1 bg-[#1A1A1A] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFB2]"
                    disabled={!interviewStarted || isAISpeaking}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={
                      !interviewStarted || isAISpeaking || !userInput.trim()
                    }
                    className="btn-primary px-4 py-2 disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Code Editor (if applicable) */}
          {hasCodeEditor ? (
            <div className="w-1/2 flex flex-col">
              <div className="bg-[#0A0A0A] border-b border-[#00FFB2]/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Code size={20} className="text-[#00FFB2]" />
                    <span className="font-semibold">Code Editor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-600 rounded px-3 py-1 text-sm"
                    >
                      {getLanguageOptions().map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={runCode}
                      className="btn-primary px-4 py-1 text-sm flex items-center space-x-1"
                    >
                      <Terminal size={14} />
                      <span>Run</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  theme="dark"
                />
              </div>
            </div>
          ) : (
            <div className="w-1/2 flex items-center justify-center bg-[#0A0A0A]">
              <div className="text-center">
                <FileText size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Interview Notes</h3>
                <p className="text-gray-400">
                  This interview focuses on behavioral and conceptual questions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Start Interview Overlay */}
        {!interviewStarted && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="glass-card p-8 text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-gray-400 mb-6">
                Your {category} interview at {level} level is about to begin.
                Duration: {duration} minutes.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <p className="text-yellow-400 text-sm">
                  <strong>Important:</strong> This interview will be in
                  fullscreen mode. Tab switching is monitored and limited to 3
                  attempts.
                </p>
              </div>
              <button
                onClick={startInterview}
                className="btn-primary px-8 py-3 text-lg flex items-center justify-center mx-auto"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterviewSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewSessionContent />
    </Suspense>
  );
}
