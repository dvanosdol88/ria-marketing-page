/**
 * The full calculator page (/calculator), public since fee-lab stage 1,
 * section 2 (docs/plans/2026-11-26-fee-lab-stage1-section2-go-live.md).
 * Section 1 built it hidden; this file replaces section 1's
 * tests/full-calculator-hidden.mjs.
 *
 * Requests the real page from `next dev` and checks that:
 *   (a) it carries the firm calculator's headline in the server HTML;
 *   (b) search engines may index and follow it, with and without a scenario;
 *   (c) it is listed in the sitemap and in llms.txt;
 *   (d) a detailed scenario link (market window + tiered fees) previews with
 *       the detailed share card, which draws that scenario's own figures.
 *
 * Run: node --test tests/full-calculator-public.mjs
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  getUnusedPort,
  startNextDev,
  stopNextDev,
  waitForPage,
} from "./lib/nextDevHarness.mjs";
import {
  buildDetailedCalculatorQuery,
  parseDetailedCalculatorState,
} from "../src/lib/full-calculator/calculatorState.ts";
import { buildShareCardData } from "../src/lib/shareCardData.ts";
import { formatCurrency } from "../src/lib/format.ts";

const HEADLINE = "Model the fees you actually pay.";

/** Market history 2001–2015 with a three-tier schedule, a fund expense and
 *  a custom flat fee: nothing the home page's basic query can carry. */
const DETAILED_STATE = {
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
};

let base;
let nextProcess;

before(async () => {
  const port = await getUnusedPort();
  base = `http://127.0.0.1:${port}`;
  const started = startNextDev(port);
  nextProcess = started.child;
  // The first compile of this page is large; allow up to four minutes.
  await waitForPage(`${base}/calculator`, nextProcess, started.logs, 480);
});

after(async () => {
  await stopNextDev(nextProcess);
});

function metaContent(html, attribute, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<meta[^>]*${attribute}="${escaped}"[^>]*content="([^"]*)"`, "i"))
    ?? html.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attribute}="${escaped}"`, "i"));
  return match?.[1] ?? null;
}

function decodeEntities(value) {
  return value.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
}

test("the page serves the firm calculator's headline in its HTML", async () => {
  const response = await fetch(`${base}/calculator`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes(HEADLINE), `expected the headline "${HEADLINE}" in the server HTML`);
});

test("the page is indexable, with and without a scenario", async () => {
  for (const path of ["/calculator", "/calculator?portfolio=1500000&years=25&return=market"]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200, `${path}: expected 200`);
    const header = response.headers.get("x-robots-tag") ?? "";
    assert.doesNotMatch(header, /noindex|nofollow/, `${path}: no X-Robots-Tag block (got "${header}")`);
    const robots = metaContent(await response.text(), "name", "robots");
    if (robots !== null) {
      assert.doesNotMatch(robots, /noindex/, `${path}: robots must not say noindex (got "${robots}")`);
      assert.doesNotMatch(robots, /nofollow/, `${path}: robots must not say nofollow (got "${robots}")`);
    }
  }
});

test("the page is listed in the sitemap and llms.txt", async () => {
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  assert.match(sitemap, /<urlset/, "expected the sitemap to be served");
  assert.match(sitemap, /<loc>https:\/\/youarepayingtoomuch\.com\/calculator<\/loc>/, "the sitemap must list /calculator");

  const llms = await (await fetch(`${base}/llms.txt`)).text();
  assert.match(
    llms,
    /^- Detailed fee calculator \(compare a flat monthly advisory fee with your own marginal tiered advisory-fee schedule using steady or historical market returns\): https:\/\/youarepayingtoomuch\.com\/calculator$/m,
    "llms.txt must list the /calculator page in the Primary URLs style",
  );
});

test("a detailed scenario previews with its own detailed share card", async () => {
  const query = buildDetailedCalculatorQuery(DETAILED_STATE);
  const html = await (await fetch(`${base}/calculator?${query}`)).text();

  const ogImage = metaContent(html, "property", "og:image");
  assert.ok(ogImage, "expected an og:image for the scenario");
  const card = new URL(decodeEntities(ogImage), base);
  assert.equal(card.pathname, "/calculator/share-card", `og:image must be the detailed card (got ${card.pathname})`);
  assert.deepEqual(parseDetailedCalculatorState(card.searchParams), DETAILED_STATE, "the card carries the whole scenario");

  const { projection } = buildShareCardData(DETAILED_STATE);
  const description = decodeEntities(metaContent(html, "name", "description") ?? "");
  assert.ok(
    description.includes(formatCurrency(projection.savings)),
    `the description should carry this scenario's difference ${formatCurrency(projection.savings)} (got "${description}")`,
  );

  const image = await fetch(`${base}${card.pathname}${card.search}`);
  assert.equal(image.status, 200, "the detailed share card renders");
  assert.match(image.headers.get("content-type") ?? "", /^image\/png/);
  assert.ok((await image.arrayBuffer()).byteLength > 10_000, "the card is a real image");
});
