"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Play,
  Trophy,
  History,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const items: NavItem[] = [
  { href: "/learner", label: "Dashboard", icon: Home },
  { href: "/learner/interview/setup", label: "Interview", icon: Play },
  { href: "/learner/scorecard", label: "Scorecard", icon: Trophy },
  { href: "/learner/history", label: "History", icon: History },
  { href: "/learner/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-black/80 backdrop-blur-md border-t border-[#00FFB2]/20 safe-area-bottom"
    >
      <ul className="flex items-stretch justify-between px-2 py-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                className={`group flex flex-col items-center justify-center h-14 bottom-nav-transition rounded-md ${
                  active
                    ? "text-[#00FFB2] bg-[#00FFB2]/10"
                    : "text-gray-300 hover:text-white hover:bg-[#1A1A1A]"
                }`}
              >
                <Icon size={20} className="transition-transform group-active:scale-95" />
                <span className="mt-1 text-[11px] leading-none">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}