const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.mobileInput = page.getByPlaceholder('10 digit mobile number');
    this.continueBtn = page.getByRole('button', { name: 'Continue' });
    this.errorMessage = page.locator('.error_message');
  }

  async open() {
    return this.goto('/login');
  }

  async enterMobile(mobile) {
    await this.mobileInput.fill(mobile);
  }

  async clickContinue() {
    await this.continueBtn.click();
  }
}

module.exports = LoginPage;
