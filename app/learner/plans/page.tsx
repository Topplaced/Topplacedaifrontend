"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { CreditCard, CheckCircle, AlertCircle, Clock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type PurchasedPlan = {
  duration: number;
  price: number;
  purchasedAt: string | Date;
  remaining: number;
  status: "active" | "used" | "expired";
  orderId?: string;
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
      const res = await fetch(`${API_URL}/payments/plan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
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
      }
    };
    loadPlans();
  }, [token]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />
        <div className="md:ml-64 ml-0 pt-16 md:pt-20 pb-24 md:pb-12">
          <div className="container-custom space-y-8">
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
                <div className="text-xs text-gray-400">Free Interviews Used</div>
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

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Purchased Plans</h2>
              {plans.length === 0 ? (
                <div className="text-gray-400 text-sm">No plans purchased yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((p, idx) => (
                    <div
                      key={`${p.orderId || idx}-${p.purchasedAt}`}
                      className="bg-[#050505] rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">
                            {p.duration} minutes
                          </div>
                          <div className="text-gray-400 text-xs">
                            ₹{p.price} • Purchased on {new Date(p.purchasedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          {p.status === "active" ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-[#00FFB2]/20 text-[#00FFB2] px-2 py-1 rounded-full">
                              <CheckCircle size={14} />
                              Active
                            </span>
                          ) : p.status === "used" ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                              <Clock size={14} />
                              Used
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                              <AlertCircle size={14} />
                              Expired
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-300">
                        Remaining interviews: <span className="text-white font-semibold">{p.remaining}</span>
                      </div>
                      {p.orderId && (
                        <div className="mt-1 text-xs text-gray-500">Order: {p.orderId}</div>
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
