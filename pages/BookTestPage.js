const BasePage = require('./BasePage');

class BookTestPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Tests', level: 1 });
    this.testCards = page.locator('h3.infobox_title');
    this.bookNowBtns = page.locator('a.booknow');
  }

  async open() {
    return this.goto('/book-a-test');
  }
}

module.exports = BookTestPage;
