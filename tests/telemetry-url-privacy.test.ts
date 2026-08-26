import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  isApprovedCampaignValue,
  sanitizeAnalyticsUrl,
  sanitizePostHogCaptureResult,
  sanitizeSentryEvent,
  sanitizeTelemetryPayload,
} from "../src/lib/telemetryPrivacy.ts";
import {
  appendCampaignAttributionToFirmHref,
  resolveCampaignAttribution,
  sanitizeStoredCampaignAttribution,
  shouldOpenCalculatorForEddmQr,
} from "../src/lib/campaignAttribution.ts";

const SENSITIVE_QUERY = new URLSearchParams({
  email: "prospect@example.com",
  verification: "verified-secret",
  code: "654321",
  token: "bearer-secret",
  invite: "household-invite",
  answer: "personal-answer",
  story: "personal-story",
  provider: "private-provider",
  session: "private-session",
  unknown_sensitive_key: "must-not-survive",
  utm_source: "eddm",
  utm_medium: "print",
  utm_campaign: "launch_5k",
  utm_content: "qr_code",
  utm_term: "fairfield_county",
});

test("onboarding and auth URLs retain only approved campaign attribution", () => {
  const sanitized = sanitizeAnalyticsUrl(
    `https://youarepayingtoomuch.com/onboarding/verify?${SENSITIVE_QUERY}#session-token`,
  );
  const url = new URL(sanitized);

  assert.equal(url.pathname, "/onboarding/verify");
  assert.equal(url.hash, "");
  assert.deepEqual(Array.from(url.searchParams.keys()), [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ]);
  assert.equal(url.searchParams.get("utm_source"), "eddm");
  assert.equal(url.searchParams.get("utm_campaign"), "launch_5k");
  assert.doesNotMatch(sanitized, /prospect|verified-secret|654321|bearer-secret|household-invite|personal-answer|personal-story|private-provider|private-session|unknown_sensitive_key/);
});

test("unknown query keys and fragments collapse a relative URL to path plus approved UTM keys", () => {
  assert.equal(
    sanitizeAnalyticsUrl(
      "/start?mystery=private&utm_source=eddm&utm_campaign=launch_5k#invite",
    ),
    "/start?utm_source=eddm&utm_campaign=launch_5k",
  );
  assert.equal(sanitizeAnalyticsUrl("/start#token=private"), "/start");
});

test("canonical calculator attribution survives while calculator state stays out of telemetry URLs", () => {
  const raw =
    "https://youarepayingtoomuch.com/?portfolio=1000000&years=20&growth=8&fee=1&variant=direct-mail&utm_source=eddm&utm_medium=print&utm_campaign=launch_5k&utm_content=qr_code";
  const sanitized = sanitizeAnalyticsUrl(raw);
  const url = new URL(sanitized);

  assert.equal(url.searchParams.get("utm_source"), "eddm");
  assert.equal(url.searchParams.get("utm_medium"), "print");
  assert.equal(url.searchParams.get("utm_campaign"), "launch_5k");
  assert.equal(url.searchParams.get("utm_content"), "qr_code");
  assert.equal(url.searchParams.has("portfolio"), false);
  assert.equal(url.searchParams.has("years"), false);
  assert.equal(url.searchParams.has("growth"), false);
  assert.equal(url.searchParams.has("fee"), false);
  assert.equal(url.searchParams.has("variant"), false);
  assert.match(raw, /portfolio=1000000&years=20&growth=8&fee=1/);
});

test("the recursive PostHog/Sentry boundary sanitizes URL properties and embedded URLs", () => {
  const capture = {
    event: "$pageview",
    properties: {
      $current_url:
        "https://youarepayingtoomuch.com/onboarding/story?answer=private&utm_source=eddm#draft",
      cta_href: "mailto:prospect@example.com?subject=Private",
      breadcrumbs: [
        {
          message:
            "Navigated to /onboarding/invite?invite=secret&utm_campaign=launch_5k#code",
          data: {
            to: "/auth/callback?provider=private&code=123&utm_medium=print#token",
          },
        },
      ],
      arbitrary_context: {
        retry_message:
          "Retry https://api-user:api-pass@youarepayingtoomuch.com/secure-link?token=secret&code=123&email=prospect%40example.com&unknown=drop&utm_content=qr_code#verification",
        bare_relative:
          "auth/callback?token=secret&utm_source=eddm#verification",
      },
      utm_source: "prospect@example.com",
      first_utm_campaign: "launch_5k",
    },
  };

  for (const sanitized of [
    sanitizeTelemetryPayload(capture),
    sanitizePostHogCaptureResult(capture),
    sanitizeSentryEvent(capture),
  ]) {
    const serialized = JSON.stringify(sanitized);
    assert.doesNotMatch(serialized, /private|secret|api-user|api-pass|prospect(?:%40|@)example\.com|code=123|unknown=drop|#draft|#code|#token|#verification/);
    assert.match(serialized, /utm_source=eddm/);
    assert.match(serialized, /utm_campaign=launch_5k/);
    assert.match(serialized, /utm_medium=print/);
    assert.match(serialized, /utm_content=qr_code/);
    assert.equal(sanitized.properties.cta_href, "mailto:");
    assert.equal("utm_source" in sanitized.properties, false);
    assert.equal(sanitized.properties.first_utm_campaign, "launch_5k");
  }
});

test("mailto, sms, and tel URLs collapse to their bare scheme", () => {
  assert.equal(sanitizeAnalyticsUrl("mailto:prospect@example.com?subject=Private"), "mailto:");
  assert.equal(sanitizeAnalyticsUrl("sms:+12035550123?body=Invite%20code"), "sms:");
  assert.equal(sanitizeAnalyticsUrl("tel:+12035550123"), "tel:");
});

test("email-shaped campaign values fail closed instead of becoming approved URL data", () => {
  const sanitized = sanitizeAnalyticsUrl(
    "https://youarepayingtoomuch.com/start?utm_source=prospect%40example.com&utm_campaign=launch_5k",
  );
  const url = new URL(sanitized);
  assert.equal(url.searchParams.has("utm_source"), false);
  assert.equal(url.searchParams.get("utm_campaign"), "launch_5k");
});

test("ordinary error messages are not mistaken for URL schemes", () => {
  assert.equal(
    sanitizeTelemetryPayload("TypeError: onboarding request failed"),
    "TypeError: onboarding request failed",
  );
});

test("both direct capture and the PostHog SDK use the final sanitizer boundary", () => {
  const directSource = readFileSync(
    new URL("../src/lib/posthog.ts", import.meta.url),
    "utf8",
  );
  const sdkSource = readFileSync(
    new URL("../src/components/PostHogProvider.tsx", import.meta.url),
    "utf8",
  );

  assert.match(directSource, /const safeProperties = sanitizeTelemetryPayload\(/);
  assert.match(
    directSource,
    /getPostHogCampaignProperties\(window\.location\.href\)/,
    "the direct path must resolve the legacy QR before sanitizing the outgoing URL",
  );
  assert.match(sdkSource, /before_send: sanitizePostHogCaptureResult/);
  assert.match(sdkSource, /save_campaign_params: false/);
  assert.match(sdkSource, /disable_session_recording: true/);
});

test("protected dynamic paths collapse without changing ordinary public paths", () => {
  const protectedCases = new Map([
    [
      "/onboarding/verify/654321/prospect%40example.com?utm_source=eddm",
      "/onboarding/verify?utm_source=eddm",
    ],
    [
      "/auth/callback/eyJhbGciOiJIUzI1NiJ9.private.signature?utm_medium=print",
      "/auth/callback?utm_medium=print",
    ],
    ["/invite/household-secret", "/invite"],
    ["/api/auth/verify/one-time-code", "/api/auth/verify"],
  ]);

  protectedCases.forEach((expected, input) => {
    assert.equal(sanitizeAnalyticsUrl(input), expected);
  });
  assert.equal(
    sanitizeAnalyticsUrl("/learn/retirement-planning/2026?utm_campaign=fall_launch"),
    "/learn/retirement-planning/2026?utm_campaign=fall_launch",
  );
  assert.equal(
    sanitizeTelemetryPayload(
      "Navigation failed at /auth/callback/one-time-secret before retry",
    ),
    "Navigation failed at /auth/callback before retry",
  );
  assert.equal(
    sanitizeTelemetryPayload(
      "Rejected onboarding/verify/prospect%40example.com during validation",
    ),
    "Rejected /onboarding/verify during validation",
  );
});

test("campaign values reject protected data while canonical and ordinary slugs survive", () => {
  for (const value of [
    "https://example.com/private",
    "example.com/private",
    "api-user:api-pass",
    "bearer_secret_token",
    "654321",
    "verification-code-654321",
    "invite_household",
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature123",
    "+1 (203) 555-0123",
    "123-45-6789",
    "A7f9K2mQ8vR4xT6zP1nC5bL0",
  ]) {
    assert.equal(isApprovedCampaignValue(value), false, value);
  }
  for (const value of [
    "eddm",
    "print",
    "launch_5k",
    "qr_code",
    "fairfield_county",
    "fall-retirement-planning",
  ]) {
    assert.equal(isApprovedCampaignValue(value), true, value);
  }

  const sanitized = new URL(
    sanitizeAnalyticsUrl(
      "https://youarepayingtoomuch.com/start?utm_source=%2B1%20(203)%20555-0123&utm_medium=print&utm_campaign=launch_5k&utm_content=https%3A%2F%2Fevil.example%2Ftoken",
    ),
  );
  assert.deepEqual(Array.from(sanitized.searchParams.entries()), [
    ["utm_medium", "print"],
    ["utm_campaign", "launch_5k"],
  ]);
});

test("campaign ingestion, storage inputs, and firm forwarding share the safe-value gate", () => {
  const suspicious = new URLSearchParams({
    utm_source: "prospect@example.com",
    utm_medium: "print",
    utm_campaign: "eyJhbGciOiJIUzI1NiJ9.private.signature",
    utm_content: "+1 (203) 555-0123",
  });
  assert.deepEqual(resolveCampaignAttribution(suspicious), {
    utm_medium: "print",
    campaign_attribution_method: "explicit_utm",
    is_eddm_visitor: false,
    legacy_eddm_qr: false,
  });

  const forwarded = new URL(
    appendCampaignAttributionToFirmHref("https://smarterwaywealth.com/start", {
      utm_source: "eddm",
      utm_medium: "print",
      utm_campaign: "verification-code-654321",
      utm_content: "qr_code",
      utm_term: "https://example.com/private",
    }),
  );
  assert.deepEqual(Array.from(forwarded.searchParams.entries()), [
    ["utm_source", "eddm"],
    ["utm_medium", "print"],
    ["utm_content", "qr_code"],
  ]);

  assert.deepEqual(
    sanitizeStoredCampaignAttribution({
      utm_source: "eddm",
      utm_medium: "print",
      utm_campaign: "bearer_secret_token",
      utm_content: "qr_code",
      campaign_attribution_method: "explicit_utm",
      is_eddm_visitor: false,
      legacy_eddm_qr: true,
    }),
    {
      utm_source: "eddm",
      utm_medium: "print",
      utm_content: "qr_code",
      campaign_attribution_method: "explicit_utm",
      is_eddm_visitor: true,
      legacy_eddm_qr: false,
    },
  );

  let getterCalled = false;
  const getterCampaign: Record<string, unknown> = { utm_source: "eddm" };
  Object.defineProperty(getterCampaign, "utm_campaign", {
    enumerable: true,
    get() {
      getterCalled = true;
      return "verification-code-654321";
    },
  });
  assert.equal(
    appendCampaignAttributionToFirmHref(
      "https://smarterwaywealth.com/start",
      getterCampaign,
    ),
    "https://smarterwaywealth.com/start?utm_source=eddm",
  );
  assert.equal(getterCalled, false);
});

test("legacy and canonical EDDM attribution remain exact after UTM hardening", () => {
  const legacy =
    "portfolio=1000000&years=20&growth=8&fee=1";
  const canonical =
    `${legacy}&variant=direct-mail&utm_source=eddm&utm_medium=print&utm_campaign=launch_5k&utm_content=qr_code`;

  assert.equal(shouldOpenCalculatorForEddmQr(legacy), true);
  assert.equal(shouldOpenCalculatorForEddmQr(canonical), true);
  assert.deepEqual(resolveCampaignAttribution(legacy), {
    utm_source: "eddm",
    utm_medium: "print",
    utm_campaign: "launch_5k",
    utm_content: "qr_code",
    campaign_attribution_method: "legacy_qr_signature",
    is_eddm_visitor: true,
    legacy_eddm_qr: true,
  });
  assert.deepEqual(resolveCampaignAttribution(canonical), {
    utm_source: "eddm",
    utm_medium: "print",
    utm_campaign: "launch_5k",
    utm_content: "qr_code",
    campaign_attribution_method: "explicit_utm",
    is_eddm_visitor: true,
    legacy_eddm_qr: false,
  });
});

test("non-plain, cyclic, getter, and inaccessible values fail closed and serialize", () => {
  class Context {
    callbackUrl =
      "https://youarepayingtoomuch.com/auth/callback/secret?code=private&utm_source=eddm";
  }

  let getterCalled = false;
  const payload: Record<string, unknown> = {
    context: new Context(),
    nested: {},
  };
  (payload.nested as Record<string, unknown>).parent = payload;
  Object.defineProperty(payload, "dangerousGetter", {
    enumerable: true,
    get() {
      getterCalled = true;
      return "https://example.com/?token=must-not-run";
    },
  });

  const revoked = Proxy.revocable({ secret: "private" }, {});
  revoked.revoke();
  payload.inaccessible = revoked.proxy;

  const sanitized = sanitizeTelemetryPayload(payload);
  const context = sanitized.context as Record<string, unknown>;
  const nested = sanitized.nested as Record<string, unknown>;
  assert.equal(getterCalled, false);
  assert.equal(
    context.callbackUrl,
    "https://youarepayingtoomuch.com/auth/callback?utm_source=eddm",
  );
  assert.equal(nested.parent, null);
  assert.deepEqual(sanitized.inaccessible, {});
  assert.doesNotThrow(() => JSON.stringify(sanitized));
  assert.doesNotMatch(JSON.stringify(sanitized), /secret|private|must-not-run/);
});
