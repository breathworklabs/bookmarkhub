import { useMemo, useEffect } from 'react'
import { type Bookmark } from '../../types/bookmark'
import { filterBookmarks } from '../../utils/bookmarkFiltering'
import { useBookmarkSelectors } from '../selectors/useBookmarkSelectors'
import { useCollectionsSelectors } from '../selectors/useCollectionsSelectors'
import { useBookmarkStore } from '../../store/bookmarkStore'

export interface PaginatedBookmarksResult {
  bookmarks: Bookmark[]
  hasMore: boolean
  isLoading: boolean
  loadMore: () => void
  totalItems: number
  currentPage: number
}

/**
 * Optimized hook for paginated bookmarks using centralized selectors
 * Reduces store subscriptions and improves performance
 */
export const usePaginatedBookmarksOptimized = (): PaginatedBookmarksResult => {
  const bookmarkSelectors = useBookmarkSelectors()
  const collectionsSelectors = useCollectionsSelectors()

  // Get pagination state and actions
  const pagination = bookmarkSelectors.pagination
  const resetPagination = bookmarkSelectors.resetPagination

  // Apply all filters to get the complete filtered result using shared logic
  const filteredBookmarks = useMemo(() => {
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
      collectionBookmarks: collectionsSelectors.collectionBookmarks,
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
    collectionsSelectors.collectionBookmarks,
  ])

  // Get paginated bookmarks based on current page
  const paginatedBookmarks = useMemo(() => {
    const { currentPage, itemsPerPage } = pagination
    const endIndex = currentPage * itemsPerPage
    return filteredBookmarks.slice(0, endIndex)
  }, [filteredBookmarks, pagination.currentPage, pagination.itemsPerPage])

  // Calculate if there are more bookmarks to load
  const hasMore = useMemo(() => {
    const { currentPage, itemsPerPage } = pagination
    const endIndex = currentPage * itemsPerPage
    return endIndex < filteredBookmarks.length
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    filteredBookmarks.length,
  ])

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination()
  }, [
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
    resetPagination,
  ])

  // Load more function that increases the page
  const loadMore = () => {
    if (!hasMore || pagination.isLoading) return

    // Use the store's setState method directly
    useBookmarkStore.setState({
      pagination: {
        ...pagination,
        currentPage: pagination.currentPage + 1,
        isLoading: false, // Don't keep loading state, let the UI handle it
      },
    })
  }

  return {
    bookmarks: paginatedBookmarks,
    hasMore,
    isLoading: pagination.isLoading,
    loadMore,
    totalItems: filteredBookmarks.length,
    currentPage: pagination.currentPage,
  }
}

export default usePaginatedBookmarksOptimized
