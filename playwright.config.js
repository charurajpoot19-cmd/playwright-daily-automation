// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

const isCI = !!process.env.CI;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  // The live site is slow under load; keep parallelism modest
  workers: isCI ? 1 : 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://oncquestlabs.com',
    headless: process.env.HEADLESS !== 'false',
    viewport: { width: 1366, height: 768 },
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  outputDir: 'reports/test-results',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
      testIgnore: /.*\.mobile\.spec\.js/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      testMatch: /.*\.mobile\.spec\.js/,
    },
  ],
});
