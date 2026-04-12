import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useViewStore } from '@/store/viewStore'
import { SYSTEM_VIEWS } from '@/types/views'

const COLLECTION_VIEW_ID_MAP: Record<string, string> = {
  'all-bookmarks': SYSTEM_VIEWS.ALL,
  starred: SYSTEM_VIEWS.STARRED,
  recent: SYSTEM_VIEWS.RECENT,
  archived: SYSTEM_VIEWS.ARCHIVED,
  uncategorized: SYSTEM_VIEWS.UNCATEGORIZED,
}

export const useCollectionNavigation = (): ((collectionId: string) => void) => {
  const navigate = useNavigate()

  return useCallback(
    (collectionId: string) => {
      const viewId = COLLECTION_VIEW_ID_MAP[collectionId] ?? `view-${collectionId}`
      const { activeViewId } = useViewStore.getState()
      const newActiveId =
        activeViewId === viewId ? SYSTEM_VIEWS.ALL : viewId

      useViewStore.getState().setActiveView(newActiveId)
      useBookmarkStore.getState().clearBookmarkSelection()

      navigate('/')

      useBookmarkStore.getState().setActiveSidebarItem('All Bookmarks')
    },
    [navigate]
  )
}
