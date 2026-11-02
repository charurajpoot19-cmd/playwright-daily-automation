const { test, expect } = require('../fixtures/fixtures');

test.describe('Mobile Responsiveness', () => {
  test('TC_MOB_001 - Home page loads on mobile without horizontal scroll @smoke', async ({ page, homePage }) => {
    await homePage.open();
    await expect(page).toHaveTitle(/Oncquest/i);
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('TC_MOB_002 - Login page is usable on mobile @regression', async ({ loginPage }) => {
    await loginPage.open();
    await expect(loginPage.mobileInput).toBeVisible();
    await expect(loginPage.continueBtn).toBeVisible();
  });

  test('TC_MOB_003 - Home collection form is usable on mobile @regression', async ({ homeCollectionPage }) => {
    await homeCollectionPage.open();
    await homeCollectionPage.submitBtn.scrollIntoViewIfNeeded();
    await expect(homeCollectionPage.submitBtn).toBeVisible();
  });
});
