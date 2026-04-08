import { useCollectionsStore } from '@/store/collectionsStore'

/**
 * Centralized hook for all collections store selectors
 * Eliminates repetitive useCollectionsStore((state) => state.property) patterns
 * across components and provides a single source of truth for collections state access
 */
export const useCollectionsSelectors = () => {
  return {
    // Data
    collections: useCollectionsStore((state) => state.collections),
    activeCollectionId: useCollectionsStore(
      (state) => state.activeCollectionId
    ),
    collectionBookmarks: useCollectionsStore(
      (state) => state.collectionBookmarks
    ),
    isLoading: useCollectionsStore((state) => state.isLoading),
    error: useCollectionsStore((state) => state.error),

    // UI State
    isCreatingCollection: useCollectionsStore(
      (state) => state.isCreatingCollection
    ),
    collectionFilter: useCollectionsStore((state) => state.collectionFilter),
    expandedCollections: useCollectionsStore(
      (state) => state.expandedCollections
    ),

    // Actions - Collections
    setActiveCollection: useCollectionsStore(
      (state) => state.setActiveCollection
    ),
    createCollection: useCollectionsStore((state) => state.createCollection),
    updateCollection: useCollectionsStore((state) => state.updateCollection),
    deleteCollection: useCollectionsStore((state) => state.deleteCollection),

    // Actions - Bookmark-Collection Relations
    addBookmarkToCollection: useCollectionsStore(
      (state) => state.addBookmarkToCollection
    ),
    removeBookmarkFromCollection: useCollectionsStore(
      (state) => state.removeBookmarkFromCollection
    ),
    getBookmarksByCollection: useCollectionsStore(
      (state) => state.getBookmarksByCollection
    ),
    moveMultipleBookmarks: useCollectionsStore(
      (state) => state.moveMultipleBookmarks
    ),

    // Actions - UI
    setCreatingCollection: useCollectionsStore(
      (state) => state.setCreatingCollection
    ),
    setCollectionFilter: useCollectionsStore(
      (state) => state.setCollectionFilter
    ),
    toggleCollectionExpansion: useCollectionsStore(
      (state) => state.toggleCollectionExpansion
    ),
    setError: useCollectionsStore((state) => state.setError),
    setLoading: useCollectionsStore((state) => state.setLoading),

    // Actions - Data Management
    loadCollections: useCollectionsStore((state) => state.loadCollections),
    initialize: useCollectionsStore((state) => state.initialize),
  }
}
