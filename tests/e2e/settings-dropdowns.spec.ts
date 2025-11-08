import { test, expect } from '@playwright/test'

test.describe('Settings Dropdowns', () => {
  test.beforeEach(async ({ page, context }) => {
    // Pre-populate with mock data so we're not on onboarding screen
    await context.addInitScript(() => {
      const mockData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'Sample Bookmark',
            url: 'https://example.com',
            description: 'Test bookmark',
            content: 'Test content',
            author: 'Test Author',
            domain: 'example.com',
            source_platform: 'manual',
            engagement_score: 0,
            is_starred: false,
            is_read: false,
            is_archived: false,
            tags: ['test'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        collections: [
          {
            id: 'uncategorized',
            name: 'Uncategorized',
            isPrivate: false,
            isDefault: true,
            isSmartCollection: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            bookmarkCount: 1,
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: { version: '2.0.0' },
        version: '2.0.0',
      }
      localStorage.setItem('x-bookmark-manager-data', JSON.stringify(mockData))
    })

    // Navigate directly to settings page
    await page.goto('http://localhost:5173/settings')
    await page.waitForLoadState('networkidle')
  })

  test('should open and select theme from dropdown', async ({ page }) => {
    // Find the theme combobox (it should show "Dark" by default)
    const themeCombobox = page.getByRole('combobox').filter({ hasText: 'Dark' })

    // Click to open dropdown
    await themeCombobox.click()

    // Wait for options to appear
    await page.waitForSelector('[role="option"]')

    // Select "Light" option
    const lightOption = page.getByRole('option', { name: 'Light' })
    await lightOption.click()

    // Verify the selection changed
    await expect(themeCombobox).toHaveText('Light')
  })

  test('should open and select auto-sync interval', async ({ page }) => {
    // Find the auto-sync combobox
    const syncCombobox = page
      .getByRole('combobox')
      .filter({ hasText: 'Manual only' })

    await syncCombobox.click()
    await page.waitForSelector('[role="option"]')

    // Select "Every 15 minutes"
    const fifteenMinOption = page.getByRole('option', {
      name: 'Every 15 minutes',
    })
    await fifteenMinOption.click()

    // Verify selection
    await expect(syncCombobox).toContainText('Every 15 minutes')
  })

  test('should open and select duplicate handling option', async ({ page }) => {
    // Find duplicate handling combobox
    const duplicateCombobox = page
      .getByRole('combobox')
      .filter({ hasText: 'Skip duplicate' })

    await duplicateCombobox.click()
    await page.waitForSelector('[role="option"]')

    // Select "Replace with new version"
    const replaceOption = page.getByRole('option', {
      name: 'Replace with new version',
    })
    await replaceOption.click()

    // Verify selection
    await expect(duplicateCombobox).toContainText('Replace')
  })

  test('should open and select default sorting', async ({ page }) => {
    // Find sorting combobox
    const sortCombobox = page
      .getByRole('combobox')
      .filter({ hasText: 'Date (Newest first)' })

    await sortCombobox.click()
    await page.waitForSelector('[role="option"]')

    // Select "Title (A-Z)"
    const titleOption = page.getByRole('option', { name: 'Title (A-Z)' })
    await titleOption.click()

    // Verify selection
    await expect(sortCombobox).toContainText('Title')
  })

  test('should open and select export format', async ({ page }) => {
    // Find export format combobox
    const exportCombobox = page
      .getByRole('combobox')
      .filter({ hasText: 'JSON (Full data' })

    await exportCombobox.click()
    await page.waitForSelector('[role="option"]')

    // Select "CSV"
    const csvOption = page.getByRole('option', { name: /CSV/ })
    await csvOption.click()

    // Verify selection
    await expect(exportCombobox).toContainText('CSV')
  })

  test('should persist theme selection after page reload', async ({ page }) => {
    // Select Light theme
    const themeCombobox = page.getByRole('combobox').filter({ hasText: 'Dark' })
    await themeCombobox.click()
    await page.waitForSelector('[role="option"]')

    const lightOption = page.getByRole('option', { name: 'Light' })
    await lightOption.click()

    // Verify selection
    await expect(themeCombobox).toHaveText('Light')

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check if Light is still selected after reload
    const themeComboboxAfterReload = page
      .getByRole('combobox')
      .filter({ hasText: 'Light' })
    await expect(themeComboboxAfterReload).toBeVisible()
  })

  test('all dropdowns should be interactive', async ({ page }) => {
    // Get all combobox elements (dropdowns)
    const allDropdowns = page.locator('[role="combobox"]')
    const count = await allDropdowns.count()

    // Verify each dropdown is clickable and enabled
    for (let i = 0; i < count; i++) {
      const dropdown = allDropdowns.nth(i)
      await expect(dropdown).toBeVisible()
      await expect(dropdown).toBeEnabled()
    }

    // Should have 6 dropdowns total (Auto-Sync, Duplicate Handling, Default Collection, Theme, Sort By, Export Format)
    expect(count).toBe(6)
  })
})
