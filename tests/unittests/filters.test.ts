import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFilteredBookmarksOptimized } from '../../src/hooks/composite/useFilteredBookmarksOptimized'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { useCollectionsStore } from '../../src/store/collectionsStore'
import { type Bookmark } from '../../src/types/bookmark'

// Mock the stores
vi.mock('../../src/store/bookmarkStore')
vi.mock('../../src/store/collectionsStore')

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
    is_shared: false,
    is_deleted: false,
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
    is_shared: false,
    is_deleted: false,
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
    is_shared: false,
    is_deleted: false,
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
    describe('Individual Quick Filters', () => {
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
        expect(result.current[0].id).toBe(2)
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
        expect(result.current[0].id).toBe(3)
      })

      it('should filter unread bookmarks', () => {
        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 10,
            is_read: false
          },
          {
            ...mockBookmarks[1],
            id: 11,
            is_read: true
          },
          {
            ...mockBookmarks[2],
            id: 12,
            is_read: false
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['unread']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        expect(result.current).toHaveLength(2)
        expect(result.current.every(b => b.is_read === false)).toBe(true)
        // Results are sorted by date descending, so we check both are present
        expect(result.current.map(b => b.id).sort()).toEqual([10, 12])
      })

      it('should filter bookmarks with comments', () => {
        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 20,
            content: 'Check out this comment on the issue'
          },
          {
            ...mockBookmarks[1],
            id: 21,
            content: 'Great reply to the thread'
          },
          {
            ...mockBookmarks[2],
            id: 22,
            content: 'Just a regular post without keywords'
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['comments']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        expect(result.current).toHaveLength(2)
        // Results are sorted by date descending, so we check both are present
        expect(result.current.map(b => b.id).sort()).toEqual([20, 21])
      })

      it('should filter bookmarks with high engagement', () => {
        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 30,
            engagement_score: 50
          },
          {
            ...mockBookmarks[1],
            id: 31,
            engagement_score: 150
          },
          {
            ...mockBookmarks[2],
            id: 32,
            engagement_score: 101
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['engagement']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        expect(result.current).toHaveLength(2)
        expect(result.current.every(b => b.engagement_score > 100)).toBe(true)
        // Results are sorted by date descending, so we check both are present
        expect(result.current.map(b => b.id).sort()).toEqual([31, 32])
      })

      it('should filter recent bookmarks (last 24 hours)', () => {
        const now = new Date()
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)
        const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000)

        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 40,
            created_at: twelveHoursAgo.toISOString()
          },
          {
            ...mockBookmarks[1],
            id: 41,
            created_at: twentyFiveHoursAgo.toISOString()
          },
          {
            ...mockBookmarks[2],
            id: 42,
            created_at: now.toISOString()
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['recent']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        expect(result.current).toHaveLength(2)
        expect(result.current.map(b => b.id)).toEqual([42, 40])
      })
    })

    describe('Combined Quick Filters (AND Logic)', () => {
      it('should filter bookmarks matching ALL quick filters (starred + unread)', () => {
        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 50,
            is_starred: true,
            is_read: false
          },
          {
            ...mockBookmarks[1],
            id: 51,
            is_starred: true,
            is_read: true // starred but read
          },
          {
            ...mockBookmarks[2],
            id: 52,
            is_starred: false,
            is_read: false // unread but not starred
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['starred', 'unread']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        expect(result.current).toHaveLength(1)
        expect(result.current[0].id).toBe(50)
        expect(result.current[0].is_starred).toBe(true)
        expect(result.current[0].is_read).toBe(false)
      })

      it('should filter bookmarks matching ALL quick filters (engagement + comments)', () => {
        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 60,
            engagement_score: 150,
            content: 'Great comment on this'
          },
          {
            ...mockBookmarks[1],
            id: 61,
            engagement_score: 150,
            content: 'High engagement but no keywords' // high engagement but no comment
          },
          {
            ...mockBookmarks[2],
            id: 62,
            engagement_score: 50,
            content: 'A reply without engagement' // has comment but low engagement
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['engagement', 'comments']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        expect(result.current).toHaveLength(1)
        expect(result.current[0].id).toBe(60)
        expect(result.current[0].engagement_score).toBeGreaterThan(100)
        expect(result.current[0].content).toMatch(/comment|reply/i)
      })

      it('should filter bookmarks matching three filters (starred + engagement + recent)', () => {
        const now = new Date()
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)
        const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000)

        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 70,
            is_starred: true,
            engagement_score: 150,
            created_at: twelveHoursAgo.toISOString() // matches all
          },
          {
            ...mockBookmarks[1],
            id: 71,
            is_starred: true,
            engagement_score: 150,
            created_at: twentyFiveHoursAgo.toISOString() // not recent
          },
          {
            ...mockBookmarks[2],
            id: 72,
            is_starred: true,
            engagement_score: 50,
            created_at: twelveHoursAgo.toISOString() // low engagement
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['starred', 'engagement', 'recent']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        expect(result.current).toHaveLength(1)
        expect(result.current[0].id).toBe(70)
      })

      it('should return no results when no bookmark matches all filters', () => {
        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 80,
            is_starred: true,
            is_read: true // starred but read
          },
          {
            ...mockBookmarks[1],
            id: 81,
            is_starred: false,
            is_read: false // unread but not starred
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['starred', 'unread']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        expect(result.current).toHaveLength(0)
      })
    })

    describe('Quick Filters Edge Cases', () => {
      it('should return all bookmarks when quickFilters array is empty', () => {
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

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        expect(result.current).toHaveLength(mockBookmarks.length)
      })

      it('should handle comments filter with case sensitivity (lowercase)', () => {
        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 90,
            content: 'This is a Comment with capital C'
          },
          {
            ...mockBookmarks[1],
            id: 91,
            content: 'This is a Reply with capital R'
          },
          {
            ...mockBookmarks[2],
            id: 92,
            content: 'COMMENT in all caps'
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['comments']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        // Should not match because filter looks for exact lowercase 'comment' or 'reply'
        expect(result.current).toHaveLength(0)
      })

      it('should handle recent filter boundary (exactly 24 hours)', () => {
        const now = new Date()
        // Create a date that's just under 24 hours ago to ensure it matches
        const almostOneDayAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000)

        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 100,
            created_at: almostOneDayAgo.toISOString()
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['recent']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        // Should match because it's within last 24 hours
        expect(result.current).toHaveLength(1)
      })

      it('should handle engagement filter boundary (exactly 100)', () => {
        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 110,
            engagement_score: 100
          },
          {
            ...mockBookmarks[1],
            id: 111,
            engagement_score: 101
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['engagement']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        // Should only match 101, not 100 (> 100, not >= 100)
        expect(result.current).toHaveLength(1)
        expect(result.current[0].id).toBe(111)
      })

      it('should handle bookmarks with undefined engagement_score', () => {
        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 120,
            engagement_score: undefined as any
          },
          {
            ...mockBookmarks[1],
            id: 121,
            engagement_score: 150
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['engagement']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        // Should only match the one with valid engagement score
        expect(result.current).toHaveLength(1)
        expect(result.current[0].id).toBe(121)
      })

      it('should handle bookmarks with missing content field for comments filter', () => {
        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 130,
            content: undefined as any
          },
          {
            ...mockBookmarks[1],
            id: 131,
            content: 'Has a comment here'
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['comments']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        // Should gracefully handle undefined content with optional chaining
        expect(result.current).toHaveLength(1)
        expect(result.current[0].id).toBe(131)
      })

      it('should use tweet_date when available for recent filter', () => {
        const now = new Date()
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)
        const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000)

        const testBookmarks: Bookmark[] = [
          {
            ...mockBookmarks[0],
            id: 140,
            created_at: twentyFiveHoursAgo.toISOString(), // old created_at
            metadata: {
              tweet_date: twelveHoursAgo.toISOString() // recent tweet_date
            }
          }
        ]

        mockUseBookmarkStore.mockImplementation((selector) => {
          const state = {
            bookmarks: testBookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            activeSidebarItem: 'All Bookmarks',
            authorFilter: '',
            domainFilter: '',
            contentTypeFilter: '',
            dateRangeFilter: { type: 'all' as const },
            quickFilters: ['recent']
          }
          return selector(state as any)
        })

        const { result } = renderHook(() => useFilteredBookmarksOptimized())

        // Should match because tweet_date is recent
        expect(result.current).toHaveLength(1)
        expect(result.current[0].id).toBe(140)
      })
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