import { useCallback } from 'react'
import { useBookmarkStore } from '@/store/bookmarkStore'

export interface BookmarkActions {
  toggleStar: () => Promise<void>
  remove: () => Promise<void>
  archive: () => Promise<void>
  unarchive: () => Promise<void>
  select: () => void
  deselect: () => void
  toggleSelection: () => void
}

export const useBookmarkActions = (bookmarkId: number): BookmarkActions => {
  const toggleStar = useCallback(async () => {
    await useBookmarkStore.getState().toggleStarBookmark(bookmarkId)
  }, [bookmarkId])

  const remove = useCallback(async () => {
    await useBookmarkStore.getState().removeBookmark(bookmarkId)
  }, [bookmarkId])

  const archive = useCallback(async () => {
    await useBookmarkStore.getState().toggleArchiveBookmark(bookmarkId)
  }, [bookmarkId])

  const unarchive = useCallback(async () => {
    await useBookmarkStore.getState().toggleArchiveBookmark(bookmarkId)
  }, [bookmarkId])

  const select = useCallback(() => {
    useBookmarkStore.getState().selectBookmark(bookmarkId)
  }, [bookmarkId])

  const deselect = useCallback(() => {
    useBookmarkStore.getState().deselectBookmark(bookmarkId)
  }, [bookmarkId])

  const toggleSelection = useCallback(() => {
    useBookmarkStore.getState().toggleBookmarkSelection(bookmarkId)
  }, [bookmarkId])

  return {
    toggleStar,
    remove,
    archive,
    unarchive,
    select,
    deselect,
    toggleSelection,
  }
}
