import { useEffect, useRef, useState } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'

export const useInitializeApp = () => {
  const [hasExistingBookmarks, setHasExistingBookmarks] = useState<boolean | null>(null)
  const isLoading = useBookmarkStore((state) => state.isLoading)
  const error = useBookmarkStore((state) => state.error)
  const collectionsLoading = useCollectionsStore((state) => state.isLoading)
  const collectionsError = useCollectionsStore((state) => state.error)

  const hasInitialized = useRef(false)

  useEffect(() => {
    // Prevent duplicate initialization
    if (hasInitialized.current) {
      return
    }

    hasInitialized.current = true

    // First, synchronously check if we have existing bookmarks
    const checkExistingBookmarks = () => {
      try {
        // Direct synchronous localStorage check
        const stored = localStorage.getItem('x-bookmark-manager-bookmarks')
        const bookmarks = stored ? JSON.parse(stored) : []
        const hasBookmarks = Array.isArray(bookmarks) && bookmarks.length > 0
        setHasExistingBookmarks(hasBookmarks)

        // If we have bookmarks, initialize stores immediately
        if (hasBookmarks) {
          Promise.all([
            useBookmarkStore.getState().initialize(),
            useCollectionsStore.getState().initialize()
          ])
        }
      } catch (error) {
        console.error('Error checking existing bookmarks:', error)
        setHasExistingBookmarks(false)
      }
    }

    checkExistingBookmarks()
  }, [])

  // Only show loading when we're actually loading and have existing bookmarks
  const showLoading = hasExistingBookmarks === true && (isLoading || collectionsLoading)

  return {
    isLoading: showLoading,
    error: error || collectionsError,
    hasExistingBookmarks
  }
}