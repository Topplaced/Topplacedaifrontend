"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, LogOut, Settings, Trophy } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store"; // Adjust the import path as necessary
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (e) {
      // swallow network errors
    } finally {
      document.cookie = 'token=; Max-Age=0; Path=/; SameSite=Lax';
      dispatch(logout());
      router.replace("/auth/login");
    }
  };

  // Prevent hydration mismatch by rendering user-dependent UI only after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#00FFB2]/20">
      <div className="container-custom">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="TopPlaced"
              width={240}
              height={72}
              quality={100}
              sizes="(max-width: 768px) 140px, 220px"
              className="h-9 md:h-11 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/learner"
              className="text-gray-300 hover:text-[#00FFB2] transition-colors"
            >
              For Learners
            </Link>
            {/* <Link
              href="/mentor"
              className="text-gray-300 hover:text-[#00FFB2] transition-colors"
            >
              For Mentors
            </Link> */}
            <Link
              href="/pricing"
              className="text-gray-300 hover:text-[#00FFB2] transition-colors"
            >
              Pricing
            </Link>
            {/* {mounted && user && (
              <Link
                href="/achievements"
                className="text-gray-300 hover:text-[#00FFB2] transition-colors flex items-center space-x-1"
              >
                <Trophy size={16} />
                <span>Achievements</span>
              </Link>
            )} */}
          </div>

          {/* User Menu / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {mounted && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
                >
                  <div className="w-8 h-8 bg-[#00FFB2] rounded-full flex items-center justify-center">
                    <User size={16} className="text-black" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card py-2 shadow-lg">
                   
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-[#00FFB2]/10 text-red-400"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              mounted && (
                <Link href="/auth/login" className="btn-primary">
                  Sign In
                </Link>
              )
            )}
          </div>

          <div className="md:hidden">
            {mounted && user ? (
              <Link href="/learner/profile" className="p-2 rounded-lg">
                <div className="w-7 h-7 bg-[#00FFB2] rounded-full flex items-center justify-center">
                  <User size={16} className="text-black" />
                </div>
              </Link>
            ) : (
              <Link href="/auth/login" className="btn-primary px-3 py-1 text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>

        
      </div>
    </nav>
  );
}
