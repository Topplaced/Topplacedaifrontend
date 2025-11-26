"use client";
//test
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
import BottomNav from "@/components/BottomNav";
import CodeEditor from "@/components/CodeEditor";
import AIAvatar from "@/components/AIAvatar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { io, Socket } from "socket.io-client";
import {
  buildInterviewConfig,
  updateInterviewProgress,
} from "@/utils/api-helpers";

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
      beginner: "beginner",
      intermediate: "intermediate",
      advanced: "advanced",
      // Legacy mappings for backward compatibility
      entry: "beginner",
      mid: "intermediate",
      senior: "advanced",
      lead: "advanced",
    };
    return levelMap[frontendLevel] || "intermediate";
  };

  // Interview configuration from URL parameters
  const level = searchParams.get("level") || "mid";
  const category = searchParams.get("category") || "fullstack";
  const field = searchParams.get("field") || "";
  const duration = searchParams.get("duration") || "30";
  const userId = searchParams.get("userId") || user?._id || "";
  const userName = searchParams.get("userName") || user?.name || "";
  const userEmail = searchParams.get("userEmail") || user?.email || "";
  const isFreeInterview = searchParams.get("isFreeInterview") === "true";
  const selectedLanguage = searchParams.get("language"); // Get selected language from URL

  // Get the correct configuration for the category
  const config = buildInterviewConfig(level, category, duration);
  const hasCodeEditorParam = searchParams.get("hasCodeEditor");
  const hasCodeEditor =
    hasCodeEditorParam !== null
      ? hasCodeEditorParam === "true"
      : config.hasCodeEditor;
  const defaultLanguage = selectedLanguage || config.language; // Use selected language first, fallback to config

  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(parseInt(duration) * 60);
  const [messages, setMessages] = useState<Message[]>([]);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(defaultLanguage); // Use the selected language from URL or fallback to mapped language
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

  // AI Speech Queue Management
  const [aiSpeechQueue, setAiSpeechQueue] = useState<
    Array<{ id: string; text: string; audioUrl: string }>
  >([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Loading states for buttons
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [isEndingInterview, setIsEndingInterview] = useState(false);

  // Response time tracking like testInterview.html
  const [responseStartTime, setResponseStartTime] = useState<number | null>(
    null
  );
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
  const [showCodeEditor, setShowCodeEditor] = useState<boolean>(hasCodeEditor); // Show by default if available
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<any>(null);

  const [sessionId, setSessionId] = useState<string>("");
  const [totalQuestions, setTotalQuestions] = useState(6);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("");
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // Build interview payload from URL parameters and user data
  const buildInterviewPayload = () => {
    return {
      user: {
        id: userId || user?._id || "user123",
        name: userName || user?.name || "User",
        email: userEmail || user?.email || "user@example.com",
        role: user?.role || "user",
        experience: user?.experience || "Professional experience in technology",
        skills: user?.tech_stack
          ? user.tech_stack.split(",")
          : ["JavaScript", "React", "Node.js", "Python", "SQL"],
        goals: user?.goals || "Advance career in technology",
        education: user?.education
          ? typeof user.education === "string"
            ? JSON.parse(user.education)
            : user.education
          : [
              {
                degree: "Bachelor's Degree",
                institution: "University",
                year: new Date().getFullYear() - 2,
              },
            ],
        workExperience: user?.experience
          ? typeof user.experience === "string"
            ? JSON.parse(user.experience)
            : user.experience
          : [
              {
                title: "Software Developer",
                company: "Technology Company",
                duration: "Recent Experience",
                description:
                  "Professional software development experience with modern technologies and best practices.",
              },
            ],
        profileCompletion: user?.profile_completion || 85,
      },
      configuration: {
        level: mapLevelToBackend(level), // Map frontend level to backend level
        category: category,
        field: field,
        duration: parseInt(duration),
        hasCodeEditor: hasCodeEditor,
        language: language,
      },
      context: {
        sessionId: `session_${Date.now()}_${userId}`,
        startTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isFreeInterview: isFreeInterview,
      },
    };
  };

  // Initialize Google Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    // ✅ Use browser-supported SpeechRecognition
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true; // Enable continuous recognition for better live captions
    recognitionInstance.interimResults = true; // Enable interim results for live captions
    recognitionInstance.lang = "en-US";
    recognitionInstance.maxAlternatives = 1;

    let finalTranscript = "";

    recognitionInstance.onstart = () => {
      console.log("🎤 Recognition started");
      finalTranscript = "";
      setTranscript("Listening...");
    };

    recognitionInstance.onresult = (event: any) => {
      let interimTranscript = "";
      finalTranscript = "";

      // Process all results to build both interim and final transcripts
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // Show live captions: final transcript + interim (in progress)
      const displayText = finalTranscript + interimTranscript;
      if (displayText.trim()) {
        setTranscript(displayText.trim());
        console.log("🎤 Live caption:", displayText.trim());
      }
    };

    recognitionInstance.onerror = (event: any) => {
      console.error("❌ Speech recognition error:", event.error);

      if (event.error === "no-speech" || event.error === "audio-capture") {
        console.log("⏸️ No speech detected or mic issue");
        setTranscript("No speech detected. Please try speaking again.");
      } else {
        setTranscript("Error recognizing speech. Please try again.");
      }

      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      console.log("🛑 Speech recognition ended");

      // Don't auto-restart - let user control when to stop
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    // --- Initialize Speech Synthesis ---
    if ("speechSynthesis" in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }

    return () => {
      try {
        recognitionInstance.stop();
      } catch {}
    };
  }, [sessionId, currentQuestionId]);

  // AI Speech Queue Management Functions
  const addToSpeechQueue = (text: string, audioUrl: string = "") => {
    const id = `speech_${Date.now()}_${Math.random()}`;
    setAiSpeechQueue((prev) => [...prev, { id, text, audioUrl }]);
  };

  const processNextInQueue = useCallback(async () => {
    if (isProcessingQueue || aiSpeechQueue.length === 0) return;

    setIsProcessingQueue(true);
    const nextItem = aiSpeechQueue[0];

    try {
      await playAIAudioDirect(nextItem.audioUrl, nextItem.text);
    } catch (error) {
      console.error("Error processing speech queue item:", error);
    } finally {
      setAiSpeechQueue((prev) => prev.slice(1)); // Remove processed item
      setIsProcessingQueue(false);
    }
  }, [isProcessingQueue, aiSpeechQueue]);

  // Process queue when items are added
  useEffect(() => {
    if (!isProcessingQueue && aiSpeechQueue.length > 0) {
      processNextInQueue();
    }
  }, [aiSpeechQueue, isProcessingQueue, processNextInQueue]);

  // Direct AI Audio Play (internal function)
  const playAIAudioDirect = async (audioUrl: string, text: string) => {
    console.log("🔊 Playing AI audio:", text);
    setIsAISpeaking(true);
    setCurrentAudioUrl(audioUrl);
    setIsAudioPlaying(true);

    return new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        setIsAISpeaking(false);
        setIsAudioPlaying(false);
        setCurrentAudioUrl(null);
      };

      const handleSuccess = () => {
        cleanup();
        resolve();
      };

      const handleError = (error: any) => {
        cleanup();
        reject(error);
      };

      // Try ElevenLabs TTS API first
      fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice_id: "EXAVITQu4vr4xnSDxMaL",
          model_id: "eleven_monolingual_v1",
        }),
      })
        .then((response) =>
          response.ok ? response.json() : Promise.reject(response)
        )
        .then((data) => {
          if (data.useBrowserTTS && speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

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

            utterance.onend = handleSuccess;
            utterance.onerror = handleError;
            speechSynthesis.speak(utterance);
          } else if (data.audioUrl && data.audioContent) {
            const audio = new Audio(data.audioUrl);
            audio.onended = handleSuccess;
            audio.onerror = handleError;
            audio.play().catch(handleError);
          } else {
            throw new Error("No audio content available");
          }
        })
        .catch((error) => {
          console.error("TTS error, using fallback:", error);
          // Fallback simulation
          const duration = Math.random() * 2000 + 3000;
          setTimeout(handleSuccess, duration);
        });
    });
  };

  // Public AI Audio Play (adds to queue)
  const playAIAudio = (audioUrl: string, text: string) => {
    if (!text.trim()) return;
    addToSpeechQueue(text, audioUrl);
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

  // Timer countdown
  useEffect(() => {
    if (!interviewStarted) return;

    // Ensure we only end once when time is up
    const endedOnceRef = { current: false };
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (!endedOnceRef.current) {
            endedOnceRef.current = true;
            clearInterval(timer);
            handleEndInterview();
          }
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
  // useEffect(() => {
  //   if (sessionId && interviewStarted) {
  //     const interval = setInterval(async () => {
  //       await updateInterviewProgress({
  //         sessionId,
  //         progress: interviewProgress,
  //         questionsAnswered,
  //         timeRemaining,
  //       });
  //     }, 10000);
  //     return () => clearInterval(interval);
  //   }
  // }, [sessionId, interviewStarted, interviewProgress]);

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

  useEffect(() => {
    if (!interviewStarted) return;

    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        setWarningMessage("Please enable fullscreen mode for the interview.");
        setShowWarning(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        +9;
        setWarningMessage(
          "Tab switch detected. Please return to the interview."
        );
        setShowWarning(true);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave the interview?";
      return e.returnValue;
    };

    enterFullscreen();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [interviewStarted]);

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
        sessionId,
        message: answer,
        questionId: currentQuestionId, // keep numeric ID for tracking
        question:
          messages.find((m) => m.id === `question_${currentQuestionId}`)
            ?.content || // try to find the actual question text from chat history
          messages.filter((m) => m.type === "ai").slice(-1)[0]?.content ||
          "", // fallback to last AI message
        responseTime,
        metadata: {
          userAgent: navigator.userAgent,
          deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
            ? "mobile"
            : "desktop",
          messageType: isCode ? "code_submission" : "answer",
          timestamp: new Date().toISOString(),
          questionNumber: currentQuestionNumber,
          totalQuestions,
          sessionDuration: Date.now() - (responseStartTime || Date.now()),
        },
        advanceToNext: true,
      };

      if (isCode) {
        body.codeContext = {
          isCodeSubmission: true,
          questionId: currentQuestionId,
          language: language,
          code: code,
          stdin: "", // Empty stdin for now
          executionResult: null, // Will be populated by backend
        };
      }

      const response = await fetch(
        `${API_URL}/interview/conversation/enhanced`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Enhanced conversation response:", data);

        // Add to debug logs like testInterview.html
        if (showDebugPanel) {
          const debugEntry = `[${new Date().toLocaleTimeString()}] Enhanced API Response: ${JSON.stringify(
            data,
            null,
            2
          )}`;
          setDebugLogs((prev) => [...prev.slice(-9), debugEntry]); // Keep last 10 entries
        }

        // Handle AI response and current question separately to avoid duplication
        let aiResponseContent = "";
        let questionContent = "";
        let audioContent = "";

        if (data.aiResponse || data.shortResponse) {
          const displayText = data.shortResponse ?? data.aiResponse;
          // Always speak only the display text (shortResponse if available)
          audioContent = displayText;

          // For UI, show minimal content for free users, full details for paid users
          aiResponseContent = displayText;

          // Add detailed feedback only for paid interviews
          if (
            !isFreeInterview &&
            data.feedback &&
            data.feedback.score !== undefined
          ) {
            const feedbackDetails = `\n\n📊 **Score: ${data.feedback.score}/100**`;
            aiResponseContent += feedbackDetails;

            // Add detailed scores if available
            if (data.detailedScores) {
              const detailsText =
                `\n\n**Detailed Analysis:**\n` +
                `• Correctness: ${data.detailedScores.correctness}/100\n` +
                `• Completeness: ${data.detailedScores.completeness}/100\n` +
                `• Clarity: ${data.detailedScores.clarity}/100\n` +
                `• Technical Accuracy: ${data.detailedScores.technicalAccuracy}/100\n` +
                `• Communication: ${data.detailedScores.communicationQuality}/100`;
              aiResponseContent += detailsText;
            }

            // Add strengths and improvements if available
            if (data.strengths && data.strengths.length > 0) {
              aiResponseContent += `\n\n✅ **Strengths:** ${data.strengths.join(
                ", "
              )}`;
            }
            if (data.improvements && data.improvements.length > 0) {
              aiResponseContent += `\n\n🔄 **Areas for Improvement:** ${data.improvements.join(
                ", "
              )}`;
            }
          }
        }

        if (data.currentQuestion) {
          // ✅ Normal case: backend sends next question object
          setCurrentQuestionId(data.currentQuestion.id);
          setCurrentQuestionNumber(data.currentQuestion.questionNumber);
          if (data.currentQuestion.totalQuestions) {
            setTotalQuestions(data.currentQuestion.totalQuestions);
          }

          setResponseStartTime(Date.now());

          // Only set questionContent if we don't already have aiResponseContent
          // This prevents duplication when shortResponse contains the question
          if (!aiResponseContent) {
            questionContent = data.currentQuestion.question;
          }

          // Don't combine with messageContent anymore
        } else {
          // 🧩 Fallback: backend didn’t send currentQuestion (still return next text)
          console.warn(
            "⚠️ No currentQuestion in response — generating fallback question ID"
          );
          const nextQ = currentQuestionNumber + 1;
          const fallbackQuestionId = `q${nextQ}`;
          setCurrentQuestionId(fallbackQuestionId);
          setCurrentQuestionNumber(nextQ);
          setResponseStartTime(Date.now());

          // Don't set questionContent here since shortResponse is already in aiResponseContent
          // This prevents duplication
        }

        // Add AI response message if we have content
        if (aiResponseContent) {
          const aiMessage: Message = {
            id: `ai_${Date.now()}`,
            type: "ai",
            content: aiResponseContent,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
          playAIAudio("", audioContent);
        }

        // Add question message separately if we have content
        if (questionContent) {
          const questionMessage: Message = {
            id: `question_${Date.now()}`,
            type: "ai",
            content: questionContent,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, questionMessage]);
        }

        // Update progress
        if (data.progress) {
          updateProgress(
            data.progress.questionsAnswered || questionsAnswered,
            data.progress.totalQuestions || totalQuestions
          );

          // Check if interview is completed - only based on actual progress count
          const answered = data.progress.questionsAnswered || questionsAnswered;
          const total = data.progress.totalQuestions || totalQuestions;
          console.log("📊 Progress check:", {
            answered,
            total,
            currentCompleted: interviewCompleted,
            hasCurrentQuestion: !!data.currentQuestion,
            progressData: data.progress,
          });

          // Only complete if we've actually answered all questions AND there's no next question
          if (answered >= total && total > 0 && !data.currentQuestion) {
            console.log(
              "✅ Interview completed based on progress and no more questions!"
            );
            setInterviewCompleted(true);
          } else {
            console.log(
              "🔄 Interview continues - not all conditions met for completion"
            );
          }
        }

        // Only check AI response for completion if we don't have a current question
        // This prevents premature completion during the interview
        if (
          !data.currentQuestion &&
          data.aiResponse &&
          (data.aiResponse.toLowerCase().includes("interview is complete") ||
            data.aiResponse
              .toLowerCase()
              .includes("that concludes the interview") ||
            data.aiResponse.toLowerCase().includes("no more questions"))
        ) {
          console.log(
            "✅ Interview completed based on AI response and no current question!"
          );
          setInterviewCompleted(true);
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
  const [showInstructionsPopup, setShowInstructionsPopup] = useState(false);
  const [showStartingPopup, setShowStartingPopup] = useState(true);
  const [popupTimer, setPopupTimer] = useState(5);
  const [countdownInterval, setCountdownInterval] =
    useState<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);
  const isStartingRef = useRef(false);

  // Cleanup countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

  const startInterview = useCallback(async () => {
    console.log("🚀 Starting interview...", {
      isStartingRef: isStartingRef.current,
      isStartingInterview,
      interviewStarted,
      hasInitialized: hasInitialized.current,
    });

    // Prevent multiple simultaneous starts
    if (isStartingRef.current || isStartingInterview || interviewStarted) {
      console.log(
        "⏭️ Skipping startInterview - already in progress or started"
      );
      return;
    }

    isStartingRef.current = true;
    setShowStartingPopup(true);
    setPopupTimer(5);

    // Clear any existing countdown
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    // Start countdown timer
    const countdown = setInterval(() => {
      setPopupTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setCountdownInterval(null);
          setShowStartingPopup(false);
          // Actually start the interview after timer
          setTimeout(() => {
            actuallyStartInterview();
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setCountdownInterval(countdown);
  }, [isStartingInterview, interviewStarted, countdownInterval]);

  // Initialize component and auto-start timer
  useEffect(() => {
    if (hasInitialized.current) return;

    console.log("🔍 Component initialized - auto-starting timer");
    hasInitialized.current = true;

    // Auto-start the interview timer after component initialization
    const autoStartTimer = setTimeout(() => {
      // Check if manual start hasn't already been triggered
      if (!isStartingRef.current && !isStartingInterview && !interviewStarted) {
        startInterview();
      } else {
        console.log("⏭️ Skipping auto-start - manual start already triggered");
      }
    }, 1000); // Small delay to ensure everything is loaded

    // Cleanup timer on unmount
    return () => {
      clearTimeout(autoStartTimer);
    };
  }, []); // Empty dependency array to run only once

  const actuallyStartInterview = async () => {
    console.log("🚀 actuallyStartInterview called", {
      isStartingRef: isStartingRef.current,
      isStartingInterview,
      interviewStarted,
    });

    // Additional protection against multiple calls
    if (isStartingInterview || interviewStarted) {
      console.log(
        "⏭️ Skipping actuallyStartInterview - already in progress or started"
      );
      return;
    }

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

        // Combine welcome message and first question to avoid duplication
        let combinedContent = data.message;
        if (data.firstQuestion) {
          combinedContent += `\n\n${data.firstQuestion.question}`;
          setCurrentQuestionNumber(data.firstQuestion.questionNumber);
          setCurrentQuestionId(data.firstQuestion.id);
        }

        const welcomeMessage: Message = {
          id: `welcome_${Date.now()}`,
          type: "ai",
          content: combinedContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, welcomeMessage]);

        if (data.firstQuestion) {
          playAIAudio("", combinedContent);
        }

        setInterviewStarted(true);
        setShowStartingPopup(false); // Close the popup on successful start
        isStartingRef.current = false; // Reset the ref on successful start
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("❌ Failed to start interview:", error);

      let errorMessage = "Failed to start interview. ";
      if (error.name === "AbortError") {
        errorMessage +=
          "Request timed out. Please check your connection and try again.";
      } else if (error.message?.includes("fetch")) {
        errorMessage +=
          "Unable to connect to server. Please check your internet connection.";
      } else {
        errorMessage += error.message || "Unknown error occurred.";
      }

      setStartError(errorMessage);
    } finally {
      setIsStartingInterview(false);
      isStartingRef.current = false; // Reset the ref on error or completion
    }
  };

  const retryStartInterview = () => {
    setStartError(null);
    isStartingRef.current = false; // Reset before retry
    startInterview();
  };

  const handleManualStart = async () => {
    console.log("🎯 Manual start triggered from instructions popup");

    // Prevent duplicate calls if already starting or started
    if (isStartingRef.current || isStartingInterview || interviewStarted) {
      console.log("⏭️ Skipping manual start - already in progress or started");
      return;
    }

    // Clear any existing countdown to prevent auto-start
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }

    isStartingRef.current = true;
    setShowInstructionsPopup(false);
    setShowStartingPopup(true);
    setIsStartingInterview(true);

    // Call actuallyStartInterview directly to avoid countdown popup
    await actuallyStartInterview();
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

    // Get the current transcript (which includes live captions)
    const finalText = transcript.trim();
    console.log("📝 Final transcript length:", finalText.length, "characters");
    console.log("📝 Final transcript content:", finalText);

    // Only process if we have valid content and it's not just the "Listening..." placeholder
    if (
      finalText.length > 0 &&
      finalText !== "Listening..." &&
      finalText !== "No speech detected. Please try speaking again." &&
      finalText !== "Error recognizing speech. Please try again."
    ) {
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        type: "user",
        content: finalText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Debug logging for second answer issue
      console.log("🔍 Debug - stopListening state check:", {
        sessionId: sessionId,
        interviewCompleted: interviewCompleted,
        questionsAnswered: questionsAnswered,
        totalQuestions: totalQuestions,
        finalText: finalText,
      });

      if (sessionId) {
        console.log("📤 Sending final response via REST API:", finalText);
        sendAnswerToAPI(finalText);
      } else {
        console.error("❌ No sessionId available - cannot send answer!");
      }

      // Only increment questions answered if interview is not completed
      if (!interviewCompleted) {
        console.log(
          "📊 Incrementing questionsAnswered from",
          questionsAnswered,
          "to",
          questionsAnswered + 1
        );
        setQuestionsAnswered((prev) => prev + 1);
      } else {
        console.warn(
          "⚠️ Interview already completed - not incrementing questionsAnswered"
        );
      }
    } else {
      console.warn("⚠️ No valid transcript to send:", finalText);
      // Show a message to the user that no speech was detected
      if (finalText.length === 0 || finalText === "Listening...") {
        setTranscript("No speech detected. Please try again.");
      }
    }

    // Reset transcript for next answer after a short delay to show any error messages
    setTimeout(() => {
      setTranscript("");
    }, 2000);
  };

  const runCode = async () => {
    if (isRunningCode) {
      return; // Prevent multiple simultaneous executions
    }

    if (!code.trim()) {
      setWarningMessage("Please write some code before running.");
      setShowWarning(true);
      return;
    }

    setIsRunningCode(true);
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
          }\n→ Time: ${executionTime}s\n→ Memory: ${
            result.memory
          }\n\n✅ Code ran successfully! You can now submit your solution.`,
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
    } finally {
      setIsRunningCode(false);
    }
  };

  const submitCode = async () => {
    if (isSubmittingCode) {
      return; // Prevent multiple simultaneous submissions
    }

    if (!codeExecutionSuccess || !lastExecutionResult) {
      setWarningMessage("Please run your code successfully before submitting.");
      setShowWarning(true);
      return;
    }

    setIsSubmittingCode(true);
    console.log("📤 Submitting code solution...");

    try {
      // Send code submission to enhanced conversation API with execution results
      await sendAnswerToAPI(
        `Code submitted and executed. Output: ${
          lastExecutionResult.output || "No output"
        }`,
        true
      );

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
    } finally {
      setIsSubmittingCode(false);
    }
  };

  // Derived state: when code ran successfully and awaits submission
  const submitPhaseActive =
    hasCodeEditor && codeExecutionSuccess && !isSubmittingCode;

  const handleEndInterview = async () => {
    if (isEndingInterview) {
      return; // Prevent multiple simultaneous end interview calls
    }

    setIsEndingInterview(true);
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
        const interviewData = await response.json();
        console.log("✅ Interview ended successfully:", interviewData);

        // Format the results according to the specified structure
        const results = {
          overallScore: interviewData.scores?.overall || 0,
          category: interviewData.configuration?.category || "Interview",
          level: interviewData.configuration?.level || "Unknown",
          duration: `${interviewData.configuration?.duration || 0} minutes`,
          completedAt: interviewData.createdAt
            ? new Date(interviewData.createdAt).toLocaleDateString()
            : "Unknown",
          scores: {
            technical:
              interviewData.scores?.technical ||
              interviewData.scoreboard?.detailedScores?.technical ||
              0,
            communication:
              interviewData.scores?.communication ||
              interviewData.scoreboard?.detailedScores?.communication ||
              0,
            problemSolving:
              interviewData.scores?.problemSolving ||
              interviewData.scoreboard?.detailedScores?.problemSolving ||
              0,
            codeQuality:
              interviewData.scores?.codeQuality ||
              interviewData.scoreboard?.detailedScores?.codeQuality ||
              0,
          },
          strengths: interviewData.results?.detailedAnalysis?.strengths || [
            "Completed the interview successfully",
            "Demonstrated problem-solving skills",
            "Showed technical knowledge",
          ],
          improvements: interviewData.results?.detailedAnalysis
            ?.improvements || [
            "Continue practicing coding challenges",
            "Work on communication skills",
            "Review technical concepts",
          ],
          detailedFeedback: {
            technical:
              interviewData.results?.technicalFeedback ||
              "Technical performance was evaluated based on problem-solving approach and code quality.",
            communication:
              interviewData.results?.communicationFeedback ||
              "Communication skills were assessed throughout the interview process.",
            problemSolving:
              interviewData.results?.problemSolvingFeedback ||
              "Problem-solving approach and analytical thinking were evaluated.",
            codeQuality:
              interviewData.results?.codeQualityFeedback ||
              "Code structure, readability, and best practices were reviewed.",
          },
          codeSubmissions: interviewData.results?.codeSubmissions || [],
        };

        console.log("📊 Formatted interview results:", results);

        // Store results in localStorage or state for the results page
        localStorage.setItem("interviewResults", JSON.stringify(results));
      } else {
        console.error("❌ Failed to end interview:", response.status);
      }
    } catch (error) {
      console.error("❌ Error ending interview:", error);
    } finally {
      setIsEndingInterview(false);
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

    // Redirect to results page with sessionId
    if (sessionId) {
      router.push(`/learner/interview/results?id=${sessionId}`);
    } else {
      router.push("/learner/interview/results");
    }
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
        `${API_URL}/interview/conversation/history/${encodeURIComponent(
          sessionId
        )}`,
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

        if (
          data.success &&
          data.conversations &&
          data.conversations.length > 0
        ) {
          // Convert history to messages and replace current messages
          const historyMessages: Message[] = data.conversations.map(
            (conv: any, index: number) => ({
              id: `history_${index}_${conv.timestamp}`,
              type: conv.role === "user" ? "user" : "ai",
              content: conv.shortResponse ?? conv.aiResponse ?? conv.message,
              timestamp: new Date(conv.timestamp),
            })
          );

          // Replace current messages with history
          setMessages(historyMessages);

          // Add confirmation message
          const confirmationMessage: Message = {
            id: `history_loaded_${Date.now()}`,
            type: "system",
            content: `✅ Conversation history loaded: ${
              data.conversations.length
            } messages from ${new Date(
              data.conversations[0]?.timestamp
            ).toLocaleString()} to ${new Date(
              data.conversations[data.conversations.length - 1]?.timestamp
            ).toLocaleString()}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, confirmationMessage]);

          // Update progress if available in history
          if (data.progress) {
            updateProgress(
              data.progress.answered || questionsAnswered,
              data.progress.total || totalQuestions
            );
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
            resultsContent += `\n⏱️ **Interview Duration:** ${Math.round(
              results.duration / 60
            )} minutes\n`;
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
          setCurrentQuestionNumber(
            data.questionNumber || currentQuestionNumber + 1
          );

          // Update progress if total questions provided
          if (data.totalQuestions) {
            updateProgress(questionsAnswered, data.totalQuestions);
          }

          const questionMessage: Message = {
            id: `next_question_${Date.now()}`,
            type: "ai",
            content: data.question,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, questionMessage]);
          playAIAudio("", data.question);
        } else if (data.message?.includes("completed")) {
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

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center overflow-y-auto">
          <div className="glass-card p-8 max-w-md w-full mx-4 text-center border-2 border-red-500/50">
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

      {/* Instructions Popup */}
      {showInstructionsPopup && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[70] flex items-center justify-center overflow-y-auto">
          <div className="glass-card p-8 max-w-2xl w-full mx-4 text-center border-2 border-[#00FFB2]/50">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#00FFB2]/20 rounded-full flex items-center justify-center">
                <Bot size={32} className="text-[#00FFB2]" />
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-6 text-[#00FFB2]">
              🎯 AI Interview Instructions
            </h2>

            <div className="text-left space-y-4 mb-8">
              <div className="bg-[#00FFB2]/10 border border-[#00FFB2]/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#00FFB2] mb-2">
                  📋 Interview Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Category:</span>
                    <span className="text-white font-medium">
                      {category?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Level:</span>
                    <span className="text-white font-medium">
                      {level?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Duration:</span>
                    <span className="text-white font-medium">
                      {duration} minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Format:</span>
                    <span className="text-white font-medium">
                      Voice + {hasCodeEditor ? "Coding" : "Discussion"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">
                  🎤 How It Works
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      The AI interviewer will ask you questions one by one
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      Click the microphone button to record your answers
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Speak clearly and take your time to think</span>
                  </li>
                  {hasCodeEditor && (
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Use the code editor for programming questions</span>
                    </li>
                  )}
                  {hasCodeEditor && (
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>
                        For coding: write your code → click Run → after a
                        successful run, submit your result. The mic is disabled
                        until you submit.
                      </span>
                    </li>
                  )}
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>
                      The AI will provide feedback and follow-up questions
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                  💡 Tips for Success
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Ensure you&apos;re in a quiet environment</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Test your microphone and camera before starting</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>
                      Think out loud to show your problem-solving process
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Ask clarifying questions if needed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>Stay calm and be yourself</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleManualStart}
                className="px-8 py-3 bg-[#00FFB2] hover:bg-[#00FFB2]/80 text-black font-semibold rounded-lg transition-colors flex items-center space-x-2"
              >
                <Play size={20} />
                <span>Start Interview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Starting Interview Popup */}
      {showStartingPopup && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[70] flex items-center justify-center overflow-y-auto">
          <div className="glass-card p-6 sm:p-8 w-[92%] max-w-md sm:max-w-lg mx-auto text-center border-2 border-[#00FFB2]/50">
            {!isStartingInterview ? (
              <>
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-[#00FFB2]/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#00FFB2]">
                        🚀
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-[#00FFB2]">
                  🚀 Ready to Start Your Interview?
                </h3>

                <div className="text-left space-y-3 mb-6">
                  <p className="text-gray-300 text-center mb-4">
                    Here&apos;s what to expect in your interview:
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-[#00FFB2] rounded-full"></div>
                      <span className="text-sm text-gray-300">
                        📋 {category} interview at {level} level
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-[#00FFB2] rounded-full"></div>
                      <span className="text-sm text-gray-300">
                        ⏱️ Duration: {duration} minutes
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-[#00FFB2] rounded-full"></div>
                      <span className="text-sm text-gray-300">
                        🎤 Voice-based conversation
                      </span>
                    </div>
                    {hasCodeEditor && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-[#00FFB2] rounded-full"></div>
                        <span className="text-sm text-gray-300">
                          💻 Coding challenges included
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-[#00FFB2] rounded-full"></div>
                      <span className="text-sm text-gray-300">
                        🤖 AI-powered evaluation
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#00FFB2]/10 border border-[#00FFB2]/30 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-[#00FFB2] mb-2">
                    📝 Instructions:
                  </h4>
                  <ul className="text-xs text-gray-300 text-left space-y-1">
                    <li>• Speak clearly and at a moderate pace</li>
                    <li>• Take your time to think before answering</li>
                    <li>• Ask for clarification if needed</li>
                    <li>• Be honest about your experience level</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.back()}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors w-full"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleManualStart}
                    className="flex-1 px-4 py-2 bg-[#00FFB2] hover:bg-[#00FFB2]/80 text-black font-semibold rounded-lg transition-colors w-full"
                  >
                    Start Interview
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-[#00FFB2]/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-[#00FFB2] border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#00FFB2]">
                        ⏳
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-[#00FFB2]">
                  🚀 Starting Your Interview...
                </h3>

                <p className="text-gray-300 mb-4">
                  Please wait while we prepare your interview session.
                </p>

                <div className="bg-[#00FFB2]/10 border border-[#00FFB2]/30 rounded-lg p-4">
                  <p className="text-sm text-[#00FFB2] font-medium">
                    💡 Get ready to showcase your skills!
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="pt-16 pb-24">
        {/* Header Bar */}
        <div className="bg-[#0A0A0A] border-b border-[#00FFB2]/20 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-2 lg:space-y-0">
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
              {/* <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-900/50 border border-blue-700/50 rounded-full text-xs text-blue-200">
                    Answered:{" "}
                    <span className="font-semibold">{questionsAnswered}</span>
                  </span>
                  <span className="px-2 py-1 bg-purple-900/50 border border-purple-700/50 rounded-full text-xs text-purple-200">
                    Total:{" "}
                    <span className="font-semibold">{totalQuestions}</span>
                  </span>
                  <span className="px-2 py-1 bg-green-900/50 border border-green-700/50 rounded-full text-xs text-green-200">
                    Completion:{" "}
                    <span className="font-semibold">{interviewProgress}%</span>
                  </span>
                </div>
                <div className="w-full sm:w-32 bg-[#1A1A1A] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${interviewProgress}%` }}
                  />
                </div>
              </div> */}
              {/* {sessionId && (
                <div className="text-xs text-gray-500">
                  Session: {sessionId.slice(-8)}
                </div>
              )} */}
            </div>
            <div className="flex items-center flex-wrap gap-2">
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

              {/* <button
                onClick={getNextQuestion}
                className="p-2 rounded-full bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
                title="Get Next Question"
                disabled={!sessionId}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button> */}

              {/* Conversation History Button */}
              <button
                onClick={getConversationHistory}
                className="p-2 rounded-full bg-green-600/20 text-green-400 hover:bg-green-600/30"
                title="Load Conversation History"
                disabled={!sessionId}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              {/* Interview Results Button */}
              <button
                onClick={getInterviewResults}
                className="p-2 rounded-full bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30"
                title="Get Interview Results"
                disabled={!sessionId}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              {/* Debug Panel Toggle */}
              {/* <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className={`p-2 rounded-full transition-colors ${
                  showDebugPanel
                    ? "bg-red-600/30 text-red-400"
                    : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30"
                }`}
                title="Toggle Debug Panel"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button> */}

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

              {interviewCompleted ? (
                <button
                  onClick={handleEndInterview}
                  disabled={isEndingInterview}
                  className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    isEndingInterview ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Phone size={16} />
                  <span>
                    {isEndingInterview ? "Submitting..." : "Submit Interview"}
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleEndInterview}
                  disabled={isEndingInterview}
                  className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    isEndingInterview ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Phone size={16} />
                  <span>
                    {isEndingInterview ? "Ending..." : "End Interview"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
          {/* Column 1 - Video (20%) */}
          <div className="w-full lg:w-[20%] flex flex-col border-r-0 lg:border-r border-[#00FFB2]/20">
            <div className="flex-1 bg-[#0A0A0A] p-2 lg:p-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-col lg:gap-4 h-full items-stretch">
                {/* User Video */}
                <div className="bg-[#111] rounded-lg overflow-hidden relative aspect-video sm:aspect-square">
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
                <div className="bg-[#111] rounded-lg overflow-hidden relative aspect-video sm:aspect-square">
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
          </div>

          {/* Column 2 - Chat (50%) */}
          <div className="w-full lg:w-[50%] flex flex-col border-r-0 lg:border-r border-[#00FFB2]/20 bg-[#0A0A0A]">
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
                    className={`max-w-[90%] sm:max-w-[80%] p-2 lg:p-3 rounded-lg text-sm lg:text-base ${
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
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice Input Section */}
            <div className="p-3 sm:p-4 border-t border-[#00FFB2]/20">
              <div className="flex flex-col space-y-3">
                {transcript && (
                  <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#00FFB2]/20">
                    <div className="text-sm text-gray-400 mb-1">
                      Transcript:
                    </div>
                    <div className="text-white">{transcript}</div>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={
                      !interviewStarted ||
                      isAISpeaking ||
                      interviewCompleted ||
                      submitPhaseActive ||
                      isSubmittingCode
                    }
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 animate-pulse"
                        : interviewCompleted
                        ? "bg-gray-500"
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
                        : interviewCompleted
                        ? "Interview completed - Click Submit Interview above"
                        : isAISpeaking
                        ? "AI is speaking..."
                        : isListening
                        ? "Recording... Click to stop"
                        : submitPhaseActive
                        ? "Run successful — you have to submit the result"
                        : "Click to speak"}
                    </div>
                    {!isMicOn && (
                      <div className="text-xs text-red-400 mt-1">
                        Microphone is disabled
                      </div>
                    )}
                    {submitPhaseActive && (
                      <div className="text-xs text-yellow-400 mt-1">
                        Note: Mic is disabled until you submit your result
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 - Code Editor (30%) */}
          {hasCodeEditor && showCodeEditor ? (
            <div className="w-full lg:w-[30%] flex flex-col">
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
                      disabled={isRunningCode}
                      className={`btn-primary px-4 py-1 text-sm flex items-center space-x-1 ${
                        isRunningCode ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Terminal size={14} />
                      <span>{isRunningCode ? "Running..." : "Run"}</span>
                    </button>
                    {codeExecutionSuccess && (
                      <button
                        onClick={submitCode}
                        disabled={isSubmittingCode}
                        className={`bg-green-500 hover:bg-green-600 text-white px-4 py-1 text-sm rounded flex items-center space-x-1 ${
                          isSubmittingCode
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <Send size={14} />
                        <span>
                          {isSubmittingCode
                            ? "Submitting..."
                            : "Submit Solution"}
                        </span>
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
            <div className="w-full lg:w-[30%] flex items-center justify-center bg-[#0A0A0A] border-l-0 lg:border-l border-[#00FFB2]/20 min-h-[400px] lg:min-h-0">
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
            <div className="w-full lg:w-[30%] flex items-center justify-center bg-[#0A0A0A] min-h-[400px] lg:min-h-0">
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
              <h3 className="text-sm font-semibold text-white">
                Debug Panel - Raw API Responses
              </h3>
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
                  <div
                    key={index}
                    className="text-xs text-green-400 font-mono bg-gray-800/50 p-2 rounded border-l-2 border-green-500"
                  >
                    <pre className="whitespace-pre-wrap break-words">{log}</pre>
                  </div>
                ))
              )}
            </div>
            {lastResponseTime && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs text-blue-400">
                  Last Response Time: {lastResponseTime}s
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
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
