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
const URL_LIKE_CAMPAIGN_VALUE_PATTERN =
  /(?:https?|wss?|ftp|mailto|sms|tel):|(?:^|\W)www\.|(?:^|[^a-z\d])(?:[a-z\d-]+\.)+[a-z]{2,}(?::\d+)?(?:$|[^a-z\d-])|[/?#\\]/i;
const CREDENTIAL_CAMPAIGN_VALUE_PATTERN =
  /(?:^|[^a-z\d])(?:auth(?:orization)?|bearer|credential|invite|magic[-_ ]?link|one[-_ ]?time|otp|pass(?:word|wd)?|private|secret|session[-_ ]?id|signature|token|verification|verify)(?:$|[^a-z\d])/i;
const USER_PASSWORD_VALUE_PATTERN = /^[^:\s]{1,64}:[^:\s]{1,128}$/;
const KEY_CAMPAIGN_VALUE_PATTERN =
  /(?:^|[^a-z\d])(?:api|access|auth|private|public)[-_ ]?(?:key|code)(?:$|[^a-z\d])/i;
const JWT_VALUE_PATTERN =
  /(?:^|[^a-z\d_-])[a-z\d_-]{8,}\.[a-z\d_-]{8,}\.[a-z\d_-]{8,}(?:$|[^a-z\d_-])/i;
const UUID_VALUE_PATTERN =
  /(?:^|[^a-f\d])[a-f\d]{8}-[a-f\d]{4}-[1-5][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}(?:$|[^a-f\d])/i;
const SSN_VALUE_PATTERN = /(?:^|\D)\d{3}[- ]?\d{2}[- ]?\d{4}(?:$|\D)/;
const PHONE_VALUE_PATTERN = /^\+?[\d().\s-]{10,}$/;
const LONG_OPAQUE_RUN_PATTERN = /[a-z\d+/=]{24,}/gi;
const ABSOLUTE_URL_PATTERN = /^(?:https?|wss?|ftp|mailto|sms|tel):/i;
const BARE_RELATIVE_URL_PATTERN =
  /^[a-z\d._~-]+(?:\/[a-z\d._~!$&()*+,;=:@%/-]*)*[?#]/i;
const EMBEDDED_URL_PATTERN =
  /(?:https?|wss?|ftp):\/\/[^\s<>"']+|(?:mailto|sms|tel):[^\s<>"']+|\/[a-z\d._~!$&()*+,;=:@%/-]+[?#][^\s<>"']*/gi;
const EMBEDDED_PROTECTED_PATH_PATTERN =
  /(^|[\s([{=:])((?:\/)?(?:api\/auth|auth|onboarding|access|activate|callback|invite|magic-link|reset-password|secure-link|verification|verify)(?:\/[^\s<>"'?#[\]{}(),;]+)+)/gi;
const URL_FIELD_KEY_PATTERN = /(?:^|[_$])(?:url|uri|href)(?:$|[_])/i;
const PROTECTED_ROUTE_SEGMENTS: Readonly<
  Record<string, ReadonlySet<string>>
> = Object.freeze({
  auth: new Set([
    "callback",
    "invite",
    "login",
    "magic-link",
    "reset-password",
    "sign-in",
    "verify",
  ]),
  onboarding: new Set([
    "access",
    "confirm-fit",
    "financial-picture",
    "first-meeting",
    "invite",
    "make-it-official",
    "start",
    "story",
    "verify",
    "your-story",
  ]),
});
const PROTECTED_TOP_LEVEL_ROUTES = new Set([
  "access",
  "activate",
  "callback",
  "invite",
  "magic-link",
  "reset-password",
  "secure-link",
  "verification",
  "verify",
]);

function getFallbackOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return SAFE_FALLBACK_ORIGIN;
}

function decodeCampaignValue(value: string) {
  let decoded = value;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}

function entropy(value: string) {
  const counts = new Map<string, number>();
  for (const character of value) {
    counts.set(character, (counts.get(character) ?? 0) + 1);
  }
  let result = 0;
  counts.forEach((count) => {
    const probability = count / value.length;
    result -= probability * Math.log2(probability);
  });
  return result;
}

function containsHighEntropyOpaqueRun(value: string) {
  const runs = value.match(LONG_OPAQUE_RUN_PATTERN) ?? [];
  return runs.some((run) => entropy(run.toLowerCase()) >= 3.7);
}

/** Return true only for ordinary campaign labels, never secret-shaped data. */
export function isApprovedCampaignValue(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 200) return false;

  const inspected = decodeCampaignValue(trimmed);
  const phoneDigits = inspected.replace(/\D/g, "");
  return !(
    CONTROL_CHARACTER_PATTERN.test(inspected) ||
    EMAIL_VALUE_PATTERN.test(inspected) ||
    URL_LIKE_CAMPAIGN_VALUE_PATTERN.test(inspected) ||
    CREDENTIAL_CAMPAIGN_VALUE_PATTERN.test(inspected) ||
    USER_PASSWORD_VALUE_PATTERN.test(inspected) ||
    KEY_CAMPAIGN_VALUE_PATTERN.test(inspected) ||
    JWT_VALUE_PATTERN.test(inspected) ||
    UUID_VALUE_PATTERN.test(inspected) ||
    SSN_VALUE_PATTERN.test(inspected) ||
    (PHONE_VALUE_PATTERN.test(inspected) &&
      phoneDigits.length >= 10 &&
      phoneDigits.length <= 15) ||
    /^\d{4,8}$/.test(inspected) ||
    (/^\d{9,19}$/.test(inspected) && phoneDigits.length === inspected.length) ||
    /^[a-f\d]{24,}$/i.test(inspected) ||
    containsHighEntropyOpaqueRun(inspected)
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

function safeDecodedSegment(segment: string) {
  try {
    return decodeURIComponent(segment).toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Protected links may put a one-time value in the path instead of the query.
 * Keep only the stable route name; ordinary public paths remain untouched.
 */
function sanitizePathname(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return pathname;

  const first = safeDecodedSegment(segments[0]);
  if (first === "api" && safeDecodedSegment(segments[1] ?? "") === "auth") {
    const action = safeDecodedSegment(segments[2] ?? "");
    const suffix = PROTECTED_ROUTE_SEGMENTS.auth.has(action)
      ? `/${segments[2]}`
      : "";
    return `/api/auth${suffix}`;
  }

  const allowedChildren = PROTECTED_ROUTE_SEGMENTS[first];
  if (allowedChildren) {
    const child = safeDecodedSegment(segments[1] ?? "");
    const suffix = allowedChildren.has(child) ? `/${segments[1]}` : "";
    return `/${segments[0]}${suffix}`;
  }

  if (PROTECTED_TOP_LEVEL_ROUTES.has(first)) return `/${segments[0]}`;
  return pathname;
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
    url.pathname = sanitizePathname(url.pathname);
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

  return value
    .replace(EMBEDDED_URL_PATTERN, (url) => sanitizeAnalyticsUrl(url))
    .replace(EMBEDDED_PROTECTED_PATH_PATTERN, (_, prefix, path) => {
      const normalized = path.startsWith("/") ? path : `/${path}`;
      return `${prefix}${sanitizeAnalyticsUrl(normalized)}`;
    });
}

function scrubTelemetryValue(
  value: unknown,
  active: WeakSet<object>,
  completed: WeakMap<object, unknown>,
  depth: number,
  fieldKey = "",
): unknown {
  if (typeof value === "string") {
    return URL_FIELD_KEY_PATTERN.test(fieldKey)
      ? sanitizeAnalyticsUrl(value)
      : sanitizeTelemetryString(value);
  }
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "object") return null;
  if (depth > 32) return null;

  try {
    if (typeof URL !== "undefined" && value instanceof URL) {
      return sanitizeAnalyticsUrl(value.toString());
    }
  } catch {
    return {};
  }

  if (active.has(value)) return null;
  const existing = completed.get(value);
  if (existing) return existing;
  active.add(value);

  let isArray = false;
  try {
    isArray = Array.isArray(value);
  } catch {
    active.delete(value);
    return {};
  }

  if (isArray) {
    let length = 0;
    try {
      const descriptor = Object.getOwnPropertyDescriptor(value, "length");
      length = Math.min(Number(descriptor?.value) || 0, 10_000);
    } catch {
      active.delete(value);
      return [];
    }

    const copy = new Array<unknown>(length);
    completed.set(value, copy);
    for (let index = 0; index < length; index += 1) {
      try {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (descriptor && "value" in descriptor) {
          copy[index] = scrubTelemetryValue(
            descriptor.value,
            active,
            completed,
            depth + 1,
          );
        }
      } catch {
        copy[index] = null;
      }
    }
    active.delete(value);
    return copy;
  }

  const copy: Record<string, unknown> = {};
  completed.set(value, copy);
  let keys: string[];
  try {
    keys = Object.keys(value).slice(0, 10_000);
  } catch {
    active.delete(value);
    return copy;
  }

  for (const key of keys) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    let descriptor: PropertyDescriptor | undefined;
    try {
      descriptor = Object.getOwnPropertyDescriptor(value, key);
    } catch {
      continue;
    }
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      continue;
    }
    const item = descriptor.value;
    if (isCampaignPropertyKey(key)) {
      if (typeof item === "string" && isApprovedCampaignValue(item)) {
        copy[key] = item.trim();
      }
      continue;
    }
    copy[key] = scrubTelemetryValue(
      item,
      active,
      completed,
      depth + 1,
      key,
    );
  }
  active.delete(value);
  return copy;
}

/** Sanitize every URL-shaped string at the final telemetry boundary. */
export function sanitizeTelemetryPayload<T>(value: T): T {
  return scrubTelemetryValue(value, new WeakSet(), new WeakMap(), 0) as T;
}

/** PostHog `before_send` hook used for SDK/autocapture and replay events. */
export function sanitizePostHogCaptureResult<T>(capture: T): T {
  return capture === null ? capture : sanitizeTelemetryPayload(capture);
}

/** Sentry hook used for errors, transactions, and breadcrumbs. */
export function sanitizeSentryEvent<T>(event: T): T {
  return sanitizeTelemetryPayload(event);
}
