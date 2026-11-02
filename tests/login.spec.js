const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

// Only negative scenarios are automated: a valid number would trigger a real OTP.
test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('TC_LOGIN_001 - Login page shows mobile input and Continue button @smoke', async ({ loginPage }) => {
    await expect(loginPage.mobileInput).toBeVisible();
    await expect(loginPage.continueBtn).toBeVisible();
  });

  test('TC_LOGIN_002 - Empty mobile number shows required error @regression', async ({ loginPage }) => {
    await loginPage.clickContinue();
    await expect(loginPage.errorMessage).toHaveText(testData.messages.loginMobileRequired);
  });

  test('TC_LOGIN_003 - Less than 10 digits shows validation error @regression', async ({ loginPage }) => {
    await loginPage.enterMobile(testData.invalid.shortMobile);
    await loginPage.clickContinue();
    await expect(loginPage.errorMessage).toHaveText(testData.messages.loginMobile10Digit);
  });

  test('TC_LOGIN_004 - Mobile input does not accept more than 10 characters @regression', async ({ loginPage }) => {
    await expect(loginPage.mobileInput).toHaveAttribute('maxlength', '10');
    await loginPage.mobileInput.pressSequentially(testData.invalid.longMobile);
    expect((await loginPage.mobileInput.inputValue()).length).toBeLessThanOrEqual(10);
  });

  test('TC_LOGIN_005 - Alphabetic mobile number is rejected @regression', async ({ loginPage }) => {
    await loginPage.mobileInput.pressSequentially(testData.invalid.alphaMobile);
    await loginPage.clickContinue();
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
