import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { localStorageService } from '../../src/lib/localStorage'
import type { Bookmark, BookmarkInsert } from '../../src/types/bookmark'

const createTestBookmark = (overrides: Partial<Bookmark> = {}): Bookmark => ({
  id: 1,
  user_id: 'test-user',
  title: 'Test Bookmark',
  url: 'https://example.com',
  description: 'Test description',
  content: 'Test content',
  author: 'Test Author',
  domain: 'example.com',
  source_platform: 'manual',
  engagement_score: 50,
  is_starred: false,
  is_read: false,
  is_archived: false,
  is_shared: false,
  is_deleted: false,
  tags: [],
  collections: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

describe('bookmarkStore - Extended Actions', () => {
  beforeEach(() => {
    useBookmarkStore.setState({
      bookmarks: [],
      displayedBookmarks: [],
      selectedBookmarks: [],
      duplicateMatches: [],
      pendingBookmark: null,
      showDuplicateDialog: false,
      isLoading: false,
      error: null,
      pagination: {
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 0,
        hasMore: false,
        isLoading: false,
      },
      filterOptions: {
        authors: [],
        domains: [],
        tags: [],
        contentTypes: [],
      },
      filterOptionsHash: '',
      recentActivity: [],
      validationResults: [],
      validationSummary: null,
      isValidating: false,
      validationProgress: null,
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('bookmark selection', () => {
    it('should select a bookmark', () => {
      useBookmarkStore.getState().selectBookmark(1)

      expect(useBookmarkStore.getState().selectedBookmarks).toContain(1)
    })

    it('should deselect a bookmark', () => {
      useBookmarkStore.setState({ selectedBookmarks: [1, 2, 3] })
      useBookmarkStore.getState().deselectBookmark(2)

      expect(useBookmarkStore.getState().selectedBookmarks).toEqual([1, 3])
    })

    it('should toggle bookmark selection on', () => {
      useBookmarkStore.getState().toggleBookmarkSelection(1)

      expect(useBookmarkStore.getState().selectedBookmarks).toContain(1)
    })

    it('should toggle bookmark selection off', () => {
      useBookmarkStore.setState({ selectedBookmarks: [1] })
      useBookmarkStore.getState().toggleBookmarkSelection(1)

      expect(useBookmarkStore.getState().selectedBookmarks).toEqual([])
    })

    it('should clear all selections', () => {
      useBookmarkStore.setState({ selectedBookmarks: [1, 2, 3, 4] })
      useBookmarkStore.getState().clearBookmarkSelection()

      expect(useBookmarkStore.getState().selectedBookmarks).toEqual([])
    })

    it('should set selected bookmarks', () => {
      useBookmarkStore.getState().setSelectedBookmarks([5, 6, 7])

      expect(useBookmarkStore.getState().selectedBookmarks).toEqual([5, 6, 7])
    })
  })

  describe('mobile header', () => {
    it('should set mobile header visible', () => {
      useBookmarkStore.getState().setMobileHeaderVisible(true)

      expect(useBookmarkStore.getState().isMobileHeaderVisible).toBe(true)
    })

    it('should toggle mobile header', () => {
      // Default is true
      expect(useBookmarkStore.getState().isMobileHeaderVisible).toBe(true)

      useBookmarkStore.getState().toggleMobileHeader()
      expect(useBookmarkStore.getState().isMobileHeaderVisible).toBe(false)

      useBookmarkStore.getState().toggleMobileHeader()
      expect(useBookmarkStore.getState().isMobileHeaderVisible).toBe(true)
    })
  })

  describe('duplicate detection', () => {
    it('should set duplicate matches', () => {
      const matches = [
        {
          bookmark: createTestBookmark({ id: 1 }),
          score: 0.95,
          reason: 'Exact URL match',
        },
      ]

      useBookmarkStore.getState().setDuplicateMatches(matches)

      expect(useBookmarkStore.getState().duplicateMatches).toEqual(matches)
    })

    it('should set pending bookmark', () => {
      const bookmark: BookmarkInsert = {
        user_id: 'test',
        title: 'Test',
        url: 'https://test.com',
        description: 'Test',
        content: 'Test',
        author: 'Test',
        domain: 'test.com',
        source_platform: 'manual',
        engagement_score: 0,
        is_starred: false,
        is_read: false,
        is_archived: false,
        is_shared: false,
        tags: [],
        collections: [],
      }

      useBookmarkStore.getState().setPendingBookmark(bookmark)

      expect(useBookmarkStore.getState().pendingBookmark).toEqual(bookmark)
    })

    it('should show duplicate dialog', () => {
      useBookmarkStore.getState().setShowDuplicateDialog(true)

      expect(useBookmarkStore.getState().showDuplicateDialog).toBe(true)
    })

    it('should cancel add duplicate', () => {
      const bookmark: BookmarkInsert = {
        user_id: 'test',
        title: 'Test',
        url: 'https://test.com',
        description: 'Test',
        content: 'Test',
        author: 'Test',
        domain: 'test.com',
        source_platform: 'manual',
        engagement_score: 0,
        is_starred: false,
        is_read: false,
        is_archived: false,
        is_shared: false,
        tags: [],
        collections: [],
      }

      useBookmarkStore.setState({
        pendingBookmark: bookmark,
        showDuplicateDialog: true,
        duplicateMatches: [],
      })

      useBookmarkStore.getState().cancelAddDuplicate()

      expect(useBookmarkStore.getState().pendingBookmark).toBeNull()
      expect(useBookmarkStore.getState().showDuplicateDialog).toBe(false)
      expect(useBookmarkStore.getState().duplicateMatches).toEqual([])
    })
  })

  describe('pagination', () => {
    it('should reset pagination', () => {
      useBookmarkStore.setState({
        pagination: {
          currentPage: 5,
          itemsPerPage: 20,
          totalItems: 100,
          hasMore: true,
          isLoading: false,
        },
      })

      useBookmarkStore.getState().resetPagination()

      const state = useBookmarkStore.getState()
      expect(state.pagination.currentPage).toBe(1)
      expect(state.pagination.hasMore).toBe(false)
    })

    it('should set items per page', () => {
      useBookmarkStore.getState().setItemsPerPage(50)

      expect(useBookmarkStore.getState().pagination.itemsPerPage).toBe(50)
    })

    it('should not load more if no more bookmarks', () => {
      const bookmarks = Array.from({ length: 20 }, (_, i) =>
        createTestBookmark({ id: i + 1 })
      )

      useBookmarkStore.setState({
        bookmarks,
        displayedBookmarks: bookmarks,
        pagination: {
          currentPage: 1,
          itemsPerPage: 20,
          totalItems: 20,
          hasMore: false,
          isLoading: false,
        },
      })

      useBookmarkStore.getState().loadMoreBookmarks()

      const state = useBookmarkStore.getState()
      // Should not change isLoading when hasMore is false
      expect(state.pagination.isLoading).toBe(false)
    })
  })

  describe('activity logging', () => {
    it('should add activity log', () => {
      useBookmarkStore
        .getState()
        .addActivityLog('bookmark_created', 'Created new bookmark')

      const activity = useBookmarkStore.getState().recentActivity
      expect(activity).toHaveLength(1)
      expect(activity[0].action).toBe('bookmark_created')
      expect(activity[0].details).toBe('Created new bookmark')
      expect(activity[0].id).toBeDefined()
      expect(activity[0].timestamp).toBeInstanceOf(Date)
    })

    it('should limit activity log to 50 entries', () => {
      // Add 60 activity logs
      for (let i = 0; i < 60; i++) {
        useBookmarkStore.getState().addActivityLog(`action_${i}`)
      }

      const activity = useBookmarkStore.getState().recentActivity
      expect(activity).toHaveLength(50)
      expect(activity[0].action).toBe('action_59') // Most recent
    })

    it('should get recent activity with limit', () => {
      // Add 20 activities
      for (let i = 0; i < 20; i++) {
        useBookmarkStore.getState().addActivityLog(`action_${i}`)
      }

      const recent = useBookmarkStore.getState().getRecentActivity(5)

      expect(recent).toHaveLength(5)
      expect(recent[0].action).toBe('action_19') // Most recent
    })

    it('should get all recent activity when no limit specified', () => {
      for (let i = 0; i < 10; i++) {
        useBookmarkStore.getState().addActivityLog(`action_${i}`)
      }

      const all = useBookmarkStore.getState().getRecentActivity()

      expect(all).toHaveLength(10)
    })
  })

  describe('filter options calculation', () => {
    it('should calculate filter options from bookmarks', () => {
      const bookmarks = [
        createTestBookmark({
          id: 1,
          author: 'John Doe',
          domain: 'example.com',
          tags: ['react', 'javascript'],
        }),
        createTestBookmark({
          id: 2,
          author: 'Jane Smith',
          domain: 'test.com',
          tags: ['python'],
        }),
        createTestBookmark({
          id: 3,
          author: 'John Doe',
          domain: 'example.com',
          tags: ['react', 'typescript'],
        }),
      ]

      useBookmarkStore.setState({ bookmarks })
      useBookmarkStore.getState().calculateFilterOptions()

      const options = useBookmarkStore.getState().filterOptions

      expect(options.authors).toEqual(['Jane Smith', 'John Doe']) // Sorted
      expect(options.domains).toEqual(['example.com', 'test.com']) // Sorted
      expect(options.tags.sort()).toEqual([
        'javascript',
        'python',
        'react',
        'typescript',
      ]) // Unique and sorted
    })

    it('should handle empty bookmarks', () => {
      useBookmarkStore.setState({ bookmarks: [] })
      useBookmarkStore.getState().calculateFilterOptions()

      const options = useBookmarkStore.getState().filterOptions

      expect(options.authors).toEqual([])
      expect(options.domains).toEqual([])
      expect(options.tags).toEqual([])
    })

    it('should update filter options hash', () => {
      const bookmarks = [createTestBookmark({ id: 1 })]
      useBookmarkStore.setState({ bookmarks, filterOptionsHash: '' })

      useBookmarkStore.getState().calculateFilterOptions()

      expect(useBookmarkStore.getState().filterOptionsHash).not.toBe('')
    })
  })

  describe('validation state', () => {
    it('should set validation results', () => {
      const results = [
        { bookmarkId: 1, isValid: true, errors: [] },
        { bookmarkId: 2, isValid: false, errors: ['Invalid URL'] },
      ]

      useBookmarkStore.setState({ validationResults: results })

      expect(useBookmarkStore.getState().validationResults).toEqual(results)
    })

    it('should get invalid bookmarks count from validation summary', () => {
      const summary = {
        totalBookmarks: 10,
        validBookmarks: 8,
        invalidBookmarks: 2,
        invalid: 2, // getInvalidBookmarksCount uses validationSummary.invalid
        validationDate: new Date().toISOString(),
      }

      useBookmarkStore.setState({ validationSummary: summary })

      const count = useBookmarkStore.getState().getInvalidBookmarksCount()
      expect(count).toBe(2)
    })

    it('should return 0 for invalid count when no results', () => {
      useBookmarkStore.setState({ validationResults: [] })

      const count = useBookmarkStore.getState().getInvalidBookmarksCount()
      expect(count).toBe(0)
    })

    it('should set validation summary', () => {
      const summary = {
        totalBookmarks: 10,
        validBookmarks: 8,
        invalidBookmarks: 2,
        validationDate: new Date().toISOString(),
      }

      useBookmarkStore.setState({ validationSummary: summary })

      expect(useBookmarkStore.getState().validationSummary).toEqual(summary)
    })

    it('should track validation progress', () => {
      useBookmarkStore.setState({
        isValidating: true,
        validationProgress: { current: 50, total: 100 },
      })

      const state = useBookmarkStore.getState()
      expect(state.isValidating).toBe(true)
      expect(state.validationProgress?.current).toBe(50)
      expect(state.validationProgress?.total).toBe(100)
    })
  })
})
