import assert from "node:assert/strict";
import {
  resolveCampaignAttribution,
  resolveCleanRootLaunchAttribution,
} from "../src/lib/campaignAttribution.ts";
import { isApprovedMailerCampaign } from "../src/lib/mailerScanPolicy.ts";
import {
  hasSelfTestCookie,
  readSelfTestQueryValue,
} from "../src/lib/selfTestTraffic.ts";

const launchUtms = {
  utm_source: "eddm",
  utm_medium: "print",
  utm_campaign: "launch_5k",
  utm_content: "qr_code",
};

const cleanRoot = resolveCleanRootLaunchAttribution("", {
  pathname: "/",
  referrer: "",
  origin: "https://youarepayingtoomuch.com",
});
assert.deepEqual(cleanRoot, {
  ...launchUtms,
  campaign_attribution_method: "clean_root_launch",
  is_eddm_visitor: true,
  legacy_eddm_qr: false,
});
assert.equal(isApprovedMailerCampaign(cleanRoot), true);
assert.equal(
  resolveCampaignAttribution(""),
  null,
  "explicit/legacy resolver stays null on the clean root so stored attribution is not overwritten after URL cleanup",
);

const selfTestRoot = resolveCleanRootLaunchAttribution("selftest=1", {
  pathname: "/",
});
assert.equal(selfTestRoot?.campaign_attribution_method, "clean_root_launch");

assert.equal(
  resolveCleanRootLaunchAttribution("", { pathname: "/become-a-client" }),
  null,
);
assert.equal(
  resolveCleanRootLaunchAttribution("portfolio=500000", { pathname: "/" }),
  null,
);
assert.equal(
  resolveCleanRootLaunchAttribution("", {
    pathname: "/",
    referrer: "https://www.google.com/search?q=fees",
    origin: "https://youarepayingtoomuch.com",
  }),
  null,
  "search-engine homepage landings must not count as mailed QR scans",
);
assert.equal(
  resolveCleanRootLaunchAttribution("", {
    pathname: "/",
    referrer: "https://youarepayingtoomuch.com/become-a-client",
    origin: "https://youarepayingtoomuch.com",
  }),
  null,
  "same-origin clicks must not count as mailed QR scans",
);

const legacy = resolveCampaignAttribution(
  "portfolio=1000000&years=20&growth=8&fee=1",
);
assert.deepEqual(legacy, {
  ...launchUtms,
  campaign_attribution_method: "legacy_qr_signature",
  is_eddm_visitor: true,
  legacy_eddm_qr: true,
});
assert.equal(isApprovedMailerCampaign(legacy), true);

const unapproved = resolveCampaignAttribution("utm_source=google");
assert.deepEqual(unapproved, {
  utm_source: "google",
  campaign_attribution_method: "explicit_utm",
  is_eddm_visitor: false,
  legacy_eddm_qr: false,
});
assert.equal(isApprovedMailerCampaign(unapproved), false);
assert.equal(
  resolveCleanRootLaunchAttribution("utm_source=google", { pathname: "/" }),
  null,
);

const approvedExplicit = resolveCampaignAttribution(
  "utm_source=eddm&utm_medium=print&utm_campaign=launch_5k&utm_content=qr_code",
);
assert.equal(approvedExplicit?.campaign_attribution_method, "explicit_utm");
assert.equal(isApprovedMailerCampaign(approvedExplicit), true);

assert.equal(readSelfTestQueryValue("selftest=1"), "1");
assert.equal(readSelfTestQueryValue("selftest=true"), "1");
assert.equal(readSelfTestQueryValue("selftest=0"), "0");
assert.equal(readSelfTestQueryValue(""), null);
assert.equal(hasSelfTestCookie("yapt_selftest=1"), true);
assert.equal(hasSelfTestCookie("other=1; yapt_selftest=1; theme=dark"), true);
assert.equal(hasSelfTestCookie("yapt_selftest=0"), false);
assert.equal(hasSelfTestCookie(""), false);

console.log(
  "Clean-root launch, legacy printer-proof, and full EDDM UTMs attribute as launch_5k; unapproved UTMs, search, and on-site clicks do not; selftest flags parse without an IP list.",
);
