'use client';

import { useState, useEffect } from 'react';
import { Crown, Calendar, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

interface UserPlan {
  planType: string | null;
  planStartDate: string | null;
  planEndDate: string | null;
  hasPaidPlan: boolean;
  interviewCredits?: number;
  freeInterviewsUsed?: number;
}

export default function UserPlanStatus() {
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPlan();
  }, []);

  const fetchUserPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/plan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserPlan(data);
      } else {
        setError('Failed to fetch plan information');
      }
    } catch (error) {
      setError('Error fetching plan information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  if (error || !userPlan) {
    return (
      <div className="glass-card p-4 border-red-500/30">
        <div className="flex items-center text-red-400">
          <AlertCircle size={16} className="mr-2" />
          <span className="text-sm">{error || 'Plan information unavailable'}</span>
        </div>
      </div>
    );
  }

  const isActive = userPlan.hasPaidPlan && userPlan.planEndDate && new Date(userPlan.planEndDate) > new Date();
  const daysRemaining = userPlan.planEndDate 
    ? Math.ceil((new Date(userPlan.planEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className={`glass-card p-4 ${
      isActive ? 'border-[#00FFB2]/30' : 'border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Crown size={16} className={`mr-2 ${
            isActive ? 'text-[#00FFB2]' : 'text-gray-400'
          }`} />
          <span className="font-semibold">
            {userPlan.planType || 'Free Plan'}
          </span>
        </div>
        {isActive && (
          <CheckCircle size={16} className="text-[#00FFB2]" />
        )}
      </div>
      
      {isActive ? (
        <div className="text-sm text-gray-300">
          <div className="flex items-center mb-1">
            <Calendar size={12} className="mr-1" />
            <span>{daysRemaining} days remaining</span>
          </div>
          <div className="text-xs text-gray-400">
            Expires: {new Date(userPlan.planEndDate!).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400">
          {userPlan.hasPaidPlan ? 'Plan expired' : 'No active subscription'}
        </div>
      )}
      
      {/* Interview Credits Display */}
      {(userPlan.interviewCredits !== undefined && userPlan.interviewCredits > 0) && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard size={14} className="text-[#00FFB2] mr-2" />
              <span className="text-sm font-medium">Interview Credits</span>
            </div>
            <span className="text-sm font-bold text-[#00FFB2]">
              {userPlan.interviewCredits}
            </span>
          </div>
        </div>
      )}
      
      {/* Free Interviews for Starter Plan */}
      {!userPlan.hasPaidPlan && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Free interviews used</span>
            <span className="text-sm">
              {userPlan.freeInterviewsUsed || 0}/2
            </span>
          </div>
        </div>
      )}
    </div>
  );
}