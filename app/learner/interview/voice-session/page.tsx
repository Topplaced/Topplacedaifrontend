"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Play,
  Square,
  Send,
  Code,
  Terminal,
  Clock,
  User,
  Bot,
  AlertTriangle,
  Download,
  Volume2,
  VolumeX,
  Pause,
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import CodeEditor from "@/components/CodeEditor";
import AIAvatar from "@/components/AIAvatar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { io, Socket } from "socket.io-client";
import { buildInterviewConfig, updateInterviewProgress } from '@/utils/api-helpers';

// Your backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Message {
  id: string;
  type: "ai" | "user" | "system";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  isPlaying?: boolean;
}

function VoiceInterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Add level mapping function
  const mapLevelToBackend = (frontendLevel: string): string => {
    const levelMap: { [key: string]: string } = {
      'entry': 'beginner',
      'mid': 'intermediate', 
      'senior': 'advanced',
      'lead': 'advanced'
    };
    return levelMap[frontendLevel] || 'intermediate';
  };

// Interview configuration
const level = searchParams.get("level") || "mid";
const category = searchParams.get("category") || "fullstack";
const duration = searchParams.get("duration") || "30";
const hasCodeEditor = searchParams.get("hasCodeEditor") === "true" || true;

// Get the correct language for the category
const config = buildInterviewConfig(level, category, duration);
const defaultLanguage = config.language;

  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(parseInt(duration) * 60);
  const [messages, setMessages] = useState<Message[]>([]);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(defaultLanguage); // Use the mapped language
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [interviewProgress, setInterviewProgress] = useState(0);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  
  // Response time tracking like testInterview.html
  const [responseStartTime, setResponseStartTime] = useState<number | null>(null);
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);
  
  // Debug panel like testInterview.html
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugLogs, setDebugLogs] = useState<any[]>([]);
  const [codeExecutionSuccess, setCodeExecutionSuccess] = useState(false);
  const [lastExecutionResult, setLastExecutionResult] = useState<any>(null);
  
  // Progress tracking function like testInterview.html
  const updateProgress = (answered: number, total: number) => {
    setQuestionsAnswered(answered);
    setTotalQuestions(total);
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
    setInterviewProgress(percentage);
  };
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(hasCodeEditor); // Show by default if available
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<any>(null);

  const [sessionId, setSessionId] = useState<string>("");
  const [totalQuestions, setTotalQuestions] = useState(6);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("");

  // Build interview payload from user data
  const buildInterviewPayload = () => {
    return {
      user: {
        id: user?._id || "user123",
        name: user?.name || "John Doe",
        email: user?.email || "john@example.com",
        role: user?.role || "user",
        experience: user?.experience || "3 years in full-stack development",
        skills: user?.tech_stack
          ? user.tech_stack.split(",")
          : ["JavaScript", "React", "Node.js", "Python", "SQL"],
        goals: user?.goals || "Land a senior developer role",
        education: user?.education
          ? JSON.parse(user.education)
          : [
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
        profileCompletion: user?.profile_completion || 85,
      },
      configuration: {
        level: mapLevelToBackend(level), // Map frontend level to backend level
        category: category,
        duration: parseInt(duration),
        hasCodeEditor: hasCodeEditor,
        language: language,
      },
      context: {
        sessionId: `session_${Date.now()}_${user?._id}`,
        startTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isFreeInterview: true,
      },
    };
  };

  // Initialize Google Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("🎤 Speech recognition result:", transcript);
        setTranscript(transcript);

        // Add user message
        const userMessage: Message = {
          id: `user_${Date.now()}`,
          type: "user",
          content: transcript,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Send answer via REST API
        if (sessionId) {
          console.log("📤 Sending answer via REST API:", transcript);
          sendAnswerToAPI(transcript);
        }

        setQuestionsAnswered((prev) => prev + 1);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("❌ Speech recognition error:", event.error);
        setTranscript("Error recognizing speech. Please try again.");
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        console.log("🛑 Speech recognition ended");
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Initialize Speech Synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, [sessionId, currentQuestionId]);

  // Text-to-Speech Audio Play
  const playAIAudio = async (audioUrl: string, text: string) => {
    console.log("🔊 Playing AI audio:", text);
    setIsAISpeaking(true);
    setCurrentAudioUrl(audioUrl);
    setIsAudioPlaying(true);

    try {
      // Try ElevenLabs TTS API first with proper error handling
      const response = await fetch('/api/text-to-speech', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text,
          voice_id: 'EXAVITQu4vr4xnSDxMaL', // Sarah voice
          model_id: 'eleven_monolingual_v1'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔊 ElevenLabs TTS API response:', data);

        if (data.useBrowserTTS && speechSynthesis) {
          // Use browser's built-in speech synthesis
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 1;

          // Get a female voice if available
          const voices = speechSynthesis.getVoices();
          const femaleVoice = voices.find(
            (voice: { name: string | string[]; gender: string }) =>
              voice.name.includes("Female") ||
              voice.name.includes("Samantha") ||
              voice.name.includes("Karen") ||
              voice.gender === "female"
          );

          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }

          utterance.onend = () => {
            setIsAISpeaking(false);
            setIsAudioPlaying(false);
            setCurrentAudioUrl(null);
          };

          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsAISpeaking(false);
            setIsAudioPlaying(false);
            setCurrentAudioUrl(null);
          };

          speechSynthesis.speak(utterance);
        } else if (data.audioUrl && data.audioContent) {
          // Use ElevenLabs TTS audio
          const audio = new Audio(data.audioUrl);
          audio.onerror = (error) => {
            console.error('Audio playback error:', error);
            setIsAISpeaking(false);
            setIsAudioPlaying(false);
            setCurrentAudioUrl(null);
          };
          audio.onended = () => {
            setIsAISpeaking(false);
            setIsAudioPlaying(false);
            setCurrentAudioUrl(null);
          };
          audio.play().catch(error => {
            console.error('Audio play failed:', error);
            setIsAISpeaking(false);
            setIsAudioPlaying(false);
            setCurrentAudioUrl(null);
          });
        } else {
          throw new Error('No audio content from ElevenLabs or browser TTS available');
        }
      } else {
        const errorData = await response.json();
        throw new Error(`ElevenLabs TTS API failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("❌ ElevenLabs TTS error, using simulation fallback:", error);
      // Fallback to simulation
      const duration = Math.random() * 2000 + 3000;
      setTimeout(() => {
        setIsAISpeaking(false);
        setIsAudioPlaying(false);
        setCurrentAudioUrl(null);
      }, duration);
    }
  };

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
        console.error("❌ Failed to access media devices:", err);
        setWarningMessage(
          "Camera and microphone access is required for the interview."
        );
        setShowWarning(true);
      }
    }

    initializeMedia();
  }, []);

  // Auto-start interview when component mounts
  useEffect(() => {
    if (!interviewStarted && !isStartingInterview) {
      startInterview();
    }
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

  // Update progress
  useEffect(() => {
    const progress =
      totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0;
    setInterviewProgress(progress);
  }, [questionsAnswered, totalQuestions]);

  // Auto-save interview progress every 10 seconds
  useEffect(() => {
    if (sessionId && interviewStarted) {
      const interval = setInterval(async () => {
        await updateInterviewProgress({
          sessionId,
          progress: interviewProgress,
          questionsAnswered,
          timeRemaining
        });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [sessionId, interviewStarted, interviewProgress]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
  }, [mediaStream]);

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

  const sendAnswerToAPI = async (answer: string, isCode: boolean = false) => {
    // Calculate response time if tracking started
    let responseTime = 18; // Default response time
    if (responseStartTime) {
      responseTime = Math.round((Date.now() - responseStartTime) / 1000); // Convert to seconds
      setLastResponseTime(responseTime);
      setResponseStartTime(null); // Reset for next question
    }
    
    try {
      const body: any = {
        sessionId: sessionId,
        message: answer,
        questionId: currentQuestionId,
        responseTime: responseTime,
      };

      if (isCode) {
        body.codeContext = {
          isCodeSubmission: true,
          questionId: currentQuestionId,
          language: language,
          code: code,
          stdin: "", // Empty stdin for now
        };
      }

      const response = await fetch(`${API_URL}/interview/conversation/enhanced`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Enhanced conversation response:", data);
        
        // Add to debug logs like testInterview.html
        if (showDebugPanel) {
          const debugEntry = `[${new Date().toLocaleTimeString()}] Enhanced API Response: ${JSON.stringify(data, null, 2)}`;
          setDebugLogs(prev => [...prev.slice(-9), debugEntry]); // Keep last 10 entries
        }

        // Handle AI response
        if (data.aiResponse) {
          const aiMessage: Message = {
            id: `ai_${Date.now()}`,
            type: "ai",
            content: data.aiResponse,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
          playAIAudio("", data.aiResponse);
        }

        // Handle current question
        if (data.currentQuestion) {
          setCurrentQuestionId(data.currentQuestion.id);
          setCurrentQuestionNumber(data.currentQuestion.questionNumber);
          if (data.currentQuestion.totalQuestions) {
            setTotalQuestions(data.currentQuestion.totalQuestions);
          }
          
          // Start timing for next question
          setResponseStartTime(Date.now());
          
          const questionMessage: Message = {
            id: `question_${Date.now()}`,
            type: "ai",
            content: `Next Question (${data.currentQuestion.questionNumber}/${data.currentQuestion.totalQuestions}): ${data.currentQuestion.question}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, questionMessage]);
          playAIAudio("", data.currentQuestion.question);
        }

        // Update progress
        if (data.progress) {
          updateProgress(data.progress.questionsAnswered || questionsAnswered, data.progress.totalQuestions || totalQuestions);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error sending answer:", error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: "system",
        content: `❌ Failed to send answer: ${
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : String(error)
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const [isStartingInterview, setIsStartingInterview] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const startInterview = async () => {
    console.log("🚀 Starting interview...");
    setIsStartingInterview(true);
    setStartError(null);

    const interviewPayload = buildInterviewPayload();
    console.log(
      "📤 Sending interview initialization payload:",
      interviewPayload
    );

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_URL}/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(interviewPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Interview started:", data);

        setSessionId(data.sessionId);
        if (data.firstQuestion?.totalQuestions) {
          updateProgress(0, data.firstQuestion.totalQuestions);
        } else {
          setTotalQuestions(6);
        }

        const welcomeMessage: Message = {
          id: `welcome_${Date.now()}`,
          type: "ai",
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, welcomeMessage]);

        if (data.firstQuestion) {
          const questionMessage: Message = {
            id: `q1_${Date.now()}`,
            type: "ai",
            content: data.firstQuestion.question,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, questionMessage]);
          setCurrentQuestionNumber(data.firstQuestion.questionNumber);
          setCurrentQuestionId(data.firstQuestion.id);

          playAIAudio("", data.firstQuestion.question);
        }

        setInterviewStarted(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("❌ Failed to start interview:", error);
      
      let errorMessage = "Failed to start interview. ";
      if (error.name === 'AbortError') {
        errorMessage += "Request timed out. Please check your connection and try again.";
      } else if (error.message?.includes('fetch')) {
        errorMessage += "Unable to connect to server. Please check your internet connection.";
      } else {
        errorMessage += error.message || "Unknown error occurred.";
      }
      
      setStartError(errorMessage);
    } finally {
      setIsStartingInterview(false);
    }
  };

  const retryStartInterview = () => {
    setStartError(null);
    startInterview();
  };

  const startListening = async () => {
    if (!isMicOn) {
      setWarningMessage("Please enable your microphone to respond.");
      setShowWarning(true);
      return;
    }

    console.log("🎤 Starting speech recognition...");
    setIsListening(true);
    setTranscript("Listening...");

    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        console.error("❌ Failed to start speech recognition:", error);
        setIsListening(false);
        setTranscript("Speech recognition not available. Please try again.");
      }
    } else {
      console.warn("⚠️ Speech recognition not available, using fallback");
      setIsListening(false);
      setTranscript("Speech recognition not supported in this browser.");
    }
  };

  const stopListening = () => {
    console.log("🛑 Stopping speech recognition...");
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
    setTranscript("");
  };

  const runCode = async () => {
    if (!code.trim()) {
      setWarningMessage("Please write some code before running.");
      setShowWarning(true);
      return;
    }

    console.log("💻 Executing code...");

    const codeMessage: Message = {
      id: `code_${Date.now()}`,
      type: "user",
      content: `Code submitted:\n\`\`\`${language}\n${code}\n\`\`\``,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, codeMessage]);

    try {
      // First execute the code
      const executeResponse = await fetch(`${API_URL}/interview/code/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          sessionId: sessionId,
          language: language.toUpperCase(),
          code: code,
          stdin: "", // Add stdin support like testInterview.html
          codeContext: {
            questionId: currentQuestionId || `code_${Date.now()}`,
            question: `Code execution for ${language}`,
          },
        }),
      });

      if (executeResponse.ok) {
        const result = await executeResponse.json();
        console.log("✅ Code execution result:", result);

        // Store execution result and mark as successful
        setLastExecutionResult(result);
        setCodeExecutionSuccess(true);

        // Display execution results with enhanced formatting like testInterview.html
        const executionTime = Number(result.executionTime).toFixed(3);
        const resultMessage: Message = {
          id: `result_${Date.now()}`,
          type: "ai",
          content: `Code Execution Results:\n→ Output: ${
            result.output || "No output"
          }\n→ Time: ${executionTime}s\n→ Memory: ${result.memory}\n\n✅ Code ran successfully! You can now submit your solution.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, resultMessage]);
      } else {
        const errorData = await executeResponse.json().catch(() => ({}));
        const errorMsg = errorData.message || `HTTP ${executeResponse.status}`;
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("❌ Code execution error:", error);
      setCodeExecutionSuccess(false);
      setLastExecutionResult(null);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: "system",
        content: `❌ Code execution failed: ${
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : String(error)
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const submitCode = async () => {
    if (!codeExecutionSuccess || !lastExecutionResult) {
      setWarningMessage("Please run your code successfully before submitting.");
      setShowWarning(true);
      return;
    }

    console.log("📤 Submitting code solution...");

    try {
      // Send code submission to enhanced conversation API with execution results
      await sendAnswerToAPI(`Code submitted and executed. Output: ${lastExecutionResult.output || "No output"}`, true);
      
      // Reset code execution state after successful submission
      setCodeExecutionSuccess(false);
      setLastExecutionResult(null);
      
      const submitMessage: Message = {
        id: `submit_${Date.now()}`,
        type: "system",
        content: "✅ Code solution submitted successfully!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, submitMessage]);
    } catch (error) {
      console.error("❌ Code submission error:", error);
      const errorMessage: Message = {
        id: `submit_error_${Date.now()}`,
        type: "system",
        content: `❌ Code submission failed: ${
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : String(error)
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleEndInterview = async () => {
    console.log("🏁 Ending interview...");

    try {
      const endPayload = {
        sessionId: sessionId,
        user: buildInterviewPayload().user,
        configuration: buildInterviewPayload().configuration,
        results: {
          status: "completed",
          endTime: new Date().toISOString(),
          totalTimeSpent: parseInt(duration) * 60 - timeRemaining,
          questionsAnswered: questionsAnswered,
          totalQuestions: totalQuestions,
          completionPercentage: Math.round(
            (questionsAnswered / totalQuestions) * 100
          ),
          terminationReason: timeRemaining <= 0 ? "time_up" : "user_ended",
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
                questionId: currentQuestionId || "final_code",
                question: "Code submission",
                code: code,
                language: language,
                submittedAt: new Date().toISOString(),
              },
            ]
          : [],
        performanceMetrics: {
          averageResponseTime: 8.5,
          totalSpeakingTime: questionsAnswered * 30,
          totalListeningTime:
            parseInt(duration) * 60 - timeRemaining - questionsAnswered * 30,
          communicationQuality: 85,
          technicalAccuracy: 88,
          problemSolvingApproach: 82,
        },
        violations: [],
        deviceMetrics: {
          tabSwitchCount: tabSwitchCount,
          fullscreenExits: 0,
          microphoneIssues: 0,
          cameraIssues: 0,
          networkInterruptions: 0,
        },
      };

      console.log("📤 Sending end interview payload:", endPayload);

      const response = await fetch(`${API_URL}/interview/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(endPayload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Interview ended successfully:", result);
      } else {
        console.error("❌ Failed to end interview:", response.status);
      }
    } catch (error) {
      console.error("❌ Error ending interview:", error);
    }

    // Cleanup media streams
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }

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
    router.push("/learner/interview/results");
  };

  // Additional API functions from testInterview.html
  const getConversationHistory = async () => {
    if (!sessionId) {
      console.warn("⚠️ No session ID available for history retrieval");
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: "system",
        content: "No session ID available for loading history.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/interview/conversation/history/${encodeURIComponent(sessionId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Conversation history loaded:", data);
        
        if (data.success && data.conversations && data.conversations.length > 0) {
          // Convert history to messages and replace current messages
          const historyMessages: Message[] = data.conversations.map((conv: any, index: number) => ({
            id: `history_${index}_${conv.timestamp}`,
            type: conv.role === 'user' ? 'user' : 'ai',
            content: conv.message,
            timestamp: new Date(conv.timestamp)
          }));
          
          // Replace current messages with history
          setMessages(historyMessages);
          
          // Add confirmation message
          const confirmationMessage: Message = {
            id: `history_loaded_${Date.now()}`,
            type: "system",
            content: `✅ Conversation history loaded: ${data.conversations.length} messages from ${new Date(data.conversations[0]?.timestamp).toLocaleString()} to ${new Date(data.conversations[data.conversations.length - 1]?.timestamp).toLocaleString()}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, confirmationMessage]);
          
          // Update progress if available in history
          if (data.progress) {
            updateProgress(data.progress.answered || questionsAnswered, data.progress.total || totalQuestions);
          }
        } else {
          const noHistoryMessage: Message = {
            id: `no_history_${Date.now()}`,
            type: "system",
            content: "No conversation history found for this session.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, noHistoryMessage]);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error loading conversation history:", error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: "system",
        content: "Error loading conversation history. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const getInterviewResults = async () => {
    if (!sessionId) {
      console.warn("⚠️ No session ID available for results retrieval");
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: "system",
        content: "No session ID available for fetching results.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/interview/results/${encodeURIComponent(sessionId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Interview results fetched:", data);
        
        if (data.success && data.results) {
          // Format detailed results like testInterview.html
          const results = data.results;
          let resultsContent = `🎯 **Interview Results Summary**\n\n`;
          
          if (results.overallScore !== undefined) {
            resultsContent += `📊 **Overall Score:** ${results.overallScore}%\n`;
          }
          
          if (results.skillScores) {
            resultsContent += `\n🔧 **Skill Breakdown:**\n`;
            Object.entries(results.skillScores).forEach(([skill, score]) => {
              resultsContent += `• ${skill}: ${score}%\n`;
            });
          }
          
          if (results.feedback) {
            resultsContent += `\n💬 **Feedback:**\n${results.feedback}\n`;
          }
          
          if (results.strengths && results.strengths.length > 0) {
            resultsContent += `\n✅ **Strengths:**\n`;
            results.strengths.forEach((strength: string) => {
              resultsContent += `• ${strength}\n`;
            });
          }
          
          if (results.improvements && results.improvements.length > 0) {
            resultsContent += `\n🔄 **Areas for Improvement:**\n`;
            results.improvements.forEach((improvement: string) => {
              resultsContent += `• ${improvement}\n`;
            });
          }
          
          if (results.duration) {
            resultsContent += `\n⏱️ **Interview Duration:** ${Math.round(results.duration / 60)} minutes\n`;
          }
          
          if (results.questionsAnswered && results.totalQuestions) {
            resultsContent += `📝 **Questions:** ${results.questionsAnswered}/${results.totalQuestions} answered\n`;
          }
          
          const resultsMessage: Message = {
            id: `results_${Date.now()}`,
            type: "system",
            content: resultsContent,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, resultsMessage]);
        } else {
          const noResultsMessage: Message = {
            id: `no_results_${Date.now()}`,
            type: "system",
            content: "No interview results available for this session.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, noResultsMessage]);
        }
        return data;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error fetching interview results:", error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: "system",
        content: "Error fetching interview results. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const getNextQuestion = async () => {
    if (!sessionId) {
      console.warn("⚠️ No session ID available for next question");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/interview/question/${encodeURIComponent(sessionId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Next question fetched:", data);
        
        if (data.question) {
          setCurrentQuestionId(data.id || currentQuestionId);
          setCurrentQuestionNumber(data.questionNumber || currentQuestionNumber + 1);
          
          // Update progress if total questions provided
          if (data.totalQuestions) {
            updateProgress(questionsAnswered, data.totalQuestions);
          }
          
          const questionMessage: Message = {
            id: `next_question_${Date.now()}`,
            type: "ai",
            content: `Question ${data.questionNumber || currentQuestionNumber + 1}: ${data.question}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, questionMessage]);
          playAIAudio("", data.question);
        } else if (data.message?.includes('completed')) {
          const completionMessage: Message = {
            id: `completion_${Date.now()}`,
            type: "ai",
            content: "Interview completed. No more questions available.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, completionMessage]);
        }
        return data;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error fetching next question:", error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: "system",
        content: "Error fetching next question. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const downloadTranscript = () => {
    const transcript = messages
      .map(
        (msg) =>
          `[${msg.timestamp.toLocaleTimeString()}] ${msg.type.toUpperCase()}: ${
            msg.content
          }`
      )
      .join("\n\n");

    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview_transcript_${sessionId || "session"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const replayAIMessage = (message: Message) => {
    if (message.content) {
      playAIAudio("", message.content);
    }
  };

  const getLanguageOptions = () => {
    switch (category) {
      case "frontend":
        return ["javascript", "typescript", "html", "css"];
      case "backend":
        return ["javascript", "python", "java", "go"];
      case "fullstack":
        return ["javascript", "typescript", "python", "java"];
      case "sql":
        return ["sql"];
      case "data-analyst":
        return ["python", "r", "sql"];
      case "aws":
        return ["yaml", "json", "bash"];
      default:
        return ["javascript", "python", "java"];
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
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-[#00FFB2]" />
                <span className="font-mono text-lg">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Voice Interview • {category?.toUpperCase()} •{" "}
                {level?.toUpperCase()}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-900/50 border border-blue-700/50 rounded-full text-xs text-blue-200">
                    Answered: <span className="font-semibold">{questionsAnswered}</span>
                  </span>
                  <span className="px-2 py-1 bg-purple-900/50 border border-purple-700/50 rounded-full text-xs text-purple-200">
                    Total: <span className="font-semibold">{totalQuestions}</span>
                  </span>
                  <span className="px-2 py-1 bg-green-900/50 border border-green-700/50 rounded-full text-xs text-green-200">
                    Completion: <span className="font-semibold">{interviewProgress}%</span>
                  </span>
                </div>
                <div className="w-32 bg-[#1A1A1A] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${interviewProgress}%` }}
                  />
                </div>
              </div>
              {sessionId && (
                <div className="text-xs text-gray-500">
                  Session: {sessionId.slice(-8)}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
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
                onClick={downloadTranscript}
                className="p-2 rounded-full bg-[#00FFB2]/20 text-[#00FFB2] hover:bg-[#00FFB2]/30"
                title="Download Transcript"
              >
                <Download size={20} />
              </button>

              <button
                  onClick={getNextQuestion}
                  className="p-2 rounded-full bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
                  title="Get Next Question"
                  disabled={!sessionId}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Conversation History Button */}
                <button
                  onClick={getConversationHistory}
                  className="p-2 rounded-full bg-green-600/20 text-green-400 hover:bg-green-600/30"
                  title="Load Conversation History"
                  disabled={!sessionId}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                {/* Interview Results Button */}
                 <button
                   onClick={getInterviewResults}
                   className="p-2 rounded-full bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30"
                   title="Get Interview Results"
                   disabled={!sessionId}
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 </button>
                 
                 {/* Debug Panel Toggle */}
                 <button
                   onClick={() => setShowDebugPanel(!showDebugPanel)}
                   className={`p-2 rounded-full transition-colors ${
                     showDebugPanel 
                       ? 'bg-red-600/30 text-red-400' 
                       : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                   }`}
                   title="Toggle Debug Panel"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                 </button>

              {hasCodeEditor && (
                <button
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                  className="p-2 rounded-full bg-[#00FFB2]/20 text-[#00FFB2] hover:bg-[#00FFB2]/30"
                  title={
                    showCodeEditor ? "Hide Code Editor" : "Show Code Editor"
                  }
                >
                  {showCodeEditor ? (
                    <Minimize2 size={20} />
                  ) : (
                    <Code size={20} />
                  )}
                </button>
              )}

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
                  {isListening && (
                    <div className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded text-xs animate-pulse">
                      🎤 Recording...
                    </div>
                  )}
                </div>

                {/* AI Avatar */}
                <div className="bg-[#111] rounded-lg overflow-hidden relative">
                  <AIAvatar isActive={isAISpeaking} />
                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
                    AI Interviewer
                  </div>
                  {isAudioPlaying && (
                    <div className="absolute top-2 right-2 bg-[#00FFB2] px-2 py-1 rounded text-xs text-black">
                      🔊 Speaking...
                    </div>
                  )}
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
                      message.type === "user"
                        ? "justify-end"
                        : message.type === "system"
                        ? "justify-center"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-[#00FFB2] text-black"
                          : message.type === "system"
                          ? "bg-yellow-500/20 text-yellow-400 text-center"
                          : "bg-[#1A1A1A] text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          {message.type === "user" ? (
                            <User size={16} />
                          ) : message.type === "system" ? (
                            <Bot size={16} className="text-yellow-400" />
                          ) : (
                            <Bot size={16} className="text-[#00FFB2]" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {message.type === "ai" && (
                          <button
                            onClick={() => replayAIMessage(message)}
                            className="text-[#00FFB2] hover:text-[#00CC8E] ml-2"
                            title="Replay Audio"
                          >
                            <Volume2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Voice Input Section */}
              <div className="p-4 border-t border-[#00FFB2]/20">
                <div className="flex flex-col space-y-3">
                  {transcript && (
                    <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#00FFB2]/20">
                      <div className="text-sm text-gray-400 mb-1">
                        Transcript:
                      </div>
                      <div className="text-white">{transcript}</div>
                    </div>
                  )}

                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={!interviewStarted || isAISpeaking}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isListening
                          ? "bg-red-500 hover:bg-red-600 animate-pulse"
                          : "bg-[#00FFB2] hover:bg-[#00CC8E]"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isListening ? (
                        <Square size={24} className="text-white" />
                      ) : (
                        <Mic size={24} className="text-black" />
                      )}
                    </button>

                    <div className="text-center">
                      <div className="text-sm text-gray-400">
                        {!interviewStarted
                          ? "Start interview to begin"
                          : isAISpeaking
                          ? "AI is speaking..."
                          : isListening
                          ? "Recording... Click to stop"
                          : "Click to speak"}
                      </div>
                      {!isMicOn && (
                        <div className="text-xs text-red-400 mt-1">
                          Microphone is disabled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Code Editor (if applicable) */}
          {hasCodeEditor && showCodeEditor ? (
            <div className="w-1/2 flex flex-col">
              <div className="bg-[#0A0A0A] border-b border-[#00FFB2]/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Code size={20} className="text-[#00FFB2]" />
                    <span className="font-semibold">Code Editor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCodeEditor(false)}
                      className="p-1 rounded bg-[#1A1A1A] hover:bg-[#333] text-gray-400 hover:text-white"
                      title="Close Code Editor"
                    >
                      <Minimize2 size={16} />
                    </button>
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
                    {codeExecutionSuccess && (
                      <button
                        onClick={submitCode}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 text-sm rounded flex items-center space-x-1"
                      >
                        <Send size={14} />
                        <span>Submit Solution</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <CodeEditor
                  value={code}
                  onChange={(newCode) => {
                    setCode(newCode);
                    // Reset execution success when code is modified
                    if (codeExecutionSuccess) {
                      setCodeExecutionSuccess(false);
                      setLastExecutionResult(null);
                    }
                  }}
                  language={language}
                  theme="dark"
                />
              </div>
            </div>
          ) : hasCodeEditor && !showCodeEditor ? (
            <div className="w-1/2 flex items-center justify-center bg-[#0A0A0A] border-l border-[#00FFB2]/20">
              <div className="text-center">
                <Code size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Code Editor Available
                </h3>
                <p className="text-gray-400 mb-4">
                  Click the code editor button in the header to open the coding
                  environment.
                </p>
                <button
                  onClick={() => setShowCodeEditor(true)}
                  className="btn-primary flex items-center mx-auto"
                >
                  <Code size={16} className="mr-2" />
                  Open Code Editor
                </button>
              </div>
            </div>
          ) : !hasCodeEditor ? (
            <div className="w-1/2 flex items-center justify-center bg-[#0A0A0A]">
              <div className="text-center">
                <Bot size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Voice Interview</h3>
                <p className="text-gray-400 mb-4">
                  This interview focuses on verbal communication and behavioral
                  questions.
                </p>
                <div className="bg-[#1A1A1A] p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Interview Tips:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Speak clearly and at a moderate pace</li>
                    <li>• Provide specific examples when possible</li>
                    <li>• Take a moment to think before answering</li>
                    <li>• Ask for clarification if needed</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Debug Panel like testInterview.html */}
        {showDebugPanel && (
          <div className="fixed bottom-4 right-4 w-96 max-h-80 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 overflow-hidden z-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">Debug Panel - Raw API Responses</h3>
              <button
                onClick={() => setDebugLogs([])}
                className="text-xs text-gray-400 hover:text-white"
                title="Clear Logs"
              >
                Clear
              </button>
            </div>
            <div className="overflow-y-auto max-h-64 space-y-2">
              {debugLogs.length === 0 ? (
                <p className="text-xs text-gray-500">No debug logs yet...</p>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="text-xs text-green-400 font-mono bg-gray-800/50 p-2 rounded border-l-2 border-green-500">
                    <pre className="whitespace-pre-wrap break-words">{log}</pre>
                  </div>
                ))
              )}
            </div>
            {lastResponseTime && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs text-blue-400">Last Response Time: {lastResponseTime}s</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function VoiceInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FFB2] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading interview session...</p>
          </div>
        </div>
      }
    >
      <VoiceInterviewContent />
    </Suspense>
  );
}
