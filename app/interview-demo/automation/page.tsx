"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const text = (q.question || "").toLowerCase();

  // Introduction-style prompts
  if (
    cat.includes("intro") ||
    /introduce|experience|used\s+it\s+in\s+your\s+projects/.test(text)
  ) {
    if (/prefer.*framework.*full\s*stack/.test(text)) {
      return [
        "I prefer Next.js on the front end with NestJS on the back end for full‑stack work.",
        "Next.js: SSR/ISR, file‑based routing, strong TypeScript support. NestJS: modular architecture, DI, guards/interceptors, great testing.",
        "This combination yields consistent TypeScript across the stack, clear conventions, and straightforward deployment.",
      ].join("\n\n");
    }
    if (
      /briefly.*describe.*experience|how\s+you\s+have\s+used\s+it\s+in\s+your\s+projects/.test(
        text
      )
    ) {
      return [
        "In a real‑time dashboards app, I used React for state and charts, and WebSockets for live updates; performance came from memoization and batching renders.",
        "On the backend, I built auth with NestJS (JWT + refresh tokens), rate‑limiting, and structured APIs with TypeScript, ESLint/Prettier, and CI for tests.",
      ].join("\n\n");
    }
    return [
      "I’m a full‑stack engineer focused on JavaScript across React and Node/NestJS. Recent work: built a real‑time dashboards app (React + WebSockets) and an auth service with JWT/refresh tokens in NestJS.",
      "I care about performance (code‑splitting, memoization), maintainability (tests, types), and UX (accessibility). I’ve shipped CI/CD pipelines with containerized deployments and monitoring.",
    ].join("\n\n");
  }

  // Direct concept: closures
  if (/closures?/.test(text)) {
    return [
      "A closure is a function plus its lexical scope; the inner function retains access to variables from the outer function even after the outer returns.",
      "function makeCounter() {\n  let n = 0;\n  return () => ++n;\n}\nconst inc = makeCounter();\nconsole.log(inc()); // 1\nconsole.log(inc()); // 2",
      "This enables data privacy and function factories by capturing state without exposing it globally.",
    ].join("\n\n");
  }

  // let / const / var
  if (/\blet\b|\bconst\b|\bvar\b/.test(text)) {
    return [
      "let: block‑scoped, reassignable. const: block‑scoped, not reassignable (but object properties can change). var: function‑scoped, hoisted.",
      "function demo() {\n  if (true) {\n    let a = 1; const b = 2;\n    var c = 3;\n  }\n  // a,b not accessible here; c is (function‑scoped)\n  console.log(typeof c); // 'number'\n}",
      "Prefer let/const for predictable scoping and avoid var except for legacy code.",
    ].join("\n\n");
  }

  // Event loop
  if (/event loop/.test(text)) {
    return [
      "The event loop pulls tasks from the queue and executes them after the call stack is clear; microtasks (Promises) run before macrotasks (setTimeout).",
      "console.log('start');\nsetTimeout(() => console.log('timeout'), 0);\nPromise.resolve().then(() => console.log('microtask'));\nconsole.log('end');\n// order: start, end, microtask, timeout",
    ].join("\n\n");
  }

  // 'this' keyword
  if (/\bthis\b/.test(text)) {
    return [
      "'this' is set by call site: in methods it refers to the object; in arrow functions it’s lexically bound.",
      "const obj = {\n  x: 42,\n  regular() { return this.x; },\n  arrow: () => typeof this,\n};\nobj.regular(); // 42\nobj.arrow(); // 'undefined' (in modules)",
    ].join("\n\n");
  }

  // Promises vs callbacks
  if (/promises?.*callbacks?|callbacks?.*promises?/.test(text)) {
    return [
      "Callbacks pass a function to be invoked later; Promises represent eventual values with states (pending/fulfilled/rejected) and chainable then/catch.",
      "// Callback\nfs.readFile('a.txt', (err, data) => { if (err) return; console.log(data); });\n\n// Promise\nfetch('/api').then(r => r.json()).catch(console.error);\n\n// Async/Await\nasync function run() { try { const r = await fetch('/api'); } catch (e) { /* handle */ } }",
    ].join("\n\n");
  }

  // Error handling
  if (/error handling|try\/?catch|handle errors/.test(text)) {
    return [
      "Use try/catch for sync/awaited code; attach .catch for Promises; propagate or normalize errors for consistency.",
      "function parseJson(s) {\n  try { return JSON.parse(s); } catch (e) { return null; }\n}\nasync function load() {\n  try { const r = await fetch('/x'); return await r.json(); }\n  catch (e) { console.error(e); return { ok: false }; }\n}",
    ].join("\n\n");
  }

  // Event delegation
  if (/event delegation/.test(text)) {
    return [
      "Event delegation attaches one handler to a parent and checks event.target to handle child interactions; it reduces listeners and handles dynamic content.",
      "document.getElementById('list').addEventListener('click', (e) => {\n  const li = (e.target as HTMLElement).closest('li');\n  if (li) console.log('Clicked:', li.dataset.id);\n});",
    ].join("\n\n");
  }

  // Coding tasks: squared, evens, etc.
  if (/write a function/.test(text) || q.requiresCode) {
    if (/squared|square/.test(text)) {
      return [
        `function squareAll(numbers) {\n  return numbers.map(n => n * n);\n}\nconsole.log(squareAll([1,2,3])); // [1,4,9]`,
        "Uses Array.map for a pure transformation and clear intent.",
      ].join("\n\n");
    }
    if (/even/.test(text)) {
      return [
        `function onlyEvens(numbers) {\n  return numbers.filter(n => n % 2 === 0);\n}\nconsole.log(onlyEvens([1,2,3,4])); // [2,4]`,
        "Uses Array.filter to select elements matching the predicate.",
      ].join("\n\n");
    }
    return [
      `function solveTask(input) {\n  // Provide minimal, clear implementation based on prompt\n  return input;\n}`,
      "I’d add tests and edge case handling depending on requirements.",
    ].join("\n\n");
  }

  // Behavioral prompts
  if (cat.includes("behavior")) {
    return [
      "For ambiguous problems, I clarify constraints, decompose work, validate assumptions early, and iterate with stakeholders. After delivery, I review outcomes and capture improvements.",
    ].join("\n\n");
  }

  // Technical general fallback
  if (cat.includes("technical")) {
    return [
      `In ${lang}, I emphasize correctness and clarity: direct definitions when asked, and concise code examples for implementation questions.`,
      "I focus on testability, performance, and maintainability, with typed interfaces and small, composable functions.",
    ].join("\n\n");
  }

  // Default fallback
  return [
    "I’d approach this by clarifying requirements, choosing the right abstractions, and building composable units. I’d test critical paths and monitor performance to ensure scale.",
  ].join("\n\n");
}

function extractFollowUpPrompt(aiResponse: string): string | null {
  try {
    const m = aiResponse.match(/Follow-up\s\d+\/\d+:\s([\s\S]+)/i);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

function generateFollowUpAnswer(q: ShapedQuestion, prompt: string): string {
  const text = prompt.toLowerCase();
  if (
    /prefer.*framework.*full\s*stack|which\s+javascript\s+framework\s+do\s+you\s+prefer/.test(
      text
    )
  ) {
    return [
      "Next.js + NestJS. Next: SSR/ISR, production‑ready routing/data‑fetching, great DX. Nest: opinionated modules, DI, guards/interceptors, strong testing.",
      "Reasons: consistent TypeScript across the stack, clear conventions, performance, and straightforward deployment.",
    ].join("\n\n");
  }
  if (/background|personal|influenced/.test(text)) {
    return [
      "I studied CS and started with vanilla JS and jQuery, later moving to React and TypeScript. Mentoring and building design systems shaped how I approach readability, accessibility, and performance.",
      "On teams, I favor clear interfaces, small PRs, and automated testing, which keeps velocity high while reducing regressions.",
    ].join("\n\n");
  }
  if (/challenge|overcame|how did you address/.test(text)) {
    return [
      "React: resolved a render loop by memoizing props and moving derived state out of components; NestJS: fixed intermittent auth by normalizing refresh token rotation and adding robust revocation.",
      "We added metrics to catch regressions and wrote load tests to verify throughput under peak traffic.",
    ].join("\n\n");
  }
  // Default: provide a concise, directly relevant answer
  return `${prompt}\n\nQuick take: ${q.question}`;
}

export default function InterviewAutomationPage() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [firstQuestion, setFirstQuestion] = useState<ShapedQuestion | null>(
    null
  );
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

  const startPayload = useMemo(
    () => ({
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
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
        timezone:
          typeof Intl !== "undefined"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : "UTC",
        isFreeInterview: true,
      },
    }),
    [auth.user]
  );

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
      let followUpPrompt: string | null = null;
      let lastQuestionId: string | null = null;

      while (currentQ) {
        const answer =
          followUpPrompt && lastQuestionId === currentQ.id
            ? generateFollowUpAnswer(currentQ, followUpPrompt)
            : generateFakeAnswer(currentQ);

        // Submit answer via enhanced conversation for AI feedback
        const convRes = await postJson<any>(
          "/interview/conversation/enhanced",
          {
            sessionId: sid,
            message: answer,
            questionId: currentQ.id,
            responseTime: 10 + Math.floor(Math.random() * 10),
            metadata: { messageType: "answer", responseLength: "long" },
          }
        );

        const aiResp =
          convRes.aiResponse ||
          convRes.longResponse ||
          convRes.shortResponse ||
          convRes.response ||
          "";
        setConversation((prev) => [
          ...prev,
          {
            question: currentQ!,
            candidateAnswer: answer,
            aiResponse: aiResp,
            progress: convRes.progress,
          },
        ]);
        // Prepare for potential follow-up
        followUpPrompt = extractFollowUpPrompt(aiResp);
        lastQuestionId = currentQ.id;

        // Use server-provided currentQuestion to respect follow-up state
        currentQ = (convRes.currentQuestion || null) as ShapedQuestion | null;
        if (!currentQ) break;
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
    if (
      auth.token &&
      autoStartOnLogin &&
      !running &&
      conversation.length === 0
    ) {
      runAutomation();
    }
  }, [
    auth.token,
    autoStartOnLogin,
    running,
    conversation.length,
    runAutomation,
  ]);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 24,
        background: "#000",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>
        Automated Interview (Browser)
      </h1>
      <p style={{ color: "#bbb" }}>
        Starts an interview, auto-answers each question, shows AI responses and
        final scores.
      </p>

      {/* Auth status / Login */}
      {!auth.token ? (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#111",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Login to start</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="email"
              placeholder="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #333",
                background: "#1a1a1a",
                color: "#fff",
              }}
            />
            <input
              type="password"
              placeholder="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #333",
                background: "#1a1a1a",
                color: "#fff",
              }}
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
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#bbb",
              }}
            >
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
        <div
          style={{
            background: "#2a0000",
            color: "#ff6b6b",
            padding: 12,
            borderRadius: 6,
          }}
        >
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
          <div
            key={`${item.question?.id ?? "q"}-${idx}`}
            style={{
              border: "1px solid #333",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              background: "#111",
              color: "#fff",
            }}
          >
            <div style={{ fontSize: 14, color: "#aaa" }}>
              Q{item.question?.questionNumber ?? "?"}/
              {item.question?.totalQuestions ?? "?"}
              {item.question?.category ? ` • ${item.question.category}` : ""}
            </div>
            <div style={{ fontWeight: 600, marginTop: 6, color: "#fff" }}>
              {item.question?.question || "Question unavailable"}
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 600 }}>Candidate Answer:</div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  margin: 0,
                  color: "#fff",
                  background: "transparent",
                }}
              >
                {item.candidateAnswer}
              </pre>
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 600 }}>AI Response:</div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  margin: 0,
                  color: "#fff",
                  background: "transparent",
                }}
              >
                {item.aiResponse}
              </pre>
            </div>

            {item.progress && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#bbb" }}>
                Progress: {JSON.stringify(item.progress)}
              </div>
            )}
          </div>
        ))}
      </div>

      {(finalScore !== null ||
        finalStrengths.length > 0 ||
        finalImprovements.length > 0) && (
        <div
          style={{ marginTop: 24, borderTop: "1px solid #333", paddingTop: 16 }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Final Results</h2>
          {finalScore !== null && (
            <div>
              <strong>Overall Score:</strong> {finalScore}
            </div>
          )}
          {finalSummary && (
            <div style={{ marginTop: 8 }}>
              <strong>Summary:</strong> {finalSummary}
            </div>
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
