import posthog from "posthog-js";
import {
  resolveCampaignAttribution,
  type CampaignAttribution,
} from "@/lib/campaignAttribution";

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

const CAMPAIGN_SESSION_STORAGE_KEY = "sww_campaign_attribution";

function storeCampaignAttribution(attribution: CampaignAttribution) {
  try {
    window.sessionStorage.setItem(
      CAMPAIGN_SESSION_STORAGE_KEY,
      JSON.stringify(attribution),
    );
  } catch {
    // Analytics attribution should never interfere with the visitor experience.
  }
}

function readStoredCampaignAttribution(): CampaignAttribution | null {
  try {
    const stored = window.sessionStorage.getItem(CAMPAIGN_SESSION_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CampaignAttribution) : null;
  } catch {
    return null;
  }
}

export function getPostHogCampaignProperties(
  currentUrl = window.location.href,
): PostHogProperties {
  const attribution = resolveCampaignAttribution(
    new URL(currentUrl, window.location.origin).searchParams,
  );

  if (attribution) {
    storeCampaignAttribution(attribution);
    return attribution;
  }

  return (
    readStoredCampaignAttribution() ?? {
      is_eddm_visitor: false,
      legacy_eddm_qr: false,
    }
  );
}

function sendDirectPostHogEvent(eventName: string, properties: PostHogProperties) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!posthogKey) return;

  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  const currentUrl =
    typeof properties.$current_url === "string"
      ? properties.$current_url
      : window.location.href;
  const body = JSON.stringify({
    api_key: posthogKey,
    event: eventName,
    properties: {
      distinct_id: getDistinctId(),
      $current_url: currentUrl,
      $host: window.location.hostname,
      site_domain: window.location.hostname,
      site_path: window.location.pathname,
      ...getPostHogCampaignProperties(currentUrl),
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
