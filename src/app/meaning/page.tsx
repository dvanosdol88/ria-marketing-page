"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Cpu,
  Scale,
  FileText,
  Activity,
  ShieldCheck,
  Clock,
  ArrowRight
} from 'lucide-react';

/**
 * Meaning page
 *
 * Purpose:
 * - Reinforces the "the task isn't the job" narrative.
 * - Embeds the official Spotify episode player and provides a "Play from 15:27" control.
 *
 * Notes:
 * - This uses Spotify's official iFrame API (no re-hosting or clipping required).
 * - Autoplay may be blocked by some browsers; the page uses a user-click to start playback.
 */

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: any) => void;
  }
}

const SPOTIFY_IFRAME_API_SRC = "https://open.spotify.com/embed/iframe-api/v1";
const EPISODE_URI = "spotify:episode:4kSlkESoQ8GPU6meWACSlf";
const EPISODE_DEEP_LINK =
  "https://open.spotify.com/episode/4kSlkESoQ8GPU6meWACSlf?si=RSbjVYDQSmS6wWFJpwYlTw&t=927&pi=zYLjd4PdRbiqr";
const START_AT_SECONDS = 927; // 15:27

function useSpotifyEmbedController() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [controller, setController] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Avoid adding the script multiple times.
    const existing = document.querySelector(
      `script[src="${SPOTIFY_IFRAME_API_SRC}"]`
    );

    const ensureScript = () => {
      if (existing) return;
      const script = document.createElement("script");
      script.src = SPOTIFY_IFRAME_API_SRC;
      script.async = true;
      document.body.appendChild(script);
    };

    // Spotify calls this when their API script is loaded.
    window.onSpotifyIframeApiReady = (IFrameAPI: any) => {
      const element = containerRef.current;
      if (!element) return;

      const options = {
        uri: EPISODE_URI,
        width: "100%",
        height: 232,
      };

      const callback = (EmbedController: any) => {
        setController(EmbedController);
        // Load the episode and set the start timestamp. (No autoplay here.)
        try {
          // Signature: loadUri(spotifyUri, preferVideo?, startAt?, theme?)
          EmbedController.loadUri(EPISODE_URI, true, START_AT_SECONDS);
        } catch {
          // If loadUri signature differs, fall back to loading then seeking on user action.
        }

        EmbedController.addListener("ready", () => {
          setReady(true);
        });
      };

      IFrameAPI.createController(element, options, callback);
    };

    ensureScript();

    return () => {
      // Best-effort cleanup. Some integrations prefer leaving the controller alive.
      try {
        controller?.destroy?.();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { containerRef, controller, ready };
}

export default function MeaningPage() {
  const { containerRef, controller, ready } = useSpotifyEmbedController();

  const playFromTimestamp = () => {
    if (!controller) {
      window.open(EPISODE_DEEP_LINK, "_blank", "noopener,noreferrer");
      return;
    }

    // User gesture: seeking + play is more likely to work than autoplay on load.
    try {
      controller.seek?.(START_AT_SECONDS);
    } catch {
      // ignore
    }
    try {
      controller.play?.();
    } catch {
      window.open(EPISODE_DEEP_LINK, "_blank", "noopener,noreferrer");
    }
  };

  const minutesLabel = useMemo(() => {
    const mm = Math.floor(START_AT_SECONDS / 60);
    const ss = String(START_AT_SECONDS % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, []);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* HERO */}
        <section className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <p className="text-sm font-semibold tracking-wide text-brand-700">
              The narrative to anchor the brand
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              The task isn’t the job.
              <br className="hidden sm:block" />
              The job is to help people.
            </h1>

            <div className="mt-6 rounded-xl border bg-white p-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <div className="text-2xl font-semibold">meaning</div>
                <div className="text-sm text-slate-600">/ˈmēniNG/</div>
              </div>
              <p className="mt-3 text-slate-800">
                In every profession there are tasks — forms, notes, checklists, paperwork.
                But the work that matters is the outcome.
              </p>
              <p className="mt-3 text-slate-800">
                A radiologist’s job isn’t to point at pixels. It’s to help treat people.
                A lawyer’s job isn’t to “write a contract.” It’s to protect the client.
                Our job isn’t to produce more admin.
                <span className="font-semibold"> Our job is to protect your family’s plan</span> —
                and help you make better decisions, faster.
              </p>
            </div>


            <p className="mt-4 text-xs text-slate-600">
              Note: We embed Spotify’s official player. No re-hosting. No weirdness.
            </p>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-2xl border bg-white p-5">
              <div className="flex items-center gap-4">
                <Image
                  src="/DVO%20Head%20Shot%20picture.jpg"
                  alt="Advisor headshot"
                  width={80}
                  height={80}
                  className="rounded-xl object-cover"
                />
                <div>
                  <div className="text-sm font-semibold">Fiduciary-first</div>
                  <div className="text-sm text-slate-600">
                    Tools exist to serve the client — not the other way around.
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border p-4">
                  <div className="text-xs font-semibold text-slate-600">Outcome</div>
                  <div className="mt-1 font-semibold">Better decisions</div>
                  <div className="text-sm text-slate-600">
                    Clear options. Clear tradeoffs. Clear next steps.
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-xs font-semibold text-slate-600">Leverage</div>
                  <div className="mt-1 font-semibold">Help more people</div>
                  <div className="text-sm text-slate-600">
                    Less admin friction means more client time.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TASKS VS THE WORK */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">The Work That Matters</h2>
          <p className="mt-2 max-w-3xl text-slate-700">
            We use modern systems (including AI) to reduce the time spent on low-value tasks,
            so we can spend more time on the decisions that actually move your life forward.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-semibold">Tasks (necessary, but not the mission)</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
                <li>Meeting notes, follow-ups, and action items</li>
                <li>Document collection and “where did we put that?”</li>
                <li>Policy/compliance checklists and reminders</li>
                <li>Data entry, rollovers, account paperwork, vendor friction</li>
                <li>Explaining the same concepts repeatedly from scratch</li>
              </ul>
              <p className="mt-4 text-sm text-slate-600">
                These tasks must be done. They just shouldn’t consume the relationship.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-semibold">The job (what you actually hire us for)</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
                <li>Protecting you from preventable mistakes and conflicts of interest</li>
                <li>Helping you choose the right strategy — not just a product</li>
                <li>Coordinating decisions across taxes, investments, estate, insurance</li>
                <li>Keeping you on track when markets or life gets chaotic</li>
                <li>Turning information into decisions, and decisions into action</li>
              </ul>
              <p className="mt-4 text-sm text-slate-600">
                This is the point: less “busy,” more impact.
              </p>
            </div>
          </div>
        </section>

        {/* JENSEN CLIP */}
        <section className="mt-14 rounded-2xl border bg-white p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight">
                The Jensen Huang clip that captures it
              </h2>
              <p className="mt-2 text-slate-700">
                This segment is the cleanest explanation of the idea: AI changes the tasks,
                so the professional can focus on the meaning.
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Start at {minutesLabel}. If your browser blocks autoplay, click the button below.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={playFromTimestamp}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800"
                >
                  Play from {minutesLabel}
                </button>
                <a
                  href={EPISODE_DEEP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                >
                  Open in Spotify
                </a>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Implementation detail: this uses Spotify’s official iFrame API methods like
                <span className="font-mono"> loadUri(startAt)</span> and
                <span className="font-mono"> seek()</span>. Some browsers may require a user click
                before playback starts.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <div
                ref={containerRef}
                className="overflow-hidden rounded-xl border"
                aria-label="Spotify episode embed"
              />
              <div className="mt-3 rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
                <div className="font-semibold">If it doesn’t start at {minutesLabel}:</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Click “Play from {minutesLabel}” again (some browsers need a second gesture).</li>
                  <li>
                    Or use the “Open in Spotify” link, which includes the timestamp.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FROM /meaning1 — LAWYER LINE + JENSEN INSIGHT
        ═══════════════════════════════════════════════════════════════ */}
        <section className="pt-16 pb-8 px-6 max-w-4xl mx-auto text-center">
          <p className="text-xl md:text-2xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            The purpose of a lawyer is not to write the contract; it is to protect the client.
          </p>
        </section>

        <section className="py-16 px-6 bg-white border-y border-stone-200">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-stone prose-lg mx-auto">
              <p>
                Jensen Huang, the visionary founder of NVIDIA, recently articulated a distinction that perfectly captures why this firm exists. He spoke about the difference between the <strong>Task</strong> of a professional and the <strong>Meaning</strong> of their work.
              </p>
              <p>
                In financial services, the &quot;Tasks&quot; are endless: compliance checks, rebalancing, trade execution, data entry, reporting. For decades, clients have been charged huge fees primarily to cover the human labor required to perform these tasks.
              </p>
              <p className="font-serif text-2xl italic text-stone-800 border-l-4 border-brand-500 pl-6 py-2 my-8 bg-stone-50">
                &quot;We built our infrastructure to strip away the administrative noise so that every minute I spend with you is focused on your life, not your paperwork.&quot;
              </p>
              <p>
                We believe that if technology can handle the Tasks with perfect precision and near-zero cost, the savings shouldn&apos;t go to our margins. They should go to you—in the form of lower fees and deeper attention.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FROM /meaning1 — ENGINE VS PILOT
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 bg-stone-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
                Automating the Process to Elevate the Purpose
              </h2>
              <p className="text-stone-600 text-lg">
                We divide our work into two buckets. You only pay for one of them.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
                <div className="bg-stone-200 p-6 border-b border-stone-300">
                  <div className="flex items-center gap-3 text-stone-600 mb-2">
                    <Cpu className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-wider">The Engine</span>
                  </div>
                  <h3 className="text-2xl font-bold text-stone-800">The Tasks</h3>
                  <p className="text-stone-600 mt-2 text-sm">The mechanics. Necessary, precise, and standardized.</p>
                </div>
                <div className="p-8 flex-1">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-stone-400 mt-0.5" />
                      <span className="text-stone-600"><strong>Compliance &amp; Reporting</strong><br/>Ensuring every &apos;i&apos; is dotted and &apos;t&apos; is crossed.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-stone-400 mt-0.5" />
                      <span className="text-stone-600"><strong>Portfolio Rebalancing</strong><br/>Keeping your risk aligned with your targets.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-stone-400 mt-0.5" />
                      <span className="text-stone-600"><strong>Tax Loss Harvesting</strong><br/>Systematic efficiency to lower your tax bill.</span>
                    </li>
                  </ul>
                  <div className="mt-8 pt-6 border-t border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase mb-2">The Old Model Charges You For This</p>
                    <p className="text-stone-500 text-sm">Traditional firms need armies of staff to do this. We use code. It is faster, more accurate, and free to you.</p>
                  </div>
                </div>
              </div>

              <div className="bg-brand-900 rounded-2xl shadow-xl border border-brand-800 overflow-hidden flex flex-col text-white transform md:-translate-y-4 md:scale-105">
                <div className="bg-brand-800 p-6 border-b border-brand-700">
                  <div className="flex items-center gap-3 text-brand-200 mb-2">
                    <Heart className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-wider">The Pilot</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">The Meaning</h3>
                  <p className="text-brand-100 mt-2 text-sm">The mission. Human, strategic, and deeply personal.</p>
                </div>
                <div className="p-8 flex-1">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <Scale className="w-5 h-5 text-brand-400 mt-0.5" />
                      <span className="text-brand-50"><strong>Ethical Stewardship</strong><br/>Acting as a true fiduciary when decisions are hard.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-brand-400 mt-0.5" />
                      <span className="text-brand-50"><strong>Family Legacy</strong><br/>Understanding what the money is actually <em>for</em>.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-brand-400 mt-0.5" />
                      <span className="text-brand-50"><strong>Behavioral Coaching</strong><br/>Preventing panic when the world gets noisy.</span>
                    </li>
                  </ul>
                  <div className="mt-8 pt-6 border-t border-brand-800">
                    <p className="text-xs font-bold text-brand-400 uppercase mb-2">This Is What You Hire Us For</p>
                    <p className="text-brand-200 text-sm">You aren&apos;t paying me to read contracts or stare at tickers. You are paying me to know you.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FROM /meaning1 — THE DIVIDEND OF TIME
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/3">
              <div className="aspect-square relative rounded-2xl overflow-hidden shadow-lg bg-stone-200">
                <Image src="/DVO Head Shot picture.jpg" alt="David Van Osdol" fill className="object-cover" />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-6">The Dividend of Time</h2>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Who benefits when my firm uses AI? <strong>You do.</strong>
              </p>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                In traditional firms, advisors spend 60% of their time on paperwork (Tasks) and 40% on you (Meaning). This puts a hard cap on how many families they can truly help.
              </p>
              <p className="text-lg text-stone-600 leading-relaxed">
                We have inverted that ratio. We use advanced technology to automate the protection of your data, so I can dedicate 100% of my time to the protection of your future. We don&apos;t use tech to replace the human connection; we use it to clear the room for it.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FROM /upgrade9 — TASK VS PURPOSE VISUAL (RED/GREEN LISTS)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-6 bg-neutral-50">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full mb-4">THE TASK</span>
                  <h3 className="text-xl font-bold text-stone-900 mb-4">What They Get Paid For</h3>
                  <ul className="space-y-3 text-stone-600">
                    {['Clicking "rebalance" once a quarter', 'Selecting from a pre-approved product menu', 'Paperwork and account transfers', 'Generating quarterly performance reports', 'Compliance checkboxes'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <p className="text-sm text-stone-500">Typical cost: <span className="font-semibold text-red-500">1% of your assets, every year</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border-2 border-brand-500 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <span className="inline-block px-3 py-1 bg-brand-100 text-brand-600 text-xs font-semibold rounded-full mb-4">THE PURPOSE</span>
                  <h3 className="text-xl font-bold text-stone-900 mb-4">What I Actually Do</h3>
                  <ul className="space-y-3 text-stone-600">
                    {['Help you retire with confidence', 'Navigate major life transitions', 'Optimize taxes across your entire financial picture', "Make sure you don't run out of money", 'Help you sleep at night'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-6 border-t border-brand-100">
                    <p className="text-sm text-stone-500">My cost: <span className="font-semibold text-brand-600">$100/month flat fee</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FROM /upgrade9 — HUANG FRAMEWORK
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-stone-900 mb-4">Task vs. Purpose</h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">A framework for understanding what you&apos;re actually paying for.</p>
            </div>
            <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-8 md:p-12 border border-stone-200">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-stone-600 text-lg leading-relaxed mb-6">When you pay an advisor 1% of your assets, you&apos;re paying them to perform <em>tasks</em>—spreadsheets, paperwork, compliance boxes.</p>
                  <p className="text-stone-600 text-lg leading-relaxed mb-6">But their <strong>purpose</strong>—the reason you hired them—is to help you achieve your goals. To give you clarity. To be your guide.</p>
                  <p className="text-stone-800 text-lg leading-relaxed font-medium">Traditional fee structures blur this distinction. My flat-fee model doesn&apos;t.</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center"><span className="text-2xl">📋</span></div>
                      <div><p className="font-semibold text-stone-900">Tasks</p><p className="text-sm text-stone-500">The mechanics, the busywork</p></div>
                    </div>
                    <div className="h-px bg-stone-200"></div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-brand-100 flex items-center justify-center"><span className="text-2xl">🎯</span></div>
                      <div><p className="font-semibold text-stone-900">Purpose</p><p className="text-sm text-stone-500">Your goals, your future, your peace of mind</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FROM /upgrade9 — MY COMMITMENT (3 CARDS)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-6 bg-neutral-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-stone-900 mb-6">My Commitment</h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-8">I don&apos;t get paid to manage a portfolio. I get paid to help you succeed financially. That&apos;s not a marketing line—it&apos;s how my fee structure actually works.</p>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">No Products to Sell</h3>
                <p className="text-sm text-stone-600">I don&apos;t earn commissions. Ever. My only incentive is your success.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">No Conflicts</h3>
                <p className="text-sm text-stone-600">Flat fee means I give you my best advice, not the advice that maximizes my revenue.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">Stay Where You Are</h3>
                <p className="text-sm text-stone-600">Keep your existing accounts. I work with your custodian, not against them.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FROM /upgrade10 — STRIKETHROUGH HERO
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-white py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight mb-8">
              I&apos;m not in the business of<br />
              <span className="relative text-stone-400">
                managing money
                <span className="absolute left-0 right-0 top-1/2 h-1 bg-red-500 -rotate-1"></span>
              </span>
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-stone-800 mb-8">
              I&apos;m in the business of{' '}
              <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">helping you succeed.</span>
            </p>
            <p className="text-lg text-stone-600 leading-relaxed">There&apos;s a difference. A big one. And it changes everything about how I work—and how you pay.</p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FROM /upgrade10 — TASK VS PURPOSE REFRAME (ROUNDED CARDS)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Task vs. Purpose</h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">A simple framework that changes how you think about financial advice</p>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-1 bg-stone-200"></div>
              <div className="grid md:grid-cols-2 gap-8 md:gap-16">
                <div className="relative">
                  <div className="bg-red-50 rounded-3xl p-8 md:p-10 border-2 border-red-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center"><span className="text-3xl">📋</span></div>
                      <div><p className="text-xs font-semibold text-red-500 uppercase tracking-wide">What they charge for</p><h3 className="text-2xl font-bold text-stone-900">The Task</h3></div>
                    </div>
                    <p className="text-stone-700 leading-relaxed mb-6">The mechanics. The spreadsheets. The button-clicking. The compliance forms. The quarterly reports that go straight to your drawer.</p>
                    <div className="bg-white rounded-xl p-4"><p className="text-sm text-stone-500 mb-1">Typical advisor charges</p><p className="text-2xl font-bold text-red-500">1% of AUM</p><p className="text-xs text-stone-400">($10k/year on $1M)</p></div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-brand-50 rounded-3xl p-8 md:p-10 border-2 border-brand-200">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center"><span className="text-3xl">🎯</span></div>
                      <div><p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">What you actually need</p><h3 className="text-2xl font-bold text-stone-900">The Purpose</h3></div>
                    </div>
                    <p className="text-stone-700 leading-relaxed mb-6">Helping you retire confidently. Navigating life changes. Optimizing your entire financial picture. Giving you peace of mind.</p>
                    <div className="bg-white rounded-xl p-4"><p className="text-sm text-stone-500 mb-1">My flat fee</p><p className="text-2xl font-bold text-brand-600">$100/month</p><p className="text-xs text-stone-400">($1,200/year, period)</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FROM /upgrade10 — THE ULTIMATE IRONY
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-6 bg-amber-50 border-y border-amber-200">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-800 text-sm font-medium mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              The Ultimate Irony
            </div>
            <blockquote className="text-2xl md:text-3xl font-bold text-stone-800 leading-snug mb-6">
              &quot;Your advisor gets paid to manage your money. But your advisor is{' '}
              <span className="text-amber-700">almost never the one actually managing the money.</span>&quot;
            </blockquote>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">It&apos;s usually a portfolio of mutual funds, a model portfolio designed by someone else, or an algorithm. The &quot;management&quot; is a middleman fee for access to products you could buy yourself.</p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FROM /upgrade10 — HOW I'M DIFFERENT (4 CARDS)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 bg-neutral-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-stone-900 mb-4">I built a practice focused on purpose, not tasks.</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">No Products = No Conflicts</h3>
                <p className="text-stone-600 leading-relaxed">I don&apos;t sell insurance, annuities, or proprietary funds. I have nothing to sell you except my advice. Traditional advisors blur task and purpose because <strong>selling products IS their business model.</strong></p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Flat Fee = Pure Incentives</h3>
                <p className="text-stone-600 leading-relaxed">I get paid the same whether you have $500k or $5M. My incentive is to give you the best possible advice—not to gather more assets or sell you products.</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Stay Where You Are</h3>
                <p className="text-stone-600 leading-relaxed">Keep your existing accounts at Fidelity, Schwab, Vanguard—wherever. I work with your custodian. No transfers, no disruption, no asset-gathering games.</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">Better Tools, Better Decisions</h3>
                <p className="text-stone-600 leading-relaxed">You get access to institutional-grade financial planning software. Monte Carlo simulations, Roth conversion analysis, tax optimization—tools that actually help.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FROM /meaning1 — CTA: HIRE THE PILOT
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 bg-white border-t border-stone-200 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-6">
            Hire the Pilot. The Engine comes free.
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-10">
            See how a fee-only, fiduciary approach can change your financial life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://calendly.com" className="inline-flex items-center justify-center gap-2 bg-brand-700 text-white px-8 py-4 rounded-full font-bold hover:bg-brand-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 no-underline">
              Start the Conversation <ArrowRight className="w-5 h-5" />
            </a>
            <Link href="/upgrade-your-advice" className="inline-flex items-center justify-center gap-2 bg-stone-100 text-stone-700 px-8 py-4 rounded-full font-bold hover:bg-stone-200 transition-all no-underline">
              View Credentials
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}