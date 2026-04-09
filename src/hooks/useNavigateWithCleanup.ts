import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollectionsStore } from '@/store/collectionsStore'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useViewStore } from '@/store/viewStore'
import { SYSTEM_VIEWS } from '@/types/views'

export const useNavigateWithCleanup = () => {
  const navigate = useNavigate()
  const setActiveCollection = useCollectionsStore(
    (state) => state.setActiveCollection
  )
  const clearBookmarkSelection = useBookmarkStore(
    (state) => state.clearBookmarkSelection
  )

  return useCallback(
    (path: string, onComplete?: () => void) => {
      setActiveCollection(null)
      clearBookmarkSelection()
      useViewStore.getState().setActiveView(SYSTEM_VIEWS.ALL)

      navigate(path)

      onComplete?.()
    },
    [navigate, setActiveCollection, clearBookmarkSelection]
  )
}
