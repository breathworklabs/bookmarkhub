import { useMemo } from 'react'
import { type Bookmark } from '../../types/bookmark'
import { filterBookmarksOptimized } from '../../utils/bookmarkFilteringOptimized'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useCollectionsStore } from '../../store/collectionsStore'

/**
 * Optimized hook for filtered bookmarks using single-pass algorithm
 * Subscribes to individual store values to avoid object recreation issues
 */
export const useFilteredBookmarksOptimized = (): Bookmark[] => {
  // Subscribe to individual values to avoid object recreation
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const selectedTags = useBookmarkStore((state) => state.selectedTags)
  const searchQuery = useBookmarkStore((state) => state.searchQuery)
  const activeTab = useBookmarkStore((state) => state.activeTab)
  const activeSidebarItem = useBookmarkStore((state) => state.activeSidebarItem)
  const authorFilter = useBookmarkStore((state) => state.authorFilter)
  const domainFilter = useBookmarkStore((state) => state.domainFilter)
  const contentTypeFilter = useBookmarkStore((state) => state.contentTypeFilter)
  const dateRangeFilter = useBookmarkStore((state) => state.dateRangeFilter)
  const quickFilters = useBookmarkStore((state) => state.quickFilters)

  const activeCollectionId = useCollectionsStore((state) => state.activeCollectionId)
  const collectionBookmarks = useCollectionsStore((state) => state.collectionBookmarks)

  return useMemo(() => {
    return filterBookmarksOptimized({
      bookmarks,
      selectedTags,
      searchQuery,
      activeTab,
      activeSidebarItem,
      authorFilter,
      domainFilter,
      contentTypeFilter,
      dateRangeFilter,
      quickFilters,
      activeCollectionId,
      collectionBookmarks,
    })
  }, [
    bookmarks,
    selectedTags,
    searchQuery,
    activeTab,
    activeSidebarItem,
    authorFilter,
    domainFilter,
    contentTypeFilter,
    dateRangeFilter,
    quickFilters,
    activeCollectionId,
    collectionBookmarks,
  ])
}

export default useFilteredBookmarksOptimized
