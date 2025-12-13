"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  AlertCircle,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      router.replace(user.role === "mentor" ? "/mentor" : "/learner");
    }
  }, [token, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      const msg = "Passwords don't match.";
      setMessage(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    try {
      if (!API_URL) {
        throw new Error("API URL not configured");
      }

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: form.email,
          password: form.password,
          role: "user",
        }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok && data.access_token && data.user) {
        localStorage.setItem("token", data.access_token);
        dispatch(loginSuccess(data));
        toast.success("Registration successful! Redirecting...");

        if (data.user.role === "mentor") {
          router.push("/mentor");
        } else if (data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/learner");
        }
      } else if (
        res.status === 403 &&
        data?.message?.includes("email not verified")
      ) {
        const msg = "Please verify your email before logging in.";
        setMessage(msg);
        toast.error(msg);
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(form.email)}`
        );
      } else if (res.ok && (!data?.access_token || !data?.user)) {
        toast.success("Registration successful! Please verify your email.");
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(form.email)}`
        );
      } else {
        const fallback = !contentType
          ? `${res.status} ${res.statusText}`
          : "Registration failed.";
        const msg = data?.message || fallback;
        setMessage(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Server error. Please try again.";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
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
      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .scroll-up {
          animation: scroll-up 36s linear infinite;
        }
        .scroll-down {
          animation: scroll-down 36s linear infinite;
        }
        .scroll-up:hover,
        .scroll-down:hover {
          animation-play-state: paused;
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
      `}</style>

      {/* background grid + glow to match login */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_60%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.2),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,255,178,0.20), rgba(0,204,142,0.12) 45%, rgba(0,0,0,0) 70%)",
          filter: "blur(26px)",
          animation: "glowPulse 6s ease-in-out infinite",
        }}
      />

      {/* back button like login page */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center text-gray-400 hover:text-emerald-300 transition-colors text-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      {/* 2-column full-height layout */}
      <div className="flex h-full flex-col lg:flex-row relative z-10">
        {/* LEFT: centered sign-up block */}
        <section className="flex-1 flex items-center justify-center px-6 lg:px-16">
          <div className="w-full max-w-xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.32em] text-emerald-300/80">
              TopPlaced · Sign Up
            </p>
            <h1 className="text-[32px] sm:text-[36px] font-extrabold leading-tight">
              Launch your
              <br />
              TopPlaced profile
            </h1>
            <p className="mt-3 text-sm text-gray-400 max-w-md">
              Use your work email to create a secure account and start
              practicing role-specific interviews with AI.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {/* First / Last */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-300">
                    First Name
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      name="firstName"
                      type="text"
                      placeholder="First name"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-[6px] border border-[#27313e] bg-[#050712]/90 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-300">
                    Last Name
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      name="lastName"
                      type="text"
                      placeholder="Last name"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-[6px] border border-[#27313e] bg-[#050712]/90 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-[6px] border border-[#27313e] bg-[#050712]/90 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25"
                  />
                </div>
              </div>

              {/* Password row */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-[6px] border border-[#27313e] bg-[#050712]/90 pl-9 pr-9 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Use a mix of letters, numbers and symbols.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-[6px] border border-[#27313e] bg-[#050712]/90 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25"
                    />
                  </div>
                </div>
              </div>

              {/* error */}
              {message && (
                <div className="mt-1 flex items-center gap-2 rounded-[6px] border border-red-500/45 bg-red-500/12 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>{message}</span>
                </div>
              )}

              {/* button – same colour as login, extra shadow */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 px-6 py-3 text-sm font-bold text-black shadow-[0_14px_45px_rgba(0,255,178,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_70px_rgba(0,255,178,0.6)] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                    Creating Account…
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-1.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </>
                )}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition group-hover:translate-x-full" />
              </button>

              <p className="pt-3 text-center text-[11px] sm:text-xs text-gray-500">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
              <p className="pb-1 text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </section>

        {/* RIGHT: testimonials (unchanged, shared with login) */}
        <section className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-b from-[#020617] via-[#020b16] to-[#020617] px-8 lg:px-12">
          <div className="w-full max-w-3xl">
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
                    key={`reg-c1-${idx}`}
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
                    key={`reg-c2-${idx}`}
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
          </div>
        </section>
      </div>
    </div>
  );
}
