import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { localStorageService, type StoredBookmark } from '../lib/localStorage'
import { sanitizeBookmark, validateImportData } from '../lib/dataValidation'
import { transformXBookmarks, validateXBookmarkData } from '../lib/xBookmarkTransform'
import { mockBookmarks } from '../data/mockBookmarks'
import type { Bookmark, BookmarkInsert, AppSettings } from '../types/bookmark'

export interface DateRangeFilter {
  type: 'all' | 'today' | 'week' | 'month' | 'custom'
  customStart?: Date
  customEnd?: Date
}

export interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  hasMore: boolean
  isLoading: boolean
}

interface BookmarkState {
  // State
  bookmarks: Bookmark[]
  displayedBookmarks: Bookmark[]
  selectedTags: string[]
  searchQuery: string
  activeTab: number
  viewMode: 'grid' | 'list'
  selectedBookmarks: number[]
  isLoading: boolean
  isAIPanelOpen: boolean
  isFiltersPanelOpen: boolean
  activeSidebarItem: string
  error: string | null
  settings: AppSettings

  // Pagination
  pagination: PaginationState

  // Advanced filters
  authorFilter: string
  domainFilter: string
  contentTypeFilter: string
  dateRangeFilter: DateRangeFilter
  quickFilters: string[]

  // Cached filter options (calculated once)
  filterOptions: {
    authors: string[]
    domains: string[]
    tags: string[]
    contentTypes: string[]
  }

  // Performance optimization - track when filter options need recalculation
  filterOptionsHash: string

  // Actions
  setBookmarks: (bookmarks: Bookmark[]) => void
  loadBookmarks: () => Promise<void>
  addBookmark: (bookmark: BookmarkInsert) => Promise<void>
  updateBookmark: (id: number, bookmark: BookmarkInsert) => Promise<void>
  removeBookmark: (id: number) => Promise<void>
  toggleStarBookmark: (id: number) => Promise<void>
  toggleArchiveBookmark: (id: number) => Promise<void>
  searchBookmarks: (query: string) => Promise<void>

  setSelectedTags: (tags: string[]) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  clearTags: () => void

  setSearchQuery: (query: string) => void
  setActiveTab: (tab: number) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setSelectedBookmarks: (bookmarks: number[]) => void
  selectBookmark: (id: number) => void
  deselectBookmark: (id: number) => void
  toggleBookmarkSelection: (id: number) => void
  clearBookmarkSelection: () => void
  setIsLoading: (loading: boolean) => void
  setAIPanelOpen: (isOpen: boolean) => void
  toggleAIPanel: () => void
  setFiltersPanelOpen: (isOpen: boolean) => void
  toggleFiltersPanel: () => void
  setActiveSidebarItem: (item: string) => void
  setError: (error: string | null) => void

  // Settings actions
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>

  // Advanced filter actions
  setAuthorFilter: (filter: string) => void
  setDomainFilter: (filter: string) => void
  setContentTypeFilter: (filter: string) => void
  setDateRangeFilter: (filter: DateRangeFilter) => void
  toggleQuickFilter: (filter: string) => void
  clearAdvancedFilters: () => void
  calculateFilterOptions: () => void

  // Pagination actions
  loadMoreBookmarks: () => void
  resetPagination: () => void
  setItemsPerPage: (count: number) => void
  updateDisplayedBookmarks: () => void

  // Data management
  exportBookmarks: () => Promise<void>
  importBookmarks: (file: File) => Promise<void>
  importXBookmarks: (data: any[], limit?: number) => Promise<void>
  clearAllData: () => Promise<void>

  // Initialize store
  initialize: () => Promise<void>
}

export const useBookmarkStore = create<BookmarkState>()(
  devtools(
    (set, get) => ({
      // Initial state
      bookmarks: [],
      displayedBookmarks: [],
      selectedTags: [],
      searchQuery: '',
      activeTab: 0,
      viewMode: 'grid',
      selectedBookmarks: [],
      isLoading: false,
      isAIPanelOpen: false,
      isFiltersPanelOpen: false,
      activeSidebarItem: 'All Bookmarks',
      error: null,
      settings: {
        theme: 'dark',
        viewMode: 'grid',
        defaultSort: 'newest',
        showMetrics: true,
        compactMode: false,
        autoBackup: true,
        exportFormat: 'json'
      },

      // Pagination initial state
      pagination: {
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 0,
        hasMore: false,
        isLoading: false
      },

      // Advanced filters initial state
      authorFilter: '',
      domainFilter: '',
      contentTypeFilter: '',
      dateRangeFilter: { type: 'all' },
      quickFilters: [],

      // Cached filter options initial state
      filterOptions: {
        authors: [],
        domains: [],
        tags: [],
        contentTypes: ['article', 'tweet', 'video', 'image']
      },

      // Performance tracking for filter options
      filterOptionsHash: '',

      // Initialize store
      initialize: async () => {
        try {
          // First, try to load bookmarks immediately (synchronous for better UX)
          const bookmarks = await localStorageService.getBookmarks()

          // If we have bookmarks, set them immediately without loading state
          if (bookmarks.length > 0) {
            set({
              bookmarks,
              selectedTags: [], // Clear filters on startup
              searchQuery: '', // Clear search on startup
              activeTab: 0, // Reset to "All" tab
              selectedBookmarks: [], // Clear selection on startup
              isLoading: false // No loading state if we have data
            }, false, 'initialize:immediateLoad')

            // Load settings and calculate filter options in background
            Promise.all([
              get().loadSettings(),
              Promise.resolve(get().calculateFilterOptions())
            ]).catch(error => {
              console.error('Background initialization failed:', error)
            })
          } else {
            // No bookmarks in localStorage - load mock bookmarks for demo
            await get().loadSettings()

            set({
              bookmarks: mockBookmarks,
              selectedTags: [],
              searchQuery: '',
              activeTab: 0,
              selectedBookmarks: [],
              isLoading: false
            }, false, 'initialize:mockData')

            // Calculate filter options with mock bookmarks
            get().calculateFilterOptions()
          }

        } catch (error) {
          console.error('Failed to initialize app:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize',
            bookmarks: [],
            isLoading: false
          }, false, 'initialize:error')
        }
      },

      // Load bookmarks from localStorage
      loadBookmarks: async () => {
        const state = get()

        // Prevent multiple simultaneous calls
        if (state.isLoading) {
          return
        }

        try {
          set({ isLoading: true, error: null }, false, 'loadBookmarks:start')

          const bookmarks = await localStorageService.getBookmarks()
          set({ bookmarks, isLoading: false }, false, 'loadBookmarks:success')

          // Recalculate filter options after loading bookmarks
          get().calculateFilterOptions()
        } catch (error) {
          console.error('Error loading bookmarks:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to load bookmarks',
            isLoading: false
          }, false, 'loadBookmarks:error')
        }
      },

      addBookmark: async (bookmark) => {
        try {
          set({ isLoading: true, error: null }, false, 'addBookmark:start')

          // Validate and sanitize bookmark data
          const sanitizedBookmark = sanitizeBookmark(bookmark)
          if (!sanitizedBookmark) {
            throw new Error('Invalid bookmark data')
          }

          const newBookmark = await localStorageService.createBookmark(sanitizedBookmark)
          set(
            (state) => ({ bookmarks: [newBookmark, ...state.bookmarks] }),
            false,
            'addBookmark:success'
          )
        } catch (error) {
          console.error('Error adding bookmark:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to add bookmark' }, false, 'addBookmark:error')
        } finally {
          set({ isLoading: false }, false, 'addBookmark:complete')
        }
      },

      updateBookmark: async (id, bookmark) => {
        try {
          set({ isLoading: true, error: null }, false, 'updateBookmark:start')

          // Validate and sanitize bookmark data
          const sanitizedBookmark = sanitizeBookmark(bookmark)
          if (!sanitizedBookmark) {
            throw new Error('Invalid bookmark data')
          }

          const updatedBookmark = await localStorageService.updateBookmark(id, sanitizedBookmark)
          set(
            (state) => ({
              bookmarks: state.bookmarks.map(b => b.id === id ? updatedBookmark : b)
            }),
            false,
            'updateBookmark:success'
          )
        } catch (error) {
          console.error('Error updating bookmark:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to update bookmark' }, false, 'updateBookmark:error')
        } finally {
          set({ isLoading: false }, false, 'updateBookmark:complete')
        }
      },

      removeBookmark: async (id) => {
        try {
          set({ isLoading: true, error: null }, false, 'removeBookmark:start')
          await localStorageService.deleteBookmark(id)
          set(
            (state) => ({ bookmarks: state.bookmarks.filter(b => b.id !== id) }),
            false,
            'removeBookmark:success'
          )
        } catch (error) {
          console.error('Error removing bookmark:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to remove bookmark' }, false, 'removeBookmark:error')
        } finally {
          set({ isLoading: false }, false, 'removeBookmark:complete')
        }
      },

      toggleStarBookmark: async (id) => {
        try {
          const updatedBookmark = await localStorageService.toggleBookmarkStar(id)
          set(
            (state) => ({
              bookmarks: state.bookmarks.map(bookmark =>
                bookmark.id === id ? updatedBookmark : bookmark
              )
            }),
            false,
            'toggleStarBookmark:success'
          )
        } catch (error) {
          console.error('Error toggling bookmark star:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to toggle star' }, false, 'toggleStarBookmark:error')
        }
      },

      toggleArchiveBookmark: async (id) => {
        try {
          const bookmarks = await localStorageService.getBookmarks()
          const bookmark = bookmarks.find((b: StoredBookmark) => b.id === id)

          if (!bookmark) {
            throw new Error(`Bookmark with id ${id} not found`)
          }

          const updatedBookmark = await localStorageService.updateBookmark(id, { is_archived: !bookmark.is_archived })
          set(
            (state) => ({
              bookmarks: state.bookmarks.map(bookmark =>
                bookmark.id === id ? updatedBookmark : bookmark
              )
            }),
            false,
            'toggleArchiveBookmark:success'
          )
        } catch (error) {
          console.error('Error toggling bookmark archive:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to toggle archive' }, false, 'toggleArchiveBookmark:error')
        }
      },

      searchBookmarks: async (query) => {
        if (!query.trim()) {
          await get().loadBookmarks()
          return
        }

        try {
          set({ isLoading: true, error: null }, false, 'searchBookmarks:start')
          const results = await localStorageService.searchBookmarks(query)
          set({ bookmarks: results }, false, 'searchBookmarks:success')
        } catch (error) {
          console.error('Error searching bookmarks:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to search bookmarks' }, false, 'searchBookmarks:error')
        } finally {
          set({ isLoading: false }, false, 'searchBookmarks:complete')
        }
      },

      // Settings management
      loadSettings: async () => {
        try {
          const settings = await localStorageService.getSettings()
          set({ settings }, false, 'loadSettings:success')
        } catch (error) {
          console.error('Error loading settings:', error)
          // Keep default settings on error
        }
      },

      updateSettings: async (newSettings) => {
        try {
          const updatedSettings = await localStorageService.updateSettings(newSettings)
          set({ settings: updatedSettings }, false, 'updateSettings:success')

          // Update view mode if it changed
          if (newSettings.viewMode) {
            set({ viewMode: newSettings.viewMode }, false, 'updateSettings:viewMode')
          }
        } catch (error) {
          console.error('Error updating settings:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to update settings' }, false, 'updateSettings:error')
        }
      },

      // Data management
      exportBookmarks: async () => {
        try {
          const data = await localStorageService.exportData()

          // Create and download file
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `x-bookmarks-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)

        } catch (error) {
          console.error('Error exporting bookmarks:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to export bookmarks' }, false, 'exportBookmarks:error')
        }
      },

      importBookmarks: async (file) => {
        try {
          set({ isLoading: true, error: null }, false, 'importBookmarks:start')

          const text = await file.text()
          const data = JSON.parse(text)

          // Validate import data
          const validation = validateImportData(data)
          if (!validation.valid) {
            throw new Error(`Invalid import data: ${validation.errors.join(', ')}`)
          }

          await localStorageService.importData(data)
          await get().loadBookmarks()
          await get().loadSettings()

        } catch (error) {
          console.error('Error importing bookmarks:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to import bookmarks' }, false, 'importBookmarks:error')
        } finally {
          set({ isLoading: false }, false, 'importBookmarks:complete')
        }
      },

      importXBookmarks: async (data, limit) => {
        try {
          set({ isLoading: true, error: null }, false, 'importXBookmarks:start')

          // Validate X bookmark data
          const validation = validateXBookmarkData(data)
          if (!validation.valid) {
            throw new Error(`Invalid X bookmark data: ${validation.errors.join(', ')}`)
          }

          // Transform X bookmarks to our format
          const transformedBookmarks = transformXBookmarks(data, limit)

          // Add each bookmark using the existing addBookmark function
          let successCount = 0
          for (const bookmark of transformedBookmarks) {
            try {
              const sanitized = sanitizeBookmark(bookmark)
              if (sanitized) {
                await localStorageService.createBookmark(sanitized)
                successCount++
              }
            } catch (error) {
              console.warn('Failed to import bookmark:', bookmark.title, error)
            }
          }

          console.log(`Successfully imported ${successCount} of ${transformedBookmarks.length} X bookmarks`)

          // Reload bookmarks to show imported data
          await get().loadBookmarks()

          // Filter options will be recalculated in loadBookmarks()

        } catch (error) {
          console.error('Error importing X bookmarks:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to import X bookmarks' }, false, 'importXBookmarks:error')
        } finally {
          set({ isLoading: false }, false, 'importXBookmarks:complete')
        }
      },

      clearAllData: async () => {
        try {
          set({ isLoading: true, error: null }, false, 'clearAllData:start')

          await localStorageService.clearAllData()

          // Reset store to initial state
          set({
            bookmarks: [],
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            viewMode: 'grid',
            selectedBookmarks: [],
            activeSidebarItem: 'All Bookmarks',
            settings: {
              theme: 'dark',
              viewMode: 'grid',
              defaultSort: 'newest',
              showMetrics: true,
              compactMode: false,
              autoBackup: true,
              exportFormat: 'json'
            }
          }, false, 'clearAllData:success')

        } catch (error) {
          console.error('Error clearing data:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to clear data' }, false, 'clearAllData:error')
        } finally {
          set({ isLoading: false }, false, 'clearAllData:complete')
        }
      },

      // Sync Actions (unchanged)
      setBookmarks: (bookmarks) => set({ bookmarks }, false, 'setBookmarks'),
      setSelectedTags: (tags) => set({ selectedTags: tags }, false, 'setSelectedTags'),
      addTag: (tag) => set(
        (state) => ({ selectedTags: [...state.selectedTags, tag] }),
        false,
        'addTag'
      ),
      removeTag: (tag) => set(
        (state) => ({ selectedTags: state.selectedTags.filter(t => t !== tag) }),
        false,
        'removeTag'
      ),
      clearTags: () => set({ selectedTags: [] }, false, 'clearTags'),
      setSearchQuery: (query) => set({ searchQuery: query }, false, 'setSearchQuery'),
      setActiveTab: (tab) => set({ activeTab: tab }, false, 'setActiveTab'),
      setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),
      setSelectedBookmarks: (bookmarks) => set({ selectedBookmarks: bookmarks }, false, 'setSelectedBookmarks'),
      selectBookmark: (id) => set(
        (state) => ({ selectedBookmarks: [...new Set([...state.selectedBookmarks, id])] }),
        false,
        'selectBookmark'
      ),
      deselectBookmark: (id) => set(
        (state) => ({ selectedBookmarks: state.selectedBookmarks.filter(bid => bid !== id) }),
        false,
        'deselectBookmark'
      ),
      toggleBookmarkSelection: (id) => set(
        (state) => ({
          selectedBookmarks: state.selectedBookmarks.includes(id)
            ? state.selectedBookmarks.filter(bid => bid !== id)
            : [...state.selectedBookmarks, id]
        }),
        false,
        'toggleBookmarkSelection'
      ),
      clearBookmarkSelection: () => set({ selectedBookmarks: [] }, false, 'clearBookmarkSelection'),
      setIsLoading: (loading) => set({ isLoading: loading }, false, 'setIsLoading'),
      setAIPanelOpen: (isOpen) => set({ isAIPanelOpen: isOpen }, false, 'setAIPanelOpen'),
      toggleAIPanel: () => set(
        (state) => ({ isAIPanelOpen: !state.isAIPanelOpen }),
        false,
        'toggleAIPanel'
      ),
      setFiltersPanelOpen: (isOpen) => set({ isFiltersPanelOpen: isOpen }, false, 'setFiltersPanelOpen'),
      toggleFiltersPanel: () => set(
        (state) => ({ isFiltersPanelOpen: !state.isFiltersPanelOpen }),
        false,
        'toggleFiltersPanel'
      ),
      setActiveSidebarItem: (item) => set({ activeSidebarItem: item }, false, 'setActiveSidebarItem'),
      setError: (error) => set({ error }, false, 'setError'),

      // Advanced filter actions
      setAuthorFilter: (filter) => set({ authorFilter: filter }, false, 'setAuthorFilter'),
      setDomainFilter: (filter) => set({ domainFilter: filter }, false, 'setDomainFilter'),
      setContentTypeFilter: (filter) => set({ contentTypeFilter: filter }, false, 'setContentTypeFilter'),
      setDateRangeFilter: (filter) => set({ dateRangeFilter: filter }, false, 'setDateRangeFilter'),
      toggleQuickFilter: (filter) => set(
        (state) => ({
          quickFilters: state.quickFilters.includes(filter)
            ? state.quickFilters.filter(f => f !== filter)
            : [...state.quickFilters, filter]
        }),
        false,
        'toggleQuickFilter'
      ),
      clearAdvancedFilters: () => set({
        authorFilter: '',
        domainFilter: '',
        contentTypeFilter: '',
        dateRangeFilter: { type: 'all' },
        quickFilters: []
      }, false, 'clearAdvancedFilters'),

      // Calculate filter options from current bookmarks (optimized with memoization)
      calculateFilterOptions: () => {
        const state = get()
        const bookmarks = state.bookmarks

        // Create a hash of bookmark data to check if recalculation is needed
        const currentHash = bookmarks.length + '-' +
          bookmarks.slice(0, 5).map(b => `${b.id}-${b.author}-${b.domain}-${(b.tags || []).join(',')}`).join('|')

        // Only recalculate if the data has actually changed
        if (currentHash === state.filterOptionsHash) {
          return // Skip expensive calculation
        }

        // Optimize extraction with single pass through bookmarks
        const authorsSet = new Set<string>()
        const domainsSet = new Set<string>()
        const tagsSet = new Set<string>()

        for (const bookmark of bookmarks) {
          // Add author if valid
          if (bookmark.author && bookmark.author.trim()) {
            authorsSet.add(bookmark.author.trim())
          }

          // Add domain if valid
          if (bookmark.domain && bookmark.domain.trim()) {
            domainsSet.add(bookmark.domain.trim())
          }

          // Add tags if they exist
          if (bookmark.tags && Array.isArray(bookmark.tags)) {
            for (const tag of bookmark.tags) {
              if (tag && typeof tag === 'string' && tag.trim()) {
                tagsSet.add(tag.trim())
              }
            }
          }
        }

        // Convert sets to sorted arrays
        const authors = Array.from(authorsSet).sort()
        const domains = Array.from(domainsSet).sort()
        const tags = Array.from(tagsSet).sort()

        set({
          filterOptions: {
            authors,
            domains,
            tags,
            contentTypes: ['article', 'tweet', 'video', 'image'] // Static content types
          },
          filterOptionsHash: currentHash
        }, false, 'calculateFilterOptions')
      },

      // Pagination actions
      loadMoreBookmarks: () => {
        const state = get()
        if (state.pagination.isLoading || !state.pagination.hasMore) return

        set({
          pagination: { ...state.pagination, isLoading: true }
        }, false, 'loadMoreBookmarks:start')

        // Get filtered bookmarks and update displayed bookmarks
        get().updateDisplayedBookmarks()
      },

      resetPagination: () => {
        set({
          pagination: {
            currentPage: 1,
            itemsPerPage: 20,
            totalItems: 0,
            hasMore: false,
            isLoading: false
          },
          displayedBookmarks: []
        }, false, 'resetPagination')

        // Update displayed bookmarks after reset
        get().updateDisplayedBookmarks()
      },

      setItemsPerPage: (count: number) => {
        const state = get()
        set({
          pagination: { ...state.pagination, itemsPerPage: count, currentPage: 1 }
        }, false, 'setItemsPerPage')

        // Reset and update displayed bookmarks
        get().updateDisplayedBookmarks()
      },

      updateDisplayedBookmarks: () => {
        const state = get()
        // Simply stop loading without causing state updates that trigger re-renders
        set({
          pagination: {
            ...state.pagination,
            isLoading: false
          }
        }, false, 'updateDisplayedBookmarks')
      }
    }),
    {
      name: 'bookmark-store', // Store name for devtools
    }
  )
)