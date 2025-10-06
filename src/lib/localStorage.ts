/**
 * Local Storage Service for X Bookmark Manager
 * Privacy-focused bookmark storage using browser localStorage
 */

// Storage keys
const STORAGE_KEYS = {
  BOOKMARKS: 'x-bookmark-manager-bookmarks',
  COLLECTIONS: 'x-bookmark-manager-collections',
  BOOKMARK_COLLECTIONS: 'x-bookmark-manager-bookmark-collections',
  SETTINGS: 'x-bookmark-manager-settings',
  METADATA: 'x-bookmark-manager-metadata'
} as const

// Types for localStorage data
export interface StoredBookmark {
  id: number
  user_id: string
  title: string
  url: string
  description: string
  content: string
  thumbnail_url?: string
  favicon_url?: string
  author: string
  domain: string
  source_platform: string
  source_id?: string
  engagement_score: number
  is_starred: boolean
  is_read: boolean
  is_archived: boolean
  tags: string[]
  collections: string[]  // Array of collection IDs
  primaryCollection?: string  // Main collection
  metadata?: any
  created_at: string
  updated_at: string
}

export interface BookmarkInsert extends Omit<StoredBookmark, 'id' | 'created_at' | 'updated_at'> {
  id?: number
}

// Collection storage types
export interface StoredCollection {
  id: string
  name: string
  description?: string
  parentId?: string | null
  color?: string
  icon?: string
  isPrivate: boolean
  isDefault: boolean
  isSmartCollection: boolean
  smartCriteria?: {
    type: 'starred' | 'recent' | 'archived' | 'tag' | 'domain' | 'date_range'
    value?: string
    days?: number
  }
  createdAt: string
  updatedAt: string
  bookmarkCount: number
  userId: string
}

export interface CollectionInsert extends Omit<StoredCollection, 'id' | 'createdAt' | 'updatedAt' | 'bookmarkCount'> {
  id?: string
}

export interface StoredBookmarkCollection {
  bookmarkId: number
  collectionId: string
  addedAt: string
  order?: number
}

export interface AppSettings {
  theme: 'dark' | 'light'
  viewMode: 'grid' | 'list'
  defaultSort: 'newest' | 'oldest' | 'title' | 'author' | 'domain'
  showMetrics: boolean
  compactMode: boolean
  autoBackup: boolean
  exportFormat: 'json' | 'csv' | 'html'
  maxBookmarks?: number
  autoTagging?: boolean
  defaultCollection?: string | null
  duplicateHandling: 'skip' | 'replace' | 'keepBoth'
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

    // Migration: Ensure all bookmarks have collections array and normalize boolean values
    let needsUpdate = false
    const migratedBookmarks = bookmarks.map(bookmark => {
      let updated = { ...bookmark }

      // Ensure collections array exists
      if (!bookmark.collections) {
        needsUpdate = true
        updated = {
          ...updated,
          collections: ['uncategorized'],
          primaryCollection: 'uncategorized'
        }
      }

      // Normalize boolean values (in case they were imported as strings)
      const needsBooleanNormalization =
        typeof bookmark.is_starred === 'string' ||
        typeof bookmark.is_read === 'string' ||
        typeof bookmark.is_archived === 'string'

      if (needsBooleanNormalization) {
        needsUpdate = true
        updated = {
          ...updated,
          is_starred: bookmark.is_starred === true || (bookmark.is_starred as any) === 'true',
          is_read: bookmark.is_read === true || (bookmark.is_read as any) === 'true',
          is_archived: bookmark.is_archived === true || (bookmark.is_archived as any) === 'true'
        }
      }

      return updated
    })

    // Save migrated bookmarks if needed
    if (needsUpdate) {
      this.safeSet(STORAGE_KEYS.BOOKMARKS, migratedBookmarks)
    }

    return migratedBookmarks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async createBookmark(bookmark: BookmarkInsert): Promise<StoredBookmark> {
    const bookmarks = await this.getBookmarks()
    const newId = bookmarks.length > 0 ? Math.max(...bookmarks.map(b => b.id)) + 1 : 1

    const newBookmark: StoredBookmark = {
      ...bookmark,
      id: bookmark.id || newId,
      collections: bookmark.collections || ['uncategorized'],
      primaryCollection: bookmark.primaryCollection || 'uncategorized',
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

    return this.updateBookmark(id, { is_starred: !bookmark.is_starred })
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
    return bookmarks.filter(bookmark => bookmark.is_starred)
  }

  // Collection operations
  async getCollections(): Promise<StoredCollection[]> {
    const collections = this.safeGet<StoredCollection[]>(STORAGE_KEYS.COLLECTIONS, [])

    // Initialize default collections if empty
    if (collections.length === 0) {
      return this.initializeDefaultCollections()
    }

    return collections.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  private async initializeDefaultCollections(): Promise<StoredCollection[]> {
    const userId = 'local-user'
    const now = new Date().toISOString()

    const defaultCollections: StoredCollection[] = [
      {
        id: 'uncategorized',
        name: 'Uncategorized',
        description: 'Bookmarks that haven\'t been organized into collections',
        isPrivate: false,
        isDefault: true,
        isSmartCollection: false,
        createdAt: now,
        updatedAt: now,
        bookmarkCount: 0,
        userId
      },
      {
        id: 'starred',
        name: 'Starred',
        description: 'Your starred bookmarks',
        isPrivate: false,
        isDefault: true,
        isSmartCollection: true,
        smartCriteria: { type: 'starred' },
        createdAt: now,
        updatedAt: now,
        bookmarkCount: 0,
        userId
      },
      {
        id: 'recent',
        name: 'Recent',
        description: 'Recently added bookmarks',
        isPrivate: false,
        isDefault: true,
        isSmartCollection: true,
        smartCriteria: { type: 'recent', days: 7 },
        createdAt: now,
        updatedAt: now,
        bookmarkCount: 0,
        userId
      },
      {
        id: 'archived',
        name: 'Archived',
        description: 'Archived bookmarks',
        isPrivate: false,
        isDefault: true,
        isSmartCollection: true,
        smartCriteria: { type: 'archived' },
        createdAt: now,
        updatedAt: now,
        bookmarkCount: 0,
        userId
      }
    ]

    this.safeSet(STORAGE_KEYS.COLLECTIONS, defaultCollections)
    return defaultCollections
  }

  async createCollection(collection: CollectionInsert): Promise<StoredCollection> {
      const collections = await this.getCollections()
    const id = collection.id || `collection-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    const now = new Date().toISOString()

    const newCollection: StoredCollection = {
      ...collection,
      id,
      createdAt: now,
      updatedAt: now,
      bookmarkCount: 0,
      userId: collection.userId || 'local-user'
    }

    const updatedCollections = [newCollection, ...collections]


    const saved = this.safeSet(STORAGE_KEYS.COLLECTIONS, updatedCollections)


    if (saved) {
      return newCollection
    }



    throw new Error('Failed to create collection in localStorage')
  }

  async updateCollection(id: string, updates: Partial<StoredCollection>): Promise<StoredCollection> {
    const collections = await this.getCollections()
    const collectionIndex = collections.findIndex(c => c.id === id)

    if (collectionIndex === -1) {
      throw new Error(`Collection with id ${id} not found`)
    }

    const updatedCollection = {
      ...collections[collectionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    collections[collectionIndex] = updatedCollection

    if (this.safeSet(STORAGE_KEYS.COLLECTIONS, collections)) {
      return updatedCollection
    }

    throw new Error('Failed to update collection in localStorage')
  }

  async deleteCollection(id: string): Promise<void> {
    const collections = await this.getCollections()
    const collection = collections.find(c => c.id === id)

    if (!collection) {
      throw new Error(`Collection with id ${id} not found`)
    }

    if (collection.isDefault) {
      throw new Error('Cannot delete default collections')
    }

    const filteredCollections = collections.filter(c => c.id !== id)

    // Also remove all bookmark-collection relationships
    const bookmarkCollections = this.safeGet<StoredBookmarkCollection[]>(STORAGE_KEYS.BOOKMARK_COLLECTIONS, [])
    const filteredBookmarkCollections = bookmarkCollections.filter(bc => bc.collectionId !== id)

    // Update bookmarks to remove this collection from their collections array
    const bookmarks = await this.getBookmarks()
    const updatedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      collections: bookmark.collections.filter(cId => cId !== id),
      primaryCollection: bookmark.primaryCollection === id ? 'uncategorized' : bookmark.primaryCollection
    }))

    if (this.safeSet(STORAGE_KEYS.COLLECTIONS, filteredCollections) &&
        this.safeSet(STORAGE_KEYS.BOOKMARK_COLLECTIONS, filteredBookmarkCollections) &&
        this.safeSet(STORAGE_KEYS.BOOKMARKS, updatedBookmarks)) {
      return
    }

    throw new Error('Failed to delete collection from localStorage')
  }

  // Bookmark-Collection relationship operations
  async getBookmarkCollections(): Promise<StoredBookmarkCollection[]> {
    return this.safeGet<StoredBookmarkCollection[]>(STORAGE_KEYS.BOOKMARK_COLLECTIONS, [])
  }

  async addBookmarkToCollection(bookmarkId: number, collectionId: string): Promise<void> {
    const bookmarkCollections = await this.getBookmarkCollections()
    const existingRelation = bookmarkCollections.find(
      bc => bc.bookmarkId === bookmarkId && bc.collectionId === collectionId
    )

    if (existingRelation) {
      return // Already exists
    }

    const newRelation: StoredBookmarkCollection = {
      bookmarkId,
      collectionId,
      addedAt: new Date().toISOString()
    }

    const updatedRelations = [...bookmarkCollections, newRelation]

    // Also update the bookmark's collections array
    const bookmarks = await this.getBookmarks()
    const bookmarkIndex = bookmarks.findIndex(b => b.id === bookmarkId)

    if (bookmarkIndex !== -1) {
      const bookmark = bookmarks[bookmarkIndex]
      const updatedBookmark = {
        ...bookmark,
        collections: [...new Set([...bookmark.collections, collectionId])], // Ensure uniqueness
        primaryCollection: bookmark.primaryCollection || collectionId
      }

      bookmarks[bookmarkIndex] = updatedBookmark

      if (this.safeSet(STORAGE_KEYS.BOOKMARK_COLLECTIONS, updatedRelations) &&
          this.safeSet(STORAGE_KEYS.BOOKMARKS, bookmarks)) {
        return
      }
    }

    throw new Error('Failed to add bookmark to collection')
  }

  async removeBookmarkFromCollection(bookmarkId: number, collectionId: string): Promise<void> {
    const bookmarkCollections = await this.getBookmarkCollections()
    const filteredRelations = bookmarkCollections.filter(
      bc => !(bc.bookmarkId === bookmarkId && bc.collectionId === collectionId)
    )

    // Also update the bookmark's collections array
    const bookmarks = await this.getBookmarks()
    const bookmarkIndex = bookmarks.findIndex(b => b.id === bookmarkId)

    if (bookmarkIndex !== -1) {
      const bookmark = bookmarks[bookmarkIndex]
      const updatedBookmark = {
        ...bookmark,
        collections: bookmark.collections.filter(cId => cId !== collectionId),
        primaryCollection: bookmark.primaryCollection === collectionId ?
          (bookmark.collections.length > 1 ? bookmark.collections.find(cId => cId !== collectionId) : 'uncategorized') :
          bookmark.primaryCollection
      }

      bookmarks[bookmarkIndex] = updatedBookmark

      if (this.safeSet(STORAGE_KEYS.BOOKMARK_COLLECTIONS, filteredRelations) &&
          this.safeSet(STORAGE_KEYS.BOOKMARKS, bookmarks)) {
        return
      }
    }

    throw new Error('Failed to remove bookmark from collection')
  }

  async getBookmarksByCollection(collectionId: string): Promise<StoredBookmark[]> {
    const collections = await this.getCollections()
    const collection = collections.find(c => c.id === collectionId)

    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`)
    }

    const bookmarks = await this.getBookmarks()

    // Handle smart collections
    if (collection.isSmartCollection && collection.smartCriteria) {
      switch (collection.smartCriteria.type) {
        case 'starred':
          return bookmarks.filter(b => b.is_starred)
        case 'recent':
          const daysAgo = collection.smartCriteria.days || 7
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
          return bookmarks.filter(b => new Date(b.created_at) >= cutoffDate)
        case 'archived':
          return bookmarks.filter(b => b.is_archived)
        case 'tag':
          if (collection.smartCriteria.value) {
            return bookmarks.filter(b => b.tags.includes(collection.smartCriteria!.value!))
          }
          break
        case 'domain':
          if (collection.smartCriteria.value) {
            return bookmarks.filter(b => b.domain === collection.smartCriteria!.value)
          }
          break
      }
    }

    // Regular collections
    return bookmarks.filter(bookmark => bookmark.collections.includes(collectionId))
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
      exportFormat: 'json',
      defaultCollection: null,
      duplicateHandling: 'skip'
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
    collections: StoredCollection[]
    bookmarkCollections: StoredBookmarkCollection[]
    settings: AppSettings
    metadata: AppMetadata
    exportedAt: string
    version: string
  }> {
    const [bookmarks, collections, bookmarkCollections, settings, metadata] = await Promise.all([
      this.getBookmarks(),
      this.getCollections(),
      this.getBookmarkCollections(),
      this.getSettings(),
      this.getMetadata()
    ])

    return {
      bookmarks,
      collections,
      bookmarkCollections,
      settings,
      metadata,
      exportedAt: new Date().toISOString(),
      version: '2.0.0' // Updated version to include collections
    }
  }

  async importData(data: {
    bookmarks?: StoredBookmark[]
    collections?: StoredCollection[]
    bookmarkCollections?: StoredBookmarkCollection[]
    settings?: AppSettings
    metadata?: AppMetadata
    version?: string
  }): Promise<void> {
    try {
      // Handle bookmarks
      if (data.bookmarks) {
        // Ensure bookmarks have collections array if importing from older version
        const updatedBookmarks = data.bookmarks.map(bookmark => ({
          ...bookmark,
          collections: bookmark.collections || ['uncategorized'],
          primaryCollection: bookmark.primaryCollection || 'uncategorized'
        }))
        this.safeSet(STORAGE_KEYS.BOOKMARKS, updatedBookmarks)
      }

      // Handle collections
      if (data.collections) {
        this.safeSet(STORAGE_KEYS.COLLECTIONS, data.collections)
      } else {
        // If no collections in import, initialize default ones
        await this.initializeDefaultCollections()
      }

      // Handle bookmark-collection relationships
      if (data.bookmarkCollections) {
        this.safeSet(STORAGE_KEYS.BOOKMARK_COLLECTIONS, data.bookmarkCollections)
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
      localStorage.removeItem(STORAGE_KEYS.COLLECTIONS)
      localStorage.removeItem(STORAGE_KEYS.BOOKMARK_COLLECTIONS)
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