/**
 * Central test data. Keep all hard-coded values here so specs stay readable.
 * NOTE: Valid-data form submissions are intentionally NOT automated against
 * production, because they create real leads / send real OTPs.
 */
module.exports = {
  defaultCity: process.env.DEFAULT_CITY || 'Delhi',
  defaultCityId: process.env.DEFAULT_CITY_ID || '119', // site's internal id for Delhi

  centreState: 'DELHI', // a state on /centres that has at least one city

  // Centre finder: the default city is Delhi, which has more centres than one listing page
  centres: {
    locality: 'rohini',
    localityCentreUrl: '/centre/oncquest-laboratories-ltdrohini-in-rohini',
    unknownLocality: 'zzqqxx',
    otherState: 'KARNATAKA',
    otherStateCity: 'Bengaluru',
    zone: 'south',
    labTypes: ['Oncquest Collection Centre', 'Oncquest Labs', 'PSC', 'HLM'],
  },

  privilegeCard: {
    sections: ['Offers', 'Exceptions', 'How to avail', 'Validity'],
    benefits: [
      '20% Discount for Senior Citizens',
      '15% Discount',
      'Free Home Collection',
      'Free Doctor consult on test report',
    ],
  },

  packages: {
    queryNatures: ['Preventive Health Check', 'Diagnostic Test', 'Other'],
    contentHeadings: [
      'What is Preventive Health Checkup Package',
      'What is Included in a Preventive Health Checkup?',
      'When Should You Get a Preventive Health Checkup?',
    ],
  },

  // FAQ categories. "Test Specific" currently has no questions (see TC_FAQ_012)
  faqTabs: [
    { name: 'COVID-19 Test', firstQuestion: 'What is COVID-19 (Coronavirus Disease)?' },
    { name: 'Generic FAQ', firstQuestion: 'Can we book a blood test' },
    { name: 'Preventive Health Check (Wellness Check)', firstQuestion: 'How do I get a Preventive Health Check' },
  ],

  // Quick Links card -> page it opens -> a heading on that page
  quickLinks: [
    { name: 'Neurology', path: '/neurology', heading: 'Things you should know about Nervous system' },
    { name: 'Allergy', path: '/allergy', heading: 'What is Allergy?' },
    { name: 'MammaPrint + BluePrint', path: '/mamma-print', heading: 'Indian Scenario on Breast Cancer' },
    { name: 'Gurugram Lab', path: '/gurugram-lab', heading: 'About National Reference Laboratory, Gurugram' },
    { name: 'Bengaluru Lab', path: '/bengaluru-lab', heading: 'About Bengaluru Lab' },
    { name: 'Kolkata Lab', path: '/kolkata-lab', heading: 'About Kolkata Lab' },
    { name: 'Cancer', path: '/cancer', heading: 'What is cancer' },
    { name: 'Prenatal Testing', path: '/prenatal-testing', heading: 'Types of prenatal testing' },
    { name: 'Oncquest-MOH Ludhiana', path: '/ludhiana-lab', heading: 'About Oncquest-MOH Ludhiana' },
  ],

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
      { name: 'Privilege Membership Card', path: '/privilege-membership-card' },
      { name: 'Find a Center Near You', path: '/centres' },
      { name: 'Search for Packages', path: '/preventive-health-check-packages' },
      { name: 'Home Collection Query Form', path: '/blood-sample-home-collection' },
      { name: 'Testimonial', path: '/testimonials' },
      { name: "FAQ's", path: '/faq' },
      { name: "Quick Link's", path: '/quick-links' },
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
    { path: '/offers', title: /Offers & Discounts/i },
    { path: '/privilege-membership-card', title: /Privilege Membership Card/i },
    { path: '/preventive-health-check-packages', title: /Preventive Health Checkup Packages/i },
    { path: '/quick-links', title: /Quick Links/i },
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
    termsRequired: 'You must accept the terms and conditions',
    loginMobileRequired: 'Mobile Number is required',
    loginMobile10Digit: 'Enter 10 Digit',
  },
};
