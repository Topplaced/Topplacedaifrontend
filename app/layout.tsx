import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Top placed AI | AI-Powered Career Development Platform",
  description:
    "Master your career with AI-powered mock interviews, personalized feedback, and expert mentorship. Connect with top mentors and accelerate your professional growth.",
  keywords:
    "AI interviews, career development, mentorship, skill assessment, professional growth",
  authors: [{ name: "Top placed  Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <div className="min-h-screen">
          <Toaster richColors position="top-center" />
          <ReduxProvider>{children}</ReduxProvider>
        </div>
      </body>
    </html>
  );
}
