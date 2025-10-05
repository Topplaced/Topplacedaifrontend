"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
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
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleVerifyEmail = async (otp: string) => {
    setMessage("");
    setIsLoading(true);

    if (!email || !otp) {
      setMessage("Please enter both email and verification code.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: otp,
        }),
      });

      const data = await res.json();

      if (res.ok && data.access_token && data.user) {
        // Store token and dispatch to Redux for persistence
        console.log("🔍 Email verification successful, data received:", data);
        
        // Store token in localStorage
        localStorage.setItem("token", data.access_token);
        dispatch(loginSuccess(data)); // Pass the entire response object

        toast.success("Email verified successfully!");

        // Redirect based on user role
        if (data.user.role === "mentor") {
          router.push("/mentor");
        } else if (data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/learner");
        }
      } else {
        setMessage(data.message || "Invalid verification code.");
        toast.error(data.message || "Invalid verification code.");
      }
    } catch (error) {
      setMessage("Server error. Please try again.");
      toast.error("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsResending(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Verification code sent to your email!");
        setMessage("New verification code sent to your email.");
      } else {
        toast.error(data.message || "Failed to resend code.");
        setMessage(data.message || "Failed to resend code.");
      }
    } catch (error) {
      toast.error("Server error. Please try again.");
      setMessage("Server error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
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
              We&apos;ve sent a 6-digit verification code to
            </p>
            <p className="text-[#00FFB2] font-medium">{email}</p>
          </div>

          <form className="space-y-6">
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
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-300 mb-4"
              >
                Verification Code
              </label>
              <OTPInput
                length={6}
                onComplete={handleVerifyEmail}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
                error={!!message && !message.includes("sent")}
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

            <button
              type="button"
              onClick={() => handleVerifyEmail(otp)}
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] text-black font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <RefreshCw size={20} className="mr-2 animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm mb-3">
              Didn&apos;t receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResending}
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
          <p>Check your spam folder if you don&apos;t see the email</p>
        </div>
      </div>
    </div>
  );
}
