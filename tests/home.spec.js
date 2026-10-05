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
