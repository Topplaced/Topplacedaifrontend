"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";

type ShapedQuestion = {
  id: string;
  question: string;
  questionNumber: number;
  totalQuestions: number;
  expectedTime?: number;
  requiresCode?: boolean;
  category?: string;
  language?: string;
};

type ConversationItem = {
  question: ShapedQuestion;
  candidateAnswer: string;
  aiResponse: string;
  progress?: any;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // Prefer Redux state token, fallback to localStorage
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

async function postJson<T>(path: string, body: any): Promise<T> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const token = getAuthToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json?.message || res.statusText);
  return json;
}

async function getJson<T>(path: string): Promise<T> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const token = getAuthToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json?.message || res.statusText);
  return json;
}

function generateFakeAnswer(q: ShapedQuestion): string {
  const cat = (q.category || "").toLowerCase();
  const lang = q.language || "JavaScript";

  if (cat.includes("intro")) {
    return [
      "Hello! I’m a full‑stack engineer with strong focus on modern JavaScript ecosystems. Over the past few years, I’ve built scalable web applications with React on the front end and Node.js/NestJS on the backend, applying clean architecture and testing‑driven practices.",
      "I enjoy designing component libraries, optimizing bundle size, and improving UX through accessible patterns. On the backend I’ve implemented REST APIs, authentication flows, and real‑time features with WebSockets. I’m comfortable with CI/CD, containerization, cloud deployments, and monitoring.",
      "Beyond technical work, I value clear documentation, communication, and continuous feedback. I mentor juniors, review PRs thoroughly, and collaborate with product/design to deliver measurable outcomes. I’m excited to tackle complex problems, improve performance, and keep learning."
    ].join("\n\n");
  }

  if (cat.includes("technical")) {
    return [
      `In ${lang}, I structure code using modular design and pure functions wherever possible. I leverage async/await for readability, use TypeScript for type safety, and rely on unit/integration tests to maintain confidence.`,
      "For example, closures capture lexical scope, enabling patterns like data privacy and function factories. A classic example is returning an inner function that still references variables from the outer function’s frame. This allows encapsulation without exposing implementation details.",
      "I also pay attention to performance: avoiding unnecessary re‑renders, memoizing expensive computations, and profiling hot paths. For state management, I prefer lightweight solutions unless the domain requires a centralized store."
    ].join("\n\n");
  }

  if (cat.includes("behavior")) {
    return [
      "When facing ambiguous problems, I start by clarifying goals and constraints, then map out edge cases and success criteria. I decompose the problem into small steps, validate assumptions early, and iterate with stakeholder feedback.",
      "I communicate trade‑offs clearly, document decisions, and ensure the team has visibility into timelines and risks. After delivery, I review outcomes, collect metrics, and note improvements for future iterations."
    ].join("\n\n");
  }

  if (q.requiresCode) {
    return [
      `Here’s a clear ${lang} implementation with explanation:`,
      "function sum(a, b) {\n  // Validate inputs and ensure number semantics\n  const x = Number(a);\n  const y = Number(b);\n  return x + y;\n}",
      "The helper coerces inputs to numbers, keeps the body simple, and can be extended to handle large integers or edge cases. In production I’d add tests, input guards, and type annotations for reliability."
    ].join("\n\n");
  }

  return [
    "I would approach this by clarifying requirements, choosing the right abstractions, and building small, composable units. I’d add tests around critical paths, automate deployments, and monitor performance to ensure the solution scales.",
    "Throughout, I’d document decisions, keep communication tight with stakeholders, and prioritize maintainability over premature optimization."
  ].join("\n\n");
}

export default function InterviewAutomationPage() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [firstQuestion, setFirstQuestion] = useState<ShapedQuestion | null>(null);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalSummary, setFinalSummary] = useState<string | null>(null);
  const [finalStrengths, setFinalStrengths] = useState<string[]>([]);
  const [finalImprovements, setFinalImprovements] = useState<string[]>([]);

  // Inline login form state
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [autoStartOnLogin, setAutoStartOnLogin] = useState<boolean>(true);

  const startPayload = useMemo(() => ({
    configuration: {
      level: "intermediate",
      field: "DEVELOPMENT",
      category: "FULL_STACK_DEVELOPER",
      duration: 30,
      language: "JavaScript",
      hasCodeEditor: true,
      // Enforce 10 questions for the interview
      questionsLimit: 10,
    },
    user: {
      id: (auth.user?._id as string) || "auto_user_web_001",
      name: auth.user?.name || "AutoCandidate",
      email: auth.user?.email || "auto@example.com",
      role: "candidate",
      experience: "intermediate",
      skills: ["javascript", "react", "node"],
      goals: "interview preparation",
      education: [],
      workExperience: [],
      profileCompletion: 100,
    },
    context: {
      sessionId: "",
      startTime: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      timezone:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : "UTC",
      isFreeInterview: true,
    },
  }), [auth.user]);

  const handleLogin = useCallback(async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data?.access_token || !data?.user) {
        throw new Error(data?.message || "Login failed");
      }
      // Persist token and Redux auth state
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
      }
      dispatch(loginSuccess(data));
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setIsLoggingIn(false);
    }
  }, [loginEmail, loginPassword, dispatch]);

  const runAutomation = useCallback(async () => {
    setError(null);
    setRunning(true);
    setConversation([]);
    setFinalScore(null);
    setFinalSummary(null);
    setFinalStrengths([]);
    setFinalImprovements([]);

    try {
      // 1) Start interview
      const startRes = await postJson<any>("/interview/start", startPayload);
      const sid = startRes.sessionId as string;
      setSessionId(sid);
      const fq = startRes.firstQuestion as ShapedQuestion | null;
      setFirstQuestion(fq);

      // 2) Iterate through questions until completed
      let currentQ: ShapedQuestion | null = fq;

      while (currentQ) {
        const answer = generateFakeAnswer(currentQ);

        // Submit answer via enhanced conversation for AI feedback
        const convRes = await postJson<any>("/interview/conversation/enhanced", {
          sessionId: sid,
          message: answer,
          questionId: currentQ.id,
          responseTime: 10 + Math.floor(Math.random() * 10),
          metadata: { messageType: "answer", responseLength: "long" },
        });

        const aiResp = convRes.aiResponse || convRes.longResponse || convRes.shortResponse || convRes.response || "";
        setConversation((prev) => [
          ...prev,
          { question: currentQ!, candidateAnswer: answer, aiResponse: aiResp, progress: convRes.progress },
        ]);

        // Fetch next question
        const nextQRes = await getJson<any>(`/interview/question/${sid}`);
        if (nextQRes.completed) {
          currentQ = null;
          break;
        }
        currentQ = (nextQRes.question || null) as ShapedQuestion | null;
      }

      // 3) End interview and show final results (include minimal required DTO fields)
      const endRes = await postJson<any>("/interview/end", {
        sessionId: sid,
        results: {
          status: "completed",
          endTime: new Date().toISOString(),
          totalTimeSpent: 0,
          questionsAnswered: conversation.length,
          totalQuestions: 10,
          completionPercentage: 100,
        },
      });
      setFinalScore(endRes.overallScore ?? null);
      setFinalSummary(endRes.detailedAnalysis?.summary || null);
      setFinalStrengths(endRes.detailedAnalysis?.strengths || []);
      setFinalImprovements(endRes.detailedAnalysis?.improvements || []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setRunning(false);
    }
  }, [startPayload, conversation.length]);

  // Auto-start interview after login if enabled
  useEffect(() => {
    if (auth.token && autoStartOnLogin && !running && conversation.length === 0) {
      runAutomation();
    }
  }, [auth.token, autoStartOnLogin]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, background: "#000", color: "#fff" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Automated Interview (Browser)</h1>
      <p style={{ color: "#bbb" }}>
        Starts an interview, auto-answers each question, shows AI responses and final scores.
      </p>

      {/* Auth status / Login */}
      {!auth.token ? (
        <div style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 8,
          border: "1px solid #333",
          background: "#111",
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Login to start</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="email"
              placeholder="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #333", background: "#1a1a1a", color: "#fff" }}
            />
            <input
              type="password"
              placeholder="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #333", background: "#1a1a1a", color: "#fff" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              style={{
                padding: "10px 16px",
                background: isLoggingIn ? "#666" : "#0B5ED7",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: isLoggingIn ? "not-allowed" : "pointer",
              }}
            >
              {isLoggingIn ? "Signing in..." : "Login"}
            </button>
            <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#bbb" }}>
              <input
                type="checkbox"
                checked={autoStartOnLogin}
                onChange={(e) => setAutoStartOnLogin(e.target.checked)}
              />
              Auto-start interview on login
            </label>
          </div>
        </div>
      ) : (
        <div style={{ margin: "16px 0" }}>
          <div style={{ marginBottom: 8, color: "#0ff" }}>
            Logged in as: {auth.user?.email || "unknown"}
          </div>
          <button
            onClick={runAutomation}
            disabled={running}
            style={{
              padding: "10px 16px",
              background: running ? "#666" : "#0B5ED7",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: running ? "not-allowed" : "pointer",
            }}
          >
            {running ? "Running..." : "Run Automated Interview"}
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: "#2a0000", color: "#ff6b6b", padding: 12, borderRadius: 6 }}>
          Error: {error}
        </div>
      )}

      {sessionId && (
        <div style={{ marginTop: 12, fontSize: 14 }}>
          <strong>Session:</strong> {sessionId}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        {conversation.map((item, idx) => (
          <div key={`${item.question.id}-${idx}`} style={{
            border: "1px solid #333",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            background: "#111",
            color: "#fff",
          }}>
            <div style={{ fontSize: 14, color: "#aaa" }}>
              Q{item.question.questionNumber}/{item.question.totalQuestions}
              {item.question.category ? ` • ${item.question.category}` : ""}
            </div>
            <div style={{ fontWeight: 600, marginTop: 6, color: "#fff" }}>{item.question.question}</div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 600 }}>Candidate Answer:</div>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0, color: "#fff", background: "transparent" }}>{item.candidateAnswer}</pre>
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 600 }}>AI Response:</div>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0, color: "#fff", background: "transparent" }}>{item.aiResponse}</pre>
            </div>

            {item.progress && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#bbb" }}>
                Progress: {JSON.stringify(item.progress)}
              </div>
            )}
          </div>
        ))}
      </div>

      {(finalScore !== null || finalStrengths.length > 0 || finalImprovements.length > 0) && (
        <div style={{ marginTop: 24, borderTop: "1px solid #333", paddingTop: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Final Results</h2>
          {finalScore !== null && (
            <div><strong>Overall Score:</strong> {finalScore}</div>
          )}
          {finalSummary && (
            <div style={{ marginTop: 8 }}><strong>Summary:</strong> {finalSummary}</div>
          )}
          {finalStrengths.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Strengths:</strong> {finalStrengths.join(", ")}
            </div>
          )}
          {finalImprovements.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>Improvements:</strong> {finalImprovements.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}