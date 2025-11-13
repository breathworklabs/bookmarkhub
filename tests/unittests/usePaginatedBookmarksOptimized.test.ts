import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { useCollectionsStore } from '../../src/store/collectionsStore'
import { usePaginatedBookmarksOptimized } from '../../src/hooks/composite/usePaginatedBookmarksOptimized'
import type { Bookmark } from '../../src/types/bookmark'

// Helper to create mock bookmarks
const createMockBookmark = (overrides: Partial<Bookmark> = {}): Bookmark => {
  const defaults: Bookmark = {
    id: 1,
    user_id: 'test-user',
    title: 'Test Bookmark',
    url: 'https://example.com/article',
    content: 'Test content',
    author: 'Test Author',
    domain: 'example.com',
    thumbnail_url: null,
    tags: [],
    collections: ['uncategorized'],
    is_starred: false,
    is_read: false,
    is_archived: false,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    engagement_score: 0,
    metadata: null,
  }
  return { ...defaults, ...overrides }
}

describe('usePaginatedBookmarksOptimized', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
    const { result: collectionsResult } = renderHook(() => useCollectionsStore())

    act(() => {
      bookmarkResult.current.setBookmarks([])
      bookmarkResult.current.setSelectedTags([])
      bookmarkResult.current.setSearchQuery('')
      bookmarkResult.current.setActiveTab(0)
      bookmarkResult.current.setActiveSidebarItem('All Bookmarks')
      bookmarkResult.current.setAuthorFilter('')
      bookmarkResult.current.setDomainFilter('')
      bookmarkResult.current.setContentTypeFilter('')
      bookmarkResult.current.setDateRangeFilter({ type: 'all' })
      bookmarkResult.current.resetPagination()
      collectionsResult.current.setActiveCollection(null)
    })
    useBookmarkStore.setState({ quickFilters: [] })
    useCollectionsStore.setState({ collectionBookmarks: {} })
  })

  describe('Basic Pagination', () => {
    it('should return initial page of bookmarks', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({ id: i + 1, created_at: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z` })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      // Default itemsPerPage is 20
      expect(hookResult.current.bookmarks).toHaveLength(20)
      expect(hookResult.current.totalItems).toBe(50)
      expect(hookResult.current.currentPage).toBe(1)
      expect(hookResult.current.hasMore).toBe(true)
    })

    it('should return empty array when no bookmarks', () => {
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      expect(hookResult.current.bookmarks).toHaveLength(0)
      expect(hookResult.current.totalItems).toBe(0)
      expect(hookResult.current.currentPage).toBe(1)
      expect(hookResult.current.hasMore).toBe(false)
    })

    it('should handle fewer bookmarks than page size', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 10 }, (_, i) =>
        createMockBookmark({ id: i + 1 })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      expect(hookResult.current.bookmarks).toHaveLength(10)
      expect(hookResult.current.hasMore).toBe(false)
    })
  })

  describe('Load More Functionality', () => {
    it('should load more bookmarks when loadMore is called', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({ id: i + 1 })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      expect(hookResult.current.bookmarks).toHaveLength(20)

      act(() => {
        hookResult.current.loadMore()
      })

      // After loading more, should have 40 bookmarks (2 pages * 20)
      expect(hookResult.current.bookmarks).toHaveLength(40)
      expect(hookResult.current.currentPage).toBe(2)
      expect(hookResult.current.hasMore).toBe(true)
    })

    it('should load all remaining bookmarks on final page', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 45 }, (_, i) =>
        createMockBookmark({ id: i + 1 })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      expect(hookResult.current.bookmarks).toHaveLength(20)

      act(() => {
        hookResult.current.loadMore()
      })

      expect(hookResult.current.bookmarks).toHaveLength(40)
      expect(hookResult.current.hasMore).toBe(true)

      act(() => {
        hookResult.current.loadMore()
      })

      // Should now have all 45 bookmarks
      expect(hookResult.current.bookmarks).toHaveLength(45)
      expect(hookResult.current.currentPage).toBe(3)
      expect(hookResult.current.hasMore).toBe(false)
    })

    it('should not load more when hasMore is false', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 10 }, (_, i) =>
        createMockBookmark({ id: i + 1 })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      expect(hookResult.current.hasMore).toBe(false)
      const initialLength = hookResult.current.bookmarks.length

      act(() => {
        hookResult.current.loadMore()
      })

      // Should not change
      expect(hookResult.current.bookmarks).toHaveLength(initialLength)
      expect(hookResult.current.currentPage).toBe(1)
    })

    it('should not load more when isLoading is true', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({ id: i + 1 })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
        useBookmarkStore.setState({
          pagination: {
            currentPage: 1,
            itemsPerPage: 20,
            isLoading: true,
          },
        })
      })

      const initialPage = hookResult.current.currentPage

      act(() => {
        hookResult.current.loadMore()
      })

      // Should not advance page when loading
      expect(hookResult.current.currentPage).toBe(initialPage)
    })
  })

  describe('Pagination Reset on Filter Change', () => {
    it('should reset pagination when search query changes', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({ id: i + 1, title: `Bookmark ${i + 1}` })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      // Load more to get to page 2
      act(() => {
        hookResult.current.loadMore()
      })

      expect(hookResult.current.currentPage).toBe(2)
      expect(hookResult.current.bookmarks).toHaveLength(40)

      // Change search query
      act(() => {
        bookmarkResult.current.setSearchQuery('test')
      })

      // Should reset to page 1
      expect(hookResult.current.currentPage).toBe(1)
    })

    it('should reset pagination when tags change', async () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({ id: i + 1, tags: ['test'] })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      act(() => {
        hookResult.current.loadMore()
      })

      await waitFor(() => {
        expect(hookResult.current.currentPage).toBe(2)
      })

      act(() => {
        bookmarkResult.current.setSelectedTags(['test'])
      })

      expect(hookResult.current.currentPage).toBe(1)
    })

    it('should reset pagination when active tab changes', async () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({ id: i + 1 })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      act(() => {
        hookResult.current.loadMore()
      })

      await waitFor(() => {
        expect(hookResult.current.currentPage).toBe(2)
      })

      act(() => {
        bookmarkResult.current.setActiveTab(1)
      })

      expect(hookResult.current.currentPage).toBe(1)
    })

    it('should reset pagination when author filter changes', async () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({ id: i + 1, author: 'John Doe' })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      act(() => {
        hookResult.current.loadMore()
      })

      await waitFor(() => {
        expect(hookResult.current.currentPage).toBe(2)
      })

      act(() => {
        bookmarkResult.current.setAuthorFilter('John')
      })

      expect(hookResult.current.currentPage).toBe(1)
    })
  })

  describe('Pagination with Filters', () => {
    it('should paginate filtered results correctly', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({
          id: i + 1,
          tags: i < 30 ? ['javascript'] : ['python'],
        })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
        bookmarkResult.current.setSelectedTags(['javascript'])
      })

      // Should have 30 filtered items, showing first 20
      expect(hookResult.current.totalItems).toBe(30)
      expect(hookResult.current.bookmarks).toHaveLength(20)
      expect(hookResult.current.hasMore).toBe(true)

      act(() => {
        hookResult.current.loadMore()
      })

      // Should now show all 30
      expect(hookResult.current.bookmarks).toHaveLength(30)
      expect(hookResult.current.hasMore).toBe(false)
    })

    it('should handle pagination when filters reduce result set', async () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({
          id: i + 1,
          title: i < 5 ? 'Special Bookmark' : 'Regular Bookmark',
        })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      act(() => {
        hookResult.current.loadMore()
      })

      await waitFor(() => {
        expect(hookResult.current.currentPage).toBe(2)
      })

      // Apply filter that drastically reduces results
      act(() => {
        bookmarkResult.current.setSearchQuery('Special')
      })

      // Should reset to page 1 and show all 5 results
      expect(hookResult.current.currentPage).toBe(1)
      expect(hookResult.current.totalItems).toBe(5)
      expect(hookResult.current.bookmarks).toHaveLength(5)
      expect(hookResult.current.hasMore).toBe(false)
    })
  })

  describe('Pagination State', () => {
    it('should track total items correctly', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 75 }, (_, i) =>
        createMockBookmark({ id: i + 1 })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      expect(hookResult.current.totalItems).toBe(75)
      expect(hookResult.current.bookmarks).toHaveLength(20)
    })

    it('should calculate hasMore correctly for exact page boundaries', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      // Exactly 2 pages worth
      const bookmarks = Array.from({ length: 40 }, (_, i) =>
        createMockBookmark({ id: i + 1 })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      expect(hookResult.current.hasMore).toBe(true)

      act(() => {
        hookResult.current.loadMore()
      })

      expect(hookResult.current.hasMore).toBe(false)
      expect(hookResult.current.bookmarks).toHaveLength(40)
    })

    it('should maintain isLoading state', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({ id: i + 1 })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      expect(hookResult.current.isLoading).toBe(false)

      act(() => {
        useBookmarkStore.setState({
          pagination: {
            currentPage: 1,
            itemsPerPage: 20,
            isLoading: true,
          },
        })
      })

      expect(hookResult.current.isLoading).toBe(true)
    })
  })

  describe('Custom Items Per Page', () => {
    it('should respect custom itemsPerPage setting', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 100 }, (_, i) =>
        createMockBookmark({ id: i + 1 })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
        bookmarkResult.current.setItemsPerPage(50)
      })

      expect(hookResult.current.bookmarks).toHaveLength(50)
      expect(hookResult.current.hasMore).toBe(true)

      act(() => {
        hookResult.current.loadMore()
      })

      expect(hookResult.current.bookmarks).toHaveLength(100)
      expect(hookResult.current.hasMore).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single bookmark', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      act(() => {
        bookmarkResult.current.setBookmarks([createMockBookmark({ id: 1 })])
      })

      expect(hookResult.current.bookmarks).toHaveLength(1)
      expect(hookResult.current.totalItems).toBe(1)
      expect(hookResult.current.hasMore).toBe(false)
    })

    it('should handle deleted bookmarks in pagination', () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({
          id: i + 1,
          is_deleted: i < 10, // First 10 are deleted
        })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      // Should only count non-deleted bookmarks (40 total)
      expect(hookResult.current.totalItems).toBe(40)
      expect(hookResult.current.bookmarks).toHaveLength(20)
      expect(hookResult.current.hasMore).toBe(true)
    })

    it('should handle rapid filter changes', async () => {
      const { result: bookmarkResult } = renderHook(() => useBookmarkStore())
      const { result: hookResult } = renderHook(() => usePaginatedBookmarksOptimized())

      const bookmarks = Array.from({ length: 50 }, (_, i) =>
        createMockBookmark({ id: i + 1, title: `Bookmark ${i + 1}` })
      )

      act(() => {
        bookmarkResult.current.setBookmarks(bookmarks)
      })

      act(() => {
        hookResult.current.loadMore()
      })

      await waitFor(() => {
        expect(hookResult.current.currentPage).toBe(2)
      })

      // Rapid filter changes
      act(() => {
        bookmarkResult.current.setSearchQuery('test1')
        bookmarkResult.current.setSearchQuery('test2')
        bookmarkResult.current.setSearchQuery('test3')
      })

      // Should reset and stay at page 1
      expect(hookResult.current.currentPage).toBe(1)
    })
  })
})
