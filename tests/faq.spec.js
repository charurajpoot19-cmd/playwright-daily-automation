const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

test.describe("FAQ's", () => {
  test.beforeEach(async ({ faqPage }) => {
    await faqPage.open();
    await expect(faqPage.questions.first()).toBeVisible();
  });

  test.describe('Categories', () => {
    test('TC_FAQ_001 - Heading, intro text and breadcrumb are displayed @smoke', async ({ faqPage }) => {
      await expect(faqPage.heading).toBeVisible();
      await expect(faqPage.introText).toBeVisible();
      await expect(faqPage.breadcrumbCurrent).toHaveText('Frequently Asked Question');
    });

    test('TC_FAQ_002 - All categories are listed and the first is selected @smoke', async ({ faqPage }) => {
      await expect(faqPage.tabs).toHaveText([...testData.faqTabs.map(({ name }) => name), 'Test Specific']);
      await expect(faqPage.tabs.first()).toHaveClass(/active/);
    });

    for (const [index, { name, firstQuestion }] of testData.faqTabs.entries()) {
      test(`TC_FAQ_00${index + 3} - "${name}" category shows its questions @regression`, async ({ faqPage }) => {
        await faqPage.tab(name).locator('a').click();
        await expect(faqPage.tab(name)).toHaveClass(/active/);
        await expect(faqPage.questions.first()).toContainText(firstQuestion);
      });
    }

    test('TC_FAQ_006 - Only one category is selected at a time @regression', async ({ faqPage }) => {
      await faqPage.tab('Generic FAQ').locator('a').click();
      await expect(faqPage.tab('Generic FAQ')).toHaveClass(/active/);
      await expect(faqPage.tabs.first()).not.toHaveClass(/active/);
    });
  });

  test.describe('Questions', () => {
    test('TC_FAQ_007 - Clicking a question shows its answer @smoke', async ({ faqPage }) => {
      await expect(faqPage.openAnswers).toHaveCount(0);
      await faqPage.questions.first().click();
      await expect(faqPage.openAnswers).toBeVisible();
      await expect(faqPage.openAnswers).not.toBeEmpty();
      await expect(faqPage.questionArrow(faqPage.questions.first())).toHaveClass(/fa-angle-up/);
    });

    test('TC_FAQ_008 - Clicking an open question hides its answer @regression', async ({ faqPage }) => {
      await faqPage.questions.first().click();
      await expect(faqPage.openAnswers).toBeVisible();
      await faqPage.questions.first().click();
      await expect(faqPage.openAnswers).toHaveCount(0);
      await expect(faqPage.questionArrow(faqPage.questions.first())).toHaveClass(/fa-angle-down/);
    });

    test('TC_FAQ_009 - Opening a question closes the one already open @regression', async ({ faqPage }) => {
      await faqPage.questions.nth(0).click();
      await expect(faqPage.openAnswers).toHaveCount(1);
      await faqPage.questions.nth(1).click();
      await expect(faqPage.questionArrow(faqPage.questions.nth(1))).toHaveClass(/fa-angle-up/);
      await expect(faqPage.openAnswers).toHaveCount(1);
      await expect(faqPage.questionArrow(faqPage.questions.nth(0))).toHaveClass(/fa-angle-down/);
    });
  });

  test.describe('Popular Tests', () => {
    test('TC_FAQ_010 - Popular Tests panel lists links to test pages @regression', async ({ faqPage }) => {
      await expect(faqPage.popularTestLinks.first()).toBeVisible();
      await expect(faqPage.popularTestLinks.first()).toHaveAttribute('href', /\/test\//);
    });

    test('TC_FAQ_011 - A Popular Tests link opens its test page @regression', async ({ page, faqPage }) => {
      const url = await faqPage.popularTestLinks.first().getAttribute('href');
      await faqPage.popularTestLinks.first().click();
      await expect(page).toHaveURL(url);
    });
  });

  test('TC_FAQ_012 - "Test Specific" category has questions (known defect) @regression', async ({ faqPage }) => {
    test.fail(true, "Site defect: this category is empty and only shows No FAQ's Available");
    await faqPage.tab('Test Specific').locator('a').click();
    await expect(faqPage.tab('Test Specific')).toHaveClass(/active/);
    await expect(faqPage.emptyMessage).toBeHidden({ timeout: 3_000 });
  });
});
