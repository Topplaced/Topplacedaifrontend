import HomeClient from "@/components/HomeClient";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Star,
  Users,
  Zap,
  TrendingUp,
  Award,
  Target,
  ChevronDown,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <HomeClient />

      {/* Hero Section */}
      <section className="relative pt-20 md:pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00FFB2]/10 via-transparent to-[#00CC8E]/5"></div>

        <div className="container-custom relative z-10">
          <div
            className={`text-center transition-all duration-1000 opacity-100 translate-y-0`}
          >
            <div className="inline-flex items-center px-4 py-2 bg-[#00FFB2]/10 border border-[#00FFB2]/30 rounded-full mb-6">
              <Zap size={16} className="text-[#00FFB2] mr-2" />
              <span className="text-sm font-medium text-[#00FFB2]">
                AI-Powered Career Development
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Master Your Career with{" "}
              <span className="gradient-text">AI Interviews</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Practice with AI-powered mock interviews and get personalized
              feedback to accelerate your professional growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/auth/login"
                className="btn-primary flex items-center group px-8 py-4 text-lg"
              >
                Start Free Interview
                <ArrowRight
                  size={20}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <button className="btn-outline flex items-center px-8 py-4 text-lg">
                <Play size={20} className="mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 max-w-2xl mx-auto justify-items-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00FFB2] mb-2">
                  1K+
                </div>
                <div className="text-gray-400">Interviews Conducted</div>
              </div>
              {/* <div className="text-center">
                <div className="text-3xl font-bold text-[#00FFB2] mb-2">
                  500+
                </div>
                <div className="text-gray-400">Expert Mentors</div>
              </div> */}
              <div className="text-center">
                <div className="text-3xl font-bold text-[#00FFB2] mb-2">
                  95%
                </div>
                <div className="text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-[#00FFB2]/10 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-[#00CC8E]/10 rounded-full blur-xl animate-pulse-slow"></div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-[#0A0A0A]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">Top placed</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Advanced AI technology meets human expertise to provide the most
              comprehensive career development platform.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            {/* Feature Cards */}
            <div className="glass-card p-8 card-hover w-full sm:w-[360px]">
              <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-lg flex items-center justify-center mb-6">
                <Target size={24} className="text-[#00FFB2]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                AI-Powered Interviews
              </h3>
              <p className="text-gray-400">
                Practice with our advanced AI that adapts to your responses and
                provides real-time feedback on your interview performance.
              </p>
            </div>

            {/* <div className="glass-card p-8 card-hover">
              <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-lg flex items-center justify-center mb-6">
                <Users size={24} className="text-[#00FFB2]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Expert Mentorship</h3>
              <p className="text-gray-400">
                Connect with industry professionals who provide personalized
                guidance based on your career goals and skill gaps.
              </p>
            </div> */}

            <div className="glass-card p-8 card-hover w-full sm:w-[360px]">
              <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-lg flex items-center justify-center mb-6">
                <Award size={24} className="text-[#00FFB2]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Personalized Scorecards
              </h3>
              <p className="text-gray-400">
                Get detailed performance analytics with actionable insights to
                improve your interview skills and career prospects.
              </p>
            </div>

            <div className="glass-card p-8 card-hover w-full sm:w-[360px]">
              <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp size={24} className="text-[#00FFB2]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Progress Tracking</h3>
              <p className="text-gray-400">
                Monitor your improvement over time with detailed analytics and
                gamified progress tracking to stay motivated.
              </p>
            </div>

            <div className="glass-card p-8 card-hover w-full sm:w-[360px]">
              <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-lg flex items-center justify-center mb-6">
                <Zap size={24} className="text-[#00FFB2]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-Time Feedback</h3>
              <p className="text-gray-400">
                Receive instant feedback on your answers, body language, and
                communication skills during practice sessions.
              </p>
            </div>

            <div className="glass-card p-8 card-hover w-full sm:w-[360px]">
              <div className="w-12 h-12 bg-[#00FFB2]/20 rounded-lg flex items-center justify-center mb-6">
                <Star size={24} className="text-[#00FFB2]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Industry-Specific</h3>
              <p className="text-gray-400">
                Tailored interview questions and mentorship for your specific
                industry, role, and experience level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="glass-card p-12 text-center neon-glow">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have already accelerated their
              career growth with Top placed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/login"
                className="btn-primary flex items-center justify-center px-8 py-4 text-lg"
              >
                Get Started Free
                <ArrowRight size={20} className="ml-2" />
              </Link>
              <Link
                href="/pricing"
                className="btn-outline flex items-center justify-center px-8 py-4 text-lg"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Watch Demo Video (above footer) */}
      <section className="section-padding bg-[#0A0A0A] border-t border-[#00FFB2]/20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Watch Demo Video
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See how to use Top placed in a quick walkthrough.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-4xl rounded-xl overflow-hidden glass-card p-0">
              <iframe
                src="https://www.youtube.com/embed/l0Z3ZZ9JroQ?list=RDl0Z3ZZ9JroQ&rel=0"
                title="Top placed Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-[360px] md:h-[480px]"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[#00FFB2]/20 py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">TP</span>
                </div>
                <span className="text-xl font-bold gradient-text">
                  Top placed
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering careers through AI-powered interviews and expert
                mentorship.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/learner"
                    className="hover:text-[#00FFB2] transition-colors"
                  >
                    For Learners
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/mentor"
                    className="hover:text-[#00FFB2] transition-colors"
                  >
                    For Mentors
                  </Link>
                </li> */}
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-[#00FFB2] transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-[#00FFB2] transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/careers"
                    className="hover:text-[#00FFB2] transition-colors"
                  >
                    Careers
                  </Link>
                </li> */}
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-[#00FFB2] transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-[#00FFB2] transi]0jd]tion-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-[#00FFB2] transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#00FFB2]/20 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Top placed. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
