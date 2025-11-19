import { test, expect } from '@playwright/test'

/**
 * Helper function to manually start the tour
 * This is more reliable than relying on auto-start in test environment
 */
async function startTour(page: any) {
  // Set tour state in localStorage to trigger it
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('x-bookmark-manager-data') || '{}')
    data.settings = data.settings || {}
    data.settings.hasSeenSplash = true // Ensure this is set
    data.settings.tour = {
      hasCompletedTour: false,
      currentStep: 0,
      tourDismissed: false,
      tourVersion: '1.0.0',
    }
    localStorage.setItem('x-bookmark-manager-data', JSON.stringify(data))
  })

  // Reload page to apply changes
  await page.reload()

  // Wait for app to fully load
  await page.waitForLoadState('networkidle')

  // Wait for tour to appear (give it extra time)
  await page.waitForTimeout(3000)
}

test.describe('Interactive Tour', () => {
  test.beforeEach(async ({ page, context }) => {
    // Pre-populate with sample bookmark data
    await context.addInitScript(() => {
      const sampleData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'Sample Bookmark 1',
            url: 'https://example.com/1',
            description: 'Test description',
            content: 'Test content',
            author: 'Test Author',
            domain: 'example.com',
            source_platform: 'manual',
            engagement_score: 50,
            is_starred: false,
            is_read: false,
            is_archived: false,
            tags: ['test'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            user_id: 'local-user',
            title: 'Sample Bookmark 2',
            url: 'https://example.com/2',
            description: 'Another test',
            content: 'More content',
            author: 'Test Author',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 100,
            is_starred: true,
            is_read: true,
            is_archived: false,
            tags: ['test', 'demo'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-02T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z',
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
        settings: {
          // Set tour as not completed and not dismissed
          tour: {
            hasCompletedTour: false,
            currentStep: null,
            tourDismissed: false,
            tourVersion: '1.0.0',
          },
          hasSeenSplash: true, // User has seen splash, so tour can auto-start
        },
        metadata: { version: '2.0.0' },
        version: '2.0.0',
      }
      localStorage.setItem(
        'x-bookmark-manager-data',
        JSON.stringify(sampleData)
      )
    })

    await page.goto('http://localhost:5173')

    // Wait for app to load
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })
  })

  test('should start tour and show welcome step', async ({ page }) => {
    // Manually start the tour
    await startTour(page)

    // Should show welcome step
    await expect(page.locator('text=Welcome to BookmarksX!')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('text=Step 1 of')).toBeVisible()
  })

  test('should display tour steps in correct order', async ({ page }) => {
    // Start tour
    await startTour(page)

    // Welcome step
    await expect(page.locator('text=Welcome to BookmarksX!')).toBeVisible({
      timeout: 10000,
    })

    // Click Next
    await page.locator('button:has-text("Next")').click()

    // Search step
    await expect(page.locator('text=Search Your Bookmarks')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('[data-tour="search-bar"]')).toBeVisible()

    // Click Next
    await page.locator('button:has-text("Next")').click()

    // Filters step - should highlight filters button
    await expect(page.locator('text=Advanced Filters')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('[data-tour="filters-button"]')).toBeVisible()

    // Click Next
    await page.locator('button:has-text("Next")').click()

    // Collections step
    await expect(page.locator('text=Organize with Collections')).toBeVisible({
      timeout: 10000,
    })
    await expect(
      page.locator('[data-tour="collections-sidebar"]')
    ).toBeVisible()
  })

  test('should allow user to go back to previous steps', async ({ page }) => {
    // Start tour
    await startTour(page)

    // Welcome step
    await expect(page.locator('text=Welcome to BookmarksX!')).toBeVisible({
      timeout: 10000,
    })

    // Click Next
    await page.locator('button:has-text("Next")').click()

    // Search step
    await expect(page.locator('text=Search Your Bookmarks')).toBeVisible({
      timeout: 10000,
    })

    // Click Back
    await page.locator('button:has-text("Back")').click()

    // Should be back at welcome step
    await expect(page.locator('text=Welcome to BookmarksX!')).toBeVisible({
      timeout: 10000,
    })
  })

  test('should not show back button on first step', async ({ page }) => {
    // Start tour
    await startTour(page)

    // Welcome step
    await expect(page.locator('text=Welcome to BookmarksX!')).toBeVisible({
      timeout: 10000,
    })

    // Back button should not be visible
    await expect(page.locator('button:has-text("Back")')).not.toBeVisible()
  })

  test('should show Complete button on last step', async ({ page }) => {
    // Start tour
    await startTour(page)

    // Navigate to last step by clicking Next multiple times
    const steps = [
      'Welcome to BookmarksX!',
      'Search Your Bookmarks',
      'Advanced Filters',
      'Organize with Collections',
      'Bookmark Cards',
      'Bulk Actions',
      'Customize Your View',
      'Settings & Preferences',
    ]

    for (let i = 0; i < steps.length; i++) {
      await expect(page.locator(`text=${steps[i]}`)).toBeVisible({
        timeout: 10000,
      })
      await page.locator('button:has-text("Next")').click()
      await page.waitForTimeout(500)
    }

    // Last step - should show Complete button
    await expect(page.locator('text=You\'re All Set!')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('button:has-text("Complete")')).toBeVisible()
  })

  test('should skip tour when skip button is clicked', async ({ page }) => {
    // Start tour
    await startTour(page)

    // Welcome step
    await expect(page.locator('text=Welcome to BookmarksX!')).toBeVisible({
      timeout: 10000,
    })

    // Click Skip Tour
    await page.locator('button:has-text("Skip Tour")').first().click()

    // Tour should disappear
    await expect(
      page.locator('text=Welcome to BookmarksX!')
    ).not.toBeVisible({ timeout: 10000 })
  })

  test('should close tour when X button is clicked', async ({ page }) => {
    // Start tour
    await startTour(page)

    // Welcome step
    await expect(page.locator('text=Welcome to BookmarksX!')).toBeVisible({
      timeout: 10000,
    })

    // Click close button (X icon)
    await page.locator('button[aria-label="Skip tour"]').click()

    // Tour should disappear
    await expect(
      page.locator('text=Welcome to BookmarksX!')
    ).not.toBeVisible({ timeout: 10000 })
  })

  test('should show progress indicator', async ({ page }) => {
    // Start tour
    await startTour(page)

    // Welcome step
    await expect(page.locator('text=Welcome to BookmarksX!')).toBeVisible({
      timeout: 10000,
    })

    // Check step counter
    await expect(page.locator('text=Step 1 of')).toBeVisible()

    // Click Next
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(500)

    // Step counter should update
    await expect(page.locator('text=Step 2 of')).toBeVisible()
  })

  test('should complete tour when Complete button is clicked', async ({
    page,
  }) => {
    // Start tour
    await startTour(page)

    // Navigate to last step
    const steps = [
      'Welcome to BookmarksX!',
      'Search Your Bookmarks',
      'Advanced Filters',
      'Organize with Collections',
      'Bookmark Cards',
      'Bulk Actions',
      'Customize Your View',
      'Settings & Preferences',
    ]

    for (let i = 0; i < steps.length; i++) {
      await expect(page.locator(`text=${steps[i]}`)).toBeVisible({
        timeout: 10000,
      })
      await page.locator('button:has-text("Next")').click()
      await page.waitForTimeout(500)
    }

    // Last step
    await expect(page.locator('text=You\'re All Set!')).toBeVisible({
      timeout: 10000,
    })

    // Click Complete
    await page.locator('button:has-text("Complete")').click()

    // Tour should disappear
    await expect(page.locator('text=You\'re All Set!')).not.toBeVisible({
      timeout: 10000,
    })
  })

  test('should highlight correct UI elements for each step', async ({
    page,
  }) => {
    // Start tour
    await startTour(page)

    // Welcome step - skip it
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(500)

    // Search step - check search bar is highlighted
    await expect(page.locator('text=Search Your Bookmarks')).toBeVisible()
    await expect(page.locator('[data-tour="search-bar"]')).toBeVisible()

    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(500)

    // Filters step - check filters button is highlighted
    await expect(page.locator('text=Advanced Filters')).toBeVisible()
    await expect(page.locator('[data-tour="filters-button"]')).toBeVisible()

    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(500)

    // Collections step - check sidebar is highlighted
    await expect(page.locator('text=Organize with Collections')).toBeVisible()
    await expect(
      page.locator('[data-tour="collections-sidebar"]')
    ).toBeVisible()
  })

  test('should not auto-start tour if already completed', async ({
    page,
    context,
  }) => {
    // Set tour as completed
    await context.addInitScript(() => {
      const data = JSON.parse(
        localStorage.getItem('x-bookmark-manager-data') || '{}'
      )
      data.settings = {
        ...data.settings,
        tour: {
          hasCompletedTour: true,
          currentStep: null,
          tourDismissed: false,
          tourVersion: '1.0.0',
        },
        hasSeenSplash: true,
      }
      localStorage.setItem('x-bookmark-manager-data', JSON.stringify(data))
    })

    await page.reload()
    await page.waitForTimeout(2000)

    // Tour should not appear
    await expect(
      page.locator('text=Welcome to BookmarksX!')
    ).not.toBeVisible()
  })

  test('should not auto-start tour if dismissed', async ({ page, context }) => {
    // Set tour as dismissed
    await context.addInitScript(() => {
      const data = JSON.parse(
        localStorage.getItem('x-bookmark-manager-data') || '{}'
      )
      data.settings = {
        ...data.settings,
        tour: {
          hasCompletedTour: false,
          currentStep: null,
          tourDismissed: true,
          tourVersion: '1.0.0',
        },
        hasSeenSplash: true,
      }
      localStorage.setItem('x-bookmark-manager-data', JSON.stringify(data))
    })

    await page.reload()
    await page.waitForTimeout(2000)

    // Tour should not appear
    await expect(
      page.locator('text=Welcome to BookmarksX!')
    ).not.toBeVisible()
  })

  test('should restart tour from settings', async ({ page }) => {
    // Complete the tour first
    await startTour(page)

    // Skip tour
    await page.locator('button:has-text("Skip Tour")').first().click()
    await page.waitForTimeout(500)

    // Navigate to settings
    await page.locator('[data-tour="settings-button"]').click()
    await page.waitForTimeout(1000)

    // Find and click Restart Tour button
    await page.locator('button:has-text("Restart Tour")').click()
    await page.waitForTimeout(1000)

    // Should navigate back to main page and show tour
    await expect(page.locator('text=Welcome to BookmarksX!')).toBeVisible({
      timeout: 10000,
    })
  })
})
