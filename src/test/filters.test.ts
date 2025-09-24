import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFilteredBookmarksOptimized } from '../hooks/composite/useFilteredBookmarksOptimized'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { type Bookmark } from '../types/bookmark'

// Mock the stores
vi.mock('../store/bookmarkStore')
vi.mock('../store/collectionsStore')

const mockBookmarks: Bookmark[] = [
  {
    id: 1,
    user_id: 'local',
    title: 'Test Article',
    url: 'https://example.com/article',
    description: 'desc',
    content: 'This is a test article about technology.',
    author: 'John Doe (@johndoe)',
    domain: 'example.com',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    source_platform: 'manual',
    is_starred: false,
    is_read: false,
    is_archived: false,
    tags: ['tech', 'X'],
    thumbnail_url: '',
    favicon_url: '',
    engagement_score: 75,
    collections: []
  },
  {
    id: 2,
    user_id: 'local',
    title: 'X Tweet Post',
    url: 'https://x.com/user/status/123',
    description: 'desc',
    content: 'Breaking news about Bitcoin price surge!',
    author: 'The Kobeissi Letter (@KobeissiLetter)',
    domain: 'x.com',
    created_at: '2024-01-02T15:30:00Z',
    updated_at: '2024-01-02T15:30:00Z',
    source_platform: 'manual',
    is_starred: true,
    is_read: true,
    is_archived: false,
    tags: ['X'],
    thumbnail_url: 'https://example.com/thumb.jpg',
    favicon_url: '',
    engagement_score: 90,
    collections: []
  },
  {
    id: 3,
    user_id: 'local',
    title: 'GitHub Repository',
    url: 'https://github.com/user/repo',
    description: 'desc',
    content: 'Open source project for developers.',
    author: 'GitHub User (@githubuser)',
    domain: 'github.com',
    created_at: '2024-01-03T08:15:00Z',
    updated_at: '2024-01-03T08:15:00Z',
    source_platform: 'manual',
    is_starred: false,
    is_read: false,
    is_archived: true,
    tags: ['dev', 'github'],
    thumbnail_url: '',
    favicon_url: '',
    engagement_score: 60,
    collections: []
  }
]

const mockUseBookmarkStore = vi.mocked(useBookmarkStore)
const mockUseCollectionsStore = vi.mocked(useCollectionsStore)

describe('Filter Functionality', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Default store state
    mockUseBookmarkStore.mockImplementation((selector) => {
      const state = {
        bookmarks: mockBookmarks,
        selectedTags: [],
        searchQuery: '',
        activeTab: 0,
        activeSidebarItem: 'All Bookmarks',
        authorFilter: '',
        domainFilter: '',
        contentTypeFilter: '',
        dateRangeFilter: { type: 'all' as const },
        quickFilters: []
      }
      return selector(state as any)
    })

    mockUseCollectionsStore.mockImplementation((selector) => {
      const state = {
        activeCollectionId: null,
        collectionBookmarks: {}
      }
      return selector(state as any)
    })
  })

  describe('Author Filter', () => {
    it('should filter bookmarks by author name', () => {
      mockUseBookmarkStore.mockImplementation((selector) => {
        const state = {
          bookmarks: mockBookmarks,
          selectedTags: [],
          searchQuery: '',
          activeTab: 0,
          activeSidebarItem: 'All Bookmarks',
          authorFilter: 'kobeissi', // Search for Kobeissi
          domainFilter: '',
          contentTypeFilter: '',
          dateRangeFilter: { type: 'all' as const },
          quickFilters: []
        }
        return selector(state as any)
      })

      const { result } = renderHook(() => useFilteredBookmarksOptimized())

      expect(result.current).toHaveLength(1)
      expect(result.current[0].author).toBe('The Kobeissi Letter (@KobeissiLetter)')
      expect(result.current[0].id).toBe(2)
    })

    it('should filter bookmarks by username', () => {
      mockUseBookmarkStore.mockImplementation((selector) => {
        const state = {
          bookmarks: mockBookmarks,
          selectedTags: [],
          searchQuery: '',
          activeTab: 0,
          activeSidebarItem: 'All Bookmarks',
          authorFilter: '@johndoe', // Search by username
          domainFilter: '',
          contentTypeFilter: '',
          dateRangeFilter: { type: 'all' as const },
          quickFilters: []
        }
        return selector(state as any)
      })

      const { result } = renderHook(() => useFilteredBookmarksOptimized())

      expect(result.current).toHaveLength(1)
      expect(result.current[0].author).toBe('John Doe (@johndoe)')
      expect(result.current[0].id).toBe(1)
    })

    it('should return no results for non-existent author', () => {
      mockUseBookmarkStore.mockImplementation((selector) => {
        const state = {
          bookmarks: mockBookmarks,
          selectedTags: [],
          searchQuery: '',
          activeTab: 0,
          activeSidebarItem: 'All Bookmarks',
          authorFilter: 'nonexistent',
          domainFilter: '',
          contentTypeFilter: '',
          dateRangeFilter: { type: 'all' as const },
          quickFilters: []
        }
        return selector(state as any)
      })

      const { result } = renderHook(() => useFilteredBookmarksOptimized())
      expect(result.current).toHaveLength(0)
    })
  })

  describe('Domain Filter', () => {
    it('should filter bookmarks by domain', () => {
      mockUseBookmarkStore.mockImplementation((selector) => {
        const state = {
          bookmarks: mockBookmarks,
          selectedTags: [],
          searchQuery: '',
          activeTab: 0,
          activeSidebarItem: 'All Bookmarks',
          authorFilter: '',
          domainFilter: 'x.com',
          contentTypeFilter: '',
          dateRangeFilter: { type: 'all' as const },
          quickFilters: []
        }
        return selector(state as any)
      })

      const { result } = renderHook(() => useFilteredBookmarksOptimized())

      expect(result.current).toHaveLength(1)
      expect(result.current[0].domain).toBe('x.com')
      expect(result.current[0].id).toBe(2)
    })

    it('should filter bookmarks by partial domain match', () => {
      mockUseBookmarkStore.mockImplementation((selector) => {
        const state = {
          bookmarks: mockBookmarks,
          selectedTags: [],
          searchQuery: '',
          activeTab: 0,
          activeSidebarItem: 'All Bookmarks',
          authorFilter: '',
          domainFilter: 'github', // Partial match
          contentTypeFilter: '',
          dateRangeFilter: { type: 'all' as const },
          quickFilters: []
        }
        return selector(state as any)
      })

      const { result } = renderHook(() => useFilteredBookmarksOptimized())

      expect(result.current).toHaveLength(1)
      expect(result.current[0].domain).toBe('github.com')
      expect(result.current[0].id).toBe(3)
    })
  })

  describe('Combined Filters', () => {
    it('should apply both author and domain filters', () => {
      mockUseBookmarkStore.mockImplementation((selector) => {
        const state = {
          bookmarks: mockBookmarks,
          selectedTags: [],
          searchQuery: '',
          activeTab: 0,
          activeSidebarItem: 'All Bookmarks',
          authorFilter: 'kobeissi',
          domainFilter: 'x.com',
          contentTypeFilter: '',
          dateRangeFilter: { type: 'all' as const },
          quickFilters: []
        }
        return selector(state as any)
      })

      const { result } = renderHook(() => useFilteredBookmarksOptimized())

      expect(result.current).toHaveLength(1)
      expect(result.current[0].author).toBe('The Kobeissi Letter (@KobeissiLetter)')
      expect(result.current[0].domain).toBe('x.com')
    })

    it('should return no results when filters do not match', () => {
      mockUseBookmarkStore.mockImplementation((selector) => {
        const state = {
          bookmarks: mockBookmarks,
          selectedTags: [],
          searchQuery: '',
          activeTab: 0,
          activeSidebarItem: 'All Bookmarks',
          authorFilter: 'kobeissi',
          domainFilter: 'github.com', // Different domain
          contentTypeFilter: '',
          dateRangeFilter: { type: 'all' as const },
          quickFilters: []
        }
        return selector(state as any)
      })

      const { result } = renderHook(() => useFilteredBookmarksOptimized())
      expect(result.current).toHaveLength(0)
    })
  })

  describe('Search Query Filter', () => {
    it('should filter by title', () => {
      mockUseBookmarkStore.mockImplementation((selector) => {
        const state = {
          bookmarks: mockBookmarks,
          selectedTags: [],
          searchQuery: 'bitcoin',
          activeTab: 0,
          activeSidebarItem: 'All Bookmarks',
          authorFilter: '',
          domainFilter: '',
          contentTypeFilter: '',
          dateRangeFilter: { type: 'all' as const },
          quickFilters: []
        }
        return selector(state as any)
      })

      const { result } = renderHook(() => useFilteredBookmarksOptimized())

      expect(result.current).toHaveLength(1)
      expect(result.current[0].content).toContain('Bitcoin')
    })
  })

  describe('Quick Filters', () => {
    it('should filter starred bookmarks', () => {
      mockUseBookmarkStore.mockImplementation((selector) => {
        const state = {
          bookmarks: mockBookmarks,
          selectedTags: [],
          searchQuery: '',
          activeTab: 0,
          activeSidebarItem: 'All Bookmarks',
          authorFilter: '',
          domainFilter: '',
          contentTypeFilter: '',
          dateRangeFilter: { type: 'all' as const },
          quickFilters: ['starred']
        }
        return selector(state as any)
      })

      const { result } = renderHook(() => useFilteredBookmarksOptimized())

      expect(result.current).toHaveLength(1)
      expect(result.current[0].is_starred).toBe(true)
    })

    it('should filter archived bookmarks', () => {
      mockUseBookmarkStore.mockImplementation((selector) => {
        const state = {
          bookmarks: mockBookmarks,
          selectedTags: [],
          searchQuery: '',
          activeTab: 0,
          activeSidebarItem: 'All Bookmarks',
          authorFilter: '',
          domainFilter: '',
          contentTypeFilter: '',
          dateRangeFilter: { type: 'all' as const },
          quickFilters: ['archived']
        }
        return selector(state as any)
      })

      const { result } = renderHook(() => useFilteredBookmarksOptimized())

      expect(result.current).toHaveLength(1)
      expect(result.current[0].is_archived).toBe(true)
    })
  })

  describe('Tag Filters', () => {
    it('should filter bookmarks by selected tags', () => {
      mockUseBookmarkStore.mockImplementation((selector) => {
        const state = {
          bookmarks: mockBookmarks,
          selectedTags: ['X'],
          searchQuery: '',
          activeTab: 0,
          activeSidebarItem: 'All Bookmarks',
          authorFilter: '',
          domainFilter: '',
          contentTypeFilter: '',
          dateRangeFilter: { type: 'all' as const },
          quickFilters: []
        }
        return selector(state as any)
      })

      const { result } = renderHook(() => useFilteredBookmarksOptimized())

      expect(result.current).toHaveLength(2) // Both bookmark 1 and 2 have 'X' tag
      expect(result.current.every(bookmark => bookmark.tags.includes('X'))).toBe(true)
    })
  })
})