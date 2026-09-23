import {
  LEGACY_EDDM_QR_PARAMS,
  SMARTER_WAY_WEALTH_ORIGIN,
} from "../config/campaignLinks.ts";
import { SELF_TEST_QUERY_PARAM } from "./selfTestTraffic.ts";

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

const SEARCH_ENGINE_HOSTS = [
  "google.com",
  "bing.com",
  "duckduckgo.com",
  "yahoo.com",
  "baidu.com",
  "yandex.com",
  "yandex.ru",
  "ecosia.org",
  "brave.com",
];

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

const LEGACY_EDDM_QR_SIGNATURE = {
  portfolio: LEGACY_EDDM_QR_PARAMS.portfolio,
  years: LEGACY_EDDM_QR_PARAMS.years,
  growth: LEGACY_EDDM_QR_PARAMS.growth,
  fee: LEGACY_EDDM_QR_PARAMS.fee,
} as const;

function matchesSearchSignature(
  searchParams: URLSearchParams,
  signature: Record<string, string>,
) {
  return Object.entries(signature).every(
    ([key, value]) => searchParams.get(key) === value,
  );
}

export function resolveCampaignAttribution(
  search: string | URLSearchParams,
): CampaignAttribution | null {
  const searchParams =
    typeof search === "string" ? new URLSearchParams(search) : search;
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

function hostnameIsSearchEngine(hostname: string) {
  const host = hostname.toLowerCase();
  return SEARCH_ENGINE_HOSTS.some(
    (engine) => host === engine || host.endsWith(`.${engine}`),
  );
}

function referrerBlocksCleanRootLaunch(
  referrer: string,
  origin?: string,
) {
  if (!referrer) return false;
  try {
    const referrerUrl = new URL(referrer);
    if (origin && referrerUrl.origin === origin) return true;
    return hostnameIsSearchEngine(referrerUrl.hostname);
  } catch {
    return false;
  }
}

function isCleanRootSearch(searchParams: URLSearchParams) {
  if (POSTHOG_UTM_KEYS.some((key) => searchParams.has(key))) return false;
  return Array.from(searchParams.keys()).every(
    (key) => key === SELF_TEST_QUERY_PARAM,
  );
}

export function resolveCleanRootLaunchAttribution(
  search: string | URLSearchParams,
  context: CampaignAttributionContext = {},
): CampaignAttribution | null {
  const searchParams =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const pathname = context.pathname ?? "/";
  if (pathname !== "/" && pathname !== "") return null;
  if (!isCleanRootSearch(searchParams)) return null;
  if (referrerBlocksCleanRootLaunch(context.referrer ?? "", context.origin)) {
    return null;
  }

  return {
    ...launch5kUtmFields(),
    campaign_attribution_method: "clean_root_launch",
    is_eddm_visitor: true,
    legacy_eddm_qr: false,
  };
}
