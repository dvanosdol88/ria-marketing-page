import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/components/SignupCta.tsx", import.meta.url), "utf8");
const home = source.split('function HomeActionPair')[1]?.split('export function SignupCta')[0];

test("homepage stacks the signup button above the centered scheduling button", () => {
  assert.ok(home);
  assert.match(home, /SIGNUP_BUTTON_CLASS[\s\S]*\{signupCta\.primary\.label\}/);
  assert.doesNotMatch(home, /\$100\/month, flat|<ExternalLink/);
  assert.match(home, /data-schedule-call[\s\S]*SCHEDULE_BUTTON_CLASS\} self-center[\s\S]*Questions\?[\s\S]*Schedule 15 minutes/);
  assert.ok(home.indexOf("SIGNUP_BUTTON_CLASS") < home.indexOf("data-schedule-call"), "client on top");
  assert.doesNotMatch(home, /Sign me up|See if I&apos;m a good fit|Book a 15-min call/);
  assert.doesNotMatch(home, /eyebrow|SecondaryLink|bg-gradient/);
  assert.match(home, /signupCta\.disclosure/);
});

test("homepage retains destinations and measurement identities", () => {
  assert.match(home, /href=\{signupCta.primary.href\}/);
  assert.match(home, /href=\{signupCta.secondary.href\}/);
  for (const kind of ["primary", "secondary"]) {
    assert.ok(home.includes(`data-posthog-cta-label={signupCta.${kind}.${kind === "primary" ? "analyticsLabel" : "label"}}`));
    assert.ok(home.includes('data-posthog-cta-location={`${location}_' + kind + '`}'));
  }
});

test("the same action pair can render after the FAQ without repeating the client-value list", () => {
  assert.match(source, /location === "home_post_calculator" \|\| location === "home_post_faq"/);
  assert.match(source, /location === "home_post_calculator" && <div/);
  assert.match(source, /<HomeActionPair location=\{location\} \/>/);
});
