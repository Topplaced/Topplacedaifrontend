"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, KeyRound, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resetPassword } from "@/utils/api-helpers";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const qEmail = searchParams.get("email");
    if (qEmail) setEmail(qEmail);
  }, [searchParams]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");
    if (password !== confirm) {
      toast.error("Passwords do not match");
      setMessage("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const data = await resetPassword(email, code, password);
      if (data.access_token && data.user) {
        localStorage.setItem("token", data.access_token);
        document.cookie = `token=${data.access_token}; Max-Age=86400; Path=/; SameSite=Lax`;
        dispatch(loginSuccess(data));
        toast.success("Password reset successful");
        if (data.user.role === "mentor") {
          router.push("/mentor");
        } else if (data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/learner");
        }
      } else {
        toast.success(data.message || "Password reset successful");
        router.push("/auth/login");
      }
    } catch (error) {
      toast.error("Failed to reset password");
      setMessage("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00FFB2]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00CC8E]/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <Link href="/" className="absolute top-6 left-6 flex items-center text-gray-400 hover:text-[#00FFB2] transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8 neon-glow">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-black font-bold text-xl">TP</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
            <p className="text-gray-400">Enter the reset code and your new password</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">Reset Code</label>
              <div className="relative">
                <KeyRound size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                  placeholder="Enter the 6-digit code"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                placeholder="Re-enter new password"
                required
              />
            </div>

            <button type="submit" className="w-full btn-primary py-3 font-semibold" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            {message && <p className="text-sm text-center mt-2 text-gray-300">{message}</p>}
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-400">
              Didn&apos;t get a code? {""}
              <Link href="/auth/forgot-password" className="text-[#00FFB2] hover:underline font-medium">Resend</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}