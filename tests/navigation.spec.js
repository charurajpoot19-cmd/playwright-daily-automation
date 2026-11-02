const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

test.describe('Header Navigation', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  for (const [menu, subMenus] of Object.entries(testData.headerMenus)) {
    for (const { name, path } of subMenus) {
      test(`TC_NAV - ${menu} > ${name} navigates to ${path} @regression`, async ({ page, homePage }) => {
        await homePage.navigateViaHeader(menu, name);
        await expect(page).toHaveURL(new RegExp(`${path}$`));
      });
    }
  }

  test('TC_NAV_NETWORK - Network menu opens centres page @smoke', async ({ page, homePage }) => {
    await homePage.headerMenu('Network').click();
    await expect(page).toHaveURL(/\/centres$/);
  });

  test('TC_NAV_UPLOAD - Upload Prescription menu opens upload page @smoke', async ({ page, homePage }) => {
    await homePage.headerMenu('Upload Prescription').click();
    await expect(page).toHaveURL(/\/upload-prescription$/);
  });

  test('TC_NAV_LOGIN - Login dropdown contains Login link @regression', async ({ page, homePage }) => {
    await homePage.clickHeaderLoginLink();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('Page availability', () => {
  for (const { path, title } of testData.pages) {
    test(`TC_PAGE - ${path} loads with HTTP 200 @smoke`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
    });
  }
});
