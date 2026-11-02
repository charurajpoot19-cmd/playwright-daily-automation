const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

test.describe('Footer', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.footer.scrollIntoViewIfNeeded();
  });

  test('TC_FOOT_001 - Footer section headings are visible @smoke', async ({ homePage }) => {
    for (const heading of ['COMPANY', 'PATIENTS', 'DOCTORS', 'PARTNER WITH US', 'ACCREDITATIONS']) {
      await expect.soft(homePage.footer.getByRole('heading', { name: heading }).first()).toBeVisible();
    }
  });

  for (const { name, path } of testData.footerLinks) {
    test(`TC_FOOT - "${name}" link navigates to ${path} @regression`, async ({ page, homePage }) => {
      await homePage.footerLink(name).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    });
  }

  for (const { name, host } of testData.socialLinks) {
    test(`TC_FOOT - ${name} social link is correct @regression`, async ({ homePage }) => {
      await expect(homePage.socialLink(host)).toHaveAttribute('href', new RegExp(host));
    });
  }
});

test.describe('SEO & Basic Quality', () => {
  test('TC_SEO_001 - Home page has meta description @regression', async ({ page }) => {
    await page.goto('/');
    const description = await page.locator('meta[name="description"]').first().getAttribute('content');
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(50);
  });

  test('TC_SEO_002 - Home page has exactly one H1 @regression', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:visible')).toHaveCount(1);
  });

  test('TC_SEO_003 - Site is served over HTTPS @smoke', async ({ page }) => {
    await page.goto('/');
    expect(page.url()).toMatch(/^https:\/\//);
  });

  test('TC_SEO_004 - Home page DOM is ready within 10 seconds @regression', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    test.info().annotations.push({ type: 'load-time-ms', description: String(loadTime) });
    expect(loadTime).toBeLessThan(10_000);
  });
});
