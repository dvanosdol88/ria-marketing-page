/**
 * The visit card's advanced-calculator row, per surface (fee-lab stage 1,
 * section 2 and its fix round, 2026-11-26).
 *
 * The visit card renders client-side on both home pages, so this renders the
 * real component to markup with each surface's real href:
 *   - green home (youarepayingtoomuch.com): this site's /calculator, same
 *     tab, no external-link icon;
 *   - One Percent Blues: unchanged from before section 2 — the firm site's
 *     /save, new tab, external-link icon.
 * Label, text and PostHog label/location are the same on both.
 *
 * Run: npx tsx --test tests/visit-card-advanced-calculator.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SmarterWayWealthVisitCard } from "../src/components/SmarterWayWealthVisitCard.tsx";
import {
  ADVANCED_CALCULATOR_URL,
  BLUES_ADVANCED_CALCULATOR_URL,
} from "../src/config/advancedCalculator.ts";

const LABEL = "Use the advanced calculator and see how we do the math";

function rows(href) {
  const html = renderToStaticMarkup(createElement(SmarterWayWealthVisitCard, { advancedCalculatorHref: href }));
  const nav = html.slice(html.indexOf("<nav"), html.indexOf("</nav>"));
  return nav.split("</a>").filter((chunk) => chunk.includes("<a")).map((chunk) => chunk.slice(chunk.indexOf("<a")));
}

function assertSameTracking(row) {
  assert.match(row, new RegExp(`data-posthog-cta-label="${LABEL}"`));
  assert.match(row, /data-posthog-cta-location="home_firm_visit_card_calculator"/);
  assert.ok(row.includes(`>${LABEL}</span>`), "the row's visible text is unchanged");
}

test("the two surfaces use their own advanced-calculator destinations", () => {
  assert.equal(ADVANCED_CALCULATOR_URL, "/calculator");
  assert.equal(BLUES_ADVANCED_CALCULATOR_URL, "https://smarterwaywealth.com/save");
});

test("green home: the row opens /calculator in the same tab with no external-link icon", () => {
  const [calculator, ...firmRows] = rows(ADVANCED_CALCULATOR_URL);
  assertSameTracking(calculator);
  assert.match(calculator, /href="\/calculator"/);
  assert.doesNotMatch(calculator, /target=/);
  assert.doesNotMatch(calculator, /rel=/);
  assert.doesNotMatch(calculator, /<svg/);
  assert.equal(firmRows.length, 3);
  for (const row of firmRows) {
    assert.match(row, /href="https:\/\/smarterwaywealth\.com\//);
    assert.match(row, /target="_blank"/);
    assert.match(row, /<svg/);
  }
});

test("One Percent Blues: the row is unchanged from before section 2", () => {
  const [calculator] = rows(BLUES_ADVANCED_CALCULATOR_URL);
  assertSameTracking(calculator);
  assert.match(calculator, /href="https:\/\/smarterwaywealth\.com\/save"/);
  assert.match(calculator, /target="_blank"/);
  assert.match(calculator, /rel="noreferrer"/);
  assert.match(calculator, /<svg[^>]*lucide-external-link/);
});
