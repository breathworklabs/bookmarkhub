import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { mockBookmarks } from '../data/mockBookmarks'
import { localStorageService } from '../lib/localStorage'
import { sanitizeBookmark, isValidBookmark, isValidSettings, isValidMetadata, validateImportData } from '../lib/dataValidation'
import type { Bookmark, BookmarkInsert, AppSettings } from '../types/bookmark'

interface BookmarkState {
  // State
  bookmarks: Bookmark[]
  selectedTags: string[]
  searchQuery: string
  activeTab: number
  viewMode: 'grid' | 'list'
  isLoading: boolean
  isAIPanelOpen: boolean
  isFiltersPanelOpen: boolean
  activeSidebarItem: string
  error: string | null
  settings: AppSettings

  // Actions
  setBookmarks: (bookmarks: Bookmark[]) => void
  loadBookmarks: () => Promise<void>
  addBookmark: (bookmark: BookmarkInsert) => Promise<void>
  removeBookmark: (id: number) => Promise<void>
  toggleStarBookmark: (id: number) => Promise<void>
  searchBookmarks: (query: string) => Promise<void>

  setSelectedTags: (tags: string[]) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  clearTags: () => void

  setSearchQuery: (query: string) => void
  setActiveTab: (tab: number) => void
  setViewMode: (mode: 'grid' | 'list') => void
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

  // Data management
  exportBookmarks: () => Promise<void>
  importBookmarks: (file: File) => Promise<void>
  clearAllData: () => Promise<void>

  // Initialize store
  initialize: () => Promise<void>
}

export const useBookmarkStore = create<BookmarkState>()(
  devtools(
    (set, get) => ({
      // Initial state
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
      settings: {
        theme: 'dark',
        viewMode: 'grid',
        defaultSort: 'newest',
        showMetrics: true,
        compactMode: false,
        autoBackup: true,
        exportFormat: 'json'
      },

      // Initialize store
      initialize: async () => {
        try {
          set({ isLoading: true, error: null }, false, 'initialize:start')

          // Load settings first
          await get().loadSettings()

          // Try to load bookmarks from localStorage
          const bookmarks = await localStorageService.getBookmarks()

          if (bookmarks.length > 0) {
            console.log('📂 Loaded bookmarks from localStorage:', bookmarks.length)
            set({
              bookmarks,
              selectedTags: [], // Clear filters on startup
              searchQuery: '', // Clear search on startup
              activeTab: 0 // Reset to "All" tab
            }, false, 'initialize:loadedFromStorage')
          } else {
            console.log('📋 No stored bookmarks found, using mock data')
            set({ bookmarks: mockBookmarks }, false, 'initialize:useMockData')
          }

        } catch (error) {
          console.error('Failed to initialize app:', error)
          console.log('📋 Falling back to mock data')
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize',
            bookmarks: mockBookmarks // Fallback to mock data
          }, false, 'initialize:error')
        } finally {
          set({ isLoading: false }, false, 'initialize:complete')
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

          console.log('📁 Bookmarks exported successfully')
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

          console.log('📁 Bookmarks imported successfully')
        } catch (error) {
          console.error('Error importing bookmarks:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to import bookmarks' }, false, 'importBookmarks:error')
        } finally {
          set({ isLoading: false }, false, 'importBookmarks:complete')
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

          console.log('🗑️ All data cleared successfully')
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
      setError: (error) => set({ error }, false, 'setError')
    }),
    {
      name: 'bookmark-store', // Store name for devtools
    }
  )
)