const path = require("path");
const { chromium } = require("playwright");

const OUT = __dirname;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1900 }, deviceScaleFactor: 1 });
  const htmlPath = path.join(OUT, "SWW_YAPTOM_StyleB_ContactSheet.html");
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(OUT, "SWW_YAPTOM_StyleB_ContactSheet.png"),
    fullPage: true,
    omitBackground: false,
  });
  console.log("wrote SWW_YAPTOM_StyleB_ContactSheet.png");
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
