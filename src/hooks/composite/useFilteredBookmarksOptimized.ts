import { useMemo } from 'react'
import { type Bookmark } from '../../types/bookmark'
import { filterBookmarks } from '../../utils/bookmarkFiltering'
import { useBookmarkSelectors } from '../selectors/useBookmarkSelectors'
import { useCollectionsSelectors } from '../selectors/useCollectionsSelectors'

/**
 * Optimized hook for filtered bookmarks using centralized selectors
 * Reduces store subscriptions and improves performance
 */
export const useFilteredBookmarksOptimized = (): Bookmark[] => {
  const bookmarkSelectors = useBookmarkSelectors()
  const collectionsSelectors = useCollectionsSelectors()

  return useMemo(() => {
    return filterBookmarks({
      bookmarks: bookmarkSelectors.bookmarks,
      selectedTags: bookmarkSelectors.selectedTags,
      searchQuery: bookmarkSelectors.searchQuery,
      activeTab: bookmarkSelectors.activeTab,
      activeSidebarItem: bookmarkSelectors.activeSidebarItem,
      authorFilter: bookmarkSelectors.authorFilter,
      domainFilter: bookmarkSelectors.domainFilter,
      contentTypeFilter: bookmarkSelectors.contentTypeFilter,
      dateRangeFilter: bookmarkSelectors.dateRangeFilter,
      quickFilters: bookmarkSelectors.quickFilters,
      activeCollectionId: collectionsSelectors.activeCollectionId,
      collectionBookmarks: collectionsSelectors.collectionBookmarks
    })
  }, [
    bookmarkSelectors.bookmarks,
    bookmarkSelectors.selectedTags,
    bookmarkSelectors.searchQuery,
    bookmarkSelectors.activeTab,
    bookmarkSelectors.activeSidebarItem,
    bookmarkSelectors.authorFilter,
    bookmarkSelectors.domainFilter,
    bookmarkSelectors.contentTypeFilter,
    bookmarkSelectors.dateRangeFilter,
    bookmarkSelectors.quickFilters,
    collectionsSelectors.activeCollectionId,
    collectionsSelectors.collectionBookmarks
  ])
}

export default useFilteredBookmarksOptimized
