const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

test.describe("Quick Link's", () => {
  test.beforeEach(async ({ quickLinksPage }) => {
    await quickLinksPage.open();
    await expect(quickLinksPage.cards.first()).toBeVisible();
  });

  test('TC_QL_001 - Heading and breadcrumb are displayed @smoke', async ({ quickLinksPage }) => {
    await expect(quickLinksPage.heading).toBeVisible();
    await expect(quickLinksPage.breadcrumbCurrent).toHaveText("Quick Link's");
  });

  test('TC_QL_002 - All quick link cards are listed @smoke', async ({ quickLinksPage }) => {
    await expect(quickLinksPage.cards.locator('h4.infobox_title')).toHaveText(testData.quickLinks.map(({ name }) => name));
  });

  test('TC_QL_003 - Every card has a description @regression', async ({ quickLinksPage }) => {
    const withoutText = await quickLinksPage.cards.evaluateAll((cards) =>
      cards.filter((card) => !card.querySelector('p.quickLink')?.textContent.trim()).length);
    expect(withoutText).toBe(0);
  });

  test('TC_QL_004 - No card image is broken @regression', async ({ quickLinksPage }) => {
    await quickLinksPage.expectImagesLoaded(quickLinksPage.cardImages);
  });

  for (const [index, { name, path, heading }] of testData.quickLinks.entries()) {
    test(`TC_QL_${String(index + 5).padStart(3, '0')} - "${name}" KNOW MORE opens ${path} in a new tab @regression`, async ({ page, quickLinksPage }) => {
      const [popup] = await Promise.all([page.waitForEvent('popup'), quickLinksPage.knowMoreLink(name).click()]);
      await expect(popup).toHaveURL(new RegExp(`${path}$`));
      // The site answers 200 for any path, so the page content is what proves the link works
      await expect(popup.getByRole('heading', { name: heading }).first()).toBeAttached();
      await popup.close();
    });
  }
});
