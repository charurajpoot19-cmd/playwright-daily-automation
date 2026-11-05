const BasePage = require('./BasePage');

class FaqPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: "FAQ's", level: 2 });
    this.introText = page.getByText('Commonly asked questions about diagnostic lab tests and procedures.');

    // The page has two `.faq_wrap` rows: the tabbed FAQ, and "Popular Tests" below it on every tab
    const faqRow = page.locator('.faq_wrap').filter({ has: page.locator('.left') });
    this.tabs = faqRow.locator('.left li');
    this.questions = faqRow.locator('.right .question');
    this.openAnswers = faqRow.locator('.right .answer.active');
    this.emptyMessage = faqRow.getByText("No FAQ's Available");

    const popularRow = page.locator('.faq_wrap').filter({ hasNot: page.locator('.left') });
    this.popularTestLinks = popularRow.locator('a.mylistcolor');
  }

  /** Category on the left, e.g. "Generic FAQ". */
  tab(name) {
    return this.tabs.filter({ hasText: name });
  }

  /** The arrow on a question points up while its answer is open. */
  questionArrow(question) {
    return question.locator('i.fa');
  }

  async open() {
    return this.goto('/faq');
  }
}

module.exports = FaqPage;
