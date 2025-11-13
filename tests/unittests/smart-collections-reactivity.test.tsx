import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { CollectionTreeItem } from '../../src/components/collections/tree/CollectionTreeItem'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { useCollectionsStore } from '../../src/store/collectionsStore'
import type { Collection } from '../../src/types/collections'
import type { Bookmark } from '../../src/types/bookmark'

// Mock the stores
vi.mock('../../src/store/bookmarkStore')
vi.mock('../../src/store/collectionsStore')

// Mock react-dnd
vi.mock('react-dnd', () => ({
  useDrop: () => [{ isOver: false, canDrop: false }, vi.fn()],
  useDrag: () => [{ isDragging: false }, vi.fn()],
}))

// Mock logger
vi.mock('../../src/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Helper to wrap component with ChakraProvider
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>)
}

describe('Smart Collections Reactivity', () => {
  const mockBookmarks: Bookmark[] = [
    {
      id: '1',
      url: 'https://example.com/1',
      title: 'Bookmark 1',
      is_starred: true,
      is_archived: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      collections: [],
    },
    {
      id: '2',
      url: 'https://example.com/2',
      title: 'Bookmark 2',
      is_starred: true,
      is_archived: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      collections: [],
    },
    {
      id: '3',
      url: 'https://example.com/3',
      title: 'Bookmark 3',
      is_starred: false,
      is_archived: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      collections: [],
    },
  ]

  const starredCollection: Collection = {
    id: 'starred',
    name: 'Starred',
    description: 'Your starred bookmarks',
    isPrivate: false,
    isDefault: true,
    isSmartCollection: true,
    smartCriteria: { type: 'starred' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bookmarkCount: 0,
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useBookmarkStore to return our test bookmarks
    vi.mocked(useBookmarkStore).mockImplementation((selector: any) => {
      const state = {
        bookmarks: mockBookmarks,
      }
      return selector ? selector(state) : state
    })

    // Mock useCollectionsStore
    vi.mocked(useCollectionsStore).mockImplementation((selector: any) => {
      const state = {
        moveCollection: vi.fn(),
        addBookmarkToCollection: vi.fn(),
      }
      return selector ? selector(state) : state
    })
  })

  it('should display correct count for starred smart collection', () => {
    renderWithChakra(
      <CollectionTreeItem
        collection={starredCollection}
        collections={[starredCollection]}
        depth={0}
        isExpanded={false}
        isActive={false}
        activeCollectionId={null}
        expandedCollections={[]}
        collectionBookmarks={{}} // Empty - smart collections should compute from bookmarks
        onToggleExpand={vi.fn()}
        onCollectionSelect={vi.fn()}
        onOpenContextMenu={vi.fn()}
      />
    )

    // Should show count of 2 (two starred bookmarks)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should update count reactively when bookmarks change', async () => {
    const { rerender } = renderWithChakra(
      <CollectionTreeItem
        collection={starredCollection}
        collections={[starredCollection]}
        depth={0}
        isExpanded={false}
        isActive={false}
        activeCollectionId={null}
        expandedCollections={[]}
        collectionBookmarks={{}}
        onToggleExpand={vi.fn()}
        onCollectionSelect={vi.fn()}
        onOpenContextMenu={vi.fn()}
      />
    )

    // Initial count: 2
    expect(screen.getByText('2')).toBeInTheDocument()

    // Update mock to have 3 starred bookmarks
    const updatedBookmarks = [
      ...mockBookmarks,
      {
        id: '4',
        url: 'https://example.com/4',
        title: 'Bookmark 4',
        is_starred: true,
        is_archived: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        collections: [],
      },
    ]

    vi.mocked(useBookmarkStore).mockImplementation((selector: any) => {
      const state = {
        bookmarks: updatedBookmarks,
      }
      return selector ? selector(state) : state
    })

    // Force re-render
    act(() => {
      rerender(
        <ChakraProvider value={defaultSystem}>
          <CollectionTreeItem
          collection={starredCollection}
          collections={[starredCollection]}
          depth={0}
          isExpanded={false}
          isActive={false}
          activeCollectionId={null}
          expandedCollections={[]}
          collectionBookmarks={{}}
          onToggleExpand={vi.fn()}
          onCollectionSelect={vi.fn()}
          onOpenContextMenu={vi.fn()}
        />
        </ChakraProvider>
      )
    })

    // Count should update to 3
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  it('should handle archived smart collection', () => {
    const archivedCollection: Collection = {
      id: 'archived',
      name: 'Archived',
      description: 'Archived bookmarks',
      isPrivate: false,
      isDefault: true,
      isSmartCollection: true,
      smartCriteria: { type: 'archived' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookmarkCount: 0,
    }

    const bookmarksWithArchived: Bookmark[] = [
      ...mockBookmarks,
      {
        id: '4',
        url: 'https://example.com/4',
        title: 'Archived Bookmark',
        is_starred: false,
        is_archived: true,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        collections: [],
      },
    ]

    vi.mocked(useBookmarkStore).mockImplementation((selector: any) => {
      const state = {
        bookmarks: bookmarksWithArchived,
      }
      return selector ? selector(state) : state
    })

    renderWithChakra(
      <CollectionTreeItem
        collection={archivedCollection}
        collections={[archivedCollection]}
        depth={0}
        isExpanded={false}
        isActive={false}
        activeCollectionId={null}
        expandedCollections={[]}
        collectionBookmarks={{}}
        onToggleExpand={vi.fn()}
        onCollectionSelect={vi.fn()}
        onOpenContextMenu={vi.fn()}
      />
    )

    // Should show count of 1 (one archived bookmark)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should handle recent smart collection (last 7 days)', () => {
    const recentCollection: Collection = {
      id: 'recent',
      name: 'Recent',
      description: 'Recently added bookmarks',
      isPrivate: false,
      isDefault: true,
      isSmartCollection: true,
      smartCriteria: { type: 'recent', days: 7 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookmarkCount: 0,
    }

    const now = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 10)

    const bookmarksWithDates: Bookmark[] = [
      { ...mockBookmarks[0], created_at: now.toISOString() }, // Recent
      { ...mockBookmarks[1], created_at: weekAgo.toISOString() }, // Edge case
      { ...mockBookmarks[2], created_at: oldDate.toISOString() }, // Old
    ]

    vi.mocked(useBookmarkStore).mockImplementation((selector: any) => {
      const state = {
        bookmarks: bookmarksWithDates,
      }
      return selector ? selector(state) : state
    })

    renderWithChakra(
      <CollectionTreeItem
        collection={recentCollection}
        collections={[recentCollection]}
        depth={0}
        isExpanded={false}
        isActive={false}
        activeCollectionId={null}
        expandedCollections={[]}
        collectionBookmarks={{}}
        onToggleExpand={vi.fn()}
        onCollectionSelect={vi.fn()}
        onOpenContextMenu={vi.fn()}
      />
    )

    // Should show count >= 1 (at least the recent one)
    const countElement = screen.getByText(/[1-2]/)
    expect(countElement).toBeInTheDocument()
  })

  it('should use cached count for regular (non-smart) collections', () => {
    const regularCollection: Collection = {
      id: 'my-collection',
      name: 'My Collection',
      description: 'A regular collection',
      isPrivate: false,
      isDefault: false,
      isSmartCollection: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookmarkCount: 0,
    }

    const collectionBookmarks = {
      'my-collection': [1, 2, 3, 4, 5], // 5 bookmark IDs
    }

    renderWithChakra(
      <CollectionTreeItem
        collection={regularCollection}
        collections={[regularCollection]}
        depth={0}
        isExpanded={false}
        isActive={false}
        activeCollectionId={null}
        expandedCollections={[]}
        collectionBookmarks={collectionBookmarks}
        onToggleExpand={vi.fn()}
        onCollectionSelect={vi.fn()}
        onOpenContextMenu={vi.fn()}
      />
    )

    // Should use cached count of 5 from collectionBookmarks map
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
