// Offline help: the homepage "Find your nearest centre" card and its side sheet, the Help menu,
// the quiet offline line on both prep screens, and the footer declaration's width.
const { test, expect, tick, untick } = require('./helpers');

const sheet = (page) => page.getByRole('dialog', { name: 'Find your nearest centre' });

test.describe('Homepage', () => {
  test('the offline section is gone; one card opens the sheet, and the guides stay', async ({ page }) => {
    await page.goto('index.html?loggedIn=1');
    await expect(page.getByRole('heading', { name: 'Prefer to apply offline?' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^Download forms/ })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Guides to help you get started' })).toBeVisible();
    await expect(page.getByText('Locate an Electoral Registration Office or Common Service Centre near you.')).toBeVisible();

    // Anywhere on the card opens it, not only the arrow.
    // The arrow button's ::after covers the card, so a click on the text lands on it.
    const text = page.getByText('Locate an Electoral Registration Office');
    await text.scrollIntoViewIfNeeded();
    const box = await text.boundingBox();
    await page.mouse.click(box.x + 10, box.y + box.height / 2);
    await expect(sheet(page)).toBeVisible();
  });

  test('on open it finds centres for a second, then lists the 3 nearest with Maps links in a new tab (PROTOTYPE)', async ({ page }) => {
    await page.goto('index.html?loggedIn=1');
    // No real location lookup: the browser is never asked.
    await page.evaluate(() => {
      window.__asked = 0;
      navigator.geolocation.getCurrentPosition = () => { window.__asked++; };
      // The loading line lasts a second; note it as it shows, with the location bar still hidden,
      // so a slow test run cannot miss it.
      new MutationObserver(() => {
        const bar = document.querySelector('.centre-loc-bar');
        if (document.querySelector('.centre-loading:not([hidden])') && bar && bar.hidden) window.__sawLoading = true;
      }).observe(document.body, { childList: true, subtree: true, attributes: true });
    });
    await page.getByRole('button', { name: 'Find your nearest centre' }).click();
    const s = sheet(page);
    await expect(s.getByText('Using your current location')).toBeVisible();
    expect(await page.evaluate(() => window.__sawLoading)).toBe(true);
    await expect(s.getByText('Finding centres near you…')).toHaveText('Finding centres near you…');
    await expect(s.getByText('Finding centres near you…')).toBeHidden();
    await expect(s.getByRole('heading', { name: 'Centres near you' })).toBeVisible();
    expect(await page.evaluate(() => window.__asked)).toBe(0);

    await expect(s.getByRole('listitem')).toHaveCount(3);
    await expect(s.locator('.ux4g-tag-tonal-success')).toHaveCount(2);
    await expect(s.locator('.ux4g-tag-tonal-neutral')).toHaveCount(1);
    await expect(s.locator('[class*="error"]')).toHaveCount(0);
    const maps = s.getByRole('link', { name: /Open in Google Maps/ });
    await expect(maps).toHaveCount(3);
    await expect(maps.first()).toHaveAttribute('target', '_blank');
    // Each searches Maps for the centre's name.
    await expect(maps.first()).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Electoral Registration Office, New Delhi'));
    const all = s.getByRole('link', { name: /See all centres on Google Maps/ });
    await expect(all).toHaveAttribute('target', '_blank');
    await expect(all).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Electoral Registration Office near me'));
  });

  for (const how of ['close button', 'Escape', 'scrim']) {
    test(`the sheet closes with the ${how} and focus goes back to the card`, async ({ page }) => {
      await page.goto('index.html?loggedIn=1');
      const opener = page.getByRole('button', { name: 'Find your nearest centre' });
      await opener.focus();
      await page.keyboard.press('Enter');
      await expect(sheet(page)).toBeVisible();
      await expect(sheet(page).getByRole('button', { name: 'Close' })).toBeFocused();
      if (how === 'close button') await sheet(page).getByRole('button', { name: 'Close' }).click();
      if (how === 'Escape') await page.keyboard.press('Escape');
      if (how === 'scrim') await page.mouse.click(10, 300);
      await expect(sheet(page)).toBeHidden();
      await expect(opener).toBeFocused();
    });
  }

  test('PIN code: swaps in for the location bar, checks for 6 digits, and finds centres near it', async ({ page }) => {
    await page.goto('index.html?loggedIn=1');
    await page.getByRole('button', { name: 'Find your nearest centre' }).click();
    const s = sheet(page);
    await s.getByRole('button', { name: 'Enter PIN code instead' }).click();
    const pin = s.getByLabel('PIN code');
    await expect(pin).toBeFocused();
    await expect(s.getByText('Using your current location')).toBeHidden();
    await expect(s.getByRole('button', { name: 'Use my current location' })).toBeVisible();

    await pin.fill('1100');
    await s.getByRole('button', { name: 'Search' }).click();
    await expect(s.locator('#centre-pin-help')).toHaveText(/Enter a 6-digit PIN code\./);
    await expect(s.locator('.ux4g-input-error')).toHaveCount(1);
    await pin.fill('110001');
    await expect(s.locator('.ux4g-input-error')).toHaveCount(0);
    await s.getByRole('button', { name: 'Search' }).click();
    await expect(s.getByText('Finding centres near you…')).toBeVisible();
    await expect(s.getByRole('heading', { name: 'Centres near 110001' })).toBeVisible();
    await expect(s.getByRole('listitem')).toHaveCount(3);

    // And back to the current location.
    await s.getByRole('button', { name: 'Use my current location' }).click();
    await expect(s.getByRole('heading', { name: 'Centres near you' })).toBeVisible();
    await expect(s.getByText('Using your current location')).toBeVisible();
    await expect(s.getByRole('button', { name: 'Enter PIN code instead' })).toBeFocused();
  });

  test('the declaration and its divider span the footer, level with "Last updated"', async ({ page }) => {
    await page.goto('index.html?loggedIn=1');
    const decl = page.getByText(/^Declaration: This is a mock website/);
    const row = page.getByText('Last updated: July 29, 2026').locator('..');
    const d = await decl.boundingBox();
    const r = await row.boundingBox();
    expect(Math.abs(d.x - r.x)).toBeLessThanOrEqual(1);
    expect(Math.abs((d.x + d.width) - (r.x + r.width))).toBeLessThanOrEqual(1);
  });
});

test.describe('Help menu', () => {
  for (const pageName of ['index.html?loggedIn=1', 'form6-prep.html?loggedIn=1', 'track.html']) {
    test(`on ${pageName.split('?')[0]}, Help holds Call 1950 and Book a call with BLO`, async ({ page }) => {
      await page.goto(pageName);
      const help = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Help' });
      await expect(help).toHaveAttribute('aria-expanded', 'false');
      await help.click();
      await expect(help).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('link', { name: /Call 1950/ })).toHaveAttribute('href', 'tel:1950');
      await expect(page.getByRole('link', { name: /Book a call with BLO/ })).toHaveAttribute('href', /service\.html\?s=book-blo/);
      await expect(page.locator('#help-menu').getByText(/Download/)).toHaveCount(0);
      await page.keyboard.press('Escape');
      await expect(help).toHaveAttribute('aria-expanded', 'false');
      await expect(help).toBeFocused();
    });
  }

  test('on an application form, Book a call with BLO asks before leaving', async ({ page }) => {
    await page.goto('form6-application.html?loggedIn=1');
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Help' }).click();
    await page.getByRole('link', { name: /Book a call with BLO/ }).click();
    await expect(page.getByRole('dialog', { name: /Leave this application/ })).toBeVisible();
    await expect(page).toHaveURL(/form6-application\.html/);
  });
});

test.describe('Prep screens', () => {
  for (const form of ['6', '8']) {
    test(`Form ${form}: a quiet offline line under Start, with two plain links; the second opens the sheet`, async ({ page }) => {
      await page.goto(`form${form}-prep.html?loggedIn=1`);
      const line = page.locator('.offline-line');
      await expect(line).toContainText('No Aadhaar, or no mobile number linked to it? Submit this form in person.');
      await expect(line.getByRole('link', { name: new RegExp(`Download Form ${form} \\(PDF\\)`) })).toBeVisible();
      await expect(line.locator('.ux4g-btn, .ux4g-icon-outlined, .ux4g-card')).toHaveCount(0);
      const find = line.getByRole('button', { name: 'Find your nearest centre' });
      await find.click();
      await expect(sheet(page)).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(find).toBeFocused();
    });
  }

  test('Form 8: the "I understand" box still gates Start application', async ({ page }) => {
    await page.goto('form8-prep.html?loggedIn=1');
    const start = page.getByRole('button', { name: 'Start application' });
    await expect(start).toBeDisabled();
    await tick(page.getByRole('checkbox', { name: 'I understand' }));
    await expect(start).toBeEnabled();
    await untick(page.getByRole('checkbox', { name: 'I understand' }));
    await expect(start).toBeDisabled();
  });
});
