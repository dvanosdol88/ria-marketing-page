import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/components/SignupCta.tsx", import.meta.url), "utf8");
const home = source.split('if (variant === "block" && location === "home_post_calculator") {')[1]?.split('const primaryButtonClass')[0];

test("homepage has two full-width actions without the wordy panel", () => {
  assert.ok(home);
  assert.match(home, /Sign me up — Become a client/);
  assert.match(home, /See if I&apos;m a good fit/);
  assert.match(home, /Schedule a 15-minute talk with David/);
  assert.match(home, /bg-\[#008532\]/);
  assert.equal((home.match(/w-full items-center|w-full flex-col/g) ?? []).length, 2);
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
