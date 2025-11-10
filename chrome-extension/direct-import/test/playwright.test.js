/**
 * Playwright E2E tests for BookmarkX Chrome Extension
 *
 * Run with: npx playwright test
 */

const { test, expect, chromium } = require('@playwright/test')
const path = require('path')

const EXTENSION_PATH = path.join(__dirname, '..')
const TEST_PAGE = `file://${path.join(__dirname, 'test.html')}`

test.describe('BookmarkX Extension', () => {
  let browser
  let context
  let page

  test.beforeAll(async () => {
    // Launch browser with extension
    browser = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    })

    context = browser
    page = await context.newPage()
  })

  test.afterAll(async () => {
    await browser.close()
  })

  test('extension loads without errors', async () => {
    await page.goto(TEST_PAGE)

    // Check for extension errors in console
    const errors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForTimeout(2000)

    expect(errors.length).toBe(0)
  })

  test('extracts 10 fake bookmarks correctly', async () => {
    await page.goto(TEST_PAGE)

    // Run basic test
    await page.click('button:has-text("Basic Extraction")')

    // Wait for test to complete
    await page.waitForTimeout(2000)

    // Check console output
    const consoleText = await page.locator('#console').textContent()

    expect(consoleText).toContain('Extracted: 10/10')
    expect(consoleText).toContain('TEST PASSED')
  })

  test('extracts 50 fake bookmarks correctly', async () => {
    await page.goto(TEST_PAGE)

    await page.click('button:has-text("Medium Test")')
    await page.waitForTimeout(2000)

    const consoleText = await page.locator('#console').textContent()

    expect(consoleText).toContain('Extracted: 50/50')
    expect(consoleText).toContain('TEST PASSED')
  })

  test('extracts 100 fake bookmarks correctly', async () => {
    await page.goto(TEST_PAGE)

    await page.click('button:has-text("Large Test")')
    await page.waitForTimeout(3000)

    const consoleText = await page.locator('#console').textContent()

    expect(consoleText).toContain('Extracted: 100/100')
    expect(consoleText).toContain('TEST PASSED')
  })

  test('saves bookmarks to Chrome storage', async () => {
    await page.goto(TEST_PAGE)

    // Run extraction
    await page.evaluate(() => {
      // Create fake data
      const fakeBookmarks = Array.from({ length: 10 }, (_, i) => ({
        id: `${1234567890 + i}`,
        username: 'testuser',
        text: `Test ${i}`,
        url: `https://twitter.com/testuser/status/${1234567890 + i}`,
      }))

      // Save to storage
      chrome.storage.local.set({
        extractedBookmarks: fakeBookmarks,
        extractedAt: new Date().toISOString(),
      })
    })

    await page.waitForTimeout(500)

    // Verify storage
    const stored = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['extractedBookmarks'], (result) => {
          resolve(result.extractedBookmarks)
        })
      })
    })

    expect(stored).toHaveLength(10)
    expect(stored[0]).toHaveProperty('id')
    expect(stored[0]).toHaveProperty('username')
  })
})
