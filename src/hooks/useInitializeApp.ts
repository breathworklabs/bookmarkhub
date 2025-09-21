import { useEffect, useRef } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'

export const useInitializeApp = () => {
  const isLoading = useBookmarkStore((state) => state.isLoading)
  const error = useBookmarkStore((state) => state.error)

  const hasInitialized = useRef(false)

  useEffect(() => {
    // Prevent duplicate initialization
    if (hasInitialized.current) {
      return
    }

    hasInitialized.current = true

    // Initialize the app once using the store directly to avoid dependency issues
    useBookmarkStore.getState().initialize()
  }, []) // Empty dependency array to run only once

  return { isLoading, error }
}