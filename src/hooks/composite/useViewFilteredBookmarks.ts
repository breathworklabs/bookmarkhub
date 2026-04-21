import { useMemo } from 'react'
import { type Bookmark } from '@/types/bookmark'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useViewStore } from '@/store/viewStore'
import {
  getBookmarksForView,
  buildMembershipIndex,
} from '@/utils/viewFiltering'

export const useViewFilteredBookmarks = (): Bookmark[] => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const activeViewId = useViewStore((state) => state.activeViewId)
  const views = useViewStore((state) => state.views)
  const validationResults = useBookmarkStore((state) => state.validationResults)

  return useMemo(() => {
    const activeView = views.find((v) => v.id === activeViewId)
    if (!activeView) return bookmarks

    const invalidIds = validationResults
      ? new Set(validationResults.filter((r) => !r.isValid).map((r) => r.id))
      : undefined

    const membershipIndex = buildMembershipIndex(views)

    return getBookmarksForView(
      activeView,
      bookmarks,
      invalidIds,
      membershipIndex
    )
  }, [bookmarks, activeViewId, views, validationResults])
}

export default useViewFilteredBookmarks
