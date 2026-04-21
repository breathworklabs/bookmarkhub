import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookmarkStore } from '@/store/bookmarkStore'

export const useNavigateWithCleanup = () => {
  const navigate = useNavigate()
  const clearBookmarkSelection = useBookmarkStore(
    (state) => state.clearBookmarkSelection
  )

  return useCallback(
    (path: string, onComplete?: () => void) => {
      clearBookmarkSelection()

      navigate(path)

      onComplete?.()
    },
    [navigate, clearBookmarkSelection]
  )
}
