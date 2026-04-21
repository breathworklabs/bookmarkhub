import { useMemo } from 'react'
import { type Bookmark } from '@/types/bookmark'
import { filterBookmarksOptimized } from '@/utils/bookmarkFilteringOptimized'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useViewStore } from '@/store/viewStore'

export const useFilteredBookmarksOptimized = (): Bookmark[] => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const selectedTags = useBookmarkStore((state) => state.selectedTags)
  const searchQuery = useBookmarkStore((state) => state.searchQuery)
  const activeTab = useBookmarkStore((state) => state.activeTab)
  const authorFilter = useBookmarkStore((state) => state.authorFilter)
  const domainFilter = useBookmarkStore((state) => state.domainFilter)
  const contentTypeFilter = useBookmarkStore((state) => state.contentTypeFilter)
  const dateRangeFilter = useBookmarkStore((state) => state.dateRangeFilter)
  const quickFilters = useBookmarkStore((state) => state.quickFilters)
  const validationResults = useBookmarkStore((state) => state.validationResults)

  const activeViewId = useViewStore((state) => state.activeViewId)
  const views = useViewStore((state) => state.views)

  const sortBy = useSettingsStore((state) => state.display.sortBy)
  const sortOrder = useSettingsStore((state) => state.display.sortOrder)

  return useMemo(() => {
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
      sortBy,
      sortOrder,
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
    sortBy,
    sortOrder,
    activeViewId,
    views,
  ])
}

export default useFilteredBookmarksOptimized
