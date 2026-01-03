"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { useAuthPersistence } from "@/hooks/useAuthPersistence";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Helper to check token expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return true;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false; // No expiration set

    return Date.now() >= exp * 1000;
  } catch (e) {
    return true; // Invalid token
  }
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isHydrated } = useAuthPersistence();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect if hydration is complete
    if (isHydrated) {
      if (!auth.token || !auth.user) {
        router.replace("/auth/login");
      } else if (isTokenExpired(auth.token)) {
        // Token is present but expired
        console.log("⚠️ Token expired, logging out...");
        dispatch(logout());
        router.replace("/auth/login");
      }
    }
  }, [auth, router, isHydrated, dispatch]);

  const Loader = (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  );

  // Always render a stable wrapper to avoid hydration mismatches
  return (
    <div suppressHydrationWarning>
      {!mounted || !isHydrated
        ? Loader
        : auth.token && auth.user
        ? children
        : Loader}
    </div>
  );
}
