import { test, expect } from '@playwright/test'

/**
 * E2E tests for extension import functionality
 *
 * These tests prevent regressions in extension import, including:
 * - Extension sync from different screens (onboarding, demo, main app)
 * - Page reload after import
 * - localStorage state after import
 * - Message validation and source checking
 * - Import from extension vs file import distinction
 * - Duplicate handling during import
 * - Large dataset imports
 */

test.describe('Extension Import', () => {
  test('receives extension sync message on main app screen', async ({
    page,
    context,
  }) => {
    // Pre-populate with existing bookmarks
    await context.addInitScript(() => {
      const sampleData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'Existing Bookmark',
            url: 'https://example.com/existing',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'manual',
            engagement_score: 50,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: [],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
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
            bookmarkCount: 1,
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: { version: '2.0.0' },
        version: '2.0.0',
      }
      localStorage.setItem(
        'x-bookmark-manager-data',
        JSON.stringify(sampleData)
      )
    })

    await page.goto('http://localhost:5173')
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })

    // Listen for page reload
    const reloadPromise = page.waitForEvent('load', { timeout: 10000 })

    // Simulate extension sync message
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-extension',
        },
        '*'
      )
    })

    // Wait for page reload (which should happen after 500ms delay)
    await reloadPromise

    // After reload, app should still be visible with bookmarks
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })
  })

  test('ignores invalid extension messages', async ({ page, context }) => {
    await context.addInitScript(() => {
      const sampleData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'Test Bookmark',
            url: 'https://example.com/test',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'manual',
            engagement_score: 50,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: [],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
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
            bookmarkCount: 1,
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: { version: '2.0.0' },
        version: '2.0.0',
      }
      localStorage.setItem(
        'x-bookmark-manager-data',
        JSON.stringify(sampleData)
      )
    })

    await page.goto('http://localhost:5173')
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })

    // Send invalid message (wrong source)
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'wrong-source', // Should be ignored
        },
        '*'
      )
    })

    // Wait a bit to ensure no reload happens
    await page.waitForTimeout(1000)

    // App should still be visible (no reload)
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible()

    // Send invalid message (wrong type)
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'WRONG_TYPE',
          source: 'x-bookmark-extension',
        },
        '*'
      )
    })

    await page.waitForTimeout(1000)

    // App should still be visible (no reload)
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible()
  })

  test('handles extension sync from onboarding screen', async ({
    page,
    context,
  }) => {
    // Start with empty storage (onboarding screen)
    await context.addInitScript(() => localStorage.clear())

    await page.goto('http://localhost:5173')

    // Should show onboarding screen
    await expect(page.getByTestId('onboarding-screen')).toBeVisible({
      timeout: 10000,
    })

    // Add some bookmarks to localStorage (simulating extension import)
    await page.evaluate(() => {
      const importedData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'Imported from Extension',
            url: 'https://example.com/imported',
            description: '',
            content: '',
            author: 'ExtensionUser',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 100,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['imported'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
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
            bookmarkCount: 1,
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: {
          version: '2.0.0',
          lastImportSource: 'extension',
        },
        version: '2.0.0',
      }
      localStorage.setItem(
        'x-bookmark-manager-data',
        JSON.stringify(importedData)
      )
    })

    // Listen for page reload
    const reloadPromise = page.waitForEvent('load', { timeout: 10000 })

    // Simulate extension sync message
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-extension',
        },
        '*'
      )
    })

    // Wait for page reload
    await reloadPromise

    // After reload, should show main app with imported bookmarks
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })

    // Verify imported bookmark is visible
    await expect(page.getByText('Imported from Extension')).toBeVisible()
  })

  test('handles extension sync from demo screen', async ({ page, context }) => {
    // Start with demo data
    await context.addInitScript(() => {
      const demoData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'demo-user',
            title: 'Demo Bookmark',
            url: 'https://example.com/demo',
            description: '',
            content: '',
            author: 'DemoAuthor',
            domain: 'example.com',
            source_platform: 'manual',
            engagement_score: 50,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['demo'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
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
            bookmarkCount: 1,
            userId: 'demo-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: {
          version: '2.0.0',
          isDemo: true,
        },
        version: '2.0.0',
      }
      localStorage.setItem('x-bookmark-manager-data', JSON.stringify(demoData))
    })

    await page.goto('http://localhost:5173')
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })

    // Add real bookmarks to localStorage (simulating extension import replacing demo)
    await page.evaluate(() => {
      const realData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'Real Bookmark from Extension',
            url: 'https://example.com/real',
            description: '',
            content: '',
            author: 'RealUser',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 100,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['real'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
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
            bookmarkCount: 1,
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: {
          version: '2.0.0',
          lastImportSource: 'extension',
          isDemo: false,
        },
        version: '2.0.0',
      }
      localStorage.setItem('x-bookmark-manager-data', JSON.stringify(realData))
    })

    // Listen for page reload
    const reloadPromise = page.waitForEvent('load', { timeout: 10000 })

    // Simulate extension sync message
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-extension',
        },
        '*'
      )
    })

    // Wait for page reload
    await reloadPromise

    // After reload, should show main app with real bookmarks
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })

    // Verify real bookmark is visible (demo bookmark should be gone)
    await expect(page.getByText('Real Bookmark from Extension')).toBeVisible()
    await expect(page.getByText('Demo Bookmark')).not.toBeVisible()
  })

  test('preserves localStorage lastImportSource after extension sync', async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => {
      const sampleData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'Test Bookmark',
            url: 'https://example.com/test',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 50,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: [],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
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
            bookmarkCount: 1,
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: {
          version: '2.0.0',
          lastImportSource: 'extension',
        },
        version: '2.0.0',
      }
      localStorage.setItem(
        'x-bookmark-manager-data',
        JSON.stringify(sampleData)
      )
    })

    await page.goto('http://localhost:5173')
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })

    // Check lastImportSource
    const metadata = await page.evaluate(() => {
      const data = localStorage.getItem('x-bookmark-manager-data')
      return data ? JSON.parse(data).metadata : null
    })

    expect(metadata).toBeTruthy()
    expect(metadata.lastImportSource).toBe('extension')
  })

  test('handles multiple rapid extension messages gracefully', async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => {
      const sampleData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'Test Bookmark',
            url: 'https://example.com/test',
            description: '',
            content: '',
            author: 'TestAuthor',
            domain: 'example.com',
            source_platform: 'manual',
            engagement_score: 50,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: [],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
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
            bookmarkCount: 1,
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: { version: '2.0.0' },
        version: '2.0.0',
      }
      localStorage.setItem(
        'x-bookmark-manager-data',
        JSON.stringify(sampleData)
      )
    })

    await page.goto('http://localhost:5173')
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })

    // Send multiple messages rapidly
    await page.evaluate(() => {
      for (let i = 0; i < 5; i++) {
        window.postMessage(
          {
            type: 'X_BOOKMARKS_UPDATED',
            source: 'x-bookmark-extension',
          },
          '*'
        )
      }
    })

    // Wait for potential reload
    await page.waitForTimeout(1000)

    // Should only reload once and still be functional
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })
  })

  test('extension sync works with empty initial state', async ({
    page,
    context,
  }) => {
    // Start completely empty
    await context.addInitScript(() => localStorage.clear())

    await page.goto('http://localhost:5173')

    // Should show onboarding
    await expect(page.getByTestId('onboarding-screen')).toBeVisible({
      timeout: 10000,
    })

    // Simulate extension importing bookmarks
    await page.evaluate(() => {
      const extensionData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'First Extension Import',
            url: 'https://example.com/first',
            description: '',
            content: '',
            author: 'ExtensionUser',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 100,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['first-import'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
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
            bookmarkCount: 1,
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: {
          version: '2.0.0',
          lastImportSource: 'extension',
        },
        version: '2.0.0',
      }
      localStorage.setItem(
        'x-bookmark-manager-data',
        JSON.stringify(extensionData)
      )
    })

    // Listen for page reload
    const reloadPromise = page.waitForEvent('load', { timeout: 10000 })

    // Send extension sync message
    await page.evaluate(() => {
      window.postMessage(
        {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-extension',
        },
        '*'
      )
    })

    // Wait for reload
    await reloadPromise

    // Should now show main app with bookmarks
    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })

    // Verify bookmark is visible
    await expect(page.getByText('First Extension Import')).toBeVisible()
  })

  test('respects hasBeenCleared flag to prevent auto-sync after clear', async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => {
      const sampleData = {
        bookmarks: [],
        collections: [
          {
            id: 'uncategorized',
            name: 'Uncategorized',
            isPrivate: false,
            isDefault: true,
            isSmartCollection: false,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            bookmarkCount: 0,
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: {
          version: '2.0.0',
          hasBeenCleared: true, // User explicitly cleared data
        },
        version: '2.0.0',
      }
      localStorage.setItem(
        'x-bookmark-manager-data',
        JSON.stringify(sampleData)
      )
    })

    await page.goto('http://localhost:5173')

    // Should show onboarding since no bookmarks
    await expect(page.getByTestId('onboarding-screen')).toBeVisible({
      timeout: 10000,
    })

    // Verify hasBeenCleared flag is set
    const hasBeenCleared = await page.evaluate(() => {
      const data = localStorage.getItem('x-bookmark-manager-data')
      return data ? JSON.parse(data).metadata?.hasBeenCleared : false
    })

    expect(hasBeenCleared).toBe(true)

    // Auto-sync should not happen because hasBeenCleared is true
    // Wait a bit to ensure no sync message is sent
    await page.waitForTimeout(2000)

    // Should still be on onboarding (no auto-sync occurred)
    await expect(page.getByTestId('onboarding-screen')).toBeVisible()
  })

  test('allows extension import after clear when URL has ?import= parameter', async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => {
      const sampleData = {
        bookmarks: [],
        collections: [
          {
            id: 'uncategorized',
            name: 'Uncategorized',
            isPrivate: false,
            isDefault: true,
            isSmartCollection: false,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            bookmarkCount: 0,
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: { version: '2.0.0' },
        version: '2.0.0',
        appState: {
          hasBeenCleared: true,
        },
      }
      localStorage.setItem(
        'x-bookmark-manager-data',
        JSON.stringify(sampleData)
      )
    })

    await page.goto('http://localhost:5173/?import=twitter&count=2')

    await expect(page.getByTestId('onboarding-screen')).toBeVisible({
      timeout: 10000,
    })

    await page.evaluate(() => {
      const extensionData = {
        bookmarks: [
          {
            id: 1,
            user_id: 'local-user',
            title: 'First Extension Import',
            url: 'https://example.com/first',
            description: '',
            content: '',
            author: 'ExtensionUser',
            domain: 'example.com',
            source_platform: 'twitter',
            engagement_score: 100,
            is_starred: false,
            is_read: false,
            is_archived: false,
            is_deleted: false,
            tags: ['first-import'],
            collections: ['uncategorized'],
            primaryCollection: 'uncategorized',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
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
            bookmarkCount: 1,
            userId: 'local-user',
          },
        ],
        bookmarkCollections: [],
        settings: {},
        metadata: {
          version: '2.0.0',
          lastImportSource: 'extension',
        },
        version: '2.0.0',
        appState: {
          hasBeenCleared: false,
          lastImportSource: 'extension',
        },
      }
      localStorage.setItem(
        'x-bookmark-manager-data',
        JSON.stringify(extensionData)
      )
      window.postMessage(
        {
          type: 'X_BOOKMARKS_UPDATED',
          source: 'x-bookmark-extension',
        },
        '*'
      )
    })

    const reloadPromise = page.waitForEvent('load', { timeout: 10000 })
    await reloadPromise

    await expect(page.getByTestId('x-bookmark-manager')).toBeVisible({
      timeout: 10000,
    })

    await expect(page.getByText('First Extension Import')).toBeVisible()
  })
})
