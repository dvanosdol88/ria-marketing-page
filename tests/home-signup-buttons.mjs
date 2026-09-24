import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/components/SignupCta.tsx", import.meta.url), "utf8");
const home = source.split('if (variant === "block" && location === "home_post_calculator") {')[1]?.split('const primaryButtonClass')[0];

test("homepage has two full-width actions without the wordy panel", () => {
  assert.ok(home);
  // DECISION, 2026-09-24 (David, final word): stacked. Green Become a client
  // on top; the small navy "Questions? / Schedule 15 minutes" centered below.
  assert.match(home, /bg-\[#008532\][\s\S]*text-xl font-bold leading-6">\s*Become a client/);
  assert.match(home, /\$100\/month, flat/);
  assert.match(home, /data-schedule-call[\s\S]*self-center[\s\S]*bg-\[#064B84\][\s\S]*Questions\?[\s\S]*Schedule 15 minutes/);
  assert.ok(home.indexOf("text-xl font-bold leading-6") < home.indexOf("data-schedule-call"), "client on top");
  assert.doesNotMatch(home, /Sign me up|See if I&apos;m a good fit|Book a 15-min call/);
  assert.doesNotMatch(home, /eyebrow|SecondaryLink|bg-gradient/);
  assert.match(home, /signupCta\.disclosure/);
});

test("homepage retains destinations and measurement identities", () => {
  assert.match(home, /href=\{signupCta.primary.href\}/);
  assert.match(home, /href=\{signupCta.secondary.href\}/);
  for (const kind of ["primary", "secondary"]) {
    assert.ok(home.includes(`data-posthog-cta-label={signupCta.${kind}.label}`));
    assert.ok(home.includes('data-posthog-cta-location={`${location}_' + kind + '`}'));
  }
});
