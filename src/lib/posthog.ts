import posthog from "posthog-js";
import {
  POSTHOG_UTM_KEYS,
  resolveCampaignAttribution,
  resolveCleanRootLaunchAttribution,
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
  const url = new URL(currentUrl, window.location.origin);
  const explicitOrLegacy = resolveCampaignAttribution(url.searchParams);

  if (explicitOrLegacy) {
    storeCampaignAttribution(explicitOrLegacy);
    return explicitOrLegacy;
  }

  const stored = readStoredCampaignAttribution();
  if (stored) return stored;

  const cleanRoot = resolveCleanRootLaunchAttribution(url.searchParams, {
    pathname: url.pathname,
    referrer: typeof document === "undefined" ? "" : document.referrer,
    origin: url.origin,
  });

  if (cleanRoot) {
    storeCampaignAttribution(cleanRoot);
    return cleanRoot;
  }

  return {
    is_eddm_visitor: false,
    legacy_eddm_qr: false,
  };
}

function buildPostHogProperties(properties: PostHogProperties) {
  const sourceUrl =
    typeof properties.$current_url === "string"
      ? properties.$current_url
      : window.location.href;
  const currentUrl = new URL(sourceUrl, window.location.origin);
  const safeSearch = new URLSearchParams();
  POSTHOG_UTM_KEYS.forEach((key) => {
    const value = currentUrl.searchParams.get(key);
    if (value) safeSearch.set(key, value);
  });
  currentUrl.search = safeSearch.toString();
  currentUrl.hash = "";

  return {
    $host: window.location.hostname,
    site_domain: window.location.hostname,
    site_path: window.location.pathname,
    ...getPostHogCampaignProperties(sourceUrl),
    ...properties,
    $current_url: currentUrl.toString(),
  };
}

export function capturePostHogEvent(eventName: string, properties: PostHogProperties = {}) {
  if (typeof window === "undefined") return;
  getBrowserPostHog()?.capture?.(eventName, buildPostHogProperties(properties));
}

export function registerPostHogProperties(properties: PostHogProperties) {
  getBrowserPostHog()?.register?.(properties);
}

export function registerPostHogPropertiesOnce(properties: PostHogProperties) {
  getBrowserPostHog()?.register_once?.(properties);
}
