import assert from "node:assert/strict";
import { createServer } from "node:net";
import { spawn, execFileSync } from "node:child_process";
import { chromium } from "playwright";

async function getUnusedPort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForPage(url, child) {
  let lastError;
  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`next dev exited early with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError?.message ?? "no response"}`);
}

async function verifySharedContent(page) {
  const inlineAdvancedLink = page.locator(
    'a[data-posthog-cta-location="fee_calculator_description"]',
  );
  assert.equal(await inlineAdvancedLink.textContent(), "Advanced Calculator");
  assert.equal(await inlineAdvancedLink.getAttribute("target"), "_blank");
  assert.equal(await inlineAdvancedLink.getAttribute("rel"), "noreferrer");

  const handoffUrl = new URL(await inlineAdvancedLink.getAttribute("href"));
  assert.equal(handoffUrl.origin, "https://smarterwaywealth.com");
  assert.equal(handoffUrl.pathname, "/save");
  assert.equal(handoffUrl.searchParams.get("portfolio"), "1500000");
  assert.equal(handoffUrl.searchParams.get("years"), "25");

  const differenceSummary = page.locator("[data-difference-summary]");
  assert.match(
    await differenceSummary.locator(":scope > p").nth(0).textContent(),
    /^\$[\d,]+$/,
  );
  assert.equal(await differenceSummary.locator(":scope > p").nth(1).textContent(), "Difference");
  assert.equal(
    await differenceSummary.locator(":scope > button").textContent(),
    "Show",
  );
  assert.ok(
    Number.parseFloat(
      await differenceSummary.locator(":scope > button span").evaluate(
        (node) => getComputedStyle(node).fontSize,
      ),
    ) >= 14.4,
    "Show should be at least 20% larger than the prior 12px label",
  );

  const advancedCta = page.locator("[data-advanced-calculator-cta]");
  assert.equal(await advancedCta.getAttribute("target"), "_blank");
  assert.equal(await advancedCta.getAttribute("rel"), "noreferrer");
  assert.equal(await advancedCta.getByText("Market return", { exact: true }).count(), 1);
  assert.equal(await advancedCta.getByText("Steady return", { exact: true }).count(), 1);

  const goodFitCard = page.locator("[data-good-fit-card]");
  await goodFitCard.scrollIntoViewIfNeeded();
  await assert.doesNotReject(() => goodFitCard.waitFor({ state: "visible" }));
  for (const heading of [
    "Financial Planning",
    "Investment Planning",
    "Stock Picks",
    "Market Timing",
  ]) {
    assert.equal(await goodFitCard.getByRole("heading", { name: heading, exact: true }).count(), 1);
  }
  assert.equal(
    await goodFitCard.getByText("Includes, among other things:", { exact: true }).count(),
    1,
  );
  const goodFitLink = goodFitCard.locator('a[data-posthog-cta-location="good_fit_card"]');
  assert.equal(await goodFitLink.getAttribute("target"), "_blank");
  assert.equal(await goodFitLink.getAttribute("rel"), "noreferrer");

  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
    "page should not overflow horizontally",
  );
}

let nextProcess;
let browser;

try {
  const port = await getUnusedPort();
  const url = `http://127.0.0.1:${port}/?portfolio=1500000&years=25&growth=8&fee=1`;
  nextProcess = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    { cwd: process.cwd(), stdio: "ignore", windowsHide: true },
  );
  await waitForPage(url, nextProcess);

  browser = await chromium.launch({ headless: true });

  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobilePage.goto(url, { waitUntil: "networkidle" });
  await verifySharedContent(mobilePage);
  await mobilePage.locator("#savings-section").evaluate((node) => {
    node.scrollIntoView({ block: "start" });
  });
  const mobileStickyClose = mobilePage.locator(
    'button[aria-label="Close potential savings header"]:visible',
  );
  await assert.doesNotReject(() => mobileStickyClose.waitFor({ state: "visible" }));
  const mobileStickyLabel = mobilePage.locator(
    "[data-sticky-potential-savings]:visible",
  );
  const mobileSectionGuide = mobilePage.getByRole("navigation", {
    name: "Jump to homepage section",
  });
  await assert.doesNotReject(() => mobileSectionGuide.waitFor({ state: "visible" }));
  for (const label of ["Save", "Upgrade", "Improve"]) {
    assert.equal(
      await mobileSectionGuide.getByRole("link", { name: label }).count(),
      1,
      `mobile sticky guide should preserve the ${label} link`,
    );
  }
  const mobileStickyBox = await mobileStickyLabel.boundingBox();
  assert.ok(
    Math.abs(mobileStickyBox.x + mobileStickyBox.width / 2 - 375 / 2) <= 2,
    "mobile potential savings should be centered",
  );
  await mobileStickyClose.click();
  await mobilePage.waitForTimeout(250);
  assert.equal(
    await mobilePage.locator("[data-sticky-potential-savings]:visible").count(),
    0,
    "sticky savings header should close",
  );

  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await desktopPage.goto(url, { waitUntil: "networkidle" });
  await verifySharedContent(desktopPage);
  await desktopPage.locator("#savings-section").scrollIntoViewIfNeeded();
  await desktopPage.waitForTimeout(900);

  const rollingCurrency = desktopPage.locator("[data-rolling-currency]").first();
  await assert.doesNotReject(() => rollingCurrency.waitFor({ state: "visible" }));
  const glyphTops = await rollingCurrency
    .locator("[data-rolling-currency-glyph]")
    .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
  assert.ok(
    glyphTops.every((top) => Math.abs(top - glyphTops[0]) <= 1),
    `currency glyph boxes should share a baseline: ${JSON.stringify(glyphTops)}`,
  );

  const desktopStickyLabel = desktopPage.locator(
    "[data-sticky-potential-savings]:visible",
  );
  await assert.doesNotReject(() => desktopStickyLabel.waitFor({ state: "visible" }));
  const desktopStickyBox = await desktopStickyLabel.boundingBox();
  assert.ok(
    Math.abs(desktopStickyBox.x + desktopStickyBox.width / 2 - 1440 / 2) <= 2,
    "desktop potential savings should be centered",
  );

  console.log(
    "Advisor calculator batch passed at 375px and 1440px: links, summary order, sticky close/centering, currency glyphs, CTA preview, fit guide, and overflow.",
  );
} finally {
  await browser?.close();
  if (nextProcess?.pid && nextProcess.exitCode === null) {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(nextProcess.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      nextProcess.kill("SIGTERM");
    }
  }
}
