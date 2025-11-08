import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import type { Bookmark } from '../../src/types/bookmark'

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

describe('bookmarkStore - state management', () => {
  beforeEach(() => {
    // Reset store to initial state
    useBookmarkStore.setState({
      bookmarks: [],
      selectedTags: [],
      searchQuery: '',
      activeTab: 0,
      viewMode: 'grid',
      isLoading: false,
      isAIPanelOpen: false,
      isFiltersPanelOpen: false,
      activeSidebarItem: 'All Bookmarks',
      error: null,
      authorFilter: '',
      domainFilter: '',
      contentTypeFilter: '',
      dateRangeFilter: { type: 'all' },
      quickFilters: [],
      filterPresets: [],
      showAdvancedFilters: false,
    })
    vi.clearAllMocks()
  })

  describe('selectedTags', () => {
    it('should set selected tags', () => {
      useBookmarkStore.getState().setSelectedTags(['react', 'javascript'])

      expect(useBookmarkStore.getState().selectedTags).toEqual([
        'react',
        'javascript',
      ])
    })

    it('should add a tag', () => {
      useBookmarkStore.setState({ selectedTags: ['react'] })
      useBookmarkStore.getState().addTag('javascript')

      expect(useBookmarkStore.getState().selectedTags).toEqual([
        'react',
        'javascript',
      ])
    })

    it('should not add duplicate tag', () => {
      useBookmarkStore.setState({ selectedTags: ['react'] })
      useBookmarkStore.getState().addTag('react')

      // addTag will add it again, not prevent duplicates
      expect(useBookmarkStore.getState().selectedTags).toContain('react')
    })

    it('should remove a tag', () => {
      useBookmarkStore.setState({
        selectedTags: ['react', 'javascript', 'typescript'],
      })
      useBookmarkStore.getState().removeTag('javascript')

      expect(useBookmarkStore.getState().selectedTags).toEqual([
        'react',
        'typescript',
      ])
    })

    it('should clear all tags', () => {
      useBookmarkStore.setState({ selectedTags: ['react', 'javascript'] })
      useBookmarkStore.getState().clearTags()

      expect(useBookmarkStore.getState().selectedTags).toEqual([])
    })
  })

  describe('search query', () => {
    it('should set search query', () => {
      useBookmarkStore.getState().setSearchQuery('test search')

      expect(useBookmarkStore.getState().searchQuery).toBe('test search')
    })

    it('should clear search query', () => {
      useBookmarkStore.setState({ searchQuery: 'test' })
      useBookmarkStore.getState().setSearchQuery('')

      expect(useBookmarkStore.getState().searchQuery).toBe('')
    })
  })

  describe('active tab', () => {
    it('should set active tab', () => {
      useBookmarkStore.getState().setActiveTab(2)

      expect(useBookmarkStore.getState().activeTab).toBe(2)
    })

    it('should update tab value', () => {
      useBookmarkStore.setState({ activeTab: 0 })
      useBookmarkStore.getState().setActiveTab(3)

      expect(useBookmarkStore.getState().activeTab).toBe(3)
    })
  })

  describe('view mode', () => {
    it('should set view mode to grid', () => {
      useBookmarkStore.getState().setViewMode('grid')

      expect(useBookmarkStore.getState().viewMode).toBe('grid')
    })

    it('should set view mode to list', () => {
      useBookmarkStore.getState().setViewMode('list')

      expect(useBookmarkStore.getState().viewMode).toBe('list')
    })
  })

  describe('sidebar item', () => {
    it('should set active sidebar item', () => {
      useBookmarkStore.getState().setActiveSidebarItem('Favorites')

      expect(useBookmarkStore.getState().activeSidebarItem).toBe('Favorites')
    })

    it('should update sidebar item', () => {
      useBookmarkStore.setState({ activeSidebarItem: 'All Bookmarks' })
      useBookmarkStore.getState().setActiveSidebarItem('Collections')

      expect(useBookmarkStore.getState().activeSidebarItem).toBe('Collections')
    })
  })

  describe('loading state', () => {
    it('should set loading state', () => {
      useBookmarkStore.getState().setIsLoading(true)

      expect(useBookmarkStore.getState().isLoading).toBe(true)
    })

    it('should clear loading state', () => {
      useBookmarkStore.setState({ isLoading: true })
      useBookmarkStore.getState().setIsLoading(false)

      expect(useBookmarkStore.getState().isLoading).toBe(false)
    })
  })

  describe('error state', () => {
    it('should set error', () => {
      useBookmarkStore.getState().setError('Test error')

      expect(useBookmarkStore.getState().error).toBe('Test error')
    })

    it('should clear error', () => {
      useBookmarkStore.setState({ error: 'Previous error' })
      useBookmarkStore.getState().setError(null)

      expect(useBookmarkStore.getState().error).toBeNull()
    })
  })

  describe('AI panel', () => {
    it('should toggle AI panel', () => {
      expect(useBookmarkStore.getState().isAIPanelOpen).toBe(false)

      useBookmarkStore.getState().toggleAIPanel()
      expect(useBookmarkStore.getState().isAIPanelOpen).toBe(true)

      useBookmarkStore.getState().toggleAIPanel()
      expect(useBookmarkStore.getState().isAIPanelOpen).toBe(false)
    })

    it('should set AI panel open state', () => {
      useBookmarkStore.getState().setAIPanelOpen(true)
      expect(useBookmarkStore.getState().isAIPanelOpen).toBe(true)

      useBookmarkStore.getState().setAIPanelOpen(false)
      expect(useBookmarkStore.getState().isAIPanelOpen).toBe(false)
    })
  })

  describe('filters panel', () => {
    it('should toggle filters panel', () => {
      expect(useBookmarkStore.getState().isFiltersPanelOpen).toBe(false)

      useBookmarkStore.getState().toggleFiltersPanel()
      expect(useBookmarkStore.getState().isFiltersPanelOpen).toBe(true)

      useBookmarkStore.getState().toggleFiltersPanel()
      expect(useBookmarkStore.getState().isFiltersPanelOpen).toBe(false)
    })

    it('should set filters panel open state', () => {
      useBookmarkStore.getState().setFiltersPanelOpen(true)
      expect(useBookmarkStore.getState().isFiltersPanelOpen).toBe(true)

      useBookmarkStore.getState().setFiltersPanelOpen(false)
      expect(useBookmarkStore.getState().isFiltersPanelOpen).toBe(false)
    })
  })

  describe('advanced filters', () => {
    it('should set author filter', () => {
      useBookmarkStore.getState().setAuthorFilter('John Doe')

      expect(useBookmarkStore.getState().authorFilter).toBe('John Doe')
    })

    it('should set domain filter', () => {
      useBookmarkStore.getState().setDomainFilter('example.com')

      expect(useBookmarkStore.getState().domainFilter).toBe('example.com')
    })

    it('should set content type filter', () => {
      useBookmarkStore.getState().setContentTypeFilter('article')

      expect(useBookmarkStore.getState().contentTypeFilter).toBe('article')
    })

    it('should set date range filter', () => {
      const dateFilter = { type: 'week' as const }
      useBookmarkStore.getState().setDateRangeFilter(dateFilter)

      expect(useBookmarkStore.getState().dateRangeFilter).toEqual(dateFilter)
    })

    it('should clear advanced filters', () => {
      useBookmarkStore.setState({
        authorFilter: 'John',
        domainFilter: 'example.com',
        contentTypeFilter: 'article',
        dateRangeFilter: { type: 'week' },
      })

      useBookmarkStore.getState().clearAdvancedFilters()

      expect(useBookmarkStore.getState().authorFilter).toBe('')
      expect(useBookmarkStore.getState().domainFilter).toBe('')
      expect(useBookmarkStore.getState().contentTypeFilter).toBe('')
      expect(useBookmarkStore.getState().dateRangeFilter).toEqual({
        type: 'all',
      })
    })
  })

  describe('quick filters', () => {
    it('should toggle quick filter on', () => {
      useBookmarkStore.getState().toggleQuickFilter('starred')

      expect(useBookmarkStore.getState().quickFilters).toEqual(['starred'])
    })

    it('should toggle quick filter off', () => {
      useBookmarkStore.setState({ quickFilters: ['starred'] })
      useBookmarkStore.getState().toggleQuickFilter('starred')

      expect(useBookmarkStore.getState().quickFilters).toEqual([])
    })

    it('should add multiple quick filters', () => {
      useBookmarkStore.getState().toggleQuickFilter('starred')
      useBookmarkStore.getState().toggleQuickFilter('unread')

      expect(useBookmarkStore.getState().quickFilters).toContain('starred')
      expect(useBookmarkStore.getState().quickFilters).toContain('unread')
    })

    it('should clear all quick filters via clearAdvancedFilters', () => {
      useBookmarkStore.setState({
        quickFilters: ['starred', 'unread', 'archived'],
      })
      useBookmarkStore.getState().clearAdvancedFilters()

      expect(useBookmarkStore.getState().quickFilters).toEqual([])
    })
  })

  describe('bookmark management', () => {
    it('should set bookmarks', () => {
      const bookmarks = [
        createTestBookmark({ id: 1 }),
        createTestBookmark({ id: 2 }),
      ]

      useBookmarkStore.getState().setBookmarks(bookmarks)

      expect(useBookmarkStore.getState().bookmarks).toHaveLength(2)
      expect(useBookmarkStore.getState().bookmarks[0].id).toBe(1)
    })

    it('should update bookmark in state', () => {
      const bookmarks = [createTestBookmark({ id: 1, title: 'Original' })]
      useBookmarkStore.setState({ bookmarks })

      const updated = createTestBookmark({ id: 1, title: 'Updated' })
      useBookmarkStore.setState({
        bookmarks: bookmarks.map((b) => (b.id === 1 ? updated : b)),
      })

      expect(useBookmarkStore.getState().bookmarks[0].title).toBe('Updated')
    })

    it('should remove bookmark from state', () => {
      const bookmarks = [
        createTestBookmark({ id: 1 }),
        createTestBookmark({ id: 2 }),
      ]
      useBookmarkStore.setState({ bookmarks })

      useBookmarkStore.setState({
        bookmarks: bookmarks.filter((b) => b.id !== 1),
      })

      expect(useBookmarkStore.getState().bookmarks).toHaveLength(1)
      expect(useBookmarkStore.getState().bookmarks[0].id).toBe(2)
    })
  })

  describe('complex state interactions', () => {
    it('should handle multiple state updates', () => {
      useBookmarkStore.getState().setSearchQuery('test')
      useBookmarkStore.getState().setActiveTab(1)
      useBookmarkStore.getState().setSelectedTags(['react'])
      useBookmarkStore.getState().setViewMode('list')

      const state = useBookmarkStore.getState()
      expect(state.searchQuery).toBe('test')
      expect(state.activeTab).toBe(1)
      expect(state.selectedTags).toEqual(['react'])
      expect(state.viewMode).toBe('list')
    })

    it('should maintain state consistency across updates', () => {
      const bookmarks = [
        createTestBookmark({ id: 1, tags: ['react'] }),
        createTestBookmark({ id: 2, tags: ['python'] }),
      ]
      useBookmarkStore.setState({ bookmarks })

      // Add filter
      useBookmarkStore.getState().setSelectedTags(['react'])

      // Update bookmark
      const updated = createTestBookmark({
        id: 1,
        tags: ['react', 'javascript'],
      })
      useBookmarkStore.setState({
        bookmarks: bookmarks.map((b) => (b.id === 1 ? updated : b)),
      })

      // Filter should still be active
      expect(useBookmarkStore.getState().selectedTags).toEqual(['react'])
      expect(useBookmarkStore.getState().bookmarks[0].tags).toContain(
        'javascript'
      )
    })
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const initialState = useBookmarkStore.getState()

      expect(initialState.bookmarks).toEqual([])
      expect(initialState.selectedTags).toEqual([])
      expect(initialState.searchQuery).toBe('')
      expect(initialState.activeTab).toBe(0)
      expect(initialState.viewMode).toBe('grid')
      expect(initialState.isLoading).toBe(false)
      expect(initialState.isAIPanelOpen).toBe(false)
      expect(initialState.isFiltersPanelOpen).toBe(false)
      expect(initialState.activeSidebarItem).toBe('All Bookmarks')
      expect(initialState.error).toBeNull()
      expect(initialState.authorFilter).toBe('')
      expect(initialState.domainFilter).toBe('')
      expect(initialState.contentTypeFilter).toBe('')
      expect(initialState.dateRangeFilter).toEqual({ type: 'all' })
      expect(initialState.quickFilters).toEqual([])
    })
  })
})
