import { vi } from 'vitest'

// Common test constants
export const TEST_CONSTANTS = {
  MAX_RENDER_COUNT: 5,
  MAX_EFFECT_CALLS: 3,
  MAX_AUTH_RENDERS: 10,
  TIMEOUT_DELAY: 100,
} as const

// Common mock data
export const mockBookmarks = [
  {
    id: 1,
    title: 'React 19 Beta Features',
    url: 'https://react.dev/blog/2024/04/25/react-19',
    content: 'React 19 introduces new features...',
    author: 'React Team',
    domain: 'react.dev',
    created_at: '2024-01-01T00:00:00Z',
    tags: ['react', 'javascript'],
    is_starred: false,
    metrics: { likes: '42', retweets: '15', replies: '8' }
  },
  {
    id: 2,
    title: 'TypeScript 5.5 Released',
    url: 'https://devblogs.microsoft.com/typescript/',
    content: 'TypeScript 5.5 brings new features...',
    author: 'TypeScript Team',
    domain: 'devblogs.microsoft.com',
    created_at: '2024-01-02T00:00:00Z',
    tags: ['typescript'],
    is_starred: true,
    metrics: { likes: '28', retweets: '12', replies: '5' }
  }
]

// Common mock setup functions
export const createLocalStorageMock = () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
})

export const createSupabaseMock = () => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user', email: 'test@test.com' } },
      error: null
    }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null
    }),
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
  })),
})

// Helper to reset store state
export const resetBookmarkStore = () => {
  try {
    const { useBookmarkStore } = require('../store/bookmarkStore')
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
  } catch (error) {
    // Store might be mocked, skip reset
    console.warn('Could not reset bookmark store, it may be mocked')
  }
}

// Helper to wait for async operations
export const waitForAsync = (ms: number = TEST_CONSTANTS.TIMEOUT_DELAY) =>
  new Promise(resolve => setTimeout(resolve, ms))