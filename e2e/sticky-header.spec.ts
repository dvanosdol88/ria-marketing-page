import { test, expect } from '@playwright/test';

test.describe('Sticky Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('header is visible at top of page', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');
    await expect(header).toBeVisible();
  });

  test('header has correct initial styling (not stuck)', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');

    // Initially at top, should have larger padding and no shadow
    await expect(header).toHaveClass(/pt-12/);
    await expect(header).toHaveClass(/pb-0/);
    await expect(header).not.toHaveClass(/shadow-md/);

    // Title should be larger initially
    const title = header.locator('h1');
    await expect(title).toHaveClass(/text-4xl/);
  });

  test('header becomes sticky with shadow after scrolling past 50px', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');

    // Scroll down past the threshold (50px)
    await page.evaluate(() => window.scrollTo(0, 100));

    // Wait for transition to complete
    await page.waitForTimeout(400);

    // Should now have sticky styling
    await expect(header).toHaveClass(/py-4/);
    await expect(header).toHaveClass(/shadow-md/);

    // Title should be smaller when stuck
    const title = header.locator('h1');
    await expect(title).toHaveClass(/text-2xl/);
  });

  test('header returns to initial state when scrolling back to top', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');

    // First scroll down
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(400);

    // Verify it's stuck
    await expect(header).toHaveClass(/shadow-md/);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    // Should be back to initial state
    await expect(header).toHaveClass(/pt-12/);
    await expect(header).not.toHaveClass(/shadow-md/);
  });

  test('header stays at top of viewport when scrolling (sticky behavior)', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');

    // Scroll down significantly
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(400);

    // Get header position
    const boundingBox = await header.boundingBox();

    // Header should be at top of viewport (y = 0)
    expect(boundingBox?.y).toBe(0);
  });

  test('header displays savings amount correctly', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');
    const title = header.locator('h1');

    // Title should contain "What would you do with" and a currency amount
    const titleText = await title.textContent();
    expect(titleText).toContain('What would you do with');
    expect(titleText).toMatch(/\$[\d,]+/);
  });

  test('header has smooth transition animations', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');

    // Check that transition classes are present
    await expect(header).toHaveClass(/transition-all/);
    await expect(header).toHaveClass(/duration-300/);

    // Title should also have transitions
    const title = header.locator('h1');
    await expect(title).toHaveClass(/transition-all/);
    await expect(title).toHaveClass(/duration-300/);
  });

  test('header contains quiz link', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');

    // Should contain quiz component
    const quizText = header.getByText('Take our quiz');
    await expect(quizText).toBeVisible();
  });
});

test.describe('Sticky Header - Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('header adapts text size for mobile (initial state)', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');
    const title = header.locator('h1');

    // On mobile, should use responsive text sizes
    await expect(title).toHaveClass(/text-4xl/);
    await expect(title).toHaveClass(/sm:text-5xl/);
  });

  test('header adapts text size for mobile (stuck state)', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');

    // Scroll to trigger sticky state
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(400);

    const title = header.locator('h1');
    await expect(title).toHaveClass(/text-2xl/);
    await expect(title).toHaveClass(/sm:text-3xl/);
  });

  test('header remains sticky on mobile after scroll', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');

    // Scroll down on mobile
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(400);

    // Check header stays at top
    const boundingBox = await header.boundingBox();
    expect(boundingBox?.y).toBe(0);

    // Check it has shadow
    await expect(header).toHaveClass(/shadow-md/);
  });
});

test.describe('Sticky Header - Large Desktop Viewport', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('header displays correctly on large screens', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');
    await expect(header).toBeVisible();

    // Title should use larger responsive sizes
    const title = header.locator('h1');
    await expect(title).toHaveClass(/sm:text-5xl/);
  });

  test('sticky behavior works on large screens', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 150));
    await page.waitForTimeout(400);

    // Should be stuck
    await expect(header).toHaveClass(/shadow-md/);
    await expect(header).toHaveClass(/py-4/);

    const boundingBox = await header.boundingBox();
    expect(boundingBox?.y).toBe(0);
  });
});

test.describe('Sticky Header - Scroll Threshold Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('header is not stuck at exactly 50px scroll', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');

    // Scroll to exactly 50px
    await page.evaluate(() => window.scrollTo(0, 50));
    await page.waitForTimeout(400);

    // Should NOT be stuck yet (threshold is > 50)
    await expect(header).toHaveClass(/pt-12/);
    await expect(header).not.toHaveClass(/shadow-md/);
  });

  test('header becomes stuck at 51px scroll', async ({ page }) => {
    const header = page.locator('.sticky.top-0.z-50');

    // Scroll to 51px (just past threshold)
    await page.evaluate(() => window.scrollTo(0, 51));
    await page.waitForTimeout(400);

    // Should now be stuck
    await expect(header).toHaveClass(/py-4/);
    await expect(header).toHaveClass(/shadow-md/);
  });
});
