/**
 * Local Storage Service for X Bookmark Manager
 * Privacy-focused bookmark storage using browser localStorage
 */

// Storage keys
const STORAGE_KEYS = {
  BOOKMARKS: 'x-bookmark-manager-bookmarks',
  SETTINGS: 'x-bookmark-manager-settings',
  METADATA: 'x-bookmark-manager-metadata'
} as const

// Types for localStorage data
export interface StoredBookmark {
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
  metrics: {
    likes: string
    retweets: string
    replies: string
  }
  thumbnail_url?: string
  hasMedia?: boolean
}

export interface BookmarkInsert extends Omit<StoredBookmark, 'id' | 'created_at' | 'updated_at'> {
  id?: number
}

export interface AppSettings {
  theme: 'dark' | 'light'
  viewMode: 'grid' | 'list'
  defaultSort: 'newest' | 'oldest' | 'title' | 'domain'
  showMetrics: boolean
  compactMode: boolean
  autoBackup: boolean
  exportFormat: 'json' | 'csv' | 'html'
}

export interface AppMetadata {
  version: string
  lastBackup?: string
  totalBookmarks: number
  createdAt: string
  lastUpdate: string
}

class LocalStorageService {
  private isAvailable(): boolean {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  private safeGet<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available, using default value')
      return defaultValue
    }

    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return JSON.parse(item)
    } catch (error) {
      console.error(`Failed to parse localStorage item "${key}":`, error)
      return defaultValue
    }
  }

  private safeSet<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available, cannot save data')
      return false
    }

    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Failed to save to localStorage "${key}":`, error)
      return false
    }
  }

  // Bookmark operations
  async getBookmarks(): Promise<StoredBookmark[]> {
    const bookmarks = this.safeGet<StoredBookmark[]>(STORAGE_KEYS.BOOKMARKS, [])
    return bookmarks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async createBookmark(bookmark: BookmarkInsert): Promise<StoredBookmark> {
    const bookmarks = await this.getBookmarks()
    const newId = bookmarks.length > 0 ? Math.max(...bookmarks.map(b => b.id)) + 1 : 1

    const newBookmark: StoredBookmark = {
      ...bookmark,
      id: bookmark.id || newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedBookmarks = [newBookmark, ...bookmarks]

    if (this.safeSet(STORAGE_KEYS.BOOKMARKS, updatedBookmarks)) {
      await this.updateMetadata()
      return newBookmark
    }

    throw new Error('Failed to save bookmark to localStorage')
  }

  async updateBookmark(id: number, updates: Partial<StoredBookmark>): Promise<StoredBookmark> {
    const bookmarks = await this.getBookmarks()
    const index = bookmarks.findIndex(b => b.id === id)

    if (index === -1) {
      throw new Error(`Bookmark with id ${id} not found`)
    }

    const updatedBookmark: StoredBookmark = {
      ...bookmarks[index],
      ...updates,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    }

    bookmarks[index] = updatedBookmark

    if (this.safeSet(STORAGE_KEYS.BOOKMARKS, bookmarks)) {
      await this.updateMetadata()
      return updatedBookmark
    }

    throw new Error('Failed to update bookmark in localStorage')
  }

  async deleteBookmark(id: number): Promise<void> {
    const bookmarks = await this.getBookmarks()
    const filteredBookmarks = bookmarks.filter(b => b.id !== id)

    if (filteredBookmarks.length === bookmarks.length) {
      throw new Error(`Bookmark with id ${id} not found`)
    }

    if (this.safeSet(STORAGE_KEYS.BOOKMARKS, filteredBookmarks)) {
      await this.updateMetadata()
      return
    }

    throw new Error('Failed to delete bookmark from localStorage')
  }

  async toggleBookmarkStar(id: number): Promise<StoredBookmark> {
    const bookmarks = await this.getBookmarks()
    const bookmark = bookmarks.find(b => b.id === id)

    if (!bookmark) {
      throw new Error(`Bookmark with id ${id} not found`)
    }

    return this.updateBookmark(id, { isStarred: !bookmark.isStarred })
  }

  async searchBookmarks(query: string): Promise<StoredBookmark[]> {
    const bookmarks = await this.getBookmarks()

    if (!query.trim()) {
      return bookmarks
    }

    const lowerQuery = query.toLowerCase()

    return bookmarks.filter(bookmark =>
      bookmark.title.toLowerCase().includes(lowerQuery) ||
      bookmark.content.toLowerCase().includes(lowerQuery) ||
      bookmark.author.toLowerCase().includes(lowerQuery) ||
      bookmark.domain.toLowerCase().includes(lowerQuery) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  async getBookmarksByTag(tag: string): Promise<StoredBookmark[]> {
    const bookmarks = await this.getBookmarks()
    return bookmarks.filter(bookmark =>
      bookmark.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    )
  }

  async getStarredBookmarks(): Promise<StoredBookmark[]> {
    const bookmarks = await this.getBookmarks()
    return bookmarks.filter(bookmark => bookmark.isStarred)
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    return this.safeGet<AppSettings>(STORAGE_KEYS.SETTINGS, {
      theme: 'dark',
      viewMode: 'grid',
      defaultSort: 'newest',
      showMetrics: true,
      compactMode: false,
      autoBackup: true,
      exportFormat: 'json'
    })
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const currentSettings = await this.getSettings()
    const updatedSettings = { ...currentSettings, ...settings }

    if (this.safeSet(STORAGE_KEYS.SETTINGS, updatedSettings)) {
      return updatedSettings
    }

    throw new Error('Failed to update settings in localStorage')
  }

  // Metadata operations
  private async updateMetadata(): Promise<void> {
    const bookmarks = await this.getBookmarks()
    const currentMetadata = this.safeGet<AppMetadata>(STORAGE_KEYS.METADATA, {
      version: '1.0.0',
      totalBookmarks: 0,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    })

    const updatedMetadata: AppMetadata = {
      ...currentMetadata,
      totalBookmarks: bookmarks.length,
      lastUpdate: new Date().toISOString()
    }

    this.safeSet(STORAGE_KEYS.METADATA, updatedMetadata)
  }

  async getMetadata(): Promise<AppMetadata> {
    return this.safeGet<AppMetadata>(STORAGE_KEYS.METADATA, {
      version: '1.0.0',
      totalBookmarks: 0,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    })
  }

  // Data export/import operations
  async exportData(): Promise<{
    bookmarks: StoredBookmark[]
    settings: AppSettings
    metadata: AppMetadata
    exportedAt: string
  }> {
    const [bookmarks, settings, metadata] = await Promise.all([
      this.getBookmarks(),
      this.getSettings(),
      this.getMetadata()
    ])

    return {
      bookmarks,
      settings,
      metadata,
      exportedAt: new Date().toISOString()
    }
  }

  async importData(data: {
    bookmarks?: StoredBookmark[]
    settings?: AppSettings
    metadata?: AppMetadata
  }): Promise<void> {
    try {
      if (data.bookmarks) {
        this.safeSet(STORAGE_KEYS.BOOKMARKS, data.bookmarks)
      }

      if (data.settings) {
        this.safeSet(STORAGE_KEYS.SETTINGS, data.settings)
      }

      if (data.metadata) {
        this.safeSet(STORAGE_KEYS.METADATA, data.metadata)
      }

      await this.updateMetadata()
    } catch (error) {
      throw new Error(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('localStorage is not available')
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.BOOKMARKS)
      localStorage.removeItem(STORAGE_KEYS.SETTINGS)
      localStorage.removeItem(STORAGE_KEYS.METADATA)
    } catch (error) {
      throw new Error(`Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Utility methods
  async getStorageInfo(): Promise<{
    isAvailable: boolean
    usedSpace: number
    totalBookmarks: number
    lastUpdate: string
  }> {
    const isAvailable = this.isAvailable()
    let usedSpace = 0

    if (isAvailable) {
      // Estimate used space (rough calculation)
      try {
        const allData = {
          bookmarks: localStorage.getItem(STORAGE_KEYS.BOOKMARKS),
          settings: localStorage.getItem(STORAGE_KEYS.SETTINGS),
          metadata: localStorage.getItem(STORAGE_KEYS.METADATA)
        }

        usedSpace = JSON.stringify(allData).length
      } catch {
        usedSpace = 0
      }
    }

    const metadata = await this.getMetadata()

    return {
      isAvailable,
      usedSpace,
      totalBookmarks: metadata.totalBookmarks,
      lastUpdate: metadata.lastUpdate
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService()

// Export for testing
export { LocalStorageService }