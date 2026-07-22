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

function approximately(actual, expected, tolerance = 2) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual}px to be within ${tolerance}px of ${expected}px`,
  );
}

let nextProcess;
let browser;

try {
  const port = await getUnusedPort();
  const url = `http://127.0.0.1:${port}/upgrade-your-advice`;
  nextProcess = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: "ignore", windowsHide: true },
  );
  await waitForPage(url, nextProcess);

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });

  const credentialsButton = page.getByRole("button", { name: /Highly Credentialed, Highly Experienced/ });
  if ((await credentialsButton.getAttribute("aria-expanded")) !== "true") {
    await credentialsButton.click();
  }

  const summary = page.locator("[data-credential-summary]");
  const keywords = page.locator("[data-credential-keyword]");
  const badges = page.locator("[data-credential-badges]");

  await assert.doesNotReject(() => summary.waitFor({ state: "visible" }));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  assert.deepEqual(await summary.locator("p").allTextContents(), [
    "The rigor and investment expertise of a CFA Charterholder.",
    "The planning and process of a CFP® professional.",
    "20+ years of real advisory experience.",
  ]);
  assert.deepEqual(await keywords.allTextContents(), ["CFA", "CFP®", "experience"]);
  assert.deepEqual(await keywords.evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).fontWeight)), ["700", "700", "700"]);
  assert.deepEqual(
    await summary.locator("p").evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).fontSize)),
    ["16px", "16px", "16px"],
    "credential sentences should use the next smaller type size",
  );

  const mobileSentenceRows = await summary.locator("p").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
  assert.ok(
    mobileSentenceRows.slice(1).every((row, index) => Math.abs(row.y - (mobileSentenceRows[index].y + mobileSentenceRows[index].height) - 8) <= 1),
    "mobile credential sentences should be separate rows with an 8px rhythm",
  );
  const mobileSummary = await summary.boundingBox();
  const mobileBadges = await badges.boundingBox();
  assert.ok(mobileBadges.y >= mobileSummary.y + mobileSummary.height, "badges should sit below the summary on mobile");
  const mobileBadgeBoxes = await badges.locator(":scope > span").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
  approximately(mobileBadgeBoxes[0].width, 103);
  approximately(mobileBadgeBoxes[1].width, 130);

  await page.setViewportSize({ width: 799, height: 900 });
  await page.reload({ waitUntil: "networkidle" });
  if ((await credentialsButton.getAttribute("aria-expanded")) !== "true") {
    await credentialsButton.click();
  }

  const tabletLeadBoxes = await summary.locator("p > span:first-child").evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().toJSON()),
  );
  assert.ok(tabletLeadBoxes.every((box) => box.x >= 24), "credential sentence openings should stay inside the tablet card");
  const tabletKeywordBoxes = await keywords.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
  const tabletKeywordCenters = tabletKeywordBoxes.map((box) => box.x + box.width / 2);
  assert.ok(
    tabletKeywordCenters.every((center) => Math.abs(center - tabletKeywordCenters[0]) <= 1),
    "credential keyword centers should share a tablet axis",
  );
  const tabletSummary = await summary.boundingBox();
  const tabletBadges = await badges.boundingBox();
  assert.ok(tabletBadges.y >= tabletSummary.y + tabletSummary.height, "badges should sit below the summary at tablet widths");

  await page.setViewportSize({ width: 1405, height: 900 });
  await page.reload({ waitUntil: "networkidle" });
  if ((await credentialsButton.getAttribute("aria-expanded")) !== "true") {
    await credentialsButton.click();
  }

  const desktopKeywordBoxes = await keywords.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
  const keywordCenters = desktopKeywordBoxes.map((box) => box.x + box.width / 2);
  assert.ok(
    keywordCenters.every((center) => Math.abs(center - keywordCenters[0]) <= 1),
    "credential keyword centers should share a desktop axis",
  );

  const desktopSentenceGeometry = await summary.locator("p").evaluateAll((nodes) =>
    nodes.map((node) => {
      const [lead, keyword, tail] = node.children;
      const leadBox = lead.getBoundingClientRect();
      const keywordBox = keyword.getBoundingClientRect();
      const tailBox = tail.getBoundingClientRect();
      return {
        leadGap: keywordBox.x - (leadBox.x + leadBox.width),
        tailGap: tailBox.x - (keywordBox.x + keywordBox.width),
        leadSpace: Number.parseFloat(getComputedStyle(lead).paddingRight),
        tailSpace: Number.parseFloat(getComputedStyle(tail).paddingLeft),
      };
    }),
  );
  assert.ok(
    desktopSentenceGeometry.every(({ leadGap, leadSpace }) => Math.abs(leadGap) <= 1 && leadSpace >= 3 && leadSpace <= 5),
    `each lead should have one natural word space before its keyword: ${JSON.stringify(desktopSentenceGeometry)}`,
  );
  assert.ok(
    desktopSentenceGeometry.slice(0, 2).every(({ tailGap, tailSpace }) => Math.abs(tailGap) <= 1 && tailSpace >= 3 && tailSpace <= 5),
    "word tails should have one natural word space after their keyword",
  );
  assert.ok(
    Math.abs(desktopSentenceGeometry[2].tailGap) <= 1 && desktopSentenceGeometry[2].tailSpace === 0,
    "the period should follow experience without an added space",
  );

  const header = await credentialsButton.boundingBox();
  const summaryRows = summary.locator("p > span:first-child");
  const firstSentence = await summaryRows.first().boundingBox();
  assert.ok(firstSentence.y - (header.y + header.height) >= 16, "first sentence needs visible header spacing");
  const desktopRows = await summaryRows.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
  assert.ok(desktopRows.slice(1).every((row, index) => row.y - (desktopRows[index].y + desktopRows[index].height) < 12), "sentence rhythm should be tighter than 12px");

  const desktopSummary = await summary.boundingBox();
  const desktopBadges = await badges.boundingBox();
  assert.ok(desktopBadges.x >= desktopSummary.x + desktopSummary.width, "badges should begin to the right of the summary on desktop");
  const desktopBadgeBoxes = await badges.locator(":scope > span").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
  approximately(desktopBadgeBoxes[0].width, 115);
  approximately(desktopBadgeBoxes[1].width, 144);

  console.log("Credentials layout regression passed at 375px, 799px, and 1405px.");
} finally {
  await browser?.close();
  if (nextProcess?.pid && nextProcess.exitCode === null) {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(nextProcess.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      nextProcess.kill("SIGTERM");
    }
  }
}
