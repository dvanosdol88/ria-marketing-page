/**
 * Blues traffic must not pollute YAPT analytics: pageviews use the address-bar
 * URL, and onepercentblues.com never increments the mailer visit counter.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildPageviewCurrentUrl } from "../src/lib/bluesAnalyticsHost.ts";
import { isBluesHostname } from "../src/lib/bluesHost.ts";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("onepercentblues.com and www are blues hosts, including a port or trailing dot", () => {
  assert.equal(isBluesHostname("onepercentblues.com"), true);
  assert.equal(isBluesHostname("www.onepercentblues.com"), true);
  assert.equal(isBluesHostname("WWW.OnePercentBlues.com"), true);
  assert.equal(isBluesHostname("onepercentblues.com."), true);
  assert.equal(isBluesHostname("onepercentblues.com:443"), true);
  assert.equal(isBluesHostname("www.onepercentblues.com:443"), true);
  assert.equal(isBluesHostname("onepercentblues.com.:443"), true);
  assert.equal(isBluesHostname(" youarepayingtoomuch.com "), false);
  assert.equal(isBluesHostname("youarepayingtoomuch.com"), false);
  assert.equal(isBluesHostname("youarepayingtoomuch.com:443"), false);
  assert.equal(isBluesHostname("www.youarepayingtoomuch.com"), false);
});

test("pageview URL uses the address-bar path, not a rewritten /blues path", () => {
  assert.equal(
    buildPageviewCurrentUrl({
      origin: "https://onepercentblues.com",
      pathname: "/",
      search: "",
    }),
    "https://onepercentblues.com/",
  );
  assert.equal(
    buildPageviewCurrentUrl({
      origin: "https://onepercentblues.com",
      pathname: "/",
      search: "?check=yyy",
    }),
    "https://onepercentblues.com/?check=yyy",
  );
  assert.equal(
    buildPageviewCurrentUrl({
      origin: "https://youarepayingtoomuch.com",
      pathname: "/our-math",
      search: "",
    }),
    "https://youarepayingtoomuch.com/our-math",
  );
  assert.notEqual(
    buildPageviewCurrentUrl({
      origin: "https://onepercentblues.com",
      pathname: "/",
      search: "",
    }),
    "https://onepercentblues.com/blues",
  );
});

test("PostHogPageView builds $current_url from window.location and skips blues mailer counts", async () => {
  const pageView = await read("../src/components/PostHogPageView.tsx");
  assert.match(pageView, /buildPageviewCurrentUrl\(window\.location\)/);
  assert.doesNotMatch(pageView, /window\.location\.origin \+ pathname|origin\}\$\{pathname\}/);
  assert.match(pageView, /isBluesHostname\(window\.location\.hostname\)/);
  assert.doesNotMatch(pageView, /isBluesAnalyticsHost/);
  assert.match(pageView, /onBlues \? false : syncQrVerification\(\)/);
  assert.match(
    pageView,
    /if \(!onBlues\) \{\s*void reportDocumentMeasurement\(\)/,
  );
  const skipAt = pageView.search(/if \(!onBlues\) \{\s*void reportDocumentMeasurement\(\)/);
  const stripAt = pageView.search(/searchParams\.delete\("qrtest"\)/);
  assert.ok(skipAt >= 0 && stripAt > skipAt, "Blues still strips qrtest/selftest after skipping mailer counts");
});

test("the duplicate blues analytics host helper is gone", async () => {
  const analyticsHost = await read("../src/lib/bluesAnalyticsHost.ts");
  assert.doesNotMatch(analyticsHost, /isBluesAnalyticsHost|BLUES_ANALYTICS_HOSTS/);
  assert.match(analyticsHost, /export function buildPageviewCurrentUrl/);
});

test("the blues FAQ door uses its own PostHog location; the green home keeps the original", async () => {
  const faq = await read("../src/components/HomeFaqSection.tsx");
  assert.match(
    faq,
    /tone === "blues" \? "blues_faq_all_questions" : "home_faq_all_questions"/,
  );
  assert.match(faq, /home_faq_all_questions/);
});
