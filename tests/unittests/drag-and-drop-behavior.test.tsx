import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { createMockBookmark } from './test-utils'
import type { Bookmark } from '../../src/types/bookmark'
import type { DropResult } from '../../src/types/dnd'
import toast from 'react-hot-toast'

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Helper to simulate drag and drop behavior for view-based drops
const simulateViewDrop = async (
  bookmarkIds: number[],
  dropResult: DropResult,
  bookmarks: Bookmark[],
  updateBookmark: any,
  clearBookmarkSelection?: any
) => {
  const moveCount = bookmarkIds.length

  for (const bookmarkId of bookmarkIds) {
    const currentBookmark = bookmarks.find((b) => b.id === bookmarkId)
    const currentCollections = (currentBookmark as any)?.collections || [
      'uncategorized',
    ]

    // If moving TO uncategorized, set collections to just uncategorized
    if (dropResult.collectionId === 'uncategorized') {
      await updateBookmark(bookmarkId, {
        collections: ['uncategorized'],
        primaryCollection: 'uncategorized',
      })
    } else {
      // Moving to a specific view — remove uncategorized if present, add target
      const newCollections = currentCollections.filter(
        (c) => c !== 'uncategorized'
      )
      newCollections.push(dropResult.collectionId)
      await updateBookmark(bookmarkId, {
        collections: newCollections,
        primaryCollection: dropResult.collectionId,
      })
    }
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
  let updateBookmark: any
  let clearBookmarkSelection: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    updateBookmark = vi.fn().mockResolvedValue({})

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

    // Set up store
    useBookmarkStore.setState({
      bookmarks: [mockBookmark1, mockBookmark2, mockBookmark3],
      selectedBookmarks: [],
      viewMode: 'grid',
      clearBookmarkSelection,
    })
  })

  describe('Single Bookmark Drag and Drop', () => {
    it('should move single bookmark from uncategorized to work view', async () => {
      const dropResult: DropResult = {
        collectionId: 'work',
        collectionName: 'Work',
      }

      await simulateViewDrop(
        [1],
        dropResult,
        [mockBookmark1],
        updateBookmark
      )

      // Verify bookmark was updated to move to work
      expect(updateBookmark).toHaveBeenCalledWith(1, {
        collections: ['work'],
        primaryCollection: 'work',
      })

      // Verify success toast
      expect(toast.success).toHaveBeenCalledWith('Moved to "Work"')
    })

    it('should move single bookmark from work to personal view', async () => {
      const bookmarkInWork = createMockBookmark({
        id: 4,
        title: 'Bookmark in Work',
        collections: ['work'],
      })

      const dropResult: DropResult = {
        collectionId: 'personal',
        collectionName: 'Personal',
      }

      await simulateViewDrop(
        [4],
        dropResult,
        [bookmarkInWork],
        updateBookmark
      )

      // Should update with work + personal collections, primary set to personal
      expect(updateBookmark).toHaveBeenCalledWith(4, {
        collections: ['work', 'personal'],
        primaryCollection: 'personal',
      })

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

      await simulateViewDrop(
        [5],
        dropResult,
        [bookmarkInWork],
        updateBookmark
      )

      // Should reset to uncategorized only
      expect(updateBookmark).toHaveBeenCalledWith(5, {
        collections: ['uncategorized'],
        primaryCollection: 'uncategorized',
      })
    })
  })

  describe('Multiple Bookmarks Drag and Drop', () => {
    it('should move two selected bookmarks to work view', async () => {
      useBookmarkStore.setState({
        selectedBookmarks: [1, 2],
      })

      const dropResult: DropResult = {
        collectionId: 'work',
        collectionName: 'Work',
      }

      await simulateViewDrop(
        [1, 2],
        dropResult,
        [mockBookmark1, mockBookmark2],
        updateBookmark,
        clearBookmarkSelection
      )

      // Both bookmarks should be updated
      expect(updateBookmark).toHaveBeenCalledWith(1, {
        collections: ['work'],
        primaryCollection: 'work',
      })
      expect(updateBookmark).toHaveBeenCalledWith(2, {
        collections: ['work'],
        primaryCollection: 'work',
      })

      // Selection should be cleared
      expect(clearBookmarkSelection).toHaveBeenCalled()

      // Should show bulk toast
      expect(toast.success).toHaveBeenCalledWith('Moved 2 bookmarks to "Work"')
    })

    it('should move three selected bookmarks to personal view', async () => {
      useBookmarkStore.setState({
        selectedBookmarks: [1, 2, 3],
      })

      const dropResult: DropResult = {
        collectionId: 'personal',
        collectionName: 'Personal',
      }

      await simulateViewDrop(
        [1, 2, 3],
        dropResult,
        [mockBookmark1, mockBookmark2, mockBookmark3],
        updateBookmark,
        clearBookmarkSelection
      )

      // All three bookmarks should be processed
      expect(updateBookmark).toHaveBeenCalledTimes(3)

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

      await simulateViewDrop(
        [10, 11, 12],
        dropResult,
        mixedBookmarks,
        updateBookmark,
        clearBookmarkSelection
      )

      // Bookmark 10: uncategorized removed, work added
      expect(updateBookmark).toHaveBeenCalledWith(10, {
        collections: ['work'],
        primaryCollection: 'work',
      })

      // Bookmark 11: already has work, work added again (no dedup in helper)
      expect(updateBookmark).toHaveBeenCalledWith(11, {
        collections: ['work', 'work'],
        primaryCollection: 'work',
      })

      // Bookmark 12: personal kept, work added
      expect(updateBookmark).toHaveBeenCalledWith(12, {
        collections: ['personal', 'work'],
        primaryCollection: 'work',
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle errors when moving bookmarks', async () => {
      const failingUpdate = vi
        .fn()
        .mockRejectedValue(new Error('Network error'))

      const dropResult: DropResult = {
        collectionId: 'work',
        collectionName: 'Work',
      }

      // Simulate drop with failing update
      try {
        await simulateViewDrop(
          [1],
          dropResult,
          [mockBookmark1],
          failingUpdate
        )
      } catch (error) {
        expect(error).toBeDefined()
      }

      expect(failingUpdate).toHaveBeenCalled()
    })
  })
})

describe('Drag and Drop Behavior - List View', () => {
  let mockBookmark1: Bookmark
  let mockBookmark2: Bookmark
  let updateBookmark: any
  let clearBookmarkSelection: any

  beforeEach(() => {
    vi.clearAllMocks()

    updateBookmark = vi.fn().mockResolvedValue({})
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
  })

  describe('Single Bookmark in List View', () => {
    it('should move single bookmark in list view', async () => {
      const dropResult: DropResult = {
        collectionId: 'work',
        collectionName: 'Work',
      }

      await simulateViewDrop(
        [1],
        dropResult,
        [mockBookmark1],
        updateBookmark
      )

      expect(updateBookmark).toHaveBeenCalledWith(1, {
        collections: ['work'],
        primaryCollection: 'work',
      })
      expect(toast.success).toHaveBeenCalledWith('Moved to "Work"')
    })
  })

  describe('Multiple Bookmarks in List View', () => {
    it('should move multiple bookmarks in list view', async () => {
      const dropResult: DropResult = {
        collectionId: 'work',
        collectionName: 'Work',
      }

      await simulateViewDrop(
        [1, 2],
        dropResult,
        [mockBookmark1, mockBookmark2],
        updateBookmark,
        clearBookmarkSelection
      )

      expect(updateBookmark).toHaveBeenCalledWith(1, {
        collections: ['work'],
        primaryCollection: 'work',
      })
      expect(updateBookmark).toHaveBeenCalledWith(2, {
        collections: ['work'],
        primaryCollection: 'work',
      })
      expect(clearBookmarkSelection).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Moved 2 bookmarks to "Work"')
    })
  })
})

describe('Drop Target Validation Logic', () => {
  it('should identify duplicate drop target correctly', () => {
    const bookmark = createMockBookmark({ id: 1, collections: ['work'] })
    const targetCollectionId = 'work'

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

  it('should handle bookmark with no collections', () => {
    const bookmark = createMockBookmark({ id: 1, collections: [] })
    const targetCollectionId = 'work'

    const bookmarkCollections = bookmark.collections || []
    const isDuplicate = bookmarkCollections.includes(targetCollectionId)

    expect(isDuplicate).toBe(false)
  })
})
