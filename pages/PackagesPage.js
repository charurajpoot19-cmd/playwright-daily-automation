const { FormPage } = require('./FormPage');

/** Preventive health package listing, with the "Book your test now" enquiry form beside it. */
class PackagesPage extends FormPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page, '/preventive-health-check-packages');
    this.heading = page.getByRole('heading', { name: 'Preventive Health Check-up Packages', level: 1 });
    this.packageCards = page.locator('.pkj_wrap_box');
    this.moreLinks = this.packageCards.locator('a.moreButton');
    this.bookNowBtns = this.packageCards.locator('a.booknow');
    this.sampleReportLinks = this.packageCards.getByRole('link', { name: 'Download Sample Report' });
    this.articlesHeading = page.getByRole('heading', { name: 'Articles & resources on Wellness' });
    this.articleLinks = page.locator('a.text-center[href*="/blog/"]');
    this.cartBadge = page.locator('i.cart_badge').first();

    this.nameInput = this.form.locator('input[name="Name"]');
    this.queryNatureSelect = this.form.locator('#QueryNature');
    this.messageInput = this.form.locator('textarea[name="Message"]');
  }

  /** Items in the cart, which the site keeps in localStorage until checkout. */
  async cartItems() {
    return this.page.evaluate(() => JSON.parse(window.localStorage.getItem('CartData') || '[]'));
  }
}

module.exports = PackagesPage;
