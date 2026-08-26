import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  sanitizeAnalyticsUrl,
  sanitizePostHogCaptureResult,
  sanitizeSentryEvent,
  sanitizeTelemetryPayload,
} from "../src/lib/telemetryPrivacy.ts";

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
