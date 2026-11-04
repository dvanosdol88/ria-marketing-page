// 05-14: the Reddit Pixel loads only on youarepayingtoomuch.com, only with an
// ID, never for owner self-test traffic, and forwards event names only.
import assert from "node:assert/strict";
import {
  REDDIT_EVENT_FOR_POSTHOG_EVENT,
  REDDIT_PIXEL_HOSTS,
} from "../src/config/redditPixel.ts";
import {
  metadataCarriesVisitorScenario,
  redditPixelAllowed,
} from "../src/lib/redditPixel.ts";

// Reddit's pixel sends page metadata; personalized calculator metadata must
// keep the pixel silent. The shared default scenario is not personal.
const DEFAULT_OG =
  "https://youarepayingtoomuch.com/api/og?flat=1200&portfolio=1000000&years=20&growth=8&fee=1&mfe=0";
assert.equal(metadataCarriesVisitorScenario([DEFAULT_OG]), false, "default share image");
assert.equal(
  metadataCarriesVisitorScenario(["https://onepercentblues.com/api/og/blues?flat=1200&portfolio=1000000&years=20&growth=8&fee=1&mfe=0"]),
  false,
  "default blues share image",
);
assert.equal(metadataCarriesVisitorScenario(["https://youarepayingtoomuch.com/"]), false);
assert.equal(metadataCarriesVisitorScenario(["https://youarepayingtoomuch.com/?utm_source=reddit&rdt_cid=1"]), false);
assert.equal(metadataCarriesVisitorScenario([null, undefined, ""]), false);
assert.equal(
  metadataCarriesVisitorScenario([
    "https://youarepayingtoomuch.com/api/og?portfolio=1234567&fee=1&years=20&flat=1200&growth=8&mfe=0",
  ]),
  true,
  "visitor portfolio",
);
assert.equal(metadataCarriesVisitorScenario(["/?portfolio=1000000&years=35"]), true, "visitor horizon");
assert.equal(metadataCarriesVisitorScenario(["/?tiers=1000000:1"]), true, "visitor fee tiers");

assert.equal(redditPixelAllowed("youarepayingtoomuch.com", "a2_test"), true);
assert.equal(redditPixelAllowed("www.youarepayingtoomuch.com", "a2_test"), true);
assert.equal(redditPixelAllowed("YouArePayingTooMuch.com", "a2_test"), true);

for (const host of [
  "smarterwaywealth.com",
  "onepercentblues.com",
  "youareearningtoolittle.com",
  "localhost",
  "you-are-paying-too-much-abc.vercel.app",
]) {
  assert.equal(redditPixelAllowed(host, "a2_test"), false, host);
}

assert.equal(redditPixelAllowed("youarepayingtoomuch.com", ""), false, "no ID, no pixel");
assert.equal(
  redditPixelAllowed("youarepayingtoomuch.com", "a2_test", true),
  false,
  "self-test traffic never reaches Reddit",
);

assert.deepEqual(REDDIT_EVENT_FOR_POSTHOG_EVENT, {
  calculator_started: "ViewContent",
  calculator_submitted: "Lead",
});
assert.ok(![...REDDIT_PIXEL_HOSTS].some((h) => h.includes("smarterwaywealth")));

console.log("reddit pixel: ok");
