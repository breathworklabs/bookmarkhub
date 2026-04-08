import type { BookmarkState } from './types'
import { loadFilterPresets } from '../../utils/filterPresets'

export const createInitialState = (): Partial<BookmarkState> => ({
  bookmarks: [],
  displayedBookmarks: [],
  selectedTags: [],
  searchQuery: '',
  activeTab: 0,
  selectedBookmarks: [],
  isLoading: false,
  isAIPanelOpen: false,
  isFiltersPanelOpen: false,
  isMobileHeaderVisible: true,
  activeSidebarItem: 'All Bookmarks',
  error: null,

  duplicateMatches: [],
  pendingBookmark: null,
  showDuplicateDialog: false,

  pagination: {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    hasMore: false,
    isLoading: false,
  },

  authorFilter: '',
  domainFilter: '',
  contentTypeFilter: '',
  dateRangeFilter: { type: 'all' },
  quickFilters: [],

  filterOptions: {
    authors: [],
    domains: [],
    tags: [],
    contentTypes: ['article', 'tweet', 'video', 'image'],
  },

  filterOptionsHash: '',

  recentActivity: [],

  savedFilterPresets: loadFilterPresets(),

  validationResults: [],
  validationSummary: null,
  isValidating: false,
  validationProgress: null,
})
