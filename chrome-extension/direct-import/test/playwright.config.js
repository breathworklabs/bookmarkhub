const { defineConfig } = require('@playwright/test')
const path = require('path')

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  retries: 1,
  workers: 1, // Run tests serially - extension testing requires single browser instance
  use: {
    headless: false, // Required for Chrome extension testing
    viewport: { width: 1280, height: 720 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
})
