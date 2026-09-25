const SAFE_UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;
const SAFE_UTM_KEY_SET = new Set<string>(SAFE_UTM_KEYS);

const POSTHOG_ALLOWED_PROPERTIES = new Set([
  "$current_url",
  "$host",
  "site_domain",
  "site_path",
  "site_origin",
  "first_landing_url",
  "first_landing_domain",
  "campaign_attribution_method",
  "is_eddm_visitor",
  "legacy_eddm_qr",
  "scan_kind",
  "changed_fields",
  "first_changed_field",
  "experience_mode",
  "marketing_variant",
  "submission_type",
  "cta_label",
  "cta_href",
  "cta_host",
  "cta_path",
  "cta_location",
  "cta_type",
  "opens_new_tab",
  "poll",
  "option",
  ...SAFE_UTM_KEYS,
  ...SAFE_UTM_KEYS.map((key) => `first_${key}`),
]);

const SENSITIVE_FIELD_PATTERN = /(?:account|answer|asset|assumption|authorization|balance|cookie|credential|email|fee|growth|ipAddress|phone|portfolio|rate|recipient|saving|ssn|year)|(?:^|_)(?:ip|token)(?:_|$)|(?:apiKey|idToken|linkToken|oobCode|verificationCode)$/i;
const SENSITIVE_NETWORK_FIELD_PATTERN = /^(?:cf-connecting-ip|forwarded|remote_addr|x-forwarded-for|x-real-ip|x-vercel-forwarded-for)$/i;
const EMAIL_PATTERN = /\b[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9.-]{0,251}[A-Z0-9])?\.[A-Z]{2,63}\b/gi;
const PHONE_PATTERN = /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}\b/g;
const IPV4_PATTERN = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
const IPV6_PATTERN = /(?<![\w:])(?:[A-F0-9]{0,4}:){2,7}[A-F0-9]{0,4}(?![\w:])/gi;
const PRESERVED_SENTRY_FRAME_FIELDS = new Set([
  "abs_path",
  "filename",
  "context_line",
  "pre_context",
  "post_context",
  "code_file",
]);

function redactSensitiveText(value: string) {
  return value
    .replace(EMAIL_PATTERN, "[Filtered email]")
    .replace(PHONE_PATTERN, "[Filtered phone]")
    .replace(IPV4_PATTERN, "[Filtered IP]")
    .replace(IPV6_PATTERN, "[Filtered IP]");
}

export function sanitizeTelemetryUrl(value: string) {
  const isAbsoluteHttp = /^https?:\/\//i.test(value);
  const isRelativePath = value.startsWith("/");
  const isContactUrl = /^(?:mailto|tel):/i.test(value);
  if (!isAbsoluteHttp && !isRelativePath && !isContactUrl) {
    return redactSensitiveText(value);
  }

  try {
    const url = new URL(value, "https://youarepayingtoomuch.com");
    if (url.protocol === "mailto:" || url.protocol === "tel:") {
      return url.protocol;
    }

    const isLoopback = ["127.0.0.1", "localhost", "[::1]"].includes(
      url.hostname.toLowerCase(),
    );
    const hostIsIp =
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname) ||
      url.hostname.includes(":");
    if (hostIsIp && !isLoopback) {
      url.hostname = "youarepayingtoomuch.com";
      url.port = "";
    }
    url.username = "";
    url.password = "";

    const safeSearch = new URLSearchParams();
    url.searchParams.forEach((rawValue, key) => {
      if (SAFE_UTM_KEY_SET.has(key.toLowerCase())) {
        safeSearch.set(key.toLowerCase(), redactSensitiveText(rawValue));
      }
    });
    url.search = safeSearch.toString();
    url.hash = "";
    return isRelativePath ? `${url.pathname}${url.search}` : url.toString();
  } catch {
    return "[Filtered URL]";
  }
}

export function sanitizePostHogProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  const safeProperties: Record<string, unknown> = {};
  Object.entries(properties).forEach(([key, value]) => {
    if (!POSTHOG_ALLOWED_PROPERTIES.has(key)) return;
    if (key === "$current_url" || key === "first_landing_url" || key === "cta_href") {
      if (typeof value === "string") safeProperties[key] = sanitizeTelemetryUrl(value);
      return;
    }
    if (typeof value === "string") safeProperties[key] = redactSensitiveText(value);
    if (typeof value === "boolean") safeProperties[key] = value;
    if (Array.isArray(value)) {
      safeProperties[key] = value
        .filter((item): item is string => typeof item === "string")
        .map(redactSensitiveText);
    }
  });
  return safeProperties;
}

function scrubPostHogCaptureProperties(
  properties: Record<string, unknown>,
  depth = 0,
): Record<string, unknown> {
  if (depth > 8) return {};
  const safeProperties: Record<string, unknown> = {};
  Object.entries(properties).forEach(([key, value]) => {
    if (
      key === "$ip" ||
      (key !== "token" && SENSITIVE_FIELD_PATTERN.test(key))
    ) return;
    if (/url|href|referrer/i.test(key) && typeof value === "string") {
      safeProperties[key] = sanitizeTelemetryUrl(value);
      return;
    }
    if (typeof value === "string") {
      safeProperties[key] = redactSensitiveText(value);
      return;
    }
    if (Array.isArray(value)) {
      safeProperties[key] = value.map((item) =>
        item !== null && typeof item === "object"
          ? scrubPostHogCaptureProperties(item as Record<string, unknown>, depth + 1)
          : typeof item === "string"
            ? redactSensitiveText(item)
            : item,
      );
      return;
    }
    if (value !== null && typeof value === "object") {
      safeProperties[key] = scrubPostHogCaptureProperties(
        value as Record<string, unknown>,
        depth + 1,
      );
      return;
    }
    safeProperties[key] = value;
  });
  return safeProperties;
}

export function sanitizePostHogCaptureResult<
  T extends { properties?: Record<string, unknown> },
>(captureResult: T | null): T | null {
  if (!captureResult?.properties) return captureResult;
  return {
    ...captureResult,
    properties: scrubPostHogCaptureProperties(captureResult.properties),
  };
}

export function sanitizePostHogNetworkRequest<
  T extends {
    name?: string;
    requestHeaders?: unknown;
    requestBody?: string | null;
    responseHeaders?: unknown;
    responseBody?: string | null;
  },
>(request: T): T {
  return {
    ...request,
    ...(typeof request.name === "string"
      ? { name: sanitizeTelemetryUrl(request.name) }
      : {}),
    requestHeaders: {},
    requestBody: null,
    responseHeaders: {},
    responseBody: null,
  };
}

function scrubSentryValue(
  value: unknown,
  depth = 0,
  path: string[] = [],
): unknown {
  const key = path[path.length - 1] ?? "";
  if (path[0] === "debug_meta" || PRESERVED_SENTRY_FRAME_FIELDS.has(key)) {
    return value;
  }
  if (typeof value === "string") {
    const redacted = redactSensitiveText(value);
    if (/url|href|referrer/i.test(key) && /^(?:https?:\/\/|\/)/i.test(redacted)) {
      return sanitizeTelemetryUrl(redacted);
    }
    return redacted;
  }
  if (value === null || typeof value !== "object" || depth > 8) return value;
  if (Array.isArray(value)) {
    return value.map((item) => scrubSentryValue(item, depth + 1, path));
  }

  const safeObject: Record<string, unknown> = {};
  Object.entries(value).forEach(([childKey, item]) => {
    if (
      SENSITIVE_FIELD_PATTERN.test(childKey) ||
      SENSITIVE_NETWORK_FIELD_PATTERN.test(childKey)
    ) return;
    safeObject[childKey] = scrubSentryValue(
      item,
      depth + 1,
      [...path, childKey],
    );
  });
  return safeObject;
}

export function sanitizeSentryEvent<T>(event: T): T {
  return scrubSentryValue(event, 0, []) as T;
}
