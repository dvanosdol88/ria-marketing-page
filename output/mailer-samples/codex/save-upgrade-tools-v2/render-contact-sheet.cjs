/* Render the v2 contact sheet HTML to PNG. */
const path = require('path');
const { chromium } = require('playwright');

const OUT = __dirname;
const HTML = path.join(OUT, 'SWW_YAPTOM_v2_ContactSheet.html');
const PNG = path.join(OUT, 'SWW_YAPTOM_v2_ContactSheet.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1500, height: 2200 }, deviceScaleFactor: 1.4 });
  const page = await context.newPage();
  await page.goto('file:///' + HTML.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready ? document.fonts.ready : null);
  await page.waitForTimeout(400);
  const el = await page.$('#sheet');
  await el.screenshot({ path: PNG, omitBackground: false });
  console.log('wrote', path.basename(PNG));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
