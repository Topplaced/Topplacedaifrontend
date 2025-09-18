"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut, Settings, Trophy } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store"; // Adjust the import path as necessary
import { logout } from "@/store/slices/authSlice";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#00FFB2]/20">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00FFB2] to-[#00CC8E] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">TP</span>
            </div>
            <span className="text-xl font-bold gradient-text">Top placed</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/learner"
              className="text-gray-300 hover:text-[#00FFB2] transition-colors"
            >
              For Learners
            </Link>
            <Link
              href="/mentor"
              className="text-gray-300 hover:text-[#00FFB2] transition-colors"
            >
              For Mentors
            </Link>
            <Link
              href="/pricing"
              className="text-gray-300 hover:text-[#00FFB2] transition-colors"
            >
              Pricing
            </Link>
            {user && (
              <Link
                href="/achievements"
                className="text-gray-300 hover:text-[#00FFB2] transition-colors flex items-center space-x-1"
              >
                <Trophy size={16} />
                <span>Achievements</span>
              </Link>
            )}
          </div>

          {/* User Menu / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
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
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm hover:bg-[#00FFB2]/10"
                    >
                      <Settings size={16} className="mr-3" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => dispatch(logout())}
                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-[#00FFB2]/10 text-red-400"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="btn-primary">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#00FFB2]/20">
            <div className="flex flex-col space-y-4">
              <Link
                href="/learner"
                className="text-gray-300 hover:text-[#00FFB2] transition-colors"
              >
                For Learners
              </Link>
              <Link
                href="/mentor"
                className="text-gray-300 hover:text-[#00FFB2] transition-colors"
              >
                For Mentors
              </Link>
              <Link
                href="/pricing"
                className="text-gray-300 hover:text-[#00FFB2] transition-colors"
              >
                Pricing
              </Link>
              {user && (
                <Link
                  href="/achievements"
                  className="text-gray-300 hover:text-[#00FFB2] transition-colors flex items-center space-x-2"
                >
                  <Trophy size={16} />
                  <span>Achievements</span>
                </Link>
              )}
              <div className="pt-4 border-t border-[#00FFB2]/20">
                {user ? null : (
                  <Link
                    href="/auth/login"
                    className="btn-primary inline-block text-center"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
