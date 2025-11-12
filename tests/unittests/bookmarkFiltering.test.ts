import { describe, it, expect } from 'vitest'
import {
  filterBookmarksOptimized as filterBookmarks,
  type FilterParams,
} from '../../src/utils/bookmarkFilteringOptimized'
import type { Bookmark } from '../../src/types/bookmark'
import type { DateRangeFilter } from '../../src/store/bookmarkStore'

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

const createDefaultParams = (
  overrides: Partial<FilterParams> = {}
): FilterParams => ({
  bookmarks: [],
  selectedTags: [],
  searchQuery: '',
  activeTab: 0,
  activeSidebarItem: 'All Bookmarks',
  authorFilter: '',
  domainFilter: '',
  contentTypeFilter: '',
  dateRangeFilter: { type: 'all' },
  quickFilters: [],
  activeCollectionId: null,
  collectionBookmarks: {},
  ...overrides,
})

describe('bookmarkFiltering', () => {
  describe('deleted bookmarks filter', () => {
    it('should filter out deleted bookmarks', () => {
      const now = new Date()
      const earlier = new Date(now.getTime() - 1000)

      const bookmarks = [
        createTestBookmark({
          id: 1,
          is_deleted: false,
          created_at: earlier.toISOString(),
        }),
        createTestBookmark({
          id: 2,
          is_deleted: true,
          created_at: now.toISOString(),
        }),
        createTestBookmark({
          id: 3,
          is_deleted: false,
          created_at: now.toISOString(),
        }),
      ]

      const result = filterBookmarks(createDefaultParams({ bookmarks }))

      expect(result).toHaveLength(2)
      expect(result.map((b) => b.id)).toEqual([3, 1]) // Sorted by date descending
    })
  })

  describe('sidebar item filter', () => {
    it('should show all bookmarks for "All Bookmarks" sidebar item', () => {
      const bookmarks = [
        createTestBookmark({ id: 1 }),
        createTestBookmark({ id: 2 }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          activeSidebarItem: 'All Bookmarks',
        })
      )

      expect(result).toHaveLength(2)
    })

    it('should filter by collection when "Collections" is active', () => {
      const bookmarks = [
        createTestBookmark({ id: 1 }),
        createTestBookmark({ id: 2 }),
        createTestBookmark({ id: 3 }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          activeSidebarItem: 'Collections',
          activeCollectionId: 'my-collection',
          collectionBookmarks: { 'my-collection': [1, 3] },
        })
      )

      expect(result).toHaveLength(2)
      expect(result.map((b) => b.id).sort()).toEqual([1, 3])
    })

    it('should handle missing collection gracefully', () => {
      const bookmarks = [createTestBookmark({ id: 1 })]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          activeSidebarItem: 'Collections',
          activeCollectionId: 'non-existent',
          collectionBookmarks: {},
        })
      )

      expect(result).toHaveLength(0)
    })
  })

  describe('tag filter', () => {
    it('should filter by single tag', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, tags: ['react', 'javascript'] }),
        createTestBookmark({ id: 2, tags: ['python'] }),
        createTestBookmark({ id: 3, tags: ['react', 'typescript'] }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          selectedTags: ['react'],
        })
      )

      expect(result).toHaveLength(2)
      expect(result.map((b) => b.id).sort()).toEqual([1, 3])
    })

    it('should filter by multiple tags (OR logic)', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, tags: ['react'] }),
        createTestBookmark({ id: 2, tags: ['python'] }),
        createTestBookmark({ id: 3, tags: ['javascript'] }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          selectedTags: ['react', 'python'],
        })
      )

      expect(result).toHaveLength(2)
      expect(result.map((b) => b.id).sort()).toEqual([1, 2])
    })

    it('should handle empty tags array', () => {
      const bookmarks = [createTestBookmark({ id: 1, tags: [] })]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          selectedTags: ['react'],
        })
      )

      expect(result).toHaveLength(0)
    })
  })

  describe('active tab filter', () => {
    it('should show all bookmarks for tab 0', () => {
      const bookmarks = [
        createTestBookmark({ id: 1 }),
        createTestBookmark({ id: 2 }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          activeTab: 0,
        })
      )

      expect(result).toHaveLength(2)
    })

    it('should filter today bookmarks for tab 1', () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const bookmarks = [
        createTestBookmark({ id: 1, created_at: today.toISOString() }),
        createTestBookmark({ id: 2, created_at: yesterday.toISOString() }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          activeTab: 1,
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter this week bookmarks for tab 2', () => {
      const today = new Date()
      const tenDaysAgo = new Date(today)
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
      const fiveDaysAgo = new Date(today)
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

      const bookmarks = [
        createTestBookmark({ id: 1, created_at: fiveDaysAgo.toISOString() }),
        createTestBookmark({ id: 2, created_at: tenDaysAgo.toISOString() }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          activeTab: 2,
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter threads for tab 3', () => {
      const bookmarks = [
        createTestBookmark({
          id: 1,
          content: 'Short content',
          domain: 'example.com',
        }),
        createTestBookmark({
          id: 2,
          content: 'A'.repeat(300),
          domain: 'example.com',
        }),
        createTestBookmark({ id: 3, content: 'Short', domain: 'x.com' }),
        createTestBookmark({ id: 4, content: 'Short', domain: 'twitter.com' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          activeTab: 3,
        })
      )

      expect(result).toHaveLength(3)
      expect(result.map((b) => b.id).sort()).toEqual([2, 3, 4])
    })

    it('should filter media for tab 4', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, url: 'https://example.com/page' }),
        createTestBookmark({
          id: 2,
          url: 'https://youtube.com/watch?v=123',
          thumbnail_url: 'thumb.jpg',
        }),
        createTestBookmark({ id: 3, url: 'https://example.com/image.jpg' }),
        createTestBookmark({ id: 4, url: 'https://vimeo.com/123456' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          activeTab: 4,
        })
      )

      expect(result).toHaveLength(3)
      expect(result.map((b) => b.id).sort()).toEqual([2, 3, 4])
    })
  })

  describe('search query filter', () => {
    it('should filter by title', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, title: 'React Tutorial' }),
        createTestBookmark({ id: 2, title: 'Python Guide' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          searchQuery: 'React',
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should be case insensitive', () => {
      const bookmarks = [createTestBookmark({ id: 1, title: 'React Tutorial' })]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          searchQuery: 'react',
        })
      )

      expect(result).toHaveLength(1)
    })

    it('should filter by content', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, content: 'Learn React hooks' }),
        createTestBookmark({ id: 2, content: 'Python basics' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          searchQuery: 'hooks',
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter by author', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, author: 'John Doe' }),
        createTestBookmark({ id: 2, author: 'Jane Smith' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          searchQuery: 'John',
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter by domain', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, domain: 'github.com' }),
        createTestBookmark({ id: 2, domain: 'example.com' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          searchQuery: 'github',
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter by tags', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, tags: ['react', 'javascript'] }),
        createTestBookmark({ id: 2, tags: ['python'] }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          searchQuery: 'javascript',
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should handle empty search query', () => {
      const bookmarks = [
        createTestBookmark({ id: 1 }),
        createTestBookmark({ id: 2 }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          searchQuery: '   ',
        })
      )

      expect(result).toHaveLength(2)
    })
  })

  describe('author filter', () => {
    it('should filter by author', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, author: 'John Doe' }),
        createTestBookmark({ id: 2, author: 'Jane Smith' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          authorFilter: 'John',
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should be case insensitive', () => {
      const bookmarks = [createTestBookmark({ id: 1, author: 'John Doe' })]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          authorFilter: 'JOHN',
        })
      )

      expect(result).toHaveLength(1)
    })
  })

  describe('domain filter', () => {
    it('should filter by domain', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, domain: 'github.com' }),
        createTestBookmark({ id: 2, domain: 'example.com' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          domainFilter: 'github',
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })
  })

  describe('content type filter', () => {
    it('should filter articles', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, content: 'A'.repeat(600) }),
        createTestBookmark({ id: 2, content: 'Short' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          contentTypeFilter: 'article',
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter tweets', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, domain: 'x.com' }),
        createTestBookmark({ id: 2, domain: 'twitter.com' }),
        createTestBookmark({ id: 3, domain: 'example.com' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          contentTypeFilter: 'tweet',
        })
      )

      expect(result).toHaveLength(2)
      expect(result.map((b) => b.id).sort()).toEqual([1, 2])
    })

    it('should filter videos', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, url: 'https://youtube.com/watch' }),
        createTestBookmark({ id: 2, url: 'https://vimeo.com/123' }),
        createTestBookmark({ id: 3, url: 'https://example.com' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          contentTypeFilter: 'video',
        })
      )

      expect(result).toHaveLength(2)
      expect(result.map((b) => b.id).sort()).toEqual([1, 2])
    })
  })

  describe('date range filter', () => {
    it('should filter by today', () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const bookmarks = [
        createTestBookmark({ id: 1, created_at: today.toISOString() }),
        createTestBookmark({ id: 2, created_at: yesterday.toISOString() }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          dateRangeFilter: { type: 'today' },
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter by week', () => {
      const today = new Date()
      const fiveDaysAgo = new Date(today)
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
      const tenDaysAgo = new Date(today)
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

      const bookmarks = [
        createTestBookmark({ id: 1, created_at: fiveDaysAgo.toISOString() }),
        createTestBookmark({ id: 2, created_at: tenDaysAgo.toISOString() }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          dateRangeFilter: { type: 'week' },
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter by month', () => {
      const today = new Date()
      const fifteenDaysAgo = new Date(today)
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
      const fortyDaysAgo = new Date(today)
      fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40)

      const bookmarks = [
        createTestBookmark({ id: 1, created_at: fifteenDaysAgo.toISOString() }),
        createTestBookmark({ id: 2, created_at: fortyDaysAgo.toISOString() }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          dateRangeFilter: { type: 'month' },
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter by custom date range', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, created_at: '2024-01-15T00:00:00.000Z' }),
        createTestBookmark({ id: 2, created_at: '2024-01-05T00:00:00.000Z' }),
        createTestBookmark({ id: 3, created_at: '2024-01-25T00:00:00.000Z' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          dateRangeFilter: {
            type: 'custom',
            customStart: new Date('2024-01-10'),
            customEnd: new Date('2024-01-20'),
          },
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should handle custom range without end date', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, created_at: '2024-01-15T00:00:00.000Z' }),
        createTestBookmark({ id: 2, created_at: '2024-01-05T00:00:00.000Z' }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          dateRangeFilter: {
            type: 'custom',
            customStart: new Date('2024-01-10'),
          },
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })
  })

  describe('quick filters', () => {
    it('should filter starred bookmarks', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, is_starred: true }),
        createTestBookmark({ id: 2, is_starred: false }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          quickFilters: ['starred'],
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter unread bookmarks', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, is_read: false }),
        createTestBookmark({ id: 2, is_read: true }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          quickFilters: ['unread'],
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter archived bookmarks', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, is_archived: true }),
        createTestBookmark({ id: 2, is_archived: false }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          quickFilters: ['archived'],
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter by engagement', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, engagement_score: 150 }),
        createTestBookmark({ id: 2, engagement_score: 50 }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          quickFilters: ['engagement'],
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should filter recent bookmarks', () => {
      const now = new Date()
      const twoDaysAgo = new Date(now)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      const bookmarks = [
        createTestBookmark({ id: 1, created_at: now.toISOString() }),
        createTestBookmark({ id: 2, created_at: twoDaysAgo.toISOString() }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          quickFilters: ['recent'],
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should apply multiple quick filters with AND logic', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, is_starred: true, is_read: false }),
        createTestBookmark({ id: 2, is_starred: true, is_read: true }),
        createTestBookmark({ id: 3, is_starred: false, is_read: false }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          quickFilters: ['starred', 'unread'],
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })
  })

  describe('sorting', () => {
    it('should sort by date descending (newest first)', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, created_at: '2024-01-15T00:00:00.000Z' }),
        createTestBookmark({ id: 2, created_at: '2024-01-20T00:00:00.000Z' }),
        createTestBookmark({ id: 3, created_at: '2024-01-10T00:00:00.000Z' }),
      ]

      const result = filterBookmarks(createDefaultParams({ bookmarks }))

      expect(result.map((b) => b.id)).toEqual([2, 1, 3])
    })

    it('should use tweet_date from metadata when available', () => {
      const bookmarks = [
        createTestBookmark({
          id: 1,
          created_at: '2024-01-10T00:00:00.000Z',
          metadata: {
            platform: 'x.com' as const,
            tweet_date: '2024-01-20T00:00:00.000Z',
            extracted_at: '2024-01-20T00:00:00.000Z',
            username: 'testuser',
            display_name: 'Test User',
            has_video: false,
          },
        }),
        createTestBookmark({ id: 2, created_at: '2024-01-15T00:00:00.000Z' }),
      ]

      const result = filterBookmarks(createDefaultParams({ bookmarks }))

      expect(result.map((b) => b.id)).toEqual([1, 2]) // id:1 has newer tweet_date
    })
  })

  describe('combined filters', () => {
    it('should apply all filters together', () => {
      const today = new Date()
      const bookmarks = [
        createTestBookmark({
          id: 1,
          title: 'React Tutorial',
          tags: ['react'],
          author: 'John Doe',
          domain: 'example.com',
          is_starred: true,
          created_at: today.toISOString(),
        }),
        createTestBookmark({
          id: 2,
          title: 'Python Guide',
          tags: ['python'],
          author: 'Jane Smith',
          domain: 'test.com',
          is_starred: false,
          created_at: today.toISOString(),
        }),
      ]

      const result = filterBookmarks(
        createDefaultParams({
          bookmarks,
          selectedTags: ['react'],
          searchQuery: 'Tutorial',
          authorFilter: 'John',
          domainFilter: 'example',
          quickFilters: ['starred'],
        })
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })
  })
})
