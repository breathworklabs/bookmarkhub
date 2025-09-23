import { useMemo, useEffect } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { type Bookmark } from '../types/bookmark'
import { filterBookmarks } from '../utils/bookmarkFiltering'

export interface PaginatedBookmarksResult {
  bookmarks: Bookmark[]
  hasMore: boolean
  isLoading: boolean
  loadMore: () => void
  totalItems: number
  currentPage: number
}

export const usePaginatedBookmarks = (): PaginatedBookmarksResult => {
  // Get all the filter states
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
  const pagination = useBookmarkStore((state) => state.pagination)

  // Get pagination actions
  const resetPagination = useBookmarkStore((state) => state.resetPagination)

  // Collection states
  const activeCollectionId = useCollectionsStore((state) => state.activeCollectionId)
  const collectionBookmarks = useCollectionsStore((state) => state.collectionBookmarks)

  // Apply all filters to get the complete filtered result using shared logic
  const filteredBookmarks = useMemo(() => {
    return filterBookmarks({
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
      collectionBookmarks
    })
  }, [
    bookmarks, selectedTags, searchQuery, activeTab, activeSidebarItem,
    authorFilter, domainFilter, contentTypeFilter, dateRangeFilter, quickFilters,
    activeCollectionId, collectionBookmarks
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
  }, [pagination.currentPage, pagination.itemsPerPage, filteredBookmarks.length])

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination()
  }, [
    selectedTags, searchQuery, activeTab, activeSidebarItem,
    authorFilter, domainFilter, contentTypeFilter, dateRangeFilter, quickFilters,
    activeCollectionId, resetPagination
  ])

  // Load more function that increases the page
  const loadMore = () => {
    if (!hasMore || pagination.isLoading) return

    useBookmarkStore.setState({
      pagination: {
        ...pagination,
        currentPage: pagination.currentPage + 1,
        isLoading: false // Don't keep loading state, let the UI handle it
      }
    })
  }

  return {
    bookmarks: paginatedBookmarks,
    hasMore,
    isLoading: pagination.isLoading,
    loadMore,
    totalItems: filteredBookmarks.length,
    currentPage: pagination.currentPage
  }
}