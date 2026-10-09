import posthog from "posthog-js";
import { mirrorPostHogEventToReddit } from "@/lib/redditPixel";
import {
  POSTHOG_UTM_KEYS,
  resolveCampaignAttribution,
  type CampaignAttribution,
} from "@/lib/campaignAttribution";
import { MEASUREMENT_HOSTS } from "@/lib/qrLanding";
import { syncQrVerification } from "@/lib/qrVerification";

export type PostHogProperties = Record<string, unknown>;

type BrowserPostHog = {
  capture?: (eventName: string, properties?: PostHogProperties) => void;
  register?: (properties: PostHogProperties) => void;
  register_once?: (properties: PostHogProperties) => void;
  unregister?: (key: string) => void;
};

function getBrowserPostHog() {
  if (typeof window === "undefined") return undefined;
  return posthog as BrowserPostHog;
}

const CAMPAIGN_SESSION_STORAGE_KEY = "sww_campaign_attribution";
const documentArrival = typeof window === "undefined" ? null : window.location.href;
let documentCampaignInitialized = false;
let documentCampaign: CampaignAttribution | null = null;

function resolveDocumentCampaign(url: URL) {
  const campaign = resolveCampaignAttribution(url.searchParams);
  if (campaign?.is_eddm_visitor && (!MEASUREMENT_HOSTS.has(url.hostname.toLowerCase()) || url.pathname !== "/")) return null;
  return campaign;
}

export function initializeDocumentCampaign(currentUrl = documentArrival ?? window.location.href) {
  if (documentCampaignInitialized) return;
  documentCampaignInitialized = true;
  documentCampaign = resolveDocumentCampaign(new URL(currentUrl, window.location.origin));
  [...POSTHOG_UTM_KEYS, "campaign_attribution_method", "is_eddm_visitor", "legacy_eddm_qr"].forEach((key) => getBrowserPostHog()?.unregister?.(key));
  try { window.sessionStorage.removeItem(CAMPAIGN_SESSION_STORAGE_KEY); } catch { /* Memory fallback. */ }
  if (documentCampaign) storeCampaignAttribution(documentCampaign);
}

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
  initializeDocumentCampaign();
  const explicitOrLegacy = resolveDocumentCampaign(url);

  if (explicitOrLegacy) {
    storeCampaignAttribution(explicitOrLegacy);
    return explicitOrLegacy;
  }

  const stored = documentCampaign ?? readStoredCampaignAttribution();
  if (stored) return stored;

  return {
    ...Object.fromEntries(POSTHOG_UTM_KEYS.map((key) => [key, null])),
    campaign_attribution_method: null,
    is_eddm_visitor: false,
    legacy_eddm_qr: false,
  };
}

export function safeAnalyticsUrl(sourceUrl: string) {
  const currentUrl = new URL(sourceUrl, window.location.origin);
  const safeSearch = new URLSearchParams();
  POSTHOG_UTM_KEYS.forEach((key) => {
    const value = currentUrl.searchParams.get(key);
    if (value) safeSearch.set(key, value);
  });
  currentUrl.search = safeSearch.toString();
  currentUrl.hash = "";
  return currentUrl.toString();
}

function buildPostHogProperties(properties: PostHogProperties) {
  const sourceUrl = typeof properties.$current_url === "string" ? properties.$current_url : window.location.href;

  return {
    $host: window.location.hostname,
    site_domain: window.location.hostname,
    site_path: window.location.pathname,
    ...getPostHogCampaignProperties(sourceUrl),
    ...properties,
    $current_url: safeAnalyticsUrl(sourceUrl),
  };
}

export function capturePostHogEvent(eventName: string, properties: PostHogProperties = {}) {
  if (typeof window === "undefined") return;
  const verification = syncQrVerification();
  getBrowserPostHog()?.capture?.(eventName, buildPostHogProperties({ ...properties, ...(verification ? { self_test: true, qr_verification: true } : {}) }));
  mirrorPostHogEventToReddit(eventName);
}

export function registerPostHogProperties(properties: PostHogProperties) {
  getBrowserPostHog()?.register?.(properties);
}

export function registerPostHogPropertiesOnce(properties: PostHogProperties) {
  getBrowserPostHog()?.register_once?.(properties);
}
