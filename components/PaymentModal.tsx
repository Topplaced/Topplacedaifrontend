"use client";

import { useState } from "react";
import { X, CreditCard, Shield, CheckCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: number;
    billingCycle?: "monthly" | "yearly";
    features: string[];
    orderType?: "subscription" | "credits";
    creditPackage?: string;
  };
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  onSuccess,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login to continue");
      }

      // Create order
      const orderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: plan.price,
            currency: "INR",
            orderType: plan.orderType || "subscription",
            creditPackage: plan.creditPackage,
          }),
        }
      );

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Top Placed",
        description:
          plan.orderType === "credits"
            ? `${plan.name}`
            : `${plan.name} Plan - ${plan.billingCycle}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (verifyResponse.ok) {
              onSuccess();
              onClose();
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#00FFB2",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      setError(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-[#00FFB2]/30 rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#00FFB2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} className="text-[#00FFB2]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Complete Your Purchase</h2>
          <p className="text-gray-400">Upgrade to {plan.name} Plan</p>
        </div>

        <div className="bg-[#0A0A0A] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Plan:</span>
            <span className="font-semibold">{plan.name}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Billing:</span>
            <span className="font-semibold capitalize">
              {plan.billingCycle}
            </span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold border-t border-gray-700 pt-2">
            <span>Total:</span>
            <span className="text-[#00FFB2]">₹{plan.price}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <CheckCircle size={16} className="text-[#00FFB2] mr-2" />
            What you&apos;ll get:
          </h3>
          <ul className="space-y-2">
            {plan.features.slice(0, 4).map((feature, index) => (
              <li
                key={index}
                className="text-sm text-gray-300 flex items-center"
              >
                <div className="w-1.5 h-1.5 bg-[#00FFB2] rounded-full mr-3 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-center mb-4">
          <Shield size={16} className="text-[#00FFB2] mr-2" />
          <span className="text-sm text-gray-400">Secured by Razorpay</span>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : `Pay ₹${plan.price}`}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          By proceeding, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
