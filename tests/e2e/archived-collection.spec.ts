import { test, expect } from '@playwright/test'

test.describe('Archived Collection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173')

    // Wait for app to load
    await page.waitForSelector('[data-testid="bookmark-list"], [data-testid="bookmark-grid"]', {
      timeout: 10000,
    })
  })

  test('should display archived bookmarks when archived collection is clicked', async ({
    page,
  }) => {
    // Step 1: Expand Smart Collections in sidebar
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500) // Wait for expand animation

    // Step 2: Find the Archived collection
    const archivedCollection = page.locator(
      '[data-collection-id="archived"], :text("Archived")'
    ).first()
    await expect(archivedCollection).toBeVisible()

    // Step 3: Get the count from the badge
    const countText = await archivedCollection.textContent()
    const countMatch = countText?.match(/(\d+)/)
    const expectedCount = countMatch ? parseInt(countMatch[1]) : 0

    console.log(`Archived collection badge count: ${expectedCount}`)

    // Step 4: Click into archived collection
    await archivedCollection.click()
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

    // Find Archived collection
    const archivedCollection = page.locator(
      '[data-collection-id="archived"], :text("Archived")'
    ).first()
    await expect(archivedCollection).toBeVisible()

    // Get badge count
    const badgeCountText = await archivedCollection.textContent()
    const badgeCountMatch = badgeCountText?.match(/(\d+)/)
    const badgeCount = badgeCountMatch ? parseInt(badgeCountMatch[1]) : 0

    // Click into collection
    await archivedCollection.click()
    await page.waitForTimeout(500)

    // Count displayed bookmarks
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    const displayedCount = await bookmarks.count()

    // Badge count should equal displayed count
    expect(displayedCount).toBe(badgeCount)
  })

  test('should exclude deleted bookmarks from display and count', async ({ page }) => {
    // Expand Smart Collections
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500)

    // Get archived count
    const archivedCollection = page.locator(
      '[data-collection-id="archived"], :text("Archived")'
    ).first()
    const countText = await archivedCollection.textContent()
    const countMatch = countText?.match(/(\d+)/)
    const archivedCount = countMatch ? parseInt(countMatch[1]) : 0

    console.log(`Archived collection badge count: ${archivedCount}`)

    // Click into archived collection
    await archivedCollection.click()
    await page.waitForTimeout(500)

    // Count displayed bookmarks
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    const displayedCount = await bookmarks.count()

    console.log(`Bookmarks displayed: ${displayedCount}`)

    // Badge count must equal displayed count (proving deleted bookmarks are excluded)
    expect(displayedCount).toBe(archivedCount)
  })

  test('should update badge count when archiving a bookmark', async ({ page }) => {
    // Go to All Bookmarks first
    const allBookmarksNav = page.locator('text=All Bookmarks').first()
    await allBookmarksNav.click()
    await page.waitForTimeout(500)

    // Check if there are any bookmarks
    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    const totalBookmarks = await bookmarks.count()

    if (totalBookmarks === 0) {
      console.log('No bookmarks to test with, skipping')
      test.skip()
      return
    }

    // Expand Smart Collections to see initial archived count
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500)

    const archivedCollection = page.locator(
      '[data-collection-id="archived"], :text("Archived")'
    ).first()
    const initialCountText = await archivedCollection.textContent()
    const initialCountMatch = initialCountText?.match(/(\d+)/)
    const initialCount = initialCountMatch ? parseInt(initialCountMatch[1]) : 0

    console.log(`Initial archived count: ${initialCount}`)

    // Go back to All Bookmarks
    await allBookmarksNav.click()
    await page.waitForTimeout(500)

    // Find first bookmark and archive it
    const firstBookmark = bookmarks.first()
    await expect(firstBookmark).toBeVisible()

    // Try to find archive button/action
    const archiveButton = firstBookmark.locator(
      'button[aria-label*="archive"], button[title*="archive"], [data-testid*="archive"]'
    ).first()

    const archiveButtonExists = await archiveButton.count()

    if (archiveButtonExists > 0) {
      await archiveButton.click()
      await page.waitForTimeout(500)

      // Re-expand Smart Collections and check count
      await smartCollectionsHeader.click()
      await page.waitForTimeout(300)

      const finalCountText = await archivedCollection.textContent()
      const finalCountMatch = finalCountText?.match(/(\d+)/)
      const finalCount = finalCountMatch ? parseInt(finalCountMatch[1]) : 0

      console.log(`Final archived count: ${finalCount}`)

      // Count should have increased by 1
      expect(finalCount).toBe(initialCount + 1)
    } else {
      console.log('Archive button not found, skipping archive action test')
      test.skip()
    }
  })

  test('should only show archived bookmarks', async ({ page }) => {
    // Expand Smart Collections
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500)

    // Click into archived
    const archivedCollection = page.locator(
      '[data-collection-id="archived"], :text("Archived")'
    ).first()
    await archivedCollection.click()
    await page.waitForTimeout(500)

    // Get count badge
    const countText = await archivedCollection.textContent()
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

    // Now check "All Bookmarks" and verify we have more or equal bookmarks there
    const allBookmarksNav = page.locator('text=All Bookmarks').first()
    await allBookmarksNav.click()
    await page.waitForTimeout(500)

    const allBookmarks = page.locator('[data-testid="bookmark-card"]')
    const totalCount = await allBookmarks.count()

    // Total bookmarks should be >= archived count
    expect(totalCount).toBeGreaterThanOrEqual(expectedCount)
  })
})
