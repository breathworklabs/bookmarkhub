import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useSettingsStore } from '../store/settingsStore'
import { initAllPerformanceMonitoring } from '../lib/performance'
import { localStorageService } from '../lib/localStorage'
import { logger } from '../lib/logger'

export const useInitializeApp = () => {
  const [hasExistingBookmarks, setHasExistingBookmarks] = useState<
    boolean | null
  >(null)
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

    // Initialize performance monitoring (privacy-first, local logging only)
    initAllPerformanceMonitoring()

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
            useCollectionsStore.getState().initialize(),
          ])
        }
      } catch (error) {
        logger.error('Error checking existing bookmarks', error)
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

        // Check if user recently cleared data - don't auto-load in that case
        if (localStorageService.getHasBeenCleared()) {
          logger.debug('Extension sync ignored: User cleared data')
          return
        }

        // Mark that this import came from the extension
        localStorageService.setLastImportSource('extension')

        // Reload bookmarks from localStorage without page reload
        Promise.all([
          useBookmarkStore.getState().initialize(),
          useCollectionsStore.getState().initialize(),
        ])
          .then(() => {
            // Phase 4: Show success toast notification (if enabled in settings)
            if (showNotification) {
              const message =
                count === 1
                  ? 'Imported 1 new bookmark from X/Twitter. Refreshing...'
                  : `Imported ${count} new bookmarks from X/Twitter. Refreshing...`

              toast.success(message, { duration: 2000 })

              // Auto-refresh the page after a short delay to show the toast
              setTimeout(() => {
                window.location.reload()
              }, 2000)
            }
          })
          .catch((error) => {
            logger.error('Error reloading stores after extension update', error)

            // Always show error toast (regardless of notification setting)
            toast.error(
              'Failed to load imported bookmarks. Please refresh the page.'
            )
          })
      }
    }

    window.addEventListener('message', handleExtensionMessage)
    return () => window.removeEventListener('message', handleExtensionMessage)
  }, [])

  // Auto-sync: Request bookmarks from extension when app opens
  useEffect(() => {
    const autoSyncInterval = useSettingsStore.getState().extension.autoSyncInterval

    // Only auto-sync if not set to 'manual' or 'off'
    if (autoSyncInterval === 'manual' || autoSyncInterval === 'off') {
      logger.debug(`Auto-sync: Disabled (set to ${autoSyncInterval})`)
      return
    }

    // Check if user recently cleared data - don't auto-sync in that case
    if (localStorageService.getHasBeenCleared()) {
      logger.debug('Auto-sync: Disabled (user cleared data)')
      return
    }

    // Check if user recently imported from a file - don't auto-sync to prevent overwriting
    const lastImportSource = localStorageService.getLastImportSource()
    if (lastImportSource === 'file') {
      logger.debug('Auto-sync: Disabled (user imported from file - preventing data overwrite)')
      return
    }

    // Small delay to ensure extension is ready
    const timer = setTimeout(() => {
      window.postMessage(
        {
          type: 'X_REQUEST_SYNC',
          source: 'x-bookmark-manager-app',
        },
        '*'
      )
      logger.debug('Auto-sync: Requested bookmarks from extension')
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Validate bookmarks on app open
  useEffect(() => {
    // Only validate if we have existing bookmarks
    if (hasExistingBookmarks === true) {
      const timer = setTimeout(() => {
        const validateAllBookmarks =
          useBookmarkStore.getState().validateAllBookmarks
        validateAllBookmarks().catch((error) => {
          logger.error('Failed to validate bookmarks on startup', error)
        })
      }, 2000) // Delay to allow other initialization to complete

      return () => clearTimeout(timer)
    }
  }, [hasExistingBookmarks])

  // Only show loading when we're actually loading and have existing bookmarks
  const showLoading =
    hasExistingBookmarks === true && (isLoading || collectionsLoading)

  return {
    isLoading: showLoading,
    error: error || collectionsError,
    hasExistingBookmarks,
  }
}
