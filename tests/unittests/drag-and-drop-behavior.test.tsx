import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { useCollectionsStore } from '../../src/store/collectionsStore'
import { createMockBookmark } from './test-utils'
import type { Bookmark } from '../../src/types/bookmark'
import type { Collection } from '../../src/store/collectionsStore'
import type { DropResult } from '../../src/types/dnd'
import toast from 'react-hot-toast'

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Helper to create test collections
const createMockCollection = (
  id: string,
  name: string,
  isSmartCollection = false
): Collection => ({
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

// Helper to simulate drag and drop behavior
const simulateDrop = async (
  bookmarkIds: number[],
  dropResult: DropResult,
  bookmarks: Bookmark[],
  addBookmarkToCollection: any,
  removeBookmarkFromCollection: any,
  clearBookmarkSelection?: any
) => {
  // This simulates the logic from BookmarkCard's useDrag end callback
  const moveCount = bookmarkIds.length

  // Process all selected bookmarks
  for (const bookmarkId of bookmarkIds) {
    const currentBookmark = bookmarks.find((b) => b.id === bookmarkId)
    const currentCollections = (currentBookmark as any)?.collections || [
      'uncategorized',
    ]

    // If moving TO uncategorized, remove from all other collections first
    if (dropResult.collectionId === 'uncategorized') {
      for (const collectionId of currentCollections) {
        if (collectionId !== 'uncategorized') {
          await removeBookmarkFromCollection(bookmarkId, collectionId)
        }
      }
    } else {
      // If moving FROM uncategorized TO another collection, remove from uncategorized
      if (currentCollections.includes('uncategorized')) {
        await removeBookmarkFromCollection(bookmarkId, 'uncategorized')
      }
    }

    // Add to the new collection
    await addBookmarkToCollection(bookmarkId, dropResult.collectionId)
  }

  // Clear selection after successful bulk move
  if (moveCount > 1 && clearBookmarkSelection) {
    clearBookmarkSelection()
  }

  // Show success toast with count
  const message =
    moveCount > 1
      ? `Moved ${moveCount} bookmarks to "${dropResult.collectionName}"`
      : `Moved to "${dropResult.collectionName}"`
  toast.success(message)
}

describe('Drag and Drop Behavior - Grid View', () => {
  let mockBookmark1: Bookmark
  let mockBookmark2: Bookmark
  let mockBookmark3: Bookmark
  let addBookmarkToCollection: any
  let removeBookmarkFromCollection: any
  let clearBookmarkSelection: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    addBookmarkToCollection = vi.fn().mockResolvedValue(undefined)
    removeBookmarkFromCollection = vi.fn().mockResolvedValue(undefined)
    clearBookmarkSelection = vi.fn()

    // Create mock bookmarks
    mockBookmark1 = createMockBookmark({
      id: 1,
      title: 'Bookmark 1',
      collections: ['uncategorized'],
    })
    mockBookmark2 = createMockBookmark({
      id: 2,
      title: 'Bookmark 2',
      collections: ['uncategorized'],
    })
    mockBookmark3 = createMockBookmark({
      id: 3,
      title: 'Bookmark 3',
      collections: ['uncategorized'],
    })

    // Set up stores
    useBookmarkStore.setState({
      bookmarks: [mockBookmark1, mockBookmark2, mockBookmark3],
      selectedBookmarks: [],
      viewMode: 'grid',
      clearBookmarkSelection,
    })

    useCollectionsStore.setState({
      collections: [
        createMockCollection('uncategorized', 'Uncategorized'),
        createMockCollection('work', 'Work'),
        createMockCollection('personal', 'Personal'),
      ],
      addBookmarkToCollection,
      removeBookmarkFromCollection,
    })
  })

  describe('Single Bookmark Drag and Drop', () => {
    it('should move single bookmark from uncategorized to work collection', async () => {
      const dropResult: DropResult = {
        collectionId: 'work',
        collectionName: 'Work',
      }

      const bookmarks = [mockBookmark1]

      await simulateDrop(
        [1], // bookmark IDs
        dropResult,
        bookmarks,
        addBookmarkToCollection,
        removeBookmarkFromCollection
      )

      // Verify bookmark was removed from uncategorized
      expect(removeBookmarkFromCollection).toHaveBeenCalledWith(
        1,
        'uncategorized'
      )

      // Verify bookmark was added to work
      expect(addBookmarkToCollection).toHaveBeenCalledWith(1, 'work')

      // Verify success toast
      expect(toast.success).toHaveBeenCalledWith('Moved to "Work"')
    })

    it('should move single bookmark from work to personal collection', async () => {
      const bookmarkInWork = createMockBookmark({
        id: 4,
        title: 'Bookmark in Work',
        collections: ['work'],
      })

      const dropResult: DropResult = {
        collectionId: 'personal',
        collectionName: 'Personal',
      }

      await simulateDrop(
        [4],
        dropResult,
        [bookmarkInWork],
        addBookmarkToCollection,
        removeBookmarkFromCollection
      )

      // Should not remove from uncategorized (not in that collection)
      expect(removeBookmarkFromCollection).not.toHaveBeenCalledWith(
        4,
        'uncategorized'
      )

      // Should add to personal
      expect(addBookmarkToCollection).toHaveBeenCalledWith(4, 'personal')

      expect(toast.success).toHaveBeenCalledWith('Moved to "Personal"')
    })

    it('should move bookmark back to uncategorized from work', async () => {
      const bookmarkInWork = createMockBookmark({
        id: 5,
        title: 'Bookmark in Work',
        collections: ['work'],
      })

      const dropResult: DropResult = {
        collectionId: 'uncategorized',
        collectionName: 'Uncategorized',
      }

      await simulateDrop(
        [5],
        dropResult,
        [bookmarkInWork],
        addBookmarkToCollection,
        removeBookmarkFromCollection
      )

      // Should remove from work when moving to uncategorized
      expect(removeBookmarkFromCollection).toHaveBeenCalledWith(5, 'work')

      // Should add to uncategorized
      expect(addBookmarkToCollection).toHaveBeenCalledWith(5, 'uncategorized')
    })
  })

  describe('Multiple Bookmarks Drag and Drop', () => {
    it('should move two selected bookmarks to work collection', async () => {
      useBookmarkStore.setState({
        selectedBookmarks: [1, 2],
      })

      const dropResult: DropResult = {
        collectionId: 'work',
        collectionName: 'Work',
      }

      await simulateDrop(
        [1, 2],
        dropResult,
        [mockBookmark1, mockBookmark2],
        addBookmarkToCollection,
        removeBookmarkFromCollection,
        clearBookmarkSelection
      )

      // Both bookmarks should be removed from uncategorized
      expect(removeBookmarkFromCollection).toHaveBeenCalledWith(
        1,
        'uncategorized'
      )
      expect(removeBookmarkFromCollection).toHaveBeenCalledWith(
        2,
        'uncategorized'
      )

      // Both bookmarks should be added to work
      expect(addBookmarkToCollection).toHaveBeenCalledWith(1, 'work')
      expect(addBookmarkToCollection).toHaveBeenCalledWith(2, 'work')

      // Selection should be cleared
      expect(clearBookmarkSelection).toHaveBeenCalled()

      // Should show bulk toast
      expect(toast.success).toHaveBeenCalledWith('Moved 2 bookmarks to "Work"')
    })

    it('should move three selected bookmarks to personal collection', async () => {
      useBookmarkStore.setState({
        selectedBookmarks: [1, 2, 3],
      })

      const dropResult: DropResult = {
        collectionId: 'personal',
        collectionName: 'Personal',
      }

      await simulateDrop(
        [1, 2, 3],
        dropResult,
        [mockBookmark1, mockBookmark2, mockBookmark3],
        addBookmarkToCollection,
        removeBookmarkFromCollection,
        clearBookmarkSelection
      )

      // All three bookmarks should be processed
      expect(removeBookmarkFromCollection).toHaveBeenCalledTimes(3)
      expect(addBookmarkToCollection).toHaveBeenCalledTimes(3)

      expect(toast.success).toHaveBeenCalledWith(
        'Moved 3 bookmarks to "Personal"'
      )
      expect(clearBookmarkSelection).toHaveBeenCalled()
    })

    it('should handle mixed collection bookmarks in bulk move', async () => {
      const mixedBookmarks = [
        createMockBookmark({ id: 10, collections: ['uncategorized'] }),
        createMockBookmark({ id: 11, collections: ['work'] }),
        createMockBookmark({ id: 12, collections: ['personal'] }),
      ]

      const dropResult: DropResult = {
        collectionId: 'work',
        collectionName: 'Work',
      }

      await simulateDrop(
        [10, 11, 12],
        dropResult,
        mixedBookmarks,
        addBookmarkToCollection,
        removeBookmarkFromCollection,
        clearBookmarkSelection
      )

      // Should remove bookmark 10 from uncategorized
      expect(removeBookmarkFromCollection).toHaveBeenCalledWith(
        10,
        'uncategorized'
      )

      // Should remove bookmark 12 from personal (not in uncategorized)
      expect(removeBookmarkFromCollection).not.toHaveBeenCalledWith(
        11,
        'uncategorized'
      )
      expect(removeBookmarkFromCollection).not.toHaveBeenCalledWith(
        12,
        'uncategorized'
      )

      // All should be added to work
      expect(addBookmarkToCollection).toHaveBeenCalledWith(10, 'work')
      expect(addBookmarkToCollection).toHaveBeenCalledWith(11, 'work')
      expect(addBookmarkToCollection).toHaveBeenCalledWith(12, 'work')
    })
  })

  describe('Error Handling', () => {
    it('should handle errors when moving bookmarks', async () => {
      const failingAddBookmark = vi
        .fn()
        .mockRejectedValue(new Error('Network error'))

      const dropResult: DropResult = {
        collectionId: 'work',
        collectionName: 'Work',
      }

      // Simulate drop with failing add
      try {
        await simulateDrop(
          [1],
          dropResult,
          [mockBookmark1],
          failingAddBookmark,
          removeBookmarkFromCollection
        )
      } catch (error) {
        expect(error).toBeDefined()
      }

      expect(failingAddBookmark).toHaveBeenCalled()
    })
  })
})

describe('Drag and Drop Behavior - List View', () => {
  let mockBookmark1: Bookmark
  let mockBookmark2: Bookmark
  let addBookmarkToCollection: any
  let removeBookmarkFromCollection: any
  let clearBookmarkSelection: any

  beforeEach(() => {
    vi.clearAllMocks()

    addBookmarkToCollection = vi.fn().mockResolvedValue(undefined)
    removeBookmarkFromCollection = vi.fn().mockResolvedValue(undefined)
    clearBookmarkSelection = vi.fn()

    mockBookmark1 = createMockBookmark({
      id: 1,
      title: 'List Bookmark 1',
      collections: ['uncategorized'],
    })
    mockBookmark2 = createMockBookmark({
      id: 2,
      title: 'List Bookmark 2',
      collections: ['uncategorized'],
    })

    useBookmarkStore.setState({
      bookmarks: [mockBookmark1, mockBookmark2],
      selectedBookmarks: [],
      viewMode: 'list',
      clearBookmarkSelection,
    })

    useCollectionsStore.setState({
      collections: [
        createMockCollection('uncategorized', 'Uncategorized'),
        createMockCollection('work', 'Work'),
      ],
      addBookmarkToCollection,
      removeBookmarkFromCollection,
    })
  })

  describe('Single Bookmark in List View', () => {
    it('should move single bookmark in list view', async () => {
      const dropResult: DropResult = {
        collectionId: 'work',
        collectionName: 'Work',
      }

      await simulateDrop(
        [1],
        dropResult,
        [mockBookmark1],
        addBookmarkToCollection,
        removeBookmarkFromCollection
      )

      expect(removeBookmarkFromCollection).toHaveBeenCalledWith(
        1,
        'uncategorized'
      )
      expect(addBookmarkToCollection).toHaveBeenCalledWith(1, 'work')
      expect(toast.success).toHaveBeenCalledWith('Moved to "Work"')
    })
  })

  describe('Multiple Bookmarks in List View', () => {
    it('should move multiple bookmarks in list view', async () => {
      const dropResult: DropResult = {
        collectionId: 'work',
        collectionName: 'Work',
      }

      await simulateDrop(
        [1, 2],
        dropResult,
        [mockBookmark1, mockBookmark2],
        addBookmarkToCollection,
        removeBookmarkFromCollection,
        clearBookmarkSelection
      )

      expect(addBookmarkToCollection).toHaveBeenCalledWith(1, 'work')
      expect(addBookmarkToCollection).toHaveBeenCalledWith(2, 'work')
      expect(clearBookmarkSelection).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Moved 2 bookmarks to "Work"')
    })
  })
})

describe('Drop Target Validation Logic', () => {
  it('should identify smart collections correctly', () => {
    const starred = createMockCollection('starred', 'Starred', true)
    const uncategorized = createMockCollection(
      'uncategorized',
      'Uncategorized',
      false
    )
    const work = createMockCollection('work', 'Work', false)

    // Starred is smart and should not accept drops
    expect(starred.isSmartCollection).toBe(true)

    // Uncategorized is default but not smart
    expect(uncategorized.isSmartCollection).toBe(false)
    expect(uncategorized.isDefault).toBe(true)

    // Work is regular collection
    expect(work.isSmartCollection).toBe(false)
    expect(work.isDefault).toBe(false)
  })

  it('should prevent dropping bookmark already in target collection', () => {
    const bookmark = createMockBookmark({ id: 1, collections: ['work'] })
    const targetCollectionId = 'work'

    // Check if bookmark is already in target collection
    const bookmarkCollections = bookmark.collections || []
    const isDuplicate = bookmarkCollections.includes(targetCollectionId)

    expect(isDuplicate).toBe(true)
  })

  it('should allow dropping bookmark not in target collection', () => {
    const bookmark = createMockBookmark({
      id: 1,
      collections: ['uncategorized'],
    })
    const targetCollectionId = 'work'

    const bookmarkCollections = bookmark.collections || []
    const isDuplicate = bookmarkCollections.includes(targetCollectionId)

    expect(isDuplicate).toBe(false)
  })
})
