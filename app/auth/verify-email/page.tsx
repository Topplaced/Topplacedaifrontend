"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import OTPInput from "@/components/OTPInput";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5-minute resend cooldown

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [searchParams]);

  // ✅ Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // ✅ Handle verification logic
  const handleVerifyEmail = async (otp?: string) => {
    const code = otp || verificationCode.trim();

    if (!email || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok && data.access_token && data.user) {
        localStorage.setItem("token", data.access_token);
        dispatch(loginSuccess(data));
        toast.success("Email verified successfully!");

        // Redirect by role
        if (data.user.role === "mentor") router.push("/mentor");
        else if (data.user.role === "admin") router.push("/admin");
        else router.push("/learner");
      } else {
        setMessage(data.message || "Invalid verification code.");
        toast.error(data.message || "Invalid verification code.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again.");
      setMessage("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Resend logic with cooldown reset
  const handleResendCode = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setIsResending(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("New code sent to your email!");
        setMessage("New verification code sent to your email.");
        setTimeLeft(300); // restart cooldown
      } else {
        toast.error(data.message || "Failed to resend code.");
        setMessage(data.message || "Failed to resend code.");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
      setMessage("Server error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Glow background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00FFB2]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00CC8E]/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <Link
        href="/auth/login"
        className="absolute top-6 left-6 flex items-center text-gray-400 hover:text-[#00FFB2] transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Login
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8 neon-glow">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="text-black" size={24} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-gray-400 text-sm">
              We’ve sent a 6-digit verification code to
            </p>
            <p className="text-[#00FFB2] font-medium">{email}</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Verification Code
              </label>
              <OTPInput
                length={6}
                value={verificationCode}
                onChange={setVerificationCode}
                onComplete={handleVerifyEmail}
                disabled={isLoading}
                error={!!message && !message.includes("sent")}
                autoFocus // ✅ first input auto-focused
              />
            </div>

            {message && (
              <p
                className={`text-sm text-center mt-4 ${
                  message.includes("sent") ? "text-green-400" : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}
          </form>

          {/* Verify button */}
          <button
            onClick={() => handleVerifyEmail()}
            disabled={isLoading || verificationCode.length !== 6}
            className="mt-6 w-full py-3 rounded-lg bg-[#00FFB2] text-black font-semibold hover:bg-[#00e39e] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </button>

          {/* Resend section */}
          <div className="text-center mt-6">
            {timeLeft > 0 ? (
              <p className="text-gray-400 text-sm mb-3">
                Resend available in{" "}
                <span className="text-[#00FFB2]">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-gray-400 text-sm mb-3">
                Didn’t receive the code?
              </p>
            )}
            <button
              onClick={handleResendCode}
              disabled={isResending || timeLeft > 0}
              className="text-[#00FFB2] hover:underline font-medium flex items-center justify-center mx-auto disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Code"
              )}
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Check your spam folder if you don’t see the email.</p>
        </div>
      </div>
    </div>
  );
}
