const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

test.describe('Home Page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC_HOME_001 - Home page loads with correct title @smoke', async ({ page }) => {
    await expect(page).toHaveURL(/oncquestlabs\.com\/?$/);
    await expect(page).toHaveTitle(/Pathology Lab.*Oncquest Labs/i);
  });

  test('TC_HOME_002 - Logo and search bar are visible in header @smoke', async ({ homePage }) => {
    await expect(homePage.logo).toBeVisible();
    await expect(homePage.searchInput).toBeVisible();
    await expect(homePage.searchInput).toHaveAttribute('placeholder', 'Search for Tests and Packages');
  });

  test('TC_HOME_003 - Home collection phone number and email are correct @regression', async ({ homePage }) => {
    await expect(homePage.homeCollectionPhone).toHaveAttribute('href', new RegExp(testData.contact.phone));
    await expect(homePage.headerEmail).toHaveAttribute('href', `mailto:${testData.contact.email}`);
  });

  test('TC_HOME_006 - Main H1 heading is displayed @smoke', async ({ homePage }) => {
    await expect(homePage.mainHeading.first()).toContainText('Pathology Labs Network');
  });

  test('TC_HOME_007 - All key home page sections are present @regression', async ({ homePage }) => {
    const sections = {
      'Why Oncquest': homePage.whyOncquestSection,
      'Book a Test': homePage.bookATestSection,
      Wellness: homePage.wellnessSection,
      Offers: homePage.offersSection,
      Testimonials: homePage.testimonialsSection,
      // Injected by a third-party widget (answers.oncquestlabs.com); on the live site it
      // intermittently stays empty even when its API returns blogs - a site defect, not a test issue
      'Related blogs': homePage.relatedBlogsSection,
    };
    // toBeVisible does not need the element scrolled into view, so a missing
    // section fails with a clear message instead of running into the test timeout
    for (const [name, section] of Object.entries(sections)) {
      await expect.soft(section, `"${name}" section should be on the home page`).toBeVisible();
    }
  });

  test('TC_HOME_008 - Header main menus are visible @smoke', async ({ homePage }) => {
    for (const menu of ['Patient', 'Doctors', 'Wellness', 'Network', 'Upload Prescription']) {
      await expect.soft(homePage.headerMenu(menu)).toBeVisible();
    }
  });

  // The 'load' event is unreliable on this site (third-party trackers keep loading),
  // so we wait for the visible images themselves instead.
  test('TC_HOME_009 - Page has no broken images in first viewport @regression', async ({ page }) => {
    const viewportImages = () =>
      [...document.images].filter((img) => img.offsetHeight > 0 && img.getBoundingClientRect().top < window.innerHeight);
    await expect
      .poll(() => page.evaluate(`(${viewportImages})().every((img) => img.complete)`), { timeout: 30_000 })
      .toBe(true);
    const brokenImages = await page.evaluate(
      `(${viewportImages})().filter((img) => img.naturalWidth === 0).map((img) => img.src)`,
    );
    expect(brokenImages, `Broken images: ${brokenImages.join(', ')}`).toHaveLength(0);
  });

  test('TC_HOME_010 - No uncaught JavaScript errors on load @regression', async ({ page, homePage }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await homePage.open();
    await expect(homePage.mainHeading.first()).toBeVisible();
    await page.waitForTimeout(3000); // let async scripts run
    expect(errors, errors.join('\n')).toHaveLength(0);
  });
});

test.describe('City Selection Popup (first-time visitor)', () => {
  test.use({ seedCity: false });

  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC_HOME_004 - City selection popup is shown to a new visitor @regression', async ({ page, homePage }) => {
    await expect(page.getByRole('heading', { name: 'Please select a city' })).toBeVisible();
    await expect(homePage.cityPopupSelect).toBeVisible();
  });

  test('TC_HOME_005 - Selecting a city in popup closes it and updates header city @regression', async ({ homePage }) => {
    await homePage.cityPopupSelect.selectOption({ label: testData.defaultCity });
    await expect(homePage.cityPopupSelect).toBeHidden();
    await expect(homePage.headerCitySelect.locator('option:checked')).toHaveText(testData.defaultCity);
  });
});
