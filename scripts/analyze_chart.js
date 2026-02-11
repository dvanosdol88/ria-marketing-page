const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Locate the chart column
    const chartSection = page.locator('.chart-column');
    
    if (await chartSection.count() === 0) {
        console.log("Chart column not found");
        await browser.close();
        return;
    }

    // Take a screenshot of the specific element
    await chartSection.screenshot({ path: '.playwright-mcp/current-chart-look.png' });
    
    // Get computed styles
    const styles = await chartSection.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        backgroundColor: s.backgroundColor,
        boxShadow: s.boxShadow,
        border: s.border,
        borderRadius: s.borderRadius,
        padding: s.padding,
        width: s.width,
        height: s.height
      };
    });

    console.log(JSON.stringify(styles, null, 2));
    
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
