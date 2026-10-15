// 05-14: the Reddit Pixel loads only on youarepayingtoomuch.com, only with an
// ID, never for owner self-test traffic, and forwards event names only.
import assert from "node:assert/strict";
import {
  REDDIT_EVENT_FOR_POSTHOG_EVENT,
  REDDIT_PIXEL_HOSTS,
} from "../src/config/redditPixel.ts";
import { redditPixelAllowed } from "../src/lib/redditPixel.ts";

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
