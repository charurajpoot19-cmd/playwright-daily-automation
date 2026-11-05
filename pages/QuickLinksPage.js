const BasePage = require('./BasePage');

class QuickLinksPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: "Quick Link's", level: 2 });
    this.cards = page.locator('.infobox_wrapper').filter({ has: page.locator('a.button--hexagon1') });
    this.cardImages = this.cards.locator('.infobox_icon_container img');
  }

  card(title) {
    return this.cards.filter({ has: this.page.getByRole('heading', { name: title, exact: true }) });
  }

  knowMoreLink(title) {
    return this.card(title).locator('a.button--hexagon1');
  }

  async open() {
    return this.goto('/quick-links');
  }
}

module.exports = QuickLinksPage;
