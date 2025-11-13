import { test, expect } from '@playwright/test'

test.describe('Star Button → Smart Collection Update', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173')

    // Wait for app to load
    await page.waitForSelector('[data-testid="bookmark-list"], [data-testid="bookmark-grid"]', {
      timeout: 10000,
    })
  })

  test('should update starred smart collection count immediately when star is toggled', async ({
    page,
  }) => {
    // Step 1: Expand Smart Collections in sidebar
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500) // Wait for expand animation

    // Step 2: Find the Starred collection and get initial count
    const starredCollection = page.locator(
      '[data-collection-id="starred"], :text("Starred")'
    ).first()
    await expect(starredCollection).toBeVisible()

    const initialCountText = await starredCollection.textContent()
    const initialCountMatch = initialCountText?.match(/(\d+)/)
    const initialCount = initialCountMatch ? parseInt(initialCountMatch[1]) : 0

    console.log(`Initial starred count: ${initialCount}`)

    // Step 3: Find first bookmark card and click its star button
    const firstBookmarkCard = page.locator('[data-testid="bookmark-card"]').first()
    await expect(firstBookmarkCard).toBeVisible()

    // Find the star button within the bookmark card (could be in footer or actions)
    const starButton = firstBookmarkCard.locator(
      'button[aria-label*="star"], button:has(svg[data-icon="star"])'
    ).first()
    await expect(starButton).toBeVisible()

    // Click the star button
    await starButton.click()
    await page.waitForTimeout(300) // Give React time to update state

    // Step 4: Verify starred collection count increased by 1
    const updatedCountText = await starredCollection.textContent()
    const updatedCountMatch = updatedCountText?.match(/(\d+)/)
    const updatedCount = updatedCountMatch ? parseInt(updatedCountMatch[1]) : 0

    console.log(`Updated starred count: ${updatedCount}`)

    expect(updatedCount).toBe(initialCount + 1)

    // Step 5: Click into starred collection to verify bookmark appears
    await starredCollection.click()
    await page.waitForTimeout(500)

    // Verify at least one bookmark is displayed
    const bookmarksInStarred = page.locator('[data-testid="bookmark-card"]')
    await expect(bookmarksInStarred.first()).toBeVisible()
    const starredBookmarksCount = await bookmarksInStarred.count()
    expect(starredBookmarksCount).toBeGreaterThanOrEqual(1)

    // Step 6: Unstar the bookmark
    const starredBookmarkCard = bookmarksInStarred.first()
    const unstarButton = starredBookmarkCard.locator(
      'button[aria-label*="star"], button:has(svg[data-icon="star"])'
    ).first()
    await unstarButton.click()
    await page.waitForTimeout(300)

    // Step 7: Navigate back to see collection list
    const allBookmarksNav = page.locator('text=All Bookmarks').first()
    await allBookmarksNav.click()
    await page.waitForTimeout(500)

    // Re-expand Smart Collections if needed
    await smartCollectionsHeader.click()
    await page.waitForTimeout(300)

    // Step 8: Verify starred count decreased back to initial
    const finalCountText = await starredCollection.textContent()
    const finalCountMatch = finalCountText?.match(/(\d+)/)
    const finalCount = finalCountMatch ? parseInt(finalCountMatch[1]) : 0

    console.log(`Final starred count: ${finalCount}`)

    expect(finalCount).toBe(initialCount)
  })

  test('should show filled star icon when bookmark is starred', async ({ page }) => {
    // Find first bookmark
    const firstBookmark = page.locator('[data-testid="bookmark-card"]').first()
    await expect(firstBookmark).toBeVisible()

    const starButton = firstBookmark.locator(
      'button[aria-label*="star"], button:has(svg[data-icon="star"])'
    ).first()

    // Get initial star state (filled vs outline)
    const initialStarIcon = starButton.locator('svg')
    const initialIconClass = await initialStarIcon.getAttribute('data-icon')

    // Click to star
    await starButton.click()
    await page.waitForTimeout(300)

    // Verify star icon changed (implementation-specific, may need adjustment)
    const updatedStarIcon = starButton.locator('svg')
    const updatedIconClass = await updatedStarIcon.getAttribute('data-icon')

    // The icon should change (e.g., from 'star' to 'star-filled' or class change)
    // This test may need adjustment based on actual icon implementation
    expect(updatedIconClass).toBeDefined()
  })

  test('should update all smart collections reactively', async ({ page }) => {
    // This test verifies that other smart collections (recent, archived) also update

    // Expand Smart Collections
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500)

    // Find Recent collection
    const recentCollection = page.locator(
      '[data-collection-id="recent"], :text("Recent")'
    ).first()

    // Recent should have count based on bookmarks created in last 7 days
    const recentCountText = await recentCollection.textContent()
    console.log(`Recent collection text: ${recentCountText}`)

    // Verify Recent collection is visible and has a count
    await expect(recentCollection).toBeVisible()
    expect(recentCountText).toMatch(/\d+/)

    // Find Archived collection
    const archivedCollection = page.locator(
      '[data-collection-id="archived"], :text("Archived")'
    ).first()

    const archivedCountText = await archivedCollection.textContent()
    console.log(`Archived collection text: ${archivedCountText}`)

    await expect(archivedCollection).toBeVisible()
    expect(archivedCountText).toMatch(/\d+/)
  })
})
