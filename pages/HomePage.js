const BasePage = require('./BasePage');

class HomePage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.mainHeading = page.getByRole('heading', { level: 1 });
    this.whyOncquestSection = page.getByRole('heading', { name: 'Why Oncquest', level: 2 });
    this.bookATestSection = page.getByRole('heading', { name: 'Book a Test', level: 2 });
    this.wellnessSection = page.getByRole('heading', { name: 'Wellness', level: 2 });
    this.offersSection = page.getByRole('heading', { name: 'Offers', level: 2 });
    this.testimonialsSection = page.getByRole('heading', { name: 'Testimonials', level: 2 });
    this.relatedBlogsSection = page.getByRole('heading', { name: 'Related blogs', level: 2 });
    this.exploreAllFitnessBtn = page.locator('button.explorebtnfitness');

    // Top bar (hidden duplicates exist for mobile, so only take visible ones)
    this.topBarPhone = this.header.locator('a[href^="tel:"]:visible').first();
    this.topBarEmail = this.header.locator('a[href^="mailto:"]:visible').first();
    this.loginBtn = this.header.getByRole('button', { name: 'Login' });
    this.logoLink = page.locator('a[href="/"]').filter({ has: page.locator('img[src*="logo.png"]') }).first();
    this.uploadPrescriptionLink = page.locator('a.h_dropdown[href="/upload-prescription"]');

    // Hero banner: a slick slider with dots only (no prev/next arrows)
    this.heroSlider = page.locator('section.headslider.desk-view .slick-slider');
    this.heroSlides = this.heroSlider.locator('.slick-slide:not(.slick-cloned)');
    this.heroDots = this.heroSlider.locator('.slick-dots li button');
    this.heroActiveDot = this.heroSlider.locator('.slick-dots li.slick-active button');

    // Floating quick action buttons on the right; they slide in once the page is scrolled
    this.quickActions = page.locator('ul.buttonfix');

    // Headings
    this.visibleH1 = page.locator('h1:visible');
    this.contentH2 = page.locator('main h2');

    // Inner Fitness packages
    this.fitnessSection = page.locator('section.home-fitness');
    this.packageCards = this.fitnessSection.locator('.flex-slide');

    // Book a Test tabs and tiles
    this.organsPane = page.locator('#Organs');
    this.lifestylePane = page.locator('#Lifestyle');

    // Why Oncquest pillars and accreditation
    this.whyPillars = page.locator('.whyOnq > div');
    this.footerNablLogo = this.footer.locator('img[src*="nabl_logo"]');

    // Testimonials and blogs
    this.testimonialSlides = page.locator('.testi_slider .slick-slide:not(.slick-cloned)');
    this.blogCards = page.locator('.intunely-related__card');

    // Footer bottom bar
    this.copyrightBar = this.footer.locator('.copyright-text');
  }

  /** Floating quick action button by its label, e.g. "Cart", "Find a Test". */
  quickAction(label) {
    return this.quickActions.locator('li').filter({ hasText: label });
  }

  /** Scroll down so the floating quick action buttons slide into view. */
  async revealQuickActions() {
    await this.page.mouse.wheel(0, 900);
    await this.page.waitForFunction(() => document.querySelector('ul.buttonfix')?.classList.contains('fixicon'));
  }

  /** "BY Organs" / "BY Lifestyle" tab in the Book a Test section. */
  bookTestTab(name) {
    return this.page.locator('ul.nav-tabs a').filter({ hasText: new RegExp(`^${name}$`) });
  }

  /** Tile titles (e.g. kidney, Liver) in a Book a Test tab pane, without slider clones. */
  tileTitles(pane) {
    return pane.locator('.slick-slide:not(.slick-cloned) h3.infobox_title');
  }

  whyPillar(title) {
    return this.whyPillars.filter({ has: this.page.locator('h5', { hasText: title }) });
  }

  footerHeading(name) {
    return this.footer.getByRole('heading', { name, exact: true }).first();
  }

  legalLink(name) {
    return this.copyrightBar.getByRole('link', { name, exact: true });
  }

  async open() {
    return this.goto('/');
  }
}

module.exports = HomePage;
