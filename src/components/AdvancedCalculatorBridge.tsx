"use client";

import { useCallback, useEffect, useState } from "react";
import { SMARTER_WAY_WEALTH_ORIGIN } from "@/config/campaignLinks";

const ADVANCED_CALCULATOR_URL = `${SMARTER_WAY_WEALTH_ORIGIN}/save`;
const ADVANCED_CALCULATOR_LABEL = "Go to Advanced Calculator";

/**
 * The reader's own assumptions, and only those. Campaign and attribution
 * parameters deliberately stay behind: they describe how someone arrived at
 * THIS site, and forwarding them would misattribute traffic on the other one.
 */
const CARRIED_PARAMS = ["portfolio", "years", "growth", "fee", "flat", "mfe"] as const;

/**
 * Slim hand-off band that sits above the home fee calculator.
 *
 * This is the bridge from the simple mailed-QR-code calculator to the richer
 * Market Time Machine calculator on smarterwaywealth.com.
 *
 * It carries the reader's numbers across. Someone who has just spent a minute
 * entering their portfolio, fee and horizon should not have to key it all in
 * again on arrival — that re-entry was the most likely place to lose them.
 *
 * Two sources, in order. The server renders the link from the page's own query
 * string, so it is already correct in the delivered HTML and stays correct with
 * JavaScript off. Then, because the calculator keeps the address bar in step
 * with its live state, the href is refreshed from the address bar on pointer-
 * down and focus — both of which land before the navigation does, so a click
 * (or a middle-click into a new tab) takes the numbers as they stand at that
 * moment, including any the reader has just changed.
 *
 * Reading the address bar beats lifting state up to this band: the calculator
 * is already the thing that owns and publishes that state. Note it strips its
 * own parameters while everything sits at the house defaults, which is exactly
 * right — with nothing to carry, the plain link is what should be followed.
 *
 * Click telemetry is handled by the site-wide `PostHogCtaTracker`, which
 * already treats smarterwaywealth.com anchors as tracked CTAs and reads the
 * `data-posthog-cta-*` attributes below for `cta_label` / `cta_location`.
 *
 * Same-tab navigation is deliberate: this is a hand-off, not a side trip.
 */
/** Build the hand-off URL from whatever query string is in play. */
function buildHandoffUrl(search: URLSearchParams): string {
  const carried = new URLSearchParams();
  for (const key of CARRIED_PARAMS) {
    const value = search.get(key);
    if (value !== null) carried.set(key, value);
  }
  const query = carried.toString();
  return query ? `${ADVANCED_CALCULATOR_URL}?${query}` : ADVANCED_CALCULATOR_URL;
}

export function AdvancedCalculatorBridge({
  searchParams,
}: {
  /** The page's own query string, handed down from the server so the link is
   *  already right in the delivered HTML — before any JavaScript runs, and for
   *  a reader who has JavaScript off entirely. */
  searchParams?: Record<string, string | string[] | undefined>;
} = {}) {
  const [href, setHref] = useState(() => {
    const initial = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      const first = Array.isArray(value) ? value[0] : value;
      if (typeof first === "string") initial.set(key, first);
    }
    return buildHandoffUrl(initial);
  });

  const syncHref = useCallback(() => {
    if (typeof window === "undefined") return;
    setHref(buildHandoffUrl(new URLSearchParams(window.location.search)));
  }, []);

  useEffect(() => {
    syncHref();
  }, [syncHref]);

  return (
    <div className="w-full border-b border-[#D6DBE4] bg-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-1.5 px-4 py-3 text-center sm:py-4">
        <a
          href={href}
          onPointerDown={syncHref}
          onFocus={syncHref}
          data-posthog-cta-label={ADVANCED_CALCULATOR_LABEL}
          data-posthog-cta-location="home_above_calculator_bridge"
          className="inline-flex min-h-12 w-full max-w-sm items-center justify-center rounded-lg bg-[#064B84] px-6 text-base font-bold !text-white !no-underline transition-colors duration-200 hover:bg-[#053E6D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064B84] sm:w-auto sm:px-8"
        >
          {ADVANCED_CALCULATOR_LABEL}
        </a>
        <p className="text-[13px] font-medium leading-snug text-[#10233A]/70 sm:text-sm">
          Model your own time horizon against 40 years of actual S&amp;P 500
          returns at smarterwaywealth.com.
        </p>
      </div>
    </div>
  );
}
