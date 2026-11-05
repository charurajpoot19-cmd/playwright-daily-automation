const { test, expect } = require('../fixtures/fixtures');

test.describe('Testimonials', () => {
  test.beforeEach(async ({ testimonialsPage }) => {
    await testimonialsPage.open();
    await expect(testimonialsPage.heading).toBeVisible();
  });

  test('TC_TST_001 - Banner, heading, intro text and breadcrumb are displayed @smoke', async ({ testimonialsPage }) => {
    await expect(testimonialsPage.banner).toBeVisible();
    await expect(testimonialsPage.introText).toBeVisible();
    await expect(testimonialsPage.breadcrumbCurrent).toHaveText('Testimonials');
  });

  test('TC_TST_002 - Testimonials are listed @smoke', async ({ testimonialsPage }) => {
    await expect(testimonialsPage.cards.first()).toBeVisible();
    expect(await testimonialsPage.cards.count()).toBeGreaterThan(5);
  });

  test('TC_TST_003 - Every testimonial has a statement and a name @regression', async ({ testimonialsPage }) => {
    await expect(testimonialsPage.cards.first()).toBeVisible();
    // Some testimonials are a video instead of text
    const incomplete = await testimonialsPage.cards.evaluateAll((cards) =>
      cards.filter((card) => {
        const hasStatement = card.querySelector('.member_name p')?.textContent.trim() || card.querySelector('.member_name .testimonialVdo');
        return !hasStatement || !card.querySelector('.member_name h5')?.textContent.trim();
      }).length);
    expect(incomplete).toBe(0);
  });

  test('TC_TST_004 - No testimonial photo is broken @regression', async ({ testimonialsPage }) => {
    await expect(testimonialsPage.avatars.first()).toBeVisible();
    await testimonialsPage.expectImagesLoaded(testimonialsPage.avatars);
  });

  test('TC_TST_005 - Page title names the Testimonials page (known defect) @regression', async ({ page }) => {
    test.fail(true, 'Site defect: the title is "Team - Meet our Experts", copied from the team page');
    await expect(page).toHaveTitle(/Testimonial/i, { timeout: 5_000 });
  });
});
