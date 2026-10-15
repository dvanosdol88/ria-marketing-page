"use client";

import { Analytics } from "@vercel/analytics/next";
import { useSyncExternalStore } from "react";
import { isBluesHostname } from "@/lib/bluesHost";

function subscribe() {
  return () => {};
}

function analyticsEnabledOnClient() {
  return !isBluesHostname(window.location.hostname);
}

/** Server render stays off so a Blues first paint never ships the green counter. */
function analyticsEnabledOnServer() {
  return false;
}

/**
 * Vercel page counts for the green site only. onepercentblues.com and www
 * skip this so Blues visits are not added to the green project's totals.
 */
export function SiteAnalytics() {
  const enabled = useSyncExternalStore(
    subscribe,
    analyticsEnabledOnClient,
    analyticsEnabledOnServer,
  );
  if (!enabled) return null;
  return <Analytics />;
}
