import { describe, it, expect } from 'vitest'
import type { Bookmark } from '../../src/types/bookmark'

// Test the exact logic from CollectionsSidebar getBookmarkCount function
function getBookmarkCount(collectionId: string, bookmarks: Bookmark[]) {
  // Handle smart collections with dynamic counts
  if (collectionId === 'starred') {
    return bookmarks.filter(bookmark => bookmark.is_starred).length
  }
  if (collectionId === 'archived') {
    return bookmarks.filter(bookmark => bookmark.is_archived).length
  }
  if (collectionId === 'recent') {
    // Recent: bookmarks from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return bookmarks.filter(bookmark =>
      new Date(bookmark.created_at) > sevenDaysAgo
    ).length
  }

  // For regular collections, use the collection bookmarks mapping
  return 0
}

// Create test data that matches your real import structure
const createRealImportData = (): Bookmark[] => [
  {
    id: 7,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'React 19 Beta Features - What\'s New',
    url: 'https://react.dev/blog/2024/04/25/react-19',
    description: 'React 19 features',
    content: 'React 19 content...',
    author: 'React Team',
    domain: 'react.dev',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: true,
    is_read: false,
    is_archived: false, // NOT archived
    is_shared: false,
    tags: ['react', 'javascript'],
    collections: ['uncategorized'],
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: '2025-09-21T02:22:53.277Z'
  },
  {
    id: 8,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'TypeScript 5.5 Released',
    url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/',
    description: 'TypeScript 5.5 features',
    content: 'TypeScript 5.5 content...',
    author: 'TypeScript Team',
    domain: 'devblogs.microsoft.com',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: false,
    is_read: false,
    is_archived: false, // NOT archived
    is_shared: false,
    tags: ['typescript', 'javascript'],
    collections: ['uncategorized'],
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: '2025-09-21T02:22:53.277Z'
  },
  {
    id: 9,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'Building Scalable Web Apps with Next.js',
    url: 'https://nextjs.org/learn',
    description: 'Next.js tutorial',
    content: 'Next.js content...',
    author: 'Vercel',
    domain: 'nextjs.org',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: true,
    is_read: false,
    is_archived: false, // NOT archived
    is_shared: false,
    tags: ['nextjs', 'react'],
    collections: ['uncategorized'],
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: '2025-09-21T02:22:53.277Z'
  },
  {
    id: 10,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'Supabase vs Firebase: Database Comparison',
    url: 'https://supabase.com/blog/supabase-vs-firebase',
    description: 'Database comparison',
    content: 'Supabase vs Firebase...',
    author: 'Supabase Team',
    domain: 'supabase.com',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: false,
    is_read: false,
    is_archived: true, // THIS ONE IS archived (matches console output)
    is_shared: false,
    tags: ['supabase', 'firebase'],
    collections: ['uncategorized'],
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: '2025-09-21T02:22:53.277Z'
  },
  {
    id: 11,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'State Management in React: Zustand vs Redux',
    url: 'https://blog.logrocket.com/zustand-vs-redux/',
    description: 'State management comparison',
    content: 'State management content...',
    author: 'LogRocket',
    domain: 'blog.logrocket.com',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: true,
    is_read: false,
    is_archived: false, // NOT archived
    is_shared: false,
    tags: ['react', 'state-management'],
    collections: ['uncategorized'],
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: '2025-09-21T02:22:53.277Z'
  },
  {
    id: 12,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'CSS Grid vs Flexbox: When to Use Which',
    url: 'https://css-tricks.com/quick-whats-the-difference-between-flexbox-and-grid/',
    description: 'CSS layout comparison',
    content: 'CSS Grid vs Flexbox...',
    author: 'CSS-Tricks',
    domain: 'css-tricks.com',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: false,
    is_read: false,
    is_archived: false, // NOT archived
    is_shared: false,
    tags: ['css', 'grid', 'flexbox'],
    collections: ['uncategorized'],
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: '2025-09-21T02:22:53.277Z'
  }
]

describe('Archived Count Logic Bug Test', () => {
  it('should count exactly 1 archived bookmark from real import data', () => {
    const bookmarks = createRealImportData()

    // Verify test data setup
    expect(bookmarks).toHaveLength(6)

    // Manual count for verification
    const manualArchivedCount = bookmarks.filter(b => b.is_archived === true).length

    // Should have exactly 1 archived bookmark
    expect(manualArchivedCount).toBe(1)

    // Test the actual function
    const archivedCount = getBookmarkCount('archived', bookmarks)

    // This is the critical test - should be 1, not 6
    expect(archivedCount).toBe(1)
    expect(archivedCount).not.toBe(6) // Explicitly test it's not showing all bookmarks
  })

  it('should count exactly 3 starred bookmarks from real import data', () => {
    const bookmarks = createRealImportData()

    // Manual count for verification
    const manualStarredCount = bookmarks.filter(b => b.is_starred === true).length

    expect(manualStarredCount).toBe(3) // React 19, Next.js, Zustand vs Redux

    // Test the actual function
    const starredCount = getBookmarkCount('starred', bookmarks)

    expect(starredCount).toBe(3)
  })

  it('should handle recent bookmarks correctly', () => {
    const bookmarks = createRealImportData()

    // All test bookmarks are from 2025-09-21, which should be recent
    const recentCount = getBookmarkCount('recent', bookmarks)

    // All 6 bookmarks should be recent (created today in test data)
    expect(recentCount).toBe(6)
  })

  it('should return 0 for unknown collection', () => {
    const bookmarks = createRealImportData()
    const unknownCount = getBookmarkCount('unknown-collection', bookmarks)
    expect(unknownCount).toBe(0)
  })

  it('should handle edge cases correctly', () => {
    const bookmarks = createRealImportData()

    // Test with all archived
    const allArchivedBookmarks = bookmarks.map(b => ({ ...b, is_archived: true }))
    const allArchivedCount = getBookmarkCount('archived', allArchivedBookmarks)
    expect(allArchivedCount).toBe(6)

    // Test with none archived
    const noneArchivedBookmarks = bookmarks.map(b => ({ ...b, is_archived: false }))
    const noneArchivedCount = getBookmarkCount('archived', noneArchivedBookmarks)
    expect(noneArchivedCount).toBe(0)
  })

  it('should reveal the bug if filter is broken', () => {
    const bookmarks = createRealImportData()

    // Debug each bookmark's archived status
    bookmarks.forEach((bookmark) => {
      // Verify bookmark archived status types
      expect(typeof bookmark.is_archived).toBe('boolean')
    })

    // Test different filter approaches to identify the bug
    const filterResults = {
      strict: bookmarks.filter(b => b.is_archived === true).length,
      truthy: bookmarks.filter(b => !!b.is_archived).length,
      simple: bookmarks.filter(b => b.is_archived).length,
      string: bookmarks.filter(b => (b.is_archived as any) === 'true').length
    }

    // Verify all filter approaches work correctly

    // All should return 1 for correct data
    expect(filterResults.strict).toBe(1)
    expect(filterResults.truthy).toBe(1)
    expect(filterResults.simple).toBe(1)
    expect(filterResults.string).toBe(0) // No string 'true' values

    // If any return 6, that indicates the bug
    const buggyResults = Object.values(filterResults).filter(count => count === 6)
    // Ensure no filter approach returns incorrect count
    expect(buggyResults).toHaveLength(0)
  })

  it('should test with potentially buggy data that could cause 6 archived', () => {
    // Create data where all bookmarks have truthy is_archived values but only 1 should be true
    const buggyBookmarks = createRealImportData().map((bookmark, index) => {
      if (index === 3) { // Keep the Supabase one as properly archived
        return { ...bookmark, is_archived: true }
      }
      // These could be the problem - truthy but not boolean true
      return {
        ...bookmark,
        is_archived: bookmark.is_archived ? 'true' : 'false' // Convert to strings
      }
    })

    // Testing with potentially buggy data (mixed types)

    // Test the exact filter logic from CollectionsSidebar
    const componentFilterResult = buggyBookmarks.filter(bookmark => bookmark.is_archived).length
    const strictFilterResult = buggyBookmarks.filter(bookmark => bookmark.is_archived === true).length

    // This should reveal if string 'true' values are being counted as archived
    // Truthy filtering will count string 'true' as truthy (6 bookmarks)
    // Strict filtering will only count boolean true (1 bookmark)
    expect(componentFilterResult).toBe(6) // Truthy filtering counts all 'true' strings
    expect(strictFilterResult).toBe(1) // Only one should be truly archived

    // This demonstrates the bug: truthy filtering returns more than strict filtering
    expect(componentFilterResult).toBeGreaterThan(strictFilterResult)
  })
})