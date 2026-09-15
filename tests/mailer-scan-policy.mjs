import assert from "node:assert/strict";
import {
  ALLOWED_MAILER_ATTRIBUTION_METHODS,
  RIA_BUILDER_ORIGIN,
  buildMailerScanUpdate,
  isApprovedMailerCampaign,
  isLikelyBotUserAgent,
  publicMailerScanHeaders,
  requestHeadersCameFromThisSite,
} from "../src/lib/mailerScanPolicy.ts";

const approvedExplicitCampaign = {
  utm_source: "eddm",
  utm_medium: "print",
  utm_campaign: "launch_5k",
  utm_content: "qr_code",
  campaign_attribution_method: "explicit_utm",
  legacy_eddm_qr: false,
};

assert.equal(isApprovedMailerCampaign(approvedExplicitCampaign), true);
assert.equal(
  isApprovedMailerCampaign({
    utm_source: "eddm",
    campaign_attribution_method: "explicit_utm",
    legacy_eddm_qr: false,
  }),
  false,
  "a loose or test utm_source must not count as the approved mailing",
);
assert.equal(
  isApprovedMailerCampaign({
    campaign_attribution_method: "legacy_qr_signature",
    legacy_eddm_qr: true,
  }),
  true,
);

assert.equal(ALLOWED_MAILER_ATTRIBUTION_METHODS.has("explicit_utm"), true);
assert.equal(ALLOWED_MAILER_ATTRIBUTION_METHODS.has("unknown"), false);
assert.equal(isLikelyBotUserAgent("HeadlessChrome launch proof"), true);
assert.equal(isLikelyBotUserAgent("Mobile Safari"), false);

const sameOriginHeaders = new Headers({
  host: "youarepayingtoomuch.com",
  origin: "https://youarepayingtoomuch.com",
  "sec-fetch-site": "same-origin",
});
assert.equal(requestHeadersCameFromThisSite(sameOriginHeaders), true);

const forwardedSameOriginHeaders = new Headers({
  host: "internal.vercel.app",
  "x-forwarded-host": "youarepayingtoomuch.com",
  origin: "https://youarepayingtoomuch.com",
  "sec-fetch-site": "same-origin",
});
assert.equal(requestHeadersCameFromThisSite(forwardedSameOriginHeaders), true);

const crossSiteHeaders = new Headers({
  host: "youarepayingtoomuch.com",
  origin: "https://example.com",
  "sec-fetch-site": "cross-site",
});
assert.equal(requestHeadersCameFromThisSite(crossSiteHeaders), false);

assert.deepEqual(publicMailerScanHeaders(), {
  "Access-Control-Allow-Origin": RIA_BUILDER_ORIGIN,
  "Cache-Control": "no-store, max-age=0",
  Vary: "Origin",
});

const increment = (value) => ({ increment: value });
const serverTimestamp = () => ({ serverTimestamp: true });
const update = buildMailerScanUpdate(
  "explicit_utm",
  increment,
  serverTimestamp,
);
assert.deepEqual(update, {
  count: { increment: 1 },
  lastScanAt: { serverTimestamp: true },
  byAttribution: {
    explicit_utm: { increment: 1 },
  },
});
assert.equal("byAttribution.explicit_utm" in update, false);

console.log(
  "Mailer scan policy accepts only the approved campaign, rejects bots/cross-site posts, publishes RIA-only CORS, and builds a nested Firestore attribution map.",
);
