// Form 8 application: one full run for each purpose, from the form to the confirmation, plus
// the checks each purpose adds. Uploads are left out: the form does not require them.
const { test, expect, tick, untick } = require('./helpers');

const LABELS = {
  correct: 'Correct wrong details',
  move: 'Move to a new address',
  replace: 'Replace your voter ID card',
  disability: 'Mark as a person with disability'
};
const section = (page, id) => page.locator(`section#${id}`);
const save = (page, id) => section(page, id).getByRole('button', { name: /Save and continue|Review application/ }).click();
const rail = (page) => page.getByRole('navigation', { name: 'Form sections' });


// Opens the form and answers Section 1, as a person arriving from the prep page does. For
// corrections, the details are ticked in Section 1 too.
async function open(page, purpose, details = []) {
  await page.goto('form8-application.html?loggedIn=1');
  const s1 = section(page, 'purpose');
  await tick(s1.getByRole('radio', { name: LABELS[purpose] }));
  for (const name of details) await tick(s1.getByRole('checkbox', { name }));
  await save(page, 'purpose');
}

async function yourDetails(page) {
  await section(page, 'your-details').getByRole('textbox', { name: 'Aadhaar number' }).fill('234567890123');
  await save(page, 'your-details');
}

// Declaration, review, e-Sign and the confirmation, the same for every purpose.
async function declareSignAndSubmit(page, purpose) {
  const decl = section(page, 'declaration');
  await tick(decl.getByRole('checkbox'));
  await save(page, 'declaration');

  if (purpose !== 'disability') await expect(page.getByText('Name on your new card')).toBeVisible();
  else await expect(page.getByText('Name on your new card')).toHaveCount(0);
  // Each section of the summary is a UX4G result list with its own Edit.
  await expect(page.locator('.ux4g-result-list-v2').first().getByRole('button', { name: 'Edit' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign with Aadhaar e-Sign' }).click();

  await expect(page.getByRole('heading', { name: 'Sign with Aadhaar e-Sign' })).toBeVisible();
  // PROTOTYPE: the one-time password starts filled in. Cleared, it is asked for.
  const otp = page.getByLabel('One-time password');
  await expect(otp).toHaveValue('123456');
  await otp.fill('');
  await page.getByRole('button', { name: 'Sign and submit' }).click();
  await expect(page.getByText('Enter the 6 digit one-time password.')).toBeVisible();
  await otp.fill('123456');
  await page.getByRole('button', { name: 'Sign and submit' }).click();

  await expect(page.getByRole('heading', { name: 'Your application has been submitted' })).toBeVisible();
  await expect(page.getByText('Form 8: ' + LABELS[purpose])).toBeVisible();
  await expect(page.getByText(/MP\/BHO\/2026\/\d+/)).toBeVisible();
  await expect(page.locator('main, body').first().getByText('Form 6', { exact: true })).toHaveCount(0);
}

// Clicks a radio's drawn circle without expecting it to stay chosen (a dialog may ask first).
const pressRadio = (radio) => radio.locator('xpath=following-sibling::*[contains(@class,"-control")][1]').click();

test.describe('Section 1', () => {
  test('nothing is chosen at first, and the rail shows only this section', async ({ page }) => {
    await page.goto('form8-application.html?loggedIn=1');
    await expect(section(page, 'purpose').getByRole('radio', { checked: true })).toHaveCount(0);
    await expect(rail(page).getByRole('link')).toHaveCount(1);
    await expect(rail(page).getByRole('link', { name: 'What do you need to do' })).toBeVisible();
    const saved = page.locator('.ux4g-auto-draft-status-bar .ux4g-body-xs-default');
    await expect(saved).toHaveText('Answers are saved automatically');

    await save(page, 'purpose');
    await expect(section(page, 'purpose').getByText('Choose what you need to do')).toBeVisible();
    await tick(section(page, 'purpose').getByRole('radio', { name: LABELS.replace }));
    await expect(section(page, 'purpose').getByText('Choose what you need to do')).toHaveCount(0);
    await expect(rail(page).getByRole('link', { name: 'Reason for replacement' })).toBeVisible();
    // The auto-save bar gives the time once an answer is in.
    await expect(saved).toHaveText(/^Saved \d{1,2}:\d{2} [ap]m$/);
  });

  test('correcting shows the details on the same screen, and needs one', async ({ page }) => {
    await page.goto('form8-application.html?loggedIn=1');
    const s1 = section(page, 'purpose');
    await expect(s1.getByRole('heading', { name: /What are you correcting/ })).toHaveCount(0);
    await tick(s1.getByRole('radio', { name: LABELS.correct }));
    await expect(s1.getByRole('heading', { name: /What are you correcting/ })).toBeVisible();
    await save(page, 'purpose');
    await expect(s1.getByText('Select at least one detail to correct').first()).toBeVisible();
  });

  test('no more than four details, in list order in the rail', async ({ page }) => {
    await page.goto('form8-application.html?loggedIn=1');
    const s1 = section(page, 'purpose');
    await tick(s1.getByRole('radio', { name: LABELS.correct }));
    for (const name of ['Relation type', 'Name', 'Date of birth or age', 'Gender']) {
      await tick(s1.getByRole('checkbox', { name, exact: true }));
    }
    await expect(s1.getByText('4 of 4 selected')).toBeVisible();
    await expect(s1.getByText('You can correct up to 4 details. Deselect one to choose another.')).toBeVisible();
    await expect(s1.getByRole('checkbox', { name: 'Photograph' })).toBeDisabled();
    await expect(rail(page).getByRole('link')).toHaveText(['What do you need to do', 'Name', 'Gender', 'Date of birth or age', 'Relation type', 'Your details', 'Declaration']);
  });

  test('the address alert link selects Move on the same screen', async ({ page }) => {
    await page.goto('form8-application.html?loggedIn=1');
    const s1 = section(page, 'purpose');
    await tick(s1.getByRole('radio', { name: LABELS.correct }));
    await tick(s1.getByRole('checkbox', { name: 'Address' }));
    await s1.getByRole('link', { name: 'Move to a new address' }).click();
    await expect(s1.getByRole('radio', { name: LABELS.move })).toBeChecked();
    await expect(s1.getByRole('heading', { name: /What are you correcting/ })).toHaveCount(0);
    await expect(rail(page).getByRole('link', { name: 'Your new address' })).toBeVisible();
  });

  test('changing the option after later entries asks first', async ({ page }) => {
    await open(page, 'replace');
    await section(page, 'your-details').getByRole('textbox', { name: 'Email address' }).fill('new@example.com');
    await rail(page).getByRole('link', { name: 'What do you need to do' }).click();
    const s1 = section(page, 'purpose');

    await pressRadio(s1.getByRole('radio', { name: LABELS.move }));
    await expect(page.getByRole('dialog', { name: 'Change what you are applying for?' })).toBeVisible();
    await page.getByRole('button', { name: 'Keep', exact: true }).click();
    await expect(s1.getByRole('radio', { name: LABELS.replace })).toBeChecked();
    await expect(s1.getByRole('radio', { name: LABELS.move })).not.toBeChecked();

    await pressRadio(s1.getByRole('radio', { name: LABELS.move }));
    await page.getByRole('button', { name: 'Change', exact: true }).click();
    await expect(s1.getByRole('radio', { name: LABELS.move })).toBeChecked();
    await rail(page).getByRole('link', { name: 'Your details' }).click();
    await expect(section(page, 'your-details').getByRole('textbox', { name: 'Email address' })).toHaveValue('ananya.rao@example.com');
  });
});

test.describe('correct wrong details', () => {
  test('full run with a mobile number correction', async ({ page }) => {
    await open(page, 'correct', ['Mobile number']);
    await section(page, 'fix-mobile').getByLabel('Correct mobile number').fill('9123456780');
    await save(page, 'fix-mobile');
    await yourDetails(page);
    await declareSignAndSubmit(page, 'correct');

    // The reference opens the Form 8 tracking view.
    await page.getByRole('link', { name: /Track/ }).click();
    await expect(page.getByRole('heading', { name: 'Form 8: Correct wrong details' })).toBeVisible();
    await expect(page.getByText('Details being corrected: Mobile number')).toBeVisible();
  });

  test('removing a detail with answers asks first', async ({ page }) => {
    await open(page, 'correct', ['Mobile number']);
    await section(page, 'fix-mobile').getByLabel('Correct mobile number').fill('9123456780');

    await rail(page).getByRole('link', { name: 'What do you need to do' }).click();
    await untick(section(page, 'purpose').getByRole('checkbox', { name: 'Mobile number' }));
    await expect(page.getByRole('dialog', { name: 'Remove Mobile number from this application?' })).toBeVisible();
    await page.getByRole('button', { name: 'Remove', exact: true }).click();
    await expect(rail(page).getByRole('link', { name: 'Mobile number' })).toHaveCount(0);
  });
});

test.describe('move to a new address', () => {
  test('full run, with the PIN code filling in the address', async ({ page }) => {
    await open(page, 'move');
    await yourDetails(page);

    const addr = section(page, 'new-address');
    await addr.getByLabel('House or building number').fill('7, Lake View');
    await addr.getByLabel('Street, area or locality').fill('Arera Colony');
    await addr.getByLabel('Town or village').fill('Bhopal');
    await addr.getByLabel('PIN code').fill('462003');
    await expect(page.locator('#mv-post-office')).toHaveValue('T T Nagar');
    await expect(addr.getByLabel('Your new constituency')).toHaveValue('152');
    await addr.getByLabel('Tehsil, taluka or mandal').fill('Huzur');

    await addr.getByLabel('Document in the name of').selectOption('parent');
    await expect(addr.getByText('They must already be registered at this address.')).toBeVisible();
    await addr.getByLabel('Supporting document').selectOption('Indian passport');
    await save(page, 'new-address');
    await declareSignAndSubmit(page, 'move');
  });
});

test.describe('clicking through with the sample answers (PROTOTYPE)', () => {
  test('the new address, Aadhaar and an upload need no typing', async ({ page }) => {
    await open(page, 'move');
    await expect(section(page, 'your-details').getByRole('textbox', { name: 'Aadhaar number' })).toHaveValue('2345 6789 0123');
    await save(page, 'your-details');

    const addr = section(page, 'new-address');
    await expect(addr.getByLabel('PIN code')).toHaveValue('462003');
    await expect(addr.getByLabel('Your new constituency')).toHaveValue('152');
    await addr.getByLabel('Document in the name of').selectOption('self');
    await addr.getByLabel('Supporting document').selectOption('Indian passport');

    // Upload attaches the sample file straight away; no file picker opens.
    let picker = false;
    page.on('filechooser', () => { picker = true; });
    await addr.getByRole('button', { name: /Upload/ }).first().click();
    await expect(addr.getByText('rent-agreement.pdf')).toBeVisible();
    expect(picker).toBe(false);

    await save(page, 'new-address');
    await declareSignAndSubmit(page, 'move');
  });
});

test.describe('replace your voter ID card', () => {
  test('the police report upload shows only for a lost card', async ({ page }) => {
    await open(page, 'replace');
    await yourDetails(page);
    const rep = section(page, 'replacement');
    await tick(rep.getByRole('radio', { name: 'Damaged' }));
    await expect(rep.getByText('Upload FIR or police report')).toHaveCount(0);
    await tick(rep.getByRole('radio', { name: 'Lost' }));
    await expect(rep.getByText('Upload FIR or police report')).toBeVisible();
  });

  test('full run', async ({ page }) => {
    await open(page, 'replace');
    await yourDetails(page);
    await tick(section(page, 'replacement').getByRole('radio', { name: 'Damaged' }));
    await save(page, 'replacement');
    await declareSignAndSubmit(page, 'replace');
  });
});

test.describe('mark as a person with disability', () => {
  test('a category is needed, and Other asks for a description', async ({ page }) => {
    await open(page, 'disability');
    await yourDetails(page);
    const dis = section(page, 'disability');
    await save(page, 'disability');
    await expect(dis.getByText('Select at least one category of disability.').first()).toBeVisible();
    await tick(dis.getByRole('checkbox', { name: 'Other' }));
    await expect(dis.getByLabel('Description of the disability')).toBeVisible();
  });

  test('full run', async ({ page }) => {
    await open(page, 'disability');
    await yourDetails(page);
    await tick(section(page, 'disability').getByRole('checkbox', { name: 'Locomotor' }));
    await save(page, 'disability');

    await declareSignAndSubmit(page, 'disability');
  });
});
