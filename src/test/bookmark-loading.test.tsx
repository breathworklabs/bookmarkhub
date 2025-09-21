import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBookmarkStore } from '../store/bookmarkStore'
import { mockBookmarks } from './test-utils'

// Mock Supabase for database loading tests
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null
      })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: mockBookmarks,
            error: null
          }))
        }))
      }))
    }))
  }
}))

// Use shared mock data from test-utils

describe('Bookmark Loading Logic', () => {
  beforeEach(() => {
    // Reset store to clean state
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
    })

    // Reset localStorage mocks
    vi.clearAllMocks()
    // Reset global localStorage mock
    ;(window.localStorage.getItem as any).mockReturnValue(null)
  })

  it('should load mock data when localStorage is empty', async () => {
    // Mock empty localStorage
    ;(window.localStorage.getItem as any).mockReturnValue(null)

    // Initialize the store
    await useBookmarkStore.getState().initialize()

    const state = useBookmarkStore.getState()

    // Should have mock bookmarks when localStorage is empty
    expect(state.bookmarks.length).toBeGreaterThan(0) // Should have mock bookmarks
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should load bookmarks from database when user is authenticated', async () => {
    // Initialize the store (this should load from database when user exists)
    await useBookmarkStore.getState().initialize()

    const state = useBookmarkStore.getState()

    // Should have loaded bookmarks from database
    expect(state.bookmarks.length).toBe(2) // Should have 2 mock bookmarks
    expect(state.bookmarks[0].title).toBe('React 19 Beta Features')
    expect(state.bookmarks[1].is_starred).toBe(true) // TypeScript bookmark is starred
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.currentUserId).toBe('test-user')
  })

  it('should load bookmarks from database when loadBookmarks is called', async () => {
    // Set up user ID for database loading
    useBookmarkStore.setState({ currentUserId: 'test-user' })

    // Call loadBookmarks directly
    await useBookmarkStore.getState().loadBookmarks()

    const state = useBookmarkStore.getState()

    // Verify correct bookmarks were loaded from database
    expect(state.bookmarks.length).toBe(2)
    expect(state.bookmarks[0].title).toBe('React 19 Beta Features')
    expect(state.bookmarks[1].author).toBe('TypeScript Team')
    expect(state.isLoading).toBe(false)
  })

  it('should handle localStorage errors gracefully', async () => {
    // Mock localStorage to throw an error
    ;(window.localStorage.getItem as any).mockImplementation(() => {
      throw new Error('localStorage is not available')
    })

    // Initialize the store
    await useBookmarkStore.getState().initialize()

    const state = useBookmarkStore.getState()

    // Should fall back to mock data on localStorage error
    expect(state.bookmarks.length).toBeGreaterThan(0) // Should have mock bookmarks as fallback
    expect(state.isLoading).toBe(false)
    // Error might be set but app should still function
  })
})