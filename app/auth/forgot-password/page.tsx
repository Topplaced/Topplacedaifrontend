"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, AlertCircle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { requestPasswordReset } from "@/utils/api-helpers";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email);
      toast.success("Reset code sent to your email");
      setMessage(res.message || "Reset code sent to your email");
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error("Failed to send reset code");
      setMessage("Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const testimonialsCol1 = [
    {
      text: "TopPlaced is my go-to platform for realistic 1:1 interviews. It feels very close to actual company rounds.",
      name: "Jessica",
      title: "Global Data Lead, Energy Industry",
    },
    {
      text: "The entire experience is just so seamless. My followers love sharing their interview scorecards.",
      name: "Joerg Storm",
      title: "300K on LinkedIn",
    },
    {
      text: "Love how easy it is to schedule sessions and practice with role-specific questions. The feedback is super clear.",
      name: "Aishwarya Srinivasan",
      title: "LinkedIn Top Voice",
    },
  ];

  const testimonialsCol2 = [
    {
      text: "Great for busy professionals – jump in, run a focused mock, and export the results in minutes.",
      name: "Payal & Gaurav",
      title: "Creators & Mentors",
    },
    {
      text: "The scorecards make it easy to know exactly what to fix before the next round. Super actionable.",
      name: "Karan",
      title: "Senior Frontend Engineer",
    },
    {
      text: "I use TopPlaced with my mentees to simulate real panel interviews. The structure is excellent.",
      name: "Lorraine Lee",
      title: "Speaker, 320K on LinkedIn",
    },
  ];

  return (
    <div className="h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white overflow-hidden relative">
      {/* global styles + animations (same as login) */}
      <style>{`
        @media (min-width: 768px) {
          html, body {
            overflow: hidden;
          }
          body::-webkit-scrollbar {
            width: 0 !important;
            height: 0 !important;
          }
        }

        @keyframes glowPulse {
          0% {
            opacity: 0.35;
            transform: translate(-50%, -50%) scale(0.98);
          }
          50% {
            opacity: 0.55;
            transform: translate(-50%, -50%) scale(1.02);
          }
          100% {
            opacity: 0.35;
            transform: translate(-50%, -50%) scale(0.98);
          }
        }

        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .scroll-up { animation: scroll-up 36s linear infinite; }
        .scroll-down { animation: scroll-down 36s linear infinite; }
        .scroll-up:hover,
        .scroll-down:hover { animation-play-state: paused; }
      `}</style>

      {/* background grid + glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.2),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,255,178,0.20), rgba(0,204,142,0.12) 45%, rgba(0,0,0,0) 70%)",
          filter: "blur(26px)",
          animation: "glowPulse 6s ease-in-out infinite",
        }}
      />

      {/* back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center text-gray-400 hover:text-emerald-300 transition-colors text-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      {/* 2-column layout like login */}
      <div className="relative z-10 flex h-full flex-col lg:flex-row">
        {/* LEFT: form block */}
        <section className="flex-1 flex items-center justify-center px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-xl"
          >
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-emerald-300/80">
              TopPlaced · Forgot Password
            </p>
            <h1 className="text-[32px] sm:text-[36px] font-extrabold leading-tight">
              Reset your
              <br />
              password
            </h1>
            <p className="mt-3 text-sm text-gray-400 max-w-md">
              Enter the email you use with TopPlaced and we&apos;ll send you a
              one-time reset code.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {/* email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-200 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-[6px] border border-[#27313e] bg-[#050712]/90 pl-10 pr-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25"
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Make sure you have access to this inbox.
                </p>
              </div>

              {/* submit button – same pill as login/register */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{
                  scale: isLoading ? 1 : 1.01,
                  translateY: isLoading ? 0 : -1,
                }}
                whileTap={{
                  scale: isLoading ? 1 : 0.98,
                }}
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 px-6 py-3 text-sm font-bold text-black shadow-[0_14px_45px_rgba(0,255,178,0.45)] transition disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send reset code
                    <Lock className="h-4 w-4" />
                  </>
                )}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition group-hover:translate-x-full" />
              </motion.button>

              {/* status / error message */}
              {message && (
                <div className="mt-1 text-center text-xs text-gray-300 flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4 text-emerald-300" />
                  <span>{message}</span>
                </div>
              )}

              <p className="pt-2 text-center text-xs md:text-sm text-gray-400">
                Remembered your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </motion.div>
        </section>

        {/* RIGHT: same testimonial section style as login/register */}
        <section className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-b from-[#020617] via-[#020b16] to-[#020617] px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="w-full max-w-3xl"
          >
            <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-200">
              Loved by candidates
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Why professionals trust TopPlaced
            </h2>
            <div className="mt-4 h-px w-32 rounded-full bg-emerald-400/30" />

            <div className="mt-8 h-[420px] flex gap-6 overflow-hidden">
              {/* column 1 – scroll up */}
              <div className="scroll-up flex flex-col gap-4">
                {[...testimonialsCol1, ...testimonialsCol1].map((t, idx) => (
                  <div
                    key={`forgot-c1-${idx}`}
                    className="w-64 rounded-[24px] border border-[#1f2933] bg-[#020814] px-6 py-4"
                  >
                    <p className="mb-3 text-sm text-gray-100 leading-relaxed">
                      “{t.text}”
                    </p>
                    <p className="text-sm font-semibold text-emerald-300">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-gray-400">{t.title}</p>
                  </div>
                ))}
              </div>

              {/* column 2 – scroll down */}
              <div className="scroll-down hidden flex-col gap-4 xl:flex">
                {[...testimonialsCol2, ...testimonialsCol2].map((t, idx) => (
                  <div
                    key={`forgot-c2-${idx}`}
                    className="w-64 rounded-[24px] border border-[#1f2933] bg-[#020814] px-6 py-4"
                  >
                    <p className="mb-3 text-sm text-gray-100 leading-relaxed">
                      “{t.text}”
                    </p>
                    <p className="text-sm font-semibold text-emerald-300">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-gray-400">{t.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
