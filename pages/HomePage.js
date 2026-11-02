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
  }

  async open() {
    return this.goto('/');
  }
}

module.exports = HomePage;
