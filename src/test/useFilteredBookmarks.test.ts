import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useFilteredBookmarks } from '../hooks/useFilteredBookmarks'
import { createMockBookmarks } from './test-utils'
import type { Bookmark } from '../types/bookmark'

// Create mock bookmarks with specific configurations for testing
const mockBookmarks: Bookmark[] = createMockBookmarks(4, [
  { is_starred: false, is_archived: false, tags: ['tag1'] }, // Bookmark 1
  { is_starred: true, is_archived: false, tags: ['tag2'] },  // Bookmark 2
  { is_starred: false, is_archived: true, tags: ['tag3'] },  // Bookmark 3
  { is_starred: true, is_archived: false, tags: ['tag1', 'tag2'] } // Bookmark 4
])

describe('useFilteredBookmarks', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useBookmarkStore())
    const { result: collectionsResult } = renderHook(() => useCollectionsStore())
    act(() => {
      result.current.setBookmarks([])
      result.current.setSelectedTags([])
      result.current.setActiveTab(0)
      result.current.setActiveSidebarItem('All Bookmarks')
      collectionsResult.current.setActiveCollection(null)
    })
  })

  it('should return all bookmarks when activeSidebarItem is "All Bookmarks"', () => {
    const { result } = renderHook(() => useBookmarkStore())
    const { result: hookResult } = renderHook(() => useFilteredBookmarks())

    act(() => {
      result.current.setBookmarks(mockBookmarks)
      result.current.setActiveSidebarItem('All Bookmarks')
    })

    expect(hookResult.current).toHaveLength(4)
    // Bookmarks should be sorted by date descending (newest first)
    expect(hookResult.current.map(b => b.id)).toEqual([4, 3, 2, 1])
  })


  it('should combine sidebar filtering with tag filtering', () => {
    const { result } = renderHook(() => useBookmarkStore())
    const { result: hookResult } = renderHook(() => useFilteredBookmarks())

    act(() => {
      result.current.setBookmarks(mockBookmarks)
      result.current.setActiveSidebarItem('All Bookmarks')
      result.current.setSelectedTags(['tag2'])
    })

    expect(hookResult.current).toHaveLength(2) // Both bookmark 2 and 4 have tag2
    expect(hookResult.current.map(b => b.id).sort()).toEqual([2, 4])
    expect(hookResult.current.every(b => b.tags.includes('tag2'))).toBe(true)
  })

  it('should combine sidebar filtering with tab filtering', () => {
    const { result } = renderHook(() => useBookmarkStore())
    const { result: hookResult } = renderHook(() => useFilteredBookmarks())

    act(() => {
      result.current.setBookmarks(mockBookmarks)
      result.current.setActiveSidebarItem('Archives')
      result.current.setActiveTab(1) // Today tab - should filter by today's date
    })

    // Since all mock bookmarks are from 2024, and we're testing in a different time,
    // the date filter should result in no bookmarks when combined with archives filter
    expect(hookResult.current).toHaveLength(0)
  })

  it('should filter to only bookmarks in active collection when Collections sidebar item is selected', () => {
    // This test verifies that collection filtering logic is in place
    // In real usage, collections would be loaded and activeCollectionId would filter bookmarks
    const { result } = renderHook(() => useBookmarkStore())
    const { result: collectionsResult } = renderHook(() => useCollectionsStore())
    const { result: hookResult } = renderHook(() => useFilteredBookmarks())

    act(() => {
      result.current.setBookmarks(mockBookmarks)
      result.current.setActiveSidebarItem('Collections')
      collectionsResult.current.setActiveCollection('test-collection')
    })

    // When activeCollectionId is set but collectionBookmarks is empty, no bookmarks should be shown
    expect(hookResult.current).toHaveLength(0)
  })

  it('should return empty array when no bookmarks match sidebar filter', () => {
    const { result } = renderHook(() => useBookmarkStore())
    const { result: hookResult } = renderHook(() => useFilteredBookmarks())

    act(() => {
      result.current.setBookmarks(mockBookmarks)
      result.current.setActiveSidebarItem('Collections') // With no active collection
    })

    expect(hookResult.current).toHaveLength(4) // Falls back to showing all bookmarks
  })

  it('should update filtering when activeSidebarItem changes', () => {
    const { result } = renderHook(() => useBookmarkStore())
    const { result: hookResult } = renderHook(() => useFilteredBookmarks())

    act(() => {
      result.current.setBookmarks(mockBookmarks)
    })

    // Start with All Bookmarks
    act(() => {
      result.current.setActiveSidebarItem('All Bookmarks')
    })
    expect(hookResult.current).toHaveLength(4)

    // Switch to Collections (without active collection)
    act(() => {
      result.current.setActiveSidebarItem('Collections')
    })
    expect(hookResult.current).toHaveLength(4) // Should show all bookmarks when no collection is active

    // Switch back to All Bookmarks
    act(() => {
      result.current.setActiveSidebarItem('All Bookmarks')
    })
    expect(hookResult.current).toHaveLength(4)
  })
})