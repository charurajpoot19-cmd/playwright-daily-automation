const BasePage = require('./BasePage');

class CentresPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Find a centre on the map' });
    this.filters = page.locator('select.rounded-pill');
    this.labTypeSelect = this.filters.nth(0);
    this.zoneSelect = this.filters.nth(1);
    this.stateSelect = this.filters.nth(2);
    this.citySelect = this.filters.nth(3);
    this.shareButtons = page.locator('button.react-share__ShareButton');
  }

  async open() {
    return this.goto('/centres');
  }
}

module.exports = CentresPage;
