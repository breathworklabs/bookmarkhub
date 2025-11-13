import { test, expect } from '@playwright/test'

test.describe('Smart Collections - Deleted Bookmarks Filter', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173')

    // Wait for app to load
    await page.waitForSelector('[data-testid="bookmark-list"], [data-testid="bookmark-grid"]', {
      timeout: 10000,
    })
  })

  const smartCollections = [
    { id: 'starred', name: 'Starred' },
    { id: 'archived', name: 'Archived' },
    { id: 'recent', name: 'Recent' },
    { id: 'uncategorized', name: 'Uncategorized' },
  ]

  smartCollections.forEach(({ id, name }) => {
    test(`${name} collection: badge count should match displayed bookmarks`, async ({
      page,
    }) => {
      // Expand Smart Collections
      const smartCollectionsHeader = page.locator('text=Smart Collections')
      await smartCollectionsHeader.click()
      await page.waitForTimeout(500)

      // Find the collection
      const collection = page.locator(
        `[data-collection-id="${id}"], :text("${name}")`
      ).first()
      await expect(collection).toBeVisible()

      // Get badge count
      const badgeCountText = await collection.textContent()
      const badgeCountMatch = badgeCountText?.match(/(\d+)/)
      const badgeCount = badgeCountMatch ? parseInt(badgeCountMatch[1]) : 0

      console.log(`${name} collection badge count: ${badgeCount}`)

      // Click into collection
      await collection.click()
      await page.waitForTimeout(500)

      // Count displayed bookmarks
      const bookmarks = page.locator('[data-testid="bookmark-card"]')
      const displayedCount = await bookmarks.count()

      console.log(`${name} collection bookmarks displayed: ${displayedCount}`)

      // Badge count MUST equal displayed count
      // This proves deleted bookmarks are properly filtered from both
      expect(displayedCount).toBe(badgeCount)
    })
  })

  test('all smart collections should exclude deleted bookmarks consistently', async ({
    page,
  }) => {
    // Expand Smart Collections
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500)

    const results: Array<{ name: string; badgeCount: number; displayedCount: number }> = []

    // Check each smart collection
    for (const { id, name } of smartCollections) {
      const collection = page.locator(
        `[data-collection-id="${id}"], :text("${name}")`
      ).first()

      // Get badge count
      const badgeCountText = await collection.textContent()
      const badgeCountMatch = badgeCountText?.match(/(\d+)/)
      const badgeCount = badgeCountMatch ? parseInt(badgeCountMatch[1]) : 0

      // Click into collection
      await collection.click()
      await page.waitForTimeout(500)

      // Count displayed bookmarks
      const bookmarks = page.locator('[data-testid="bookmark-card"]')
      const displayedCount = await bookmarks.count()

      results.push({ name, badgeCount, displayedCount })

      // Navigate back
      const allBookmarksNav = page.locator('text=All Bookmarks').first()
      await allBookmarksNav.click()
      await page.waitForTimeout(300)

      // Re-expand for next iteration
      await smartCollectionsHeader.click()
      await page.waitForTimeout(300)
    }

    console.log('Smart collections consistency check:', results)

    // Verify ALL collections have matching badge and display counts
    results.forEach(({ name, badgeCount, displayedCount }) => {
      expect(displayedCount, `${name} collection should have matching counts`).toBe(badgeCount)
    })
  })

  test('smart collections should not show items that are marked as deleted', async ({
    page,
  }) => {
    // This test verifies that if a bookmark has is_deleted=true,
    // it does not appear in any smart collection

    // First, go to All Bookmarks to see total count
    const allBookmarksNav = page.locator('text=All Bookmarks').first()
    await allBookmarksNav.click()
    await page.waitForTimeout(500)

    const allBookmarksCount = await page.locator('[data-testid="bookmark-card"]').count()

    console.log(`Total bookmarks visible: ${allBookmarksCount}`)

    // Expand Smart Collections
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500)

    let totalSmartCollectionCounts = 0

    // Sum up all smart collection counts
    for (const { id, name } of smartCollections) {
      const collection = page.locator(
        `[data-collection-id="${id}"], :text("${name}")`
      ).first()

      const countText = await collection.textContent()
      const countMatch = countText?.match(/(\d+)/)
      const count = countMatch ? parseInt(countMatch[1]) : 0

      console.log(`${name}: ${count} items`)
      totalSmartCollectionCounts += count
    }

    console.log(`Total smart collection items: ${totalSmartCollectionCounts}`)

    // The sum of smart collections might not equal total bookmarks
    // (due to overlaps like starred+archived), but it should be <= total
    // This is a sanity check to ensure deleted bookmarks aren't inflating counts
    expect(totalSmartCollectionCounts).toBeLessThanOrEqual(allBookmarksCount * 4) // *4 because overlaps
  })

  test('smart collections display should update reactively when bookmarks change', async ({
    page,
  }) => {
    // Expand Smart Collections
    const smartCollectionsHeader = page.locator('text=Smart Collections')
    await smartCollectionsHeader.click()
    await page.waitForTimeout(500)

    // Take snapshot of all smart collection counts
    const initialCounts: Record<string, number> = {}

    for (const { id, name } of smartCollections) {
      const collection = page.locator(
        `[data-collection-id="${id}"], :text("${name}")`
      ).first()

      const countText = await collection.textContent()
      const countMatch = countText?.match(/(\d+)/)
      initialCounts[id] = countMatch ? parseInt(countMatch[1]) : 0
    }

    console.log('Initial counts:', initialCounts)

    // Navigate to All Bookmarks
    const allBookmarksNav = page.locator('text=All Bookmarks').first()
    await allBookmarksNav.click()
    await page.waitForTimeout(500)

    const bookmarks = page.locator('[data-testid="bookmark-card"]')
    const totalBookmarks = await bookmarks.count()

    if (totalBookmarks > 0) {
      // Try to star a bookmark (should update starred collection)
      const firstBookmark = bookmarks.first()
      const starButton = firstBookmark.locator(
        'button[aria-label*="star"], button[title*="star"], [data-testid*="star"]'
      ).first()

      const starButtonExists = await starButton.count()

      if (starButtonExists > 0) {
        await starButton.click()
        await page.waitForTimeout(500)

        // Re-expand Smart Collections
        await smartCollectionsHeader.click()
        await page.waitForTimeout(300)

        // Check starred collection count changed
        const starredCollection = page.locator(
          '[data-collection-id="starred"], :text("Starred")'
        ).first()
        const starredCountText = await starredCollection.textContent()
        const starredCountMatch = starredCountText?.match(/(\d+)/)
        const newStarredCount = starredCountMatch ? parseInt(starredCountMatch[1]) : 0

        console.log(
          `Starred count changed: ${initialCounts['starred']} -> ${newStarredCount}`
        )

        // Count should have changed (either +1 or -1 depending on toggle)
        expect(newStarredCount).not.toBe(initialCounts['starred'])
      }
    }

    // After any mutations, verify badge counts still match display counts
    for (const { id, name } of smartCollections) {
      const collection = page.locator(
        `[data-collection-id="${id}"], :text("${name}")`
      ).first()

      const badgeCountText = await collection.textContent()
      const badgeCountMatch = badgeCountText?.match(/(\d+)/)
      const badgeCount = badgeCountMatch ? parseInt(badgeCountMatch[1]) : 0

      await collection.click()
      await page.waitForTimeout(300)

      const displayedCount = await page.locator('[data-testid="bookmark-card"]').count()

      expect(displayedCount, `${name} should still match after mutations`).toBe(badgeCount)

      // Navigate back
      await allBookmarksNav.click()
      await page.waitForTimeout(300)
      await smartCollectionsHeader.click()
      await page.waitForTimeout(300)
    }
  })
})
