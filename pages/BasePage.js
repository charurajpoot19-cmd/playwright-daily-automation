const { expect } = require('@playwright/test');
const testData = require('../test-data/testData');

/**
 * BasePage - common header/footer elements and popup handling shared by every page.
 */
class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // Popups
    this.cityPopupSelect = page.locator('.cityBox-popUp select');
    this.cookieEssentialOnlyBtn = page.getByRole('button', { name: 'Essential Only' });
    this.welcomeModal = page.locator('.welcome-modal');
    this.welcomeModalCloseBtn = this.welcomeModal.locator('button.cust-pop-close');

    // Header (the site has no <header> tag; the top bar is `.topbar-section`)
    this.header = page.locator('.topbar-section');
    this.logo = page.locator('img[src*="logo.png"]').first();
    this.searchInput = page.locator('#example-search-input');
    this.searchBox = this.searchInput.locator('xpath=ancestor::div[contains(@style,"relative")][1]');
    this.searchSuggestions = this.searchBox.locator('a');
    this.searchNoResults = this.searchBox.getByText('No Test Found');
    this.homeCollectionPhone = this.header.locator('a[href^="tel:"]').first();
    this.headerEmail = this.header.locator('a[href^="mailto:"]').first();
    // The top bar renders two /login links; only one is shown at a time
    this.headerLoginLink = this.header.locator('a[href="/login"]:visible');
    this.headerLoginBtn = this.header.getByRole('button', { name: 'Login' });
    this.headerCitySelect = page.locator('.cityBox select').last();

    // Breadcrumb under the header on inner pages
    this.breadcrumbCurrent = page.locator('.breadcrumb-item.active');
    this.breadcrumbHome = page.locator('.breadcrumb-item a[href="/"]');

    // Footer
    this.footer = page.locator('footer');
  }

  /**
   * Pre-selects the city (stored by the site in localStorage) so the
   * "Please select a city" popup does not appear.
   */
  async seedCity(cityId = testData.defaultCityId) {
    await this.page.addInitScript((id) => {
      if (!window.localStorage.getItem('oq:city')) window.localStorage.setItem('oq:city', id);
    }, String(cityId));
  }

  /**
   * Stops the third-party cookie consent banner (Digital Anumati) from loading.
   * Its "Essential Only" button waits on a slow network call before the banner
   * closes, which stalled the popup handler and made tests time out under load.
   */
  async blockCookieBanner() {
    await this.page.route(/digitalanumati\.com/, (route) => route.abort());
  }

  /**
   * Closes the "Blood Sample Collection from Home" modal and the cookie
   * consent banner whenever either of them shows up during a test.
   * One combined handler is used because the modal can sit on top of the banner.
   */
  async registerPopupHandler() {
    // .first(): both popups are often on screen together, which would be a strict mode violation
    const blocker = this.welcomeModalCloseBtn.or(this.cookieEssentialOnlyBtn).first();
    await this.page.addLocatorHandler(
      blocker,
      async () => {
        // Short timeouts: another dialog (e.g. the city picker) can sit on top of these buttons,
        // and a stuck handler would block the test's own action. The action retries the handler.
        const close = (btn) => btn.click({ timeout: 5_000 }).catch(() => {});
        if (await this.welcomeModalCloseBtn.isVisible()) await close(this.welcomeModalCloseBtn);
        if (await this.cookieEssentialOnlyBtn.isVisible()) await close(this.cookieEssentialOnlyBtn);
      },
      { noWaitAfter: true },
    );
  }

  async goto(path = '/') {
    const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.footer.waitFor({ state: 'attached' });
    return response;
  }

  async getTitle() {
    return this.page.title();
  }

  /** Header main menu item, e.g. "Patient", "Doctors", "Wellness". */
  headerMenu(name) {
    // The anchor wraps its own sub menu, so match on the label <span> only
    return this.page.locator('a.h_dropdown').filter({
      has: this.page.locator('xpath=./span', { hasText: new RegExp(`^\\s*${name}\\s*$`) }),
    });
  }

  /**
   * Hover `trigger` to open its dropdown, then click `target` inside it.
   * Retried as a pair: if a popup shows up in between, the popup handler moves
   * the mouse away and the dropdown closes, so the hover has to be repeated.
   */
  async hoverAndClick(trigger, target) {
    await expect(async () => {
      await trigger.hover({ timeout: 5_000 });
      await target.click({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });
  }

  /**
   * Open the Login dropdown and click its Login link. Unlike the main menus it is a
   * Bootstrap dropdown that opens on click, and a second click would close it again,
   * so the button is only clicked while the link is not showing.
   */
  async clickHeaderLoginLink() {
    await expect(async () => {
      if (!(await this.headerLoginLink.isVisible())) await this.headerLoginBtn.click({ timeout: 5_000 });
      await this.headerLoginLink.click({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });
  }

  /** Hover a header menu and click one of its sub menu links. */
  async navigateViaHeader(menuName, subMenuName) {
    const menu = this.headerMenu(menuName);
    await this.hoverAndClick(menu, menu.locator('.h_dropdown-menu').getByRole('link', { name: subMenuName, exact: true }));
  }

  /**
   * Type a keyword into the header search key by key (suggestions are triggered by key events).
   * The welcome modal opens on a timer and can take focus mid-typing; the popup handler
   * cannot step in during a single action, so typing is retried from an empty box
   * until the whole keyword is in.
   */
  async searchFor(keyword) {
    await expect(async () => {
      await this.searchInput.fill('');
      await this.searchInput.click();
      await this.searchInput.pressSequentially(keyword, { delay: 80, timeout: 5_000 });
      await expect(this.searchInput).toHaveValue(keyword, { timeout: 1_000 });
    }).toPass({ timeout: 30_000 });
  }

  /** Wait for `images` to finish loading, then fail on any that came back broken. */
  async expectImagesLoaded(images) {
    await expect
      .poll(() => images.evaluateAll((list) => list.every((img) => img.complete)), { timeout: 30_000 })
      .toBe(true);
    const broken = await images.evaluateAll((list) => list.filter((img) => img.naturalWidth === 0).map((img) => img.src));
    expect(broken, `Broken images: ${broken.join(', ')}`).toHaveLength(0);
  }

  footerLink(name) {
    return this.footer.getByRole('link', { name, exact: true }).first();
  }

  socialLink(host) {
    return this.footer.locator(`a[href*="${host}"]`).first();
  }
}

module.exports = BasePage;
