"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Eye,
  EyeOff,
  User,
  Briefcase,
  Linkedin,
  ArrowRight,
  AlertCircle,
  Clock,
  Settings,
  Users,
  ChevronDown,
  Lock,
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
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // "user" = Interviewer, "mentor" = Mentor
    name: "",
    experience: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationChoice, setVerificationChoice] = useState<"" | "verify-now" | "verify-later">("verify-now");

  useEffect(() => {
    if (token && user) {
      if (user.role === "mentor") router.replace("/mentor");
      else if (user.role === "admin") router.replace("/admin");
      else router.replace("/learner");
    }
  }, [token, user, router]);

  const handleLinkedInLogin = () => {
    setLoading(true);
    window.location.href = `${API_URL}/api/auth/linkedin`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (!verificationChoice) {
      const msg = "Please choose a verification option.";
      setMessage(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          experience: form.role === "mentor" ? form.experience : undefined,
          sendVerificationEmail: verificationChoice === "verify-now",
        }),
      });
      const data = await res.json();

      if (res.ok && data?.message) {
        if (verificationChoice === "verify-now") {
          toast.success("Account created! Please verify your email.");
          router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}`);
        } else {
          toast.success("Account created! You can verify later from profile.");
          if (data.access_token) {
            localStorage.setItem("token", data.access_token);
            dispatch(loginSuccess(data)); // Pass the entire response object
            router.push(data.user?.role === "mentor" ? "/mentor" : "/learner");
          } else {
            router.push("/auth/login");
          }
        }
      } else {
        const msg = data?.message || "Registration failed.";
        setMessage(msg);
        toast.error(msg);
      }
    } catch {
      const msg = "Server error. Please try again.";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Desktop: no page scroll; Mobile: allow scroll */}
      <style jsx global>{`
        @media (min-width: 768px) {
          html,
          body {
            overflow: hidden;
          }
          body::-webkit-scrollbar {
            width: 0 !important;
            height: 0 !important;
          }
        }
        @keyframes glowPulse {
          0% { opacity: 0.35; transform: translate(-50%, -50%) scale(0.98); }
          50% { opacity: 0.55; transform: translate(-50%, -50%) scale(1.02); }
          100% { opacity: 0.35; transform: translate(-50%, -50%) scale(0.98); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.35s ease-in-out; }
      `}</style>

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,255,178,0.16), rgba(0,204,142,0.12) 40%, rgba(0,0,0,0) 70%)",
          filter: "blur(26px)",
          animation: "glowPulse 6s ease-in-out infinite",
        }}
      />

      {/* Centered container with small vertical margins so the card border is fully visible */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <div className="my-6 md:my-8 w-full max-w-[760px] rounded-2xl border border-emerald-400/15 bg-[#0B0D0C]/90 shadow-[0_0_60px_rgba(0,255,178,0.07)] backdrop-blur-xl">
          {/* Header */}
          <div className="px-7 pt-6">
            <h1 className="mb-2 text-2xl font-extrabold tracking-tight">Create Account</h1>

            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-300 text-black">
                <User className="h-6 w-6" />
              </div>
              <p className="text-sm text-gray-400">Join thousands of professionals accelerating their careers</p>
            </div>

            <button
              onClick={handleLinkedInLogin}
              disabled={loading}
              className="group mb-5 inline-flex w-full items-center justify-center rounded-xl bg-[#0E6DA0] py-3 font-semibold transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Connecting…
                </span>
              ) : (
                <>
                  <Linkedin className="mr-2 h-5 w-5" /> Continue with LinkedIn
                </>
              )}
            </button>

            {/* Divider */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-xs text-gray-400">Or continue with email</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
          </div>

          {/* CONTENT — no fixed height now (removed h-[66vh]) to eliminate the bottom blank space */}
          <div className="px-7 pb-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row: Name / Email */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-300">Full Name</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-300">Email Address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email address"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
              </div>

              {/* Row: Password / Confirm */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-300">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 py-3 pl-10 pr-10 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-300"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-gray-300">Confirm Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
              </div>

              {/* Row: Role / Experience (if mentor) */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-300">I want to join as</label>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-900/70 py-3 pl-10 pr-8 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    >
                      <option value="user" className="bg-zinc-900">Interviewer (Looking for practice)</option>
                      <option value="mentor" className="bg-zinc-900">Mentor (Providing guidance)</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>

                {form.role === "mentor" && (
                  <div>
                    <label className="mb-1 block text-xs text-gray-300">Professional Experience</label>
                    <div className="relative">
                      <Briefcase className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        name="experience"
                        type="text"
                        placeholder="e.g. 3+ years in full-stack development"
                        value={form.experience}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900/70 py-3 pl-10 pr-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Verification (compact) */}
              <div className="grid gap-3 md:grid-cols-2">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="verification"
                    value="verify-now"
                    checked={verificationChoice === "verify-now"}
                    onChange={(e) => setVerificationChoice(e.target.value as any)}
                    className="peer sr-only"
                  />
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900/70 p-3 transition peer-checked:border-emerald-400/60 peer-checked:bg-emerald-400/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-gray-300 peer-checked:bg-gradient-to-br peer-checked:from-emerald-400 peer-checked:to-emerald-300 peer-checked:text-black">
                        <Mail size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-zinc-100 peer-checked:text-emerald-300">Verify Now</h4>
                          <div className="h-4 w-4 rounded-full border border-zinc-600 peer-checked:border-emerald-300 peer-checked:bg-emerald-300" />
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-gray-400">
                          Send verification email immediately.{" "}
                          <span className="inline-flex items-center gap-1 text-gray-500">
                            <Clock size={12} /> Recommended
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="verification"
                    value="verify-later"
                    checked={verificationChoice === "verify-later"}
                    onChange={(e) => setVerificationChoice(e.target.value as any)}
                    className="peer sr-only"
                  />
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900/70 p-3 transition peer-checked:border-emerald-400/60 peer-checked:bg-emerald-400/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-gray-300 peer-checked:bg-gradient-to-br peer-checked:from-emerald-400 peer-checked:to-emerald-300 peer-checked:text-black">
                        <Settings size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-zinc-100 peer-checked:text-emerald-300">Verify Later</h4>
                          <div className="h-4 w-4 rounded-full border border-zinc-600 peer-checked:border-emerald-300 peer-checked:bg-emerald-300" />
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-gray-400">
                          Skip for now and verify anytime from profile settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Error */}
              {message && (
                <div className="animate-shake rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{message}</span>
                  </div>
                </div>
              )}

              {/* Submit + Login */}
              <div className="grid gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-300 px-6 py-3 font-bold text-black shadow-[0_10px_30px_rgba(0,255,178,0.25)] transition hover:scale-[1.01] hover:shadow-[0_12px_36px_rgba(0,255,178,0.32)] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                      Creating Account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                    </>
                  )}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition group-hover:translate-x-full" />
                </button>

                <p className="pb-1 text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="font-semibold text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
