import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBookmarkStore } from '../store/bookmarkStore'
import { mockBookmarks } from './test-utils'

// Mock localStorage for testing
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

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

  it('should load bookmarks from localStorage when available', async () => {
    // Mock localStorage to return test data
    ;(window.localStorage.getItem as any).mockImplementation((key: string) => {
      if (key === 'x-bookmark-manager-bookmarks') {
        return JSON.stringify(mockBookmarks)
      }
      return null
    })

    // Initialize the store
    await useBookmarkStore.getState().initialize()

    const state = useBookmarkStore.getState()

    // Should have loaded bookmarks from localStorage (sorted by newest first)
    expect(state.bookmarks.length).toBe(2) // Should have 2 mock bookmarks from test-utils
    expect(state.bookmarks[0].title).toBe('TypeScript 5.5 Released') // Newest first (2024-01-02)
    expect(state.bookmarks[0].is_starred).toBe(true) // TypeScript bookmark is starred
    expect(state.bookmarks[1].title).toBe('React 19 Beta Features') // Older second (2024-01-01)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should load bookmarks from localStorage when loadBookmarks is called', async () => {
    // Mock localStorage to return test data
    ;(window.localStorage.getItem as any).mockImplementation((key: string) => {
      if (key === 'x-bookmark-manager-bookmarks') {
        return JSON.stringify(mockBookmarks)
      }
      return null
    })

    // Call loadBookmarks directly
    await useBookmarkStore.getState().loadBookmarks()

    const state = useBookmarkStore.getState()

    // Verify correct bookmarks were loaded from localStorage (sorted by newest first)
    expect(state.bookmarks.length).toBe(2)
    expect(state.bookmarks[0].title).toBe('TypeScript 5.5 Released') // Newest first
    expect(state.bookmarks[0].author).toBe('TypeScript Team')
    expect(state.bookmarks[1].title).toBe('React 19 Beta Features') // Older second
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