/**
 * E2E tests for Chrome Storage operations
 *
 * Tests the extension's use of chrome.storage.local including:
 * - Saving bookmarks
 * - Retrieving bookmarks
 * - Handling empty storage
 * - Message handling for storage operations
 */

const { test, expect, chromium } = require('@playwright/test')
const path = require('path')
const { generateMockBookmarks } = require('../fixtures/mock-bookmarks')

const EXTENSION_PATH = path.join(__dirname, '../..')

test.describe('Chrome Storage Operations', () => {
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
    // Clear storage before each test
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)
    await page.evaluate(() => chrome.storage.local.clear())
    await page.close()
  })

  test('saves bookmarks to chrome.storage.local', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const mockBookmarks = generateMockBookmarks(10)

    // Save bookmarks
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

    // Verify saved
    const stored = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['extractedBookmarks', 'extractedAt'], resolve)
      })
    })

    expect(stored.extractedBookmarks).toHaveLength(10)
    expect(stored.extractedAt).toBeTruthy()

    await page.close()
  })

  test('retrieves bookmarks from chrome.storage.local', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const mockBookmarks = generateMockBookmarks(5)

    // Save first
    await page.evaluate((bookmarks) => {
      return new Promise((resolve) => {
        chrome.storage.local.set({ extractedBookmarks: bookmarks }, resolve)
      })
    }, mockBookmarks)

    // Retrieve
    const retrieved = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['extractedBookmarks'], (result) => {
          resolve(result.extractedBookmarks)
        })
      })
    })

    expect(retrieved).toHaveLength(5)
    expect(retrieved[0]).toHaveProperty('id')
    expect(retrieved[0]).toHaveProperty('url')
    expect(retrieved[0]).toHaveProperty('title')

    await page.close()
  })

  test('handles empty storage gracefully', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const result = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['extractedBookmarks'], (result) => {
          resolve(result.extractedBookmarks)
        })
      })
    })

    expect(result).toBeUndefined()

    await page.close()
  })

  test('clears storage correctly', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const mockBookmarks = generateMockBookmarks(3)

    // Save bookmarks
    await page.evaluate((bookmarks) => {
      return new Promise((resolve) => {
        chrome.storage.local.set({ extractedBookmarks: bookmarks }, resolve)
      })
    }, mockBookmarks)

    // Verify saved
    let stored = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['extractedBookmarks'], (result) => {
          resolve(result.extractedBookmarks)
        })
      })
    })
    expect(stored).toHaveLength(3)

    // Clear storage
    await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.clear(resolve)
      })
    })

    // Verify cleared
    stored = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['extractedBookmarks'], (result) => {
          resolve(result.extractedBookmarks)
        })
      })
    })
    expect(stored).toBeUndefined()

    await page.close()
  })

  test('service worker handles GET_EXTRACTED_BOOKMARKS message', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const mockBookmarks = generateMockBookmarks(7)

    // Save bookmarks first
    await page.evaluate((bookmarks) => {
      return new Promise((resolve) => {
        chrome.storage.local.set(
          {
            extractedBookmarks: bookmarks,
            extractedAt: '2024-01-01T00:00:00.000Z',
          },
          resolve
        )
      })
    }, mockBookmarks)

    // Send message to get bookmarks
    const response = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'GET_EXTRACTED_BOOKMARKS' },
          (response) => {
            resolve(response)
          }
        )
      })
    })

    expect(response.success).toBe(true)
    expect(response.bookmarks).toHaveLength(7)
    expect(response.count).toBe(7)
    expect(response.extractedAt).toBe('2024-01-01T00:00:00.000Z')

    await page.close()
  })

  test('service worker handles GET_EXTRACTED_BOOKMARKS with empty storage', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const response = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'GET_EXTRACTED_BOOKMARKS' },
          (response) => {
            resolve(response)
          }
        )
      })
    })

    expect(response.success).toBe(true)
    expect(response.bookmarks).toHaveLength(0)
    expect(response.count).toBe(0)

    await page.close()
  })

  test('service worker handles EXTRACTION_COMPLETE message', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const mockBookmarks = generateMockBookmarks(15)

    // Send extraction complete message
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
    expect(response.saved).toBe(15)

    // Verify bookmarks were saved
    const stored = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['extractedBookmarks'], (result) => {
          resolve(result.extractedBookmarks)
        })
      })
    })

    expect(stored).toHaveLength(15)

    await page.close()
  })

  test('preserves bookmark data integrity through storage cycle', async () => {
    const page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`)

    const mockBookmarks = generateMockBookmarks(1)
    const original = mockBookmarks[0]

    // Save
    await page.evaluate((bookmarks) => {
      return new Promise((resolve) => {
        chrome.storage.local.set({ extractedBookmarks: bookmarks }, resolve)
      })
    }, mockBookmarks)

    // Retrieve
    const retrieved = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.local.get(['extractedBookmarks'], (result) => {
          resolve(result.extractedBookmarks[0])
        })
      })
    })

    // Verify all critical fields
    expect(retrieved.url).toBe(original.url)
    expect(retrieved.title).toBe(original.title)
    expect(retrieved.source_platform).toBe(original.source_platform)
    expect(retrieved.source_id).toBe(original.source_id)
    expect(retrieved.author).toBe(original.author)
    expect(retrieved.domain).toBe(original.domain)
    expect(retrieved.tags).toEqual(original.tags)
    expect(retrieved.metadata).toEqual(original.metadata)

    await page.close()
  })
})
