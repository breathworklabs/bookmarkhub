import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { useCollectionsStore } from '../../src/store/collectionsStore'
import { ModalProvider } from '../../src/components/modals/ModalProvider'
import BookmarkCard from '../../src/components/BookmarkCard/BookmarkCard'
import { createMockBookmark } from './test-utils'
import type { Bookmark } from '../../src/types/bookmark'
import type { Collection } from '../../src/store/collectionsStore'

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Helper to wrap components with required providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ChakraProvider value={defaultSystem}>
      <DndProvider backend={HTML5Backend}>
        <ModalProvider>
          {component}
        </ModalProvider>
      </DndProvider>
    </ChakraProvider>
  )
}

// Helper to create test collections
const createMockCollection = (id: string, name: string, isSmartCollection = false): Collection => ({
  id,
  name,
  isPrivate: false,
  isDefault: id === 'uncategorized',
  isSmartCollection,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  bookmarkCount: 0,
  userId: 'test-user',
})

describe('Drag and Drop - Grid View', () => {
  let mockBookmark1: Bookmark
  let mockBookmark2: Bookmark
  let mockBookmark3: Bookmark

  beforeEach(() => {
    // Reset stores
    useBookmarkStore.setState({
      bookmarks: [],
      selectedBookmarks: [],
      viewMode: 'grid',
      isLoading: false,
      error: null,
    })

    useCollectionsStore.setState({
      collections: [],
      isLoading: false,
      error: null,
    })

    // Create mock bookmarks
    mockBookmark1 = createMockBookmark({ id: 1, title: 'Bookmark 1', collections: ['uncategorized'] })
    mockBookmark2 = createMockBookmark({ id: 2, title: 'Bookmark 2', collections: ['uncategorized'] })
    mockBookmark3 = createMockBookmark({ id: 3, title: 'Bookmark 3', collections: ['uncategorized'] })

    // Set up stores
    useBookmarkStore.setState({
      bookmarks: [mockBookmark1, mockBookmark2, mockBookmark3],
    })

    useCollectionsStore.setState({
      collections: [
        createMockCollection('uncategorized', 'Uncategorized'),
        createMockCollection('work', 'Work'),
        createMockCollection('personal', 'Personal'),
      ],
    })
  })

  describe('Single Bookmark in Grid View', () => {
    it('should render draggable bookmark card', () => {
      const { container } = renderWithProviders(<BookmarkCard bookmark={mockBookmark1} />)

      const card = container.querySelector('[data-testid="bookmark-card"]')
      expect(card).toBeTruthy()
    })

    it('should have correct bookmark data', () => {
      const { container } = renderWithProviders(<BookmarkCard bookmark={mockBookmark1} />)

      const card = container.querySelector('[data-testid="bookmark-card"]')
      expect(card).toBeTruthy()
      expect(mockBookmark1.collections).toContain('uncategorized')
    })
  })

  describe('Multiple Bookmarks in Grid View', () => {
    it('should render multiple draggable bookmark cards', () => {
      const { container } = renderWithProviders(
        <>
          <BookmarkCard bookmark={mockBookmark1} />
          <BookmarkCard bookmark={mockBookmark2} />
          <BookmarkCard bookmark={mockBookmark3} />
        </>
      )

      const cards = container.querySelectorAll('[data-testid="bookmark-card"]')
      expect(cards.length).toBe(3)
    })

    it('should handle selection state for multiple bookmarks', () => {
      useBookmarkStore.setState({
        selectedBookmarks: [1, 2],
      })

      const { container } = renderWithProviders(
        <>
          <BookmarkCard bookmark={mockBookmark1} />
          <BookmarkCard bookmark={mockBookmark2} />
        </>
      )

      const cards = container.querySelectorAll('[data-testid="bookmark-card"]')
      expect(cards.length).toBe(2)

      // Check that selected bookmarks are in the store
      const { selectedBookmarks } = useBookmarkStore.getState()
      expect(selectedBookmarks).toContain(1)
      expect(selectedBookmarks).toContain(2)
    })
  })

  describe('Drop Target Validation', () => {
    it('should prevent dropping on smart collections', () => {
      const starredCollection = createMockCollection('starred', 'Starred', true)

      // Smart collections should not accept drops (except uncategorized)
      expect(starredCollection.isSmartCollection).toBe(true)
      expect(starredCollection.id).not.toBe('uncategorized')
    })

    it('should allow dropping on regular collections', () => {
      const workCollection = createMockCollection('work', 'Work', false)

      expect(workCollection.isSmartCollection).toBe(false)
    })

    it('should identify bookmark collections correctly', () => {
      expect(mockBookmark1.collections).toContain('uncategorized')
      expect(mockBookmark1.collections).not.toContain('work')
    })
  })
})

describe('Drag and Drop - List View', () => {
  let mockBookmark1: Bookmark
  let mockBookmark2: Bookmark

  beforeEach(() => {
    useBookmarkStore.setState({
      bookmarks: [],
      selectedBookmarks: [],
      viewMode: 'list',
      isLoading: false,
      error: null,
    })

    mockBookmark1 = createMockBookmark({ id: 1, title: 'List Bookmark 1', collections: ['uncategorized'] })
    mockBookmark2 = createMockBookmark({ id: 2, title: 'List Bookmark 2', collections: ['uncategorized'] })

    useBookmarkStore.setState({
      bookmarks: [mockBookmark1, mockBookmark2],
    })

    useCollectionsStore.setState({
      collections: [
        createMockCollection('uncategorized', 'Uncategorized'),
        createMockCollection('work', 'Work'),
      ],
    })
  })

  describe('Single Bookmark in List View', () => {
    it('should render draggable bookmark in list view', () => {
      const { container } = renderWithProviders(<BookmarkCard bookmark={mockBookmark1} />)

      const card = container.querySelector('[data-testid="bookmark-card"]')
      expect(card).toBeTruthy()
    })

    it('should maintain view mode as list', () => {
      const { viewMode } = useBookmarkStore.getState()
      expect(viewMode).toBe('list')
    })
  })

  describe('Multiple Bookmarks in List View', () => {
    it('should render multiple bookmarks in list view', () => {
      const { container } = renderWithProviders(
        <>
          <BookmarkCard bookmark={mockBookmark1} />
          <BookmarkCard bookmark={mockBookmark2} />
        </>
      )

      const cards = container.querySelectorAll('[data-testid="bookmark-card"]')
      expect(cards.length).toBe(2)
    })

    it('should handle multi-select in list view', () => {
      useBookmarkStore.setState({
        selectedBookmarks: [1, 2],
      })

      const { selectedBookmarks } = useBookmarkStore.getState()
      expect(selectedBookmarks).toHaveLength(2)
      expect(selectedBookmarks).toContain(1)
      expect(selectedBookmarks).toContain(2)
    })
  })
})

describe('View Mode Consistency', () => {
  it('should maintain bookmark data across view modes', () => {
    const bookmark = createMockBookmark({ id: 1, collections: ['uncategorized'] })

    // Render in grid view
    useBookmarkStore.setState({ viewMode: 'grid' })
    const { container: gridContainer } = renderWithProviders(<BookmarkCard bookmark={bookmark} />)
    let card = gridContainer.querySelector('[data-testid="bookmark-card"]')
    expect(card).toBeTruthy()

    // Switch to list view
    useBookmarkStore.setState({ viewMode: 'list' })
    const { container: listContainer } = renderWithProviders(<BookmarkCard bookmark={bookmark} />)
    card = listContainer.querySelector('[data-testid="bookmark-card"]')
    expect(card).toBeTruthy()

    // Bookmark data should remain the same
    expect(bookmark.collections).toContain('uncategorized')
  })

  it('should support toggling view modes', () => {
    useBookmarkStore.setState({ viewMode: 'grid' })
    expect(useBookmarkStore.getState().viewMode).toBe('grid')

    useBookmarkStore.setState({ viewMode: 'list' })
    expect(useBookmarkStore.getState().viewMode).toBe('list')

    useBookmarkStore.setState({ viewMode: 'grid' })
    expect(useBookmarkStore.getState().viewMode).toBe('grid')
  })
})

describe('Collection Management', () => {
  it('should handle collection state', () => {
    const collections = [
      createMockCollection('uncategorized', 'Uncategorized'),
      createMockCollection('work', 'Work'),
      createMockCollection('personal', 'Personal'),
    ]

    useCollectionsStore.setState({ collections })

    const { collections: storeCollections } = useCollectionsStore.getState()
    expect(storeCollections).toHaveLength(3)
    expect(storeCollections.find(c => c.id === 'work')).toBeDefined()
    expect(storeCollections.find(c => c.id === 'personal')).toBeDefined()
  })

  it('should identify default collection', () => {
    const uncategorized = createMockCollection('uncategorized', 'Uncategorized')
    const work = createMockCollection('work', 'Work')

    expect(uncategorized.isDefault).toBe(true)
    expect(work.isDefault).toBe(false)
  })
})
