// `npm run shots`: full-page screenshots of every page at desktop and phone sizes, saved to
// screenshots/<size>/. Used to look over the pages after a change, for example once pasted
// component CSS has been applied to every page.
const base = require('./playwright.config.js');

module.exports = {
  ...base,
  testDir: 'tests/screenshots',
  testIgnore: undefined,
  reporter: 'list'
};
