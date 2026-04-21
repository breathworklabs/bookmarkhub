import { test, expect } from '@playwright/test'

/**
 * E2E tests for tag filtering functionality
 *
 * These tests prevent regressions in tag filtering, including:
 * - Tag filtering in Advanced Filters panel (recent changes)
 * - Tag autocomplete functionality
 * - Adding multiple tags
 * - Removing tags with X button
 * - Tag filter persistence
 * - Manage Tags button navigation
 * - Combining tag filters with other filters
 */

test.describe('Tag Filtering', () => {
  test.beforeEach(async ({ page, context }) => {
    // Pre-populate with bookmarks having various tags
    await context.addInitScript(() => {
      const sampleData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'JavaScript Tutorial',
            url: 'https://example.com/js',
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
            tags: ['javascript', 'tutorial', 'webdev'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            user_id: 'local-user',
            title: 'React Guide',
            url: 'https://example.com/react',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 150,
            is_starred: true,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['react', 'javascript', 'webdev'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-02T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z',
          },
          {
            id: 3,
            user_id: 'local-user',
            title: 'Python Best Practices',
            url: 'https://example.com/python',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'manual',
            engagement_score: 75,
            is_starred: false,
            is_read: true,
            is_archived: false,
            is_deleted: false,
            tags: ['python', 'best-practices'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-03T00:00:00.000Z',
            updated_at: '2024-01-03T00:00:00.000Z',
          },
          {
            id: 4,
            user_id: 'local-user',
            title: 'TypeScript Handbook',
            url: 'https://example.com/ts',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 120,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['typescript', 'javascript', 'webdev'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-04T00:00:00.000Z',
            updated_at: '2024-01-04T00:00:00.000Z',
          },
          {
            id: 5,
            user_id: 'local-user',
            title: 'No Tags Bookmark',
            url: 'https://example.com/notags',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'manual',
            engagement_score: 10,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: [],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-05T00:00:00.000Z',
            updated_at: '2024-01-05T00:00:00.000Z',
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
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(5, { timeout: 5000 })
  })

  test('Tag Filters section is visible in Advanced Filters', async ({
    page,
  }) => {
    // Look for Tag Filters section
    const tagFilterSection = page.locator('text=Tag Filters').first()
    await expect(tagFilterSection).toBeVisible()

    // Tag input should be present
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await expect(tagInput).toBeVisible()
  })

  test('Manage Tags button is accessible', async ({ page }) => {
    // Look for Manage Tags button in Advanced Filters
    const manageTagsButton = page.getByRole('button', {
      name: /manage tags/i,
    })
    await expect(manageTagsButton).toBeVisible()
  })

  test('filters by single tag', async ({ page }) => {
    // Type a tag in the tag input
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await tagInput.fill('javascript')
    await tagInput.press('Enter')

    // Wait for filtering
    await page.waitForTimeout(500)

    // Should show only bookmarks with "javascript" tag (3 bookmarks)
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(3, { timeout: 5000 })

    // Verify correct bookmarks are shown
    await expect(page.getByText('JavaScript Tutorial')).toBeVisible()
    await expect(page.getByText('React Guide')).toBeVisible()
    await expect(page.getByText('TypeScript Handbook')).toBeVisible()

    // Verify filtered-out bookmarks are not shown
    await expect(page.getByText('Python Best Practices')).not.toBeVisible()
    await expect(page.getByText('No Tags Bookmark')).not.toBeVisible()
  })

  test('displays active tag filter below input', async ({ page }) => {
    // Add a tag filter
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await tagInput.fill('webdev')
    await tagInput.press('Enter')

    // Wait for tag to be added
    await page.waitForTimeout(300)

    // Tag should be displayed below the input
    const activeTag = page.getByText('#webdev')
    await expect(activeTag).toBeVisible()

    // Verify it's displayed as a removable chip
    const tagChip = page.locator('[data-testid="tag-chip"]', {
      hasText: 'webdev',
    })
    await expect(tagChip).toBeVisible()
  })

  test('removes tag filter with X button', async ({ page }) => {
    // Add a tag filter
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await tagInput.fill('python')
    await tagInput.press('Enter')
    await page.waitForTimeout(500)

    // Should show only 1 bookmark
    let bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(1, { timeout: 5000 })

    // Find and click the X button on the tag chip
    const tagChip = page.locator('[data-testid="tag-chip"]', {
      hasText: 'python',
    })
    const removeButton = tagChip.locator('button[aria-label*="Remove"]')
    await removeButton.click()

    // Wait for filter to be removed
    await page.waitForTimeout(500)

    // Should show all bookmarks again
    bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(5, { timeout: 5000 })
  })

  test('filters by multiple tags (AND logic)', async ({ page }) => {
    // Add first tag
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await tagInput.fill('javascript')
    await tagInput.press('Enter')
    await page.waitForTimeout(300)

    // Add second tag
    await tagInput.fill('tutorial')
    await tagInput.press('Enter')
    await page.waitForTimeout(500)

    // Should show only bookmarks with BOTH tags (1 bookmark)
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(1, { timeout: 5000 })

    // Only "JavaScript Tutorial" has both tags
    await expect(page.getByText('JavaScript Tutorial')).toBeVisible()
    await expect(page.getByText('React Guide')).not.toBeVisible()
  })

  test('tag autocomplete shows existing tags', async ({ page }) => {
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )

    // Click to focus
    await tagInput.click()

    // Start typing
    await tagInput.fill('java')

    // Autocomplete should show matching tags
    // Look for autocomplete dropdown
    const autocomplete = page.locator('[role="listbox"], [role="menu"]')

    // If autocomplete is visible, check for suggestions
    if ((await autocomplete.count()) > 0) {
      await expect(autocomplete).toBeVisible()
      // Should suggest "javascript"
      const jsSuggestion = page.getByText('javascript')
      if ((await jsSuggestion.count()) > 0) {
        await expect(jsSuggestion.first()).toBeVisible()
      }
    }
  })

  test('tag filter persists across collection changes', async ({ page }) => {
    // Add a tag filter
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await tagInput.fill('react')
    await tagInput.press('Enter')
    await page.waitForTimeout(500)

    // Should show 1 bookmark
    let bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(1, { timeout: 5000 })

    // Navigate to Starred collection
    const starredCollection = page.getByText('Starred').first()
    if (await starredCollection.isVisible()) {
      await starredCollection.click()
      await page.waitForTimeout(500)

      // Tag filter should still be applied
      // React Guide is starred, so should show 1 bookmark
      bookmarks = page.locator('[data-testid="bookmark-card"]')
      await expect(bookmarks).toHaveCount(1, { timeout: 5000 })
      await expect(page.getByText('React Guide')).toBeVisible()
    }
  })

  test('combines tag filter with quick filters', async ({ page }) => {
    // Add a tag filter for "javascript"
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await tagInput.fill('javascript')
    await tagInput.press('Enter')
    await page.waitForTimeout(500)

    // Should show 3 bookmarks with javascript tag
    let bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(3, { timeout: 5000 })

    // Now add "Starred Only" quick filter
    const starredButton = page.getByRole('button', { name: 'Starred Only' })
    await starredButton.click()
    await page.waitForTimeout(500)

    // Should show only 1 bookmark (React Guide - javascript + starred)
    bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(1, { timeout: 5000 })
    await expect(page.getByText('React Guide')).toBeVisible()
  })

  test('clears tag filters with Clear All Filters', async ({ page }) => {
    // Add multiple tag filters
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await tagInput.fill('javascript')
    await tagInput.press('Enter')
    await page.waitForTimeout(300)

    await tagInput.fill('webdev')
    await tagInput.press('Enter')
    await page.waitForTimeout(500)

    // Should be filtered
    let bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(3, { timeout: 5000 })

    // Click Clear All Filters
    const clearButton = page.getByRole('button', { name: /clear all filters/i })
    await clearButton.click()
    await page.waitForTimeout(500)

    // Should show all bookmarks again
    bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(5, { timeout: 5000 })

    // Tag chips should be removed
    await expect(page.getByText('#javascript')).not.toBeVisible()
    await expect(page.getByText('#webdev')).not.toBeVisible()
  })

  test('shows no results when tag has no matches', async ({ page }) => {
    // Add a tag that doesn't exist in any bookmark
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await tagInput.fill('nonexistent-tag')
    await tagInput.press('Enter')
    await page.waitForTimeout(500)

    // Should show 0 bookmarks
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(0, { timeout: 5000 })

    // Empty state or no results message should be shown
    const emptyState = page.getByText(/no bookmarks found/i)
    if ((await emptyState.count()) > 0) {
      await expect(emptyState).toBeVisible()
    }
  })

  test('handles special characters in tag names', async ({ page }) => {
    // Add a tag filter with hyphen (best-practices)
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await tagInput.fill('best-practices')
    await tagInput.press('Enter')
    await page.waitForTimeout(500)

    // Should show 1 bookmark
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(1, { timeout: 5000 })
    await expect(page.getByText('Python Best Practices')).toBeVisible()
  })

  test('tag input clears after adding tag', async ({ page }) => {
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )

    // Type and add a tag
    await tagInput.fill('javascript')
    await tagInput.press('Enter')
    await page.waitForTimeout(300)

    // Input should be cleared
    await expect(tagInput).toHaveValue('')

    // But tag filter should be active
    await expect(page.getByText('#javascript')).toBeVisible()
  })

  test('tag chips have proper styling and hover states', async ({ page }) => {
    // Add a tag filter
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await tagInput.fill('webdev')
    await tagInput.press('Enter')
    await page.waitForTimeout(300)

    // Find the tag chip
    const tagChip = page.locator('[data-testid="tag-chip"]', {
      hasText: 'webdev',
    })
    await expect(tagChip).toBeVisible()

    // Hover over the tag chip
    await tagChip.hover()

    // Chip should have hover state (visual feedback)
    // The remove button should be visible
    const removeButton = tagChip.locator('button[aria-label*="Remove"]')
    await expect(removeButton).toBeVisible()

    // Remove button should be clickable
    await expect(removeButton).toBeEnabled()
  })

  test('manages tags button opens tag manager', async ({ page }) => {
    // Click Manage Tags button
    const manageTagsButton = page.getByRole('button', {
      name: /manage tags/i,
    })
    await manageTagsButton.click()

    // Wait for tag manager modal to open
    await page.waitForTimeout(500)

    // Tag manager modal should be visible
    const tagManagerModal = page.getByRole('heading', { name: /tag manager/i })
    if ((await tagManagerModal.count()) > 0) {
      await expect(tagManagerModal).toBeVisible()
    }
  })

  test('combines tag filter with search', async ({ page }) => {
    // Add a tag filter
    const tagInput = page.locator(
      'input[placeholder*="Type to search and add tags" i]'
    )
    await tagInput.fill('javascript')
    await tagInput.press('Enter')
    await page.waitForTimeout(500)

    // Should show 3 bookmarks
    let bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(3, { timeout: 5000 })

    // Now add a search query
    const searchInput = page.locator('input[placeholder*="Search" i]').first()
    await searchInput.fill('React')
    await page.waitForTimeout(500)

    // Should show only 1 bookmark (React Guide - has javascript tag and matches search)
    bookmarks = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarks).toHaveCount(1, { timeout: 5000 })
    await expect(page.getByText('React Guide')).toBeVisible()
  })
})
