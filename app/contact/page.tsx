"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Mail, MessageCircle, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-black to-[#020617] text-white">
      <Navbar />

      {/* Background subtle pattern */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.18]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.25),_transparent_55%)]" />
      </div>

      <main className="pt-28 pb-16">
        <div className="container-custom max-w-5xl mx-auto px-4 lg:px-0">
          {/* Header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">
              Contact
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
              Let’s{" "}
              <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                connect
              </span>
            </h1>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
              Share your query, ideas, or requirements. Our team will get back to
              you with a clear response and next steps.
            </p>
          </motion.div>

          {/* Main card */}
          <motion.div
            className="relative glass-card overflow-hidden border border-white/5 rounded-3xl bg-black/40 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.7)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.003 }}
          >
            {/* Animated gradient accents */}
            <div className="pointer-events-none absolute inset-0">
              <motion.div
                className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-sky-500/35 blur-3xl"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -bottom-24 -left-10 h-52 w-52 rounded-full bg-emerald-500/30 blur-3xl"
                animate={{ opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)] p-6 md:p-8 lg:p-10">
              {/* LEFT: Info + status */}
              <motion.div
                className="space-y-7 lg:pr-4 flex flex-col justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold mb-3">
                    Tell us what{" "}
                    <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                      you need
                    </span>
                    .
                  </h2>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    Whether it’s a support query, collaboration, or a new project,
                    drop the details here. We usually respond within{" "}
                    <span className="text-gray-100 font-medium">
                      24 working hours
                    </span>
                    .
                  </p>
                </div>

                <div className="space-y-4 mt-4 md:mt-6">
                  <div className="flex items-center gap-3 text-sm text-gray-200">
                    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Email
                      </p>
                      <p className="font-medium">support@example.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-200">
                    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Phone / WhatsApp
                      </p>
                      <p className="font-medium">+91-98765-XXXX0</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-200">
                    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Response time
                      </p>
                      <p className="font-medium">Typically within 24 hours</p>
                    </div>
                  </div>
                </div>

                {/* Status messages */}
                <div className="mt-3">
                  {status === "success" && (
                    <motion.div
                      className="flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-200"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>Your message has been sent. We’ll get back to you soon.</p>
                    </motion.div>
                  )}

                  {status === "error" && (
                    <motion.div
                      className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-3 text-sm text-red-200"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>Something went wrong. Please try again in a moment.</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* RIGHT: Form */}
              <motion.div
                className="bg-black/60 border border-white/10 rounded-2xl p-4 md:p-5 lg:p-6 shadow-inner"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.22 }}
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wide text-gray-400 mb-1.5">
                        Name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-sky-400/80 focus:ring-2 focus:ring-sky-400/30"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wide text-gray-400 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-sky-400/80 focus:ring-2 focus:ring-sky-400/30"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-gray-400 mb-1.5">
                      Subject
                    </label>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-sky-400/80 focus:ring-2 focus:ring-sky-400/30"
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-gray-400 mb-1.5">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-sky-400/80 focus:ring-2 focus:ring-sky-400/30 resize-none min-h-[130px]"
                      placeholder="Share details about your query or project..."
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="btn-primary w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={status === "loading"}
                    whileHover={{ scale: status === "loading" ? 1 : 1.02 }}
                    whileTap={{ scale: status === "loading" ? 1 : 0.98 }}
                  >
                    {status === "loading" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>Send message</>
                    )}
                  </motion.button>

                  <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
                    By submitting this form, you agree to be contacted back on the
                    email or phone number you’ve shared.
                  </p>
                </form>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
