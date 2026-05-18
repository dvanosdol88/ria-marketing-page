"use client";

import React, { useState } from "react";
import { BarChart3, Sailboat, CheckCircle2 } from "lucide-react";

export default function MailerAuditPage() {
  const [activeTab, setActiveTab] = useState("transparency");

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 font-sans text-neutral-800">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-neutral-200">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-brand m-0">
            Mailer Audit: Visual Roadmap
          </h1>
          <p className="text-lg text-neutral-500 font-light mt-3">
            Smarter Way Wealth
          </p>
        </div>

        <div className="flex flex-wrap justify-center border-b-2 border-brand/20 mb-8">
          {["transparency", "lifestyle", "trust", "vetting"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer px-6 py-4 font-semibold transition-all duration-200 border-b-4 uppercase tracking-wider text-sm ${
                activeTab === tab
                  ? "text-brand border-brand"
                  : "text-neutral-500 border-transparent hover:text-brand hover:bg-brand/5"
              }`}
            >
              {tab === "vetting" ? "Vetting Checklist" : tab}
            </button>
          ))}
        </div>

        <div className="mt-6 animate-fadeIn">
          {activeTab === "transparency" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-neutral-50 p-8 rounded-xl border border-brand/10 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand rounded-l"></div>
                <h2 className="text-2xl font-bold text-brand mb-3">
                  Front Concept
                </h2>
                <p className="text-base text-neutral-700 leading-relaxed m-0">
                  Dominant layout focused on the{" "}
                  <strong>quantitative savings chart</strong>, supported by a
                  headshot of you to build recognition and trust.
                </p>
                <div className="w-full h-40 bg-neutral-200 rounded-lg my-6 relative flex items-center justify-center overflow-hidden">
                  <BarChart3 className="w-24 h-24 text-neutral-300 absolute" />
                  <div className="relative z-10 text-center text-neutral-700 font-bold drop-shadow-sm bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm">
                    Visualizing potential
                    <br />
                    $[Specific Dollar Amount]
                    <br />
                    savings
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mt-2 italic">
                  Chart (described in brief) with wirehouse fees in grey vs. RIA
                  startup fees in signature green <code className="bg-neutral-200 px-1 py-0.5 rounded">#007143</code>.
                </p>
              </div>
              <div className="bg-neutral-50 p-8 rounded-xl border border-brand/10 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand rounded-l"></div>
                <h2 className="text-2xl font-bold text-brand mb-3">
                  Back Concept
                </h2>
                <p className="text-base text-neutral-700 leading-relaxed m-0">
                  Deep-green back featuring your identity block, fee
                  comparisons, and Digital Pillars. Designed to make
                  transparency the "proof."
                </p>
                <div className="mt-6 p-5 bg-white rounded-lg shadow-sm border border-neutral-100">
                  <span className="font-bold text-brand block text-lg">
                    David J. Van Osdol, CFA, CFP
                  </span>
                  <p className="text-base text-neutral-700 mt-1 mb-0">
                    Smarter Way Wealth
                  </p>
                  <p className="text-sm text-neutral-500 mt-3 italic border-t border-neutral-100 pt-3">
                    [Contact Info] | [QR Code Placeholder]
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "lifestyle" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-neutral-50 p-8 rounded-xl border border-brand/10 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand rounded-l"></div>
                <h2 className="text-2xl font-bold text-brand mb-3">
                  Front Concept
                </h2>
                <p className="text-base text-neutral-700 leading-relaxed m-0">
                  Outcome-focused mailer. Minimalist, modern style, possibly a
                  flat illustration mixed with clear typography.
                </p>
                <div className="w-full h-40 bg-neutral-200 rounded-lg my-6 relative flex items-center justify-center overflow-hidden">
                  <Sailboat className="w-24 h-24 text-neutral-300 absolute" />
                  <div className="relative z-10 text-center text-neutral-700 font-bold drop-shadow-sm bg-white/80 px-4 py-2 rounded-lg backdrop-blur-sm">
                    Aspirational visual
                    <br />
                    (e.g., couple on boat)
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mt-2 italic">
                  Pair signature green <code className="bg-neutral-200 px-1 py-0.5 rounded">#007143</code> with a
                  bright, clean secondary color (like white or sand) to feel
                  professional yet stylish.
                </p>
              </div>
              <div className="bg-neutral-50 p-8 rounded-xl border border-brand/10 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand rounded-l"></div>
                <h2 className="text-2xl font-bold text-brand mb-3">
                  Back Concept
                </h2>
                <p className="text-base text-neutral-700 leading-relaxed m-0">
                  A solid signature green (<code className="bg-neutral-200 px-1 py-0.5 rounded">#007143</code>) back,
                  emphasizing the RIA advantage, lower overhead, and your direct
                  contact.
                </p>
                <div className="mt-6 p-5 bg-white rounded-lg shadow-sm border border-neutral-100">
                  <span className="font-bold text-brand block text-lg">
                    Got the 1% Blues?
                  </span>
                  <p className="text-base text-neutral-700 mt-2 mb-0">
                    We pass the savings on to you.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "trust" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-neutral-50 p-8 rounded-xl border border-brand/10 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand rounded-l"></div>
                <h2 className="text-2xl font-bold text-brand mb-3">
                  Front Concept
                </h2>
                <p className="text-base text-neutral-700 leading-relaxed m-0">
                  Authoritative design focused on your fiduciary commitment,
                  using bold, typography-heavy elements and textured dark green
                  spectrum.
                </p>
                <p className="text-sm text-neutral-500 mt-6 italic bg-white p-4 rounded-lg border border-neutral-100">
                  Pair with clear, side-by-side comparison graphics
                  (firm-centric vs. client-centric icons).
                </p>
              </div>
              <div className="bg-neutral-50 p-8 rounded-xl border border-brand/10 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand rounded-l"></div>
                <h2 className="text-2xl font-bold text-brand mb-3">
                  Back Concept
                </h2>
                <p className="text-base text-neutral-700 leading-relaxed m-0">
                  Split-screen layout contrasting the old vs. new models, with
                  specific fee breakdowns and compliance context.
                </p>
                <div className="mt-6 p-5 bg-white rounded-lg shadow-sm border border-neutral-100">
                  <span className="font-bold text-brand block text-lg">
                    We Are Not Brokers.
                  </span>
                  <p className="text-base text-neutral-700 mt-2 mb-0">
                    We are fiduciaries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "vetting" && (
            <div className="bg-neutral-50 p-8 rounded-xl border border-brand/10 relative overflow-hidden shadow-sm max-w-3xl mx-auto">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand rounded-l"></div>
              <h2 className="text-2xl font-bold text-brand mb-6">
                Checklist for Your Designer
              </h2>
              <ul className="list-none p-0 m-0 space-y-4">
                <li className="flex items-start bg-white p-4 rounded-lg border border-neutral-100 shadow-sm">
                  <CheckCircle2 className="text-brand w-6 h-6 mr-4 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-neutral-700 leading-relaxed">
                    Confirm final output dimensions (half-page, likely 5.5" x
                    8.5" or 6" x 9").
                  </span>
                </li>
                <li className="flex items-start bg-white p-4 rounded-lg border border-neutral-100 shadow-sm">
                  <CheckCircle2 className="text-brand w-6 h-6 mr-4 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-neutral-700 leading-relaxed">
                    Specify double-sided, full color, and gloss finish for a
                    high-quality feel.
                  </span>
                </li>
                <li className="flex items-start bg-white p-4 rounded-lg border border-neutral-100 shadow-sm">
                  <CheckCircle2 className="text-brand w-6 h-6 mr-4 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-neutral-700 leading-relaxed">
                    Prioritize signature primary color green{" "}
                    <code className="bg-neutral-100 px-1 py-0.5 rounded text-sm">#007143</code>. Ensure high contrast for
                    readability.
                  </span>
                </li>
                <li className="flex items-start bg-white p-4 rounded-lg border border-neutral-100 shadow-sm">
                  <CheckCircle2 className="text-brand w-6 h-6 mr-4 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-neutral-700 leading-relaxed">
                    Use minimalist, data-driven typography that emphasizes key
                    numbers.
                  </span>
                </li>
                <li className="flex items-start bg-white p-4 rounded-lg border border-neutral-100 shadow-sm">
                  <CheckCircle2 className="text-brand w-6 h-6 mr-4 mt-0.5 flex-shrink-0" />
                  <span className="text-base text-neutral-700 leading-relaxed">
                    Request high-resolution, print-ready PDFs and ensure all
                    fonts and linked images are embedded.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
