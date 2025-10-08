import { test, expect } from '@playwright/test'

test.describe('App bootstrap and onboarding', () => {
  test('shows onboarding screen when no bookmarks exist', async ({ page, context }) => {
    // Clear storage and start fresh
    await context.addInitScript(() => localStorage.clear())

    await page.goto('http://localhost:5173')

    // Should show onboarding screen
    await expect(page.getByTestId('onboarding-screen')).toBeVisible({ timeout: 10000 })
  })

  test('shows main app with pre-existing bookmarks', async ({ page, context }) => {
    // Pre-populate with bookmark data
    await context.addInitScript(() => {
      const sampleData = {
        bookmarks: [
          {
            id: 1,
            user_id: "local-user",
            title: "Sample",
            url: "https://example.com",
            description: "",
            content: "",
            author: "",
            domain: "example.com",
            source_platform: "manual",
            engagement_score: 0,
            is_starred: false,
            is_read: false,
            is_archived: false,
            tags: [],
            collections: ["uncategorized"],
            primaryCollection: "uncategorized",
            created_at: "2024-01-01T00:00:00.000Z",
            updated_at: "2024-01-01T00:00:00.000Z"
          }
        ],
        collections: [
          { id: "uncategorized", name: "Uncategorized", isPrivate: false, isDefault: true, isSmartCollection: false, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z", bookmarkCount: 1, userId: "local-user" }
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: { version: "2.0.0" },
        version: "2.0.0"
      }
      localStorage.setItem('x-bookmark-manager-data', JSON.stringify(sampleData))
    })

    await page.goto('http://localhost:5173')

    // Should show main app, not onboarding
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({ timeout: 10000 })
  })
})


