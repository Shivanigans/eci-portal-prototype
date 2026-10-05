// The homepage: the hero, the search bar's guide and suggestions, and what was taken out.
const { test, expect } = require('./helpers');

const signedIn = 'index.html?loggedIn=1';

test.describe('Homepage hero', () => {
  test('the heading and subline are centred, with the search bar at most 720px and centred under them', async ({ page }) => {
    await page.goto(signedIn);
    const hero = page.locator('.home-hero');
    await expect(hero.getByRole('heading', { name: 'What do you want to do today?' })).toHaveCSS('text-align', 'center');
    await expect(hero.getByText('Register to vote, check your status, or update your details')).toHaveCSS('text-align', 'center');
    const bar = await page.locator('.home-search').boundingBox();
    const heroBox = await hero.boundingBox();
    const cards = await page.locator('.home-search + div').boundingBox();
    // Centred under the hero; 720px wide, or the full width on a phone.
    expect(Math.abs((bar.x + bar.width / 2) - (heroBox.x + heroBox.width / 2))).toBeLessThanOrEqual(1);
    expect(Math.round(bar.width)).toBe(Math.min(720, Math.round(cards.width)));
    // Other headings keep their alignment.
    await expect(page.getByRole('heading', { name: 'Other services' })).toHaveCSS('text-align', 'start');
  });

  test('every clickable card has the same hover, UX4G\'s: only the shadow deepens', async ({ page }) => {
    await page.goto(signedIn);
    await expect(page.locator('.service-card')).toHaveCount(4);
    await expect(page.locator('.service-tile')).toHaveCount(9);
    const look = (el) => el.evaluate(e => { const s = getComputedStyle(e); return { bg: s.backgroundColor, border: s.borderTopColor, shadow: s.boxShadow, transform: s.transform }; });
    const shadows = new Set();
    for (const card of [page.locator('.service-card').nth(1), page.locator('.service-tile').first(), page.locator('.centre-card'), page.getByRole('link', { name: /Documents you’ll need/ })]) {
      await card.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(400);
      const rest = await look(card);
      await card.hover();
      await page.waitForTimeout(400);
      const hover = await look(card);
      expect(hover.shadow).not.toBe(rest.shadow);
      expect({ bg: hover.bg, border: hover.border, transform: hover.transform }).toEqual({ bg: rest.bg, border: rest.border, transform: rest.transform });
      shadows.add(hover.shadow);
    }
    expect(shadows.size).toBe(1);
  });

  test('a card that is not clickable does not react to hover', async ({ page }) => {
    await page.goto('form6-prep.html?loggedIn=1');
    const faq = page.locator('.faq-card');
    await faq.scrollIntoViewIfNeeded();
    const before = await faq.evaluate(e => getComputedStyle(e).boxShadow);
    await faq.hover();
    await page.waitForTimeout(400);
    expect(await faq.evaluate(e => getComputedStyle(e).boxShadow)).toBe(before);
  });

  test('the SIR strip is one line of text and one link, with the state as plain text (PROTOTYPE)', async ({ page }) => {
    await page.addInitScript(() => { navigator.geolocation.getCurrentPosition = () => { window.__asked = true; }; });
    await page.goto(signedIn);
    const strip = page.getByRole('region', { name: 'Voter list revision notice' });
    await expect(strip.locator('p')).toHaveText('Voter list revision is open in Madhya Pradesh until 30 October 2026.');
    await expect(strip.getByRole('link')).toHaveCount(1);
    await expect(strip.getByRole('link', { name: 'Fill your form' })).toHaveAttribute('href', '#sir-form');
    await expect(strip.locator('select, [aria-haspopup]')).toHaveCount(0);
    // The tint is a box at the navbar's content edges, not a full-width band.
    const box = strip.locator('.sir-strip-row');
    await expect(box).toHaveCSS('background-color', 'rgb(220, 212, 255)');
    await expect(strip).not.toHaveCSS('background-color', 'rgb(220, 212, 255)');
    const row = await box.boundingBox();
    const nav = await page.locator('.eci-header-row-nav').evaluate(e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return { left: r.left + parseFloat(s.paddingLeft), right: r.right - parseFloat(s.paddingRight) }; });
    expect(Math.round(row.x)).toBe(Math.round(nav.left));
    expect(Math.round(row.x + row.width)).toBe(Math.round(nav.right));
    expect(await page.evaluate(() => window.__asked)).toBeUndefined();
  });

  test('around the SIR card, 48px either side of the band edge, as around the Guides band; no band of its own', async ({ page }) => {
    await page.goto(signedIn);
    const gaps = await page.evaluate(() => {
      const b = (s) => document.querySelector(s).getBoundingClientRect();
      const band = b('#services');
      return [
        band.bottom - b('.home-search + div').bottom,          // service cards to the grey edge
        b('#sir .sir-card').top - band.bottom,                 // grey edge to the SIR card
        b('#other-services').top - b('#sir .sir-card').bottom, // SIR card to Other services
        b('#guides-heading').top - b('#guides').top            // the Guides band, for comparison
      ].map(Math.round);
    });
    // The grey edge has a 1px border, counted inside the band.
    expect(gaps.map(g => Math.abs(g - 48) <= 1)).toEqual([true, true, true, true]);
    await expect(page.locator('#sir')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    // The card itself carries the colour: UX4G's lightest purple.
    await expect(page.locator('#sir .sir-card')).toHaveCSS('background-color', 'rgb(242, 239, 255)');
  });

  test('every content block on the homepage shares the same 1100px edges', async ({ page }) => {
    await page.goto(signedIn);
    const edges = await page.evaluate(() => {
      const blocks = {
        cards: document.querySelector('.home-search + div'),
        sir: document.querySelector('#sir .sir-card'),
        other: document.querySelector('#other-services').parentElement,
        forms: document.querySelector('#download-forms-heading').closest('section').firstElementChild,
        centre: document.querySelector('.centre-card'),
        guides: document.querySelector('#guides').firstElementChild,
        faqs: document.querySelector('#faqs').firstElementChild
      };
      return Object.fromEntries(Object.entries(blocks).map(([k, el]) => { const r = el.getBoundingClientRect(); return [k, [Math.round(r.left), Math.round(r.right)]]; }));
    });
    const first = edges.cards;
    for (const [name, e] of Object.entries(edges)) expect(e, name).toEqual(first);
    if (page.viewportSize().width >= 1164) expect(first[1] - first[0]).toBe(1100);
  });

  test('the SIR card sits in the page container, with no state picker', async ({ page }) => {
    await page.goto(signedIn);
    const card = page.locator('#sir .sir-card');
    await expect(card.getByRole('heading', { name: 'Special Intensive Revision (SIR) 2026' })).toBeVisible();
    await expect(card.getByText('Open now')).toBeVisible();
    await expect(card.getByText('A door-to-door check of the voter list. You may need to return a form to stay on the roll.')).toBeVisible();
    await expect(card.getByRole('link', { name: 'Fill enumeration form' })).toHaveClass(/ux4g-btn-primary/);
    await expect(card.getByRole('link', { name: 'Fill enumeration form' })).toHaveCSS('color', 'rgb(250, 250, 250)');
    await expect(card.getByRole('link', { name: 'Search your name in last SIR' })).toHaveClass(/ux4g-btn-outline-primary/);
    await expect(card.getByRole('link', { name: 'Submit documents' })).toBeVisible();
    await expect(card.getByRole('link', { name: 'See the full phase schedule' })).toBeVisible();
    await expect(page.locator('#sir select')).toHaveCount(0);
    await expect(page.getByText('Check the dates for your state')).toHaveCount(0);
    // Same width as the service cards, not edge to edge.
    const box = await card.boundingBox();
    const cards = await page.locator('.home-search + div').boundingBox();
    expect(Math.round(box.width)).toBe(Math.round(cards.width));
    // On a phone the buttons drop below the text and stack.
    const fill = await card.getByRole('link', { name: 'Fill enumeration form' }).boundingBox();
    const search = await card.getByRole('link', { name: 'Search your name in last SIR' }).boundingBox();
    const text = await card.locator('.sir-card-text').boundingBox();
    if (page.viewportSize().width < 860) {
      expect(fill.y).toBeGreaterThan(text.y + text.height - 1);
      expect(search.y).toBeGreaterThan(fill.y + fill.height - 1);
    } else {
      expect(Math.round(search.y)).toBe(Math.round(fill.y));
    }
  });

  test('the persona carousel is gone', async ({ page }) => {
    await page.goto(signedIn);
    await expect(page.getByRole('heading', { name: 'Find services relevant to you' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Scroll to (previous|next) cards/ })).toHaveCount(0);
  });
});

test.describe('Homepage search', () => {
  test('the guide rotates its ending, stops on focus, and starts again once empty and left', async ({ page }) => {
    await page.goto(signedIn);
    const input = page.getByRole('combobox', { name: 'Search for a service' });
    const hint = page.locator('.home-search-hint');
    await expect(hint).toHaveText('I want to register to vote');
    await expect(hint).toHaveText('I want to check my application status', { timeout: 4000 });

    await input.click();
    const shown = await hint.textContent();
    await page.waitForTimeout(2600);
    await expect(hint).toHaveText(shown);

    await input.fill('vo');
    await expect(hint).toBeHidden();
    await input.fill('');
    await page.waitForTimeout(2600);
    await expect(hint).toHaveText(shown);
    // Empty and left: the tint closes the list and the bar loses focus.
    await page.locator('.home-search-scrim').click({ position: { x: 5, y: 5 } });
    await expect(input).not.toBeFocused();
    await expect(hint).not.toHaveText(shown, { timeout: 4000 });
  });

  test('with reduced motion the guide stays on its first ending', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(signedIn);
    await page.waitForTimeout(2600);
    await expect(page.locator('.home-search-hint')).toHaveText('I want to register to vote');
  });

  test('clicking in opens one "My situation" list over the page, with a tint, without moving the cards', async ({ page }) => {
    await page.goto(signedIn);
    const card = page.getByRole('link', { name: /Register as a new voter/ }).first();
    const before = await card.boundingBox();
    await page.getByRole('combobox', { name: 'Search for a service' }).click();
    const list = page.getByRole('listbox', { name: 'Services' });
    await expect(list).toBeVisible();
    await expect(list.getByRole('group')).toHaveCount(1);
    await expect(list.getByText('Common tasks')).toHaveCount(0);
    const names = await list.getByRole('group', { name: 'My situation' }).getByRole('option')
      .evaluateAll(os => os.map(o => o.querySelector('.ux4g-list-item-start').lastChild.textContent));
    expect(names).toEqual(['I’ve moved to a new city', 'I recently got married', 'I live abroad', 'I’m a person with a disability']);
    // Each row has an icon, nothing is highlighted yet, and the list never scrolls.
    await expect(list.locator('.home-search-icon')).toHaveCount(4);
    await expect(list.locator('[aria-selected="true"]')).toHaveCount(0);
    const fit = await list.evaluate(l => [l.scrollHeight, l.clientHeight]);
    expect(fit[0]).toBe(fit[1]);
    // Same width as the bar, 8px under it, with 16px corners.
    const bar = await page.locator('.home-search-bar').boundingBox();
    const drop = await list.boundingBox();
    expect(Math.round(drop.width)).toBe(Math.round(bar.width));
    expect(Math.round(drop.y - (bar.y + bar.height))).toBe(8);
    await expect(list).toHaveCSS('border-radius', '16px');
    const row = await list.locator('.ux4g-list-item-row').first().boundingBox();
    expect(Math.round(row.height)).toBe(40);
    await expect(page.locator('.home-search-scrim')).toBeVisible();
    expect(await card.boundingBox()).toEqual(before);

    // The tint closes it.
    await page.locator('.home-search-scrim').click({ position: { x: 5, y: 5 } });
    await expect(list).toBeHidden();
    await expect(page.locator('.home-search-scrim')).toBeHidden();
  });

  test('typing replaces the groups with matches, and an item opens its page', async ({ page }) => {
    await page.goto(signedIn);
    const input = page.getByRole('combobox', { name: 'Search for a service' });
    await input.click();
    await input.fill('I want to fix my name');
    const list = page.getByRole('listbox', { name: 'Services' });
    await expect(list.getByRole('group')).toHaveCount(0);
    await expect(list.getByRole('option').first()).toHaveAccessibleName('Update my details');
    // Matches come from every service, at most five.
    await input.fill('e');
    await expect(list.getByRole('option')).toHaveCount(5);
    await input.fill('register');
    await expect(list.getByRole('option', { name: 'Register as a new voter' })).toBeVisible();
    await input.fill('zzz');
    await expect(list).toContainText('No services match “zzz”.');
    await input.fill('abroad');
    await list.getByRole('option', { name: 'I live abroad' }).click();
    await expect(page).toHaveURL(/service\.html\?s=nri&loggedIn=1$/);
  });

  test('arrow keys move through the items, Enter opens one, and Escape closes the list', async ({ page }) => {
    await page.goto(signedIn);
    const input = page.getByRole('combobox', { name: 'Search for a service' });
    await input.click();
    await input.press('Escape');
    await expect(page.getByRole('listbox', { name: 'Services' })).toBeHidden();
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await input.press('ArrowDown');
    const married = page.getByRole('option', { name: 'I recently got married' });
    await expect(married).toHaveAttribute('aria-selected', 'true');
    await expect(married.locator('.ux4g-list-item-row')).toHaveCSS('background-color', 'rgb(220, 212, 255)');
    await expect(input).toBeFocused();
    await input.press('Enter');
    await expect(page).toHaveURL(/form8-prep\.html\?loggedIn=1$/);
  });
});

test.describe('Sign up', () => {
  test('the password note is small helper text right under Send OTP', async ({ page }) => {
    await page.goto('signup.html');
    const note = page.getByText('You do not need a password.', { exact: false });
    await expect(note).toHaveCSS('font-size', /^1[12](\.\d+)?px$/);
    await expect(note).toHaveCSS('color', 'rgb(115, 115, 115)');
    const button = await page.getByRole('button', { name: 'Send OTP' }).boundingBox();
    const box = await note.boundingBox();
    expect(Math.round(box.y - (button.y + button.height))).toBe(4);
  });
});
