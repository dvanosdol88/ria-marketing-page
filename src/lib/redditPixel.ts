import {
  REDDIT_EVENT_FOR_POSTHOG_EVENT,
  REDDIT_PIXEL_HOSTS,
  REDDIT_PIXEL_ID,
  type RedditEventName,
} from "../config/redditPixel.ts";
import {
  hasPersistedSelfTestFlag,
  readSelfTestQueryValue,
} from "./selfTestTraffic.ts";

type Rdt = ((...args: unknown[]) => void) & {
  callQueue?: unknown[];
  sendEvent?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    rdt?: Rdt;
  }
}

export const REDDIT_PIXEL_SCRIPT_SRC = "https://www.redditstatic.com/ads/pixel.js";

export function redditPixelAllowed(
  hostname: string,
  pixelId: string = REDDIT_PIXEL_ID,
  selfTest = false,
) {
  return pixelId !== "" && !selfTest && REDDIT_PIXEL_HOSTS.has(hostname.toLowerCase());
}

function isSelfTestBrowser() {
  return (
    hasPersistedSelfTestFlag() ||
    readSelfTestQueryValue(window.location.search) === "1"
  );
}

function shouldRunHere() {
  if (typeof window === "undefined") return false;
  return redditPixelAllowed(window.location.hostname, REDDIT_PIXEL_ID, isSelfTestBrowser());
}

// Reddit's published loader, written out so it can be tested: queue calls
// until pixel.js arrives, then hand them to it.
export function installRedditPixel(): boolean {
  if (!shouldRunHere()) return false;
  if (!window.rdt) {
    const rdt: Rdt = (...args: unknown[]) => {
      if (rdt.sendEvent) rdt.sendEvent(...args);
      else rdt.callQueue!.push(args);
    };
    rdt.callQueue = [];
    window.rdt = rdt;
    const script = document.createElement("script");
    script.src = REDDIT_PIXEL_SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
    // No advanced matching: nothing about the visitor is passed to init.
    rdt("init", REDDIT_PIXEL_ID);
  }
  return true;
}

export function trackRedditEvent(eventName: RedditEventName) {
  if (!shouldRunHere() || !window.rdt) return;
  window.rdt("track", eventName);
}

export function mirrorPostHogEventToReddit(posthogEventName: string) {
  const redditEvent = REDDIT_EVENT_FOR_POSTHOG_EVENT[posthogEventName];
  if (redditEvent) trackRedditEvent(redditEvent);
}
