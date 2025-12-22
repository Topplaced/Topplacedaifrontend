"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  MessageSquare,
  Loader2,
  Minus,
  Clock,
  Award,
  Trophy,
  BarChart3,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import { RootState } from "@/store/store";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SkillAnalysis {
  label: string;
  score: number;
  trend: "up" | "down" | "stable";
}

interface InterviewRecord {
  id: string;
  category: string;
  level: string;
  duration: number; // minutes
  overallScore: number;
  scores: {
    technical: number;
    communication: number;
    problemSolving: number;
    codeQuality?: number;
  };
  completedAt: string; // ISO
  timeSpent: number; // seconds
  tabSwitchCount: number;
  codeSubmissions?: number;
  status: "completed" | "terminated" | "incomplete";
  isFreeInterview?: boolean;
  role?: string;
}

interface ScorecardData {
  overallScore: number;
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  codeQuality?: number;
  skillsAnalysis: SkillAnalysis[];
  strengths: string;
  improvements: string;
  recommendations: string;
  interviewDate: string; // latest interview date
  role: string; // latest interview role/category
  recentInterviews: InterviewRecord[];
  allInterviews: InterviewRecord[];
  stats: {
    totalInterviews: number;
    completedInterviews: number;
    totalTimeSpentSec: number;
    bestScore: number;
    worstScore: number;
    highScores80Plus: number;
    categoriesExplored: number;
  };
}

export default function ScorecardPage() {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);

  // —— Fetch & transform ——
  useEffect(() => {
    const fetchInterviewHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // If unauthenticated, use mock
        if (!user?._id || !token) {
          setInterviews(getMockInterviews());
          return;
        }

        const res = await fetch(
          `${API_URL}/users/${user._id}/interview-history?limit=200&offset=0`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          console.warn("/interview-history not OK, falling back to mock");
          setInterviews(getMockInterviews());
          return;
        }

        const data = await res.json();
        const transformed: InterviewRecord[] = (data?.interviews || []).map(
          (interview: any) => {
            const scores = interview.scores || {};
            const overallScore = scores.overall ?? interview.score ?? 0;
            return {
              id: interview.sessionId || interview._id || crypto.randomUUID(),
              category: interview.category || interview.role || "software",
              level: interview.level || "mid",
              duration: Math.max(1, Math.round((interview.duration || 0) / 60)),
              overallScore: Math.round(overallScore),
              scores: {
                technical: Math.round(
                  scores.technical ?? scores.overall ?? interview.score ?? 0
                ),
                communication: Math.round(
                  scores.communication ?? scores.overall ?? interview.score ?? 0
                ),
                problemSolving: Math.round(
                  scores.problemSolving ?? scores.overall ?? interview.score ?? 0
                ),
                codeQuality: interview.hasCodeEditor
                  ? Math.round(
                      scores.codeQuality ??
                        scores.technical ??
                        scores.overall ??
                        interview.score ??
                        0
                    )
                  : undefined,
              },
              completedAt: interview.endTime || interview.startTime || new Date().toISOString(),
              timeSpent: interview.duration || 0,
              tabSwitchCount: interview.tabSwitchCount || 0,
              codeSubmissions:
                interview.codeSubmissions ||
                (interview.hasCodeEditor ? Math.floor(Math.random() * 5) + 1 : undefined),
              status:
                interview.status === "completed"
                  ? "completed"
                  : interview.status === "terminated"
                  ? "terminated"
                  : "incomplete",
              isFreeInterview: interview.isFreeInterview || false,
              role: interview.role || interview.category || "Software Engineer",
            } as InterviewRecord;
          }
        );

        setInterviews(transformed);
      } catch (e: any) {
        console.error("Failed to load interview history", e);
        setError("Failed to load scorecard data");
        setInterviews(getMockInterviews());
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewHistory();
  }, [user?._id, token]);

  // —— Derived scorecard data (memoized) ——
  const scorecardData: ScorecardData | null = useMemo(() => {
    if (!interviews || interviews.length === 0) return null;

    // Sort by date desc
    const sorted = [...interviews].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    const latest = sorted[0];

    const avg = (arr: number[]) =>
      arr.length ? Math.round(arr.reduce((s, x) => s + x, 0) / arr.length) : 0;

    const overallAvg = avg(sorted.map((i) => i.overallScore));
    const techAvg = avg(sorted.map((i) => i.scores.technical));
    const commAvg = avg(sorted.map((i) => i.scores.communication));
    const probAvg = avg(sorted.map((i) => i.scores.problemSolving));
    const withCQ = sorted.filter((i) => i.scores.codeQuality !== undefined);
    const cqAvg = withCQ.length ? avg(withCQ.map((i) => i.scores.codeQuality || 0)) : undefined;

    // Trends: compare last 3 vs previous 3 for each skill
    const chunk = (arr: number[], n: number) => arr.slice(0, n);
    const last3 = chunk(sorted.map((i) => i.overallScore), 3);
    const prev3 = chunk(sorted.slice(3).map((i) => i.overallScore), 3);
    const trendOf = (metric: (i: InterviewRecord) => number): "up" | "down" | "stable" => {
      const a = avg(sorted.slice(0, 3).map(metric));
      const b = avg(sorted.slice(3, 6).map(metric));
      if (!b) return "stable";
      if (a - b >= 3) return "up";
      if (b - a >= 3) return "down";
      return "stable";
    };

    const skillsAnalysis: SkillAnalysis[] = [
      { label: "Technical Skills", score: techAvg, trend: trendOf((i) => i.scores.technical) },
      { label: "Communication", score: commAvg, trend: trendOf((i) => i.scores.communication) },
      { label: "Problem Solving", score: probAvg, trend: trendOf((i) => i.scores.problemSolving) },
    ];
    if (cqAvg !== undefined) {
      skillsAnalysis.push({
        label: "Code Quality",
        score: cqAvg,
        trend: trendOf((i) => i.scores.codeQuality ?? i.scores.technical),
      });
    }

    const strengths = generateStrengths(techAvg, commAvg, probAvg);
    const improvements = generateImprovements(techAvg, commAvg, probAvg);
    const recommendations = generateRecommendations(techAvg, commAvg, probAvg);

    const stats = {
      totalInterviews: sorted.length,
      completedInterviews: sorted.filter((i) => i.status === "completed").length,
      totalTimeSpentSec: sorted.reduce((s, i) => s + (i.timeSpent || 0), 0),
      bestScore: sorted.reduce((m, i) => Math.max(m, i.overallScore), 0),
      worstScore: sorted.reduce((m, i) => Math.min(m, i.overallScore), 100),
      highScores80Plus: sorted.filter((i) => i.overallScore >= 80).length,
      categoriesExplored: new Set(sorted.map((i) => i.category)).size,
    };

    return {
      overallScore: overallAvg,
      technicalSkills: techAvg,
      communication: commAvg,
      problemSolving: probAvg,
      codeQuality: cqAvg,
      skillsAnalysis,
      strengths,
      improvements,
      recommendations,
      interviewDate: latest.completedAt,
      role: latest.role || latest.category,
      recentInterviews: sorted.slice(0, 3),
      allInterviews: sorted,
      stats,
    } as ScorecardData;
  }, [interviews]);

  // —— UI helpers ——
  const getScoreColor = (score: number): string => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressBarWidth = (score: number): string => {
    const rounded = Math.max(0, Math.min(100, Math.round(score / 5) * 5));
    return `w-[${rounded}%]`;
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatH = (sec: number) => `${Math.round(sec / 3600)}h`;

  const humanizeLabel = (value?: string) => {
    if (!value) return "";
    return value
      .toString()
      .replace(/[_-]+/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };

  // —— Strength/Improvement/Recommendation generators ——
  function generateStrengths(technical: number, communication: number, problemSolving: number): string {
    const strengths: string[] = [];
    if (technical >= 85) strengths.push("exceptional technical expertise and coding proficiency");
    else if (technical >= 75) strengths.push("solid technical foundation and programming skills");

    if (communication >= 85) strengths.push("excellent communication and articulation abilities");
    else if (communication >= 75) strengths.push("good communication skills and clear explanations");

    if (problemSolving >= 85) strengths.push("outstanding analytical thinking and problem-solving approach");
    else if (problemSolving >= 75) strengths.push("effective problem-solving methodology");

    return strengths.length > 0
      ? `You demonstrate ${strengths.join(", ")}. These are valuable assets that set you apart in technical interviews.`
      : "You show potential across multiple areas. With focused practice, you can develop strong technical interview skills.";
  }

  function generateImprovements(technical: number, communication: number, problemSolving: number): string {
    const improvements: string[] = [];

    if (technical < 75) improvements.push("strengthen your technical knowledge and coding fundamentals");
    if (communication < 75) improvements.push("enhance your ability to explain complex concepts clearly");
    if (problemSolving < 75) improvements.push("develop more systematic problem-solving approaches");

    const scores = [
      { area: "technical skills", score: technical },
      { area: "communication", score: communication },
      { area: "problem solving", score: problemSolving },
    ];
    const lowest = scores.reduce((min, cur) => (cur.score < min.score ? cur : min));
    if (lowest.score < 75 && !improvements.some((i) => i.includes(lowest.area))) {
      improvements.push(`focus particularly on improving your ${lowest.area}`);
    }

    return improvements.length > 0
      ? `Consider working to ${improvements.join(", ")}. Targeted practice in these areas will significantly boost your interview performance.`
      : "You're performing well across all areas. Continue practicing to maintain and further improve your skills.";
  }

  function generateRecommendations(technical: number, communication: number, problemSolving: number): string {
    const avgScore = (technical + communication + problemSolving) / 3;
    let base = "";
    if (avgScore >= 85) base = "You're interview-ready! Focus on advanced topics and system design questions.";
    else if (avgScore >= 75) base = "You're on the right track. Practice more challenging problems to reach the next level.";
    else if (avgScore >= 65) base = "Build consistency in your fundamentals before tackling advanced concepts.";
    else base = "Start with basic concepts and gradually work up to more complex problems.";

    let specific = "";
    if (technical < communication && technical < problemSolving) specific = " Prioritize coding practice and algorithm study.";
    else if (communication < technical && communication < problemSolving)
      specific = " Work on explaining your thought process more clearly during problem-solving.";
    else if (problemSolving < technical && problemSolving < communication)
      specific = " Practice breaking down complex problems into smaller, manageable steps.";

    return base + specific;
  }

  // —— Mock (fallback) ——
  function getMockInterviews(): InterviewRecord[] {
    const now = Date.now();
    return [
      {
        id: "1",
        category: "frontend",
        level: "senior",
        duration: 60,
        overallScore: 90,
        scores: { technical: 93, communication: 86, problemSolving: 88, codeQuality: 92 },
        completedAt: new Date(now - 1 * 86400000).toISOString(),
        timeSpent: 3600,
        tabSwitchCount: 0,
        codeSubmissions: 2,
        status: "completed",
        isFreeInterview: true,
        role: "Frontend Developer",
      },
      {
        id: "2",
        category: "fullstack",
        level: "mid",
        duration: 45,
        overallScore: 82,
        scores: { technical: 85, communication: 78, problemSolving: 83, codeQuality: 80 },
        completedAt: new Date(now - 2 * 86400000).toISOString(),
        timeSpent: 2700,
        tabSwitchCount: 1,
        codeSubmissions: 3,
        status: "completed",
        isFreeInterview: false,
        role: "Full Stack Developer",
      },
      {
        id: "3",
        category: "backend",
        level: "mid",
        duration: 30,
        overallScore: 74,
        scores: { technical: 76, communication: 70, problemSolving: 75 },
        completedAt: new Date(now - 3 * 86400000).toISOString(),
        timeSpent: 1800,
        tabSwitchCount: 0,
        status: "completed",
        isFreeInterview: true,
        role: "Backend Developer",
      },
    ];
  }

  // —— Render ——
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          <Navbar />
          <Sidebar userType="learner" />
          <div className="ml-64 pt-20 pb-12">
            <div className="container-custom flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
                <p className="text-gray-400">Loading your scorecard...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!scorecardData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          <Navbar />
          <Sidebar userType="learner" />
          <div className="ml-64 pt-20 pb-12">
            <div className="container-custom flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="glass-card p-8">
                  <h2 className="text-2xl font-bold mb-4">No Interview History Found</h2>
                  <p className="text-gray-400 mb-6">
                    {error ? (
                      <span className="text-red-400">{error}</span>
                    ) : (
                      "Complete your first interview to see your scorecard"
                    )}
                  </p>
                  <div className="space-y-4">
                    <button onClick={() => router.push("/learner/interview/setup")} className="btn-primary w-full">
                      Start Your First Interview
                    </button>
                    <button onClick={() => setInterviews(getMockInterviews())} className="btn-secondary w-full">
                      View Sample Scorecard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />

      <div className="md:ml-64 ml-0 pt-16 md:pt-20 pb-24 md:pb-12">
        <div className="container-custom space-y-10">
          {/* Header */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Interview <span className="gradient-text">Scorecard</span>
            </h1>
            <p className="text-gray-400 text-lg">Performance from all {scorecardData.stats.totalInterviews} interviews</p>
          </div>

          {/* KPI Overview (dynamic averages) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center">
              <Trophy className="text-accent mx-auto mb-3" />
              <div className={`text-3xl font-bold ${getScoreColor(scorecardData.overallScore)}`}>
                {scorecardData.overallScore}%
              </div>
              <div className="text-sm text-gray-400">Average Overall</div>
            </div>
            <div className="glass-card p-6 text-center">
              <Target className="text-accent mx-auto mb-3" />
              <div className={`text-2xl font-bold ${getScoreColor(scorecardData.technicalSkills)}`}>
                {scorecardData.technicalSkills}%
              </div>
              <div className="text-sm text-gray-400">Avg Technical</div>
            </div>
            <div className="glass-card p-6 text-center">
              <Brain className="text-accent mx-auto mb-3" />
              <div className={`text-2xl font-bold ${getScoreColor(scorecardData.problemSolving)}`}>
                {scorecardData.problemSolving}%
              </div>
              <div className="text-sm text-gray-400">Avg Problem Solving</div>
            </div>
            <div className="glass-card p-6 text-center">
              <Award className="text-accent mx-auto mb-3" />
              <div className={`text-2xl font-bold ${getScoreColor(scorecardData.communication)}`}>
                {scorecardData.communication}%
              </div>
              <div className="text-sm text-gray-400">Avg Communication</div>
            </div>
          </div>

          {/* Overall Card (latest meta) */}
          <div className="glass-card text-center p-8">
            <div className="mb-6">
              <div className={`text-6xl font-bold neon-text mb-2 ${getScoreColor(scorecardData.overallScore)}`}>
                {scorecardData.overallScore}%
              </div>
              <div className="text-xl text-gray-400">Average Overall Score</div>
              <div className="text-sm text-gray-500 mt-2">Latest: {formatDate(scorecardData.interviewDate)}</div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(scorecardData.technicalSkills)}`}>
                  {scorecardData.technicalSkills}%
                </div>
                <div className="text-sm text-gray-400">Technical Skills (avg)</div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(scorecardData.communication)}`}>
                  {scorecardData.communication}%
                </div>
                <div className="text-sm text-gray-400">Communication (avg)</div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(scorecardData.problemSolving)}`}>
                  {scorecardData.problemSolving}%
                </div>
                <div className="text-sm text-gray-400">Problem Solving (avg)</div>
              </div>
            </div>
            {scorecardData.codeQuality !== undefined && (
              <div className="mt-4">
                <div className={`text-lg font-semibold ${getScoreColor(scorecardData.codeQuality)}`}>
                  Code Quality Avg: {scorecardData.codeQuality}%
                </div>
              </div>
            )}
          </div>

          {/* Skills Analysis + Recent Interviews */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">Skills Analysis</h2>
              <div className="space-y-6">
                {scorecardData.skillsAnalysis.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{skill.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className={getScoreColor(skill.score)}>{skill.score}%</span>
                        {getTrendIcon(skill.trend)}
                      </div>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <div className={`h-2 rounded-full bg-accent ${getProgressBarWidth(skill.score)}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Interviews</h2>
                <button onClick={() => router.push("/learner/history")} className="text-accent hover:text-accent/80 text-sm font-medium flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {scorecardData.recentInterviews.map((interview) => (
                  <div key={interview.id} className={`p-4 rounded-lg border border-blue-500/30`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-white">{humanizeLabel(interview.role || interview.category)}</div>
                        <div className="text-xs text-gray-400">{formatDate(interview.completedAt)}</div>
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor(interview.overallScore)}`}>
                        {interview.overallScore}%
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className={getScoreColor(interview.scores.technical)}>{interview.scores.technical}%</div>
                        <div className="text-gray-500">Tech</div>
                      </div>
                      <div className="text-center">
                        <div className={getScoreColor(interview.scores.communication)}>{interview.scores.communication}%</div>
                        <div className="text-gray-500">Comm</div>
                      </div>
                      <div className="text-center">
                        <div className={getScoreColor(interview.scores.problemSolving)}>{interview.scores.problemSolving}%</div>
                        <div className="text-gray-500">Problem</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Performance Insights</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Strengths
                </h3>
                <p className="text-gray-300 leading-relaxed">{scorecardData.strengths}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Areas for Improvement
                </h3>
                <p className="text-gray-300 leading-relaxed">{scorecardData.improvements}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Recommendations
                </h3>
                <p className="text-gray-300 leading-relaxed">{scorecardData.recommendations}</p>
              </div>
            </div>
          </div>

          {/* Aggregated Stats (from History) */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 text-accent mr-2" />
              Aggregated Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                <div className="text-2xl font-bold text-accent mb-1">{scorecardData.stats.totalInterviews}</div>
                <div className="text-sm text-gray-400">Total Interviews</div>
              </div>
              <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(scorecardData.stats.bestScore)} mb-1`}>
                  {scorecardData.stats.bestScore}%
                </div>
                <div className="text-sm text-gray-400">Best Score</div>
              </div>
              <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(scorecardData.stats.worstScore)} mb-1`}>
                  {scorecardData.stats.worstScore}%
                </div>
                <div className="text-sm text-gray-400">Lowest Score</div>
              </div>
              <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                <div className="text-2xl font-bold text-accent mb-1">{scorecardData.stats.highScores80Plus}</div>
                <div className="text-sm text-gray-400">Scores ≥ 80%</div>
              </div>
              <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                <div className="text-2xl font-bold text-accent mb-1">{scorecardData.stats.categoriesExplored}</div>
                <div className="text-sm text-gray-400">Categories Explored</div>
              </div>
              <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                <div className="text-2xl font-bold text-accent mb-1">{formatH(scorecardData.stats.totalTimeSpentSec)}</div>
                <div className="text-sm text-gray-400">Total Time</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Recommended Actions</h2>
            <div className="grid md:grid-cols-1 gap-6">
              <button onClick={() => router.push("/learner/interview/setup")} className="btn-primary flex items-center justify-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Start Interview Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
    </ProtectedRoute>
  );
}
