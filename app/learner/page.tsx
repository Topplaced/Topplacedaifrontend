"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Trophy,
  Users,
  TrendingUp,
  Star,
  Calendar,
  ArrowRight,
  Target,
  Award,
  Clock,
  BookOpen,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

export default function LearnerDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [interviewsCount, setInterviewsCount] = useState(1);
  const [avgScore, setAvgScore] = useState(85);
  const [mentorsCount, setMentorsCount] = useState(2);

  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  console.log

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const recentScores = [
    {
      date: "2024-01-15",
      role: "Software Engineer",
      score: 85,
      improvement: "+12%",
    },
    {
      date: "2024-01-12",
      role: "Product Manager",
      score: 78,
      improvement: "+8%",
    },
    {
      date: "2024-01-10",
      role: "Data Scientist",
      score: 92,
      improvement: "+15%",
    },
  ];

  const recommendedMentors = [
    {
      name: "Sarah Chen",
      role: "Senior Software Engineer",
      company: "Google",
      rating: 4.9,
      price: "$150/hour",
      expertise: ["System Design", "JavaScript", "React"],
      image:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    },
    {
      name: "Michael Rodriguez",
      role: "VP of Engineering",
      company: "Meta",
      rating: 5.0,
      price: "$200/hour",
      expertise: ["Leadership", "Architecture", "Team Building"],
      image:
        "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    },
    {
      name: "Dr. Emily Watson",
      role: "AI Research Lead",
      company: "OpenAI",
      rating: 4.8,
      price: "$250/hour",
      expertise: ["Machine Learning", "Python", "Data Science"],
      image:
        "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />

        <div className="ml-64 pt-20 pb-12">
          <div className="container-custom">
            {/* Welcome Header */}
            <div
              className={`mb-8 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Welcome back,{" "}
                    <span className="gradient-text">
                      {user?.name || "Learner"}
                      
                    </span>
                    ! 👋
                  </h1>
                  <p className="text-gray-400 text-lg">
                    Ready to take your career to the next level?
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FFB2]">
                      {interviewsCount}
                    </div>
                    <div className="text-sm text-gray-400">Interviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FFB2]">
                      {avgScore}%
                    </div>
                    <div className="text-sm text-gray-400">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FFB2]">
                      {mentorsCount}
                    </div>
                    <div className="text-sm text-gray-400">Mentors</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Start Interview Card */}
              <div className="lg:col-span-2 glass-card p-8 neon-glow card-hover">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Ready for Your Next Interview?
                    </h2>
                    <p className="text-gray-400">
                      Practice with our AI interviewer and get instant feedback
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-[#00FFB2]/20 rounded-xl flex items-center justify-center">
                    <Play size={32} className="text-[#00FFB2]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#1A1A1A] rounded-lg p-4 text-center">
                    <Target size={24} className="text-[#00FFB2] mx-auto mb-2" />
                    <div className="font-semibold">Technical</div>
                    <div className="text-sm text-gray-400">45 min</div>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-lg p-4 text-center">
                    <Users size={24} className="text-[#00FFB2] mx-auto mb-2" />
                    <div className="font-semibold">Behavioral</div>
                    <div className="text-sm text-gray-400">30 min</div>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-lg p-4 text-center">
                    <BookOpen
                      size={24}
                      className="text-[#00FFB2] mx-auto mb-2"
                    />
                    <div className="font-semibold">Case Study</div>
                    <div className="text-sm text-gray-400">60 min</div>
                  </div>
                </div>

                <Link
                  href="/learner/interview/setup"
                  className="btn-primary flex items-center justify-center w-full py-3"
                >
                  <Play size={20} className="mr-2" />
                  Start AI Interview
                </Link>
              </div>

              {/* Progress Card */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Your Progress</h3>
                  <TrendingUp size={24} className="text-[#00FFB2]" />
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Interview Skills</span>
                      <span className="text-[#00FFB2]">87%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full"
                        style={{ width: "87%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Technical Knowledge</span>
                      <span className="text-[#00FFB2]">92%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Communication</span>
                      <span className="text-[#00FFB2]">79%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] h-2 rounded-full"
                        style={{ width: "79%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/learner/scorecard"
                  className="btn-outline w-full mt-4 py-2 text-center block"
                >
                  View Detailed Report
                </Link>
                <Link
                  href="/learner/history"
                  className="btn-outline w-full mt-2 py-2 text-center block text-sm"
                >
                  View All Records
                </Link>
              </div>
            </div>

            {/* Recent Interviews & Mentorship */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Recent Interview Scores */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">
                    Recent Interview Scores
                  </h3>
                  <Trophy size={24} className="text-[#00FFB2]" />
                </div>

                <div className="space-y-4">
                  {recentScores.map((interview, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg"
                    >
                      <div>
                        <div className="font-semibold">{interview.role}</div>
                        <div className="text-sm text-gray-400">
                          {interview.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#00FFB2]">
                          {interview.score}%
                        </div>
                        <div className="text-sm text-green-400">
                          {interview.improvement}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/learner/scorecard"
                  className="btn-outline w-full mt-4 py-2 text-center block"
                >
                  View All Scores
                </Link>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Recent Achievements</h3>
                  <Award size={24} className="text-[#00FFB2]" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mr-4">
                      <Trophy size={20} className="text-yellow-500" />
                    </div>
                    <div>
                      <div className="font-semibold">Interview Streak</div>
                      <div className="text-sm text-gray-400">
                        Completed 5 interviews in a row
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-full flex items-center justify-center mr-4">
                      <Zap size={20} className="text-[#00FFB2]" />
                    </div>
                    <div>
                      <div className="font-semibold">Quick Learner</div>
                      <div className="text-sm text-gray-400">
                        Improved score by 15% in one week
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Upcoming Sessions */}
              {/* <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Upcoming Sessions</h3>
                  <Calendar size={24} className="text-[#00FFB2]" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="w-12 h-12 bg-[#00FFB2] rounded-full flex items-center justify-center mr-4">
                      <Users size={20} className="text-black" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        1:1 Mentorship with Sarah Chen
                      </div>
                      <div className="text-sm text-gray-400">
                        Tomorrow, 2:00 PM
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#00FFB2]">
                        System Design
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-full flex items-center justify-center mr-4">
                      <Clock size={20} className="text-[#00FFB2]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        Mock Interview Session
                      </div>
                      <div className="text-sm text-gray-400">
                        Friday, 10:00 AM
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#00FFB2]">Technical</div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/learner/sessions"
                  className="btn-outline w-full mt-4 py-2 text-center block"
                >
                  Manage Sessions
                </Link>
              </div> */}
            </div>

            {/* Recommended Mentors */}
            {/* <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    Recommended Mentors
                  </h3>
                  <p className="text-gray-400">
                    Based on your skill gaps and career goals
                  </p>
                </div>
                <Link
                  href="/learner/mentors"
                  className="btn-outline flex items-center"
                >
                  View All
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedMentors.map((mentor, index) => (
                  <div
                    key={index}
                    className="bg-[#1A1A1A] rounded-lg p-6 card-hover"
                  >
                    <div className="flex items-center mb-4">
                      <img
                        src={mentor.image}
                        alt={mentor.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <div className="font-semibold">{mentor.name}</div>
                        <div className="text-sm text-gray-400">
                          {mentor.role}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-1">
                        {mentor.company}
                      </div>
                      <div className="flex items-center mb-2">
                        <Star size={16} className="text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">
                          {mentor.rating}
                        </span>
                        <span className="text-sm text-gray-400 ml-2">
                          {mentor.price}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertise
                          .slice(0, 2)
                          .map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="text-xs bg-[#00FFB2]/20 text-[#00FFB2] px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        {mentor.expertise.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{mentor.expertise.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    <button className="btn-primary w-full py-2 text-sm">
                      Book Session
                    </button>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Achievement & Gamification */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Achievements */}
              {/* <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Recent Achievements</h3>
                  <Award size={24} className="text-[#00FFB2]" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mr-4">
                      <Trophy size={20} className="text-yellow-500" />
                    </div>
                    <div>
                      <div className="font-semibold">Interview Streak</div>
                      <div className="text-sm text-gray-400">
                        Completed 5 interviews in a row
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-full flex items-center justify-center mr-4">
                      <Zap size={20} className="text-[#00FFB2]" />
                    </div>
                    <div>
                      <div className="font-semibold">Quick Learner</div>
                      <div className="text-sm text-gray-400">
                        Improved score by 15% in one week
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Plan Upgrade */}
              {/* <div className="glass-card p-6 border-2 border-[#00FFB2]/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Upgrade Your Plan</h3>
                  <Star size={24} className="text-[#00FFB2]" />
                </div>

                <p className="text-gray-400 mb-4">
                  Unlock unlimited interviews, premium mentors, and advanced
                  analytics.
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-[#00FFB2] rounded-full mr-2"></div>
                    Unlimited AI interviews
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-[#00FFB2] rounded-full mr-2"></div>
                    Priority mentor booking
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-[#00FFB2] rounded-full mr-2"></div>
                    Advanced analytics & insights
                  </div>
                </div>

                <Link
                  href="/pricing"
                  className="btn-primary w-full py-3 text-center block"
                >
                  Upgrade to Pro
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
