import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildTrackedCtaProperties } from "../src/lib/ctaAnalytics.ts";
import {
  sanitizePostHogCaptureResult,
  sanitizePostHogNetworkRequest,
  sanitizePostHogProperties,
  sanitizeSentryEvent,
} from "../src/lib/telemetryPrivacy.ts";

const properties = buildTrackedCtaProperties({
  href: "mailto:?subject=Results&body=Portfolio%20%241%2C000%2C000%20portfolio%3D1000000%26fee%3D1",
  label: "Email results",
  location: "share_results",
  opensNewTab: false,
  redactQuery: false,
});

assert.deepEqual(properties, {
  cta_label: "Email results",
  cta_href: "mailto:",
  cta_host: "",
  cta_path: "",
  cta_location: "share_results",
  opens_new_tab: false,
});
const serialized = JSON.stringify(properties);
assert.doesNotMatch(serialized, /1,?000,?000|subject=|body=|portfolio=|fee=/i);

const safePostHog = sanitizePostHogProperties({
  $current_url:
    "https://youarepayingtoomuch.com/?portfolio=2500123&years=31&growth=7.25&fee=1.1&utm_source=eddm&utm_campaign=launch_5k",
  site_domain: "youarepayingtoomuch.com",
  site_path: "/",
  experience_mode: "marketing",
  first_changed_field: "portfolioValue",
  portfolio_value: 2500123,
  annual_fee_percent: 1.1,
  annual_growth_percent: 7.25,
  years: 31,
  projected_savings: 765432,
  email: "private@example.test",
});
assert.deepEqual(safePostHog, {
  $current_url:
    "https://youarepayingtoomuch.com/?utm_source=eddm&utm_campaign=launch_5k",
  site_domain: "youarepayingtoomuch.com",
  site_path: "/",
  experience_mode: "marketing",
  first_changed_field: "portfolioValue",
});

const safeAutoCapture = sanitizePostHogCaptureResult({
  event: "$pageleave",
  properties: {
    token: "public-project-token",
    distinct_id: "anonymous-browser-id",
    $session_id: "anonymous-session-id",
    $current_url:
      "https://youarepayingtoomuch.com/?portfolio=2500123&fee=1.1&utm_source=eddm",
    $referrer: "$direct",
    $ip: "192.0.2.44",
    email: "private@example.test",
  },
});
assert.deepEqual(safeAutoCapture, {
  event: "$pageleave",
  properties: {
    token: "public-project-token",
    distinct_id: "anonymous-browser-id",
    $session_id: "anonymous-session-id",
    $current_url:
      "https://youarepayingtoomuch.com/?utm_source=eddm",
    $referrer: "$direct",
  },
});

assert.deepEqual(
  sanitizePostHogNetworkRequest({
    name: "https://youarepayingtoomuch.com/api/example?portfolio=2500123&utm_source=eddm",
    entryType: "resource",
    startTime: 1,
    duration: 2,
    requestHeaders: { authorization: "Bearer private" },
    requestBody: '{"email":"private@example.test"}',
    responseHeaders: { "set-cookie": "private" },
    responseBody: '{"portfolio":2500123}',
  }),
  {
    name: "https://youarepayingtoomuch.com/api/example?utm_source=eddm",
    entryType: "resource",
    startTime: 1,
    duration: 2,
    requestHeaders: {},
    requestBody: null,
    responseHeaders: {},
    responseBody: null,
  },
);

const safeSentry = sanitizeSentryEvent({
  request: {
    url: "https://youarepayingtoomuch.com/?portfolio=2500123&fee=1.1&utm_source=eddm",
    data: { email: "private@example.test", portfolioValue: 2500123 },
    headers: {
      "x-forwarded-for": "192.0.2.44",
      "x-real-ip": "2001:db8::44",
    },
    env: { REMOTE_ADDR: "192.0.2.44" },
  },
  user: { ip_address: "192.0.2.44" },
  message: "calculator render failed from 192.0.2.44 and 2001:db8::44",
  debug_meta: {
    images: [{ code_file: "webpack:///_next/static/chunks/app.js?dpl=release" }],
  },
  exception: {
    values: [{
      stacktrace: {
        frames: [{
          abs_path: "webpack:///_next/static/chunks/app.js?dpl=release",
          filename: "src/components/CostAnalysisCalculator.tsx",
          context_line: "capturePostHogEvent(eventName, properties)",
        }],
      },
    }],
  },
});
const safeSentrySerialized = JSON.stringify(safeSentry);
assert.doesNotMatch(
  safeSentrySerialized,
  /private@example\.test|192\.0\.2\.44|2001:db8::44|2500123|portfolio=|fee=|portfolioValue/,
);
assert.match(safeSentrySerialized, /calculator render failed/);
assert.equal(
  safeSentry.debug_meta.images[0].code_file,
  "webpack:///_next/static/chunks/app.js?dpl=release",
);
assert.equal(
  safeSentry.exception.values[0].stacktrace.frames[0].abs_path,
  "webpack:///_next/static/chunks/app.js?dpl=release",
);
assert.equal(
  safeSentry.exception.values[0].stacktrace.frames[0].context_line,
  "capturePostHogEvent(eventName, properties)",
);

const [clientSentry, serverSentry, edgeSentry, postHogProvider, calculator] =
  await Promise.all([
    readFile(new URL("../src/instrumentation-client.ts", import.meta.url), "utf8"),
    readFile(new URL("../sentry.server.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../sentry.edge.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/PostHogProvider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/CostAnalysisCalculator.tsx", import.meta.url), "utf8"),
  ]);

for (const source of [clientSentry, serverSentry, edgeSentry]) {
  assert.match(source, /sendDefaultPii:\s*false/);
  assert.match(source, /beforeSend:\s*sanitizeSentryEvent/);
  assert.match(source, /beforeSendTransaction:\s*sanitizeSentryEvent/);
}
assert.match(clientSentry, /tracesSampleRate:[^\n]*0\.1/);
assert.match(clientSentry, /replaysSessionSampleRate:\s*0\.1/);
assert.match(clientSentry, /replaysOnErrorSampleRate:\s*1\.0/);
assert.match(clientSentry, /replayIntegration\(\{[\s\S]*maskAllText:\s*true/);
assert.match(clientSentry, /blockAllMedia:\s*true/);
assert.match(serverSentry, /tracesSampleRate:\s*0\.2/);
assert.match(edgeSentry, /tracesSampleRate:\s*0\.2/);

assert.match(postHogProvider, /maskAllInputs:\s*true/);
assert.match(postHogProvider, /maskTextSelector:\s*["']\*["']/);
assert.match(postHogProvider, /mask_all_text:\s*true/);
assert.match(postHogProvider, /mask_all_element_attributes:\s*true/);
assert.match(postHogProvider, /before_send:\s*sanitizePostHogCaptureResult/);
assert.match(postHogProvider, /maskCapturedNetworkRequestFn:\s*sanitizePostHogNetworkRequest/);

const analyticsCalls = calculator.match(
  /capturePostHogEvent\([\s\S]*?\n\s*\}\);/g,
) ?? [];
assert.ok(analyticsCalls.length >= 3);
for (const call of analyticsCalls) {
  assert.doesNotMatch(
    call,
    /calculated_asset_tier|portfolio_value|annual_fee_percent|mutual_fund_expense_percent|total_annual_fee_percent|annual_growth_percent|\byears:|projected_savings|projected_total_/,
  );
}

const analyticsContract = JSON.parse(
  await readFile(
    new URL("../docs/analytics-event-contract.json", import.meta.url),
    "utf8",
  ),
);
const contractEventNames = analyticsContract.events.map((event) => event.name);
for (const requiredName of [
  "$pageview",
  "eddm_qr_landed",
  "calculator_started",
  "calculator_submitted",
  "cta_clicked",
  "firm_site_viewed",
  "calculator_cta_clicked",
  "intro_call_clicked",
  "verify_firm_clicked",
  "contact_clicked",
]) {
  assert.ok(contractEventNames.includes(requiredName), `${requiredName} must remain in the shared contract`);
}
const calculatorContract = analyticsContract.events.filter((event) =>
  ["calculator_started", "calculator_submitted"].includes(event.name),
);
assert.equal(calculatorContract.length, 2);
assert.doesNotMatch(
  JSON.stringify(calculatorContract),
  /calculated_asset_tier|portfolio_value|annual_fee_percent|mutual_fund_expense_percent|total_annual_fee_percent|annual_growth_percent|\byears\b|projected_savings|projected_total_/,
);

console.log("Mailto CTA analytics properties are fully redacted — OK");
