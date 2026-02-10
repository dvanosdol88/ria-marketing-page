"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

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

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/upgrade-your-advice"
                className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800"
              >
                See how we upgrade advice
              </a>
              <a
                href={EPISODE_DEEP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Open the Jensen clip in Spotify
              </a>
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

        {/* CTA */}
        <section className="mt-14 rounded-2xl border bg-white p-8">
          <h2 className="text-2xl font-semibold tracking-tight">If this resonates</h2>
          <p className="mt-2 max-w-3xl text-slate-700">
            If you want a fiduciary who uses modern tools to reduce friction — so the real work
            gets more attention — we should talk.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Run the fee scenario
            </a>
            <a
              href="/upgrade-your-advice"
              className="inline-flex items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              Read about fiduciary constraints
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}