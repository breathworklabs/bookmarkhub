import { test, expect } from '@playwright/test'

test.describe('Quick Filter Tooltips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174')

    // Wait for the app to load
    await page.waitForLoadState('networkidle')

    // Click on the filter button to open advanced filters if not visible
    const filterButton = page.getByRole('button', { name: /filter/i }).first()
    if (await filterButton.isVisible()) {
      await filterButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('should display tooltips on hover for quick filter buttons', async ({
    page,
  }) => {
    // Find the "High Engagement" quick filter button
    const highEngagementButton = page.getByRole('button', {
      name: 'High Engagement',
    })

    // Verify button exists
    await expect(highEngagementButton).toBeVisible()

    // Hover over the button
    await highEngagementButton.hover()

    // Wait for tooltip to appear (300ms delay + animation)
    await page.waitForTimeout(500)

    // Take screenshot to see where tooltip appears
    await page.screenshot({
      path: 'tests/e2e/screenshots/tooltip-high-engagement.png',
    })

    // Check if tooltip content is visible
    const tooltipContent = page.getByText(/engagement score > 100/i)
    await expect(tooltipContent).toBeVisible()

    // Get positions of button and tooltip
    const buttonBox = await highEngagementButton.boundingBox()
    const tooltipBox = await tooltipContent.boundingBox()

    console.log('Button position:', buttonBox)
    console.log('Tooltip position:', tooltipBox)

    // Verify tooltip is positioned above the button (tooltip.bottom < button.top)
    if (buttonBox && tooltipBox) {
      const tooltipBottom = tooltipBox.y + tooltipBox.height
      const buttonTop = buttonBox.y

      console.log('Tooltip bottom:', tooltipBottom)
      console.log('Button top:', buttonTop)

      // Tooltip should be above the button
      expect(tooltipBottom).toBeLessThanOrEqual(buttonTop)
    }
  })

  test('should test all quick filter tooltips positioning', async ({
    page,
  }) => {
    const filters = [
      { name: 'Starred Only', text: 'marked with a star' },
      { name: 'Unread', text: "haven't read yet" },
      { name: 'Has Comments', text: 'comments or replies' },
      { name: 'High Engagement', text: 'engagement score > 100' },
      { name: 'Recently Added', text: 'last 24 hours' },
      { name: 'Archived', text: "you've archived" },
    ]

    for (const filter of filters) {
      const button = page.getByRole('button', { name: filter.name })

      if (await button.isVisible()) {
        await button.hover()
        await page.waitForTimeout(500)

        const tooltip = page.getByText(new RegExp(filter.text, 'i'))
        await expect(tooltip).toBeVisible()

        // Take screenshot
        await page.screenshot({
          path: `tests/e2e/screenshots/tooltip-${filter.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        })

        // Get positions
        const buttonBox = await button.boundingBox()
        const tooltipBox = await tooltip.boundingBox()

        if (buttonBox && tooltipBox) {
          const tooltipBottom = tooltipBox.y + tooltipBox.height
          const buttonTop = buttonBox.y
          const tooltipRight = tooltipBox.x + tooltipBox.width
          const buttonLeft = buttonBox.x

          console.log(`\n${filter.name}:`)
          console.log('  Button:', {
            x: buttonBox.x,
            y: buttonBox.y,
            width: buttonBox.width,
            height: buttonBox.height,
          })
          console.log('  Tooltip:', {
            x: tooltipBox.x,
            y: tooltipBox.y,
            width: tooltipBox.width,
            height: tooltipBox.height,
          })
          console.log('  Tooltip is above button:', tooltipBottom <= buttonTop)
          console.log('  Tooltip is to the right:', tooltipBox.x > buttonLeft)
        }

        // Move away to hide tooltip
        await page.mouse.move(0, 0)
        await page.waitForTimeout(200)
      }
    }
  })
})
