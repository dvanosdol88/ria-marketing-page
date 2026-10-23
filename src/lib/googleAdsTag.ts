import {
  GOOGLE_ADS_KEPT_QUERY_PARAMS,
  GOOGLE_ADS_TAG_HOSTS,
  GOOGLE_ADS_TAG_ID,
} from "../config/googleAdsTag.ts";
import {
  hasPersistedSelfTestFlag,
  readSelfTestQueryValue,
} from "./selfTestTraffic.ts";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export const GOOGLE_TAG_SCRIPT_SRC = "https://www.googletagmanager.com/gtag/js";

export function googleAdsTagAllowed(
  hostname: string,
  tagId: string = GOOGLE_ADS_TAG_ID,
  selfTest = false,
) {
  return tagId !== "" && !selfTest && GOOGLE_ADS_TAG_HOSTS.has(hostname.toLowerCase());
}

// The page address Google sees: origin + path + ad-attribution parameters
// only. Calculator inputs and anything else in the query string are dropped.
export function sanitizedPageLocation(href: string): string {
  const url = new URL(href);
  const kept = new URLSearchParams();
  for (const name of GOOGLE_ADS_KEPT_QUERY_PARAMS) {
    for (const value of url.searchParams.getAll(name)) kept.append(name, value);
  }
  const query = kept.toString();
  return `${url.origin}${url.pathname}${query ? `?${query}` : ""}`;
}

function isSelfTestBrowser() {
  return (
    hasPersistedSelfTestFlag() ||
    readSelfTestQueryValue(window.location.search) === "1"
  );
}

function shouldRunHere() {
  if (typeof window === "undefined") return false;
  return googleAdsTagAllowed(window.location.hostname, GOOGLE_ADS_TAG_ID, isSelfTestBrowser());
}

export type GoogleAdsTagInstall = "off" | "installed" | "present";

// Google's published snippet, written out so it can be scoped and tested.
// gtag must queue the `arguments` object itself, not a copied array —
// gtag.js ignores plain arrays in the dataLayer.
export function installGoogleAdsTag(): GoogleAdsTagInstall {
  if (!shouldRunHere()) return "off";
  if (window.gtag) return "present";
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  const script = document.createElement("script");
  script.async = true;
  script.src = `${GOOGLE_TAG_SCRIPT_SRC}?id=${encodeURIComponent(GOOGLE_ADS_TAG_ID)}`;
  document.head.appendChild(script);
  window.gtag("js", new Date());
  // config records the first page view.
  window.gtag("config", GOOGLE_ADS_TAG_ID, {
    page_location: sanitizedPageLocation(window.location.href),
  });
  return "installed";
}

// Later in-site page changes (the site navigates without full page loads).
export function trackGoogleAdsPageView() {
  if (!shouldRunHere() || !window.gtag) return;
  window.gtag("event", "page_view", {
    send_to: GOOGLE_ADS_TAG_ID,
    page_location: sanitizedPageLocation(window.location.href),
  });
}
