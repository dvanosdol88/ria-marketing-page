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
  const differenceSummary = page.locator("[data-difference-summary]");
  await assert.doesNotReject(() => differenceSummary.waitFor({ state: "visible" }));
  const differenceAmount = differenceSummary.locator("[data-difference-amount]");
  const staticDifferenceAmount = differenceAmount.locator("span.sm\\:hidden");
  assert.match(
    await staticDifferenceAmount.textContent(),
    /^\$[\d,]+$/,
  );
  assert.equal(
    await differenceAmount.evaluate(
      (amount) => amount.previousElementSibling?.textContent?.startsWith("Difference") === true,
    ),
    true,
    "the visible difference amount must immediately follow its Difference label",
  );

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

  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await desktopPage.goto(url, { waitUntil: "networkidle" });
  await verifySharedContent(desktopPage);

  const rollingCurrency = desktopPage.locator("[data-rolling-currency]").first();
  await assert.doesNotReject(() => rollingCurrency.waitFor({ state: "visible" }));
  const glyphTops = await rollingCurrency
    .locator("[data-rolling-currency-glyph]")
    .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
  assert.ok(
    glyphTops.every((top) => Math.abs(top - glyphTops[0]) <= 1),
    `currency glyph boxes should share a baseline: ${JSON.stringify(glyphTops)}`,
  );

  console.log(
    "Advisor calculator batch passed at 375px and 1440px: summary order, currency glyphs, and overflow.",
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
