// Log in and sign up: the two account pages, which share UX4G's Identity and Access card.
const { test, expect } = require('./helpers');

test.describe('Log in', () => {
  test('the +91 prefix sits beside the number, the demo hint shows, and an error takes its place', async ({ page }) => {
    await page.goto('login.html');
    const prefix = await page.locator('[data-group="resident"] .ux4g-input-prefix').boundingBox();
    const number = await page.locator('#login-mobile').boundingBox();
    expect(prefix.x + prefix.width).toBeLessThanOrEqual(number.x);
    await expect(page.locator('#login-mobile')).toHaveValue('98765 43210');
    await expect(page.locator('#login-mobile-help')).toHaveText(/Demo account: 98765.43210, code 123456\./);
    await expect(page.locator('#login-epic-help')).toBeHidden();

    await page.locator('#login-mobile').fill('12');
    await page.getByRole('button', { name: 'Send OTP' }).click();
    await expect(page.locator('#login-mobile-help')).toHaveText(/Enter a valid 10-digit mobile number\./);
  });

  test('Send OTP replaces the details with the code step, which fills and checks itself (PROTOTYPE)', async ({ page }) => {
    await page.goto('login.html');
    await page.getByRole('button', { name: 'Send OTP' }).click();
    await expect(page.getByRole('heading', { name: 'Enter the code' })).toBeVisible();
    // Nothing from step 1 is left in the card.
    const card = page.locator('#loginMount');
    for (const gone of [card.getByRole('tab'), page.locator('#login-mobile'), page.locator('#login-epic'), card.getByRole('link', { name: 'Sign up' })]) {
      await expect(gone.first()).toBeHidden();
    }
    await expect(page.locator('.login-sent')).toHaveText('Sent to +91 XXXXX 43210 Change');
    await expect(page.getByText('Demo code: 123456')).toBeVisible();
    await expect(page.getByRole('button', { name: /Resend code in \d+s/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Verify', exact: true })).toBeVisible();
    // The boxes start empty, then fill all at once and are checked; Verify never changes.
    const digits = page.locator('#login-otp .ux4g-otp-input');
    await expect(digits).toHaveCount(6);
    await expect(digits.nth(5)).toHaveValue('');
    for (let i = 0; i < 6; i++) await expect(digits.nth(i)).toHaveValue(String(i + 1));
    await expect(page.getByText('Verification successful')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify', exact: true })).toBeEnabled();
    await expect(page.getByText('Verified', { exact: true })).toHaveCount(0);

    await expect(page).toHaveURL(/index\.html\?loggedIn=1$/, { timeout: 15000 });
    await expect(page.getByRole('button', { name: /Ananya Rao/ })).toBeVisible();
  });

  test('typing in the boxes takes over, a digit missing is asked for, and Change keeps the number', async ({ page }) => {
    await page.goto('login.html');
    await page.getByRole('button', { name: 'Send OTP' }).click();
    // A key pressed in the boxes stops the demo code filling itself in.
    await page.getByLabel('Digit 1').press('4');
    await page.waitForTimeout(2000);
    await expect(page.locator('#login-otp .ux4g-otp-input').nth(1)).toHaveValue('');
    await page.getByRole('button', { name: 'Verify', exact: true }).click();
    await expect(page.getByText('Enter the 6 digit code.')).toBeVisible();
    await expect(page).toHaveURL(/login\.html/);

    await page.getByRole('button', { name: 'Change mobile number' }).click();
    await expect(page.getByRole('heading', { name: 'Log in to continue' })).toBeVisible();
    await expect(page.locator('#login-mobile')).toHaveValue('98765 43210');
    await expect(page.locator('#login-mobile')).toBeFocused();
  });

  test('a mobile number greys out EPIC, and EPIC alone shows a note instead of the code step (PROTOTYPE)', async ({ page }) => {
    await page.goto('login.html');
    const mobile = page.locator('#login-mobile'), epic = page.locator('#login-epic');
    await expect(epic).toBeDisabled();
    await mobile.fill('');
    await expect(epic).toBeEnabled();
    await epic.fill('abc1234567');
    await expect(mobile).toBeEnabled();
    await page.getByRole('button', { name: 'Send OTP' }).click();
    await expect(page.locator('#login-epic-help')).toHaveText(/EPIC login is not available in this demo\. Use the demo mobile number above\./);
    await expect(page.getByRole('heading', { name: 'Log in to continue' })).toBeVisible();

    await mobile.fill('98765 43210');
    await expect(epic).toBeDisabled();
    await expect(page.locator('#login-epic-help')).toBeHidden();
  });

  test('an overseas email is masked in the code step', async ({ page }) => {
    await page.goto('login.html');
    await page.getByRole('tab', { name: 'Overseas elector' }).click();
    await page.getByLabel('Email address').fill('ananya.rao@example.com');
    await page.getByRole('button', { name: 'Send OTP' }).click();
    await expect(page.locator('.login-sent')).toHaveText('Sent to a•••@example.com Change');
  });

  test('Sign up keeps the page the person was heading for, and the line has no contraction or arrow', async ({ page }) => {
    await page.goto('login.html?next=form6-application.html');
    await expect(page.getByText('You need an account to register, track, or update your voter details.')).toBeVisible();
    const line = page.locator('.login-signup');
    await expect(line).toHaveText('No account yet? Sign up');
    await line.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/signup\.html\?next=form6-application\.html/);
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
  });

  test('the homepage dialog is the same form as the page, with the same sizes', async ({ page }) => {
    const measure = () => page.evaluate(() => {
      const card = [...document.querySelectorAll('.login-card')].find(c => c.offsetParent !== null);
      const f = (sel) => { const e = card.querySelector(sel); const c = getComputedStyle(e); return [c.fontSize, c.fontWeight, c.lineHeight].join(' '); };
      return {
        text: card.innerText.replace(/\s+/g, ' ').replace(' close ', ' ').trim(),
        title: f('.login-head > :first-child'), intro: f('.login-intro'), label: f('label'),
        input: f('.ux4g-input-input'), helper: f('.ux4g-input-helper-text'), button: f('[type="submit"]'), link: f('.login-signup'),
        padding: getComputedStyle(card).padding, width: card.getBoundingClientRect().width,
        inputH: card.querySelector('.ux4g-input').getBoundingClientRect().height
      };
    });
    await page.goto('login.html');
    const pageForm = await measure();
    await page.goto('index.html');
    await expect(page.getByRole('dialog', { name: 'Log in to continue' })).toBeVisible();
    const dialogForm = await measure();
    expect(dialogForm).toEqual(pageForm);
    // The sizes themselves, at desktop width. On a phone UX4G scales the title down and the
    // labels and fields up (16px fields stop the phone zooming in); both forms still match.
    if (page.viewportSize().width >= 1024) {
      expect(pageForm.title).toBe('24px 700 28px');
      expect(pageForm.label.startsWith('12px')).toBe(true);
      expect(pageForm.inputH).toBe(40);
    }
  });

  test('the homepage dialog closes with Escape and signs in on the page', async ({ page }) => {
    await page.goto('index.html');
    const dialog = page.getByRole('dialog', { name: 'Log in to continue' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await page.getByRole('link', { name: 'Log in' }).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Send OTP' }).click();
    await expect(dialog).toBeHidden({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Ananya Rao/ })).toBeVisible();
  });
});

test.describe('Sign up', () => {
  test('Send OTP types the one-time password in, creates the account and signs in (PROTOTYPE)', async ({ page }) => {
    await page.goto('signup.html?next=form6-application.html');
    await page.getByRole('button', { name: 'Send OTP' }).click();
    await expect(page.getByRole('heading', { name: 'Enter the one-time password' })).toBeVisible();
    await expect(page.getByText('+91 98765 43210')).toBeVisible();
    await expect(page.locator('#otpBoxes .ux4g-otp-input').nth(5)).toHaveValue('6');
    await expect(page).toHaveURL(/form6-application\.html\?loggedIn=1/, { timeout: 15000 });
  });

  test('a missing name and a wrong number are asked for, and clear once fixed', async ({ page }) => {
    await page.goto('signup.html');
    const name = page.getByLabel('Full name');
    const mobile = page.getByLabel('Mobile number');
    await name.fill('');
    await mobile.fill('12345');
    await page.getByRole('button', { name: 'Send OTP' }).click();
    await expect(page.getByText('Enter your full name.')).toBeVisible();
    await expect(page.getByText('Enter a valid 10-digit mobile number.')).toBeVisible();
    await expect(name).toBeFocused();

    await name.fill('Ananya Rao');
    await expect(page.getByText('Enter your full name.')).toHaveCount(0);
    await mobile.fill('9876543210');
    await expect(page.getByText('Enter a valid 10-digit mobile number.')).toHaveCount(0);
  });

  test('the one-time password is needed, and the number can be changed', async ({ page }) => {
    await page.goto('signup.html');
    await page.getByRole('button', { name: 'Send OTP' }).click();
    const digits = page.locator('#otpBoxes .ux4g-otp-input');
    await expect(digits).toHaveCount(6);
    // A key pressed in the boxes stops the sample typing itself in.
    await page.getByLabel('Digit 1').press('4');
    await page.getByRole('button', { name: 'Verify and create account' }).click();
    await expect(page.getByText('Enter the 6 digit one-time password.')).toBeVisible();

    await page.getByRole('link', { name: 'Change mobile number' }).click();
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
    await expect(page.getByLabel('Mobile number')).toHaveValue('98765 43210');
  });

  test('Resend OTP types a new one-time password in and signs in', async ({ page }) => {
    await page.goto('signup.html');
    await page.getByRole('button', { name: 'Send OTP' }).click();
    await page.getByLabel('Digit 1').press('4');
    await page.getByRole('button', { name: 'Resend OTP' }).click();
    await expect(page.getByText('A new one-time password has been sent.')).toBeVisible();
    await expect(page.locator('#otpBoxes .ux4g-otp-input').nth(5)).toHaveValue('6');
    await expect(page).toHaveURL(/index\.html\?loggedIn=1$/, { timeout: 15000 });
  });

  test('every Sign up link on the site opens this page', async ({ page }) => {
    await page.goto('form6-prep.html');
    await page.getByRole('link', { name: 'Sign up' }).first().click();
    await expect(page).toHaveURL(/signup\.html/);
    // Back to log in at the top is the only way back: no OR or second button below Send OTP.
    await expect(page.getByRole('link', { name: 'Log in to an existing account' })).toHaveCount(0);
    await expect(page.locator('.auth-actions .ux4g-divider-horizontal-text')).toHaveCount(0);
    await page.getByRole('link', { name: 'Back to log in' }).click();
    await expect(page).toHaveURL(/login\.html/);
  });
});
