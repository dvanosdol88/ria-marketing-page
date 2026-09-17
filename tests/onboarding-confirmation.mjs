import assert from "node:assert/strict";
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.env.CONFIRMATION_BASE_URL || "http://localhost:4177";
const browser = await chromium.launch({ headless: true });
mkdirSync("output/onboarding-confirmation", { recursive: true });
try {
  for (const width of [375, 1440]) {
    for (const agreementSent of [false, true]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      // Exercise the real UI without creating a prospect or sending an agreement.
      await page.route("**/api/become-a-client", route => route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({ success: true, agreementSent }),
      }));
      await page.goto(`${base}/become-a-client`);
      await page.getByLabel("Your name").fill("Confirmation Test");
      await page.getByLabel("Email", { exact: true }).fill("confirmation@example.com");
      await page.getByLabel("What state do you live in?").selectOption("Connecticut");
      await page.getByRole("button", { name: "Send me the agreement" }).click();
      await page.waitForURL("**/become-a-client/confirmation**");
      const heading = page.getByRole("heading", { level: 1 });
      await heading.waitFor();
      assert.match(await heading.innerText(), /Thank you/);
      assert.equal(await page.getByText("Not sure yet?", { exact: true }).count(), 0);
      assert.equal(await page.locator("main form").count(), 0);
      assert.equal(await page.evaluate(() => window.scrollY), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.ok((await heading.boundingBox()).y < 400);
      const text = await page.locator("main").innerText();
      assert.ok(text.includes(agreementSent ? "have been sent" : "has not been emailed yet"));
      await page.screenshot({ path: `output/onboarding-confirmation/confirmation-${width}-${agreementSent}.png`, fullPage: true });
      await page.reload();
      await heading.waitFor();
      assert.match(await heading.innerText(), /Thank you/);
      console.log(`${width}px agreementSent=${agreementSent}: confirmation, top position, copy, refresh, no overflow PASS`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
