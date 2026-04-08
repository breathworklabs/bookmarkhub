import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useCollectionsStore } from '@/store/collectionsStore'

export const useCollectionNavigation = (): ((collectionId: string) => void) => {
  const navigate = useNavigate()

  return useCallback(
    (collectionId: string) => {
      const { activeCollectionId } = useCollectionsStore.getState()
      const newActiveId =
        activeCollectionId === collectionId ? null : collectionId

      useCollectionsStore.getState().setActiveCollection(newActiveId)
      useBookmarkStore.getState().clearBookmarkSelection()

      navigate('/')

      useBookmarkStore
        .getState()
        .setActiveSidebarItem(newActiveId ? 'Collections' : 'All Bookmarks')
    },
    [navigate]
  )
}
