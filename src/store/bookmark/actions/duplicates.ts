import type { StoreSet, StoreGet } from '@/store/bookmark/types'
import type { DuplicateMatch } from '@/lib/duplicateDetection'
import type { BookmarkInsert } from '@/types/bookmark'
import { localStorageService } from '@/lib/localStorage'
import { handleStoreError } from '@/store/utils/handleStoreError'

export const createDuplicateActions = (set: StoreSet, get: StoreGet) => ({
  setDuplicateMatches: (matches: DuplicateMatch[]) => {
    set({ duplicateMatches: matches }, false, 'setDuplicateMatches')
  },

  setPendingBookmark: (bookmark: BookmarkInsert | null) => {
    set({ pendingBookmark: bookmark }, false, 'setPendingBookmark')
  },

  setShowDuplicateDialog: (show: boolean) => {
    set({ showDuplicateDialog: show }, false, 'setShowDuplicateDialog')
  },

  confirmAddDuplicate: async () => {
    const { pendingBookmark } = get()
    if (!pendingBookmark) return

    try {
      set({ isLoading: true }, false, 'confirmAddDuplicate:start')

      const newBookmark =
        await localStorageService.createBookmark(pendingBookmark)
      set(
        (state) => ({
          bookmarks: [newBookmark, ...state.bookmarks],
          duplicateMatches: [],
          pendingBookmark: null,
          showDuplicateDialog: false,
          isLoading: false,
        }),
        false,
        'confirmAddDuplicate:success'
      )
    } catch (error) {
      handleStoreError(set, error, 'confirmAddDuplicate', { isLoading: false })
    }
  },

  cancelAddDuplicate: () => {
    set(
      {
        duplicateMatches: [],
        pendingBookmark: null,
        showDuplicateDialog: false,
      },
      false,
      'cancelAddDuplicate'
    )
  },
})
