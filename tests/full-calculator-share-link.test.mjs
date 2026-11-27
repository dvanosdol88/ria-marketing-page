/**
 * Shared links from the full calculator (/calculator) reopen /calculator
 * with the whole scenario (fee-lab stage 1, section 2:
 * docs/plans/2026-11-26-fee-lab-stage1-section2-go-live.md).
 *
 * A detailed scenario (market history with a year range, a tiered fee
 * schedule, a fund expense, a custom flat fee) goes through the same
 * builders the page uses — `buildDetailedCalculatorQuery` then
 * `fullCalculatorSite.buildShareUrl` / `buildShareCardPath` — and the page's
 * own parser (`parseDetailedCalculatorState`) must restore it exactly. The
 * home page's share link is guarded as unchanged.
 *
 * Run: node --test tests/full-calculator-share-link.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fullCalculatorSite } from "../src/config/full-calculator/fullCalculatorSite.ts";
import {
  buildDetailedCalculatorQuery,
  parseDetailedCalculatorState,
} from "../src/lib/full-calculator/calculatorState.ts";
import { buildShareCardData } from "../src/lib/shareCardData.ts";

const ORIGIN = "https://youarepayingtoomuch.com";

const readSource = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");

const SCENARIOS = {
  "market 2001–2015, three-tier schedule, fund expense, custom flat fee": {
    annualFlatFee: 1800,
    portfolioValue: 2_500_000,
    years: 15,
    annualGrowthPercent: 7,
    annualFeePercent: 1.1,
    mutualFundExpensePercent: 0.35,
    feeMode: "tiered",
    feeTiers: [
      { upTo: 1_000_000, annualRatePercent: 1.25 },
      { upTo: 3_000_000, annualRatePercent: 0.9 },
      { upTo: null, annualRatePercent: 0.6 },
    ],
    returnMode: "market",
    marketEndYear: 2015,
  },
  "market 1991–2020, single rate": {
    annualFlatFee: 1200,
    portfolioValue: 800_000,
    years: 30,
    annualGrowthPercent: 8,
    annualFeePercent: 1.5,
    mutualFundExpensePercent: 0,
    feeMode: "single",
    feeTiers: [
      { upTo: 1_000_000, annualRatePercent: 1.5 },
      { upTo: 2_000_000, annualRatePercent: 1 },
      { upTo: null, annualRatePercent: 0.75 },
    ],
    returnMode: "market",
    marketEndYear: 2020,
  },
  "steady 6.5%, two-tier schedule": {
    annualFlatFee: 2400,
    portfolioValue: 4_000_000,
    years: 25,
    annualGrowthPercent: 6.5,
    annualFeePercent: 1,
    mutualFundExpensePercent: 0.2,
    feeMode: "tiered",
    feeTiers: [
      { upTo: 2_000_000, annualRatePercent: 1 },
      { upTo: null, annualRatePercent: 0.5 },
    ],
    returnMode: "steady",
    marketEndYear: 2024,
  },
};

for (const [name, state] of Object.entries(SCENARIOS)) {
  test(`share link round-trip: ${name}`, () => {
    // The scenario must already be one the page can hold (no clamping), so
    // a round-trip mismatch means the link lost something.
    assert.deepEqual(
      parseDetailedCalculatorState(new URLSearchParams(buildDetailedCalculatorQuery(state))),
      state,
      "fixture must be a reachable scenario",
    );

    const query = buildDetailedCalculatorQuery(state);
    const shared = new URL(fullCalculatorSite.buildShareUrl(ORIGIN, query));
    assert.equal(shared.origin, ORIGIN);
    assert.equal(shared.pathname, "/calculator", "the shared link reopens the full calculator");
    assert.equal(shared.hash, "", "no home-page #calculator anchor");
    assert.deepEqual(parseDetailedCalculatorState(shared.searchParams), state, "the page restores the same scenario");
    assert.equal(shared.searchParams.get("return"), state.returnMode);
    assert.equal(shared.searchParams.get("end"), String(state.marketEndYear));
    assert.equal(shared.searchParams.get("feeMode"), state.feeMode);
    assert.equal(shared.searchParams.has("tiers"), state.feeMode === "tiered");

    const card = new URL(fullCalculatorSite.buildShareCardPath(query), ORIGIN);
    assert.equal(card.pathname, "/calculator/share-card");
    const cardState = parseDetailedCalculatorState(card.searchParams);
    assert.deepEqual(cardState, state, "the share card reads the same scenario");

    // The card's figures are this scenario's own, not a steady single-rate stand-in.
    const expected = buildShareCardData(state);
    const drawn = buildShareCardData(cardState);
    assert.equal(drawn.projection.savings, expected.projection.savings);
    assert.equal(drawn.returnLabel, expected.returnLabel);
    assert.equal(drawn.feeLabel, expected.feeLabel);
    if (state.returnMode === "market") {
      const firstYear = state.marketEndYear - state.years + 1;
      assert.equal(drawn.returnLabel, `S&P 500 total returns, ${firstYear}–${state.marketEndYear}`);
    }
    if (state.feeMode === "tiered") {
      assert.match(drawn.feeLabel, new RegExp(`^Tiered schedule \\(${state.feeTiers.length} tiers, `));
    }
  });
}

test("the full calculator shares through its own page config; the home page's share link is unchanged", () => {
  const canon = readSource("src/components/calculator/CanonCalculatorExperience.tsx");
  assert.match(canon, /fullCalculatorSite\.buildShareCardPath\(calculatorQuery\)/);
  assert.match(canon, /fullCalculatorSite\.buildShareUrl\(origin, calculatorQuery\)/);
  assert.doesNotMatch(canon, /siteCalculatorConfig\.build(?:CanonicalUrl|ShareCardPath)/);

  const config = readSource("src/lib/siteCalculatorConfig.ts");
  assert.match(config, /buildCanonicalUrl: \(origin, query\) => `\$\{origin\}\/\?\$\{buildSharedResultQuery\(query\)\}#calculator`/);
  assert.match(config, /buildShareCardPath: \(query\) => shareCardPathForMode\(query, bluesModeFromDocument\(\)\)/);
  assert.match(config, /const GREEN_SHARE_CARD_ROUTE = "\/api\/og";/);

  const home = readSource("src/components/HomeCalculatorExperience.tsx");
  assert.match(home, /siteCalculatorConfig\.buildCanonicalUrl\(origin, shareQuery\)/);
});
