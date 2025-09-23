import { test, expect } from '@playwright/test'

test.describe('App bootstrap and onboarding', () => {
  test('shows onboarding with no data, then main app after import', async ({ page, context }) => {
    // Clear storage and start fresh
    await context.addInitScript(() => localStorage.clear())

    await page.goto('http://localhost:5173')
    await expect(page.getByTestId('onboarding-screen')).toBeVisible()

    // Simulate import of a small fixture
    const importInput = page.getByTestId('import-input')
    await importInput.setInputFiles('tests/fixtures/sample-export.json')
    await page.getByTestId('import-confirm').click()

    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible()
  })
})


