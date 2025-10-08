import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
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
        // Direct synchronous localStorage check from consolidated storage
        const stored = localStorage.getItem('x-bookmark-manager-data')
        const data = stored ? JSON.parse(stored) : null
        const bookmarks = data?.bookmarks || []
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

  // Phase 1: Listen for bookmark updates from Chrome extension
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      // Validate message source and type
      if (
        event.data?.type === 'X_BOOKMARKS_UPDATED' &&
        event.data?.source === 'x-bookmark-manager-extension'
      ) {
        const { count, showNotification = true } = event.data

        // Reload bookmarks from localStorage without page reload
        Promise.all([
          useBookmarkStore.getState().initialize(),
          useCollectionsStore.getState().initialize()
        ]).then(() => {
          // Phase 4: Show success toast notification (if enabled in settings)
          if (showNotification) {
            const message = count === 1
              ? 'Imported 1 new bookmark from X/Twitter'
              : `Imported ${count} new bookmarks from X/Twitter`

            toast.success(message)
          }
        }).catch((error) => {
          console.error('Error reloading stores after extension update:', error)

          // Always show error toast (regardless of notification setting)
          toast.error('Failed to load imported bookmarks. Please refresh the page.')
        })
      }
    }

    window.addEventListener('message', handleExtensionMessage)
    return () => window.removeEventListener('message', handleExtensionMessage)
  }, [])

  // Only show loading when we're actually loading and have existing bookmarks
  const showLoading = hasExistingBookmarks === true && (isLoading || collectionsLoading)

  return {
    isLoading: showLoading,
    error: error || collectionsError,
    hasExistingBookmarks
  }
}