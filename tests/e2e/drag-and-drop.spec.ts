import { test, expect } from '@playwright/test'

// NOTE: Testing HTML5 drag-drop with react-dnd in Playwright is challenging.
// These tests verify UI elements, view modes, and multi-select functionality.
// Actual drag-drop behavior is better tested with unit tests using react-dnd test utilities.

const testData = {
  bookmarks: [
    {
      id: 1,
      user_id: 'local-user',
      title: 'Bookmark 1',
      url: 'https://example1.com',
      description: 'First bookmark',
      content: '',
      author: 'Author 1',
      domain: 'example1.com',
      source_platform: 'manual',
      engagement_score: 0,
      is_starred: false,
      is_read: false,
      is_archived: false,
      tags: [],
      collections: ['uncategorized'],
      primaryCollection: 'uncategorized',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      user_id: 'local-user',
      title: 'Bookmark 2',
      url: 'https://example2.com',
      description: 'Second bookmark',
      content: '',
      author: 'Author 2',
      domain: 'example2.com',
      source_platform: 'manual',
      engagement_score: 0,
      is_starred: false,
      is_read: false,
      is_archived: false,
      tags: [],
      collections: ['uncategorized'],
      primaryCollection: 'uncategorized',
      created_at: '2024-01-02T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z'
    },
    {
      id: 3,
      user_id: 'local-user',
      title: 'Bookmark 3',
      url: 'https://example3.com',
      description: 'Third bookmark',
      content: '',
      author: 'Author 3',
      domain: 'example3.com',
      source_platform: 'manual',
      engagement_score: 0,
      is_starred: false,
      is_read: false,
      is_archived: false,
      tags: [],
      collections: ['uncategorized'],
      primaryCollection: 'uncategorized',
      created_at: '2024-01-03T00:00:00.000Z',
      updated_at: '2024-01-03T00:00:00.000Z'
    }
  ],
  collections: [
    {
      id: 'uncategorized',
      name: 'Uncategorized',
      isPrivate: false,
      isDefault: true,
      isSmartCollection: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      bookmarkCount: 3,
      userId: 'local-user'
    },
    {
      id: 'work',
      name: 'Work',
      isPrivate: false,
      isDefault: false,
      isSmartCollection: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      bookmarkCount: 0,
      userId: 'local-user'
    }
  ],
  bookmarkCollections: [],
  settings: {},
  metadata: { version: '2.0.0' },
  version: '2.0.0'
}

test.describe('Drag and Drop UI - Grid and List Views', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript((data) => {
      localStorage.setItem('x-bookmark-manager-data', JSON.stringify(data))
    }, testData)
  })

  test('should display draggable bookmarks in grid view', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({ timeout: 10000 })

    // Verify bookmarks are displayed
    await expect(page.getByTestId('bookmark-card')).toHaveCount(3)
  })

  test('should display collection drop targets', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({ timeout: 10000 })

    // Verify collections are visible
    await expect(page.getByTestId('collection-uncategorized')).toBeVisible()
    await expect(page.getByTestId('collection-work')).toBeVisible()
  })

  test('should toggle between grid and list views', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({ timeout: 10000 })

    // Switch to list view
    await page.getByTestId('view-toggle-list').click()
    await page.waitForTimeout(500)

    // Bookmarks should still be visible
    await expect(page.getByTestId('bookmark-card')).toHaveCount(3)

    // Switch back to grid
    await page.getByTestId('view-toggle-grid').click()
    await page.waitForTimeout(500)

    // Bookmarks should still be visible
    await expect(page.getByTestId('bookmark-card')).toHaveCount(3)
  })

  test('should select multiple bookmarks', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({ timeout: 10000 })

    const cards = page.getByTestId('bookmark-card')

    // Hover and click first checkbox
    await cards.nth(0).hover()
    await page.waitForTimeout(200)
    await cards.nth(0).getByTestId('bookmark-checkbox').click()

    // Hover and click second checkbox
    await cards.nth(1).hover()
    await page.waitForTimeout(200)
    await cards.nth(1).getByTestId('bookmark-checkbox').click()

    // Both checkboxes should be visible (bulk mode active)
    await expect(cards.nth(0).getByTestId('bookmark-checkbox')).toBeVisible()
    await expect(cards.nth(1).getByTestId('bookmark-checkbox')).toBeVisible()
  })
})
