"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { 
  Settings, 
  Mail, 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Save,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface EmailSettings {
  requireEmailVerification: boolean;
  allowUnverifiedLogin: boolean;
  verificationCodeExpiry: number; // in minutes
  maxResendAttempts: number;
  smtpEnabled: boolean;
}

interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  pendingVerifications: number;
}

export default function AdminPermissionsPage() {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    requireEmailVerification: true,
    allowUnverifiedLogin: false,
    verificationCodeExpiry: 15,
    maxResendAttempts: 3,
    smtpEnabled: false,
  });
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    pendingVerifications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchSettings();
    fetchUserStats();
  }, [user, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/email-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setEmailSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/user-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);

    try {
      const res = await fetch(`${API_URL}/admin/email-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailSettings),
      });

      if (res.ok) {
        toast.success("Settings saved successfully!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Server error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshStats = () => {
    setIsLoading(true);
    fetchUserStats();
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00FFB2]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00CC8E]/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/admin"
              className="flex items-center text-gray-400 hover:text-[#00FFB2] transition-colors mr-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Admin
            </Link>
            <div className="flex items-center">
              <Shield className="text-[#00FFB2] mr-3" size={28} />
              <h1 className="text-3xl font-bold">Email Verification Settings</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Statistics */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 neon-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Users className="mr-2 text-[#00FFB2]" size={20} />
                  User Statistics
                </h2>
                <button
                  onClick={handleRefreshStats}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-[#00FFB2] transition-colors"
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded-lg">
                  <span className="text-gray-300">Total Users</span>
                  <span className="font-semibold text-white">{userStats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded-lg">
                  <span className="text-gray-300 flex items-center">
                    <CheckCircle size={16} className="mr-2 text-green-400" />
                    Verified
                  </span>
                  <span className="font-semibold text-green-400">{userStats.verifiedUsers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded-lg">
                  <span className="text-gray-300 flex items-center">
                    <XCircle size={16} className="mr-2 text-red-400" />
                    Unverified
                  </span>
                  <span className="font-semibold text-red-400">{userStats.unverifiedUsers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded-lg">
                  <span className="text-gray-300 flex items-center">
                    <Mail size={16} className="mr-2 text-yellow-400" />
                    Pending
                  </span>
                  <span className="font-semibold text-yellow-400">{userStats.pendingVerifications}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 neon-glow">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Settings className="mr-2 text-[#00FFB2]" size={20} />
                Email Verification Configuration
              </h2>

              <div className="space-y-6">
                {/* Require Email Verification */}
                <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Require Email Verification</h3>
                    <p className="text-sm text-gray-400">
                      Force users to verify their email before accessing the platform
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.requireEmailVerification}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          requireEmailVerification: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FFB2]"></div>
                  </label>
                </div>

                {/* Allow Unverified Login */}
                <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Allow Unverified Login</h3>
                    <p className="text-sm text-gray-400">
                      Allow users to login even if email is not verified (with limited access)
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.allowUnverifiedLogin}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          allowUnverifiedLogin: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FFB2]"></div>
                  </label>
                </div>

                {/* Verification Code Expiry */}
                <div className="p-4 bg-[#1A1A1A] rounded-lg">
                  <h3 className="font-medium text-white mb-2">Verification Code Expiry</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    How long verification codes remain valid (in minutes)
                  </p>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={emailSettings.verificationCodeExpiry}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        verificationCodeExpiry: parseInt(e.target.value) || 15,
                      })
                    }
                    className="w-full bg-[#2A2A2A] border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                  />
                </div>

                {/* Max Resend Attempts */}
                <div className="p-4 bg-[#1A1A1A] rounded-lg">
                  <h3 className="font-medium text-white mb-2">Max Resend Attempts</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Maximum number of times a user can resend verification code per hour
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={emailSettings.maxResendAttempts}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        maxResendAttempts: parseInt(e.target.value) || 3,
                      })
                    }
                    className="w-full bg-[#2A2A2A] border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFB2] focus:border-transparent"
                  />
                </div>

                {/* SMTP Status */}
                <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">SMTP Service Status</h3>
                    <p className="text-sm text-gray-400">
                      Current status of email sending service
                    </p>
                  </div>
                  <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                    emailSettings.smtpEnabled 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {emailSettings.smtpEnabled ? (
                      <>
                        <CheckCircle size={14} className="mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle size={14} className="mr-1" />
                        Inactive
                      </>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="btn-primary px-6 py-2 flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}