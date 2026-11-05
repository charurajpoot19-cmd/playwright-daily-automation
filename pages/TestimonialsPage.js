const BasePage = require('./BasePage');

class TestimonialsPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Testimonials', level: 2 });
    this.banner = page.locator('img[src*="testimonial_banner"]');
    this.introText = page.getByText('Check out the positive statements by our happy clients');
    this.cards = page.locator('.testimonial_list .doctor_card');
    this.avatars = this.cards.locator('figure img');
  }

  async open() {
    return this.goto('/testimonials');
  }
}

module.exports = TestimonialsPage;
