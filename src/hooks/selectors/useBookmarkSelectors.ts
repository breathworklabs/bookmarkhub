import { useBookmarkStore } from '../../store/bookmarkStore'

/**
 * Centralized hook for all bookmark store selectors
 * Eliminates repetitive useBookmarkStore((state) => state.property) patterns
 * across components and provides a single source of truth for bookmark state access
 */
export const useBookmarkSelectors = () => {
  return {
    // Data
    bookmarks: useBookmarkStore(state => state.bookmarks),
    isLoading: useBookmarkStore(state => state.isLoading),
    error: useBookmarkStore(state => state.error),

    // UI State
    viewMode: useBookmarkStore(state => state.viewMode),
    isAIPanelOpen: useBookmarkStore(state => state.isAIPanelOpen),
    isFiltersPanelOpen: useBookmarkStore(state => state.isFiltersPanelOpen),
    activeSidebarItem: useBookmarkStore(state => state.activeSidebarItem),

    // Filter states
    selectedTags: useBookmarkStore(state => state.selectedTags),
    searchQuery: useBookmarkStore(state => state.searchQuery),
    activeTab: useBookmarkStore(state => state.activeTab),
    authorFilter: useBookmarkStore(state => state.authorFilter),
    domainFilter: useBookmarkStore(state => state.domainFilter),
    dateRangeFilter: useBookmarkStore(state => state.dateRangeFilter),
    contentTypeFilter: useBookmarkStore(state => state.contentTypeFilter),
    quickFilters: useBookmarkStore(state => state.quickFilters),

    // Filter options (cached)
    filterOptions: useBookmarkStore(state => state.filterOptions),

    // Pagination
    pagination: useBookmarkStore(state => state.pagination),

    // Actions - Filter
    setActiveTab: useBookmarkStore(state => state.setActiveTab),
    setAuthorFilter: useBookmarkStore(state => state.setAuthorFilter),
    setDomainFilter: useBookmarkStore(state => state.setDomainFilter),
    setDateRangeFilter: useBookmarkStore(state => state.setDateRangeFilter),
    setContentTypeFilter: useBookmarkStore(state => state.setContentTypeFilter),
    toggleQuickFilter: useBookmarkStore(state => state.toggleQuickFilter),
    clearAdvancedFilters: useBookmarkStore(state => state.clearAdvancedFilters),
    setActiveSidebarItem: useBookmarkStore(state => state.setActiveSidebarItem),
    addTag: useBookmarkStore(state => state.addTag),
    removeTag: useBookmarkStore(state => state.removeTag),
    clearTags: useBookmarkStore(state => state.clearTags),
    setSearchQuery: useBookmarkStore(state => state.setSearchQuery),

    // Actions - UI
    setViewMode: useBookmarkStore(state => state.setViewMode),
    setAIPanelOpen: useBookmarkStore(state => state.setAIPanelOpen),
    toggleAIPanel: useBookmarkStore(state => state.toggleAIPanel),
    setFiltersPanelOpen: useBookmarkStore(state => state.setFiltersPanelOpen),
    toggleFiltersPanel: useBookmarkStore(state => state.toggleFiltersPanel),
    setError: useBookmarkStore(state => state.setError),

    // Actions - Pagination
    resetPagination: useBookmarkStore(state => state.resetPagination),
    setItemsPerPage: useBookmarkStore(state => state.setItemsPerPage),
    loadMoreBookmarks: useBookmarkStore(state => state.loadMoreBookmarks),

    // Actions - Data
    loadBookmarks: useBookmarkStore(state => state.loadBookmarks),
    addBookmark: useBookmarkStore(state => state.addBookmark),
    removeBookmark: useBookmarkStore(state => state.removeBookmark),
    updateBookmark: useBookmarkStore(state => state.updateBookmark),
    toggleStarBookmark: useBookmarkStore(state => state.toggleStarBookmark),
    searchBookmarks: useBookmarkStore(state => state.searchBookmarks),

    // Actions - Data Management
    exportBookmarks: useBookmarkStore(state => state.exportBookmarks),
    importBookmarks: useBookmarkStore(state => state.importBookmarks),
    importXBookmarks: useBookmarkStore(state => state.importXBookmarks),
    clearAllData: useBookmarkStore(state => state.clearAllData),

    // Actions - Initialize
    initialize: useBookmarkStore(state => state.initialize),
  }
}
