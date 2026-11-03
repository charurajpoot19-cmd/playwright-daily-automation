/**
 * PopupManager - the dialogs that can show up on top of any page:
 *  - DPDP cookie consent banner (third-party, Digital Anumati)
 *  - "Blood Sample Collection from Home" welcome modal
 *  - "Please select a city" dialog for first-time visitors
 *
 * Most tests never see these: the fixtures block the cookie banner and
 * close the other popups automatically. Use this class in tests that
 * check the popups themselves (with `blockCookieBanner: false` / `seedCity: false`).
 */
class PopupManager {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    this.cookieEssentialOnlyBtn = page.getByRole('button', { name: 'Essential Only' });
    this.cookieAcceptAllBtn = page.getByRole('button', { name: 'Accept All' });
    this.cookieBannerTitle = page.getByText('Your Privacy, Your Choice');

    this.welcomeModal = page.locator('.welcome-modal');
    this.welcomeModalCloseBtn = this.welcomeModal.locator('button.cust-pop-close');

    this.cityDialogHeading = page.getByRole('heading', { name: 'Please select a city' });
    this.cityDialogSelect = page.locator('.cityBox-popUp select');
  }

  async closeWelcomeModalIfShown() {
    if (await this.welcomeModalCloseBtn.isVisible()) await this.welcomeModalCloseBtn.click();
  }

  /** Choose "Essential Only" on the cookie banner and wait for it to go away. */
  async acceptEssentialCookiesOnly() {
    await this.closeWelcomeModalIfShown();
    await this.cookieEssentialOnlyBtn.click();
    // The banner waits on a network call before closing, which can be slow
    await this.cookieBannerTitle.waitFor({ state: 'hidden', timeout: 45_000 });
  }

  /** Pick a city in the first-visit city dialog. */
  async selectCity(cityName) {
    await this.cityDialogSelect.selectOption({ label: cityName });
  }
}

module.exports = PopupManager;
