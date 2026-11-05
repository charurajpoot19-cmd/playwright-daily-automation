const BasePage = require('./BasePage');

class CentresPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Find a centre on the map' });
    this.filters = page.locator('select.rounded-pill');
    this.labTypeSelect = this.filters.nth(0);
    this.zoneSelect = this.filters.nth(1);
    this.stateSelect = this.filters.nth(2);
    this.citySelect = this.filters.nth(3);
    this.shareButtons = page.locator('button.react-share__ShareButton');
    // The header search box has the same id, so go by the placeholder
    this.localitySearch = page.getByPlaceholder('Search by locality/pincode');

    // Centre listing
    this.centreCards = page.locator('.lab_wrapper.know-lab');
    this.centreAddresses = this.centreCards.locator('.address');
    this.knowMoreLinks = this.centreCards.locator('a.button-read-more');
    this.loadMoreBtn = page.getByRole('link', { name: 'Load More' });
    this.noCentreMessage = page.getByText('No Centre Found');

    // Leaflet map
    this.map = page.locator('.leaflet-container');
    this.mapPins = this.map.locator('.leaflet-marker-icon');
    this.mapPopup = this.map.locator('.leaflet-popup-content');
    this.mapSummary = page.locator('.centres-map-toolbar p');
    this.zoomInBtn = this.map.locator('.leaflet-control-zoom-in');
    this.zoomOutBtn = this.map.locator('.leaflet-control-zoom-out');

    // Centre detail page (/centre/<slug>)
    this.detailLabels = ['Phone Number', 'Timings', 'Payment Mode', 'Nearby Centres', 'Booking Enquiry'];
  }

  /** Name of a centre, shown first in its card. */
  centreName(card) {
    return card.locator('.lab_flex_pad > div').first();
  }

  directionLink(card) {
    return card.getByRole('link', { name: 'Get Direction' });
  }

  async open() {
    return this.goto('/centres');
  }
}

module.exports = CentresPage;
