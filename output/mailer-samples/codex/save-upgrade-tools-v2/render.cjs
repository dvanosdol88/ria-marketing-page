/*
  Render each concept proof HTML to two PNGs (Front + Back) at 200 px/in (1750 × 1300).
*/
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const OUT = __dirname;
const CONCEPTS = [
  ['01', 'editorial-rule'],
  ['02', 'structured-columns'],
  ['03', 'callout-band'],
  ['04', 'paper-and-ink'],
  ['05', 'chart-led-front'],
  ['06', 'print-safe-classic'],
];

// 8.75 in × 96 px/in = 840 CSS px wide. For 200 px/in PNG we need DSF = 200/96 = 2.0833333...
const DSF = 200 / 96;

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [num, slug] of CONCEPTS) {
    const base = `SWW_YAPTOM_v2_${num}_${slug}`;
    const htmlPath = path.join(OUT, `${base}_Proof.html`);
    if (!fs.existsSync(htmlPath)) {
      console.error('missing', htmlPath);
      continue;
    }
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    const context = await browser.newContext({
      viewport: { width: 920, height: 1500 }, // wide enough to fit the 840px card + padding
      deviceScaleFactor: DSF,
    });
    const page = await context.newPage();
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    // Hide trim guides & on-screen-only labels in the rendered PNGs (the HTML proof still shows them in browsers).
    await page.addStyleTag({
      content: `.trim::before { display: none !important; } .corner { display: none !important; } .label-front, .label-back { display: none !important; } body { background: #ffffff !important; } .stage { padding: 0 !important; gap: 0 !important; } .card { box-shadow: none !important; }`,
    });
    await page.evaluate(() => document.fonts && document.fonts.ready ? document.fonts.ready : null);
    await page.waitForTimeout(400);

    for (const side of ['front', 'back']) {
      const el = await page.$(`#${side}`);
      if (!el) { console.error('no #' + side + ' in', base); continue; }
      const outPng = path.join(OUT, `${base}_${side === 'front' ? 'Front' : 'Back'}_Proof.png`);
      await el.screenshot({ path: outPng, omitBackground: false });
      console.log('wrote', path.basename(outPng));
    }
    await context.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
