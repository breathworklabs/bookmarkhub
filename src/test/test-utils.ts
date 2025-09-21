// No imports needed for this test utils file

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
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'React 19 Beta Features',
    url: 'https://react.dev/blog/2024/04/25/react-19',
    description: 'React 19 introduces new features...',
    content: 'React 19 introduces new features...',
    author: 'React Team',
    domain: 'react.dev',
    source_platform: 'manual',
    engagement_score: 42,
    is_starred: false,
    is_read: false,
    is_archived: false,
    tags: ['react', 'javascript'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'TypeScript 5.5 Released',
    url: 'https://devblogs.microsoft.com/typescript/',
    description: 'TypeScript 5.5 brings new features...',
    content: 'TypeScript 5.5 brings new features...',
    author: 'TypeScript Team',
    domain: 'devblogs.microsoft.com',
    source_platform: 'manual',
    engagement_score: 28,
    is_starred: true,
    is_read: false,
    is_archived: false,
    tags: ['typescript'],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
]

// Common mock setup functions


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