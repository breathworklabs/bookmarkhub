import type { NamedSet } from 'zustand/middleware'
import type { DuplicateMatch } from '@/lib/duplicateDetection'
import type { Bookmark, BookmarkInsert } from '@/types/bookmark'
import type {
  ValidationResult,
  ValidationSummary,
} from '@/services/bookmarkValidationService'
import type { ActivityLog } from '@/utils/activityLogger'
import type { SavedFilterPreset } from '@/utils/filterPresets'

export type { ActivityLog } from '@/utils/activityLogger'
export type { SavedFilterPreset } from '@/utils/filterPresets'

export interface DateRangeFilter {
  type: 'all' | 'today' | 'week' | 'month' | 'custom'
  customStart?: Date
  customEnd?: Date
}

export interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  hasMore: boolean
  isLoading: boolean
}

export interface BookmarkState {
  // State
  bookmarks: Bookmark[]
  displayedBookmarks: Bookmark[]
  selectedTags: string[]
  searchQuery: string
  activeTab: number
  selectedBookmarks: number[]
  isLoading: boolean
  isAIPanelOpen: boolean
  isFiltersPanelOpen: boolean
  isMobileHeaderVisible: boolean
  activeSidebarItem: string
  error: string | null

  // Duplicate detection state
  duplicateMatches: DuplicateMatch[]
  pendingBookmark: BookmarkInsert | null
  showDuplicateDialog: boolean

  // Pagination
  pagination: PaginationState

  // Advanced filters
  authorFilter: string
  domainFilter: string
  contentTypeFilter: string
  dateRangeFilter: DateRangeFilter
  quickFilters: string[]

  // Cached filter options (calculated once)
  filterOptions: {
    authors: string[]
    domains: string[]
    tags: string[]
    contentTypes: string[]
  }

  // Performance optimization - track when filter options need recalculation
  filterOptionsHash: string

  // Activity tracking
  recentActivity: ActivityLog[]

  // Saved filter presets
  savedFilterPresets: SavedFilterPreset[]

  // Bookmark validation state
  validationResults: ValidationResult[]
  validationSummary: ValidationSummary | null
  isValidating: boolean
  validationProgress: { current: number; total: number } | null

  // Actions
  addActivityLog: (action: string, details?: string) => void
  getRecentActivity: (limit?: number) => ActivityLog[]

  // Validation actions
  validateAllBookmarks: () => Promise<void>
  getInvalidBookmarksCount: () => number

  // Saved filter preset actions
  saveFilterPreset: (name: string, description?: string) => void
  loadFilterPreset: (presetId: string) => void
  deleteFilterPreset: (presetId: string) => void
  updateFilterPreset: (
    presetId: string,
    name: string,
    description?: string
  ) => void
  setBookmarks: (bookmarks: Bookmark[]) => void
  loadBookmarks: () => Promise<void>
  addBookmark: (bookmark: BookmarkInsert) => Promise<void>
  updateBookmark: (id: number, bookmark: BookmarkInsert) => Promise<void>
  removeBookmark: (id: number) => Promise<void>
  toggleStarBookmark: (id: number) => Promise<void>
  toggleArchiveBookmark: (id: number) => Promise<void>
  searchBookmarks: (query: string) => Promise<void>

  setSelectedTags: (tags: string[]) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  clearTags: () => void

  setSearchQuery: (query: string) => void
  setActiveTab: (tab: number) => void
  setSelectedBookmarks: (bookmarks: number[]) => void
  selectBookmark: (id: number) => void
  deselectBookmark: (id: number) => void
  toggleBookmarkSelection: (id: number) => void
  clearBookmarkSelection: () => void
  setIsLoading: (loading: boolean) => void
  setAIPanelOpen: (isOpen: boolean) => void
  toggleAIPanel: () => void
  setFiltersPanelOpen: (isOpen: boolean) => void
  toggleFiltersPanel: () => void
  setMobileHeaderVisible: (isVisible: boolean) => void
  toggleMobileHeader: () => void
  setActiveSidebarItem: (item: string) => void
  setError: (error: string | null) => void

  // Duplicate detection actions
  setDuplicateMatches: (matches: DuplicateMatch[]) => void
  setPendingBookmark: (bookmark: BookmarkInsert | null) => void
  setShowDuplicateDialog: (show: boolean) => void
  confirmAddDuplicate: () => Promise<void>
  cancelAddDuplicate: () => void

  // Advanced filter actions
  setAuthorFilter: (filter: string) => void
  setDomainFilter: (filter: string) => void
  setContentTypeFilter: (filter: string) => void
  setDateRangeFilter: (filter: DateRangeFilter) => void
  toggleQuickFilter: (filter: string) => void
  clearAdvancedFilters: () => void
  calculateFilterOptions: () => void

  // Pagination actions
  loadMoreBookmarks: () => void
  resetPagination: () => void
  setItemsPerPage: (count: number) => void
  updateDisplayedBookmarks: () => void

  // Data management
  exportBookmarks: () => Promise<void>
  importBookmarks: (file: File) => Promise<void>
  importXBookmarks: (data: any[], limit?: number) => Promise<void>
  clearAllData: () => Promise<void>
  loadDemoData: () => Promise<void>
  exitDemoMode: () => void

  // Initialize store
  initialize: () => Promise<void>
}

// Helper types for action factory functions
export type StoreSet = NamedSet<BookmarkState>
export type StoreGet = () => BookmarkState
