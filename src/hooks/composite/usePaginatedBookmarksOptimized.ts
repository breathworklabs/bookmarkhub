import { useMemo, useEffect, useRef } from 'react'
import { type Bookmark } from '../../types/bookmark'
import { filterBookmarksOptimized } from '../../utils/bookmarkFilteringOptimized'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useCollectionsStore } from '../../store/collectionsStore'

export interface PaginatedBookmarksResult {
  bookmarks: Bookmark[]
  hasMore: boolean
  isLoading: boolean
  loadMore: () => void
  totalItems: number
  currentPage: number
}

/**
 * Optimized hook for paginated bookmarks using single-pass algorithm
 * Subscribes to individual store values to avoid object recreation issues
 */
export const usePaginatedBookmarksOptimized = (): PaginatedBookmarksResult => {
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

  // Get pagination state and actions
  const pagination = useBookmarkStore((state) => state.pagination)
  const resetPagination = useBookmarkStore((state) => state.resetPagination)

  // Apply all filters to get the complete filtered result using shared logic
  const filteredBookmarks = useMemo(() => {
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

  // Get paginated bookmarks based on current page
  const paginatedBookmarks = useMemo(() => {
    const { currentPage, itemsPerPage } = pagination
    const endIndex = currentPage * itemsPerPage
    return filteredBookmarks.slice(0, endIndex)
  }, [filteredBookmarks, pagination])

  // Calculate if there are more bookmarks to load
  const hasMore = useMemo(() => {
    const { currentPage, itemsPerPage } = pagination
    const endIndex = currentPage * itemsPerPage
    return endIndex < filteredBookmarks.length
  }, [pagination, filteredBookmarks.length])

  // Track previous filter values to detect changes
  const prevFilterValuesRef = useRef({
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
  })

  // Reset pagination when filters change
  useEffect(() => {
    const prev = prevFilterValuesRef.current
    if (
      prev.selectedTags !== selectedTags ||
      prev.searchQuery !== searchQuery ||
      prev.activeTab !== activeTab ||
      prev.activeSidebarItem !== activeSidebarItem ||
      prev.authorFilter !== authorFilter ||
      prev.domainFilter !== domainFilter ||
      prev.contentTypeFilter !== contentTypeFilter ||
      prev.dateRangeFilter !== dateRangeFilter ||
      prev.quickFilters !== quickFilters ||
      prev.activeCollectionId !== activeCollectionId
    ) {
      resetPagination()
      prevFilterValuesRef.current = {
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
      }
    }
  }, [
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
