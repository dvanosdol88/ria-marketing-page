/**
 * Geometry, measured — not class names, matched.
 *
 * The sibling locks in tests/home-wwwh.mjs pin the four spacing CONSTANTS so
 * nobody nudges them casually. They cannot tell you whether the result still
 * fits on a phone: a font-size change, a line-height change, or an extra
 * element anywhere above the calculator would sail straight past a string
 * match while pushing "The Fee Calculator" under the fold. This file renders
 * the page and measures it.
 *
 * Usable heights below are what Safari leaves for the page in portrait with
 * the toolbar expanded — the state a visitor lands in from the mailed QR code,
 * before any scroll collapses it.
 */
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

/* A heading's line box is taller than its letters: half-leading above, and
   below the baseline a descender slot that "The Fee Calculator" — which has no
   descenders — does not use. Testing the line box against the fold therefore
   fails on pixels the visitor cannot see. What matters, and what this file
   measures, is where the INK ends.

   David accepted a heading that reaches the fold ("I think the clear separation
   results in a feeling of more simplicity", 2026-08-11); he did not accept one
   whose words are cut. So: ink must clear the fold on every profile, and the
   line box is allowed to overrun it only by the empty leading below. */
const PROFILES = [
  { name: "iPhone 15/16, 14 Pro", width: 393, usable: 667 },
  { name: "iPhone 14, 13, 12", width: 390, usable: 659 },
];

/* If the line box ever overruns the fold by more than the leading it should
   have, the layout has drifted and the ink check is about to start failing. */
const MAX_LINE_BOX_OVERRUN_PX = 12;

/* At least this much of the heading must be on screen for it to read as a
   heading rather than a sliver. */
const MIN_VISIBLE_HEADING_PX = 24;

let nextProcess;
let browser;

try {
  const port = await getUnusedPort();
  const url = `http://127.0.0.1:${port}/`;
  nextProcess = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: "ignore", windowsHide: true },
  );
  await waitForPage(url, nextProcess);

  browser = await chromium.launch({ headless: true });

  for (const profile of PROFILES) {
    const page = await browser.newPage({
      viewport: { width: profile.width, height: 852 },
    });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, 0));

    const geometry = await page.evaluate(() => {
      const heading = [...document.querySelectorAll("h2")].find((node) =>
        /^The Fee Calculator/i.test(node.textContent.trim()),
      );
      const header = document.querySelector("header");
      const headingBox = heading.getBoundingClientRect();
      const style = getComputedStyle(heading);
      const fontSize = parseFloat(style.fontSize);
      const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;

      /* Where the letters actually end. The line box's top carries half the
         leading; the baseline sits an ascent below that; ink stops at the
         deepest descender, which this string does not have. */
      const context = document.createElement("canvas").getContext("2d");
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const metrics = context.measureText(heading.textContent.trim());
      const halfLeading = (lineHeight - fontSize) / 2;
      const baseline =
        headingBox.top + window.scrollY + halfLeading + metrics.fontBoundingBoxAscent;

      return {
        headerHeight: Math.round(header.getBoundingClientRect().height),
        headingTop: Math.round(headingBox.top + window.scrollY),
        headingBottom: Math.round(headingBox.bottom + window.scrollY),
        inkBottom: Math.round(baseline + metrics.actualBoundingBoxDescent),
      };
    });

    assert.equal(
      geometry.headerHeight,
      70,
      `${profile.name}: expanded mobile header should be 70px, the 7px trimmed from it pays for the gaps below`,
    );

    assert.ok(
      geometry.inkBottom <= profile.usable,
      `${profile.name}: the letters of "The Fee Calculator" end at ${geometry.inkBottom}px against ${profile.usable}px` +
        ` of usable height — the heading's words are cut off on the first screen.`,
    );

    assert.ok(
      geometry.headingBottom - profile.usable <= MAX_LINE_BOX_OVERRUN_PX,
      `${profile.name}: the heading's line box overruns the fold by ${geometry.headingBottom - profile.usable}px,` +
        ` past the ${MAX_LINE_BOX_OVERRUN_PX}px that should be empty leading. The layout has drifted — re-measure before shipping.`,
    );

    assert.ok(
      profile.usable - geometry.headingTop >= MIN_VISIBLE_HEADING_PX,
      `${profile.name}: only ${profile.usable - geometry.headingTop}px of the heading is on screen,` +
        ` under the ${MIN_VISIBLE_HEADING_PX}px needed to read as a heading`,
    );

    await page.close();
  }

  /* Today's other two asks, measured rather than matched: both rules bound the
     same column, and each verdict sits over its own list. */
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });

  const ruleWidths = await page
    .locator("[data-difference-summary] div.col-span-2")
    .evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().width)));
  assert.equal(ruleWidths.length, 2, "the results block is bounded by a header rule and a subtraction rule");
  assert.equal(
    ruleWidths[0],
    ruleWidths[1],
    `both rules must span the same full width, got ${JSON.stringify(ruleWidths)}`,
  );

  const verdicts = await page.evaluate(() => {
    const centre = (node) => {
      const box = node.getBoundingClientRect();
      return Math.round(box.left + box.width / 2);
    };
    return ["What Smarter Way Wealth uses", "Costs Smarter Way Wealth does not carry"].map((label) => {
      const list = document.querySelector(`ul[aria-label="${label}"]`);
      const verdict = list.parentElement.querySelector("p");
      return {
        text: verdict.textContent.trim(),
        colour: getComputedStyle(verdict).color,
        offset: Math.abs(centre(verdict) - centre(list)),
      };
    });
  });

  assert.equal(verdicts[0].text, "Yes");
  assert.equal(verdicts[1].text, "No");
  assert.equal(verdicts[0].colour, "rgb(16, 136, 67)", "Yes carries the same green as the checks beneath it");
  assert.equal(verdicts[1].colour, "rgb(198, 40, 40)", "No carries the same red as the dollar signs beneath it");
  for (const verdict of verdicts) {
    assert.ok(
      verdict.offset <= 2,
      `"${verdict.text}" should sit centred over its own column, off by ${verdict.offset}px`,
    );
  }

  console.log(
    `First-screen geometry passed: header 70px, "The Fee Calculator" above the fold on ${PROFILES.length} iPhone profiles,` +
      " results bounded by two equal full-width rules, Yes/No centred over their columns.",
  );
} finally {
  await browser?.close();
  if (nextProcess && nextProcess.exitCode === null) {
    nextProcess.kill();
  }
}
