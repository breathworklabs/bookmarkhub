import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterReset, useFullFilterReset } from '../../src/utils/filterUtils'
import { useBookmarkStore } from '../../src/store/bookmarkStore'
import { useCollectionsStore } from '../../src/store/collectionsStore'

describe('filterUtils', () => {
  beforeEach(() => {
    // Reset stores before each test
    useBookmarkStore.getState().setActiveSidebarItem('All Bookmarks')
    useBookmarkStore.getState().setSearchQuery('')
    useBookmarkStore.getState().clearTags()
    useBookmarkStore.getState().clearAdvancedFilters()
    useBookmarkStore.getState().setActiveTab(0)
    useCollectionsStore.getState().setActiveCollection(null)
  })

  describe('useFilterReset', () => {
    it('should reset sidebar item to "All Bookmarks"', () => {
      const { result } = renderHook(() => useFilterReset())

      // Set some filter state
      act(() => {
        useBookmarkStore.getState().setActiveSidebarItem('Favorites')
      })

      expect(useBookmarkStore.getState().activeSidebarItem).toBe('Favorites')

      // Reset filters
      act(() => {
        result.current()
      })

      expect(useBookmarkStore.getState().activeSidebarItem).toBe('All Bookmarks')
    })

    it('should clear active collection', () => {
      const { result } = renderHook(() => useFilterReset())

      // Set active collection
      act(() => {
        useCollectionsStore.getState().setActiveCollection('test-collection-id')
      })

      expect(useCollectionsStore.getState().activeCollectionId).toBe('test-collection-id')

      // Reset filters
      act(() => {
        result.current()
      })

      expect(useCollectionsStore.getState().activeCollectionId).toBeNull()
    })

    it('should reset both sidebar and collection in one call', () => {
      const { result } = renderHook(() => useFilterReset())

      // Set some filter state
      act(() => {
        useBookmarkStore.getState().setActiveSidebarItem('Favorites')
        useCollectionsStore.getState().setActiveCollection('test-collection-id')
      })

      expect(useBookmarkStore.getState().activeSidebarItem).toBe('Favorites')
      expect(useCollectionsStore.getState().activeCollectionId).toBe('test-collection-id')

      // Reset filters
      act(() => {
        result.current()
      })

      expect(useBookmarkStore.getState().activeSidebarItem).toBe('All Bookmarks')
      expect(useCollectionsStore.getState().activeCollectionId).toBeNull()
    })

    it('should return stable callback (memoization)', () => {
      const { result, rerender } = renderHook(() => useFilterReset())

      const firstCallback = result.current
      rerender()
      const secondCallback = result.current

      expect(firstCallback).toBe(secondCallback)
    })
  })

  describe('useFullFilterReset', () => {
    it('should reset all filter states', () => {
      const { result } = renderHook(() => useFullFilterReset())

      // Set various filter states
      act(() => {
        useBookmarkStore.getState().setActiveSidebarItem('Favorites')
        useCollectionsStore.getState().setActiveCollection('test-collection-id')
        useBookmarkStore.getState().setSearchQuery('test query')
        useBookmarkStore.getState().setSelectedTags(['tag1', 'tag2'])
        useBookmarkStore.getState().setActiveTab(1)
      })

      // Verify states are set
      expect(useBookmarkStore.getState().activeSidebarItem).toBe('Favorites')
      expect(useCollectionsStore.getState().activeCollectionId).toBe('test-collection-id')
      expect(useBookmarkStore.getState().searchQuery).toBe('test query')
      expect(useBookmarkStore.getState().selectedTags).toEqual(['tag1', 'tag2'])
      expect(useBookmarkStore.getState().activeTab).toBe(1)

      // Full reset
      act(() => {
        result.current()
      })

      // Verify all states are reset
      expect(useBookmarkStore.getState().activeSidebarItem).toBe('All Bookmarks')
      expect(useCollectionsStore.getState().activeCollectionId).toBeNull()
      expect(useBookmarkStore.getState().searchQuery).toBe('')
      expect(useBookmarkStore.getState().selectedTags).toEqual([])
      expect(useBookmarkStore.getState().activeTab).toBe(0)
    })

    it('should clear advanced filters', () => {
      const { result } = renderHook(() => useFullFilterReset())

      // Full reset should clear advanced filters
      act(() => {
        result.current()
      })

      // Verify advanced filters are cleared (via clearAdvancedFilters action)
      expect(useBookmarkStore.getState().selectedTags).toEqual([])
    })

    it('should reset search query to empty string', () => {
      const { result } = renderHook(() => useFullFilterReset())

      act(() => {
        useBookmarkStore.getState().setSearchQuery('complex search query')
      })

      expect(useBookmarkStore.getState().searchQuery).toBe('complex search query')

      act(() => {
        result.current()
      })

      expect(useBookmarkStore.getState().searchQuery).toBe('')
    })

    it('should reset active tab to 0', () => {
      const { result } = renderHook(() => useFullFilterReset())

      act(() => {
        useBookmarkStore.getState().setActiveTab(2)
      })

      expect(useBookmarkStore.getState().activeTab).toBe(2)

      act(() => {
        result.current()
      })

      expect(useBookmarkStore.getState().activeTab).toBe(0)
    })

    it('should return stable callback (memoization)', () => {
      const { result, rerender } = renderHook(() => useFullFilterReset())

      const firstCallback = result.current
      rerender()
      const secondCallback = result.current

      expect(firstCallback).toBe(secondCallback)
    })

    it('should handle multiple consecutive resets without errors', () => {
      const { result } = renderHook(() => useFullFilterReset())

      // Set some state
      act(() => {
        useBookmarkStore.getState().setSearchQuery('test')
        useBookmarkStore.getState().setActiveTab(1)
      })

      // Reset multiple times
      act(() => {
        result.current()
        result.current()
        result.current()
      })

      // Should still be in reset state
      expect(useBookmarkStore.getState().searchQuery).toBe('')
      expect(useBookmarkStore.getState().activeTab).toBe(0)
    })
  })
})
