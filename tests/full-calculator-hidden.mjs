/**
 * The hidden full calculator page (/calculator) — fee-lab stage 1, section 1
 * (docs/plans/2026-11-25-fee-lab-stage1-full-calculator.md).
 *
 * Requests the real page from `next dev` and checks that:
 *   (a) it carries the firm calculator's headline in the server HTML;
 *   (b) it tells search engines not to index or follow it, with and without
 *       a scenario in the address;
 *   (c) it is absent from the sitemap (and from llms.txt).
 *
 * Run: node --test tests/full-calculator-hidden.mjs
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  getUnusedPort,
  startNextDev,
  stopNextDev,
  waitForPage,
} from "./lib/nextDevHarness.mjs";

const HEADLINE = "Model the fees you actually pay.";

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

function robotsContent(html) {
  const match = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]*)"/i)
    ?? html.match(/<meta[^>]*content="([^"]*)"[^>]*name="robots"/i);
  return match?.[1] ?? null;
}

test("the page serves the firm calculator's headline in its HTML", async () => {
  const response = await fetch(`${base}/calculator`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes(HEADLINE), `expected the headline "${HEADLINE}" in the server HTML`);
});

test("the page is noindex, nofollow, with and without a scenario", async () => {
  for (const path of ["/calculator", "/calculator?portfolio=1500000&years=25&return=market"]) {
    const html = await (await fetch(`${base}${path}`)).text();
    const robots = robotsContent(html);
    assert.ok(robots, `${path}: expected a robots meta tag`);
    assert.match(robots, /noindex/, `${path}: robots must include noindex (got "${robots}")`);
    assert.match(robots, /nofollow/, `${path}: robots must include nofollow (got "${robots}")`);
  }
});

test("the page is absent from the sitemap and llms.txt", async () => {
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  assert.match(sitemap, /<urlset/, "expected the sitemap to be served");
  assert.ok(!sitemap.includes("/calculator"), "the sitemap must not list /calculator");

  const llms = await (await fetch(`${base}/llms.txt`)).text();
  assert.doesNotMatch(llms, /youarepayingtoomuch\.com\/calculator(?![\w/])/, "llms.txt must not list the /calculator page");
});
