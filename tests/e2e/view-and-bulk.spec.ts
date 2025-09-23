import { test, expect } from '@playwright/test'

// Initially skipped until data-testid hooks exist
test.describe.skip('View toggle persistence and multi-select bulk actions', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(({ data }) => {
      localStorage.setItem('x-bookmark-manager-bookmarks', JSON.stringify(data))
    }, { data: [] })
  })

  test('toggle view persists across reload', async ({ page }) => {
    await page.goto('http://localhost:5173')

    const toggle = page.getByTestId('view-toggle')
    await toggle.click() // switch to list
    await page.reload()

    await expect(page.getByTestId('bookmark-list-view')).toBeVisible()
  })

  test('multi-select enables bulk bar and actions', async ({ page }) => {
    await page.goto('http://localhost:5173')

    const first = page.getByTestId('bookmark-card').nth(0)
    const second = page.getByTestId('bookmark-card').nth(1)
    await first.getByTestId('select-checkbox').check()
    await second.getByTestId('select-checkbox').check()

    await expect(page.getByTestId('bulk-actions-bar')).toBeVisible()
    await page.getByTestId('bulk-archive').click()

    await expect(page.getByTestId('toast-success')).toBeVisible()
  })
})


