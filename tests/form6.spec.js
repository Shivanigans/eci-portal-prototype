// Form 6 application: the first section, which covers the pieces the other sections share
// (errors on save, errors clearing once fixed, the combobox, radios, moving to the next section).
// State and district start filled in from the sample record.
const { test, expect, tick } = require('./helpers');

const section = (page, id) => page.locator(`section#${id}`);

async function pick(page, label, option) {
  const box = page.getByRole('combobox', { name: label });
  await box.click();
  await box.fill(option);
  await page.getByRole('option', { name: option, exact: true }).click();
}

test('saving without a constituency type shows the error, and it clears once fixed', async ({ page }) => {
  await page.goto('form6-application.html?loggedIn=1');
  const con = section(page, 'constituency');
  await con.getByRole('button', { name: 'Save and continue' }).click();

  const error = con.getByText('Choose assembly or parliamentary constituency.');
  await expect(error).toBeVisible();
  await tick(con.getByRole('radio', { name: 'Assembly constituency' }));
  await expect(error).toHaveCount(0);
});

test('the constituency section fills in and moves on', async ({ page }) => {
  await page.goto('form6-application.html?loggedIn=1');
  const con = section(page, 'constituency');
  const bar = page.getByRole('progressbar', { name: 'Application progress' });
  await expect(bar).toHaveAttribute('aria-valuenow', '0');
  await expect(page.getByText('0% complete')).toBeVisible();
  const saved = page.locator('.ux4g-auto-draft-status-bar .ux4g-body-xs-default');
  await expect(saved).toHaveText('Answers are saved automatically');

  await pick(page, 'State or union territory', 'Madhya Pradesh');
  await pick(page, 'District', 'Bhopal');
  await tick(con.getByRole('radio', { name: 'Assembly constituency' }));
  await pick(page, 'Assembly constituency name', 'Huzur');
  await expect(con.getByLabel('Assembly constituency number')).toHaveValue(/155/);

  await con.getByRole('button', { name: 'Save and continue' }).click();
  await expect(section(page, 'your-details').getByLabel('First name and middle name')).toBeVisible();

  // The progress bar and its label both move on once the section is saved.
  await expect(bar).not.toHaveAttribute('aria-valuenow', '0');
  // The label rounds to the nearest 10%.
  await expect(page.getByText('10% complete')).toBeVisible();
  const fill = await bar.locator('.ux4g-progress-bar-fill').boundingBox();
  expect(fill.width).toBeGreaterThan(5);
  // The auto-save bar gives the time of the save.
  await expect(saved).toHaveText(/^Saved \d{1,2}:\d{2} [ap]m$/);
  await page.screenshot({ path: 'screenshots/progress-' + test.info().project.name + '.png' });
});

test('an info tooltip shows on hover and on keyboard focus, and Escape hides it', async ({ page }, info) => {
  await page.goto('form6-application.html?loggedIn=1');
  const trigger = page.getByRole('button', { name: 'What is a constituency?' });
  const tip = page.locator('#constituency-type-tip');
  await expect(tip).toBeHidden();

  await trigger.hover();
  await expect(tip).toBeVisible();
  await page.screenshot({ path: `screenshots/tooltip-${info.project.name}.png` });
  await page.keyboard.press('Escape');
  await expect(tip).toBeHidden();

  await page.mouse.move(0, 0);
  await trigger.focus();
  await expect(tip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tip).toBeHidden();
});

test('Upload attaches a sample photo straight away, with no file picker (PROTOTYPE)', async ({ page }) => {
  await page.goto('form6-application.html?loggedIn=1');
  await page.getByRole('link', { name: 'B. Personal details' }).click();
  let picker = false;
  page.on('filechooser', () => { picker = true; });
  await page.locator('#photo-btn').click();
  await expect(page.getByText('passport-photo.jpg')).toBeVisible();
  expect(picker).toBe(false);
  // The scripted check still runs on the sample file.
  const photo = page.locator('#photo-label').locator('xpath=..');
  await expect(photo.getByText('Verifying document.', { exact: true }).first()).toHaveCount(0, { timeout: 10000 });
  await page.getByText('passport-photo.jpg').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'screenshots/sample-upload-' + test.info().project.name + '.png' });
});

test('Close application asks first, and Stay on this form keeps the form open', async ({ page }) => {
  await page.goto('form6-application.html?loggedIn=1');
  await page.getByRole('button', { name: 'Close application' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Leave this application?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Leave the form' })).toHaveAttribute('href', /index\.html/);
  await page.screenshot({ path: 'screenshots/leave-dialog-' + test.info().project.name + '.png' });
  await dialog.getByRole('button', { name: 'Stay on this form' }).click();
  await expect(dialog).toHaveCount(0);
});

test('Home in the navigation bar asks before leaving the form', async ({ page }) => {
  await page.goto('form6-application.html?loggedIn=1');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('heading', { name: 'Leave this application?' })).toBeVisible();
  await expect(page).toHaveURL(/form6-application\.html/);
});
