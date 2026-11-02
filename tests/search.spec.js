const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

test.describe('Header Search', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC_SRCH_001 - Typing a valid keyword shows suggestions @smoke', async ({ homePage }) => {
    await homePage.searchFor(testData.search.validKeyword);
    await expect(homePage.searchSuggestions.first()).toBeVisible();
    expect(await homePage.searchSuggestions.count()).toBeGreaterThan(0);
  });

  test('TC_SRCH_002 - Suggestions contain the expected test @regression', async ({ homePage }) => {
    await homePage.searchFor(testData.search.validKeyword);
    await expect(
      homePage.searchSuggestions.filter({ hasText: testData.search.expectedSuggestion }).first(),
    ).toBeVisible();
  });

  test('TC_SRCH_003 - Clicking a suggestion opens the test detail page @smoke', async ({ page, homePage }) => {
    await homePage.searchFor(testData.search.validKeyword);
    await homePage.searchSuggestions
      .filter({ hasText: new RegExp(`^${testData.search.expectedSuggestion}$`) })
      .click();
    await expect(page).toHaveURL(new RegExp(`${testData.search.expectedSuggestionUrl}$`));
  });

  test('TC_SRCH_004 - Search is case insensitive @regression', async ({ homePage }) => {
    await homePage.searchFor(testData.search.validKeyword.toUpperCase());
    await expect(
      homePage.searchSuggestions.filter({ hasText: testData.search.expectedSuggestion }).first(),
    ).toBeVisible();
  });

  test('TC_SRCH_005 - Invalid keyword shows no suggestions @regression', async ({ homePage }) => {
    await homePage.searchFor(testData.search.invalidKeyword);
    // Wait for the search to finish rather than a fixed time; the API can take several seconds
    await expect(homePage.searchNoResults).toBeVisible();
    await expect(homePage.searchSuggestions).toHaveCount(0);
  });

  test('TC_SRCH_006 - Clearing the search box hides suggestions @regression', async ({ homePage }) => {
    await homePage.searchFor(testData.search.validKeyword);
    await expect(homePage.searchSuggestions.first()).toBeVisible();
    await homePage.searchInput.fill('');
    await expect(homePage.searchSuggestions).toHaveCount(0);
  });
});
