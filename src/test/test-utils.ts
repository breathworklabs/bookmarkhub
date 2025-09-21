import type { Bookmark } from '../types/bookmark'

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

// Mock bookmark factory function
export interface CreateBookmarkOptions {
  id?: number
  user_id?: string
  title?: string
  url?: string
  description?: string
  content?: string
  author?: string
  domain?: string
  source_platform?: string
  engagement_score?: number
  is_starred?: boolean
  is_read?: boolean
  is_archived?: boolean
  tags?: string[]
  created_at?: string
  updated_at?: string
  thumbnail_url?: string
  favicon_url?: string
  source_id?: string
  metadata?: any
}

export const createMockBookmark = (options: CreateBookmarkOptions = {}): Bookmark => {
  const id = options.id ?? Math.floor(Math.random() * 10000)
  const baseDate = new Date('2024-01-01T00:00:00Z')
  const createdDate = options.created_at ?? new Date(baseDate.getTime() + id * 86400000).toISOString()

  return {
    id,
    user_id: options.user_id ?? 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: options.title ?? `Test Bookmark ${id}`,
    url: options.url ?? `https://example${id}.com`,
    description: options.description ?? `Description for bookmark ${id}`,
    content: options.content ?? `Content for bookmark ${id}`,
    author: options.author ?? `Author ${id}`,
    domain: options.domain ?? `example${id}.com`,
    source_platform: options.source_platform ?? 'manual',
    engagement_score: options.engagement_score ?? Math.floor(Math.random() * 100),
    is_starred: options.is_starred ?? false,
    is_read: options.is_read ?? false,
    is_archived: options.is_archived ?? false,
    tags: options.tags ?? [`tag${id}`],
    created_at: createdDate,
    updated_at: options.updated_at ?? createdDate,
    thumbnail_url: options.thumbnail_url,
    favicon_url: options.favicon_url,
    source_id: options.source_id,
    metadata: options.metadata,
  }
}

export const createMockBookmarks = (count: number, options: CreateBookmarkOptions[] = []): Bookmark[] => {
  return Array.from({ length: count }, (_, index) => {
    const customOptions = options[index] || {}
    return createMockBookmark({
      id: index + 1,
      ...customOptions,
    })
  })
}

// Preset bookmark configurations for common test scenarios
export const createStarredBookmarks = (count: number): Bookmark[] => {
  return createMockBookmarks(count, Array.from({ length: count }, (_, i) => ({
    is_starred: true,
    title: `Starred Bookmark ${i + 1}`,
  })))
}

export const createArchivedBookmarks = (count: number): Bookmark[] => {
  return createMockBookmarks(count, Array.from({ length: count }, (_, i) => ({
    is_archived: true,
    title: `Archived Bookmark ${i + 1}`,
  })))
}

export const createTaggedBookmarks = (tag: string, count: number): Bookmark[] => {
  return createMockBookmarks(count, Array.from({ length: count }, (_, i) => ({
    tags: [tag, `othertag${i}`],
    title: `${tag} Bookmark ${i + 1}`,
  })))
}

export const createMixedBookmarks = (totalCount: number): Bookmark[] => {
  const starredCount = Math.floor(totalCount * 0.3)
  const archivedCount = Math.floor(totalCount * 0.2)
  const regularCount = totalCount - starredCount - archivedCount

  const starred = createStarredBookmarks(starredCount).map((b, i) => ({
    ...b,
    id: i + 1,
    is_starred: true,
  }))

  const archived = createArchivedBookmarks(archivedCount).map((b, i) => ({
    ...b,
    id: starredCount + i + 1,
    is_archived: true,
    is_starred: false,
  }))

  const regular = createMockBookmarks(regularCount).map((b, i) => ({
    ...b,
    id: starredCount + archivedCount + i + 1,
    is_starred: false,
    is_archived: false,
  }))

  return [...starred, ...archived, ...regular]
}

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