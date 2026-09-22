import assert from "node:assert/strict";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
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
    if (child.exitCode !== null) throw new Error(`next dev exited early with code ${child.exitCode}`);
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

const normalize = (text) => text.replace(/\s+/g, " ").trim();
const expectedDefault =
  "Based on a $1,000,000 portfolio · 1.00% asset-based fee · 8.00% annual growth · 20 years · compared with $100/month flat fee. Use my numbers";

async function readAssumptionsSpacing(page) {
  return page.evaluate(() => {
    const section = document.querySelector('[data-url-eval-section="opening-promise"]');
    const potential = [...section.querySelectorAll("p")].find((node) =>
      node.textContent.includes("Potential savings"),
    );
    const assumptions = section.querySelector("[data-home-assumptions]");
    const divider = section.querySelector('[data-home-promise-divider="top"]');
    if (!potential || !assumptions || !divider) throw new Error("hero spacing landmarks are missing");

    const potentialRect = potential.getBoundingClientRect();
    const assumptionsRect = assumptions.getBoundingClientRect();
    const dividerRect = divider.getBoundingClientRect();
    const assumptionsStyle = getComputedStyle(assumptions);
    const textTop = assumptionsRect.top + Number.parseFloat(assumptionsStyle.paddingTop);

    return {
      lineHeight: Number.parseFloat(assumptionsStyle.lineHeight),
      topGap: textTop - potentialRect.bottom,
      bottomGap: dividerRect.top - assumptionsRect.bottom,
    };
  });
}

function assertCenteredTightSpacing(spacing, viewport) {
  assert.equal(spacing.lineHeight, 16, `${viewport}: wrapped assumptions lines should be tightly spaced`);
  assert.ok(
    Math.abs(spacing.topGap - spacing.bottomGap) <= 1,
    `${viewport}: assumptions should be vertically centered; gaps were ${spacing.topGap}px and ${spacing.bottomGap}px`,
  );
}

let nextProcess;
let browser;

try {
  const port = await getUnusedPort();
  const origin = `http://127.0.0.1:${port}`;
  nextProcess = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: "ignore", windowsHide: true },
  );
  await waitForPage(origin, nextProcess);
  browser = await chromium.launch({ headless: true });

  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto(origin, { waitUntil: "networkidle" });
  const assumptions = mobile.locator("[data-home-assumptions]");
  await assumptions.waitFor();
  assert.equal(normalize(await assumptions.innerText()), expectedDefault);

  const heroFont = await mobile
    .locator('[data-url-eval-section="opening-promise"] h1 span')
    .nth(1)
    .evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
  const assumptionsFont = await assumptions.evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
  assert.ok(heroFont > assumptionsFont * 2, "the assumptions line must remain visually subordinate to the hero");
  assertCenteredTightSpacing(await readAssumptionsSpacing(mobile), "375px");

  const edits = [
    ["#final-portfolio-value-input", "2050000", "$2,050,000 portfolio"],
    ["#final-asset-based-fee-input", "1.25", "1.25% asset-based fee"],
    ["#final-annualized-growth-input", "7.25", "7.25% annual growth"],
    ["#final-years-input", "25", "25 years"],
  ];
  for (const [selector, value, expected] of edits) {
    const input = mobile.locator(selector);
    await input.fill(value);
    await input.blur();
    await assumptions.waitFor();
    assert.match(normalize(await assumptions.innerText()), new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const editedText = normalize(await assumptions.innerText());
  assert.match(editedText, /compared with \$100\/month flat fee/);
  const editedUrl = mobile.url();
  assert.match(editedUrl, /portfolio=2050000/);
  assert.match(editedUrl, /fee=1\.25/);
  assert.match(editedUrl, /growth=7\.25/);
  assert.match(editedUrl, /years=25/);

  await mobile.getByRole("link", { name: "Use my numbers" }).click();
  await mobile.locator("#calculator-assumptions").waitFor();
  assert.equal(normalize(await assumptions.innerText()), editedText, "the jump link must not reset calculator state");

  await mobile.reload({ waitUntil: "networkidle" });
  assert.equal(normalize(await mobile.locator("[data-home-assumptions]").innerText()), editedText);

  const queryPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await queryPage.goto(
    `${origin}/?portfolio=3000000&fee=0.85&mfe=0.2&growth=6.5&years=30&flat=1800`,
    { waitUntil: "networkidle" },
  );
  const queryText = normalize(await queryPage.locator("[data-home-assumptions]").innerText());
  assert.equal(
    queryText,
    "Based on a $3,000,000 portfolio · 0.85% asset-based fee + 0.20% fund expenses · 6.50% annual growth · 30 years · compared with $150/month flat fee. Use my numbers",
  );
  await queryPage.reload({ waitUntil: "networkidle" });
  assert.equal(normalize(await queryPage.locator("[data-home-assumptions]").innerText()), queryText);
  assertCenteredTightSpacing(await readAssumptionsSpacing(queryPage), "1280px");

  for (const page of [mobile, queryPage]) {
    const layout = await page.evaluate(() => {
      const valueSummary = document.querySelector("[data-home-client-value]");
      const explanationSection = document.querySelector('[aria-label="What, why, who and how Smarter Way Wealth works"]');
      return {
        body: document.body.scrollWidth,
        viewport: document.documentElement.clientWidth,
        valueSummary: Boolean(valueSummary),
        valueItems: valueSummary?.querySelectorAll("li").length,
        valueChecks: valueSummary?.querySelectorAll("svg.lucide-check").length,
        externalIcons: document.querySelectorAll(
          '[data-home-client-value] svg.lucide-external-link, [data-posthog-cta-location="home_post_calculator_primary"] svg.lucide-external-link, [data-posthog-cta-location="home_post_calculator_secondary"] svg.lucide-external-link',
        ).length,
        moreHref: valueSummary?.querySelector('[data-posthog-cta-label="More"]')?.getAttribute("href"),
        valueText: valueSummary?.textContent,
        explanationBorderBottom: explanationSection ? getComputedStyle(explanationSection).borderBottomStyle : null,
        primary: document.querySelectorAll('[data-posthog-cta-location="home_post_calculator_primary"]').length,
        secondary: document.querySelectorAll('[data-posthog-cta-location="home_post_calculator_secondary"]').length,
      };
    });
    assert.equal(layout.body, layout.viewport, "the page must not overflow horizontally");
    assert.equal(layout.valueSummary, true);
    assert.equal(layout.valueItems, 5);
    assert.equal(layout.valueChecks, 5);
    assert.equal(layout.externalIcons, 3);
    assert.equal(layout.moreHref, "https://smarterwaywealth.com/");
    assert.match(layout.valueText, /Direct access to David, regular meetings, and ongoing advice/);
    assert.match(layout.valueText, /State-of-the-art financial planning tools you can use on your own/);
    assert.doesNotMatch(layout.valueText, /Third-party brokerage/);
    assert.equal(layout.explanationBorderBottom, "none");
    assert.equal(layout.primary, 1);
    assert.equal(layout.secondary, 1);
  }

  console.log("home assumptions + client value: default, four edits, query, reload, 375px, and 1280px passed");
} finally {
  await browser?.close();
  if (nextProcess && nextProcess.exitCode === null) {
    nextProcess.kill();
    await new Promise((resolve) => nextProcess.once("exit", resolve));
  }
}
