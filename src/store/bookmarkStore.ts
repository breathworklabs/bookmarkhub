import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { mockBookmarks } from '../data/mockBookmarks'
import { db, type Bookmark, type BookmarkInsert } from '../lib/database'
import { supabase } from '../lib/supabase'

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
  currentUserId: string | null
  error: string | null

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
  setCurrentUserId: (userId: string | null) => void
  setError: (error: string | null) => void

  // Initialize store
  initialize: () => Promise<void>
}

export const useBookmarkStore = create<BookmarkState>()(
  devtools(
    (set, get) => ({
      // Initial state
      bookmarks: mockBookmarks,
      selectedTags: ['tech', 'AI'],
      searchQuery: '',
      activeTab: 0,
      viewMode: 'grid',
      isLoading: false,
      isAIPanelOpen: false,
      isFiltersPanelOpen: false,
      activeSidebarItem: 'All Bookmarks',
      currentUserId: null,
      error: null,

      // Initialize store
      initialize: async () => {
        try {
          set({ isLoading: true, error: null }, false, 'initialize:start')

          // Check if Supabase is configured
          if (!supabase) {
            set({
              bookmarks: mockBookmarks,
              currentUserId: null
            }, false, 'initialize:useMockData')
            return
          }

          // Get current user
          const { data: { user }, error: authError } = await supabase.auth.getUser()

          // AuthSessionMissingError is expected when no user is logged in
          if (authError && !authError.message.includes('Auth session missing')) {
            console.error('Authentication error:', authError)
          }

          if (user) {
            console.info('👤 User authenticated, loading bookmarks...')
            set({ currentUserId: user.id }, false, 'initialize:setUser')
            await get().loadBookmarks()
          } else {
            // Use mock data if no user is logged in
            set({
              bookmarks: mockBookmarks,
              currentUserId: null
            }, false, 'initialize:useMockData')
          }
        } catch (error) {
          console.error('Failed to initialize app:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize',
            bookmarks: mockBookmarks // Fallback to mock data
          }, false, 'initialize:error')
        } finally {
          set({ isLoading: false }, false, 'initialize:complete')
        }
      },

      // Async Actions
      loadBookmarks: async () => {
        const userId = get().currentUserId
        if (!userId) return

        try {
          set({ isLoading: true, error: null }, false, 'loadBookmarks:start')
          const bookmarks = await db.getBookmarks(userId)
          set({ bookmarks }, false, 'loadBookmarks:success')
        } catch (error) {
          console.error('Error loading bookmarks:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to load bookmarks' }, false, 'loadBookmarks:error')
        } finally {
          set({ isLoading: false }, false, 'loadBookmarks:complete')
        }
      },

      addBookmark: async (bookmark) => {
        const userId = get().currentUserId
        if (!userId) return

        try {
          set({ isLoading: true, error: null }, false, 'addBookmark:start')
          const newBookmark = await db.createBookmark({ ...bookmark, user_id: userId })
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
        const userId = get().currentUserId
        if (!userId) return

        try {
          set({ isLoading: true, error: null }, false, 'removeBookmark:start')
          await db.deleteBookmark(id, userId)
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
        const userId = get().currentUserId
        if (!userId) return

        try {
          const updatedBookmark = await db.toggleBookmarkStar(id, userId)
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
        const userId = get().currentUserId
        if (!userId || !query.trim()) {
          await get().loadBookmarks()
          return
        }

        try {
          set({ isLoading: true, error: null }, false, 'searchBookmarks:start')
          const results = await db.searchBookmarks(userId, query)
          set({ bookmarks: results }, false, 'searchBookmarks:success')
        } catch (error) {
          console.error('Error searching bookmarks:', error)
          set({ error: error instanceof Error ? error.message : 'Failed to search bookmarks' }, false, 'searchBookmarks:error')
        } finally {
          set({ isLoading: false }, false, 'searchBookmarks:complete')
        }
      },

      // Sync Actions
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
      setCurrentUserId: (userId) => set({ currentUserId: userId }, false, 'setCurrentUserId'),
      setError: (error) => set({ error }, false, 'setError')
    }),
    {
      name: 'bookmark-store', // Store name for devtools
    }
  )
)