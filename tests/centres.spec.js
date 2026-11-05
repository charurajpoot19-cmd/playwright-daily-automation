const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

const data = testData.centres;

// TC_CEN_001-003 are in book-test-and-centres.spec.js

test.describe('Centre Finder', () => {
  test.beforeEach(async ({ centresPage }) => {
    await centresPage.open();
    await expect(centresPage.centreCards.first()).toBeVisible();
  });

  test.describe('Centre listing', () => {
    test('TC_CEN_004 - Each centre card shows name, address and actions @smoke', async ({ centresPage }) => {
      const card = centresPage.centreCards.first();
      await expect(centresPage.centreName(card)).not.toBeEmpty();
      await expect(card.locator('.address')).not.toBeEmpty();
      await expect(card.locator('button.react-share__ShareButton')).toBeVisible();
      await expect(centresPage.directionLink(card)).toBeVisible();
      await expect(card.locator('a.button-read-more')).toBeVisible();
    });

    test('TC_CEN_005 - Load More adds centres to the listing @regression', async ({ centresPage }) => {
      const initialCount = await centresPage.centreCards.count();
      await centresPage.loadMoreBtn.click();
      await expect.poll(() => centresPage.centreCards.count()).toBeGreaterThan(initialCount);
    });

    test('TC_CEN_006 - Get Direction opens Google Maps in a new tab @regression', async ({ centresPage }) => {
      const link = centresPage.directionLink(centresPage.centreCards.first());
      await expect(link).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\/search\//);
      await expect(link).toHaveAttribute('target', '_blank');
    });

    test('TC_CEN_007 - SHARE opens the Facebook share window for that centre @regression', async ({ page, centresPage }) => {
      const centreUrl = await centresPage.knowMoreLinks.first().getAttribute('href');
      const [popup] = await Promise.all([page.waitForEvent('popup'), centresPage.shareButtons.first().click()]);
      expect(decodeURIComponent(popup.url())).toContain(`facebook.com/sharer/sharer.php?u=oncquestlabs.com${centreUrl}`);
      await popup.close();
    });

    test('TC_CEN_008 - KNOW MORE opens the centre detail page @smoke', async ({ page, centresPage }) => {
      const card = centresPage.centreCards.first();
      const name = (await centresPage.centreName(card).innerText()).trim();
      const url = await card.locator('a.button-read-more').getAttribute('href');
      await card.locator('a.button-read-more').click();
      await expect(page).toHaveURL(new RegExp(`${url}$`));
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
      for (const label of centresPage.detailLabels) {
        await expect.soft(page.getByText(label, { exact: true }).first()).toBeVisible();
      }
    });
  });

  test.describe('Search and filters', () => {
    test('TC_CEN_009 - Search by locality finds the matching centre @regression', async ({ centresPage }) => {
      await centresPage.localitySearch.fill(data.locality);
      await expect(centresPage.knowMoreLinks).toHaveCount(1);
      await expect(centresPage.knowMoreLinks).toHaveAttribute('href', data.localityCentreUrl);
    });

    test('TC_CEN_010 - Unknown locality shows the no centre message @regression', async ({ centresPage }) => {
      await centresPage.localitySearch.fill(data.unknownLocality);
      await expect(centresPage.centreCards).toHaveCount(0);
      await expect(centresPage.noCentreMessage.first()).toBeVisible();
    });

    test('TC_CEN_011 - Clearing the search brings the listing back @regression', async ({ centresPage }) => {
      const initialCount = await centresPage.centreCards.count();
      await centresPage.localitySearch.fill(data.locality);
      await expect(centresPage.centreCards).toHaveCount(1);
      await centresPage.localitySearch.fill('');
      await expect(centresPage.centreCards).toHaveCount(initialCount);
    });

    test('TC_CEN_012 - State filter updates the listing and its cities @regression', async ({ centresPage }) => {
      const firstCentre = await centresPage.knowMoreLinks.first().getAttribute('href');
      await centresPage.stateSelect.selectOption({ label: data.otherState });
      await expect(centresPage.citySelect.locator('option', { hasText: data.otherStateCity })).toBeAttached();
      await expect(centresPage.knowMoreLinks.first()).not.toHaveAttribute('href', firstCentre);
    });

    test('TC_CEN_013 - Zone filter narrows down the state list @regression', async ({ centresPage }) => {
      const allStates = await centresPage.stateSelect.locator('option').count();
      await centresPage.zoneSelect.selectOption(data.zone);
      await expect.poll(() => centresPage.stateSelect.locator('option').count()).toBeLessThan(allStates);
    });

    test('TC_CEN_014 - Lab Type filter has all lab types @regression', async ({ centresPage }) => {
      for (const labType of data.labTypes) {
        await expect.soft(centresPage.labTypeSelect.locator('option', { hasText: labType })).toBeAttached();
      }
    });
  });

  test.describe('Map', () => {
    test('TC_CEN_015 - Map shows centre pins and their count @smoke', async ({ centresPage }) => {
      await expect(centresPage.map).toBeVisible();
      await expect(centresPage.mapPins.first()).toBeAttached();
      await expect(centresPage.mapSummary).toHaveText(new RegExp(`^${await centresPage.mapPins.count()} centres shown`));
    });

    test('TC_CEN_016 - Selecting a pin shows the centre details @regression', async ({ centresPage }) => {
      // force: pins near each other overlap, and any of them will do here
      await centresPage.mapPins.first().click({ force: true });
      await expect(centresPage.mapPopup).toContainText('Get directions');
    });

    test('TC_CEN_017 - Map zoom controls are displayed @regression', async ({ centresPage }) => {
      await expect(centresPage.zoomInBtn).toBeVisible();
      await expect(centresPage.zoomOutBtn).toBeVisible();
    });
  });
});
