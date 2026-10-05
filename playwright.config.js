// Browser tests for the prototype. `npm test` starts a local server on port 4173 (or reuses one
// already running from `npm run serve`) and runs every test at desktop and phone sizes.
// The installed Google Chrome is used, so Playwright's own browsers are not needed.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  testIgnore: 'screenshots/**',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } }
  ],
  webServer: {
    command: 'npx http-server -p 4173 -c-1 --silent',
    url: 'http://localhost:4173/index.html',
    reuseExistingServer: true
  }
});
