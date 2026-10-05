// Shared test helpers. Every spec imports `test` and `expect` from here rather than from
// @playwright/test, so that each page gets the UX4G CDN cache below.
const fs = require('fs');
const path = require('path');
const base = require('@playwright/test');

// The UX4G CDN rate-limits (429 Too Many Requests) when many tests load pages at once, and a
// page without its UX4G CSS behaves differently. Each UX4G file is fetched once, kept in
// .cache/cdn/ and served from there afterwards. Delete that folder to fetch fresh copies.
const CACHE = path.join(__dirname, '..', '.cache', 'cdn');

async function serveFromCache(route) {
  const url = new URL(route.request().url());
  const file = path.join(CACHE, url.hostname, decodeURIComponent(url.pathname));
  const type = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff' }[path.extname(file)];
  if (fs.existsSync(file)) {
    return route.fulfill({ path: file, headers: { 'content-type': type || 'application/octet-stream', 'access-control-allow-origin': '*' } });
  }
  const res = await route.fetch();
  if (res.ok()) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, await res.body());
    fs.renameSync(tmp, file);
  }
  return route.fulfill({ response: res });
}

const test = base.test.extend({
  page: async ({ page }, use) => {
    await page.route('https://cdn.ux4g.gov.in/**', serveFromCache);
    await use(page);
  }
});
const expect = base.expect;

// UX4G Radio and Checkbox hide the real input and draw their own control, so Playwright cannot
// click the input itself. These click the drawn control (the circle or box), as a person does.
// Not the label text: UX4G's own script (ux4g.js 3.2.0, its delegated click handler) cancels
// clicks on a radio's label text, so only the circle selects a radio.
const control = (input) => input.locator('xpath=following-sibling::*[contains(@class,"-control")][1]');

async function tick(input) {
  await control(input).click();
  await expect(input).toBeChecked();
}

// No check afterwards: unticking can open a confirmation first (Form 8's remove dialog).
async function untick(input) {
  await control(input).click();
}

module.exports = { test, expect, tick, untick };
