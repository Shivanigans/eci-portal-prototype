// Tracking: one page for both forms. The form type comes with the reference number; without
// it the page is the Form 6 view, exactly as before.
const { test, expect } = require('./helpers');

const main = (page) => page.locator('main');

test('Form 6 links show the Form 6 view, as before', async ({ page }) => {
  await page.goto('track.html?loggedIn=1&status=submitted&ref=MP%2FBHO%2F2026%2F123456');
  await expect(main(page).getByRole('heading', { name: 'New voter registration (Form 6)' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByText('Form 6')).toBeVisible();
  await expect(main(page).getByText('Your Form 6 was received online.')).toBeVisible();
  await expect(main(page).getByText('Added to the electoral roll')).toBeVisible();
});

test('a Form 8 correction shows Form 8, its purpose and the details', async ({ page }) => {
  await page.goto('track.html?loggedIn=1&status=submitted&form=8&purpose=correct&details=name,address&ref=MP%2FBHO%2F2026%2F123456');
  await expect(main(page).getByRole('heading', { name: 'Form 8: Correct wrong details' })).toBeVisible();
  await expect(main(page).getByText('Details being corrected: Name, Address')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByText('Form 8')).toBeVisible();
  await expect(main(page).getByText('Your Form 8 was received online.')).toBeVisible();
  await expect(main(page).getByText('Entry updated')).toBeVisible();
  await expect(main(page).getByText(/Form 6/)).toHaveCount(0);
  await expect(page).toHaveTitle('Track your application: Form 8');
});

test('Form 8 approved and rejected states use Form 8 wording', async ({ page }) => {
  await page.goto('track.html?loggedIn=1&status=approved&form=8&purpose=move&ref=MP%2FBHO%2F2026%2F123456');
  await expect(main(page).getByText('Your application has been approved.')).toBeVisible();
  await expect(main(page).getByText(/Your entry was updated on/)).toBeVisible();
  await expect(main(page).getByText('Details being corrected')).toHaveCount(0);

  await page.goto('track.html?loggedIn=1&status=rejected&form=8&purpose=move&ref=MP%2FBHO%2F2026%2F123456');
  await expect(main(page).getByRole('link', { name: 'Apply again with Form 8' })).toHaveAttribute('href', /form8-prep\.html/);
  await expect(main(page).getByText(/Form 6/)).toHaveCount(0);
});

test('Home in the navigation bar goes back to the portal, still signed in', async ({ page }) => {
  await page.goto('track.html?loggedIn=1');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL(/index\.html\?loggedIn=1$/);
  await expect(page.getByRole('button', { name: /Ananya Rao/ })).toBeVisible();
});
