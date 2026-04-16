import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useViewStore } from '../../src/store/viewStore'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { filterBookmarksOptimized } from '../../src/utils/bookmarkFilteringOptimized'
import { SYSTEM_VIEWS } from '../../src/types/views'
import type { Bookmark } from '../../src/types/bookmark'

const mockBookmarks: Bookmark[] = [
  {
    id: 1,
    user_id: 'local',
    title: 'Test Article',
    url: 'https://example.com/article',
    description: 'desc',
    content: 'This is a test article about technology.',
    author: 'John Doe',
    domain: 'example.com',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    source_platform: 'manual',
    is_starred: false,
    is_read: false,
    is_archived: false,
    is_shared: false,
    is_deleted: false,
    tags: ['tech'],
    thumbnail_url: '',
    favicon_url: '',
    engagement_score: 75,
    collections: [],
  },
  {
    id: 2,
    user_id: 'local',
    title: 'X Tweet Post',
    url: 'https://x.com/user/status/123',
    description: 'desc',
    content: 'Breaking news about Bitcoin price surge!',
    author: 'The Kobeissi Letter',
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
    collections: [],
  },
  {
    id: 3,
    user_id: 'local',
    title: 'GitHub Repository',
    url: 'https://github.com/user/repo',
    description: 'desc',
    content: 'Open source project for developers.',
    author: 'GitHub User',
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
    collections: [],
  },
]

describe('View ↔ Filter Sync', () => {
  beforeEach(() => {
    // Reset both stores to clean state
    localStorage.clear()
    useViewStore.setState({
      views: [],
      activeViewId: SYSTEM_VIEWS.ALL,
      expandedViews: [],
      viewFilter: 'all',
      isLoading: false,
      error: null,
    })
    useViewStore.getState().loadViews()

    useBookmarkStore.setState({
      bookmarks: mockBookmarks,
      selectedTags: [],
      searchQuery: '',
      authorFilter: '',
      domainFilter: '',
      contentTypeFilter: '',
      dateRangeFilter: { type: 'all' },
      quickFilters: [],
      activeTab: 0,
    })
  })

  function getFilteredResult() {
    const bm = useBookmarkStore.getState()
    const vs = useViewStore.getState()
    return filterBookmarksOptimized({
      bookmarks: bm.bookmarks,
      selectedTags: bm.selectedTags,
      searchQuery: bm.searchQuery,
      activeTab: bm.activeTab,
      authorFilter: bm.authorFilter,
      domainFilter: bm.domainFilter,
      contentTypeFilter: bm.contentTypeFilter,
      dateRangeFilter: bm.dateRangeFilter,
      quickFilters: bm.quickFilters,
      validationResults: bm.validationResults,
      sortBy: 'date',
      sortOrder: 'desc',
      activeViewId: vs.activeViewId,
      views: vs.views,
    })
  }

  describe('setActiveView clears filters', () => {
    it('should clear author filter when switching views', () => {
      const bm = useBookmarkStore.getState()
      bm.setAuthorFilter('John Doe')

      expect(useBookmarkStore.getState().authorFilter).toBe('John Doe')

      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)

      expect(useBookmarkStore.getState().authorFilter).toBe('')
    })

    it('should clear domain filter when switching views', () => {
      const bm = useBookmarkStore.getState()
      bm.setDomainFilter('example.com')

      expect(useBookmarkStore.getState().domainFilter).toBe('example.com')

      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)

      expect(useBookmarkStore.getState().domainFilter).toBe('')
    })

    it('should clear tags when switching views', () => {
      const bm = useBookmarkStore.getState()
      bm.setSelectedTags(['tech'])

      expect(useBookmarkStore.getState().selectedTags).toEqual(['tech'])

      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)

      expect(useBookmarkStore.getState().selectedTags).toEqual([])
    })

    it('should clear quick filters when switching views', () => {
      useBookmarkStore.setState({ quickFilters: ['starred', 'unread'] })

      expect(useBookmarkStore.getState().quickFilters).toEqual(['starred', 'unread'])

      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)

      expect(useBookmarkStore.getState().quickFilters).toEqual([])
    })

    it('should clear search query when switching views', () => {
      const bm = useBookmarkStore.getState()
      bm.setSearchQuery('bitcoin')

      expect(useBookmarkStore.getState().searchQuery).toBe('bitcoin')

      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)

      expect(useBookmarkStore.getState().searchQuery).toBe('')
    })

    it('should clear ALL filters at once when switching views', () => {
      const bm = useBookmarkStore.getState()
      bm.setAuthorFilter('John Doe')
      bm.setDomainFilter('example.com')
      bm.setSelectedTags(['tech'])
      bm.setSearchQuery('test')
      useBookmarkStore.setState({ quickFilters: ['starred'] })

      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)

      const state = useBookmarkStore.getState()
      expect(state.authorFilter).toBe('')
      expect(state.domainFilter).toBe('')
      expect(state.selectedTags).toEqual([])
      expect(state.searchQuery).toBe('')
      expect(state.quickFilters).toEqual([])
      expect(state.contentTypeFilter).toBe('')
      expect(state.dateRangeFilter).toEqual({ type: 'all' })
    })
  })

  describe('setActiveView populates filters from view criteria', () => {
    it('should populate author filter from dynamic view criteria', () => {
      const viewId = useViewStore.getState().createView({
        name: 'Johns Bookmarks',
        mode: 'dynamic',
        criteria: { authors: ['John Doe'] },
      })!

      useViewStore.getState().setActiveView(viewId)

      expect(useBookmarkStore.getState().authorFilter).toBe('John Doe')
    })

    it('should populate domain filter from dynamic view criteria', () => {
      const viewId = useViewStore.getState().createView({
        name: 'X Posts',
        mode: 'dynamic',
        criteria: { domains: ['x.com'] },
      })!

      useViewStore.getState().setActiveView(viewId)

      expect(useBookmarkStore.getState().domainFilter).toBe('x.com')
    })

    it('should populate both author and domain from view criteria', () => {
      const viewId = useViewStore.getState().createView({
        name: 'John on Example',
        mode: 'dynamic',
        criteria: { authors: ['John Doe'], domains: ['example.com'] },
      })!

      useViewStore.getState().setActiveView(viewId)

      const state = useBookmarkStore.getState()
      expect(state.authorFilter).toBe('John Doe')
      expect(state.domainFilter).toBe('example.com')
    })

    it('should populate tags from view criteria', () => {
      const viewId = useViewStore.getState().createView({
        name: 'Tech Tags',
        mode: 'dynamic',
        criteria: { tags: ['tech', 'X'] },
      })!

      useViewStore.getState().setActiveView(viewId)

      expect(useBookmarkStore.getState().selectedTags).toEqual(['tech', 'X'])
    })
  })

  describe('Save as View → filter result count', () => {
    it('dynamic view with author filter shows correct count', () => {
      const viewId = useViewStore.getState().createView({
        name: 'NonExistent Author',
        mode: 'dynamic',
        criteria: { authors: ['Nobody Matches This'] },
      })!

      useViewStore.getState().setActiveView(viewId)

      const result = getFilteredResult()
      expect(result).toHaveLength(0)
    })

    it('dynamic view with domain filter shows correct count', () => {
      const viewId = useViewStore.getState().createView({
        name: 'NonExistent Domain',
        mode: 'dynamic',
        criteria: { domains: ['nonexistent.com'] },
      })!

      useViewStore.getState().setActiveView(viewId)

      const result = getFilteredResult()
      expect(result).toHaveLength(0)
    })

    it('dynamic view with author+domain combo shows correct count', () => {
      // Author exists but on wrong domain — should be 0
      const viewId = useViewStore.getState().createView({
        name: 'John on X.com',
        mode: 'dynamic',
        criteria: { authors: ['John Doe'], domains: ['x.com'] },
      })!

      useViewStore.getState().setActiveView(viewId)

      const result = getFilteredResult()
      expect(result).toHaveLength(0)
    })

    it('dynamic view with matching author+domain shows correct count', () => {
      const viewId = useViewStore.getState().createView({
        name: 'John on example.com',
        mode: 'dynamic',
        criteria: { authors: ['John Doe'], domains: ['example.com'] },
      })!

      useViewStore.getState().setActiveView(viewId)

      const result = getFilteredResult()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('switching from filtered view to All Bookmarks shows all', () => {
      const viewId = useViewStore.getState().createView({
        name: 'X Only',
        mode: 'dynamic',
        criteria: { domains: ['x.com'] },
      })!

      useViewStore.getState().setActiveView(viewId)
      expect(getFilteredResult()).toHaveLength(1)

      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)
      expect(getFilteredResult()).toHaveLength(3)
    })

    it('switching views clears previous view filters completely', () => {
      // Create two views with different criteria
      const viewA = useViewStore.getState().createView({
        name: 'View A',
        mode: 'dynamic',
        criteria: { authors: ['John Doe'], domains: ['example.com'] },
      })!
      const viewB = useViewStore.getState().createView({
        name: 'View B',
        mode: 'dynamic',
        criteria: { tags: ['dev'] },
      })!

      // Activate view A
      useViewStore.getState().setActiveView(viewA)
      expect(useBookmarkStore.getState().authorFilter).toBe('John Doe')
      expect(useBookmarkStore.getState().domainFilter).toBe('example.com')
      expect(useBookmarkStore.getState().selectedTags).toEqual([])

      // Switch to view B — A's filters should be gone
      useViewStore.getState().setActiveView(viewB)
      const state = useBookmarkStore.getState()
      expect(state.authorFilter).toBe('')
      expect(state.domainFilter).toBe('')
      expect(state.selectedTags).toEqual(['dev'])
    })
  })

  describe('filter pipeline: view criteria + manual filters', () => {
    it('view filter AND manual tag filter both apply', () => {
      const viewId = useViewStore.getState().createView({
        name: 'Johns Bookmarks',
        mode: 'dynamic',
        criteria: { authors: ['John Doe'] },
      })!

      useViewStore.getState().setActiveView(viewId)

      // View criteria gives author=John Doe (1 match: bookmark 1)
      // Now additionally filter by tag that doesn't match
      useBookmarkStore.getState().setSelectedTags(['nonexistent'])

      const result = getFilteredResult()
      expect(result).toHaveLength(0)
    })

    it('All Bookmarks with manual filters only', () => {
      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)
      useBookmarkStore.getState().setAuthorFilter('Kobeissi')

      const result = getFilteredResult()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(2)
    })
  })

  describe('date range save and restore', () => {
    it('saves preset date range (today) in criteria and restores on activate', () => {
      useBookmarkStore.getState().setDateRangeFilter({ type: 'today' })

      const viewId = useViewStore.getState().createView({
        name: 'Today View',
        mode: 'dynamic',
        criteria: {
          dateRange: { preset: 'today' },
        },
      })!

      useViewStore.getState().setActiveView(viewId)

      expect(useBookmarkStore.getState().dateRangeFilter.type).toBe('today')
    })

    it('saves preset date range (week) in criteria and restores on activate', () => {
      const viewId = useViewStore.getState().createView({
        name: 'Week View',
        mode: 'dynamic',
        criteria: {
          dateRange: { preset: 'week' },
        },
      })!

      useViewStore.getState().setActiveView(viewId)

      expect(useBookmarkStore.getState().dateRangeFilter.type).toBe('week')
    })

    it('saves custom date range with ISO strings and restores as Date objects', () => {
      const start = '2024-01-01T00:00:00.000Z'
      const end = '2024-01-31T23:59:59.999Z'

      const viewId = useViewStore.getState().createView({
        name: 'Custom Range View',
        mode: 'dynamic',
        criteria: {
          dateRange: { start, end },
        },
      })!

      useViewStore.getState().setActiveView(viewId)

      const filter = useBookmarkStore.getState().dateRangeFilter
      expect(filter.type).toBe('custom')
      expect(filter.customStart).toBeInstanceOf(Date)
      expect(filter.customStart!.toISOString()).toBe(start)
      expect(filter.customEnd).toBeInstanceOf(Date)
      expect(filter.customEnd!.toISOString()).toBe(end)
    })

    it('clears date range when switching to view without date criteria', () => {
      useBookmarkStore.getState().setDateRangeFilter({ type: 'today' })

      const viewId = useViewStore.getState().createView({
        name: 'No Date View',
        mode: 'dynamic',
        criteria: { authors: ['John Doe'] },
      })!

      useViewStore.getState().setActiveView(viewId)

      expect(useBookmarkStore.getState().dateRangeFilter.type).toBe('all')
    })

    it('date range filter produces correct filtered count', () => {
      const viewId = useViewStore.getState().createView({
        name: 'Custom Range View',
        mode: 'dynamic',
        criteria: {
          dateRange: {
            start: '2024-01-01T23:00:00.000Z',
            end: '2024-01-02T23:00:00.000Z',
          },
        },
      })!

      useViewStore.getState().setActiveView(viewId)

      const result = getFilteredResult()
      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result.some((b) => b.id === 2)).toBe(true)
    })
  })

  describe('full save-as-view flow', () => {
    it('domain-only view shows matching bookmark', () => {
      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)
      useBookmarkStore.getState().setDomainFilter('example.com')

      const viewId = useViewStore.getState().createView({
        name: 'Example Only',
        mode: 'dynamic',
        criteria: { domains: ['example.com'] },
      })!

      useViewStore.getState().setActiveView(viewId)

      expect(useBookmarkStore.getState().domainFilter).toBe('example.com')
      const result = getFilteredResult()
      expect(result).toHaveLength(1)
      expect(result[0].domain).toBe('example.com')
    })

    it('simulates full user flow: set filter → save as view → switch away → back', () => {
      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)

      useBookmarkStore.getState().setDomainFilter('x.com')

      const viewId = useViewStore.getState().createView({
        name: 'X Posts',
        mode: 'dynamic',
        criteria: { domains: ['x.com'] },
      })!

      useViewStore.getState().setActiveView(viewId)
      expect(getFilteredResult()).toHaveLength(1)

      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)
      expect(getFilteredResult()).toHaveLength(3)

      useViewStore.getState().setActiveView(viewId)
      expect(getFilteredResult()).toHaveLength(1)
    })
  })
})
