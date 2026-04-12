import { useCallback } from 'react'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useViewStore } from '@/store/viewStore'
import { SYSTEM_VIEWS } from '@/types/views'

/**
 * Utility hook for resetting filters to default state
 * Eliminates the repetitive pattern of:
 * setActiveSidebarItem('All Bookmarks') + setActiveCollection(null)
 * that appears in 29 locations across 9 files
 */
export const useFilterReset = () => {
  const setActiveSidebarItem = useBookmarkStore(
    (state) => state.setActiveSidebarItem
  )

  return useCallback(() => {
    setActiveSidebarItem('All Bookmarks')
    useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)
  }, [setActiveSidebarItem])
}

/**
 * Utility hook for resetting all filters to default state
 * More comprehensive reset that clears all filter states
 */
export const useFullFilterReset = () => {
  const setActiveSidebarItem = useBookmarkStore(
    (state) => state.setActiveSidebarItem
  )
  const clearAdvancedFilters = useBookmarkStore(
    (state) => state.clearAdvancedFilters
  )
  const clearTags = useBookmarkStore((state) => state.clearTags)
  const setSearchQuery = useBookmarkStore((state) => state.setSearchQuery)
  const setActiveTab = useBookmarkStore((state) => state.setActiveTab)

  return useCallback(() => {
    setActiveSidebarItem('All Bookmarks')
    useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)
    clearAdvancedFilters()
    clearTags()
    setSearchQuery('')
    setActiveTab(0) // Reset to "All" tab
  }, [
    setActiveSidebarItem,
    clearAdvancedFilters,
    clearTags,
    setSearchQuery,
    setActiveTab,
  ])
}
