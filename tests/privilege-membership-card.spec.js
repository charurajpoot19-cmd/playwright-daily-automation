const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

const msg = testData.messages;

// Only validation scenarios are automated. No test fills the whole form, so nothing can be
// submitted: a successful request creates a real lead in production.

test.describe('Privilege Membership Card', () => {
  test.beforeEach(async ({ privilegeCardPage }) => {
    await privilegeCardPage.open();
  });

  test.describe('Card details', () => {
    test('TC_PMC_001 - Heading and breadcrumb are displayed @smoke', async ({ privilegeCardPage: pmc }) => {
      await expect(pmc.heading).toBeVisible();
      await expect(pmc.breadcrumbCurrent).toBeVisible();
    });

    test('TC_PMC_002 - All card detail sections are displayed @regression', async ({ privilegeCardPage: pmc }) => {
      for (const section of testData.privilegeCard.sections) {
        await expect.soft(pmc.sectionHeading(section)).toBeVisible();
      }
    });

    test('TC_PMC_003 - Card benefits are listed @regression', async ({ privilegeCardPage: pmc }) => {
      for (const benefit of testData.privilegeCard.benefits) {
        await expect.soft(pmc.benefits.first()).toContainText(benefit);
      }
    });
  });

  test.describe('Membership Request Form', () => {
    test('TC_PMC_004 - All form fields are displayed @smoke', async ({ privilegeCardPage: pmc }) => {
      await expect(pmc.formHeading).toBeVisible();
      for (const field of [pmc.nameInput, pmc.mobileInput, pmc.citySelect, pmc.emailInput, pmc.messageInput,
        pmc.termsCheckbox, pmc.captcha, pmc.submitBtn]) {
        await expect.soft(field).toBeVisible();
      }
    });

    test('TC_PMC_005 - Empty submit shows all mandatory field errors @regression', async ({ privilegeCardPage: pmc }) => {
      await pmc.submitExpectingErrors();
      for (const text of [msg.nameRequired, msg.mobileRequired, msg.cityRequired, msg.termsRequired, msg.captchaRequired]) {
        await expect.soft(pmc.errorWithText(text)).toBeVisible();
      }
    });

    test('TC_PMC_006 - Mobile number less than 10 digits shows error @regression', async ({ privilegeCardPage: pmc }) => {
      await pmc.mobileInput.fill(testData.invalid.shortMobile);
      await pmc.submitExpectingErrors();
      await expect(pmc.errorWithText(msg.mobile10Digit)).toBeVisible();
    });

    test('TC_PMC_007 - Mobile number more than 10 digits shows error @regression', async ({ privilegeCardPage: pmc }) => {
      await pmc.mobileInput.fill(testData.invalid.longMobile);
      await pmc.submitExpectingErrors();
      await expect(pmc.errorWithText(msg.mobile10Digit)).toBeVisible();
    });

    test('TC_PMC_008 - Filling Name removes its error @regression', async ({ privilegeCardPage: pmc }) => {
      await pmc.submitExpectingErrors();
      await expect(pmc.errorWithText(msg.nameRequired)).toBeVisible();
      await pmc.nameInput.fill('Test');
      await pmc.submitExpectingErrors();
      await expect(pmc.errorWithText(msg.nameRequired)).toBeHidden();
    });

    test('TC_PMC_009 - Selecting a City removes its error @regression', async ({ privilegeCardPage: pmc }) => {
      // Options are fetched after the page loads, so wait for them instead of counting once
      await expect.poll(() => pmc.citySelect.locator('option').count()).toBeGreaterThan(1);
      await pmc.submitExpectingErrors();
      await pmc.citySelect.selectOption({ label: testData.defaultCity });
      await pmc.submitExpectingErrors();
      await expect(pmc.errorWithText(msg.cityRequired)).toBeHidden();
    });

    test('TC_PMC_010 - Accepting the terms removes their error @regression', async ({ privilegeCardPage: pmc }) => {
      await pmc.submitExpectingErrors();
      await pmc.termsCheckbox.check();
      await pmc.submitExpectingErrors();
      await expect(pmc.errorWithText(msg.termsRequired)).toBeHidden();
    });

    test('TC_PMC_011 - Terms and Privacy Policy links are correct @regression', async ({ privilegeCardPage: pmc }) => {
      await expect(pmc.termsLink).toHaveAttribute('href', /\/terms-condition$/);
      await expect(pmc.privacyLink).toHaveAttribute('href', /\/privacy-policy$/);
    });

    test('TC_PMC_012 - Alphabetic mobile number is rejected (known defect) @regression', async ({ privilegeCardPage: pmc }) => {
      test.fail(true, 'Site defect: 10 letters pass the Mobile check, only the length is validated');
      await pmc.mobileInput.fill(testData.invalid.alphaMobile);
      await pmc.submitExpectingErrors();
      await expect(pmc.errorWithText(msg.mobile10Digit)).toBeVisible({ timeout: 3_000 });
    });

    test('TC_PMC_013 - Invalid email is rejected (known defect) @regression', async ({ privilegeCardPage: pmc }) => {
      test.fail(true, 'Site defect: the optional Email field accepts a value that is not an email address');
      await pmc.emailInput.fill(testData.invalid.email);
      await pmc.submitExpectingErrors();
      await expect(pmc.errorMessages.filter({ hasText: /email/i })).toBeVisible({ timeout: 3_000 });
    });
  });
});
