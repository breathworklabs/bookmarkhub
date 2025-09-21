import { useEffect, useRef } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'

export const useInitializeApp = () => {
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

    // Initialize both stores
    const initializeApp = async () => {
      await Promise.all([
        useBookmarkStore.getState().initialize(),
        useCollectionsStore.getState().initialize()
      ])
    }

    initializeApp()
  }, []) // Empty dependency array to run only once

  return {
    isLoading: isLoading || collectionsLoading,
    error: error || collectionsError
  }
}