/**
 * Central test data. Keep all hard-coded values here so specs stay readable.
 * NOTE: Valid-data form submissions are intentionally NOT automated against
 * production, because they create real leads / send real OTPs.
 */
module.exports = {
  defaultCity: process.env.DEFAULT_CITY || 'Delhi',
  defaultCityId: process.env.DEFAULT_CITY_ID || '119', // site's internal id for Delhi

  centreState: 'DELHI', // a state on /centres that has at least one city

  contact: {
    phone: '0124-6650000',
    email: 'life@oncquestlabs.com',
  },

  search: {
    validKeyword: 'thyroid',
    expectedSuggestion: 'Thyroid Profile Total',
    expectedSuggestionUrl: '/test/thyroid-profile-total',
    invalidKeyword: 'zzqqxxnotatest',
  },

  invalid: {
    shortMobile: '12345',
    alphaMobile: 'abcdefghij',
    longMobile: '98765432101234',
    email: 'invalid-email',
  },

  // Header menu -> sub menu -> expected path
  headerMenus: {
    Patient: [
      { name: 'Book a Test', path: '/book-a-test' },
      { name: 'Offers and Discounts', path: '/offers' },
      { name: 'Find a Center Near You', path: '/centres' },
      { name: 'Home Collection Query Form', path: '/blood-sample-home-collection' },
      { name: "FAQ's", path: '/faq' },
    ],
    Doctors: [
      { name: 'Department', path: '/departments' },
      { name: 'Brochures', path: '/brochures' },
    ],
    Wellness: [
      { name: 'Preventive Health Check Package', path: '/preventive-health-check-packages' },
    ],
  },

  // Important public pages: path -> text expected in <title>
  pages: [
    { path: '/', title: /Oncquest/i },
    { path: '/book-a-test', title: /Book A Lab Test/i },
    { path: '/centres', title: /Network/i },
    { path: '/faq', title: /FAQ/i },
    { path: '/upload-prescription', title: /Upload Your Prescription/i },
    { path: '/general-enquiry', title: /General Enquiry/i },
    { path: '/blood-sample-home-collection', title: /Oncquest/i },
    { path: '/offers', title: /Oncquest/i },
    { path: '/overview', title: /Oncquest/i },
    { path: '/career', title: /Oncquest/i },
  ],

  footerLinks: [
    { name: 'About Us', path: '/overview' },
    { name: "Director's Message", path: '/directors-message' },
    { name: 'Accreditations', path: '/accreditation' },
    { name: 'Career', path: '/career' },
    { name: 'General Enquiry', path: '/general-enquiry' },
    { name: 'Become a Partner', path: '/partner-with-us' },
  ],

  socialLinks: [
    { name: 'Facebook', host: 'facebook.com' },
    { name: 'Instagram', host: 'instagram.com' },
    { name: 'Twitter', host: 'twitter.com' },
    { name: 'LinkedIn', host: 'linkedin.com' },
    { name: 'YouTube', host: 'youtube.com' },
  ],

  messages: {
    firstNameRequired: 'First Name is required',
    nameRequired: 'Name is required',
    mobileRequired: 'Mobile is required',
    cityRequired: 'City is required',
    dateRequired: 'Preferred Date is required',
    timeRequired: 'Preferred Time is required',
    mobile10Digit: 'Enter only 10 Digit',
    captchaRequired: 'GRecaptcha is required',
    loginMobileRequired: 'Mobile Number is required',
    loginMobile10Digit: 'Enter 10 Digit',
  },
};
