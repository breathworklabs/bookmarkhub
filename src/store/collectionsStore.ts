import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { localStorageService, type StoredCollection, type CollectionInsert } from '../lib/localStorage'
import { createErrorHandler } from '../utils/errorHandling'
import type {
  CollectionsState
} from '../types/collections'

interface CollectionsActions {
  // Collection CRUD operations
  loadCollections: () => Promise<void>
  createCollection: (collection: CollectionInsert) => Promise<void>
  updateCollection: (id: string, updates: Partial<StoredCollection>) => Promise<void>
  deleteCollection: (id: string) => Promise<void>

  // Bookmark-Collection relationship management
  addBookmarkToCollection: (bookmarkId: number, collectionId: string) => Promise<void>
  removeBookmarkFromCollection: (bookmarkId: number, collectionId: string) => Promise<void>
  getBookmarksByCollection: (collectionId: string) => Promise<void>

  // Collection navigation
  setActiveCollection: (collectionId: string | null) => void
  toggleCollectionExpansion: (collectionId: string) => void

  // UI state management
  setCreatingCollection: (isCreating: boolean) => void
  setCollectionFilter: (filter: 'all' | 'private' | 'shared') => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void

  // Bulk operations
  moveMultipleBookmarks: (bookmarkIds: number[], toCollectionId: string) => Promise<void>

  // Initialize collections
  initialize: () => Promise<void>
}

export type CollectionsStore = CollectionsState & CollectionsActions

export const useCollectionsStore = create<CollectionsStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      collections: [],
      activeCollectionId: null,
      collectionBookmarks: {},
      isCreatingCollection: false,
      collectionFilter: 'all',
      expandedCollections: [],
      isLoading: false,
      error: null,

      // Initialize collections
      initialize: async () => {
        const state = get()

        // Prevent multiple simultaneous calls
        if (state.isLoading) {
          return
        }

        try {
          // Load collections immediately without loading state for better UX
          const collections = await localStorageService.getCollections()

          // Quick load: set collections immediately, build collection bookmarks in background
          set({
            collections,
            isLoading: false,
            error: null
          }, false, 'collections:quickLoad')

          // Build collection bookmarks map in background
          const collectionBookmarks: Record<string, number[]> = {}
          for (const collection of collections) {
            try {
              const bookmarks = await localStorageService.getBookmarksByCollection(collection.id)
              collectionBookmarks[collection.id] = bookmarks.map(b => b.id)
            } catch (error) {
              console.warn(`Failed to load bookmarks for collection ${collection.id}:`, error)
              collectionBookmarks[collection.id] = []
            }
          }

          // Update with collection bookmarks map
          set({
            collectionBookmarks
          }, false, 'collections:backgroundLoad')

        } catch (error) {
          const errorHandler = createErrorHandler('CollectionsStore.initialize')
          const appError = errorHandler(error)
          set({
            error: appError.toUserMessage(),
            isLoading: false
          }, false, 'collections:initialize:error')
        }
      },

      // Load collections from localStorage
      loadCollections: async () => {
        const state = get()

        // Prevent multiple simultaneous calls
        if (state.isLoading) {
          return
        }

        try {
          set({ isLoading: true, error: null }, false, 'collections:load:start')

          const collections = await localStorageService.getCollections()

          // Build collection bookmarks map
          const collectionBookmarks: Record<string, number[]> = {}
          for (const collection of collections) {
            try {
              const bookmarks = await localStorageService.getBookmarksByCollection(collection.id)
              collectionBookmarks[collection.id] = bookmarks.map(b => b.id)
            } catch (error) {
              console.warn(`Failed to load bookmarks for collection ${collection.id}:`, error)
              collectionBookmarks[collection.id] = []
            }
          }

          set({
            collections,
            collectionBookmarks,
            isLoading: false,
            error: null
          }, false, 'collections:load:success')
        } catch (error) {
          console.error('Error loading collections:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to load collections',
            isLoading: false
          }, false, 'collections:load:error')
        }
      },

      // Create new collection
      createCollection: async (collection) => {
        try {
          set({ isLoading: true, error: null }, false, 'collections:create:start')

          const newCollection = await localStorageService.createCollection(collection)

          set(
            (state) => ({
              collections: [newCollection, ...state.collections],
              collectionBookmarks: {
                ...state.collectionBookmarks,
                [newCollection.id]: []
              }
            }),
            false,
            'collections:create:success'
          )

          // Log activity
          const { useBookmarkStore } = await import('./bookmarkStore')
          useBookmarkStore.getState().addActivityLog('Created collection', newCollection.name)
        } catch (error) {
          console.error('Error creating collection:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to create collection'
          }, false, 'collections:create:error')
        } finally {
          set({ isLoading: false }, false, 'collections:create:complete')
        }
      },

      // Update existing collection
      updateCollection: async (id, updates) => {
        try {
          set({ isLoading: true, error: null }, false, 'collections:update:start')

          const updatedCollection = await localStorageService.updateCollection(id, updates)

          set(
            (state) => ({
              collections: state.collections.map(collection =>
                collection.id === id ? updatedCollection : collection
              )
            }),
            false,
            'collections:update:success'
          )
        } catch (error) {
          console.error('Error updating collection:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to update collection'
          }, false, 'collections:update:error')
        } finally {
          set({ isLoading: false }, false, 'collections:update:complete')
        }
      },

      // Delete collection
      deleteCollection: async (id) => {
        try {
          set({ isLoading: true, error: null }, false, 'collections:delete:start')

          // Get collection name before deleting
          const collection = get().collections.find(c => c.id === id)
          const collectionName = collection?.name || 'collection'

          await localStorageService.deleteCollection(id)

          set(
            (state) => ({
              collections: state.collections.filter(c => c.id !== id),
              collectionBookmarks: Object.fromEntries(
                Object.entries(state.collectionBookmarks).filter(([key]) => key !== id)
              ),
              activeCollectionId: state.activeCollectionId === id ? null : state.activeCollectionId
            }),
            false,
            'collections:delete:success'
          )

          // Log activity
          const { useBookmarkStore } = await import('./bookmarkStore')
          useBookmarkStore.getState().addActivityLog('Deleted collection', collectionName)
        } catch (error) {
          console.error('Error deleting collection:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to delete collection'
          }, false, 'collections:delete:error')
        } finally {
          set({ isLoading: false }, false, 'collections:delete:complete')
        }
      },

      // Add bookmark to collection
      addBookmarkToCollection: async (bookmarkId, collectionId) => {
        try {
          await localStorageService.addBookmarkToCollection(bookmarkId, collectionId)

          set(
            (state) => ({
              collectionBookmarks: {
                ...state.collectionBookmarks,
                [collectionId]: [...(state.collectionBookmarks[collectionId] || []), bookmarkId]
              }
            }),
            false,
            'collections:addBookmark:success'
          )

          // Reload bookmarks to refresh their collections data
          const { useBookmarkStore } = await import('./bookmarkStore')
          await useBookmarkStore.getState().loadBookmarks()

          // Log activity
          const collection = get().collections.find(c => c.id === collectionId)
          const collectionName = collection?.name || 'collection'
          useBookmarkStore.getState().addActivityLog('Added to collection', collectionName)
        } catch (error) {
          console.error('Error adding bookmark to collection:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to add bookmark to collection'
          }, false, 'collections:addBookmark:error')
        }
      },

      // Remove bookmark from collection
      removeBookmarkFromCollection: async (bookmarkId, collectionId) => {
        try {
          await localStorageService.removeBookmarkFromCollection(bookmarkId, collectionId)

          set(
            (state) => ({
              collectionBookmarks: {
                ...state.collectionBookmarks,
                [collectionId]: (state.collectionBookmarks[collectionId] || []).filter(id => id !== bookmarkId)
              }
            }),
            false,
            'collections:removeBookmark:success'
          )

          // Reload bookmarks to refresh their collections data
          const { useBookmarkStore } = await import('./bookmarkStore')
          await useBookmarkStore.getState().loadBookmarks()

          // Log activity
          const collection = get().collections.find(c => c.id === collectionId)
          const collectionName = collection?.name || 'collection'
          useBookmarkStore.getState().addActivityLog('Removed from collection', collectionName)
        } catch (error) {
          console.error('Error removing bookmark from collection:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to remove bookmark from collection'
          }, false, 'collections:removeBookmark:error')
        }
      },

      // Get bookmarks by collection
      getBookmarksByCollection: async (collectionId) => {
        try {
          const bookmarks = await localStorageService.getBookmarksByCollection(collectionId)

          set(
            (state) => ({
              collectionBookmarks: {
                ...state.collectionBookmarks,
                [collectionId]: bookmarks.map(b => b.id)
              }
            }),
            false,
            'collections:getBookmarks:success'
          )
        } catch (error) {
          console.error('Error getting bookmarks by collection:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to get bookmarks by collection'
          }, false, 'collections:getBookmarks:error')
        }
      },

      // Bulk move bookmarks
      moveMultipleBookmarks: async (bookmarkIds, toCollectionId) => {
        try {
          set({ isLoading: true, error: null }, false, 'collections:bulkMove:start')

          // Add all bookmarks to the target collection
          await Promise.all(
            bookmarkIds.map(id => localStorageService.addBookmarkToCollection(id, toCollectionId))
          )

          // Reload collections to get updated state
          await get().loadCollections()

          // Log activity
          const collection = get().collections.find(c => c.id === toCollectionId)
          const collectionName = collection?.name || 'collection'
          const { useBookmarkStore } = await import('./bookmarkStore')
          useBookmarkStore.getState().addActivityLog(
            `Moved ${bookmarkIds.length} bookmark${bookmarkIds.length > 1 ? 's' : ''}`,
            `to ${collectionName}`
          )
        } catch (error) {
          console.error('Error moving bookmarks:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to move bookmarks'
          }, false, 'collections:bulkMove:error')
        } finally {
          set({ isLoading: false }, false, 'collections:bulkMove:complete')
        }
      },

      // UI state actions
      setActiveCollection: (collectionId) =>
        set({ activeCollectionId: collectionId }, false, 'collections:setActive'),

      toggleCollectionExpansion: (collectionId) =>
        set(
          (state) => ({
            expandedCollections: state.expandedCollections.includes(collectionId)
              ? state.expandedCollections.filter(id => id !== collectionId)
              : [...state.expandedCollections, collectionId]
          }),
          false,
          'collections:toggleExpansion'
        ),

      setCreatingCollection: (isCreating) =>
        set({ isCreatingCollection: isCreating }, false, 'collections:setCreating'),

      setCollectionFilter: (filter) =>
        set({ collectionFilter: filter }, false, 'collections:setFilter'),

      setError: (error) =>
        set({ error }, false, 'collections:setError'),

      setLoading: (loading) =>
        set({ isLoading: loading }, false, 'collections:setLoading')
    }),
    {
      name: 'collections-store', // Store name for devtools
    }
  )
)