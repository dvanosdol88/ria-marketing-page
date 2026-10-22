// The Google Ads tag loads only on youarepayingtoomuch.com, only with an ID,
// never for owner self-test traffic, and never passes calculator inputs.
import assert from "node:assert/strict";
import {
  GOOGLE_ADS_TAG_HOSTS,
  GOOGLE_ADS_TAG_ID,
} from "../src/config/googleAdsTag.ts";
import {
  googleAdsTagAllowed,
  sanitizedPageLocation,
} from "../src/lib/googleAdsTag.ts";

assert.equal(GOOGLE_ADS_TAG_ID, "AW-18531165881");

assert.equal(googleAdsTagAllowed("youarepayingtoomuch.com", "AW-1"), true);
assert.equal(googleAdsTagAllowed("www.youarepayingtoomuch.com", "AW-1"), true);
assert.equal(googleAdsTagAllowed("YouArePayingTooMuch.com", "AW-1"), true);

for (const host of [
  "smarterwaywealth.com",
  "onepercentblues.com",
  "youareearningtoolittle.com",
  "localhost",
  "you-are-paying-too-much-abc.vercel.app",
]) {
  assert.equal(googleAdsTagAllowed(host, "AW-1"), false, host);
}

assert.equal(googleAdsTagAllowed("youarepayingtoomuch.com", ""), false, "no ID, no tag");
assert.equal(
  googleAdsTagAllowed("youarepayingtoomuch.com", "AW-1", true),
  false,
  "self-test traffic never reaches Google",
);
assert.ok(![...GOOGLE_ADS_TAG_HOSTS].some((h) => h.includes("smarterwaywealth")));

// Calculator inputs never leave in the page address; ad attribution does.
assert.equal(
  sanitizedPageLocation(
    "https://youarepayingtoomuch.com/?portfolio=1000000&fee=1&years=20&growth=8&gclid=abc&utm_source=google&utm_medium=cpc#chart",
  ),
  "https://youarepayingtoomuch.com/?gclid=abc&utm_source=google&utm_medium=cpc",
);
assert.equal(
  sanitizedPageLocation("https://www.youarepayingtoomuch.com/become-a-client?amount=250000"),
  "https://www.youarepayingtoomuch.com/become-a-client",
);
assert.equal(
  sanitizedPageLocation("https://youarepayingtoomuch.com/"),
  "https://youarepayingtoomuch.com/",
);

console.log("google ads tag: ok");
