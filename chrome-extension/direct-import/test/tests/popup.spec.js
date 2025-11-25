/**
 * E2E tests for BookmarkHub Extension Popup
 *
 * Tests the popup UI functionality including:
 * - Popup rendering
 * - Button interactions
 * - Status message display
 * - Progress bar updates
 */

const { test, expect, chromium } = require('@playwright/test')
const path = require('path')
const { generateMockBookmarks } = require('../fixtures/mock-bookmarks')

const EXTENSION_PATH = path.join(__dirname, '../..')

test.describe('Popup UI', () => {
  let browser
  let extensionId

  test.beforeAll(async () => {
    // Launch browser with extension loaded
    browser = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-sandbox',
      ],
    })

    // Get extension ID from service worker
    let serviceWorker
    serviceWorker = browser.serviceWorkers()[0]
    if (!serviceWorker) {
      serviceWorker = await browser.waitForEvent('serviceworker')
    }
    extensionId = serviceWorker.url().split('/')[2]
  })

  test.afterAll(async () => {
    await browser.close()
  })

  test.beforeEach(async () => {
    // Clear extension storage before each test
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)
    await page.evaluate(() => {
      chrome.storage.local.clear()
    })
    await page.close()
  })

  test('popup loads without errors', async () => {
    const page = await browser.newPage()
    const errors = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)
    await page.waitForLoadState('domcontentloaded')

    // Wait a bit for any async initialization
    await page.waitForTimeout(500)

    // Filter out expected/benign errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('DevTools')
    )

    expect(criticalErrors.length).toBe(0)
    await page.close()
  })

  test('popup displays all required UI elements', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    // Check main buttons exist
    const importBtn = page.locator('#importBtn')
    const openAppBtn = page.locator('#openAppBtn')

    await expect(importBtn).toBeVisible()
    await expect(openAppBtn).toBeVisible()

    // Check status area exists
    const status = page.locator('#status')
    await expect(status).toBeVisible()

    // Check info section exists
    const info = page.locator('#info')
    await expect(info).toBeVisible()

    await page.close()
  })

  test('import button is enabled by default', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const importBtn = page.locator('#importBtn')
    await expect(importBtn).toBeEnabled()

    await page.close()
  })

  test('import button opens Twitter bookmarks page', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    // Track new tabs
    const pagePromise = browser.waitForEvent('page')

    // Click import button
    await page.locator('#importBtn').click()

    // Wait for new tab
    const newPage = await pagePromise

    // Verify URL is Twitter/X bookmarks (twitter.com redirects to x.com)
    await newPage.waitForLoadState('domcontentloaded')
    const url = newPage.url()
    expect(url.includes('twitter.com/i/bookmarks') || url.includes('x.com/i/bookmarks')).toBe(true)

    await newPage.close()
    await page.close()
  })

  test('open app button creates new tab with BookmarkHub URL', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    // Track new tabs
    const pagePromise = browser.waitForEvent('page')

    // Click open app button
    await page.locator('#openAppBtn').click()

    // Wait for new tab
    const newPage = await pagePromise
    await newPage.waitForLoadState('domcontentloaded')

    // Verify URL contains bookmarkhub (localhost in dev or bookmarkhub.app in prod)
    const url = newPage.url()
    expect(
      url.includes('localhost:5173') ||
        url.includes('bookmarkhub.app') ||
        url.includes('bookmarkhub.local')
    ).toBe(true)

    await newPage.close()
    await page.close()
  })

  test('displays previous import info when bookmarks exist in storage', async () => {
    const page = await browser.newPage()

    // First, save some bookmarks to storage
    const mockBookmarks = generateMockBookmarks(5)
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    await page.evaluate((bookmarks) => {
      return new Promise((resolve) => {
        chrome.storage.local.set(
          {
            extractedBookmarks: bookmarks,
            extractedAt: new Date().toISOString(),
          },
          resolve
        )
      })
    }, mockBookmarks)

    // Reload popup to see the status update
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    // Check status shows import info
    const statusText = await page.locator('#status').textContent()
    expect(statusText).toContain('Last import')
    expect(statusText).toContain('5 bookmarks')

    await page.close()
  })

  test('close info button hides info section', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const info = page.locator('#info')
    const closeBtn = page.locator('#closeInfoBtn')

    // Info should be visible initially
    await expect(info).toBeVisible()

    // Click close button
    await closeBtn.click()

    // Info should be hidden
    await expect(info).not.toBeVisible()

    await page.close()
  })

  test('progress bar is hidden by default', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const progress = page.locator('#progress')

    // Progress should be hidden by default (display: none in CSS)
    const display = await progress.evaluate((el) => getComputedStyle(el).display)
    expect(display).toBe('none')

    await page.close()
  })
})
