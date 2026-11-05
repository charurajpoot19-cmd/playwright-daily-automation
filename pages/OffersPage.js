const BasePage = require('./BasePage');

class OffersPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'All Offers', level: 1 });
    this.introText = page.getByText("Don't miss this exciting offer from Oncquest");
    this.offerImages = page.locator('.offer-slider img');
    this.offerLinks = page.locator('.offer-slider a');
  }

  async open() {
    return this.goto('/offers');
  }
}

module.exports = OffersPage;
