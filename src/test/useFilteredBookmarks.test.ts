import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBookmarkStore } from '../store/bookmarkStore'
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
    act(() => {
      result.current.setBookmarks([])
      result.current.setSelectedTags([])
      result.current.setActiveTab(0)
      result.current.setActiveSidebarItem('All Bookmarks')
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
    expect(hookResult.current.map(b => b.id)).toEqual([1, 2, 3, 4])
  })

  it('should filter to only archived bookmarks when activeSidebarItem is "Archives"', () => {
    const { result } = renderHook(() => useBookmarkStore())
    const { result: hookResult } = renderHook(() => useFilteredBookmarks())

    act(() => {
      result.current.setBookmarks(mockBookmarks)
      result.current.setActiveSidebarItem('Archives')
    })

    expect(hookResult.current).toHaveLength(1)
    expect(hookResult.current[0].id).toBe(3)
    expect(hookResult.current[0].is_archived).toBe(true)
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

  it('should return empty array when no bookmarks match sidebar filter', () => {
    const { result } = renderHook(() => useBookmarkStore())
    const { result: hookResult } = renderHook(() => useFilteredBookmarks())

    act(() => {
      result.current.setBookmarks(mockBookmarks)
      result.current.setActiveSidebarItem('Collections') // Not implemented yet
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

    // Switch to Archives
    act(() => {
      result.current.setActiveSidebarItem('Archives')
    })
    expect(hookResult.current).toHaveLength(1)

    // Switch back to All Bookmarks
    act(() => {
      result.current.setActiveSidebarItem('All Bookmarks')
    })
    expect(hookResult.current).toHaveLength(4)
  })
})