import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/components/SignupCta.tsx", import.meta.url), "utf8");
const home = source.split('if (variant === "block" && location === "home_post_calculator") {')[1]?.split('const primaryButtonClass')[0];

test("homepage has the two named actions, client first, without the wordy panel", () => {
  assert.ok(home);
  // 2026-09-23 (David, option 1 on both sites): one naming system, client first.
  assert.match(home, /Become a client\s*<ExternalLink/);
  assert.match(home, /Book a 15-min call\s*<ExternalLink/);
  assert.ok(home.indexOf("Become a client") < home.indexOf("Book a 15-min call"), "client first");
  assert.match(home, /grid gap-4 md:grid-cols-2/, "side by side from md up");
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
