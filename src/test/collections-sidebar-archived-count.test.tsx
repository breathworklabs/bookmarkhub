import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import CollectionsList from '../components/collections/CollectionsList'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'
import type { Bookmark } from '../types/bookmark'
import { ModalProvider } from '../components/modals/ModalProvider'

// Mock the stores
vi.mock('../store/bookmarkStore')
vi.mock('../store/collectionsStore')

const mockUseBookmarkStore = vi.mocked(useBookmarkStore)
const mockUseCollectionsStore = vi.mocked(useCollectionsStore)

// Test data that matches your real import data structure
const createTestBookmarks = (): Bookmark[] => [
  {
    id: 7,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'React 19 Beta Features - What\'s New',
    url: 'https://react.dev/blog/2024/04/25/react-19',
    description: 'React 19 features',
    content: 'React 19 content...',
    author: 'React Team',
    domain: 'react.dev',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: true,
    is_read: false,
    is_archived: false, // NOT archived
    tags: ['react', 'javascript'],
    collections: ['uncategorized'],
    created_at: '2025-09-21T02:22:53.277Z',
    updated_at: '2025-09-21T02:22:53.277Z'
  },
  {
    id: 8,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'TypeScript 5.5 Released',
    url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/',
    description: 'TypeScript 5.5 features',
    content: 'TypeScript 5.5 content...',
    author: 'TypeScript Team',
    domain: 'devblogs.microsoft.com',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: false,
    is_read: false,
    is_archived: false, // NOT archived
    tags: ['typescript', 'javascript'],
    collections: ['uncategorized'],
    created_at: '2025-09-21T02:22:53.277Z',
    updated_at: '2025-09-21T02:22:53.277Z'
  },
  {
    id: 10,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'Supabase vs Firebase: Database Comparison',
    url: 'https://supabase.com/blog/supabase-vs-firebase',
    description: 'Database comparison',
    content: 'Supabase vs Firebase...',
    author: 'Supabase Team',
    domain: 'supabase.com',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: false,
    is_read: false,
    is_archived: true, // THIS ONE IS archived
    tags: ['supabase', 'firebase'],
    collections: ['uncategorized'],
    created_at: '2025-09-21T02:22:53.277Z',
    updated_at: '2025-09-21T02:22:53.277Z'
  },
  {
    id: 11,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'State Management in React',
    url: 'https://blog.logrocket.com/zustand-vs-redux/',
    description: 'State management comparison',
    content: 'State management content...',
    author: 'LogRocket',
    domain: 'blog.logrocket.com',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: true,
    is_read: false,
    is_archived: false, // NOT archived
    tags: ['react', 'state-management'],
    collections: ['uncategorized'],
    created_at: '2025-09-21T02:22:53.277Z',
    updated_at: '2025-09-21T02:22:53.277Z'
  },
  {
    id: 12,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'CSS Grid vs Flexbox',
    url: 'https://css-tricks.com/quick-whats-the-difference-between-flexbox-and-grid/',
    description: 'CSS layout comparison',
    content: 'CSS Grid vs Flexbox...',
    author: 'CSS-Tricks',
    domain: 'css-tricks.com',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: false,
    is_read: false,
    is_archived: false, // NOT archived
    tags: ['css', 'grid', 'flexbox'],
    collections: ['uncategorized'],
    created_at: '2025-09-21T02:22:53.277Z',
    updated_at: '2025-09-21T02:22:53.277Z'
  },
  {
    id: 13,
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: 'Another Bookmark',
    url: 'https://example.com/another',
    description: 'Another bookmark',
    content: 'Another bookmark content...',
    author: 'Example Author',
    domain: 'example.com',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: false,
    is_read: false,
    is_archived: false, // NOT archived
    tags: ['example'],
    collections: ['uncategorized'],
    created_at: '2025-09-21T02:22:53.277Z',
    updated_at: '2025-09-21T02:22:53.277Z'
  }
]

const defaultCollections = [
  {
    id: 'starred',
    name: 'Starred',
    description: 'Starred bookmarks',
    color: '#ffd700',
    isPrivate: false,
    isDefault: true,
    isSmartCollection: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    bookmarkCount: 0,
    userId: 'local-user'
  },
  {
    id: 'archived',
    name: 'Archived',
    description: 'Archived bookmarks',
    color: '#6b7280',
    isPrivate: false,
    isDefault: true,
    isSmartCollection: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    bookmarkCount: 0,
    userId: 'local-user'
  },
  {
    id: 'recent',
    name: 'Recent',
    description: 'Recently added bookmarks',
    color: '#3b82f6',
    isPrivate: false,
    isDefault: true,
    isSmartCollection: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    bookmarkCount: 0,
    userId: 'local-user'
  }
]

describe.skip('CollectionsList Archived Count Bug', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock collections store
    mockUseCollectionsStore.mockReturnValue({
      collections: defaultCollections,
      activeCollectionId: null,
      collectionBookmarks: {},
      isLoading: false,
      error: null,
      loadCollections: vi.fn(),
      setActiveCollection: vi.fn(),
      setCreatingCollection: vi.fn()
    } as any)
  })

  it('should show correct archived count with real import data structure', () => {
    const testBookmarks = createTestBookmarks()

    // Verify our test data setup
    const expectedArchivedCount = testBookmarks.filter(b => b.is_archived === true).length
    expect(expectedArchivedCount).toBe(1) // Only "Supabase vs Firebase" should be archived

    const expectedStarredCount = testBookmarks.filter(b => b.is_starred === true).length
    expect(expectedStarredCount).toBe(2) // "React 19" and "State Management" should be starred

    // Mock bookmark store with our test data
    mockUseBookmarkStore.mockImplementation((selector) => {
      const state = {
        bookmarks: testBookmarks,
        selectedTags: [],
        searchQuery: '',
        activeTab: 0,
        viewMode: 'grid',
        isLoading: false,
        isAIPanelOpen: false,
        isFiltersPanelOpen: false,
        activeSidebarItem: 'All Bookmarks',
        error: null,
        setActiveSidebarItem: vi.fn(),
        toggleAIPanel: vi.fn(),
        setFiltersPanelOpen: vi.fn(),
        setActiveTab: vi.fn(),
        setViewMode: vi.fn(),
        setIsLoading: vi.fn(),
        setAIPanelOpen: vi.fn(),
        toggleFiltersPanel: vi.fn(),
        setError: vi.fn()
      }
      return selector ? selector(state) : state
    })

    render(
      <ChakraProvider value={defaultSystem}>
        <ModalProvider>
          <CollectionsList />
        </ModalProvider>
      </ChakraProvider>
    )

    // Find the archived collection and check its count
    const archivedElement = screen.getByText('Archived')
    expect(archivedElement).toBeInTheDocument()

    // Look for the badge next to "Archived" that should show "1"
    const archivedRow = archivedElement.closest('[role="button"], div')
    expect(archivedRow).toBeInTheDocument()

    // The badge should show "1" not "6"
    const archivedBadge = archivedRow?.querySelector('[class*="badge"], [class*="Badge"]')
    if (archivedBadge) {
      expect(archivedBadge.textContent).toBe('1')
    } else {
      // If we can't find the badge by class, look for any element with "1" in the archived row
      expect(archivedRow?.textContent).toContain('1')
      expect(archivedRow?.textContent).not.toContain('6')
    }
  })

  it('should show correct starred count', () => {
    const testBookmarks = createTestBookmarks()

    mockUseBookmarkStore.mockReturnValue({
      bookmarks: testBookmarks,
      selectedTags: [],
      searchQuery: '',
      activeTab: 0,
      viewMode: 'grid',
      isLoading: false,
      isAIPanelOpen: false,
      isFiltersPanelOpen: false,
      activeSidebarItem: 'All Bookmarks',
      error: null,
      setActiveSidebarItem: vi.fn(),
      toggleAIPanel: vi.fn(),
      setFiltersPanelOpen: vi.fn(),
      setActiveTab: vi.fn(),
      setViewMode: vi.fn(),
      setIsLoading: vi.fn(),
      setAIPanelOpen: vi.fn(),
      toggleFiltersPanel: vi.fn(),
      setError: vi.fn()
    } as any)

    render(
      <ChakraProvider value={defaultSystem}>
        <ModalProvider>
          <CollectionsList />
        </ModalProvider>
      </ChakraProvider>
    )

    // Find the starred collection and check its count
    const starredElement = screen.getByText('Starred')
    expect(starredElement).toBeInTheDocument()

    const starredRow = starredElement.closest('[role="button"], div')
    expect(starredRow).toBeInTheDocument()

    // Should show "2" for starred count
    const starredBadge = starredRow?.querySelector('[class*="badge"], [class*="Badge"]')
    if (starredBadge) {
      expect(starredBadge.textContent).toBe('2')
    } else {
      expect(starredRow?.textContent).toContain('2')
    }
  })

  it('should handle edge case with all bookmarks archived', () => {
    const allArchivedBookmarks = createTestBookmarks().map(bookmark => ({
      ...bookmark,
      is_archived: true
    }))

    mockUseBookmarkStore.mockReturnValue({
      bookmarks: allArchivedBookmarks,
      selectedTags: [],
      searchQuery: '',
      activeTab: 0,
      viewMode: 'grid',
      isLoading: false,
      isAIPanelOpen: false,
      isFiltersPanelOpen: false,
      activeSidebarItem: 'All Bookmarks',
      error: null,
      setActiveSidebarItem: vi.fn(),
      toggleAIPanel: vi.fn(),
      setFiltersPanelOpen: vi.fn(),
      setActiveTab: vi.fn(),
      setViewMode: vi.fn(),
      setIsLoading: vi.fn(),
      setAIPanelOpen: vi.fn(),
      toggleFiltersPanel: vi.fn(),
      setError: vi.fn()
    } as any)

    render(
      <ChakraProvider value={defaultSystem}>
        <ModalProvider>
          <CollectionsList />
        </ModalProvider>
      </ChakraProvider>
    )

    const archivedElement = screen.getByText('Archived')
    const archivedRow = archivedElement.closest('[role="button"], div')

    // Should show "6" when all bookmarks are archived
    expect(archivedRow?.textContent).toContain('6')
  })

  it('should handle edge case with no bookmarks archived', () => {
    const noArchivedBookmarks = createTestBookmarks().map(bookmark => ({
      ...bookmark,
      is_archived: false
    }))

    mockUseBookmarkStore.mockReturnValue({
      bookmarks: noArchivedBookmarks,
      selectedTags: [],
      searchQuery: '',
      activeTab: 0,
      viewMode: 'grid',
      isLoading: false,
      isAIPanelOpen: false,
      isFiltersPanelOpen: false,
      activeSidebarItem: 'All Bookmarks',
      error: null,
      setActiveSidebarItem: vi.fn(),
      toggleAIPanel: vi.fn(),
      setFiltersPanelOpen: vi.fn(),
      setActiveTab: vi.fn(),
      setViewMode: vi.fn(),
      setIsLoading: vi.fn(),
      setAIPanelOpen: vi.fn(),
      toggleFiltersPanel: vi.fn(),
      setError: vi.fn()
    } as any)

    render(
      <ChakraProvider value={defaultSystem}>
        <ModalProvider>
          <CollectionsList />
        </ModalProvider>
      </ChakraProvider>
    )

    const archivedElement = screen.getByText('Archived')
    const archivedRow = archivedElement.closest('[role="button"], div')

    // Should show "0" when no bookmarks are archived
    expect(archivedRow?.textContent).toContain('0')
  })

  it('should handle boolean type variations correctly', () => {
    // Test with mixed boolean types (in case data comes in as strings)
    const mixedTypeBookmarks = [
      {
        ...createTestBookmarks()[0],
        is_archived: false as boolean
      },
      {
        ...createTestBookmarks()[1],
        is_archived: 'false' as any // String false
      },
      {
        ...createTestBookmarks()[2],
        is_archived: true as boolean // Should be counted
      },
      {
        ...createTestBookmarks()[3],
        is_archived: 'true' as any // String true - should be counted if normalization works
      }
    ]

    mockUseBookmarkStore.mockReturnValue({
      bookmarks: mixedTypeBookmarks,
      selectedTags: [],
      searchQuery: '',
      activeTab: 0,
      viewMode: 'grid',
      isLoading: false,
      isAIPanelOpen: false,
      isFiltersPanelOpen: false,
      activeSidebarItem: 'All Bookmarks',
      error: null,
      setActiveSidebarItem: vi.fn(),
      toggleAIPanel: vi.fn(),
      setFiltersPanelOpen: vi.fn(),
      setActiveTab: vi.fn(),
      setViewMode: vi.fn(),
      setIsLoading: vi.fn(),
      setAIPanelOpen: vi.fn(),
      toggleFiltersPanel: vi.fn(),
      setError: vi.fn()
    } as any)

    render(
      <ChakraProvider value={defaultSystem}>
        <ModalProvider>
          <CollectionsList />
        </ModalProvider>
      </ChakraProvider>
    )

    const archivedElement = screen.getByText('Archived')
    const archivedRow = archivedElement.closest('[role="button"], div')

    // Should handle both boolean true and string 'true' correctly
    // This test will reveal if there's a type handling issue
    const badgeText = archivedRow?.textContent || ''

    // The count should be 1 or 2 depending on how string 'true' is handled
    // But it definitely should NOT be 4 (all bookmarks)
    expect(badgeText).not.toContain('4')
    expect(badgeText).not.toContain('0')
  })
})