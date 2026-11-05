const { test, expect } = require('../fixtures/fixtures');
const testData = require('../test-data/testData');

/**
 * Complete homepage suite, grouped by page area.
 * "Hover" checks hover the element and confirm it stays visible and shows a pointer cursor.
 */

/** Hover an element and check it is still visible with a pointer (clickable) cursor. */
async function expectHoverable(locator, { pointer = true } = {}) {
  await locator.scrollIntoViewIfNeeded();
  await locator.hover();
  await expect(locator).toBeVisible();
  if (pointer) await expect(locator).toHaveCSS('cursor', 'pointer');
}

test.describe('Oncquest Labs - Complete Master Homepage Test Suite', () => {
  test.describe('1. Popups & Dialogs Management Module (PopupManager)', () => {
    test.describe(() => {
      // Let the real cookie banner load, and do not close it automatically
      test.use({ blockCookieBanner: false, handlePopups: false });

      test('[TC_POP_01] Verify DPDP & Cookie Consent Banner Management via dedicated PopupManager @regression', async ({ homePage, popupManager }) => {
        test.setTimeout(120_000);
        await homePage.open();
        await expect(popupManager.cookieBannerTitle).toBeVisible({ timeout: 30_000 });
        await expect(popupManager.cookieEssentialOnlyBtn).toBeVisible();
        await expect(popupManager.cookieAcceptAllBtn).toBeVisible();
        await popupManager.acceptEssentialCookiesOnly();
        await expect(popupManager.cookieBannerTitle).toBeHidden();
      });
    });

    test.describe(() => {
      // First-time visitor: no city stored yet. Popups are handled by hand here because the
      // city dialog sits on top of the welcome modal, so that one can only be closed afterwards.
      test.use({ seedCity: false, handlePopups: false });

      test('[TC_POP_02] Verify City / Location Selector Dialog Trigger and Close Flow via PopupManager @regression', async ({ homePage, popupManager }) => {
        await homePage.open();
        await expect(popupManager.cityDialogHeading).toBeVisible();
        await expect(popupManager.cityDialogSelect).toBeVisible();
        await popupManager.selectCity(testData.defaultCity);
        await expect(popupManager.cityDialogSelect).toBeHidden();
        await popupManager.closeWelcomeModalIfShown();
        await expect(homePage.headerCitySelect.locator('option:checked')).toHaveText(testData.defaultCity);
      });
    });
  });

  test.describe('Homepage areas', () => {
    test.beforeEach(async ({ homePage }) => {
      await homePage.open();
    });

    test.describe('2. Top Contact Bar & Utility Controls', () => {
      test('[TC_TOP_01] Verify Helpline Phone Link Visibility, Protocol (tel:) and Hover Effect @smoke', async ({ homePage }) => {
        await expect(homePage.topBarPhone).toBeVisible();
        await expect(homePage.topBarPhone).toHaveAttribute('href', new RegExp(`^tel:\\s*${testData.contact.phone}$`));
        await expectHoverable(homePage.topBarPhone);
      });

      test('[TC_TOP_02] Verify Support Email Link Visibility, Protocol (mailto:) and Hover Effect @smoke', async ({ homePage }) => {
        await expect(homePage.topBarEmail).toBeVisible();
        await expect(homePage.topBarEmail).toHaveAttribute('href', `mailto:${testData.contact.email}`);
        await expectHoverable(homePage.topBarEmail);
      });

      test('[TC_TOP_03] Verify User Login Button Visibility and Hover Interaction @regression', async ({ homePage }) => {
        await expect(homePage.loginBtn).toBeVisible();
        await expectHoverable(homePage.loginBtn);
      });
    });

    test.describe('3. Header Navigation & Brand Identity', () => {
      test('[TC_NAV_01] Verify Brand Logo Rendering, Hover Effect and Home Root Redirection @smoke', async ({ page, homePage }) => {
        await expect(homePage.logo).toBeVisible();
        expect(await homePage.logo.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
        await expectHoverable(homePage.logoLink);
        await homePage.logoLink.click();
        await expect(page).toHaveURL(/oncquestlabs\.com\/?$/);
      });

      test('[TC_HOME_002] Verify Logo and Search Bar are Visible in Header @smoke', async ({ homePage }) => {
        await expect(homePage.logo).toBeVisible();
        await expect(homePage.searchInput).toBeVisible();
        await expect(homePage.searchInput).toHaveAttribute('placeholder', 'Search for Tests and Packages');
      });

      test('[TC_NAV_02] Verify City Selector Dropdown Trigger Visibility and Hover Effect @regression', async ({ homePage }) => {
        await expect(homePage.headerCitySelect).toBeVisible();
        await expectHoverable(homePage.headerCitySelect, { pointer: false });
        await expect(homePage.headerCitySelect.locator('option:checked')).toHaveText(testData.defaultCity);
        expect(await homePage.headerCitySelect.locator('option').count()).toBeGreaterThan(1);
      });

      for (const [id, menu] of [['TC_NAV_03', 'Patient'], ['TC_NAV_04', 'Doctors'], ['TC_NAV_05', 'Wellness']]) {
        test(`[${id}] Verify "${menu}" Main Navigation Menu Link Visibility and Hover Effect @regression`, async ({ homePage }) => {
          const item = homePage.headerMenu(menu);
          await expect(item).toBeVisible();
          // Hovering opens the sub menu with the expected links
          await expect(async () => {
            await item.hover();
            await expect(item.locator('.h_dropdown-menu')).toBeVisible({ timeout: 2_000 });
          }).toPass({ timeout: 20_000 });
          for (const { name } of testData.headerMenus[menu]) {
            await expect.soft(item.locator('.h_dropdown-menu').getByRole('link', { name, exact: true })).toBeVisible();
          }
        });
      }

      test('[TC_NAV_06] Verify "Network" Main Navigation Menu Link Visibility and Hover Effect @regression', async ({ homePage }) => {
        const network = homePage.headerMenu('Network');
        await expect(network).toBeVisible();
        await expect(network).toHaveAttribute('href', '/centres');
        await expectHoverable(network);
      });

      test('[TC_NAV_07] Verify "Upload Prescription" CTA Button Visibility, Hover and Target Href @smoke', async ({ homePage }) => {
        await expect(homePage.uploadPrescriptionLink).toBeVisible();
        await expect(homePage.uploadPrescriptionLink).toHaveText(/Upload Prescription/);
        await expectHoverable(homePage.uploadPrescriptionLink);
      });
    });

    test.describe('4. Hero Promotional Banner & Carousel Controls', () => {
      test('[TC_HERO_01] Verify Hero Banner Carousel Rendering and Slide Presence @smoke', async ({ homePage }) => {
        await expect(homePage.heroSlider).toBeVisible();
        const slides = await homePage.heroSlides.count();
        expect(slides).toBeGreaterThan(1);
        await expect(homePage.heroDots).toHaveCount(slides);
        await expect(homePage.heroActiveDot).toHaveCount(1);
      });

      // The hero carousel has no arrow buttons; slides are changed with its pagination dots.
      // It autoplays and ignores dot clicks while a slide is animating, so the click is retried.
      async function goToHeroSlide(homePage, number) {
        await expect(async () => {
          await homePage.heroDots.nth(number - 1).click({ timeout: 5_000 });
          await expect(homePage.heroActiveDot).toHaveText(String(number), { timeout: 1_000 });
        }).toPass({ timeout: 20_000 });
      }

      test('[TC_HERO_02] Verify Carousel Moves to the Next Slide via Pagination Dot (Hover and Click) @regression', async ({ homePage }) => {
        await expectHoverable(homePage.heroDots.nth(3));
        await goToHeroSlide(homePage, 4);
      });

      test('[TC_HERO_03] Verify Carousel Moves Back to the Previous Slide via Pagination Dot (Hover and Click) @regression', async ({ homePage }) => {
        await goToHeroSlide(homePage, 4);
        await expectHoverable(homePage.heroDots.nth(2));
        await goToHeroSlide(homePage, 3);
      });

      test('[TC_HERO_04] Verify Every Promotional Banner Slide Links to a Page, and Hover on the Banner @regression', async ({ homePage }) => {
        const hrefs = await homePage.heroSlides.locator('a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
        expect(hrefs.length).toBeGreaterThan(1);
        for (const href of hrefs) expect.soft(href, 'banner link').toMatch(/^(\/|https?:\/\/)\S+/);
        // Hover the carousel itself: the slides keep moving, so a single slide is never "stable"
        await expectHoverable(homePage.heroSlider, { pointer: false });
        await expect(homePage.heroSlider.locator('.slick-slide.slick-active a').first()).toBeVisible();
      });
    });

    test.describe('5. Floating Sidebar Quick Action Buttons', () => {
      test.beforeEach(async ({ homePage }) => {
        await homePage.revealQuickActions();
      });

      const quickActions = [
        ['TC_QA_01', 'Cart', '/checkout'],
        ['TC_QA_02', 'Home Collection', '/home-collection'],
        ['TC_QA_03', 'Find a Test', '#'],
        ['TC_QA_04', 'Download Report', /^https:\/\/itd\.oncquest\.net\//],
        ['TC_QA_05', 'Find a Center', '/centres'],
      ];
      for (const [id, label, href] of quickActions) {
        test(`[${id}] Verify "${label}" Sidebar Button Visibility, Hover and Target Href @regression`, async ({ homePage }) => {
          const button = homePage.quickAction(label);
          await expect(button).toBeVisible();
          await expect(button.locator('a')).toHaveAttribute('href', href);
          await expectHoverable(button, { pointer: false });
          await expect(button.locator('a')).toHaveCSS('cursor', 'pointer');
        });
      }

      test('[TC_QA_06] Verify "Download Report" Sidebar Button Opens the External Report Portal in a New Tab @regression', async ({ homePage }) => {
        await expect(homePage.quickAction('Download Report').locator('a')).toHaveAttribute('target', '_blank');
      });
    });

    test.describe('6. Headings Integrity Across Homepage (H1, H2, Subheadings)', () => {
      test('[TC_HD_01] Verify Hero H1 Heading is Visible with Non-Empty Text @smoke', async ({ homePage }) => {
        await expect(homePage.visibleH1).toBeVisible();
        await expect(homePage.visibleH1).toHaveText(/\S+/);
        await expect(homePage.visibleH1).toContainText('Pathology Labs Network');
      });

      test('[TC_HD_02] Verify Total H1 Headings Count on Homepage @regression', async ({ homePage }) => {
        await expect(homePage.visibleH1).toHaveCount(1);
      });

      for (const [id, name, locatorKey] of [
        ['TC_HD_03', 'Why Oncquest', 'whyOncquestSection'],
        ['TC_HD_04', 'Inner Fitness Package', null],
        ['TC_HD_05', 'Book a Test', 'bookATestSection'],
        ['TC_HD_06', 'Related blogs', 'relatedBlogsSection'],
      ]) {
        test(`[${id}] Verify "${name}" Section H2 Heading Visibility and Text @regression`, async ({ page, homePage }) => {
          const heading = locatorKey ? homePage[locatorKey] : page.getByRole('heading', { name, level: 2 });
          if (locatorKey === 'relatedBlogsSection') await homePage.waitForRelatedBlogs();
          await expect(heading).toBeVisible();
          await expect(heading).toHaveText(name);
        });
      }

      test('[TC_HD_07] Verify Total Section H2 Headings Count Across Homepage @regression', async ({ homePage }) => {
        // "Related blogs" comes from a third-party widget and is covered by TC_HD_06 / TC_BLOG_01
        const expected = ['Why Oncquest', 'Inner Fitness Package', 'Book a Test', 'Wellness', 'Offers', 'Testimonials'];
        await expect(homePage.testimonialsSection).toBeAttached();
        const headings = (await homePage.contentH2.allTextContents()).map((t) => t.trim());
        expect(headings).toEqual(expect.arrayContaining(expected));
        expect(headings.length).toBeGreaterThanOrEqual(expected.length);
      });

      test('[TC_HOME_007] Verify All Key Homepage Sections are Visible @regression', async ({ homePage }) => {
        await homePage.waitForRelatedBlogs();
        const sections = {
          'Why Oncquest': homePage.whyOncquestSection,
          'Book a Test': homePage.bookATestSection,
          Wellness: homePage.wellnessSection,
          Offers: homePage.offersSection,
          Testimonials: homePage.testimonialsSection,
          'Related blogs': homePage.relatedBlogsSection,
        };
        // toBeVisible does not need the element scrolled into view, so a missing
        // section fails with a clear message instead of running into the test timeout
        for (const [name, section] of Object.entries(sections)) {
          await expect.soft(section, `"${name}" section should be on the home page`).toBeVisible();
        }
      });
    });

    test.describe('7. Inner Fitness Health Packages & Booking CTA', () => {
      test('[TC_PKG_01] Verify Health Package Cards Rendering Count @regression', async ({ homePage }) => {
        await expect(homePage.packageCards).toHaveCount(3);
        await expect(homePage.packageCards.locator('h6')).toHaveText(['Inner Fitness Basic', 'Inner Fitness Advance', 'Inner Fitness Comprehensive']);
      });

      test('[TC_PKG_02] Verify Specific Package Card (Basic / Advance) Visibility and Hover Effect @regression', async ({ homePage }) => {
        // Package cards are loaded after the page; wait for all of them first
        await expect(homePage.packageCards).toHaveCount(3, { timeout: 30_000 });
        const advance = homePage.packageCards.filter({ hasText: 'Inner Fitness Advance' });
        await expect(advance).toBeVisible();
        await expect(advance.locator('h6')).toBeVisible();
        // Hovering a card expands it (the site adds "flex-slidehover" to the hovered card)
        await expectHoverable(advance, { pointer: false });
        await expect(advance).toHaveClass(/flex-slidehover/);
      });

      test('[TC_PKG_03] Verify Package Action CTA Button ("Explore All") Visibility and Hover @regression', async ({ homePage }) => {
        await expect(homePage.exploreAllFitnessBtn).toBeVisible();
        await expect(homePage.exploreAllFitnessBtn).toHaveText('Explore All');
        await expectHoverable(homePage.exploreAllFitnessBtn);
      });

      test('[TC_PKG_04] Verify "Explore All" Opens the Preventive Health Check Packages Page @regression', async ({ page, homePage }) => {
        await homePage.exploreAllFitnessBtn.click();
        await expect(page).toHaveURL(/\/preventive-health-check-packages$/);
      });
    });

    test.describe('8. "Book a Test" Category Tabs & Organ Tiles', () => {
      test('[TC_TAB_01] Verify "BY Organs" Category Tab Button Visibility, Hover and Safe Click @regression', async ({ page, homePage }) => {
        const tab = homePage.bookTestTab('BY Organs');
        await expectHoverable(tab);
        await tab.click();
        await expect(tab).toHaveClass(/active/);
        await expect(homePage.organsPane).toBeVisible();
        await expect(page).toHaveURL(/oncquestlabs\.com\/?(#)?$/); // stays on the homepage
      });

      test('[TC_TAB_02] Verify "BY Lifestyle" Category Tab Button Visibility, Hover and Safe Click @regression', async ({ page, homePage }) => {
        const tab = homePage.bookTestTab('BY Lifestyle');
        await expectHoverable(tab);
        await tab.click();
        await expect(tab).toHaveClass(/active/);
        await expect(homePage.bookTestTab('BY Organs')).not.toHaveClass(/active/);
        await expect(homePage.lifestylePane).toBeVisible();
        await expect(homePage.organsPane).toBeHidden();
        await expect(homePage.tileTitles(homePage.lifestylePane)).toContainText(['High BP', 'Diabetes', 'Thyroid']);
        await expect(page).toHaveURL(/oncquestlabs\.com\/?(#)?$/);
      });

      test('[TC_TAB_03] Verify Organ Diagnostic Category Tiles (Kidney, Liver, Heart) Visibility and Hover @regression', async ({ homePage }) => {
        const titles = homePage.tileTitles(homePage.organsPane);
        // The slider rotates tile order, so check each tile separately (the site writes "kidney" in lower case)
        for (const organ of ['kidney', 'liver', 'heart']) {
          await expect.soft(titles.filter({ hasText: new RegExp(`^\\s*${organ}\\s*$`, 'i') }), `"${organ}" tile`).toHaveCount(1);
        }
        // The tiles autoplay, so hover the tile area rather than one moving tile
        await expectHoverable(homePage.organsPane, { pointer: false });
        await expect(homePage.organsPane.locator('.slick-slide.slick-active h3.infobox_title').first()).toBeVisible();
      });
    });

    test.describe('9. Quality Accreditations & Trust Pillars', () => {
      test('[TC_TRUST_01] Verify NABL / Certified Lab Accreditation Badge Visibility and Scroll @regression', async ({ homePage }) => {
        // The pillar title is spelled "Accredition" on the site
        const pillar = homePage.whyPillar('Accredition');
        await pillar.scrollIntoViewIfNeeded();
        await expect(pillar).toBeVisible();
        await expect(pillar).toContainText('NABL Certified Lab (MC-5076)');
        await homePage.footerNablLogo.scrollIntoViewIfNeeded();
        await expect(homePage.footerNablLogo).toBeVisible();
      });

      test('[TC_TRUST_02] Verify Pioneer 22+ Years Super-Specialized Laboratory Pillar Display @regression', async ({ homePage }) => {
        const pillar = homePage.whyPillar('Pioneer');
        await pillar.scrollIntoViewIfNeeded();
        await expect(pillar).toBeVisible();
        await expect(pillar).toContainText('22+ Years of Diagnostic Excellence');
        await expect(homePage.whyPillars).toHaveCount(8);
      });
    });

    test.describe('10. Testimonials & Related Health Blogs', () => {
      test('[TC_REV_01] Verify Patient Reviews and Testimonials Section Visibility @regression', async ({ homePage }) => {
        await homePage.testimonialsSection.scrollIntoViewIfNeeded();
        await expect(homePage.testimonialsSection).toBeVisible();
        await expect(homePage.testimonialSlides.first()).toBeAttached(); // slider initialises after load
        await expect(homePage.page.locator('.testi_slider .slick-slide.slick-active').first()).toHaveText(/\S{10,}/);
      });

      // The blog cards come from a third-party widget that intermittently stays empty on the live site
      test('[TC_BLOG_01] Verify Related Health Articles / Blog Cards Visibility @regression', async ({ homePage }) => {
        await homePage.waitForRelatedBlogs();
        await homePage.relatedBlogsSection.scrollIntoViewIfNeeded();
        await expect(homePage.blogCards.first()).toBeVisible();
        expect(await homePage.blogCards.count()).toBeGreaterThan(0);
        await expect(homePage.blogCards.first().locator('a').first()).toHaveAttribute('href', /oncquestlabs\.com\/answers\//);
      });
    });

    test.describe('11. Footer Section & Legal Policy Links', () => {
      test.beforeEach(async ({ homePage }) => {
        await homePage.footer.scrollIntoViewIfNeeded();
      });

      for (const [id, name, label] of [
        ['TC_FT_01', 'COMPANY', 'COMPANY'],
        ['TC_FT_02', 'PATIENTS', 'PATIENTS'],
        ['TC_FT_03', 'Doctors', 'DOCTORS'],
        ['TC_FT_04', 'CONNECT US', 'CONNECT US'],
      ]) {
        test(`[${id}] Verify Footer Column Heading: "${label}" Visibility @regression`, async ({ homePage }) => {
          await expect(homePage.footerHeading(name)).toBeVisible();
        });
      }

      for (const [id, name, path] of [
        ['TC_FT_05', 'Privacy Policy', '/privacy-policy'],
        ['TC_FT_06', 'Terms and Conditions', '/terms-condition'],
        ['TC_FT_07', 'Disclaimer', '/disclaimer'],
      ]) {
        test(`[${id}] Verify Footer Legal Link: ${name} Visibility, Hover and Href @regression`, async ({ homePage }) => {
          const link = homePage.legalLink(name);
          await expect(link).toBeVisible();
          await expect(link).toHaveAttribute('href', path);
          await expectHoverable(link);
        });
      }

      test('[TC_FT_08] Verify Official Copyright Notice Text Display @regression', async ({ homePage }) => {
        await expect(homePage.copyrightBar).toBeVisible();
        await expect(homePage.copyrightBar).toContainText(/Copyright © \d{4} Oncquest - All rights reserved\./);
      });
    });

    test.describe('12. Official Social Media Redirection Channels', () => {
      const ids = { Facebook: 'TC_SOC_01', Instagram: 'TC_SOC_02', Twitter: 'TC_SOC_03', LinkedIn: 'TC_SOC_04', YouTube: 'TC_SOC_05' };
      for (const { name, host } of testData.socialLinks) {
        const label = name === 'Twitter' ? 'Twitter / X' : name;
        test(`[${ids[name]}] Verify ${label} Official Channel Link Visibility, Hover and Href @regression`, async ({ homePage }) => {
          const link = homePage.socialLink(host);
          await link.scrollIntoViewIfNeeded();
          await expect(link).toBeVisible();
          await expect(link).toHaveAttribute('href', new RegExp(`^https://(www\\.)?${host.replace('.', '\\.')}/`));
          await expectHoverable(link);
        });
      }
    });

    test.describe('13. SEO & Page Metadata Integrity', () => {
      test('[TC_SEO_01] Verify Homepage <title> Tag Contains Brand and Diagnostics Keywords @smoke', async ({ page }) => {
        await expect(page).toHaveTitle(/Oncquest/);
        await expect(page).toHaveTitle(/Pathology Lab/i);
        await expect(page).toHaveTitle(/Diagnostic/i);
      });

      test('[TC_SEO_02] Verify Homepage <meta name="description"> Tag Contains Pathology Keywords @regression', async ({ page }) => {
        const description = await page.locator('meta[name="description"]').first().getAttribute('content');
        expect(description).toMatch(/pathology/i);
        expect(description).toMatch(/Oncquest/i);
        expect(description.length).toBeGreaterThan(50);
      });
    });

    test.describe('14. Page Quality & Stability', () => {
      // The 'load' event is unreliable on this site (third-party trackers keep loading),
      // so we wait for the visible images themselves instead.
      test('[TC_HOME_009] Verify No Broken Images in the First Viewport @regression', async ({ page }) => {
        const viewportImages = () =>
          [...document.images].filter((img) => img.offsetHeight > 0 && img.getBoundingClientRect().top < window.innerHeight);
        await expect
          .poll(() => page.evaluate(`(${viewportImages})().every((img) => img.complete)`), { timeout: 30_000 })
          .toBe(true);
        const brokenImages = await page.evaluate(
          `(${viewportImages})().filter((img) => img.naturalWidth === 0).map((img) => img.src)`,
        );
        expect(brokenImages, `Broken images: ${brokenImages.join(', ')}`).toHaveLength(0);
      });

      test('[TC_HOME_010] Verify No Uncaught JavaScript Errors on Load @regression', async ({ page, homePage }) => {
        const errors = [];
        page.on('pageerror', (err) => errors.push(err.message));
        await homePage.open();
        await expect(homePage.mainHeading.first()).toBeVisible();
        await page.waitForTimeout(3000); // let async scripts run
        expect(errors, errors.join('\n')).toHaveLength(0);
      });
    });
  });
});
