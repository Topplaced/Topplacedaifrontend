// lib/interviewApi.ts
// Centralized functions for managing interview sessions with the backend

import {
  CreateInterviewPayload,
  UpdateInterviewPayload,
  Interview,
  StartInterviewResponse,
  SubmitAnswerResponse,
  CompleteInterviewResponse,
  INTERVIEW_STORAGE_KEYS,
} from "@/types/interview-schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// ---------- utils

function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function apiFetch<T>(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<T> {
  if (!API_URL) throw new Error("API URL missing (NEXT_PUBLIC_API_URL)");
  const { token, ...rest } = opts;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(rest.headers || {}),
      ...(token ? getAuthHeaders(token) : {}),
    },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    const msg =
      (json && (json.message || json.error)) ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  // handle both direct objects and { success, data }
  if (json && typeof json === "object" && "success" in json) {
    if (!json.success) {
      throw new Error(json.message || "Request failed");
    }
    return (json.data ?? json) as T;
  }

  return (json ?? ({} as any)) as T;
}

// SSR-safe storage
const canUseLS = typeof window !== "undefined";
function lsGet<T>(key: string, fallback: T): T {
  if (!canUseLS) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, value: any) {
  if (!canUseLS) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
function lsRemove(key: string) {
  if (!canUseLS) return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

// ---------- API

// Add this helper function at the top of the file, after the imports
function mapLevelToBackend(frontendLevel: string): 'beginner' | 'intermediate' | 'advanced' {
  const levelMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
    'entry': 'beginner',
    'mid': 'intermediate', 
    'senior': 'advanced',
    'lead': 'advanced'
  };
  return levelMap[frontendLevel] || 'intermediate';
}

export async function startInterview(
  payload: CreateInterviewPayload,
  token: string
): Promise<StartInterviewResponse> {
  const transformedPayload = {
    user: {
      id: payload.userId,
      name: payload.userName,
      email: payload.userEmail,
      role: "candidate",
      experience: "intermediate",
      skills: [],
      goals: "interview preparation",
      education: [],
      workExperience: [],
      profileCompletion: 100,
    },
    configuration: {
      level: mapLevelToBackend(payload.level), // Map the level here
      category: payload.category,
      field: payload.field,
      duration: payload.duration,
      language: payload.language,
      hasCodeEditor: payload.hasCodeEditor,
      isFreeInterview: payload.isFreeInterview,
    },
    context: {
      sessionId: "",
      startTime: new Date(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      timezone:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : "UTC",
      isFreeInterview: payload.isFreeInterview,
    },
  };

  const result = await apiFetch<any>("/interview/start", {
    method: "POST",
    body: JSON.stringify(transformedPayload),
    token,
  });

  const response: StartInterviewResponse = {
    sessionId: result.sessionId,
    interview: {
      sessionId: result.sessionId,
      userId: payload.userId,
      userName: payload.userName,
      userEmail: payload.userEmail,
      level: payload.level, // Keep original frontend level for UI consistency
      category: payload.category,
      duration: payload.duration,
      language: payload.language,
      hasCodeEditor: payload.hasCodeEditor,
      status: "active",
      startTime: new Date(),
      scores: {
        overall: 0,
        technical: 0,
        communication: 0,
        problemSolving: 0,
        codeQuality: 0,
      },
      progress: {
        questionsAnswered: 0,
        totalQuestions: 0,
        completionPercentage: 0,
      },
      conversationHistory: [],
      questionIds: [],
      configuration: {
        level: payload.level, // Keep original frontend level for UI consistency
        category: payload.category,
        duration: payload.duration,
        language: payload.language,
        hasCodeEditor: payload.hasCodeEditor,
        isFreeInterview: payload.isFreeInterview,
      },
    },
    firstQuestion: result.firstQuestion,
  };

  lsSet(INTERVIEW_STORAGE_KEYS.CURRENT_SESSION, {
    sessionId: result.sessionId,
    interview: response.interview,
    currentQuestion: result.firstQuestion,
    startTime: new Date(),
  });

  return response;
}

export async function getInterviewSession(
  sessionId: string,
  token: string
): Promise<Interview> {
  return apiFetch<Interview>(`/interviews/${sessionId}`, {
    method: "GET",
    token,
  });
}

export async function updateInterviewSession(
  payload: UpdateInterviewPayload,
  token: string
): Promise<Interview> {
  const data = await apiFetch<Interview>(`/interviews/${payload.sessionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
  });

  const current = getCurrentInterviewSession();
  if (current && current.sessionId === payload.sessionId) {
    lsSet(INTERVIEW_STORAGE_KEYS.CURRENT_SESSION, {
      ...current,
      interview: data,
      lastUpdated: new Date().toISOString(),
    });
  }

  return data;
}

export async function submitAnswer(
  sessionId: string,
  answer: string,
  questionId: string,
  responseTime: number,
  token: string
): Promise<SubmitAnswerResponse> {
  return apiFetch<SubmitAnswerResponse>(`/interviews/${sessionId}/answer`, {
    method: "POST",
    body: JSON.stringify({
      answer,
      questionId,
      responseTime,
      timestamp: new Date().toISOString(),
    }),
    token,
  });
}

export async function completeInterview(
  sessionId: string,
  token: string
): Promise<CompleteInterviewResponse> {
  const data = await apiFetch<CompleteInterviewResponse>(
    `/interviews/${sessionId}/complete`,
    { method: "POST", token }
  );

  const current = getCurrentInterviewSession();
  if (current && current.sessionId === sessionId) {
    addToInterviewHistory({
      ...current,
      completedAt: new Date().toISOString(),
      results: data,
    });
    clearCurrentInterviewSession();
  }

  return data;
}

export async function terminateInterview(
  sessionId: string,
  reason: string,
  token: string
): Promise<void> {
  await apiFetch<{}>(`/interviews/${sessionId}/terminate`, {
    method: "POST",
    body: JSON.stringify({ reason }),
    token,
  });
  clearCurrentInterviewSession();
}

export async function getUserInterviewHistory(
  userId: string,
  token: string,
  limit = 10,
  offset = 0
) {
  return apiFetch<Interview[]>(
    `/interviews/user/${userId}?limit=${limit}&offset=${offset}`,
    { method: "GET", token }
  );
}

// ---------- local storage helpers

export function getCurrentInterviewSession() {
  return lsGet<any>(INTERVIEW_STORAGE_KEYS.CURRENT_SESSION, null);
}

export function clearCurrentInterviewSession() {
  lsRemove(INTERVIEW_STORAGE_KEYS.CURRENT_SESSION);
}

export function addToInterviewHistory(sessionData: any) {
  const history = getInterviewHistory();
  const updated = [sessionData, ...history].slice(0, 50);
  lsSet(INTERVIEW_STORAGE_KEYS.SESSION_HISTORY, updated);
}

export function getInterviewHistory() {
  return lsGet<any[]>(INTERVIEW_STORAGE_KEYS.SESSION_HISTORY, []);
}

export function saveDraftResponse(
  sessionId: string,
  questionId: string,
  response: string
) {
  const drafts = getDraftResponses();
  drafts[`${sessionId}_${questionId}`] = {
    response,
    timestamp: new Date().toISOString(),
  };
  lsSet(INTERVIEW_STORAGE_KEYS.DRAFT_RESPONSES, drafts);
}

export function getDraftResponse(sessionId: string, questionId: string) {
  const drafts = getDraftResponses();
  return drafts[`${sessionId}_${questionId}`]?.response || "";
}

export function getDraftResponses() {
  return lsGet<Record<string, { response: string; timestamp: string }>>(
    INTERVIEW_STORAGE_KEYS.DRAFT_RESPONSES,
    {}
  );
}

export function clearDraftResponses(sessionId?: string) {
  if (!sessionId) return lsRemove(INTERVIEW_STORAGE_KEYS.DRAFT_RESPONSES);
  const drafts = getDraftResponses();
  Object.keys(drafts).forEach((k) => {
    if (k.startsWith(sessionId)) delete drafts[k];
  });
  lsSet(INTERVIEW_STORAGE_KEYS.DRAFT_RESPONSES, drafts);
}

// ---------- time helpers

export function isInterviewActive(interview: Interview): boolean {
  if (!interview) return false;
  const now = Date.now();
  const start = new Date(interview.startTime).getTime();
  const durationMin =
    (interview as any).duration ??
    (interview as any).configuration?.duration ??
    0;
  const max = durationMin * 60 * 1000;
  return interview.status === "active" && now - start < max;
}

export function getRemainingTime(interview: Interview): number {
  if (!interview || interview.status !== "active") return 0;
  const now = Date.now();
  const start = new Date(interview.startTime).getTime();
  const durationMin =
    (interview as any).duration ??
    (interview as any).configuration?.duration ??
    0;
  const max = durationMin * 60 * 1000;
  return Math.max(0, max - (now - start));
}

export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
