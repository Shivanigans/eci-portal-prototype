// The prep pages and login: how a person gets from "Before you start" into each form.
const { test, expect, tick, untick } = require('./helpers');

test.describe('Form 8 prep', () => {
  test('the purposes are an accordion, all closed, with nothing to choose', async ({ page }) => {
    await page.goto('form8-prep.html?loggedIn=1');
    await expect(page.getByRole('radio')).toHaveCount(0);
    const docs = page.getByRole('region', { name: 'Documents required' });
    for (const name of ['Correct wrong details', 'Move to a new address', 'Replace your voter ID card', 'Mark as a person with disability']) {
      await expect(docs.getByRole('button', { name })).toHaveAttribute('aria-expanded', 'false');
    }
    await docs.getByRole('button', { name: 'Replace your voter ID card' }).click();
    await expect(docs.getByText('Copy of an FIR or police report')).toBeVisible();
  });

  test('Start application is disabled until "I understand" is ticked, and again if unticked', async ({ page }) => {
    await page.goto('form8-prep.html?loggedIn=1');
    const start = page.getByRole('button', { name: 'Start application' });
    const ack = page.getByRole('checkbox', { name: 'I understand' });
    await expect(start).toBeDisabled();
    await tick(ack);
    await expect(start).toBeEnabled();
    await untick(ack);
    await expect(start).toBeDisabled();
  });

  test('signed in, Start opens the form at its first question', async ({ page }) => {
    await page.goto('form8-prep.html?loggedIn=1');
    await tick(page.getByRole('checkbox', { name: 'I understand' }));
    await page.getByRole('button', { name: 'Start application' }).click();
    await expect(page).toHaveURL(/form8-application\.html\?loggedIn=1$/);
    await expect(page.getByRole('group', { name: /What do you need to do/ })).toBeVisible();
  });

  test('signed out, Start goes through login to the form', async ({ page }) => {
    await page.goto('form8-prep.html');
    await tick(page.getByRole('checkbox', { name: 'I understand' }));
    await page.getByRole('button', { name: 'Start application' }).click();
    await expect(page).toHaveURL(/login\.html\?next=/);

    // PROTOTYPE: the demo mobile number is already filled in and the one-time password types
    // itself in, so signing in is one press.
    await expect(page.getByLabel('Mobile number')).not.toHaveValue('');
    await page.getByRole('button', { name: 'Send OTP' }).click();
    await expect(page).toHaveURL(/form8-application\.html\?loggedIn=1$/, { timeout: 15000 });
  });

  test('the offline line under Start: a PDF that opens in a new tab and says so, and no Apply offline card', async ({ page }) => {
    await page.goto('form8-prep.html?loggedIn=1');
    await expect(page.getByRole('heading', { name: 'Apply offline' })).toHaveCount(0);
    await expect(page.getByText('No Aadhaar, or no mobile number linked to it? Submit this form in person.')).toBeVisible();
    const dl = page.getByRole('link', { name: /Download Form 8 \(PDF\)/ });
    await expect(dl).toHaveAttribute('target', '_blank');
    await expect(dl).toHaveAttribute('rel', 'noopener');
    await expect(dl).toContainText('(opens in a new tab)');
  });

  test('breadcrumb: Home, Correction of entries, then Form 8 guides as the current page', async ({ page }) => {
    await page.goto('form8-prep.html?loggedIn=1');
    const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(crumbs.getByRole('link', { name: 'Correction of entries' })).toHaveAttribute('href', /index\.html.*#services/);
    await expect(crumbs.getByText('Form 8 guides')).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('Form 6 prep', () => {
  test('Start application is disabled until "I understand" is ticked, and again if unticked', async ({ page }) => {
    await page.goto('form6-prep.html?loggedIn=1');
    await expect(page.getByRole('checkbox', { name: 'I understand I need Aadhaar e-Sign to submit online' })).toBeAttached();
    const start = page.getByRole('button', { name: 'Start application' });
    const ack = page.getByRole('checkbox', { name: 'I understand' });
    await expect(start).toBeDisabled();
    await tick(ack);
    await expect(start).toBeEnabled();
    await untick(ack);
    await expect(start).toBeDisabled();
  });

  test('signed out, Start goes to log in first, with the form as the next page', async ({ page }) => {
    await page.goto('form6-prep.html');
    await tick(page.getByRole('checkbox', { name: 'I understand' }));
    await page.getByRole('button', { name: 'Start application' }).click();
    await expect(page).toHaveURL(/login\.html\?next=form6-application\.html/);
  });

  test('there is no What happens next section; its 30 day line and Track link stay', async ({ page }) => {
    await page.goto('form6-prep.html?loggedIn=1');
    await expect(page.getByRole('heading', { name: 'What happens next' })).toHaveCount(0);
    await expect(page.locator('.ux4g-journey-timeline')).toHaveCount(0);
    await expect(page.getByText(/Applications are usually decided within 30 days/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Track an application' })).toBeVisible();
  });

  test('Start application opens the form', async ({ page }) => {
    await page.goto('form6-prep.html?loggedIn=1');
    await tick(page.getByRole('checkbox', { name: 'I understand' }));
    await page.getByRole('button', { name: 'Start application' }).click();
    await expect(page).toHaveURL(/form6-application\.html/);
    await expect(page.getByRole('heading', { name: 'Form 6', level: 1 })).toBeVisible();
  });

  test('breadcrumb Home goes back to the service cards', async ({ page }) => {
    await page.goto('form6-prep.html?loggedIn=1');
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: /Home/ }))
      .toHaveAttribute('href', /index\.html.*#services/);
  });
});
