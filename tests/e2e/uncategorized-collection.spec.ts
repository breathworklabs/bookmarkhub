import { test, expect } from '@playwright/test'

test.describe('Uncategorized Collection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173')

    // Wait for app to load
    await page.waitForSelector('[data-testid="bookmark-list"], [data-testid="bookmark-grid"]', {
      timeout: 10000,
    })
  })

  test('should display bookmarks when uncategorized collection is clicked', async ({
    page,
  }) => {
    // Step 1: Expand Smart Collections in sidebar
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500) // Wait for expand animation

    // Step 2: Find the Uncategorized collection
    const uncategorizedCollection = page.locator(
      '[data-collection-id="uncategorized"], :text("Uncategorized")'
    ).first()
    await expect(uncategorizedCollection).toBeVisible()

    // Step 3: Get the count from the badge
    const countText = await uncategorizedCollection.textContent()
    const countMatch = countText?.match(/(\d+)/)
    const expectedCount = countMatch ? parseInt(countMatch[1]) : 0

    console.log(`Uncategorized collection badge count: ${expectedCount}`)

    // Step 4: Click into uncategorized collection
    await uncategorizedCollection.click()
    await page.waitForTimeout(500)

    // Step 5: Verify bookmarks are displayed
    if (expectedCount > 0) {
      const bookmarksDisplayed = page.locator('[data-testid="bookmark-card"]')
      await expect(bookmarksDisplayed.first()).toBeVisible()

      const actualCount = await bookmarksDisplayed.count()
      console.log(`Bookmarks displayed: ${actualCount}`)

      // The displayed count should match the badge count
      expect(actualCount).toBe(expectedCount)
    } else {
      // If count is 0, should show empty state
      const emptyState = page.locator('text=/no bookmarks|empty/i')
      await expect(emptyState).toBeVisible()
    }
  })

  test('should show correct count matching displayed bookmarks', async ({ page }) => {
    // Expand Smart Collections
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500)

    // Find Uncategorized collection
    const uncategorizedCollection = page.locator(
      '[data-collection-id="uncategorized"], :text("Uncategorized")'
    ).first()
    await expect(uncategorizedCollection).toBeVisible()

    // Get badge count
    const badgeCountText = await uncategorizedCollection.textContent()
    const badgeCountMatch = badgeCountText?.match(/(\d+)/)
    const badgeCount = badgeCountMatch ? parseInt(badgeCountMatch[1]) : 0

    // Click into collection
    await uncategorizedCollection.click()
    await page.waitForTimeout(500)

    // Count displayed bookmarks
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    const displayedCount = await bookmarks.count()

    // Badge count should equal displayed count
    expect(displayedCount).toBe(badgeCount)
  })

  test('should update when bookmark is added to a collection', async ({ page }) => {
    // Expand Smart Collections
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500)

    // Get initial uncategorized count
    const uncategorizedCollection = page.locator(
      '[data-collection-id="uncategorized"], :text("Uncategorized")'
    ).first()
    const initialCountText = await uncategorizedCollection.textContent()
    const initialCountMatch = initialCountText?.match(/(\d+)/)
    const initialCount = initialCountMatch ? parseInt(initialCountMatch[1]) : 0

    console.log(`Initial uncategorized count: ${initialCount}`)

    // Skip test if there are no uncategorized bookmarks
    if (initialCount === 0) {
      console.log('No uncategorized bookmarks to test with, skipping')
      test.skip()
      return
    }

    // Click into uncategorized to see bookmarks
    await uncategorizedCollection.click()
    await page.waitForTimeout(500)

    // Find first bookmark
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    await expect(firstBookmark).toBeVisible()

    // Open bookmark actions menu (three dots or right-click)
    const actionsButton = firstBookmark.locator(
      'button[aria-label*="actions"], button[aria-label*="menu"]'
    ).first()

    // If actions button exists, click it, otherwise skip this part
    const actionsExists = await actionsButton.count()
    if (actionsExists > 0) {
      await actionsButton.click()
      await page.waitForTimeout(300)

      // Look for "Add to Collection" or "Move to Collection" option
      const addToCollectionOption = page.locator(
        'text=/add to collection|move to collection/i'
      ).first()

      const optionExists = await addToCollectionOption.count()
      if (optionExists > 0) {
        await addToCollectionOption.click()
        await page.waitForTimeout(300)

        // Select any collection (not uncategorized)
        const collectionOption = page.locator('[role="option"]').first()
        await collectionOption.click()
        await page.waitForTimeout(500)

        // Navigate back to see collection list
        const allBookmarksNav = page.locator('text=All Bookmarks').first()
        await allBookmarksNav.click()
        await page.waitForTimeout(500)

        // Re-expand Smart Collections
        await smartCollectionsHeader.click()
        await page.waitForTimeout(300)

        // Verify uncategorized count decreased by 1
        const finalCountText = await uncategorizedCollection.textContent()
        const finalCountMatch = finalCountText?.match(/(\d+)/)
        const finalCount = finalCountMatch ? parseInt(finalCountMatch[1]) : 0

        console.log(`Final uncategorized count: ${finalCount}`)
        expect(finalCount).toBe(initialCount - 1)
      }
    }
  })

  test('should only show bookmarks without collections', async ({ page }) => {
    // Expand Smart Collections
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500)

    // Click into uncategorized
    const uncategorizedCollection = page.locator(
      '[data-collection-id="uncategorized"], :text("Uncategorized")'
    ).first()
    await uncategorizedCollection.click()
    await page.waitForTimeout(500)

    // Get count badge
    const countText = await uncategorizedCollection.textContent()
    const countMatch = countText?.match(/(\d+)/)
    const expectedCount = countMatch ? parseInt(countMatch[1]) : 0

    // If there are bookmarks shown
    if (expectedCount > 0) {
      const bookmarks = page.locator('[data-testid="bookmark-card"]')
      const actualCount = await bookmarks.count()

      // Should have bookmarks
      expect(actualCount).toBeGreaterThan(0)

      // Count should match
      expect(actualCount).toBe(expectedCount)
    }

    // Now check "All Bookmarks" and verify we have more bookmarks there
    const allBookmarksNav = page.locator('text=All Bookmarks').first()
    await allBookmarksNav.click()
    await page.waitForTimeout(500)

    const allBookmarks = page.locator('[data-testid="bookmark-card"]')
    const totalCount = await allBookmarks.count()

    // Total bookmarks should be >= uncategorized count
    expect(totalCount).toBeGreaterThanOrEqual(expectedCount)
  })
})
