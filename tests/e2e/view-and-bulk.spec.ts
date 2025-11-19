import { test, expect } from '@playwright/test'

/**
 * E2E tests for bulk actions functionality
 *
 * These tests verify:
 * - Multi-select checkbox functionality
 * - Bulk actions bar visibility
 * - Bulk archive operations
 * - Bulk delete operations
 * - Bulk tag management
 * - Selection clearing
 */

test.describe('Multi-select and bulk actions', () => {
  test.beforeEach(async ({ page, context }) => {
    // Pre-populate with test bookmarks
    await context.addInitScript(() => {
      const sampleData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'First Bookmark',
            url: 'https://example.com/first',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'manual',
            engagement_score: 100,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['test'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            user_id: 'local-user',
            title: 'Second Bookmark',
            url: 'https://example.com/second',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 50,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: [],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-02T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z',
          },
          {
            id: 3,
            user_id: 'local-user',
            title: 'Third Bookmark',
            url: 'https://example.com/third',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'manual',
            engagement_score: 75,
            is_starred: true,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['important'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-03T00:00:00.000Z',
            updated_at: '2024-01-03T00:00:00.000Z',
          },
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
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: { version: '2.0.0' },
        version: '2.0.0',
      }
      localStorage.setItem(
        'x-bookmark-manager-data',
        JSON.stringify(sampleData)
      )
    })

    await page.goto('http://localhost:5173')
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })
  })

  test('shows checkboxes on hover', async ({ page }) => {
    // Find first bookmark
    const firstCard = page.getByTestId('bookmark-card').first()
    await expect(firstCard).toBeVisible()

    // Hover over the card
    await firstCard.hover()

    // Wait a bit for checkbox to appear
    await page.waitForTimeout(300)

    // Checkbox should be visible on hover
    const checkbox = firstCard.getByTestId('bookmark-checkbox')
    await expect(checkbox).toBeVisible()
  })

  test('selects single bookmark', async ({ page }) => {
    const firstCard = page.getByTestId('bookmark-card').first()
    await firstCard.hover()
    await page.waitForTimeout(300)

    const checkbox = firstCard.getByTestId('bookmark-checkbox')
    await checkbox.click()

    // Wait for selection
    await page.waitForTimeout(300)

    // Bulk actions bar should appear
    await expect(page.getByTestId('bulk-actions-bar')).toBeVisible()

    // Should show "1 bookmark selected"
    await expect(page.getByText('1 bookmark selected')).toBeVisible()
  })

  test('selects multiple bookmarks', async ({ page }) => {
    // Select first bookmark
    const firstCard = page.getByTestId('bookmark-card').nth(0)
    await firstCard.hover()
    await page.waitForTimeout(200)
    await firstCard.getByTestId('bookmark-checkbox').click()

    await page.waitForTimeout(300)

    // Select second bookmark
    const secondCard = page.getByTestId('bookmark-card').nth(1)
    await secondCard.hover()
    await page.waitForTimeout(200)
    await secondCard.getByTestId('bookmark-checkbox').click()

    await page.waitForTimeout(300)

    // Bulk actions bar should be visible
    await expect(page.getByTestId('bulk-actions-bar')).toBeVisible()

    // Should show "2 bookmarks selected"
    await expect(page.getByText('2 bookmarks selected')).toBeVisible()
  })

  test('bulk archive operation', async ({ page }) => {
    // Select first two bookmarks
    const firstCard = page.getByTestId('bookmark-card').nth(0)
    await firstCard.hover()
    await page.waitForTimeout(200)
    await firstCard.getByTestId('bookmark-checkbox').click()
    await page.waitForTimeout(300)

    const secondCard = page.getByTestId('bookmark-card').nth(1)
    await secondCard.hover()
    await page.waitForTimeout(200)
    await secondCard.getByTestId('bookmark-checkbox').click()
    await page.waitForTimeout(300)

    // Click bulk archive button
    await page.getByTestId('bulk-archive').click()
    await page.waitForTimeout(500)

    // Selection should be cleared
    await expect(page.getByTestId('bulk-actions-bar')).not.toBeVisible()

    // Only 1 bookmark should remain visible (third one)
    const bookmarks = page.getByTestId('bookmark-card')
    await expect(bookmarks).toHaveCount(1, { timeout: 5000 })
  })

  test('bulk delete operation', async ({ page }) => {
    // Select first bookmark
    const firstCard = page.getByTestId('bookmark-card').nth(0)
    await firstCard.hover()
    await page.waitForTimeout(200)
    await firstCard.getByTestId('bookmark-checkbox').click()
    await page.waitForTimeout(300)

    // Click bulk delete button
    await page.getByTestId('bulk-delete').click()

    // Wait for confirmation dialog
    await page.waitForTimeout(300)

    // Look for confirmation button and click it
    const confirmButton = page.getByRole('button', { name: /delete|confirm/i })
    if ((await confirmButton.count()) > 0) {
      await confirmButton.click()
      await page.waitForTimeout(500)
    }

    // Selection should be cleared
    await expect(page.getByTestId('bulk-actions-bar')).not.toBeVisible()

    // Should have 2 bookmarks remaining
    const bookmarks = page.getByTestId('bookmark-card')
    await expect(bookmarks).toHaveCount(2, { timeout: 5000 })
  })

  test('clears selection', async ({ page }) => {
    // Select a bookmark
    const firstCard = page.getByTestId('bookmark-card').first()
    await firstCard.hover()
    await page.waitForTimeout(200)
    await firstCard.getByTestId('bookmark-checkbox').click()
    await page.waitForTimeout(300)

    // Bulk actions bar should be visible
    await expect(page.getByTestId('bulk-actions-bar')).toBeVisible()

    // Click clear button
    const clearButton = page.getByRole('button', { name: /clear/i })
    await clearButton.click()
    await page.waitForTimeout(300)

    // Bulk actions bar should be hidden
    await expect(page.getByTestId('bulk-actions-bar')).not.toBeVisible()
  })

  test('opens bulk tag input', async ({ page }) => {
    // Select a bookmark
    const firstCard = page.getByTestId('bookmark-card').first()
    await firstCard.hover()
    await page.waitForTimeout(200)
    await firstCard.getByTestId('bookmark-checkbox').click()
    await page.waitForTimeout(300)

    // Click Tags button
    await page.getByTestId('bulk-tag').click()
    await page.waitForTimeout(300)

    // Tag input should be visible
    const tagInput = page.locator('input[placeholder*="tag" i]')
    await expect(tagInput).toBeVisible()

    // Should show message about managing tags
    await expect(
      page.getByText(/manage tags for \d+ bookmark/i)
    ).toBeVisible()
  })

  test('selection persists when scrolling', async ({ page }) => {
    // Select first bookmark
    const firstCard = page.getByTestId('bookmark-card').first()
    await firstCard.hover()
    await page.waitForTimeout(200)
    await firstCard.getByTestId('bookmark-checkbox').click()
    await page.waitForTimeout(300)

    // Bulk actions bar should be visible
    await expect(page.getByTestId('bulk-actions-bar')).toBeVisible()

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(300)

    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)

    // Selection should still be active
    await expect(page.getByTestId('bulk-actions-bar')).toBeVisible()
    await expect(page.getByText('1 bookmark selected')).toBeVisible()
  })

  test('clicking bookmark card in bulk mode toggles selection', async ({
    page,
  }) => {
    // Select first bookmark to enter bulk mode
    const firstCard = page.getByTestId('bookmark-card').nth(0)
    await firstCard.hover()
    await page.waitForTimeout(200)
    await firstCard.getByTestId('bookmark-checkbox').click()
    await page.waitForTimeout(300)

    // Now we're in bulk mode
    await expect(page.getByTestId('bulk-actions-bar')).toBeVisible()

    // Click on another card (not the checkbox)
    const secondCard = page.getByTestId('bookmark-card').nth(1)
    await secondCard.click()
    await page.waitForTimeout(300)

    // Should now have 2 bookmarks selected
    await expect(page.getByText('2 bookmarks selected')).toBeVisible()

    // Click the second card again to deselect
    await secondCard.click()
    await page.waitForTimeout(300)

    // Should be back to 1 bookmark selected
    await expect(page.getByText('1 bookmark selected')).toBeVisible()
  })
})
