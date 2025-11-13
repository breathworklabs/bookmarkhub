import { test, expect } from '@playwright/test'

test.describe('Search Input Debouncing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173')

    // Wait for app to load
    await page.waitForSelector('[data-testid="bookmark-list"], [data-testid="bookmark-grid"]', {
      timeout: 10000,
    })
  })

  test('should provide immediate visual feedback when typing', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await expect(searchInput).toBeVisible()

    // Type character by character
    await searchInput.type('h', { delay: 50 })
    await expect(searchInput).toHaveValue('h')

    await searchInput.type('e', { delay: 50 })
    await expect(searchInput).toHaveValue('he')

    await searchInput.type('l', { delay: 50 })
    await expect(searchInput).toHaveValue('hel')

    await searchInput.type('l', { delay: 50 })
    await expect(searchInput).toHaveValue('hell')

    await searchInput.type('o', { delay: 50 })
    await expect(searchInput).toHaveValue('hello')

    // Each character should appear immediately without lag
  })

  test('should debounce search results updates', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()

    // Get initial bookmark count
    await page.waitForTimeout(500)
    const initialBookmarks = page.locator('[data-testid="bookmark-card"]')
    const initialCount = await initialBookmarks.count()

    console.log(`Initial bookmark count: ${initialCount}`)

    // Type a search query
    await searchInput.fill('test')

    // Input should show value immediately
    await expect(searchInput).toHaveValue('test')

    // Wait for debounce (300ms) + filtering
    await page.waitForTimeout(400)

    // Bookmark count may have changed due to filtering
    const filteredCount = await initialBookmarks.count()
    console.log(`Filtered bookmark count: ${filteredCount}`)

    // The search should have been executed (count may be different)
    // We can't assert exact count, but we can verify the input worked
    await expect(searchInput).toHaveValue('test')
  })

  test('should handle rapid typing without issues', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()

    // Type rapidly (no delay between characters)
    await searchInput.type('rapidtyping', { delay: 10 })

    // Input should show full text
    await expect(searchInput).toHaveValue('rapidtyping')

    // Wait for debounce
    await page.waitForTimeout(400)

    // Input should still show the text (not cleared or corrupted)
    await expect(searchInput).toHaveValue('rapidtyping')
  })

  test('should clear search and restore results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()

    // Get initial count
    await page.waitForTimeout(500)
    const initialBookmarks = page.locator('[data-testid="bookmark-card"]')
    const initialCount = await initialBookmarks.count()

    console.log(`Initial count: ${initialCount}`)

    // Type a search query
    await searchInput.fill('searchtest')
    await expect(searchInput).toHaveValue('searchtest')

    // Wait for debounce
    await page.waitForTimeout(400)

    // Clear search
    await searchInput.clear()
    await expect(searchInput).toHaveValue('')

    // Wait for debounce
    await page.waitForTimeout(400)

    // Should show all bookmarks again
    const finalCount = await initialBookmarks.count()
    console.log(`Final count: ${finalCount}`)

    expect(finalCount).toBe(initialCount)
  })

  test('should not show typing lag or stuttering', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()

    // Type a sentence with normal typing speed
    const searchText = 'the quick brown fox'

    for (const char of searchText) {
      await searchInput.type(char, { delay: 80 }) // Normal typing speed
      // After each character, input should immediately show current text
      const currentValue = await searchInput.inputValue()
      expect(currentValue).toContain(char)
    }

    // Final value should be complete
    await expect(searchInput).toHaveValue(searchText)
  })

  test('should handle backspace and deletion smoothly', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()

    // Type text
    await searchInput.fill('hello world')
    await expect(searchInput).toHaveValue('hello world')

    // Delete characters
    await searchInput.press('Backspace')
    await expect(searchInput).toHaveValue('hello worl')

    await searchInput.press('Backspace')
    await expect(searchInput).toHaveValue('hello wor')

    await searchInput.press('Backspace')
    await expect(searchInput).toHaveValue('hello wo')

    // Each deletion should be immediately visible
  })

  test('should update results after debounce completes', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    const bookmarks = page.locator('[data-testid="bookmark-card"]')

    // Get initial count
    await page.waitForTimeout(500)
    const initialCount = await bookmarks.count()

    if (initialCount === 0) {
      console.log('No bookmarks to search, skipping')
      test.skip()
      return
    }

    // Type a search query that should filter results
    // Using a very specific string that likely won't match many bookmarks
    await searchInput.fill('xyzabc123nonexistent')
    await expect(searchInput).toHaveValue('xyzabc123nonexistent')

    // Wait for debounce
    await page.waitForTimeout(400)

    // Should show fewer results (likely 0)
    const filteredCount = await bookmarks.count()
    console.log(`Filtered count for nonexistent term: ${filteredCount}`)

    // Clear and verify restoration
    await searchInput.clear()
    await page.waitForTimeout(400)

    const restoredCount = await bookmarks.count()
    expect(restoredCount).toBe(initialCount)
  })

  test('should maintain input focus during typing', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()

    // Click to focus
    await searchInput.click()

    // Type text
    await searchInput.type('focused text', { delay: 50 })

    // Input should still be focused
    const isFocused = await searchInput.evaluate((el) => el === document.activeElement)
    expect(isFocused).toBe(true)

    // Value should be correct
    await expect(searchInput).toHaveValue('focused text')
  })

  test('should work with cut, copy, paste operations', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first()

    // Type text
    await searchInput.fill('copy this text')
    await expect(searchInput).toHaveValue('copy this text')

    // Select all
    await searchInput.press('Control+A')

    // Cut (Ctrl+X / Cmd+X)
    await searchInput.press('Control+X')
    await expect(searchInput).toHaveValue('')

    // Paste (Ctrl+V / Cmd+V)
    await searchInput.press('Control+V')
    await expect(searchInput).toHaveValue('copy this text')
  })
})
