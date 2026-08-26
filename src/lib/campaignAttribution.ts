import {
  EDDM_LAUNCH_QR_PARAMS,
  SMARTER_WAY_WEALTH_ORIGIN,
} from "@/config/campaignLinks";
import { isApprovedCampaignValue } from "@/lib/telemetryPrivacy";

export const POSTHOG_UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type CampaignAttribution = Partial<Record<(typeof POSTHOG_UTM_KEYS)[number], string>> & {
  campaign_attribution_method: "explicit_utm" | "legacy_qr_signature";
  is_eddm_visitor: boolean;
  legacy_eddm_qr: boolean;
};

function safeOwnDataProperty(value: object, key: string): unknown {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && "value" in descriptor ? descriptor.value : null;
  } catch {
    return null;
  }
}

function safeCampaignProperties(value: unknown) {
  if (value === null || typeof value !== "object") return {};
  return POSTHOG_UTM_KEYS.reduce<
    Partial<Record<(typeof POSTHOG_UTM_KEYS)[number], string>>
  >((properties, key) => {
    const candidate = safeOwnDataProperty(value, key);
    if (isApprovedCampaignValue(candidate)) {
      properties[key] = candidate.trim();
    }
    return properties;
  }, {});
}

/** Revalidate session storage before it can be registered or captured. */
export function sanitizeStoredCampaignAttribution(
  value: unknown,
): CampaignAttribution | null {
  const properties = safeCampaignProperties(value);
  if (Object.keys(properties).length === 0) return null;

  const legacyEddm =
    properties.utm_source === EDDM_LAUNCH_QR_PARAMS.utm_source &&
    properties.utm_medium === EDDM_LAUNCH_QR_PARAMS.utm_medium &&
    properties.utm_campaign === EDDM_LAUNCH_QR_PARAMS.utm_campaign &&
    properties.utm_content === EDDM_LAUNCH_QR_PARAMS.utm_content &&
    value !== null &&
    typeof value === "object" &&
    safeOwnDataProperty(value, "campaign_attribution_method") ===
      "legacy_qr_signature";

  return {
    ...properties,
    campaign_attribution_method: legacyEddm
      ? "legacy_qr_signature"
      : "explicit_utm",
    is_eddm_visitor: properties.utm_source?.toLowerCase() === "eddm",
    legacy_eddm_qr: legacyEddm,
  };
}

const SMARTER_WAY_WEALTH_HOSTS = new Set([
  new URL(SMARTER_WAY_WEALTH_ORIGIN).hostname,
  `www.${new URL(SMARTER_WAY_WEALTH_ORIGIN).hostname}`,
]);

export function appendCampaignAttributionToFirmHref(
  href: string,
  campaignProperties: Record<string, unknown>,
) {
  const url = new URL(href);
  if (!SMARTER_WAY_WEALTH_HOSTS.has(url.hostname.toLowerCase())) return href;

  let changed = false;
  POSTHOG_UTM_KEYS.forEach((key) => {
    const value = safeOwnDataProperty(campaignProperties, key);
    if (!isApprovedCampaignValue(value)) return;
    url.searchParams.set(key, value.trim());
    changed = true;
  });

  return changed ? url.toString() : href;
}

const LEGACY_EDDM_QR_SIGNATURE = {
  portfolio: EDDM_LAUNCH_QR_PARAMS.portfolio,
  years: EDDM_LAUNCH_QR_PARAMS.years,
  growth: EDDM_LAUNCH_QR_PARAMS.growth,
  fee: EDDM_LAUNCH_QR_PARAMS.fee,
} as const;

function matchesSearchSignature(
  searchParams: URLSearchParams,
  signature: Record<string, string>,
) {
  return Object.entries(signature).every(
    ([key, value]) => searchParams.get(key) === value,
  );
}

export function shouldOpenCalculatorForEddmQr(
  search: string | URLSearchParams,
) {
  const searchParams =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const hasExplicitUtm = POSTHOG_UTM_KEYS.some((key) =>
    isApprovedCampaignValue(searchParams.get(key)),
  );
  const matchesLegacyMailerQr =
    matchesSearchSignature(searchParams, LEGACY_EDDM_QR_SIGNATURE) &&
    !searchParams.has("variant") &&
    !hasExplicitUtm;
  const matchesCanonicalMailerQr = matchesSearchSignature(
    searchParams,
    EDDM_LAUNCH_QR_PARAMS,
  );

  return matchesLegacyMailerQr || matchesCanonicalMailerQr;
}

export function resolveCampaignAttribution(
  search: string | URLSearchParams,
): CampaignAttribution | null {
  const searchParams =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const explicitUtmProperties = safeCampaignProperties(
    Object.fromEntries(
      POSTHOG_UTM_KEYS.map((key) => [key, searchParams.get(key)]),
    ),
  );

  if (Object.keys(explicitUtmProperties).length > 0) {
    return {
      ...explicitUtmProperties,
      campaign_attribution_method: "explicit_utm",
      is_eddm_visitor:
        explicitUtmProperties.utm_source?.toLowerCase() === "eddm",
      legacy_eddm_qr: false,
    };
  }

  const matchesLegacyMailerQr =
    matchesSearchSignature(searchParams, LEGACY_EDDM_QR_SIGNATURE) &&
    !searchParams.has("variant");

  if (!matchesLegacyMailerQr) return null;

  return {
    utm_source: EDDM_LAUNCH_QR_PARAMS.utm_source,
    utm_medium: EDDM_LAUNCH_QR_PARAMS.utm_medium,
    utm_campaign: EDDM_LAUNCH_QR_PARAMS.utm_campaign,
    utm_content: EDDM_LAUNCH_QR_PARAMS.utm_content,
    campaign_attribution_method: "legacy_qr_signature",
    is_eddm_visitor: true,
    legacy_eddm_qr: true,
  };
}
