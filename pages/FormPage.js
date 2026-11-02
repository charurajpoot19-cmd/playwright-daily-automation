const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/**
 * Shared behaviour of the lead forms (Home Collection, General Enquiry, Upload Prescription).
 * All of them use the same field names, a SUBMIT button and `.error_message` spans.
 */
class FormPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page, path) {
    super(page);
    this.path = path;
    // Skip the form inside the welcome popup, which has the same field names
    this.form = page.locator('form:not(.welcome-modal form)').filter({ has: page.getByRole('button', { name: 'SUBMIT' }) });
    this.mobileInput = this.form.locator('input[name="Mobile"]');
    this.citySelect = this.form.locator('select[name="CityId"]');
    this.termsCheckbox = this.form.locator('#checkbox_id');
    this.submitBtn = this.form.getByRole('button', { name: 'SUBMIT' });
    this.errorMessages = this.form.locator('.error_message');
  }

  async open() {
    return this.goto(this.path);
  }

  async submit() {
    await this.submitBtn.click();
  }

  /**
   * Submit and wait for validation errors. A click that lands before the page's
   * scripts have hooked up the form does nothing, so it is repeated until an error shows.
   */
  async submitExpectingErrors() {
    await expect(async () => {
      await this.submitBtn.click({ timeout: 5_000 });
      await expect(this.errorMessages.first()).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });
  }

  errorWithText(text) {
    return this.errorMessages.filter({ hasText: text });
  }
}

class HomeCollectionPage extends FormPage {
  constructor(page) {
    super(page, '/blood-sample-home-collection');
    this.firstNameInput = this.form.locator('input[name="FirstName"]');
    this.lastNameInput = this.form.locator('input[name="LastName"]');
    this.emailInput = this.form.locator('input[name="EmailId"]');
    this.addressInput = this.form.locator('input[name="Address"]');
    this.preferredDateInput = this.form.getByPlaceholder('Preferred Date*');
    this.preferredTimeInput = this.form.locator('input[name="PreferredTime"]');
    this.packageSelect = this.form.locator('select[name="PackageId"]');
  }
}

class GeneralEnquiryPage extends FormPage {
  constructor(page) {
    super(page, '/general-enquiry');
    this.nameInput = this.form.locator('input[name="Name"]');
    this.emailInput = this.form.locator('input[name="Email"]');
    this.messageInput = this.form.locator('textarea[name="Message"]');
  }
}

class UploadPrescriptionPage extends FormPage {
  constructor(page) {
    super(page, '/upload-prescription');
    this.firstNameInput = this.form.locator('input[name="FirstName"]');
    this.lastNameInput = this.form.locator('input[name="LastName"]');
    this.emailInput = this.form.locator('input[name="EmailId"]');
    this.genderRadios = this.form.locator('input[name="Gender"]');
    this.dobInput = this.form.getByPlaceholder('DOB');
    this.addressInput = this.form.locator('input[name="Address"]');
    this.fileInput = page.locator('input[type="file"]');
  }
}

module.exports = { FormPage, HomeCollectionPage, GeneralEnquiryPage, UploadPrescriptionPage };
