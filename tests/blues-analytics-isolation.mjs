/**
 * Blues traffic must not pollute YAPT analytics: pageviews use the address-bar
 * URL, and onepercentblues.com never increments the mailer visit counter.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildPageviewCurrentUrl,
  isBluesAnalyticsHost,
} from "../src/lib/bluesAnalyticsHost.ts";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("onepercentblues.com and www are blues analytics hosts", () => {
  assert.equal(isBluesAnalyticsHost("onepercentblues.com"), true);
  assert.equal(isBluesAnalyticsHost("www.onepercentblues.com"), true);
  assert.equal(isBluesAnalyticsHost("WWW.OnePercentBlues.com"), true);
  assert.equal(isBluesAnalyticsHost("onepercentblues.com."), true);
  assert.equal(isBluesAnalyticsHost(" youarepayingtoomuch.com "), false);
  assert.equal(isBluesAnalyticsHost("youarepayingtoomuch.com"), false);
  assert.equal(isBluesAnalyticsHost("www.youarepayingtoomuch.com"), false);
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
  assert.doesNotMatch(pageView, /window\.location\.origin \+ pathname/);
  assert.match(pageView, /isBluesAnalyticsHost\(window\.location\.hostname\)/);
  assert.match(
    pageView,
    /if \(isBluesAnalyticsHost\(window\.location\.hostname\)\) return;\s*reportTrafficVisit\(\);\s*reportMailerScan\(url\);/,
  );
});

test("the blues FAQ door uses its own PostHog location; the green home keeps the original", async () => {
  const faq = await read("../src/components/HomeFaqSection.tsx");
  assert.match(
    faq,
    /tone === "blues" \? "blues_faq_all_questions" : "home_faq_all_questions"/,
  );
  assert.match(faq, /home_faq_all_questions/);
});
