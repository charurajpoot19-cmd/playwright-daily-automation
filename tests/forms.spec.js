const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

const msg = testData.messages;

// Only validation scenarios are automated. Successful submissions create real
// leads in production and must be tested on a staging environment.

test.describe('Home Collection Query Form', () => {
  test.beforeEach(async ({ homeCollectionPage }) => {
    await homeCollectionPage.open();
  });

  test('TC_HC_001 - All form fields are displayed @smoke', async ({ homeCollectionPage: hc }) => {
    for (const field of [hc.firstNameInput, hc.lastNameInput, hc.mobileInput, hc.emailInput, hc.citySelect,
      hc.addressInput, hc.preferredDateInput, hc.preferredTimeInput, hc.packageSelect, hc.submitBtn]) {
      await expect.soft(field).toBeVisible();
    }
  });

  test('TC_HC_002 - Empty submit shows all mandatory field errors @regression', async ({ homeCollectionPage: hc }) => {
    await hc.submitExpectingErrors();
    for (const text of [msg.firstNameRequired, msg.mobileRequired, msg.cityRequired, msg.dateRequired, msg.timeRequired]) {
      await expect.soft(hc.errorWithText(text)).toBeVisible();
    }
  });

  test('TC_HC_003 - Mobile number less than 10 digits shows error @regression', async ({ homeCollectionPage: hc }) => {
    await hc.mobileInput.fill(testData.invalid.shortMobile);
    await hc.submitExpectingErrors();
    await expect(hc.errorWithText(msg.mobile10Digit)).toBeVisible();
  });

  test('TC_HC_004 - Filling First Name removes its error @regression', async ({ homeCollectionPage: hc }) => {
    await hc.submitExpectingErrors();
    await expect(hc.errorWithText(msg.firstNameRequired)).toBeVisible();
    await hc.firstNameInput.fill('Test');
    await hc.submitExpectingErrors();
    await expect(hc.errorWithText(msg.firstNameRequired)).toBeHidden();
  });

  test('TC_HC_005 - City and Package dropdowns have options @regression', async ({ homeCollectionPage: hc }) => {
    // Options are fetched after the page loads, so wait for them instead of counting once
    await expect.poll(() => hc.citySelect.locator('option').count()).toBeGreaterThan(1);
    await expect.poll(() => hc.packageSelect.locator('option').count()).toBeGreaterThan(1);
  });
});

test.describe('General Enquiry Form', () => {
  test.beforeEach(async ({ generalEnquiryPage }) => {
    await generalEnquiryPage.open();
  });

  test('TC_GE_001 - All form fields are displayed @smoke', async ({ generalEnquiryPage: ge }) => {
    for (const field of [ge.nameInput, ge.mobileInput, ge.citySelect, ge.emailInput, ge.messageInput, ge.submitBtn]) {
      await expect.soft(field).toBeVisible();
    }
  });

  test('TC_GE_002 - Empty submit shows mandatory field errors @regression', async ({ generalEnquiryPage: ge }) => {
    await ge.submitExpectingErrors();
    for (const text of [msg.nameRequired, msg.mobileRequired, msg.cityRequired, msg.captchaRequired]) {
      await expect.soft(ge.errorWithText(text)).toBeVisible();
    }
  });

  test('TC_GE_003 - Invalid mobile number shows error @regression', async ({ generalEnquiryPage: ge }) => {
    await ge.nameInput.fill('Test User');
    await ge.mobileInput.fill(testData.invalid.shortMobile);
    await ge.submitExpectingErrors();
    await expect(ge.errorWithText(msg.mobile10Digit)).toBeVisible();
  });
});

test.describe('Upload Prescription Form', () => {
  test.beforeEach(async ({ uploadPrescriptionPage }) => {
    await uploadPrescriptionPage.open();
  });

  test('TC_UP_001 - All form fields are displayed @smoke', async ({ uploadPrescriptionPage: up }) => {
    for (const field of [up.firstNameInput, up.lastNameInput, up.mobileInput, up.emailInput, up.dobInput,
      up.citySelect, up.addressInput, up.submitBtn]) {
      await expect.soft(field).toBeVisible();
    }
    await expect.soft(up.genderRadios).toHaveCount(3);
  });

  test('TC_UP_002 - Empty submit shows mandatory field errors @regression', async ({ uploadPrescriptionPage: up }) => {
    await up.submitExpectingErrors();
    await expect(up.errorMessages.first()).toBeVisible();
    for (const text of [msg.firstNameRequired, msg.mobileRequired, msg.cityRequired]) {
      await expect.soft(up.errorWithText(text)).toBeVisible();
    }
  });

  test('TC_UP_003 - Gender radio can be selected @regression', async ({ uploadPrescriptionPage: up }) => {
    await up.genderRadios.first().check();
    await expect(up.genderRadios.first()).toBeChecked();
  });
});
