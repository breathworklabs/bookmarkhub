import { useMemo, useEffect, useRef } from 'react'
import { type Bookmark } from '@/types/bookmark'
import { filterBookmarksOptimized } from '@/utils/bookmarkFilteringOptimized'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useViewStore } from '@/store/viewStore'

export interface PaginatedBookmarksResult {
  bookmarks: Bookmark[]
  hasMore: boolean
  isLoading: boolean
  loadMore: () => void
  totalItems: number
  currentPage: number
}

export const usePaginatedBookmarksOptimized = (): PaginatedBookmarksResult => {
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
  const validationResults = useBookmarkStore((state) => state.validationResults)

  const activeViewId = useViewStore((state) => state.activeViewId)
  const views = useViewStore((state) => state.views)

  const pagination = useBookmarkStore((state) => state.pagination)
  const resetPagination = useBookmarkStore((state) => state.resetPagination)

  const filteredBookmarks = useMemo(() => {
    return filterBookmarksOptimized({
      bookmarks,
      selectedTags,
      searchQuery,
      activeTab,
      authorFilter,
      domainFilter,
      contentTypeFilter,
      dateRangeFilter,
      quickFilters,
      validationResults,
      activeViewId,
      views,
    })
  }, [
    bookmarks,
    selectedTags,
    searchQuery,
    activeTab,
    authorFilter,
    domainFilter,
    contentTypeFilter,
    dateRangeFilter,
    quickFilters,
    validationResults,
    activeViewId,
    views,
  ])

  const paginatedBookmarks = useMemo(() => {
    const { currentPage, itemsPerPage } = pagination
    const endIndex = currentPage * itemsPerPage
    return filteredBookmarks.slice(0, endIndex)
  }, [filteredBookmarks, pagination])

  const hasMore = useMemo(() => {
    const { currentPage, itemsPerPage } = pagination
    const endIndex = currentPage * itemsPerPage
    return endIndex < filteredBookmarks.length
  }, [pagination, filteredBookmarks.length])

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
    activeViewId,
  })

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
      prev.activeViewId !== activeViewId
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
        activeViewId,
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
    activeViewId,
    resetPagination,
  ])

  const loadMore = () => {
    if (!hasMore || pagination.isLoading) return

    useBookmarkStore.setState({
      pagination: {
        ...pagination,
        currentPage: pagination.currentPage + 1,
        isLoading: false,
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
