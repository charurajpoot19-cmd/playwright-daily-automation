const { test, expect } = require('../fixtures/fixtures');

test.describe('Offers and Discounts', () => {
  test.beforeEach(async ({ offersPage }) => {
    await offersPage.open();
  });

  test('TC_OFF_001 - Heading, intro text and breadcrumb are displayed @smoke', async ({ offersPage }) => {
    await expect(offersPage.heading).toBeVisible();
    await expect(offersPage.introText).toBeVisible();
    await expect(offersPage.breadcrumbCurrent).toHaveText('All Offers');
  });

  test('TC_OFF_002 - Offer banners are displayed @smoke', async ({ offersPage }) => {
    await expect(offersPage.offerImages.first()).toBeVisible();
    expect(await offersPage.offerImages.count()).toBeGreaterThan(0);
  });

  test('TC_OFF_003 - No offer banner is broken @regression', async ({ offersPage }) => {
    await expect(offersPage.offerImages.first()).toBeVisible();
    await offersPage.expectImagesLoaded(offersPage.offerImages);
  });

  test('TC_OFF_004 - Breadcrumb Home link returns to the home page @regression', async ({ page, offersPage }) => {
    await offersPage.breadcrumbHome.click();
    await expect(page).toHaveURL(/oncquestlabs\.com\/$/);
  });

  test('TC_OFF_005 - KNOW MORE on the offer banners is clickable (known defect) @regression', async ({ offersPage }) => {
    test.fail(true, 'Site defect: KNOW MORE is part of the banner image and no banner has a link');
    await expect(offersPage.offerImages.first()).toBeVisible();
    await expect(offersPage.offerLinks.first()).toBeVisible({ timeout: 3_000 });
  });

  test('TC_OFF_006 - Offer banners have alt text (known defect) @regression', async ({ offersPage }) => {
    test.fail(true, 'Site defect: every offer image has an empty alt, so screen readers skip the offer text');
    await expect(offersPage.offerImages.first()).toBeVisible();
    const missingAlt = await offersPage.offerImages.evaluateAll((list) => list.filter((img) => !img.alt).length);
    expect(missingAlt).toBe(0);
  });
});
