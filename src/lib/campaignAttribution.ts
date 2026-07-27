import { EDDM_LAUNCH_QR_PARAMS } from "@/config/campaignLinks";

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

const LEGACY_EDDM_QR_SIGNATURE = {
  portfolio: EDDM_LAUNCH_QR_PARAMS.portfolio,
  years: EDDM_LAUNCH_QR_PARAMS.years,
  growth: EDDM_LAUNCH_QR_PARAMS.growth,
  fee: EDDM_LAUNCH_QR_PARAMS.fee,
} as const;

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

  const matchesLegacyMailerQr = Object.entries(
    LEGACY_EDDM_QR_SIGNATURE,
  ).every(([key, value]) => searchParams.get(key) === value)
    && !searchParams.has("variant");

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
