const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

const msg = testData.messages;

test.describe('Preventive Health Check Packages', () => {
  test.beforeEach(async ({ packagesPage }) => {
    await packagesPage.open();
  });

  test.describe('Package listing', () => {
    test.beforeEach(async ({ packagesPage }) => {
      await expect(packagesPage.packageCards.first()).toBeVisible();
    });

    test('TC_PHC_001 - Heading, breadcrumb and package cards are displayed @smoke', async ({ packagesPage }) => {
      await expect(packagesPage.heading).toBeVisible();
      await expect(packagesPage.breadcrumbCurrent).toHaveText('Preventive Health Check Packages');
      expect(await packagesPage.packageCards.count()).toBeGreaterThan(5);
    });

    test('TC_PHC_002 - Every package has +More and BOOK NOW @regression', async ({ packagesPage }) => {
      const cards = await packagesPage.packageCards.count();
      await expect(packagesPage.moreLinks).toHaveCount(cards);
      await expect(packagesPage.bookNowBtns).toHaveCount(cards);
    });

    test('TC_PHC_003 - Every package shows a price @regression', async ({ packagesPage }) => {
      const withoutPrice = await packagesPage.packageCards.evaluateAll((cards) =>
        cards.filter((card) => !/₹\s*\d+/.test(card.innerText)).map((card) => card.innerText.slice(0, 40)));
      expect(withoutPrice, `Packages without a price: ${withoutPrice.join(', ')}`).toHaveLength(0);
    });

    test('TC_PHC_004 - +More opens the package detail page @smoke', async ({ page, packagesPage }) => {
      const url = await packagesPage.moreLinks.first().getAttribute('href');
      await packagesPage.moreLinks.first().click();
      await expect(page).toHaveURL(new RegExp(`${url}$`));
      await expect(page.locator('h1:visible')).not.toBeEmpty();
      await expect(page.getByRole('heading', { name: 'MRP' })).toBeVisible();
    });

    // Only fills the cart in this browser's localStorage; no order is placed
    test('TC_PHC_005 - BOOK NOW adds the package to the cart and opens checkout @smoke', async ({ page, packagesPage }) => {
      await expect(packagesPage.cartBadge).toHaveAttribute('data-id', '0');
      await packagesPage.bookNowBtns.first().click();
      await expect(page).toHaveURL(/\/checkout$/);
      await expect(packagesPage.cartBadge).toHaveAttribute('data-id', '1');
      const [item] = await packagesPage.cartItems();
      await expect(page.getByText(item.TestName).first()).toBeVisible();
    });

    test('TC_PHC_006 - Sample report links return a PDF @regression', async ({ page, packagesPage }) => {
      expect(await packagesPage.sampleReportLinks.count()).toBeGreaterThan(0);
      const urls = await packagesPage.sampleReportLinks.evaluateAll((links) => links.map((link) => link.href));
      for (const url of urls) {
        const response = await page.request.get(url);
        expect.soft(response.status(), url).toBe(200);
        expect.soft(response.headers()['content-type'], url).toContain('application/pdf');
      }
    });

    test('TC_PHC_007 - Wellness article links are reachable @regression', async ({ page, packagesPage }) => {
      await expect(packagesPage.articlesHeading).toBeVisible();
      expect(await packagesPage.articleLinks.count()).toBeGreaterThan(0);
      const urls = await packagesPage.articleLinks.evaluateAll((links) => links.map((link) => link.href));
      for (const url of urls) {
        const response = await page.request.get(url);
        expect.soft(response.status(), url).toBe(200);
      }
    });

    test('TC_PHC_008 - Information sections are displayed @regression', async ({ page }) => {
      for (const name of testData.packages.contentHeadings) {
        await expect.soft(page.getByRole('heading', { name, level: 2 })).toBeVisible();
      }
    });
  });

  // Only validation scenarios are automated: a successful submission creates a real lead
  test.describe('Enquiry form', () => {
    test('TC_PHC_009 - All form fields are displayed @smoke', async ({ packagesPage: phc }) => {
      for (const field of [phc.nameInput, phc.mobileInput, phc.citySelect, phc.queryNatureSelect, phc.messageInput,
        phc.termsCheckbox, phc.submitBtn]) {
        await expect.soft(field).toBeVisible();
      }
    });

    test('TC_PHC_010 - Empty submit shows all mandatory field errors @regression', async ({ packagesPage: phc }) => {
      await phc.submitExpectingErrors();
      for (const text of [msg.nameRequired, msg.mobileRequired, msg.cityRequired, msg.termsRequired]) {
        await expect.soft(phc.errorWithText(text)).toBeVisible();
      }
    });

    test('TC_PHC_011 - Mobile number less than 10 digits shows error @regression', async ({ packagesPage: phc }) => {
      await phc.mobileInput.fill(testData.invalid.shortMobile);
      await phc.submitExpectingErrors();
      await expect(phc.errorWithText(msg.mobile10Digit)).toBeVisible();
    });

    test('TC_PHC_012 - Nature of Query has all options @regression', async ({ packagesPage: phc }) => {
      for (const option of testData.packages.queryNatures) {
        await expect.soft(phc.queryNatureSelect.locator('option', { hasText: option })).toBeAttached();
      }
    });
  });
});
