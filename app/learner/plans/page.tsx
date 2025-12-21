"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { CreditCard, CheckCircle, Clock, Layers } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type PurchasedPlan = {
  duration: number;
  price: number;
  purchasedAt: string | Date;
  remaining: number;
  status: "active" | "used" | "expired";
  orderId?: string;
};

type GroupedPlan = {
  key: string;
  duration: number;
  price: number;

  totalPurchases: number; // total purchases for this plan
  availableInterviews: number; // sum of remaining across purchases
  usedPurchases: number; // number of purchases fully used

  lastPurchasedAt: string | Date;
  orderIds: string[];
};

export default function MyPlansPage() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [plans, setPlans] = useState<PurchasedPlan[]>([]);
  const [summary, setSummary] = useState<{
    interviewCredits: number;
    freeInterviewsUsed: number;
    freeInterviewsLimit: number;
    hasPaidPlan: boolean;
    planType: string | null;
    planStartDate: string | null;
    planEndDate: string | null;
  }>({
    interviewCredits: 0,
    freeInterviewsUsed: 0,
    freeInterviewsLimit: 2,
    hasPaidPlan: false,
    planType: null,
    planStartDate: null,
    planEndDate: null,
  });

  useEffect(() => {
    const loadPlans = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/payments/plan`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setPlans((data.purchasedPlans || []) as PurchasedPlan[]);
        setSummary({
          interviewCredits: data.interviewCredits || 0,
          freeInterviewsUsed: data.freeInterviewsUsed || 0,
          freeInterviewsLimit: data.freeInterviewsLimit ?? 2,
          hasPaidPlan: data.hasPaidPlan || false,
          planType: data.planType || null,
          planStartDate: data.planStartDate || null,
          planEndDate: data.planEndDate || null,
        });
      } catch (e) {
        // optionally show toast
      }
    };

    loadPlans();
  }, [token]);

  // ✅ GROUP SAME PLANS (duration + price) into one card
  const groupedPlans = useMemo<GroupedPlan[]>(() => {
    const map = new Map<string, GroupedPlan>();

    for (const p of plans) {
      const key = `${p.duration}-${p.price}`;

      const existing = map.get(key) || {
        key,
        duration: p.duration,
        price: p.price,
        totalPurchases: 0,
        availableInterviews: 0,
        usedPurchases: 0,
        lastPurchasedAt: p.purchasedAt,
        orderIds: [],
      };

      existing.totalPurchases += 1;

      const rem = typeof p.remaining === "number" ? p.remaining : 0;
      existing.availableInterviews += rem;

      // used = remaining 0 (and not expired)
      if (p.status !== "expired" && (rem === 0 || p.status === "used")) {
        existing.usedPurchases += 1;
      }

      // track last purchasedAt
      const curr = new Date(p.purchasedAt);
      const prev = new Date(existing.lastPurchasedAt);
      if (curr > prev) existing.lastPurchasedAt = p.purchasedAt;

      if (p.orderId) existing.orderIds.push(p.orderId);

      map.set(key, existing);
    }

    return Array.from(map.values()).sort((a, b) => {
      return (
        new Date(b.lastPurchasedAt).getTime() -
        new Date(a.lastPurchasedAt).getTime()
      );
    });
  }, [plans]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />

        <div className="md:ml-64 ml-0 pt-16 md:pt-20 pb-24 md:pb-12">
          <div className="container-custom space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#00FFB2]/15 flex items-center justify-center">
                <CreditCard size={20} className="text-[#00FFB2]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">My Plans</h1>
                <p className="text-gray-400 text-sm">
                  View purchased interview plans and usage.
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#050505] p-4 rounded-lg border border-gray-700">
                <div className="text-[#00FFB2] text-2xl font-bold mb-1">
                  {summary.interviewCredits}
                </div>
                <div className="text-xs text-gray-400">Interview Credits</div>
              </div>

              <div className="bg-[#050505] p-4 rounded-lg border border-gray-700">
                <div className="text-[#00FFB2] text-2xl font-bold mb-1">
                  {summary.freeInterviewsUsed}/{summary.freeInterviewsLimit}
                </div>
                <div className="text-xs text-gray-400">
                  Free Interviews Used
                </div>
              </div>

              <div className="bg-[#050505] p-4 rounded-lg border border-gray-700">
                <div className="text-[#00FFB2] text-2xl font-bold mb-1">
                  {summary.hasPaidPlan ? "Active" : "None"}
                </div>
                <div className="text-xs text-gray-400">Subscription</div>
              </div>

              <div className="bg-[#050505] p-4 rounded-lg border border-gray-700">
                <div className="text-[#00FFB2] text-2xl font-bold mb-1">
                  {summary.planType || "—"}
                </div>
                <div className="text-xs text-gray-400">Plan Type</div>
              </div>
            </div>

            {/* Purchased Plans */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="text-[#00FFB2]" size={18} />
                <h2 className="text-xl font-semibold">Purchased Plans</h2>
              </div>

              {groupedPlans.length === 0 ? (
                <div className="text-gray-400 text-sm">
                  No plans purchased yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedPlans.map((g) => (
                    <div
                      key={g.key}
                      className="bg-[#050505] rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-white font-medium">
                            {g.duration} minutes
                          </div>
                          <div className="text-gray-400 text-xs">
                            ₹{g.price} • Last purchased on{" "}
                            {new Date(g.lastPurchasedAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Status pill */}
                        <div>
                          {g.availableInterviews > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-[#00FFB2]/20 text-[#00FFB2] px-2 py-1 rounded-full">
                              <CheckCircle size={14} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                              <Clock size={14} />
                              Used
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Counts Row (2 cards only) */}
                      {/* Counts Row (2 cards only) */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-md border border-gray-800 bg-black/30 p-3">
                          <div className="text-[#00FFB2] text-lg font-bold leading-none">
                            {g.availableInterviews}/{g.totalPurchases}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-1">
                            Available / Total
                          </div>
                        </div>

                        <div className="rounded-md border border-gray-800 bg-black/30 p-3">
                          <div className="text-yellow-400 text-lg font-bold leading-none">
                            {g.usedPurchases}/{g.totalPurchases}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-1">
                            Used / Total
                          </div>
                        </div>
                      </div>

                      {/* Optional: show order ids */}
                      {g.orderIds.length > 0 && (
                        <div className="mt-3 text-xs text-gray-500">
                          Orders:{" "}
                          <span className="text-gray-400">
                            {g.orderIds.slice(0, 2).join(", ")}
                            {g.orderIds.length > 2
                              ? ` +${g.orderIds.length - 2} more`
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
