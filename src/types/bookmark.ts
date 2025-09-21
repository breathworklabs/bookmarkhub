/**
 * TypeScript types for the X Bookmark Manager
 * Local-first, privacy-focused bookmark management
 */

// Core bookmark interface for localStorage
export interface Bookmark {
  id: number
  title: string
  url: string
  content: string
  author: string
  domain: string
  created_at: string
  updated_at?: string
  tags: string[]
  isStarred: boolean
  metrics: BookmarkMetrics
  thumbnail_url?: string
  hasMedia?: boolean
}

// Bookmark metrics for engagement data
export interface BookmarkMetrics {
  likes: string
  retweets: string
  replies: string
}

// For creating new bookmarks
export interface BookmarkInsert extends Omit<Bookmark, 'id' | 'created_at' | 'updated_at'> {
  id?: number
}

// For updating existing bookmarks
export interface BookmarkUpdate extends Partial<Omit<Bookmark, 'id' | 'created_at'>> {
  updated_at?: string
}

// Filter and search types
export interface BookmarkFilters {
  tags: string[]
  isStarred?: boolean
  dateRange?: {
    start: string
    end: string
  }
  domain?: string
  hasMedia?: boolean
}

export interface SearchOptions {
  query?: string
  filters?: BookmarkFilters
  sortBy?: 'newest' | 'oldest' | 'title' | 'domain' | 'relevance'
  limit?: number
  offset?: number
}

// Application settings
export interface AppSettings {
  theme: 'dark' | 'light'
  viewMode: 'grid' | 'list'
  defaultSort: 'newest' | 'oldest' | 'title' | 'domain'
  showMetrics: boolean
  compactMode: boolean
  autoBackup: boolean
  exportFormat: 'json' | 'csv' | 'html'
  maxBookmarks?: number
  autoTagging?: boolean
}

// Application metadata
export interface AppMetadata {
  version: string
  lastBackup?: string
  totalBookmarks: number
  createdAt: string
  lastUpdate: string
  storageUsed?: number
  maxStorage?: number
}

// Export/Import data structure
export interface ExportData {
  bookmarks: Bookmark[]
  settings: AppSettings
  metadata: AppMetadata
  exportedAt: string
  version: string
}

// Storage service interface
export interface StorageService {
  // Bookmark CRUD operations
  getBookmarks(): Promise<Bookmark[]>
  createBookmark(bookmark: BookmarkInsert): Promise<Bookmark>
  updateBookmark(id: number, updates: BookmarkUpdate): Promise<Bookmark>
  deleteBookmark(id: number): Promise<void>
  toggleBookmarkStar(id: number): Promise<Bookmark>

  // Search and filter operations
  searchBookmarks(query: string): Promise<Bookmark[]>
  getBookmarksByTag(tag: string): Promise<Bookmark[]>
  getStarredBookmarks(): Promise<Bookmark[]>

  // Settings operations
  getSettings(): Promise<AppSettings>
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>

  // Metadata operations
  getMetadata(): Promise<AppMetadata>

  // Data export/import
  exportData(): Promise<ExportData>
  importData(data: Partial<ExportData>): Promise<void>
  clearAllData(): Promise<void>

  // Utility operations
  getStorageInfo(): Promise<{
    isAvailable: boolean
    usedSpace: number
    totalBookmarks: number
    lastUpdate: string
  }>
}

// Error types
export class BookmarkError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'STORAGE_FULL' | 'INVALID_DATA' | 'STORAGE_UNAVAILABLE',
    public details?: any
  ) {
    super(message)
    this.name = 'BookmarkError'
  }
}

// UI State types for the store
export interface BookmarkState {
  // Data
  bookmarks: Bookmark[]

  // UI State
  selectedTags: string[]
  searchQuery: string
  activeTab: number
  viewMode: 'grid' | 'list'
  isLoading: boolean
  isAIPanelOpen: boolean
  isFiltersPanelOpen: boolean
  activeSidebarItem: string
  error: string | null

  // Settings
  settings: AppSettings
  metadata: AppMetadata
}

// Action types for the store
export interface BookmarkActions {
  // Data actions
  loadBookmarks: () => Promise<void>
  addBookmark: (bookmark: BookmarkInsert) => Promise<void>
  removeBookmark: (id: number) => Promise<void>
  updateBookmark: (id: number, updates: BookmarkUpdate) => Promise<void>
  toggleStarBookmark: (id: number) => Promise<void>
  searchBookmarks: (query: string) => Promise<void>

  // UI actions
  setSelectedTags: (tags: string[]) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  clearTags: () => void
  setSearchQuery: (query: string) => void
  setActiveTab: (tab: number) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setIsLoading: (loading: boolean) => void
  setAIPanelOpen: (isOpen: boolean) => void
  toggleAIPanel: () => void
  setFiltersPanelOpen: (isOpen: boolean) => void
  toggleFiltersPanel: () => void
  setActiveSidebarItem: (item: string) => void
  setError: (error: string | null) => void

  // Settings actions
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>

  // Data management actions
  exportBookmarks: () => Promise<ExportData>
  importBookmarks: (data: Partial<ExportData>) => Promise<void>
  clearAllData: () => Promise<void>

  // Initialize app
  initialize: () => Promise<void>
}

// Combined store type
export type BookmarkStore = BookmarkState & BookmarkActions