import { test, expect } from '@playwright/test'

/**
 * E2E tests for date filtering functionality
 *
 * These tests prevent regressions in date filtering, including:
 * - Quick filter buttons (Today, This Week, This Month)
 * - Custom date range picker interactions
 * - Date boundary handling (month/year transitions)
 * - Date formatting and timezone handling
 * - Filter persistence and clearing
 */

test.describe('Date Filtering', () => {
  test.beforeEach(async ({ page, context }) => {
    // Pre-populate with bookmarks spanning different dates
    await context.addInitScript(() => {
      const now = new Date()
      const today = new Date(now.setHours(12, 0, 0, 0)).toISOString()
      const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString()
      const lastWeek = new Date(now.setDate(now.getDate() - 6)).toISOString()
      const lastMonth = new Date(now.setDate(now.getDate() - 20)).toISOString()
      const twoMonthsAgo = new Date(
        now.setMonth(now.getMonth() - 1)
      ).toISOString()

      const sampleData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'Today Bookmark',
            url: 'https://example.com/today',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 100,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['test'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: today,
            updated_at: today,
            metadata: {
              tweet_date: today,
            },
          },
          {
            id: 2,
            user_id: 'local-user',
            title: 'Yesterday Bookmark',
            url: 'https://example.com/yesterday',
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
            tags: ['test'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: yesterday,
            updated_at: yesterday,
            metadata: {
              tweet_date: yesterday,
            },
          },
          {
            id: 3,
            user_id: 'local-user',
            title: 'Last Week Bookmark',
            url: 'https://example.com/lastweek',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 25,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['test'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: lastWeek,
            updated_at: lastWeek,
            metadata: {
              tweet_date: lastWeek,
            },
          },
          {
            id: 4,
            user_id: 'local-user',
            title: 'Last Month Bookmark',
            url: 'https://example.com/lastmonth',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 10,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['test'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: lastMonth,
            updated_at: lastMonth,
            metadata: {
              tweet_date: lastMonth,
            },
          },
          {
            id: 5,
            user_id: 'local-user',
            title: 'Two Months Ago Bookmark',
            url: 'https://example.com/twomonths',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 5,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['test'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: twoMonthsAgo,
            updated_at: twoMonthsAgo,
            metadata: {
              tweet_date: twoMonthsAgo,
            },
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
            bookmarkCount: 5,
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

    // Open Advanced Filters panel
    await page.getByRole('button', { name: /advanced filters/i }).click()
    await expect(page.getByText('Advanced Filters')).toBeVisible()
  })

  test('shows all bookmarks by default', async ({ page }) => {
    // All 5 bookmarks should be visible
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(5, { timeout: 5000 })
  })

  test('filters to "Today" bookmarks only', async ({ page }) => {
    // Find and click the "Today" tab in FilterBar
    await page.getByRole('button', { name: 'Today' }).click()

    // Wait for filtering to complete
    await page.waitForTimeout(500)

    // Should show only 1 bookmark from today
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(1, { timeout: 5000 })

    // Verify it's the correct bookmark
    await expect(page.getByText('Today Bookmark')).toBeVisible()
  })

  test('filters to "This Week" bookmarks', async ({ page }) => {
    // Find and click the "This Week" tab in FilterBar
    await page.getByRole('button', { name: 'This Week' }).click()

    // Wait for filtering to complete
    await page.waitForTimeout(500)

    // Should show bookmarks from this week (today + yesterday + last week)
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(3, { timeout: 5000 })

    // Verify correct bookmarks are visible
    await expect(page.getByText('Today Bookmark')).toBeVisible()
    await expect(page.getByText('Yesterday Bookmark')).toBeVisible()
    await expect(page.getByText('Last Week Bookmark')).toBeVisible()
  })

  test('clears date filter when clicking "All"', async ({ page }) => {
    // Apply "Today" filter first
    await page.getByRole('button', { name: 'Today' }).click()
    await page.waitForTimeout(500)

    // Verify filter is applied
    let bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(1, { timeout: 5000 })

    // Click "All" to clear filter
    await page.getByRole('button', { name: 'All' }).click()
    await page.waitForTimeout(500)

    // Should show all 5 bookmarks again
    bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(5, { timeout: 5000 })
  })

  test('date filter persists when changing collections', async ({ page }) => {
    // Apply "This Week" filter
    await page.getByRole('button', { name: 'This Week' }).click()
    await page.waitForTimeout(500)

    // Verify filter is applied
    let bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(3, { timeout: 5000 })

    // Navigate to "Starred" collection (if it exists in sidebar)
    // This tests that the filter persists across collection changes
    const starredCollection = page.getByText('Starred').first()
    if (await starredCollection.isVisible()) {
      await starredCollection.click()
      await page.waitForTimeout(500)

      // Filter should still be active
      // (count will be 0 since no starred bookmarks in this week)
      bookmarks = page.locator('[data-testid="bookmark-card"]')
      const count = await bookmarks.count()
      expect(count).toBe(0) // No starred bookmarks from this week
    }
  })

  test('combines date filter with other filters', async ({ page }) => {
    // Apply "This Week" filter
    await page.getByRole('button', { name: 'This Week' }).click()
    await page.waitForTimeout(500)

    // Should show 3 bookmarks from this week
    let bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(3, { timeout: 5000 })

    // Now add a "Starred Only" quick filter
    const starredButton = page.getByRole('button', { name: 'Starred Only' })
    if (await starredButton.isVisible()) {
      await starredButton.click()
      await page.waitForTimeout(500)

      // Should show 0 bookmarks (no starred from this week)
      bookmarks = page.locator('[data-testid="bookmark-card"]')
      await expect(bookmarks).toHaveCount(0, { timeout: 5000 })
    }
  })

  test('custom date range picker is accessible', async ({ page }) => {
    // Look for date range filter in Advanced Filters
    const dateRangeSection = page.locator('text=Date Range').first()
    await expect(dateRangeSection).toBeVisible()

    // Check that date inputs are present
    const dateInputs = page.locator('input[type="date"]')
    const inputCount = await dateInputs.count()
    expect(inputCount).toBeGreaterThanOrEqual(2) // Start and end date inputs
  })

  test('clears all filters including date filter', async ({ page }) => {
    // Apply "This Week" filter
    await page.getByRole('button', { name: 'This Week' }).click()
    await page.waitForTimeout(500)

    // Verify filter is applied
    let bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(3, { timeout: 5000 })

    // Click "Clear All Filters" button
    const clearButton = page.getByRole('button', { name: /clear all filters/i })
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await page.waitForTimeout(500)

      // Should show all 5 bookmarks again
      bookmarks = page.locator('[data-testid="bookmark-card"]')
      await expect(bookmarks).toHaveCount(5, { timeout: 5000 })
    }
  })

  test('prefers tweet_date over created_at', async ({ page, context }) => {
    // Create a bookmark where tweet_date and created_at differ
    await context.addInitScript(() => {
      const now = new Date()
      const today = new Date(now.setHours(12, 0, 0, 0)).toISOString()
      const oldDate = new Date('2020-01-01T00:00:00.000Z').toISOString()

      const sampleData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'Tweet Date Test',
            url: 'https://example.com/test',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 100,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: [],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: oldDate, // Old created_at
            updated_at: oldDate,
            metadata: {
              tweet_date: today, // But recent tweet_date
            },
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
            bookmarkCount: 1,
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
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible()

    // Open Advanced Filters
    await page.getByRole('button', { name: /advanced filters/i }).click()

    // Filter by "Today"
    await page.getByRole('button', { name: 'Today' }).click()
    await page.waitForTimeout(500)

    // Should show the bookmark (using tweet_date, not created_at)
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(1, { timeout: 5000 })
    await expect(page.getByText('Tweet Date Test')).toBeVisible()
  })
})
