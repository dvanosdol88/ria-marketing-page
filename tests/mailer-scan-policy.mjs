import assert from "node:assert/strict";
import {
  ALLOWED_MAILER_ATTRIBUTION_METHODS,
  RIA_BUILDER_ORIGIN,
  buildMailerScanUpdate,
  buildTrafficVisitUpdate,
  easternDayKey,
  isApprovedMailerCampaign,
  isLikelyBotUserAgent,
  publicMailerScanHeaders,
  requestHeadersCameFromThisSite,
  requestLooksAutomated,
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

assert.equal(
  isApprovedMailerCampaign({
    utm_source: "eddm",
    utm_medium: "print",
    utm_campaign: "launch_5k",
    utm_content: "qr_code",
    campaign_attribution_method: "clean_root_launch",
    legacy_eddm_qr: false,
  }),
  false,
  "05-54: a plain-homepage landing is never a mailer scan, even with inferred tags",
);
assert.equal(
  isApprovedMailerCampaign({
    campaign_attribution_method: "clean_root_launch",
    legacy_eddm_qr: false,
  }),
  false,
  "a plain-homepage landing is never a mailer scan",
);

assert.equal(ALLOWED_MAILER_ATTRIBUTION_METHODS.has("explicit_utm"), true);
assert.equal(ALLOWED_MAILER_ATTRIBUTION_METHODS.has("clean_root_launch"), false);
assert.equal(ALLOWED_MAILER_ATTRIBUTION_METHODS.has("legacy_qr_signature"), true);
assert.equal(ALLOWED_MAILER_ATTRIBUTION_METHODS.has("unknown"), false);
assert.equal(isLikelyBotUserAgent("HeadlessChrome launch proof"), true);
assert.equal(isLikelyBotUserAgent("Mobile Safari"), false);
assert.equal(
  requestLooksAutomated(new Headers({ "user-agent": "Mozilla/5.0 Mobile Safari", "accept-language": "en-US" })),
  false,
);
assert.equal(
  requestLooksAutomated(new Headers({ "user-agent": "Mozilla/5.0 Mobile Safari" })),
  true,
  "a browser fetch always carries Accept-Language",
);
assert.equal(requestLooksAutomated(new Headers({ "accept-language": "en" })), true);

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

assert.equal(easternDayKey(new Date("2026-09-23T02:30:00.000Z")), "2026-09-22");
const visitUpdate = buildTrafficVisitUpdate(
  "2026-09-22",
  increment,
  serverTimestamp,
);
assert.deepEqual(visitUpdate, {
  visits: { increment: 1 },
  lastVisitAt: { serverTimestamp: true },
  daily: {
    "2026-09-22": {
      visits: { increment: 1 },
    },
  },
});

assert.deepEqual(
  buildTrafficVisitUpdate("2026-10-08", increment, serverTimestamp, false),
  {
    lastVisitAt: { serverTimestamp: true },
    daily: { "2026-10-08": { visits: { increment: 1 } } },
  },
  "a returning visitor adds to the day, not to all-time unique visitors",
);

console.log(
  "Mailer scan policy accepts only the approved campaign, rejects bots/cross-site posts, publishes RIA-only CORS, and builds a nested Firestore attribution map.",
);
