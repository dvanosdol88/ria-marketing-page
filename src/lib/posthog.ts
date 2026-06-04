import posthog from "posthog-js";

export type PostHogProperties = Record<string, unknown>;

type BrowserPostHog = {
  capture?: (eventName: string, properties?: PostHogProperties) => void;
  register?: (properties: PostHogProperties) => void;
  register_once?: (properties: PostHogProperties) => void;
};

function getBrowserPostHog() {
  if (typeof window === "undefined") return undefined;
  return posthog as BrowserPostHog;
}

function getDistinctId() {
  const storageKey = "sww_posthog_distinct_id";
  const existingId = window.localStorage.getItem(storageKey);
  if (existingId) return existingId;

  const distinctId =
    window.crypto?.randomUUID?.() ??
    `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(storageKey, distinctId);
  return distinctId;
}

function getCampaignProperties() {
  const searchParams = new URLSearchParams(window.location.search);
  return ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].reduce<Record<string, string>>(
    (properties, key) => {
      const value = searchParams.get(key);
      if (value) properties[key] = value;
      return properties;
    },
    {}
  );
}

function sendDirectPostHogEvent(eventName: string, properties: PostHogProperties) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!posthogKey) return;

  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  const body = JSON.stringify({
    api_key: posthogKey,
    event: eventName,
    properties: {
      distinct_id: getDistinctId(),
      $current_url: window.location.href,
      $host: window.location.hostname,
      site_domain: window.location.hostname,
      site_path: window.location.pathname,
      ...getCampaignProperties(),
      ...properties,
    },
    timestamp: new Date().toISOString(),
  });

  const endpoint = `${apiHost.replace(/\/$/, "")}/capture/`;
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(endpoint, blob)) return;
  }

  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function capturePostHogEvent(eventName: string, properties: PostHogProperties = {}) {
  if (typeof window === "undefined") return;
  sendDirectPostHogEvent(eventName, properties);
}

export function registerPostHogProperties(properties: PostHogProperties) {
  getBrowserPostHog()?.register?.(properties);
}

export function registerPostHogPropertiesOnce(properties: PostHogProperties) {
  getBrowserPostHog()?.register_once?.(properties);
}
