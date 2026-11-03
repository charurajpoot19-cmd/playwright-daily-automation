# Oncquest Labs – UI Automation (Playwright + JavaScript)

End-to-end UI test suite for **https://oncquestlabs.com**, built with Playwright Test using the
**Page Object Model**, custom fixtures and centralised test data.

## Project structure

```
Oncquest/
├── fixtures/
│   └── fixtures.js            # Custom test fixtures (page objects + popup handling)
├── pages/                     # Page Object Model
│   ├── BasePage.js            # Header, footer, search, popups – shared by all pages
│   ├── HomePage.js
│   ├── LoginPage.js
│   ├── FormPage.js            # Home Collection / General Enquiry / Upload Prescription
│   ├── BookTestPage.js
│   ├── CentresPage.js
│   └── PopupManager.js        # Cookie banner, welcome modal, city dialog
├── test-data/
│   └── testData.js            # All test data, URLs and expected messages
├── tests/
│   ├── homepage.spec.js            # complete homepage suite (14 modules)
│   ├── search.spec.js
│   ├── navigation.spec.js
│   ├── login.spec.js
│   ├── forms.spec.js
│   ├── book-test-and-centres.spec.js
│   ├── footer-seo.spec.js
│   └── responsive.mobile.spec.js   # runs only on the mobile project
├── playwright.config.js
├── .env.example
└── package.json
```

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env      # Windows: copy .env.example .env
```

## Running tests

| Command | Purpose |
|---|---|
| `npm test` | Run the full suite (desktop + mobile) |
| `npm run test:smoke` | Only `@smoke` tests |
| `npm run test:regression` | Only `@regression` tests |
| `npm run test:desktop` | Desktop Chrome only |
| `npm run test:mobile` | Mobile (Pixel 7) only |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:ui` | Playwright UI mode |
| `npm run report` | Open the last HTML report |

Run a single file or test:

```bash
npx playwright test tests/login.spec.js
npx playwright test -g "TC_LOGIN_002"
```

## Reports

- HTML report: `reports/html-report/index.html`
- JUnit XML (for CI): `reports/junit/results.xml`
- Screenshots, videos and traces of failed tests: `reports/test-results/`

## Test coverage

| Module | IDs | What is covered |
|---|---|---|
| Homepage | TC_POP_*, TC_TOP_*, TC_NAV_01–07, TC_HERO_*, TC_QA_*, TC_HD_*, TC_PKG_*, TC_TAB_*, TC_TRUST_*, TC_REV_01, TC_BLOG_01, TC_FT_*, TC_SOC_*, TC_SEO_01–02, TC_HOME_002/007/009/010 | Popups, top bar, header & logo, hero carousel, floating quick actions, headings, packages, Book a Test tabs, trust pillars, testimonials & blogs, footer & legal links, social links, SEO, broken images, JS errors |
| Search | TC_SRCH_001–006 | Suggestions, expected result, open test detail, case-insensitivity, no result, clear |
| Navigation | TC_NAV_*, TC_PAGE_* | Every header sub-menu, Network, Upload Prescription, Login; HTTP 200 + title for key pages |
| Login | TC_LOGIN_001–005 | UI, empty, short, too long and alphabetic mobile number |
| Forms | TC_HC_*, TC_GE_*, TC_UP_* | Fields displayed, mandatory field errors, invalid mobile, dropdown data |
| Book a Test / Centres | TC_BOOK_*, TC_CEN_* | Test listing, BOOK NOW, centre filters, state → city dependency |
| Footer / SEO | TC_FOOT_*, TC_SEO_* | Footer links, social links, meta description, single H1, HTTPS, DOM ready time |
| Mobile | TC_MOB_001–003 | Horizontal scroll, login and form usability on Pixel 7 |

## Design notes

- **Popups are handled automatically.** The site shows three overlays: city selection, a
  "Blood Sample Collection from Home" modal (~10 s after load) and a cookie consent banner.
  The fixture pre-selects the city via `localStorage['oq:city']` and registers a Playwright
  locator handler that closes the other two whenever they appear.
  Use `test.use({ seedCity: false })` to test as a first-time visitor.
- **No real submissions.** Successful form submissions and OTP login are **not** automated on
  production because they create real leads / send real SMS. Run those on a staging environment.
- **Tags.** Every test is tagged `@smoke` or `@regression` for selective runs.
- **Waits.** No `load`/`networkidle` waits – third-party trackers keep the network busy on this
  site. Tests rely on Playwright's auto-waiting assertions instead.
