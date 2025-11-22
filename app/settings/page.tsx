"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Palette,
  User,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Monitor,
  Check,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function SettingsPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("neon-green");
  const [userType, setUserType] = useState<"learner" | "mentor">("learner");
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    setIsVisible(true);
    const path = window.location.pathname;
    if (path.includes("/mentor")) {
      setUserType("mentor");
    }
  }, []);

  const colorThemes = [
    {
      id: "neon-green",
      name: "Neon Green",
      primary: "#00FFB2",
      secondary: "#00CC8E",
      description: "Default vibrant green theme",
    },
    {
      id: "cyber-purple",
      name: "Cyber Purple",
      primary: "#B800FF",
      secondary: "#9900CC",
      description: "Futuristic purple theme",
    },
    {
      id: "sunset-orange",
      name: "Sunset Orange",
      primary: "#FF6B00",
      secondary: "#CC5500",
      description: "Warm sunset orange theme",
    },
    {
      id: "hot-pink",
      name: "Hot Pink",
      primary: "#FF0080",
      secondary: "#CC0066",
      description: "Bold hot pink theme",
    },
    {
      id: "lime-green",
      name: "Lime Green",
      primary: "#80FF00",
      secondary: "#66CC00",
      description: "Fresh lime green theme",
    },
  ];

  const applyTheme = (theme: (typeof colorThemes)[0]) => {
    const root = document.documentElement;
    root.style.setProperty("--primary-accent", theme.primary);
    root.style.setProperty("--secondary-accent", theme.secondary);

    const style = document.createElement("style");
    style.textContent = `
      :root {
        --primary-accent: ${theme.primary};
        --secondary-accent: ${theme.secondary};
      }
      h1, h2, h3, h4, h5, h6, a {
        color: var(--primary-accent);
      }
      a:hover {
        color: var(--secondary-accent);
      }
      .gradient-text {
        background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .btn-primary {
        background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
        color: #000;
      }
      .btn-primary:hover {
        background: ${theme.secondary};
      }
      .btn-outline {
        border-color: ${theme.primary};
        color: ${theme.primary};
      }
      .btn-outline:hover {
        background-color: ${theme.primary};
        color: #000;
      }
      .glass-card {
        border-color: ${theme.primary}33;
      }
      .text-accent {
        color: ${theme.primary} !important;
      }
      .bg-accent {
        background-color: ${theme.primary} !important;
      }
      .border-accent {
        border-color: ${theme.primary} !important;
      }
      .focus-ring:focus {
        outline: 2px solid ${theme.primary};
      }
      .neon-glow {
        box-shadow: 0 0 20px ${theme.primary}30;
      }
      .neon-glow:hover {
        box-shadow: 0 0 30px ${theme.primary}50;
      }
    `;

    const existingStyle = document.getElementById("dynamic-theme");
    if (existingStyle) existingStyle.remove();
    style.id = "dynamic-theme";
    document.head.appendChild(style);

    setSelectedTheme(theme.id);
    localStorage.setItem("selectedTheme", theme.id);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      const theme = colorThemes.find((t) => t.id === savedTheme);
      if (theme) applyTheme(theme);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Sidebar userType={userType} />
      <div className="ml-64 pt-20 pb-12">
        <div className="container-custom">
          <div
            className={`mb-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex items-center mb-6">
              <Link
                href={userType === "learner" ? "/learner" : "/mentor"}
                className="flex items-center text-[var(--primary-accent)] hover:text-[var(--secondary-accent)]"
              >
                <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Theme ⚙️
            </h1>
            <p className="text-gray-400 text-lg">
              Customize your Top placed AIexperience
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Theme</h3>
                <nav className="space-y-2">
                  <a
                    href="#appearance"
                    className="flex items-center p-2 rounded-lg bg-accent/20 text-[var(--primary-accent)]"
                  >
                    <Palette size={16} className="mr-3" /> Appearance
                  </a>
                  {/* <a
                    href="#profile"
                    className="flex items-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
                  >
                    <User size={16} className="mr-3" /> Profile
                  </a> */}
                  {/* <a
                    href="#notifications"
                    className="flex items-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
                  >
                    <Bell size={16} className="mr-3" /> Notifications
                  </a>
                  <a
                    href="#privacy"
                    className="flex items-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
                  >
                    <Shield size={16} className="mr-3" /> Privacy
                  </a>
                  <a
                    href="#language"
                    className="flex items-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
                  >
                    <Globe size={16} className="mr-3" /> Language
                  </a> */}
                </nav>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
              <section id="appearance" className="glass-card p-8">
                <div className="flex items-center mb-6">
                  <Palette
                    size={24}
                    className="text-[var(--primary-accent)] mr-3"
                  />
                  <h2 className="text-2xl font-semibold">Appearance</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colorThemes.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => applyTheme(theme)}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedTheme === theme.id
                          ? "border-[var(--primary-accent)] bg-[var(--primary-accent)]/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      {selectedTheme === theme.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--primary-accent)] rounded-full flex items-center justify-center">
                          <Check size={14} className="text-black" />
                        </div>
                      )}
                      <div className="flex items-center mb-3">
                        <div
                          className="w-8 h-8 rounded-full mr-3"
                          style={{ backgroundColor: theme.primary }}
                        ></div>
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: theme.secondary }}
                        ></div>
                      </div>
                      <h4 className="font-semibold mb-1">{theme.name}</h4>
                      <p className="text-sm text-gray-400">
                        {theme.description}
                      </p>
                      <div className="mt-3 p-2 bg-[#1A1A1A] rounded">
                        <div
                          className="text-xs font-medium"
                          style={{ color: theme.primary }}
                        >
                          Preview Text
                        </div>
                        <div
                          className="w-full h-1 rounded mt-1"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              {/* <section id="profile" className="glass-card p-8">
                <div className="flex items-center mb-6">
                  <User size={24} className="text-[var(--primary-accent)] mr-3" />
                  <h2 className="text-2xl font-semibold">Profile Settings</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Name</label>
                    <input type="text" defaultValue={user?.name || (userType === 'learner' ? 'Learner' : 'Mentor')}
                      className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input type="email" defaultValue={user?.email || (userType === 'learner' ? 'learner@example.com' : 'mentor@example.com')}
                      className="w-full bg-[#1A1A1A] border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]" />
                  </div>
                  <button className="btn-primary px-6 py-2 rounded">Save Changes</button>
                </div>
              </section> */}
              <section id="notifications" className="glass-card p-8">
                <div className="flex items-center mb-6">
                  <Bell
                    size={24}
                    className="text-[var(--primary-accent)] mr-3"
                  />
                  <h2 className="text-2xl font-semibold">Notifications</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-400">
                        Receive updates via email
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-[var(--primary-accent)] rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                    <div>
                      <div className="font-medium">Push Notifications</div>
                      <div className="text-sm text-gray-400">
                        Browser notifications
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-gray-600 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
