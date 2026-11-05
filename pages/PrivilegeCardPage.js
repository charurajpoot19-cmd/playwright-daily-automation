const { FormPage } = require('./FormPage');

class PrivilegeCardPage extends FormPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page, '/privilege-membership-card');
    this.heading = page.getByRole('heading', { name: 'Privilege Membership Card', level: 1 });
    this.benefits = page.locator('.privilege-Card-content');
    this.formHeading = this.form.getByRole('heading', { name: 'Membership Request Form' });
    this.nameInput = this.form.locator('input[name="Name"]');
    this.emailInput = this.form.locator('input[name="Email"]');
    this.messageInput = this.form.locator('textarea[name="Message"]');
    this.termsLink = this.form.getByRole('link', { name: 'terms and conditions' });
    this.privacyLink = this.form.getByRole('link', { name: 'Privacy Policy' });
    this.captcha = this.form.locator('iframe[title="reCAPTCHA"]');
  }

  /** Section title in the card details, e.g. "Offers", "Exceptions", "Validity". */
  sectionHeading(name) {
    return this.page.locator('h5').filter({ hasText: new RegExp(`^${name}$`) });
  }
}

module.exports = PrivilegeCardPage;
