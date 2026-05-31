const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const OUT = __dirname;
const CONCEPTS = [
  ["01A", "rounded-soft-card"],
  ["01B", "soft-green-wash"],
  ["01C", "raised-paper-panel"],
  ["01D", "advisor-soft-panel"],
  ["01E", "advisor-green-band"],
  ["01F", "advisor-nameplate"],
];
const DSF = 200 / 96;

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const [num, slug] of CONCEPTS) {
    const base = `SWW_YAPTOM_Finalists_${num}_${slug}`;
    const htmlPath = path.join(OUT, `${base}_Proof.html`);
    if (!fs.existsSync(htmlPath)) {
      console.error("missing", htmlPath);
      continue;
    }

    const context = await browser.newContext({
      viewport: { width: 920, height: 1500 },
      deviceScaleFactor: DSF,
    });
    const page = await context.newPage();
    await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
    await page.addStyleTag({
      content:
        ".trim::before{display:none!important}.corner,.label-front{display:none!important}body{background:#fff!important}.stage{padding:0!important;gap:0!important}.card{box-shadow:none!important}",
    });
    await page.evaluate(() => (document.fonts && document.fonts.ready ? document.fonts.ready : null));
    await page.waitForTimeout(400);

    for (const side of ["front", "back"]) {
      const element = await page.$(`#${side}`);
      if (!element) {
        console.error(`no #${side} in ${base}`);
        continue;
      }

      const outPng = path.join(OUT, `${base}_${side === "front" ? "Front" : "Back"}_Proof.png`);
      await element.screenshot({ path: outPng, omitBackground: false });
      console.log("wrote", path.basename(outPng));
    }

    await context.close();
  }

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
