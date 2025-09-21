import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBookmarkStore } from '../store/bookmarkStore'

// Mock Supabase with realistic bookmark data
const mockBookmarksFromDB = [
  {
    id: 1,
    title: 'React 19 Beta Features - What\'s New',
    url: 'https://react.dev/blog/2024/04/25/react-19',
    user_id: 'test-user-id',
    created_at: '2024-01-01T00:00:00Z',
    tags: ['react', 'javascript']
  },
  {
    id: 2,
    title: 'TypeScript 5.5 Released',
    url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/',
    user_id: 'test-user-id',
    created_at: '2024-01-02T00:00:00Z',
    tags: ['typescript']
  },
  {
    id: 3,
    title: 'Building Scalable Web Apps with Next.js',
    url: 'https://nextjs.org/learn',
    user_id: 'test-user-id',
    created_at: '2024-01-03T00:00:00Z',
    tags: ['nextjs', 'react']
  }
]

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: mockBookmarksFromDB,
            error: null
          }))
        }))
      }))
    })),
  },
}))

describe('Bookmark Loading Logic', () => {
  beforeEach(async () => {
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
      currentUserId: null,
      error: null,
    })

    // Reset mocks
    vi.clearAllMocks()

    // Setup default mock behavior
    const { supabase } = await import('../lib/supabase')
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth session missing' }
    })
  })

  it('should load mock data when no user is authenticated', async () => {
    console.log('🧪 Testing mock data loading...')

    const { supabase } = await import('../lib/supabase')

    // Mock no authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth session missing' }
    })

    // Initialize the store
    await useBookmarkStore.getState().initialize()

    const state = useBookmarkStore.getState()

    console.log('📊 Final state - bookmarks:', state.bookmarks.length, 'userId:', state.currentUserId)

    // Should have mock bookmarks and no user
    expect(state.currentUserId).toBeNull()
    expect(state.bookmarks.length).toBeGreaterThan(0) // Should have mock bookmarks
    expect(state.isLoading).toBe(false)
  })

  it('should load database bookmarks when user is authenticated', async () => {
    console.log('🧪 Testing database bookmark loading...')

    const { supabase } = await import('../lib/supabase')

    // Mock authenticated user
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      },
      error: null
    })

    // Initialize the store
    await useBookmarkStore.getState().initialize()

    const state = useBookmarkStore.getState()

    console.log('📊 Final state - bookmarks:', state.bookmarks.length, 'userId:', state.currentUserId)
    console.log('📚 First bookmark title:', state.bookmarks[0]?.title)

    // Should have database bookmarks and user ID
    expect(state.currentUserId).toBe('test-user-id')
    expect(state.bookmarks.length).toBe(3) // Should have 3 mock DB bookmarks
    expect(state.bookmarks[0].title).toBe('React 19 Beta Features - What\'s New')
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should call loadBookmarks with correct user ID', async () => {
    console.log('🧪 Testing loadBookmarks function directly...')

    const { supabase } = await import('../lib/supabase')

    // Set up authenticated state manually
    useBookmarkStore.setState({
      currentUserId: 'test-user-id'
    })

    // Call loadBookmarks directly
    await useBookmarkStore.getState().loadBookmarks()

    const state = useBookmarkStore.getState()

    console.log('📊 LoadBookmarks result - bookmarks:', state.bookmarks.length)
    console.log('📚 First bookmark:', state.bookmarks[0]?.title)

    // Verify Supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith('bookmarks')

    // Verify correct bookmarks were loaded
    expect(state.bookmarks.length).toBe(3)
    expect(state.bookmarks[0].title).toBe('React 19 Beta Features - What\'s New')
    expect(state.isLoading).toBe(false)
  })
})