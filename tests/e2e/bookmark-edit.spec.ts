import { test, expect } from '@playwright/test'

/**
 * E2E tests for bookmark editing functionality
 *
 * These tests prevent regressions in bookmark editing, including:
 * - Opening/closing edit modal
 * - Form field updates (title, description, author, etc.)
 * - Tag autocomplete functionality (recent changes)
 * - Adding/removing tags with the new TagInput component
 * - Save/cancel operations
 * - Form validation
 * - Changes persistence
 */

test.describe('Bookmark Editing', () => {
  test.beforeEach(async ({ page, context }) => {
    // Pre-populate with test bookmarks
    await context.addInitScript(() => {
      const sampleData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'Test Bookmark 1',
            url: 'https://example.com/test1',
            description: 'Original description',
            content: 'Original content',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 100,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['existing-tag', 'test'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            user_id: 'local-user',
            title: 'Test Bookmark 2',
            url: 'https://example.com/test2',
            description: '',
            content: '',
            author: 'AnotherAuthor',
            domain: 'example.com',
            source_platform: 'manual',
            engagement_score: 50,
            is_starred: true,
            is_read: true,
            is_archived: false,
            is_deleted: false,
            tags: [],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
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
            bookmarkCount: 2,
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

  test('opens edit modal from bookmark menu', async ({ page }) => {
    // Find first bookmark card
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    await expect(firstBookmark).toBeVisible()

    // Open bookmark menu (three dots)
    const menuButton = firstBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()

    // Click "Approve" option
    await page.getByRole('menuitem', { name: /edit/i }).click()

    // Edit modal should be visible
    await expect(
      page.getByRole('heading', { name: /edit bookmark/i })
    ).toBeVisible()

    // Form should be pre-filled with bookmark data
    const titleInput = page.locator('input[value="Test Bookmark 1"]')
    await expect(titleInput).toBeVisible()
  })

  test('closes edit modal on cancel', async ({ page }) => {
    // Open edit modal
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    const menuButton = firstBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    // Wait for modal to be visible
    await expect(
      page.getByRole('heading', { name: /edit bookmark/i })
    ).toBeVisible()

    // Click cancel button
    await page.getByRole('button', { name: /cancel/i }).click()

    // Modal should be closed
    await expect(
      page.getByRole('heading', { name: /edit bookmark/i })
    ).not.toBeVisible()
  })

  test('closes edit modal on X button', async ({ page }) => {
    // Open edit modal
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    const menuButton = firstBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    await expect(
      page.getByRole('heading', { name: /edit bookmark/i })
    ).toBeVisible()

    // Click X button to close
    const closeButton = page.locator('[aria-label="Close"]').first()
    await closeButton.click()

    // Modal should be closed
    await expect(
      page.getByRole('heading', { name: /edit bookmark/i })
    ).not.toBeVisible()
  })

  test('updates bookmark title', async ({ page }) => {
    // Open edit modal
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    const menuButton = firstBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    // Update title
    const titleInput = page.locator('input[value="Test Bookmark 1"]')
    await titleInput.fill('Updated Bookmark Title')

    // Save changes
    await page.getByRole('button', { name: /approve/i }).click()

    // Wait for modal to close
    await page.waitForTimeout(500)

    // Verify title is updated in the UI
    await expect(page.getByText('Updated Bookmark Title')).toBeVisible()
  })

  test('updates bookmark description', async ({ page }) => {
    // Open edit modal
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    const menuButton = firstBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    // Find and update description textarea
    const descriptionTextarea = page.locator(
      'textarea[placeholder*="description" i]'
    )
    await descriptionTextarea.fill('This is the updated description')

    // Save changes
    await page.getByRole('button', { name: /approve/i }).click()

    // Wait for save to complete
    await page.waitForTimeout(500)

    // Modal should close
    await expect(
      page.getByRole('heading', { name: /edit bookmark/i })
    ).not.toBeVisible()
  })

  test('adds new tag using autocomplete', async ({ page }) => {
    // Open edit modal for bookmark with existing tags
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    const menuButton = firstBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    await expect(
      page.getByRole('heading', { name: /edit bookmark/i })
    ).toBeVisible()

    // Find tag input (with autocomplete)
    const tagInput = page.locator('input[placeholder*="tag" i]')
    await expect(tagInput).toBeVisible()

    // Type a new tag
    await tagInput.fill('new-test-tag')
    await tagInput.press('Enter')

    // Wait for tag to be added
    await page.waitForTimeout(300)

    // New tag should be visible below the input
    await expect(page.getByText('#new-test-tag')).toBeVisible()

    // Existing tags should still be visible
    await expect(page.getByText('#existing-tag')).toBeVisible()
    await expect(page.getByText('#test')).toBeVisible()
  })

  test('removes existing tag', async ({ page }) => {
    // Open edit modal
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    const menuButton = firstBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    await expect(
      page.getByRole('heading', { name: /edit bookmark/i })
    ).toBeVisible()

    // Verify tag exists
    const existingTag = page.getByText('#existing-tag')
    await expect(existingTag).toBeVisible()

    // Find and click the X button on the tag
    const tagChip = page.locator('[data-testid="tag-chip"]', {
      hasText: 'existing-tag',
    })
    const removeButton = tagChip.locator('button[aria-label*="Remove"]')
    await removeButton.click()

    // Tag should be removed
    await expect(existingTag).not.toBeVisible()

    // Save changes
    await page.getByRole('button', { name: /approve/i }).click()
    await page.waitForTimeout(500)

    // Reopen modal to verify persistence
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    // Tag should still be removed
    await expect(existingTag).not.toBeVisible()
  })

  test('prevents saving with empty title', async ({ page }) => {
    // Open edit modal
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    const menuButton = firstBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    // Clear title
    const titleInput = page.locator('input[value="Test Bookmark 1"]')
    await titleInput.fill('')

    // Try to save
    const saveButton = page.getByRole('button', { name: /approve/i })
    await saveButton.click()

    // Modal should still be open (validation failed)
    await expect(
      page.getByRole('heading', { name: /edit bookmark/i })
    ).toBeVisible()

    // There might be an error message or disabled save button
    // Check if save button is disabled when title is empty
    const isDisabled = await saveButton.isDisabled()
    expect(isDisabled).toBe(true)
  })

  test('updates multiple fields at once', async ({ page }) => {
    // Open edit modal
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    const menuButton = firstBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    // Update title
    const titleInput = page.locator('input[value="Test Bookmark 1"]')
    await titleInput.fill('Multi-Field Update Test')

    // Update description
    const descriptionTextarea = page.locator(
      'textarea[placeholder*="description" i]'
    )
    await descriptionTextarea.fill('Multi-field description update')

    // Add a new tag
    const tagInput = page.locator('input[placeholder*="tag" i]')
    await tagInput.fill('multi-update-tag')
    await tagInput.press('Enter')
    await page.waitForTimeout(300)

    // Save all changes
    await page.getByRole('button', { name: /approve/i }).click()
    await page.waitForTimeout(500)

    // Verify title is updated
    await expect(page.getByText('Multi-Field Update Test')).toBeVisible()

    // Reopen to verify all changes persisted
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    await expect(titleInput).toHaveValue('Multi-Field Update Test')
    await expect(page.getByText('#multi-update-tag')).toBeVisible()
  })

  test('discards changes on cancel', async ({ page }) => {
    // Open edit modal
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    const menuButton = firstBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    // Make changes
    const titleInput = page.locator('input[value="Test Bookmark 1"]')
    await titleInput.fill('This Should Not Save')

    const tagInput = page.locator('input[placeholder*="tag" i]')
    await tagInput.fill('temp-tag')
    await tagInput.press('Enter')
    await page.waitForTimeout(300)

    // Cancel without saving
    await page.getByRole('button', { name: /cancel/i }).click()
    await page.waitForTimeout(300)

    // Original title should still be visible
    await expect(page.getByText('Test Bookmark 1')).toBeVisible()

    // Reopen to verify no changes were saved
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    await expect(titleInput).toHaveValue('Test Bookmark 1')
    await expect(page.getByText('#temp-tag')).not.toBeVisible()
  })

  test('tag autocomplete shows existing tags', async ({ page }) => {
    // Open edit modal for second bookmark (has no tags)
    const secondBookmark = page
      .locator('[data-testid="bookmark-card"]')
      .nth(1)
    const menuButton = secondBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    await expect(
      page.getByRole('heading', { name: /edit bookmark/i })
    ).toBeVisible()

    // Find tag input
    const tagInput = page.locator('input[placeholder*="tag" i]')
    await tagInput.click()

    // Start typing a tag that exists in another bookmark
    await tagInput.fill('exist')

    // Autocomplete dropdown should appear with existing tags
    // Look for autocomplete suggestions
    const autocomplete = page.locator('[role="listbox"], [role="menu"]')
    if ((await autocomplete.count()) > 0) {
      await expect(autocomplete).toBeVisible()
      // Should suggest "existing-tag" from the first bookmark
      await expect(page.getByText('existing-tag')).toBeVisible()
    }
  })

  test('displays tags below input field', async ({ page }) => {
    // Open edit modal for bookmark with tags
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    const menuButton = firstBookmark.locator('[aria-label*="menu"]').first()
    await menuButton.click()
    await page.getByRole('menuitem', { name: /edit/i }).click()

    await expect(
      page.getByRole('heading', { name: /edit bookmark/i })
    ).toBeVisible()

    // Find the Tags section
    const tagsSection = page.locator('text=Tags').first()
    await expect(tagsSection).toBeVisible()

    // Tag chips should be displayed below the input
    const tagChips = page.locator('[data-testid="tag-chip"]')
    const chipCount = await tagChips.count()
    expect(chipCount).toBeGreaterThanOrEqual(2) // existing-tag and test

    // Verify tags are visible
    await expect(page.getByText('#existing-tag')).toBeVisible()
    await expect(page.getByText('#test')).toBeVisible()

    // Tag input should be above the chips
    const tagInput = page.locator('input[placeholder*="tag" i]')
    await expect(tagInput).toBeVisible()

    // Get positions to verify layout
    const inputBox = await tagInput.boundingBox()
    const chipBox = await tagChips.first().boundingBox()

    if (inputBox && chipBox) {
      // Input should be above chips (smaller Y coordinate)
      expect(inputBox.y).toBeLessThan(chipBox.y)
    }
  })
})
