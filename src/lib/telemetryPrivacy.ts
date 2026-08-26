export const APPROVED_TELEMETRY_QUERY_KEYS = Object.freeze([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const);

const APPROVED_TELEMETRY_QUERY_KEY_SET = new Set<string>(
  APPROVED_TELEMETRY_QUERY_KEYS,
);
const SAFE_FALLBACK_ORIGIN = "https://youarepayingtoomuch.com";
const SENSITIVE_SCHEMES = new Set(["mailto:", "sms:", "tel:"]);
const EMAIL_VALUE_PATTERN = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/i;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const ABSOLUTE_URL_PATTERN = /^(?:https?|wss?|ftp|mailto|sms|tel):/i;
const BARE_RELATIVE_URL_PATTERN =
  /^[a-z\d._~-]+(?:\/[a-z\d._~!$&()*+,;=:@%/-]*)*[?#]/i;
const EMBEDDED_URL_PATTERN =
  /(?:https?|wss?|ftp):\/\/[^\s<>"']+|(?:mailto|sms|tel):[^\s<>"']+|\/[a-z\d._~!$&()*+,;=:@%/-]+[?#][^\s<>"']*/gi;
const URL_FIELD_KEY_PATTERN = /(?:^|[_$])(?:url|uri|href)(?:$|[_])/i;

function getFallbackOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return SAFE_FALLBACK_ORIGIN;
}

function isApprovedCampaignValue(value: string) {
  return (
    value.length <= 200 &&
    !CONTROL_CHARACTER_PATTERN.test(value) &&
    !EMAIL_VALUE_PATTERN.test(value)
  );
}

function approvedSearch(url: URL) {
  const safe = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (
      APPROVED_TELEMETRY_QUERY_KEY_SET.has(key.toLowerCase()) &&
      isApprovedCampaignValue(value)
    ) {
      safe.append(key.toLowerCase(), value);
    }
  });
  const serialized = safe.toString();
  return serialized ? `?${serialized}` : "";
}

function isRelativeReference(value: string) {
  return (
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("?") ||
    value.startsWith("#") ||
    BARE_RELATIVE_URL_PATTERN.test(value)
  );
}

function isCampaignPropertyKey(key: string) {
  const normalized = key.toLowerCase();
  return (
    APPROVED_TELEMETRY_QUERY_KEY_SET.has(normalized) ||
    (normalized.startsWith("first_") &&
      APPROVED_TELEMETRY_QUERY_KEY_SET.has(normalized.slice(6)))
  );
}

/**
 * Return a telemetry-safe URL. Query strings are deny-by-default: only the
 * five campaign keys approved by the shared analytics contract survive.
 * Fragments, credentials, auth/onboarding values, and unknown keys never do.
 */
export function sanitizeAnalyticsUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";

  const input = value.trim();
  const wasProtocolRelative = input.startsWith("//");
  const wasRelative = isRelativeReference(input) && !wasProtocolRelative;

  try {
    const url = new URL(input, getFallbackOrigin());
    const protocol = url.protocol.toLowerCase();

    if (SENSITIVE_SCHEMES.has(protocol)) return protocol;
    if (protocol !== "http:" && protocol !== "https:") return "";

    url.username = "";
    url.password = "";
    url.search = approvedSearch(url);
    url.hash = "";

    if (wasProtocolRelative) {
      return `//${url.host}${url.pathname}${url.search}`;
    }
    if (wasRelative && !ABSOLUTE_URL_PATTERN.test(input)) {
      return `${url.pathname}${url.search}`;
    }
    return url.toString();
  } catch {
    // Privacy boundaries fail closed. Never echo an unparseable raw value.
    return "";
  }
}

function sanitizeTelemetryString(value: string) {
  const trimmed = value.trim();
  if (
    ABSOLUTE_URL_PATTERN.test(trimmed) ||
    trimmed.startsWith("//") ||
    isRelativeReference(trimmed)
  ) {
    return sanitizeAnalyticsUrl(trimmed);
  }

  return value.replace(EMBEDDED_URL_PATTERN, (url) => sanitizeAnalyticsUrl(url));
}

function scrubTelemetryValue(
  value: unknown,
  seen: WeakMap<object, unknown>,
  depth: number,
  fieldKey = "",
): unknown {
  if (typeof value === "string") {
    return URL_FIELD_KEY_PATTERN.test(fieldKey)
      ? sanitizeAnalyticsUrl(value)
      : sanitizeTelemetryString(value);
  }
  if (value === null || typeof value !== "object") return value;
  if (depth > 32) return Array.isArray(value) ? [] : {};

  if (typeof URL !== "undefined" && value instanceof URL) {
    return sanitizeAnalyticsUrl(value.toString());
  }

  const existing = seen.get(value);
  if (existing) return existing;

  if (Array.isArray(value)) {
    const copy: unknown[] = [];
    seen.set(value, copy);
    value.forEach((item) =>
      copy.push(scrubTelemetryValue(item, seen, depth + 1)),
    );
    return copy;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return value;

  const copy: Record<string, unknown> = {};
  seen.set(value, copy);
  for (const [key, item] of Object.entries(value)) {
    if (isCampaignPropertyKey(key)) {
      if (typeof item === "string" && isApprovedCampaignValue(item)) {
        copy[key] = item;
      }
      continue;
    }
    copy[key] = scrubTelemetryValue(item, seen, depth + 1, key);
  }
  return copy;
}

/** Sanitize every URL-shaped string at the final telemetry boundary. */
export function sanitizeTelemetryPayload<T>(value: T): T {
  return scrubTelemetryValue(value, new WeakMap(), 0) as T;
}

/** PostHog `before_send` hook used for SDK/autocapture and replay events. */
export function sanitizePostHogCaptureResult<T>(capture: T): T {
  return capture === null ? capture : sanitizeTelemetryPayload(capture);
}

/** Sentry hook used for errors, transactions, and breadcrumbs. */
export function sanitizeSentryEvent<T>(event: T): T {
  return sanitizeTelemetryPayload(event);
}
