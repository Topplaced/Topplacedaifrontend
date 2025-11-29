"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Sparkles, Headphones, Code2, BarChart3, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-gray-100">
      <Navbar />

      {/* background grid / glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <main className="pt-24 pb-16">
        <div className="container-custom max-w-5xl mx-auto px-4 lg:px-0">
          {/* Hero */}
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-3">
              About · TopPlaced
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
              Built to make{" "}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                interview prep
              </span>{" "}
              actually useful.
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-3xl mx-auto">
              TopPlaced is an AI-first interview and assessment platform. We help
              learners practice with realistic interviews, get measurable feedback,
              and show companies what they can actually do—beyond just a résumé.
            </p>
          </motion.header>

          {/* 3D main card wrapper */}
          <div style={{ perspective: 1400 }}>
            <motion.section
              initial={{ opacity: 0, y: 28, rotateX: 6 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              whileHover={{
                rotateX: -4,
                rotateY: 4,
                translateY: -6,
              }}
              className="relative rounded-3xl border border-white/8 bg-black/60 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.85)] overflow-hidden"
            >
              {/* floating lights */}
              <motion.div
                className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="pointer-events-none absolute -bottom-40 -left-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl"
                animate={{ opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative p-6 md:p-8 lg:p-10 space-y-10">
                {/* Top text row */}
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
                  <div className="space-y-4 text-sm md:text-[15px] leading-relaxed">
                    <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-sky-400" />
                      Our mission
                    </h2>
                    <p className="text-gray-200">
                      We started TopPlaced with a simple idea:{" "}
                      <span className="font-medium">
                        interviews should measure skill, not just confidence.
                      </span>{" "}
                      Traditional prep focuses on memorizing answers. We focus on
                      helping you practice real scenarios with instant, structured
                      feedback—so you actually get better.
                    </p>
                    <p className="text-gray-300">
                      Whether you&apos;re preparing for your first job, switching
                      roles, or aiming for top companies, TopPlaced gives you an
                      always-available AI interviewer that never gets tired and
                      always has one more question ready.
                    </p>
                  </div>

                  {/* side “stats / trust” card */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner text-sm">
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-3">
                      What TopPlaced focuses on
                    </p>
                    <ul className="space-y-2 text-gray-200">
                      <li>• Realistic interview flows (behavioral & technical)</li>
                      <li>• Clear scorecards instead of vague &quot;you did okay&quot;</li>
                      <li>• Actionable tips on how to improve next attempt</li>
                      <li>• Signal that you can share with recruiters and companies</li>
                    </ul>
                  </div>
                </div>

                {/* Feature grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Offer */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="glass-card border border-white/10 bg-white/5 p-5 rounded-2xl"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-8 w-8 rounded-full bg-sky-500/20 flex items-center justify-center">
                        <Headphones className="h-4 w-4 text-sky-300" />
                      </span>
                      <h3 className="text-lg font-semibold">What we offer</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Voice-based interviews, coding prompts, case-style questions,
                      and role-specific scenarios—run by AI and tailored to your
                      level.
                    </p>
                  </motion.div>

                  {/* Why it works */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="glass-card border border-white/10 bg-white/5 p-5 rounded-2xl"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-emerald-300" />
                      </span>
                      <h3 className="text-lg font-semibold">Why it works</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Adaptive question difficulty, structured rubrics, and
                      targeted feedback so each session teaches you something
                      specific to fix—not just a score.
                    </p>
                  </motion.div>

                  {/* For engineers / roles */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="glass-card border border-white/10 bg-white/5 p-5 rounded-2xl"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Code2 className="h-4 w-4 text-cyan-300" />
                      </span>
                      <h3 className="text-lg font-semibold">Who it&apos;s for</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Developers, product folks, fresh graduates, and professionals
                      switching careers—anyone who wants structured practice and
                      proof of progress.
                    </p>
                  </motion.div>
                </div>

                {/* Values row */}
                <div className="grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-6 items-start">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3 text-sm">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      <ShieldCheck className="h-5 w-5 text-emerald-300" />
                      Our principles
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>Be honest about how AI evaluates and scores.</li>
                      <li>Focus on learning, not just &quot;passing&quot; a test.</li>
                      <li>Respect candidate privacy and data ownership.</li>
                      <li>Continuously improve fairness and clarity of feedback.</li>
                    </ul>
                  </div>

                  <div className="space-y-3 text-sm">
                    <h3 className="text-base font-semibold">Get started</h3>
                    <p className="text-gray-300">
                      Create an account, choose a role you&apos;re targeting, and
                      start your first AI interview in minutes. You&apos;ll get a
                      clear scorecard and improvement plan after every session.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-2">
                      <Link href="/contact" className="btn-primary text-sm">
                        Talk to us
                      </Link>
                      <Link href="/privacy" className="btn-outline text-sm">
                        Privacy &amp; data
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}
