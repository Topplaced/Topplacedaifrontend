"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-gray-100">
      {/* Background grid / glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="pt-24 pb-16">
        <div className="container-custom max-w-5xl mx-auto px-4 lg:px-0">
          {/* Hero */}
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-3">
              Legal · TopPlaced
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
              Privacy{" "}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
              This Privacy Policy explains how{" "}
              <span className="font-semibold">TopPlaced</span> collects, uses,
              shares, and protects your personal data when you use our
              AI-powered interview and assessment platform.
            </p>
            <p className="mt-3 text-[11px] text-gray-500">
              Last updated: 26 November 2025
            </p>
          </motion.header>

          {/* 3D wrapper for card */}
          <div style={{ perspective: 1400 }}>
            <motion.div
              initial={{ opacity: 0, y: 30, rotateX: 6 }}
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

              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] p-6 md:p-8 lg:p-10">
                {/* Left side: quick summary */}
                <aside className="hidden lg:flex flex-col justify-between border-r border-white/10 pr-8">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-200 mb-3">
                      At a glance
                    </h2>
                    <p className="text-xs text-gray-400">
                      TopPlaced collects data to run AI interviews, generate
                      results, improve the product, and keep your account secure.
                      We do not sell your personal data.
                    </p>

                    <div className="mt-6 space-y-2 text-xs">
                      <p className="text-gray-500 uppercase tracking-[0.18em] mb-1">
                        Sections
                      </p>
                      <ul className="space-y-1 text-gray-300">
                        <li>1. Who We Are</li>
                        <li>2. Data We Collect</li>
                        <li>3. How We Use Data</li>
                        <li>4. AI Processing</li>
                        <li>5. Sharing & Partners</li>
                        <li>6. Cookies & Tracking</li>
                        <li>7. Data Retention</li>
                        <li>8. Security</li>
                        <li>9. Your Rights</li>
                        <li>10. International Transfers</li>
                        <li>11. Children&apos;s Privacy</li>
                        <li>12. Changes</li>
                        <li>13. Contact</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/10 text-[11px] text-gray-500">
                    This policy is a template and should be reviewed by your legal
                    advisor before production use.
                  </div>
                </aside>

                {/* Right side: main privacy content */}
                <main className="space-y-7 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar text-sm md:text-[15px] leading-relaxed">
                  {/* 1 */}
                  <section id="who">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      1. Who We Are
                    </h2>
                    <p className="text-gray-200">
                      TopPlaced is an AI-powered interview and assessment platform
                      designed to help candidates practice, measure, and showcase
                      their skills, and to help companies evaluate talent more
                      efficiently. When we say &quot;we&quot;, &quot;us&quot;, or
                      &quot;our&quot;, we mean the TopPlaced entity operating this
                      platform.
                    </p>
                  </section>

                  {/* 2 */}
                  <section id="data-we-collect">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      2. Data We Collect
                    </h2>
                    <p className="text-gray-300 mb-2">
                      We collect different types of information depending on how
                      you use TopPlaced.
                    </p>

                    <h3 className="text-sm font-semibold text-gray-200 mt-2 mb-1">
                      2.1 Account & Profile Data
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>Name and contact details (e.g., email, phone number).</li>
                      <li>
                        Profile information such as location, experience, skills,
                        education, and links you choose to share.
                      </li>
                      <li>Account settings, preferences, and communication choices.</li>
                    </ul>

                    <h3 className="text-sm font-semibold text-gray-200 mt-3 mb-1">
                      2.2 Interview & Assessment Data
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>
                        Your responses to interview questions (text, audio, video,
                        code, or multiple choice).
                      </li>
                      <li>
                        Scores, feedback, and reports generated by our AI and
                        evaluation systems.
                      </li>
                      <li>
                        Metadata such as timestamps, duration, and completion
                        status of assessments.
                      </li>
                    </ul>

                    <h3 className="text-sm font-semibold text-gray-200 mt-3 mb-1">
                      2.3 Usage & Technical Data
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>
                        Device and browser information (IP address, OS, browser
                        type, approximate location).
                      </li>
                      <li>
                        Log data such as pages viewed, buttons clicked, and
                        time spent on the platform.
                      </li>
                      <li>
                        Error logs and performance data to help us keep the
                        platform stable and secure.
                      </li>
                    </ul>

                    <h3 className="text-sm font-semibold text-gray-200 mt-3 mb-1">
                      2.4 Communications
                    </h3>
                    <p className="text-gray-300">
                      If you contact us (for example via the contact form or
                      support email), we collect the content of your message and
                      any contact details you provide so we can respond.
                    </p>
                  </section>

                  {/* 3 */}
                  <section id="use-data">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      3. How We Use Your Data
                    </h2>
                    <p className="text-gray-300 mb-2">
                      We use the information we collect for the following
                      purposes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>
                        To create and maintain your account and provide core
                        platform features.
                      </li>
                      <li>
                        To run interviews, assessments, and generate scores,
                        feedback, and reports.
                      </li>
                      <li>
                        To personalize your experience, such as recommending
                        practice modules or relevant roles.
                      </li>
                      <li>
                        To communicate with you about updates, security alerts,
                        product changes, and support.
                      </li>
                      <li>
                        To monitor usage, prevent fraud, and ensure the security
                        and integrity of the platform.
                      </li>
                      <li>
                        To analyze and improve the performance, fairness, and
                        reliability of our AI models and features.
                      </li>
                    </ul>
                  </section>

                  {/* 4 */}
                  <section id="ai-processing">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      4. AI Processing & Automated Decisions
                    </h2>
                    <p className="text-gray-300 mb-2">
                      TopPlaced uses AI models to analyze your answers, generate
                      scores, and provide insights. This may involve automated
                      decision-making to produce a score or classification based
                      on your responses.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>
                        We design our systems to be as fair, transparent, and
                        useful as possible, but no model is perfect.
                      </li>
                      <li>
                        In many cases, human reviewers (e.g., hiring managers)
                        may also consider your results alongside other
                        information.
                      </li>
                      <li>
                        Where required by law, you may have rights related to
                        automated decision-making, such as requesting human
                        review or more information about how decisions are made.
                      </li>
                    </ul>
                  </section>

                  {/* 5 */}
                  <section id="sharing">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      5. How We Share Information
                    </h2>
                    <p className="text-gray-300 mb-2">
                      We do not sell your personal data. We may share information
                      in the following limited circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>
                        <span className="font-semibold">With employers</span>{" "}
                        and recruiters you choose to interact or share results
                        with through the platform.
                      </li>
                      <li>
                        <span className="font-semibold">With service providers</span>{" "}
                        who help us operate the platform (e.g., cloud hosting,
                        analytics, communication tools) under appropriate data
                        protection agreements.
                      </li>
                      <li>
                        <span className="font-semibold">
                          For legal and safety reasons
                        </span>
                        , if required by law, court order, or to protect the
                        rights, property, or safety of TopPlaced, our users, or
                        the public.
                      </li>
                      <li>
                        <span className="font-semibold">
                          In aggregated or de-identified form
                        </span>{" "}
                        that does not reasonably identify you, to improve our
                        models, understand trends, or publish insights.
                      </li>
                    </ul>
                  </section>

                  {/* 6 */}
                  <section id="cookies">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      6. Cookies & Tracking Technologies
                    </h2>
                    <p className="text-gray-300">
                      We may use cookies and similar technologies to remember your
                      preferences, keep you signed in, understand how you use the
                      platform, and improve performance. You can manage cookies in
                      your browser settings. Some features may not function
                      correctly if certain cookies are disabled.
                    </p>
                  </section>

                  {/* 7 */}
                  <section id="retention">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      7. Data Retention
                    </h2>
                    <p className="text-gray-300">
                      We keep your personal data only for as long as necessary to:
                      (a) provide the Service, (b) comply with legal obligations,
                      (c) resolve disputes, and (d) enforce our agreements. When
                      data is no longer needed, we will delete it or anonymize it
                      in accordance with our retention policies.
                    </p>
                  </section>

                  {/* 8 */}
                  <section id="security">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      8. Security
                    </h2>
                    <p className="text-gray-300">
                      We use reasonable technical and organizational measures to
                      protect your data against unauthorized access, loss, or
                      misuse. However, no system is completely secure, and we
                      cannot guarantee absolute security of your information. You
                      are responsible for keeping your password and account
                      details confidential.
                    </p>
                  </section>

                  {/* 9 */}
                  <section id="rights">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      9. Your Rights & Choices
                    </h2>
                    <p className="text-gray-300 mb-2">
                      Depending on your location and applicable law, you may have
                      the right to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      <li>Access the personal data we hold about you.</li>
                      <li>Request correction of inaccurate or incomplete data.</li>
                      <li>
                        Request deletion of your data, subject to legal and
                        contractual limitations.
                      </li>
                      <li>
                        Object to certain processing or request restrictions on
                        how we use your data.
                      </li>
                      <li>
                        Request a copy of your data in a portable format where
                        technically feasible.
                      </li>
                    </ul>
                    <p className="text-gray-300 mt-2">
                      You can exercise many of these rights directly in your
                      account settings. For other requests, please contact us
                      using the details below. We may need to verify your identity
                      before acting on your request.
                    </p>
                  </section>

                  {/* 10 */}
                  <section id="international">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      10. International Data Transfers
                    </h2>
                    <p className="text-gray-300">
                      TopPlaced may process and store information in countries
                      other than your own. Where we transfer personal data across
                      borders, we do so in accordance with applicable data
                      protection laws and implement appropriate safeguards.
                    </p>
                  </section>

                  {/* 11 */}
                  <section id="children">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      11. Children&apos;s Privacy
                    </h2>
                    <p className="text-gray-300">
                      TopPlaced is not intended for children under the age of 16
                      (or the minimum age required in your jurisdiction). We do
                      not knowingly collect personal data from children in this
                      age group. If you believe a child has provided us with
                      personal data, please contact us so we can take appropriate
                      action.
                    </p>
                  </section>

                  {/* 12 */}
                  <section id="changes">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      12. Changes to This Policy
                    </h2>
                    <p className="text-gray-300">
                      We may update this Privacy Policy from time to time. When we
                      make material changes, we will update the &quot;Last
                      updated&quot; date above and may provide additional notice.
                      Your continued use of TopPlaced after the changes become
                      effective means you accept the updated Policy.
                    </p>
                  </section>

                  {/* 13 */}
                  <section id="contact">
                    <h2 className="text-lg md:text-xl font-semibold mb-1.5">
                      13. Contact Us
                    </h2>
                    <p className="text-gray-300">
                      If you have questions about this Privacy Policy or how we
                      handle your data, please reach out via the{" "}
                      <span className="underline underline-offset-4">
                        contact form
                      </span>{" "}
                      on our website or email us at{" "}
                      <span className="font-medium">privacy@topplaced.com</span>.
                    </p>
                  </section>

                  <p className="text-[11px] text-gray-500 pt-4 border-t border-white/10">
                    This Privacy Policy is a general template. Laws may vary by
                    country or region; you should consult your legal advisor to
                    adapt this text before using it in production.
                  </p>
                </main>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
