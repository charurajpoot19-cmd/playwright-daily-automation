const base = require('@playwright/test');
const BasePage = require('../pages/BasePage');
const HomePage = require('../pages/HomePage');
const LoginPage = require('../pages/LoginPage');
const BookTestPage = require('../pages/BookTestPage');
const CentresPage = require('../pages/CentresPage');
const { HomeCollectionPage, GeneralEnquiryPage, UploadPrescriptionPage } = require('../pages/FormPage');

/**
 * Custom fixtures: every test gets ready-to-use page objects and the
 * city / cookie popups are handled automatically.
 */
const test = base.test.extend({
  // Set `test.use({ seedCity: false })` to see the city popup like a first-time visitor
  seedCity: [true, { option: true }],
  // Set `test.use({ blockCookieBanner: false })` to test the cookie consent banner itself
  blockCookieBanner: [true, { option: true }],

  page: async ({ page, seedCity, blockCookieBanner }, use) => {
    const basePage = new BasePage(page);
    if (seedCity) await basePage.seedCity();
    if (blockCookieBanner) await basePage.blockCookieBanner();
    await basePage.registerPopupHandler();
    await use(page);
  },
  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  bookTestPage: async ({ page }, use) => use(new BookTestPage(page)),
  centresPage: async ({ page }, use) => use(new CentresPage(page)),
  homeCollectionPage: async ({ page }, use) => use(new HomeCollectionPage(page)),
  generalEnquiryPage: async ({ page }, use) => use(new GeneralEnquiryPage(page)),
  uploadPrescriptionPage: async ({ page }, use) => use(new UploadPrescriptionPage(page)),
});

module.exports = { test, expect: base.expect };
