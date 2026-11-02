const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

test.describe('Book a Test', () => {
  test.beforeEach(async ({ bookTestPage }) => {
    await bookTestPage.open();
  });

  test('TC_BOOK_001 - Tests listing is displayed @smoke', async ({ bookTestPage }) => {
    await expect(bookTestPage.heading).toBeVisible();
    await expect(bookTestPage.testCards.first()).toBeVisible();
    expect(await bookTestPage.testCards.count()).toBeGreaterThan(5);
  });

  test('TC_BOOK_002 - Every test card has a BOOK NOW button @regression', async ({ bookTestPage }) => {
    await expect(bookTestPage.bookNowBtns.first()).toBeVisible();
    expect(await bookTestPage.bookNowBtns.count()).toBeGreaterThanOrEqual(await bookTestPage.testCards.count());
  });

  test('TC_BOOK_003 - BOOK NOW opens test details @regression', async ({ page, bookTestPage }) => {
    const startUrl = page.url();
    await bookTestPage.bookNowBtns.first().click();
    await expect(page).not.toHaveURL(startUrl);
  });
});

test.describe('Find a Centre', () => {
  test.beforeEach(async ({ centresPage }) => {
    await centresPage.open();
  });

  test('TC_CEN_001 - Centre page shows map heading and filters @smoke', async ({ centresPage }) => {
    await expect(centresPage.heading).toBeVisible();
    await expect(centresPage.labTypeSelect).toBeVisible();
    await expect(centresPage.zoneSelect).toBeVisible();
    await expect(centresPage.stateSelect).toBeVisible();
  });

  test('TC_CEN_002 - Selecting a state populates the city filter @regression', async ({ centresPage }) => {
    const initialCityOptions = await centresPage.citySelect.locator('option').count();
    // Not index 1: the first state (Andaman and Nicobar) has no centres, so no cities
    await centresPage.stateSelect.selectOption({ label: testData.centreState });
    await expect
      .poll(async () => centresPage.citySelect.locator('option').count())
      .toBeGreaterThan(initialCityOptions);
  });

  test('TC_CEN_003 - Centre listing shows share buttons @regression', async ({ centresPage }) => {
    // The listing loads after the page, so wait for it instead of counting once
    await expect.poll(() => centresPage.shareButtons.count()).toBeGreaterThan(0);
  });
});
