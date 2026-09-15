import assert from "node:assert/strict";
import fs from "node:fs";

const posthog = fs.readFileSync("src/lib/posthog.ts", "utf8");
const pageView = fs.readFileSync("src/components/PostHogPageView.tsx", "utf8");
const route = fs.readFileSync(
  "src/app/api/analytics/mailer-scans/route.ts",
  "utf8",
);
const metric = fs.readFileSync("src/lib/mailerScan.ts", "utf8");
const policy = fs.readFileSync("src/lib/mailerScanPolicy.ts", "utf8");

assert.match(posthog, /getBrowserPostHog\(\)\?\.capture/);
assert.doesNotMatch(posthog, /sendDirectPostHogEvent|getDistinctId/);
assert.match(pageView, /MAILER_SCAN_SESSION_KEY/);
assert.match(pageView, /eddm_qr_landed|MAILER_SCAN_EVENT/);
assert.match(pageView, /\/api\/analytics\/mailer-scans/);
assert.match(route, /buildMailerScanUpdate/);
assert.match(route, /requestHeadersCameFromThisSite/);
assert.match(metric, /isMailerQrCampaign/);
assert.match(policy, /Access-Control-Allow-Origin/);
assert.match(policy, /riabuilder\.dvo88\.com/);
assert.match(policy, /bot\|crawler\|spider\|headless/i);

console.log(
  "Mailer scan contract uses the initialized PostHog client, one session receipt, bot filtering, an aggregate-only counter, and RIA Builder-only read CORS.",
);
