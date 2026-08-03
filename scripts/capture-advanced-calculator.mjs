/**
 * Captures real frames of the smarterwaywealth.com/save Advanced Calculator
 * (the market-replay chart card) for the AdvancedCalculatorCta preview loop.
 *
 * Runs fully headless — no visible window. Output:
 *   public/advanced-calculator-preview/frame-N.jpg
 *   (frame-1 = steady-return view; frames 2-6 = the market replay in motion)
 *
 * Re-run whenever the firm site's calculator design changes:
 *   node scripts/capture-advanced-calculator.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";

const OUT_DIR = "public/advanced-calculator-preview";
const URL =
  "https://smarterwaywealth.com/save?portfolio=1000000&years=20&growth=8&fee=1&flat=1200&mfe=0";

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 760, height: 1400 },
  deviceScaleFactor: 2,
});
await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(2000);

async function clickButton(text) {
  return page.evaluate((t) => {
    const btn = Array.from(document.querySelectorAll("button")).find(
      (b) => (b.textContent || "").trim() === t && b.offsetWidth > 0,
    );
    if (btn) btn.click();
    return Boolean(btn);
  }, text);
}

let n = 0;
/**
 * The growth chart moves between views, so the crop is recomputed per frame
 * from the largest svg: market view anchors at the Play/Restart row and
 * includes the chart legend; steady view includes the comparison bars below.
 */
async function measure(mode) {
  return page.evaluate((m) => {
    const abs = (el) => {
      const b = el.getBoundingClientRect();
      return { x: b.left, y: b.top + window.scrollY, w: b.width, h: b.height };
    };
    const svg = Array.from(document.querySelectorAll("svg"))
      .filter((c) => c.clientWidth > 250 && c.clientHeight > 100)
      .map(abs)
      .sort((a, b) => b.w * b.h - a.w * a.h)[0];
    let y1;
    let y2;
    if (m === "market") {
      const restart = Array.from(document.querySelectorAll("button")).find(
        (b) => (b.textContent || "").trim() === "Restart" && b.offsetWidth > 0,
      );
      y1 = (restart ? abs(restart).y : svg.y - 220) - 14;
      y2 = svg.y + svg.h + 58;
    } else {
      y1 = svg.y - 14;
      y2 = svg.y + svg.h + 185;
    }
    return { x: svg.x - 14, y: y1, w: svg.w + 28, h: y2 - y1 };
  }, mode);
}

async function shot(mode) {
  n += 1;
  // Park the region 240px down so the site's sticky header (logo strip +
  // savings bar, ~220px) cannot overlay the captured area — then RE-measure,
  // because the header collapses on first scroll and shifts the layout.
  let r = await measure(mode);
  await page.evaluate((top) => window.scrollTo(0, Math.max(0, top - 240)), r.y);
  await page.waitForTimeout(250);
  r = await measure(mode);
  await page.evaluate((top) => window.scrollTo(0, Math.max(0, top - 240)), r.y);
  await page.waitForTimeout(150);
  r = await measure(mode);
  const sy = await page.evaluate(() => window.scrollY);
  await page.screenshot({
    path: `${OUT_DIR}/frame-${n}.jpg`,
    type: "jpeg",
    quality: 75,
    clip: { x: r.x, y: r.y - sy, width: r.w, height: r.h },
  });
  console.log(`frame-${n}.jpg`, JSON.stringify(r));
}

// Frame 1: steady-return view (full curve + comparison bars).
await clickButton("Steady return");
await page.waitForTimeout(900);
await shot("steady");

// Frames 2-6: the real market replay in motion.
await clickButton("Market return");
await page.waitForTimeout(700);
await clickButton("Restart");
await page.waitForTimeout(300);
await clickButton("Play");
for (let i = 0; i < 5; i++) {
  await page.waitForTimeout(750);
  await shot("market");
}

await browser.close();
console.log("done");
