import {
  LEGACY_EDDM_QR_PARAMS,
  SMARTER_WAY_WEALTH_ORIGIN,
} from "../config/campaignLinks.ts";
import { hasDuplicateParameters, isSharedResult, resolveQrSearch } from "./qrLanding.ts";

export const POSTHOG_UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type CampaignAttributionMethod =
  | "explicit_utm"
  | "legacy_qr_signature"
  | "clean_root_launch";

export type CampaignAttribution = Partial<Record<(typeof POSTHOG_UTM_KEYS)[number], string>> & {
  campaign_attribution_method: CampaignAttributionMethod;
  is_eddm_visitor: boolean;
  legacy_eddm_qr: boolean;
};

export type CampaignAttributionContext = {
  pathname?: string;
  referrer?: string;
  origin?: string;
};

const SMARTER_WAY_WEALTH_HOSTS = new Set([
  new URL(SMARTER_WAY_WEALTH_ORIGIN).hostname,
  `www.${new URL(SMARTER_WAY_WEALTH_ORIGIN).hostname}`,
]);

export function buildPrivacySafeFirmHandoffHref(
  href: string,
  campaignProperties: Record<string, unknown>,
) {
  const url = new URL(href);
  if (!SMARTER_WAY_WEALTH_HOSTS.has(url.hostname.toLowerCase())) return href;

  const safeSearch = new URLSearchParams();
  POSTHOG_UTM_KEYS.forEach((key) => {
    const campaignValue = campaignProperties[key];
    const existingValue = url.searchParams.get(key);
    const value =
      typeof campaignValue === "string" && campaignValue
        ? campaignValue
        : existingValue;
    if (value) safeSearch.set(key, value);
  });

  // The cross-domain privacy contract is a strict allowlist. Rebuilding the
  // query prevents calculator inputs, identity values, and unknown future
  // parameters from hitching a ride on any Smarter Way Wealth destination.
  url.search = safeSearch.toString();
  return url.toString();
}

export function resolveCampaignAttribution(
  search: string | URLSearchParams,
): CampaignAttribution | null {
  const searchParams =
    typeof search === "string" ? new URLSearchParams(search) : search;
  if (hasDuplicateParameters(searchParams) || isSharedResult(searchParams)) return null;
  const explicitUtmProperties = POSTHOG_UTM_KEYS.reduce<
    Partial<Record<(typeof POSTHOG_UTM_KEYS)[number], string>>
  >((properties, key) => {
    const value = searchParams.get(key);
    if (value) properties[key] = value;
    return properties;
  }, {});

  if (Object.keys(explicitUtmProperties).length > 0) {
    return {
      ...explicitUtmProperties,
      campaign_attribution_method: "explicit_utm",
      is_eddm_visitor: resolveQrSearch(searchParams) === "explicit_utm",
      legacy_eddm_qr: false,
    };
  }

  if (resolveQrSearch(searchParams) !== "legacy_qr_signature") return null;

  return {
    ...launch5kUtmFields(),
    campaign_attribution_method: "legacy_qr_signature",
    is_eddm_visitor: true,
    legacy_eddm_qr: true,
  };
}

function launch5kUtmFields() {
  return {
    utm_source: LEGACY_EDDM_QR_PARAMS.utm_source,
    utm_medium: LEGACY_EDDM_QR_PARAMS.utm_medium,
    utm_campaign: LEGACY_EDDM_QR_PARAMS.utm_campaign,
    utm_content: LEGACY_EDDM_QR_PARAMS.utm_content,
  };
}

// Historical events retain this method; new ordinary homepages cannot prove a scan.
export function resolveCleanRootLaunchAttribution(
  _search: string | URLSearchParams,
  _context: CampaignAttributionContext = {},
): CampaignAttribution | null {
  return null;
}
