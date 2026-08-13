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
  { name: "iPhone 15/16, 14 Pro", width: 393, usable: 667, inkMustClear: true },
  { name: "iPhone 14, 13, 12", width: 390, usable: 659, inkMustClear: true },
  /* 375px is this project's mobile-first baseline, so it is measured — but the
     heading was already below the fold on these two before any of this work,
     and David accepted that in as many words: "That may partially obscure 'the
     fee calculator' on some smaller phones, but I'm willing to live with that"
     (2026-08-11). Asserting clearance here would assert a fiction. What is
     worth locking is that the accepted shortfall does not quietly deepen. */
  { name: "iPhone 13 mini", width: 375, usable: 635, inkMustClear: false, maxShortfall: 26 },
  { name: "iPhone SE", width: 375, usable: 553, inkMustClear: false, maxShortfall: 108 },
];

/* If the line box ever overruns the fold by more than the leading it should
   have, the layout has drifted and the ink check is about to start failing. */
const MAX_LINE_BOX_OVERRUN_PX = 12;

/* Read a geometry sample repeatedly until two consecutive samples are
   identical, so a font swap or a recompile mid-measurement cannot hand back a
   number that was true for one frame. */
async function settle(read, label) {
  let previous = null;
  let lastError = null;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    let current = null;
    try {
      current = await read();
      lastError = null;
    } catch (error) {
      /* A read can land on a frame where the dev server has torn the DOM down
         mid-recompile and the heading genuinely is not there. That is the
         transient this helper exists to ride out, so keep waiting rather than
         failing the run — but remember the error, in case it turns out the
         element is missing permanently rather than momentarily. */
      lastError = error;
      previous = null;
    }

    if (current && previous && JSON.stringify(current) === JSON.stringify(previous)) {
      return current;
    }
    previous = current;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(
    lastError
      ? `${label}: never got a readable first screen — last error: ${lastError.message}`
      : `${label}: page geometry never settled — still reflowing after 12 reads, so no measurement here is trustworthy`,
  );
}

/* At least this much of the heading must be on screen for it to read as a
   heading rather than a sliver. */
const MIN_VISIBLE_HEADING_PX = 24;

/* David asked for this gap by eye and by number — 44px was too tight, 49px is
   what he approved (2026-08-12). It is not a free value: the "?" is centred as
   a share of the hero's height, so anything that changes the hero's padding
   moves it by a fraction and quietly reopens the question. */
const MARK_GAP_PX = 49;
const MARK_GAP_TOLERANCE_PX = 1;

let nextProcess;
let browser;
const measurements = [];

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
    /* The profile's REAL usable height, not a tall stand-in.
       This file measured every profile at 852px until 2026-08-12, which quietly
       defeated its own purpose: the calculator heading fades in only once it is
       40px inside the viewport, and at 852px it always is. The test therefore
       measured the animated-in state on every profile and reported the heading
       comfortably above the fold while, at an iPhone 14's actual height, it sat
       at rest with opacity 0 — invisible on the first screen. Measure the
       viewport the visitor has. */
    const page = await browser.newPage({
      viewport: { width: profile.width, height: profile.usable },
    });
    await page.goto(url, { waitUntil: "networkidle" });
    /* Every number below comes from the heading's font metrics. Until the
       webfont has actually loaded, canvas measureText answers for a fallback
       system font and the ink boundary is measured against glyphs no visitor
       will ever see. */
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));

    const readGeometry = () => page.evaluate(() => {
      const heading = [...document.querySelectorAll("h2")].find((node) =>
        /^The Fee Calculator/i.test(node.textContent.trim()),
      );
      if (!heading) throw new Error('no <h2> matching "The Fee Calculator" on the page');
      const header = document.querySelector("header");
      if (!header) throw new Error("no <header> on the page");
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

      /* The gap David actually looks at: header to the top of the decorative
         "?". Its line box tucks up under the header, so the box is the wrong
         thing to measure — only the ink is visible. Same method as above, plus
         the scaleY the mark carries. */
      const mark = document.querySelector("[data-hero-mark]");
      if (!mark) throw new Error("no [data-hero-mark] — the hero's decorative ? is gone or unhooked");
      const markStyle = getComputedStyle(mark);
      const markBox = mark.getBoundingClientRect();
      const markFontSize = parseFloat(markStyle.fontSize);
      const markLineHeight =
        markStyle.lineHeight === "normal" ? markFontSize * 1.2 : parseFloat(markStyle.lineHeight);
      context.font = `${markStyle.fontStyle} ${markStyle.fontWeight} ${markStyle.fontSize} ${markStyle.fontFamily}`;
      const markMetrics = context.measureText("?");
      const markInkTopUnscaled =
        (markLineHeight - markFontSize) / 2 +
        markMetrics.fontBoundingBoxAscent -
        markMetrics.actualBoundingBoxAscent;
      const markScale = markBox.height / markLineHeight;
      const markCentre = markBox.top + window.scrollY + markBox.height / 2;
      const markInkTop = markCentre + (markInkTopUnscaled - markLineHeight / 2) * markScale;

      /* Position is not visibility. The heading sits inside a block that fades
         in from opacity 0 once it is far enough into the viewport, so it can be
         measured comfortably above the fold and still be invisible to the
         visitor at rest. Multiply the chain. */
      let painted = 1;
      for (let node = heading; node && node !== document.body; node = node.parentElement) {
        painted *= parseFloat(getComputedStyle(node).opacity);
      }

      return {
        headerHeight: Math.round(header.getBoundingClientRect().height),
        headingTop: Math.round(headingBox.top + window.scrollY),
        headingBottom: Math.round(headingBox.bottom + window.scrollY),
        inkBottom: Math.round(baseline + metrics.actualBoundingBoxDescent),
        markGap: Math.round(markInkTop - (header.getBoundingClientRect().bottom + window.scrollY)),
        headingOpacity: Number(painted.toFixed(3)),
      };
    });

    /* A single read is not trustworthy here. Font swaps and the dev server's
       own recompiles reflow the page after load, and an earlier session burned
       three attempts on numbers that moved between runs for exactly this
       reason. Read until two consecutive samples agree. */
    const geometry = await settle(readGeometry, profile.name);

    assert.equal(
      geometry.headerHeight,
      62,
      `${profile.name}: expanded mobile header should be 62px — a 52px logo plus its breathing room. Every pixel trimmed here is already spent on the gaps below it.`,
    );

    assert.ok(
      Math.abs(geometry.markGap - MARK_GAP_PX) <= MARK_GAP_TOLERANCE_PX,
      `${profile.name}: the gap between the header and the top of the "?" is ${geometry.markGap}px,` +
        ` not the ${MARK_GAP_PX}px David approved. The hero's padding or the mark's anchor has moved.`,
    );

    const shortfall = geometry.inkBottom - profile.usable;
    measurements.push(
      `${profile.name}: ink ends ${geometry.inkBottom}px vs ${profile.usable}px usable, ? gap ${geometry.markGap}px`,
    );

    if (profile.inkMustClear) {
      /* Checked before position, because a heading that is above the fold and
         painted at opacity 0 is not on the first screen in any sense the
         visitor cares about. */
      assert.ok(
        geometry.headingOpacity > 0.99,
        `${profile.name}: "The Fee Calculator" is on the first screen but painted at opacity ${geometry.headingOpacity} —` +
          ` its entrance animation has not fired, so a visitor landing here sees blank space where the heading should be.` +
          ` It only appears once they scroll.`,
      );

      assert.ok(
        shortfall <= 0,
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
    } else {
      /* Known and accepted below the fold. The only regression that matters is
         it getting worse. */
      assert.ok(
        shortfall <= profile.maxShortfall,
        `${profile.name}: the heading now sits ${shortfall}px below the fold, past the ${profile.maxShortfall}px` +
          ` David accepted. Something above the calculator grew — this screen was already the compromise.`,
      );
    }

    await page.close();
  }

  /* Today's other two asks, measured rather than matched: both rules bound the
     same column, and each verdict deliberately sits three spacing units right
     of its own list. */
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
      if (!list) throw new Error(`no HOW list labelled "${label}" — its accessible name is gone`);
      const verdict = list.parentElement.querySelector("p");
      if (!verdict) throw new Error(`the list labelled "${label}" has no verdict heading above it`);
      return {
        text: verdict.textContent.trim(),
        colour: getComputedStyle(verdict).color,
        offset: centre(verdict) - centre(list),
      };
    });
  });

  assert.equal(verdicts.length, 2, "both HOW columns must carry a verdict");
  assert.equal(verdicts[0].text, "Yes");
  assert.equal(verdicts[1].text, "No");
  assert.equal(verdicts[0].colour, "rgb(16, 136, 67)", "Yes carries the same green as the checks beneath it");
  assert.equal(verdicts[1].colour, "rgb(198, 40, 40)", "No carries the same red as the dollar signs beneath it");
  for (const verdict of verdicts) {
    assert.ok(
      verdict.offset >= 10 && verdict.offset <= 14,
      `"${verdict.text}" should sit 12px right of its list, off by ${verdict.offset}px`,
    );
  }

  const cleared = PROFILES.filter((profile) => profile.inkMustClear).length;
  console.log(
    `First-screen geometry passed on ${PROFILES.length} iPhone profiles (${cleared} must clear the fold, ` +
      `${PROFILES.length - cleared} accepted below it):\n  ${measurements.join("\n  ")}\n` +
      "Header 62px; results bounded by two equal full-width rules; Yes/No 12px right of their lists.",
  );
} finally {
  await browser?.close();
  if (nextProcess && nextProcess.exitCode === null) {
    nextProcess.kill();
  }
}
