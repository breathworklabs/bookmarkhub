/**
 * Local Storage Service for X Bookmark Manager
 * Privacy-focused bookmark storage using browser localStorage
 */

import type {
  Bookmark,
  BookmarkInsert as BookmarkInsertType,
  AppMetadata,
} from '@/types/bookmark'

import type {
  Collection,
  BookmarkCollection,
  CollectionInsert as CollectionInsertType,
} from '@/types/collections'
import { logger } from './logger'

// Single storage key for consolidated structure
const STORAGE_KEY = 'x-bookmark-manager-data'

// Legacy keys for migration
const LEGACY_STORAGE_KEYS = {
  BOOKMARKS: 'x-bookmark-manager-bookmarks',
  COLLECTIONS: 'x-bookmark-manager-collections',
  BOOKMARK_COLLECTIONS: 'x-bookmark-manager-bookmark-collections',
  SETTINGS: 'x-bookmark-manager-settings',
  METADATA: 'x-bookmark-manager-metadata',
} as const

// Consolidated storage structure
interface ConsolidatedStorage {
  bookmarks: StoredBookmark[]
  collections: StoredCollection[]
  bookmarkCollections: StoredBookmarkCollection[]
  metadata: AppMetadata
  uiPreferences?: {
    columnWidths?: {
      author: number
      domain: number
      tags: number
      date: number
    }
  }
  consent?: 'accepted' | 'rejected' | null
  extensionSettings?: Record<string, unknown> // Extension/display/privacy settings from settingsStore
  appState?: {
    hasBeenCleared?: boolean
    lastImportSource?: 'file' | 'extension' | null
    lastImportTimestamp?: string
  }
  version: string
  // settings is deprecated - migrated to extensionSettings
}

// Types for localStorage data
// Use imported types from src/types for single source of truth
export type StoredBookmark = Bookmark

export type BookmarkInsert = BookmarkInsertType

// Collection storage types
// Use imported types from src/types for single source of truth
export type StoredCollection = Collection

export type CollectionInsert = CollectionInsertType

export type StoredBookmarkCollection = BookmarkCollection

// Settings and Metadata types are imported from src/types/bookmark.ts
// Using imported AppSettings and AppMetadata from '@/types/bookmark'

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

  // Type-safe boolean normalization helper
  private normalizeBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value
    }
    if (typeof value === 'string') {
      return value === 'true'
    }
    return false
  }

  // Get the entire consolidated storage
  private getStorage(): ConsolidatedStorage {
    if (!this.isAvailable()) {
      return this.getDefaultStorage()
    }

    try {
      const item = localStorage.getItem(STORAGE_KEY)
      if (item === null) {
        // Check if legacy data exists and migrate it
        const storage = this.migrateLegacyStorage()
        // Ensure it's saved (migration already saves, but this handles fresh installs)
        if (!localStorage.getItem(STORAGE_KEY)) {
          this.setStorage(storage)
        }
        return storage
      }
      return JSON.parse(item)
    } catch (error) {
      logger.error('Failed to parse localStorage:', error)
      return this.getDefaultStorage()
    }
  }

  // Set the entire consolidated storage
  private setStorage(data: ConsolidatedStorage): boolean {
    if (!this.isAvailable()) {
      logger.warn('localStorage is not available, cannot save data')
      return false
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      return true
    } catch (error) {
      logger.error('Failed to save to localStorage:', error)
      return false
    }
  }

  // Get default storage structure
  private getDefaultStorage(): ConsolidatedStorage {
    return {
      bookmarks: [],
      collections: [],
      bookmarkCollections: [],
      metadata: {
        version: '1.0.0',
        totalBookmarks: 0,
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
      },
      version: '2.0.0',
      // extensionSettings will be managed by settingsStore
    }
  }

  // Migrate from legacy multi-key storage to consolidated single-key storage
  private migrateLegacyStorage(): ConsolidatedStorage {
    if (!this.isAvailable()) {
      return this.getDefaultStorage()
    }

    try {
      // Check if any legacy data exists
      const hasLegacyData = Object.values(LEGACY_STORAGE_KEYS).some(
        (key) => localStorage.getItem(key) !== null
      )

      if (!hasLegacyData) {
        return this.getDefaultStorage()
      }

      logger.debug('Migrating from legacy storage format...')

      const defaultStorage = this.getDefaultStorage()

      // Migrate each piece of data
      const bookmarksStr = localStorage.getItem(LEGACY_STORAGE_KEYS.BOOKMARKS)
      const collectionsStr = localStorage.getItem(
        LEGACY_STORAGE_KEYS.COLLECTIONS
      )
      const bookmarkCollectionsStr = localStorage.getItem(
        LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS
      )
      const metadataStr = localStorage.getItem(LEGACY_STORAGE_KEYS.METADATA)
      // settingsStr is no longer used - settings are managed by settingsStore

      const consolidatedData: ConsolidatedStorage = {
        bookmarks: bookmarksStr
          ? JSON.parse(bookmarksStr)
          : defaultStorage.bookmarks,
        collections: collectionsStr
          ? JSON.parse(collectionsStr)
          : defaultStorage.collections,
        bookmarkCollections: bookmarkCollectionsStr
          ? JSON.parse(bookmarkCollectionsStr)
          : defaultStorage.bookmarkCollections,
        metadata: metadataStr
          ? JSON.parse(metadataStr)
          : defaultStorage.metadata,
        version: '2.0.0',
        // Old settings are ignored - settingsStore manages extensionSettings now
      }

      // Save to new consolidated format
      this.setStorage(consolidatedData)

      // Clean up legacy keys
      Object.values(LEGACY_STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })

      logger.debug('Migration completed successfully')
      return consolidatedData
    } catch (error) {
      logger.error('Failed to migrate legacy storage:', error)
      return this.getDefaultStorage()
    }
  }

  // Helper methods to get/set individual sections (maintains compatibility with existing code)
  // Type-safe overloads for different storage keys
  private safeGet(
    key: typeof LEGACY_STORAGE_KEYS.BOOKMARKS,
    defaultValue: StoredBookmark[]
  ): StoredBookmark[]
  private safeGet(
    key: typeof LEGACY_STORAGE_KEYS.COLLECTIONS,
    defaultValue: StoredCollection[]
  ): StoredCollection[]
  private safeGet(
    key: typeof LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS,
    defaultValue: StoredBookmarkCollection[]
  ): StoredBookmarkCollection[]
  private safeGet(
    key: typeof LEGACY_STORAGE_KEYS.METADATA,
    defaultValue: AppMetadata
  ): AppMetadata
  private safeGet<T>(key: string, defaultValue: T): T {
    const storage = this.getStorage()

    // Map legacy keys to consolidated storage properties with null safety
    switch (key) {
      case LEGACY_STORAGE_KEYS.BOOKMARKS:
        return (storage.bookmarks || []) as T
      case LEGACY_STORAGE_KEYS.COLLECTIONS:
        return (storage.collections || []) as T
      case LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS:
        return (storage.bookmarkCollections || []) as T
      case LEGACY_STORAGE_KEYS.METADATA:
        return (storage.metadata || defaultValue) as T
      default:
        return defaultValue
    }
  }

  private safeSet(
    key: typeof LEGACY_STORAGE_KEYS.BOOKMARKS,
    value: StoredBookmark[]
  ): boolean
  private safeSet(
    key: typeof LEGACY_STORAGE_KEYS.COLLECTIONS,
    value: StoredCollection[]
  ): boolean
  private safeSet(
    key: typeof LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS,
    value: StoredBookmarkCollection[]
  ): boolean
  private safeSet(
    key: typeof LEGACY_STORAGE_KEYS.METADATA,
    value: AppMetadata
  ): boolean
  private safeSet<T>(key: string, value: T): boolean {
    const storage = this.getStorage()

    // Map legacy keys to consolidated storage properties
    switch (key) {
      case LEGACY_STORAGE_KEYS.BOOKMARKS:
        storage.bookmarks = value as StoredBookmark[]
        break
      case LEGACY_STORAGE_KEYS.COLLECTIONS:
        storage.collections = value as StoredCollection[]
        break
      case LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS:
        storage.bookmarkCollections = value as StoredBookmarkCollection[]
        break
      case LEGACY_STORAGE_KEYS.METADATA:
        storage.metadata = value as AppMetadata
        break
      default:
        return false
    }

    return this.setStorage(storage)
  }

  // Bookmark operations
  async getBookmarks(): Promise<StoredBookmark[]> {
    const bookmarks = this.safeGet(LEGACY_STORAGE_KEYS.BOOKMARKS, [])

    // Migration: Ensure all bookmarks have collections array and normalize boolean values
    let needsUpdate = false
    const migratedBookmarks = bookmarks.map((bookmark) => {
      let updated = { ...bookmark }

      // Ensure collections array exists
      if (!bookmark.collections) {
        needsUpdate = true
        updated = {
          ...updated,
          collections: ['uncategorized'],
          primaryCollection: 'uncategorized',
        }
      }

      // Normalize boolean values (in case they were imported as strings)
      const needsBooleanNormalization =
        typeof bookmark.is_starred === 'string' ||
        typeof bookmark.is_read === 'string' ||
        typeof bookmark.is_archived === 'string' ||
        typeof bookmark.is_deleted === 'string'

      if (needsBooleanNormalization) {
        needsUpdate = true
        updated = {
          ...updated,
          is_starred: this.normalizeBoolean(bookmark.is_starred),
          is_read: this.normalizeBoolean(bookmark.is_read),
          is_archived: this.normalizeBoolean(bookmark.is_archived),
          is_deleted: this.normalizeBoolean(bookmark.is_deleted),
        }
      }

      // Ensure is_deleted exists
      if (typeof bookmark.is_deleted === 'undefined') {
        needsUpdate = true
        updated = {
          ...updated,
          is_deleted: false,
        }
      }

      return updated
    })

    // Save migrated bookmarks if needed
    if (needsUpdate) {
      this.safeSet(LEGACY_STORAGE_KEYS.BOOKMARKS, migratedBookmarks)
    }

    return migratedBookmarks.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  async createBookmark(bookmark: BookmarkInsert): Promise<StoredBookmark> {
    const bookmarks = await this.getBookmarks()
    const newId =
      bookmarks.length > 0 ? Math.max(...bookmarks.map((b) => b.id)) + 1 : 1

    const newBookmark: StoredBookmark = {
      ...bookmark,
      id: bookmark.id || newId,
      collections: bookmark.collections || ['uncategorized'],
      primaryCollection: bookmark.primaryCollection || 'uncategorized',
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedBookmarks = [newBookmark, ...bookmarks]

    if (this.safeSet(LEGACY_STORAGE_KEYS.BOOKMARKS, updatedBookmarks)) {
      await this.updateMetadata()
      return newBookmark
    }

    throw new Error('Failed to save bookmark to localStorage')
  }

  async updateBookmark(
    id: number,
    updates: Partial<StoredBookmark>
  ): Promise<StoredBookmark> {
    const bookmarks = await this.getBookmarks()
    const index = bookmarks.findIndex((b) => b.id === id)

    if (index === -1) {
      throw new Error(`Bookmark with id ${id} not found`)
    }

    const updatedBookmark: StoredBookmark = {
      ...bookmarks[index],
      ...updates,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    }

    bookmarks[index] = updatedBookmark

    if (this.safeSet(LEGACY_STORAGE_KEYS.BOOKMARKS, bookmarks)) {
      await this.updateMetadata()
      return updatedBookmark
    }

    throw new Error('Failed to update bookmark in localStorage')
  }

  async deleteBookmark(id: number): Promise<void> {
    const bookmarks = await this.getBookmarks()
    const filteredBookmarks = bookmarks.filter((b) => b.id !== id)

    if (filteredBookmarks.length === bookmarks.length) {
      throw new Error(`Bookmark with id ${id} not found`)
    }

    if (this.safeSet(LEGACY_STORAGE_KEYS.BOOKMARKS, filteredBookmarks)) {
      await this.updateMetadata()
      return
    }

    throw new Error('Failed to delete bookmark from localStorage')
  }

  async toggleBookmarkStar(id: number): Promise<StoredBookmark> {
    const bookmarks = await this.getBookmarks()
    const bookmark = bookmarks.find((b) => b.id === id)

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

    return bookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(lowerQuery) ||
        bookmark.content.toLowerCase().includes(lowerQuery) ||
        bookmark.author.toLowerCase().includes(lowerQuery) ||
        bookmark.domain.toLowerCase().includes(lowerQuery) ||
        bookmark.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    )
  }

  async getBookmarksByTag(tag: string): Promise<StoredBookmark[]> {
    const bookmarks = await this.getBookmarks()
    return bookmarks.filter((bookmark) =>
      bookmark.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    )
  }

  async getStarredBookmarks(): Promise<StoredBookmark[]> {
    const bookmarks = await this.getBookmarks()
    return bookmarks.filter((bookmark) => bookmark.is_starred)
  }

  // Trash operations (soft delete)
  async moveToTrash(id: number): Promise<StoredBookmark> {
    return this.updateBookmark(id, {
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
  }

  async restoreFromTrash(id: number): Promise<StoredBookmark> {
    return this.updateBookmark(id, {
      is_deleted: false,
      deleted_at: undefined,
    })
  }

  async getDeletedBookmarks(): Promise<StoredBookmark[]> {
    const bookmarks = await this.getBookmarks()
    return bookmarks
      .filter((bookmark) => bookmark.is_deleted)
      .sort((a, b) => {
        const aTime = a.deleted_at ? new Date(a.deleted_at).getTime() : 0
        const bTime = b.deleted_at ? new Date(b.deleted_at).getTime() : 0
        return bTime - aTime // Most recently deleted first
      })
  }

  async permanentlyDeleteBookmark(id: number): Promise<void> {
    const bookmarks = await this.getBookmarks()
    const filteredBookmarks = bookmarks.filter((b) => b.id !== id)

    if (filteredBookmarks.length === bookmarks.length) {
      throw new Error(`Bookmark with id ${id} not found`)
    }

    if (this.safeSet(LEGACY_STORAGE_KEYS.BOOKMARKS, filteredBookmarks)) {
      await this.updateMetadata()
      return
    }

    throw new Error('Failed to permanently delete bookmark from localStorage')
  }

  async emptyTrash(): Promise<void> {
    const bookmarks = await this.getBookmarks()
    const activeBookmarks = bookmarks.filter((b) => !b.is_deleted)

    if (this.safeSet(LEGACY_STORAGE_KEYS.BOOKMARKS, activeBookmarks)) {
      await this.updateMetadata()
      return
    }

    throw new Error('Failed to empty trash')
  }

  async cleanupOldTrash(daysOld: number = 30): Promise<number> {
    const bookmarks = await this.getBookmarks()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    const cutoffTime = cutoffDate.getTime()

    let deletedCount = 0
    const filteredBookmarks = bookmarks.filter((bookmark) => {
      if (bookmark.is_deleted && bookmark.deleted_at) {
        const deletedTime = new Date(bookmark.deleted_at).getTime()
        if (deletedTime < cutoffTime) {
          deletedCount++
          return false // Remove old deleted bookmarks
        }
      }
      return true // Keep everything else
    })

    if (deletedCount > 0) {
      if (this.safeSet(LEGACY_STORAGE_KEYS.BOOKMARKS, filteredBookmarks)) {
        await this.updateMetadata()
      }
    }

    return deletedCount
  }

  // Collection operations
  async getCollections(): Promise<StoredCollection[]> {
    let collections = this.safeGet(LEGACY_STORAGE_KEYS.COLLECTIONS, [])

    // Initialize default collections if empty
    if (collections.length === 0) {
      return this.initializeDefaultCollections()
    }

    // Migration: Fix uncategorized collection to be a smart collection
    const uncategorizedIndex = collections.findIndex(
      (c) => c.id === 'uncategorized'
    )
    if (
      uncategorizedIndex !== -1 &&
      !collections[uncategorizedIndex].isSmartCollection
    ) {
      collections[uncategorizedIndex] = {
        ...collections[uncategorizedIndex],
        isSmartCollection: true,
        smartCriteria: { type: 'uncategorized' },
        updatedAt: new Date().toISOString(),
      }
      // Save the migrated data
      this.safeSet(LEGACY_STORAGE_KEYS.COLLECTIONS, collections)
    }

    return collections.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }

  private async initializeDefaultCollections(): Promise<StoredCollection[]> {
    const userId = 'local-user'
    const now = new Date().toISOString()

    const defaultCollections: StoredCollection[] = [
      {
        id: 'uncategorized',
        name: 'Uncategorized',
        description: "Bookmarks that haven't been organized into collections",
        isPrivate: false,
        isDefault: true,
        isSmartCollection: true,
        smartCriteria: { type: 'uncategorized' },
        createdAt: now,
        updatedAt: now,
        bookmarkCount: 0,
        userId,
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
        userId,
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
        userId,
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
        userId,
      },
    ]

    this.safeSet(LEGACY_STORAGE_KEYS.COLLECTIONS, defaultCollections)
    return defaultCollections
  }

  async createCollection(
    collection: CollectionInsert
  ): Promise<StoredCollection> {
    const collections = await this.getCollections()
    const id =
      collection.id ||
      `collection-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

    // Validate parent assignment if parentId is provided
    if (collection.parentId) {
      const { validateParentAssignment } =
        await import('../utils/collectionHierarchy')
      const validation = validateParentAssignment(
        id,
        collection.parentId,
        collections,
        5 // max depth
      )

      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid parent assignment')
      }
    }

    const now = new Date().toISOString()

    const newCollection: StoredCollection = {
      ...collection,
      id,
      createdAt: now,
      updatedAt: now,
      bookmarkCount: 0,
      userId: collection.userId || 'local-user',
      isPrivate: collection.isPrivate ?? false,
      isDefault: collection.isDefault ?? false,
      isSmartCollection: collection.isSmartCollection ?? false,
    }

    const updatedCollections = [newCollection, ...collections]

    const saved = this.safeSet(
      LEGACY_STORAGE_KEYS.COLLECTIONS,
      updatedCollections
    )

    if (saved) {
      return newCollection
    }

    throw new Error('Failed to create collection in localStorage')
  }

  async updateCollection(
    id: string,
    updates: Partial<StoredCollection>
  ): Promise<StoredCollection> {
    const collections = await this.getCollections()
    const collectionIndex = collections.findIndex((c) => c.id === id)

    if (collectionIndex === -1) {
      throw new Error(`Collection with id ${id} not found`)
    }

    // Validate parent change if parentId is being updated
    if ('parentId' in updates) {
      const { validateParentAssignment } =
        await import('../utils/collectionHierarchy')
      const validation = validateParentAssignment(
        id,
        updates.parentId ?? null,
        collections,
        5 // max depth
      )

      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid parent assignment')
      }
    }

    const updatedCollection = {
      ...collections[collectionIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    collections[collectionIndex] = updatedCollection

    if (this.safeSet(LEGACY_STORAGE_KEYS.COLLECTIONS, collections)) {
      return updatedCollection
    }

    throw new Error('Failed to update collection in localStorage')
  }

  async deleteCollection(
    id: string,
    deleteMode: 'flatten' | 'cascade' = 'flatten'
  ): Promise<void> {
    const collections = await this.getCollections()
    const collection = collections.find((c) => c.id === id)

    if (!collection) {
      throw new Error(`Collection with id ${id} not found`)
    }

    if (collection.isDefault) {
      throw new Error('Cannot delete default collections')
    }

    const { getChildCollections, getAllDescendants } =
      await import('../utils/collectionHierarchy')

    let filteredCollections: StoredCollection[]

    if (deleteMode === 'cascade') {
      // Delete this collection and all descendants
      const descendants = getAllDescendants(id, collections)
      const idsToDelete = new Set([id, ...descendants.map((d) => d.id)])
      filteredCollections = collections.filter((c) => !idsToDelete.has(c.id))
    } else {
      // Flatten: move children to this collection's parent
      const children = getChildCollections(id, collections)
      const updatedChildren = children.map((child) => ({
        ...child,
        parentId: collection.parentId, // Move to grandparent
        updatedAt: new Date().toISOString(),
      }))

      // Update collections: remove deleted one, update children
      filteredCollections = collections
        .filter((c) => c.id !== id)
        .map((c) => {
          const updated = updatedChildren.find((uc) => uc.id === c.id)
          return updated || c
        })
    }

    // Also remove all bookmark-collection relationships
    const bookmarkCollections = this.safeGet(
      LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS,
      []
    )
    const filteredBookmarkCollections = bookmarkCollections.filter(
      (bc) => bc.collectionId !== id
    )

    // Update bookmarks to remove this collection from their collections array
    const bookmarks = await this.getBookmarks()
    const updatedBookmarks = bookmarks.map((bookmark) => {
      const newCollections = bookmark.collections.filter((cId) => cId !== id)
      const wasInDeletedCollection = bookmark.collections.includes(id)

      return {
        ...bookmark,
        collections:
          wasInDeletedCollection && newCollections.length === 0
            ? ['uncategorized'] // Add to uncategorized if now empty
            : newCollections,
        primaryCollection:
          bookmark.primaryCollection === id
            ? 'uncategorized'
            : bookmark.primaryCollection,
      }
    })

    if (
      this.safeSet(LEGACY_STORAGE_KEYS.COLLECTIONS, filteredCollections) &&
      this.safeSet(
        LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS,
        filteredBookmarkCollections
      ) &&
      this.safeSet(LEGACY_STORAGE_KEYS.BOOKMARKS, updatedBookmarks)
    ) {
      return
    }

    throw new Error('Failed to delete collection from localStorage')
  }

  // Bookmark-Collection relationship operations
  async getBookmarkCollections(): Promise<StoredBookmarkCollection[]> {
    return this.safeGet(LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS, [])
  }

  async addBookmarkToCollection(
    bookmarkId: number,
    collectionId: string
  ): Promise<void> {
    const bookmarkCollections = await this.getBookmarkCollections()
    const existingRelation = bookmarkCollections.find(
      (bc) => bc.bookmarkId === bookmarkId && bc.collectionId === collectionId
    )

    if (existingRelation) {
      return // Already exists
    }

    const newRelation: StoredBookmarkCollection = {
      bookmarkId,
      collectionId,
      addedAt: new Date().toISOString(),
    }

    const updatedRelations = [...bookmarkCollections, newRelation]

    // Also update the bookmark's collections array
    const bookmarks = await this.getBookmarks()
    const bookmarkIndex = bookmarks.findIndex((b) => b.id === bookmarkId)

    if (bookmarkIndex !== -1) {
      const bookmark = bookmarks[bookmarkIndex]
      const updatedBookmark = {
        ...bookmark,
        collections: [...new Set([...bookmark.collections, collectionId])], // Ensure uniqueness
        primaryCollection: bookmark.primaryCollection || collectionId,
      }

      bookmarks[bookmarkIndex] = updatedBookmark

      if (
        this.safeSet(
          LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS,
          updatedRelations
        ) &&
        this.safeSet(LEGACY_STORAGE_KEYS.BOOKMARKS, bookmarks)
      ) {
        return
      }
    }

    throw new Error('Failed to add bookmark to collection')
  }

  async removeBookmarkFromCollection(
    bookmarkId: number,
    collectionId: string
  ): Promise<void> {
    const bookmarkCollections = await this.getBookmarkCollections()
    const filteredRelations = bookmarkCollections.filter(
      (bc) =>
        !(bc.bookmarkId === bookmarkId && bc.collectionId === collectionId)
    )

    // Also update the bookmark's collections array
    const bookmarks = await this.getBookmarks()
    const bookmarkIndex = bookmarks.findIndex((b) => b.id === bookmarkId)

    if (bookmarkIndex !== -1) {
      const bookmark = bookmarks[bookmarkIndex]
      const updatedBookmark = {
        ...bookmark,
        collections: bookmark.collections.filter((cId) => cId !== collectionId),
        primaryCollection:
          bookmark.primaryCollection === collectionId
            ? bookmark.collections.length > 1
              ? bookmark.collections.find((cId) => cId !== collectionId)
              : 'uncategorized'
            : bookmark.primaryCollection,
      }

      bookmarks[bookmarkIndex] = updatedBookmark

      if (
        this.safeSet(
          LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS,
          filteredRelations
        ) &&
        this.safeSet(LEGACY_STORAGE_KEYS.BOOKMARKS, bookmarks)
      ) {
        return
      }
    }

    throw new Error('Failed to remove bookmark from collection')
  }

  async getBookmarksByCollection(
    collectionId: string
  ): Promise<StoredBookmark[]> {
    const collections = await this.getCollections()
    const collection = collections.find((c) => c.id === collectionId)

    if (!collection) {
      throw new Error(`Collection with id ${collectionId} not found`)
    }

    const bookmarks = await this.getBookmarks()

    // Handle smart collections
    if (collection.isSmartCollection && collection.smartCriteria) {
      switch (collection.smartCriteria.type) {
        case 'starred':
          return bookmarks.filter(
            (b) => b.is_starred && !b.is_deleted && !b.is_archived
          )
        case 'recent':
          const daysAgo = collection.smartCriteria.days || 7
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
          return bookmarks.filter(
            (b) =>
              !b.is_deleted &&
              !b.is_archived &&
              new Date(b.created_at) >= cutoffDate
          )
        case 'archived':
          return bookmarks.filter((b) => b.is_archived && !b.is_deleted)
        case 'uncategorized':
          return bookmarks.filter(
            (b) =>
              !b.is_deleted &&
              !b.is_archived &&
              (!b.collections ||
                b.collections.length === 0 ||
                (b.collections.length === 1 &&
                  b.collections[0] === 'uncategorized'))
          )
        case 'tag':
          if (collection.smartCriteria.value) {
            return bookmarks.filter((b) =>
              b.tags.includes(collection.smartCriteria!.value!)
            )
          }
          break
        case 'domain':
          if (collection.smartCriteria.value) {
            return bookmarks.filter(
              (b) => b.domain === collection.smartCriteria!.value
            )
          }
          break
      }
    }

    // Regular collections - exclude archived bookmarks
    return bookmarks.filter(
      (bookmark) =>
        bookmark.collections.includes(collectionId) && !bookmark.is_archived
    )
  }

  // Metadata operations
  private async updateMetadata(): Promise<void> {
    const bookmarks = await this.getBookmarks()
    const currentMetadata = this.safeGet(LEGACY_STORAGE_KEYS.METADATA, {
      version: '1.0.0',
      totalBookmarks: 0,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
    })

    const updatedMetadata: AppMetadata = {
      version: currentMetadata.version || '1.0.0',
      totalBookmarks: bookmarks.length,
      createdAt: currentMetadata.createdAt || new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      lastBackup: currentMetadata.lastBackup,
      storageUsed: currentMetadata.storageUsed,
      maxStorage: currentMetadata.maxStorage,
    }

    this.safeSet(LEGACY_STORAGE_KEYS.METADATA, updatedMetadata)
  }

  async getMetadata(): Promise<AppMetadata> {
    return this.safeGet(LEGACY_STORAGE_KEYS.METADATA, {
      version: '1.0.0',
      totalBookmarks: 0,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
    })
  }

  // Data export/import operations
  async exportData(): Promise<{
    bookmarks: StoredBookmark[]
    collections: StoredCollection[]
    bookmarkCollections: StoredBookmarkCollection[]
    metadata: AppMetadata
    exportedAt: string
    version: string
  }> {
    const [bookmarks, collections, bookmarkCollections, metadata] =
      await Promise.all([
        this.getBookmarks(),
        this.getCollections(),
        this.getBookmarkCollections(),
        this.getMetadata(),
      ])

    return {
      bookmarks,
      collections,
      bookmarkCollections,
      metadata,
      exportedAt: new Date().toISOString(),
      version: '2.0.0', // Settings are managed by settingsStore now
    }
  }

  async importData(data: {
    bookmarks?: StoredBookmark[]
    collections?: StoredCollection[]
    bookmarkCollections?: StoredBookmarkCollection[]
    metadata?: AppMetadata
    version?: string
  }): Promise<void> {
    try {
      // Handle bookmarks
      if (data.bookmarks) {
        // Ensure bookmarks have collections array if importing from older version
        const updatedBookmarks = data.bookmarks.map((bookmark) => ({
          ...bookmark,
          collections: bookmark.collections || ['uncategorized'],
          primaryCollection: bookmark.primaryCollection || 'uncategorized',
        }))
        this.safeSet(LEGACY_STORAGE_KEYS.BOOKMARKS, updatedBookmarks)
      }

      // Handle collections
      if (data.collections) {
        this.safeSet(LEGACY_STORAGE_KEYS.COLLECTIONS, data.collections)
      } else {
        // If no collections in import, initialize default ones
        await this.initializeDefaultCollections()
      }

      // Handle bookmark-collection relationships
      if (data.bookmarkCollections) {
        this.safeSet(
          LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS,
          data.bookmarkCollections
        )
      }

      // Settings are ignored - managed by settingsStore now

      if (data.metadata) {
        this.safeSet(LEGACY_STORAGE_KEYS.METADATA, data.metadata)
      }

      await this.updateMetadata()
    } catch (error) {
      throw new Error(
        `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('localStorage is not available')
    }

    try {
      // Remove consolidated storage
      localStorage.removeItem(STORAGE_KEY)

      // Also remove legacy keys if they exist
      localStorage.removeItem(LEGACY_STORAGE_KEYS.BOOKMARKS)
      localStorage.removeItem(LEGACY_STORAGE_KEYS.COLLECTIONS)
      localStorage.removeItem(LEGACY_STORAGE_KEYS.BOOKMARK_COLLECTIONS)
      localStorage.removeItem(LEGACY_STORAGE_KEYS.SETTINGS)
      localStorage.removeItem(LEGACY_STORAGE_KEYS.METADATA)
    } catch (error) {
      throw new Error(
        `Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Utility methods
  // App state management
  getHasBeenCleared(): boolean {
    try {
      const data = this.getStorage()
      return data.appState?.hasBeenCleared ?? false
    } catch {
      return false
    }
  }

  setHasBeenCleared(value: boolean): void {
    try {
      const data = this.getStorage()
      data.appState = {
        ...data.appState,
        hasBeenCleared: value,
      }
      this.setStorage(data)
    } catch (error) {
      logger.error('Failed to set hasBeenCleared flag:', error)
    }
  }

  getLastImportSource(): 'file' | 'extension' | null {
    try {
      const data = this.getStorage()
      return data.appState?.lastImportSource ?? null
    } catch {
      return null
    }
  }

  setLastImportSource(source: 'file' | 'extension' | null): void {
    try {
      const data = this.getStorage()
      data.appState = {
        ...data.appState,
        lastImportSource: source,
        lastImportTimestamp: source ? new Date().toISOString() : undefined,
      }
      this.setStorage(data)
    } catch (error) {
      logger.error('Failed to set lastImportSource flag:', error)
    }
  }

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
        const consolidatedData = localStorage.getItem(STORAGE_KEY)
        usedSpace = consolidatedData ? consolidatedData.length : 0
      } catch {
        usedSpace = 0
      }
    }

    const metadata = await this.getMetadata()

    return {
      isAvailable,
      usedSpace,
      totalBookmarks: metadata.totalBookmarks,
      lastUpdate: metadata.lastUpdate,
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService()

// Export for testing
export { LocalStorageService }
