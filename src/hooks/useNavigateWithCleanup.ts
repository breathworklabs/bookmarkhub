import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollectionsStore } from '../store/collectionsStore'
import { useBookmarkStore } from '../store/bookmarkStore'

/**
 * Custom navigation hook that clears active collection and bookmark selection
 * before navigating to a new route.
 *
 * This hook consolidates the common pattern of:
 * - Clearing active collection
 * - Clearing bookmark selection
 * - Navigating to a new route
 * - Optionally calling a callback
 *
 * @returns A function that takes a path and optional callback
 */
export const useNavigateWithCleanup = () => {
  const navigate = useNavigate()
  const setActiveCollection = useCollectionsStore((state) => state.setActiveCollection)
  const clearBookmarkSelection = useBookmarkStore((state) => state.clearBookmarkSelection)

  return useCallback(
    (path: string, onComplete?: () => void) => {
      // Clear active collection and bookmark selection
      setActiveCollection(null)
      clearBookmarkSelection()

      // Navigate to the new path
      navigate(path)

      // Call optional callback
      onComplete?.()
    },
    [navigate, setActiveCollection, clearBookmarkSelection]
  )
}
