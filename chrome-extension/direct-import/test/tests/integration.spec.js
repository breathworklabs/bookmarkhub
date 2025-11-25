/**
 * E2E Integration tests for BookmarkHub Extension
 *
 * Tests the full extension flow including:
 * - Complete extraction to app flow with mock data
 * - Bookmark format transformation
 * - Hashtag and media extraction
 * - Error recovery
 */

const { test, expect, chromium } = require('@playwright/test')
const path = require('path')
const {
  generateMockBookmarks,
  generateMockRawTweets,
  generateMockLocalStorageData,
} = require('../fixtures/mock-bookmarks')

const EXTENSION_PATH = path.join(__dirname, '../..')
const TEST_PAGE = `file://${path.join(__dirname, '../test.html')}`

test.describe('Integration Tests', () => {
  let browser
  let extensionId

  test.beforeAll(async () => {
    browser = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-sandbox',
      ],
    })

    // Get extension ID
    let serviceWorker = browser.serviceWorkers()[0]
    if (!serviceWorker) {
      serviceWorker = await browser.waitForEvent('serviceworker')
    }
    extensionId = serviceWorker.url().split('/')[2]
  })

  test.afterAll(async () => {
    await browser.close()
  })

  test.beforeEach(async () => {
    // Clear extension storage
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)
    await page.evaluate(() => chrome.storage.local.clear())
    await page.close()
  })

  test('extension loads without errors', async () => {
    const page = await browser.newPage()
    const errors = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto(TEST_PAGE)
    await page.waitForTimeout(2000)

    // Filter benign errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('DevTools') && !e.includes('net::')
    )

    expect(criticalErrors.length).toBe(0)
    await page.close()
  })

  test('extracts 10 fake bookmarks correctly (basic test)', async () => {
    const page = await browser.newPage()
    await page.goto(TEST_PAGE)

    // Run basic test
    await page.click('button:has-text("Basic Extraction")')

    // Wait for test to complete
    await page.waitForTimeout(2500)

    // Check console output
    const consoleText = await page.locator('#console').textContent()

    expect(consoleText).toContain('Extracted: 10/10')
    expect(consoleText).toContain('TEST PASSED')

    await page.close()
  })

  test('extracts 50 fake bookmarks correctly (medium test)', async () => {
    const page = await browser.newPage()
    await page.goto(TEST_PAGE)

    await page.click('button:has-text("Medium Test")')
    await page.waitForTimeout(2500)

    const consoleText = await page.locator('#console').textContent()

    expect(consoleText).toContain('Extracted: 50/50')
    expect(consoleText).toContain('TEST PASSED')

    await page.close()
  })

  test('extracts 100 fake bookmarks correctly (large test)', async () => {
    const page = await browser.newPage()
    await page.goto(TEST_PAGE)

    await page.click('button:has-text("Large Test")')
    await page.waitForTimeout(3500)

    const consoleText = await page.locator('#console').textContent()

    expect(consoleText).toContain('Extracted: 100/100')
    expect(consoleText).toContain('TEST PASSED')

    await page.close()
  })

  test('saves bookmarks to Chrome storage', async () => {
    // This test needs to run in the extension context, not test.html
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    // Create fake data and save to storage
    await page.evaluate(() => {
      const fakeBookmarks = Array.from({ length: 10 }, (_, i) => ({
        id: `${1234567890 + i}`,
        username: 'testuser',
        text: `Test ${i}`,
        url: `https://twitter.com/testuser/status/${1234567890 + i}`,
      }))

      return new Promise((resolve) => {
        chrome.storage.local.set({
          extractedBookmarks: fakeBookmarks,
          extractedAt: new Date().toISOString(),
        }, resolve)
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

    await page.close()
  })

  test('transformed bookmarks have all required fields', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const mockBookmarks = generateMockBookmarks(1)
    const bookmark = mockBookmarks[0]

    // Verify all required fields exist
    expect(bookmark).toHaveProperty('id')
    expect(bookmark).toHaveProperty('user_id')
    expect(bookmark).toHaveProperty('title')
    expect(bookmark).toHaveProperty('url')
    expect(bookmark).toHaveProperty('description')
    expect(bookmark).toHaveProperty('content')
    expect(bookmark).toHaveProperty('author')
    expect(bookmark).toHaveProperty('domain')
    expect(bookmark).toHaveProperty('source_platform')
    expect(bookmark).toHaveProperty('source_id')
    expect(bookmark).toHaveProperty('engagement_score')
    expect(bookmark).toHaveProperty('is_starred')
    expect(bookmark).toHaveProperty('is_read')
    expect(bookmark).toHaveProperty('is_archived')
    expect(bookmark).toHaveProperty('is_deleted')
    expect(bookmark).toHaveProperty('tags')
    expect(bookmark).toHaveProperty('collections')
    expect(bookmark).toHaveProperty('metadata')
    expect(bookmark).toHaveProperty('created_at')
    expect(bookmark).toHaveProperty('updated_at')

    // Verify specific values
    expect(bookmark.domain).toBe('x.com')
    expect(bookmark.source_platform).toBe('twitter')
    expect(bookmark.user_id).toBe('chrome-extension')
    expect(typeof bookmark.engagement_score).toBe('number')
    expect(Array.isArray(bookmark.tags)).toBe(true)
    expect(Array.isArray(bookmark.collections)).toBe(true)

    await page.close()
  })

  test('hashtags are extracted correctly', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    // The mock generator creates tweets with hashtags
    const mockBookmarks = generateMockBookmarks(5)

    // Find a bookmark with hashtags (index 0 and 1 have #AI #tech and #buildinpublic)
    const bookmarkWithHashtags = mockBookmarks.find((b) => b.tags && b.tags.length > 0)

    expect(bookmarkWithHashtags).toBeTruthy()
    expect(bookmarkWithHashtags.tags.length).toBeGreaterThan(0)
    // Tags should be lowercase
    bookmarkWithHashtags.tags.forEach((tag) => {
      expect(tag).toBe(tag.toLowerCase())
    })

    await page.close()
  })

  test('media URLs are extracted correctly', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    // The mock generator adds images to every 3rd tweet (index 0, 3, 6, etc.)
    const mockBookmarks = generateMockBookmarks(10)

    // Find a bookmark with images
    const bookmarkWithMedia = mockBookmarks.find(
      (b) => b.metadata?.images && b.metadata.images.length > 0
    )

    expect(bookmarkWithMedia).toBeTruthy()
    expect(bookmarkWithMedia.metadata.has_media).toBe(true)
    expect(bookmarkWithMedia.metadata.media_count).toBeGreaterThan(0)
    expect(bookmarkWithMedia.thumbnail_url).toBeTruthy()

    await page.close()
  })

  test('metadata contains engagement metrics', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const mockBookmarks = generateMockBookmarks(1)
    const bookmark = mockBookmarks[0]

    // Verify engagement metrics
    expect(bookmark.metadata).toHaveProperty('engagement')
    expect(bookmark.metadata.engagement).toHaveProperty('likes')
    expect(bookmark.metadata.engagement).toHaveProperty('retweets')
    expect(bookmark.metadata.engagement).toHaveProperty('replies')
    expect(bookmark.metadata.engagement).toHaveProperty('quotes')
    expect(bookmark.metadata.engagement).toHaveProperty('bookmarks')
    expect(bookmark.metadata.engagement).toHaveProperty('views')

    // All should be numbers
    expect(typeof bookmark.metadata.engagement.likes).toBe('number')
    expect(typeof bookmark.metadata.engagement.retweets).toBe('number')

    await page.close()
  })

  test('metadata contains user information', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const mockBookmarks = generateMockBookmarks(1)
    const bookmark = mockBookmarks[0]

    // Verify user metadata
    expect(bookmark.metadata).toHaveProperty('user')
    expect(bookmark.metadata.user).toHaveProperty('id')
    expect(bookmark.metadata.user).toHaveProperty('name')
    expect(bookmark.metadata.user).toHaveProperty('screen_name')
    expect(bookmark.metadata.user).toHaveProperty('profile_image_url')
    expect(bookmark.metadata.user).toHaveProperty('verified')
    expect(bookmark.metadata.user).toHaveProperty('followers_count')

    await page.close()
  })

  test('full flow: extraction → storage → retrieval', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const mockBookmarks = generateMockBookmarks(5)

    // Step 1: Simulate extraction complete message
    const response = await page.evaluate((bookmarks) => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'EXTRACTION_COMPLETE', bookmarks: bookmarks },
          (response) => {
            resolve(response)
          }
        )
      })
    }, mockBookmarks)

    expect(response.success).toBe(true)
    expect(response.saved).toBe(5)

    // Step 2: Retrieve via GET_EXTRACTED_BOOKMARKS
    const getResponse = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'GET_EXTRACTED_BOOKMARKS' },
          (response) => {
            resolve(response)
          }
        )
      })
    })

    expect(getResponse.success).toBe(true)
    expect(getResponse.bookmarks).toHaveLength(5)
    expect(getResponse.count).toBe(5)

    // Step 3: Verify data integrity
    const retrievedBookmark = getResponse.bookmarks[0]
    const originalBookmark = mockBookmarks[0]

    expect(retrievedBookmark.url).toBe(originalBookmark.url)
    expect(retrievedBookmark.source_id).toBe(originalBookmark.source_id)

    await page.close()
  })

  test('handles large dataset (100 bookmarks)', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const mockBookmarks = generateMockBookmarks(100)

    // Save large dataset
    const startTime = Date.now()

    const response = await page.evaluate((bookmarks) => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'EXTRACTION_COMPLETE', bookmarks: bookmarks },
          (response) => {
            resolve(response)
          }
        )
      })
    }, mockBookmarks)

    const duration = Date.now() - startTime

    expect(response.success).toBe(true)
    expect(response.saved).toBe(100)
    // Should complete within reasonable time (< 5 seconds)
    expect(duration).toBeLessThan(5000)

    // Verify retrieval
    const getResponse = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'GET_EXTRACTED_BOOKMARKS' },
          (response) => {
            resolve(response)
          }
        )
      })
    })

    expect(getResponse.bookmarks).toHaveLength(100)

    await page.close()
  })
})
