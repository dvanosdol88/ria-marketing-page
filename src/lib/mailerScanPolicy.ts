export const RIA_BUILDER_ORIGIN = "https://riabuilder.dvo88.com";

// 05-54: only an exact mailer QR landing is a scan. The printed mailer QR
// carries the four-number printer signature; a plain-homepage landing
// (clean_root_launch) cannot be told apart from a typed visit or a robot,
// so it is counted as a visit, never as a scan.
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

function hasApprovedLaunchUtms(properties: CampaignProperties) {
  return Object.entries(APPROVED_EDDM_UTM).every(
    ([key, value]) => properties[key] === value,
  );
}

export function isApprovedMailerCampaign(properties: CampaignProperties) {
  if (
    properties.campaign_attribution_method === "legacy_qr_signature" &&
    properties.legacy_eddm_qr === true
  ) {
    return true;
  }

  if (properties.campaign_attribution_method === "clean_root_launch") {
    return false;
  }

  return (
    properties.campaign_attribution_method === "explicit_utm" &&
    hasApprovedLaunchUtms(properties)
  );
}

export function isLikelyBotUserAgent(userAgent: string) {
  return BOT_USER_AGENT_PATTERN.test(userAgent);
}

// Real browsers always send a user agent and Accept-Language with a fetch;
// scripted visitors frequently omit one or name themselves.
export function requestLooksAutomated(headers: Pick<Headers, "get">) {
  const userAgent = headers.get("user-agent") ?? "";
  if (!userAgent || isLikelyBotUserAgent(userAgent)) return true;
  return !headers.get("accept-language");
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

export function easternDayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

// A browser reports once per Eastern day. `visits` is all-time unique
// visitors (first report ever); `daily[day].visits` is that day's uniques.
export function buildTrafficVisitUpdate<TIncrement, TTimestamp>(
  dayKey: string,
  increment: (value: number) => TIncrement,
  serverTimestamp: () => TTimestamp,
  firstEver = true,
) {
  return {
    ...(firstEver ? { visits: increment(1) } : {}),
    lastVisitAt: serverTimestamp(),
    daily: {
      [dayKey]: { visits: increment(1) },
    },
  };
}

export function buildMailerScanUpdate<TIncrement, TTimestamp>(
  attributionMethod: string,
  increment: (value: number) => TIncrement,
  serverTimestamp: () => TTimestamp,
  dayKey?: string,
) {
  return {
    count: increment(1),
    lastScanAt: serverTimestamp(),
    byAttribution: {
      [attributionMethod]: increment(1),
    },
    ...(dayKey ? { daily: { [dayKey]: { scans: increment(1) } } } : {}),
  };
}
