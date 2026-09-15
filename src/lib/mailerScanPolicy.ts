export const RIA_BUILDER_ORIGIN = "https://riabuilder.dvo88.com";

export const ALLOWED_MAILER_ATTRIBUTION_METHODS = new Set([
  "explicit_utm",
  "legacy_qr_signature",
]);

const BOT_USER_AGENT_PATTERN =
  /bot|crawler|spider|headless|lighthouse|preview|facebookexternalhit|slackbot|twitterbot|whatsapp|google-inspectiontool/i;

const APPROVED_EDDM_UTM = {
  utm_source: "eddm",
  utm_medium: "print",
  utm_campaign: "launch_5k",
  utm_content: "qr_code",
} as const;

type CampaignProperties = Record<string, unknown>;

export function isApprovedMailerCampaign(properties: CampaignProperties) {
  if (
    properties.campaign_attribution_method === "legacy_qr_signature" &&
    properties.legacy_eddm_qr === true
  ) {
    return true;
  }

  return (
    properties.campaign_attribution_method === "explicit_utm" &&
    Object.entries(APPROVED_EDDM_UTM).every(
      ([key, value]) => properties[key] === value,
    )
  );
}

export function isLikelyBotUserAgent(userAgent: string) {
  return BOT_USER_AGENT_PATTERN.test(userAgent);
}

export function publicMailerScanHeaders() {
  return {
    "Access-Control-Allow-Origin": RIA_BUILDER_ORIGIN,
    "Cache-Control": "no-store, max-age=0",
    Vary: "Origin",
  };
}

export function requestHeadersCameFromThisSite(headers: Pick<Headers, "get">) {
  const fetchSite = headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const requestHost =
    headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headers.get("host");
  if (!requestHost) return false;

  const origin = headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === requestHost;
    } catch {
      return false;
    }
  }

  const referer = headers.get("referer");
  if (!referer) return false;

  try {
    return new URL(referer).host === requestHost;
  } catch {
    return false;
  }
}

export function buildMailerScanUpdate<TIncrement, TTimestamp>(
  attributionMethod: string,
  increment: (value: number) => TIncrement,
  serverTimestamp: () => TTimestamp,
) {
  return {
    count: increment(1),
    lastScanAt: serverTimestamp(),
    byAttribution: {
      [attributionMethod]: increment(1),
    },
  };
}
