import type { StoreSet, StoreGet } from '@/store/bookmark/types'
import {
  validateBookmarks,
  getValidationSummary,
  loadCachedValidationResults,
  saveCachedValidationResults,
  areCachedResultsFresh,
} from '@/services/bookmarkValidationService'
import { addActivityToLogs, getRecentLogs } from '@/utils/activityLogger'
import { handleStoreError } from '@/store/utils/handleStoreError'

export const createValidationActions = (set: StoreSet, get: StoreGet) => ({
  addActivityLog: (action: string, details?: string) => {
    const state = get()
    const updatedActivity = addActivityToLogs(
      state.recentActivity,
      action,
      details
    )
    set({ recentActivity: updatedActivity }, false, 'addActivityLog')
  },

  getRecentActivity: (limit = 10) => {
    const state = get()
    return getRecentLogs(state.recentActivity, limit)
  },

  validateAllBookmarks: async () => {
    const state = get()

    const cachedResults = loadCachedValidationResults()
    if (cachedResults.length > 0 && areCachedResultsFresh(cachedResults)) {
      const summary = getValidationSummary(cachedResults)
      set(
        {
          validationResults: cachedResults,
          validationSummary: summary,
        },
        false,
        'validateAllBookmarks:useCached'
      )
      return
    }

    set(
      {
        isValidating: true,
        validationProgress: { current: 0, total: state.bookmarks.length },
      },
      false,
      'validateAllBookmarks:start'
    )

    try {
      const results = await validateBookmarks(
        state.bookmarks,
        (current, total) => {
          set(
            {
              validationProgress: { current, total },
            },
            false,
            'validateAllBookmarks:progress'
          )
        },
        5
      )

      const summary = getValidationSummary(results)

      saveCachedValidationResults(results)

      set(
        {
          validationResults: results,
          validationSummary: summary,
          isValidating: false,
          validationProgress: null,
        },
        false,
        'validateAllBookmarks:complete'
      )

      if (summary.invalid > 0) {
        get().addActivityLog(
          'Validation complete',
          `Found ${summary.invalid} broken link${summary.invalid > 1 ? 's' : ''}`
        )
      }
    } catch (error) {
      handleStoreError(set, error, 'validateAllBookmarks', {
        extra: { isValidating: false, validationProgress: null },
      })
    }
  },

  getInvalidBookmarksCount: () => {
    const state = get()
    return state.validationSummary?.invalid || 0
  },
})
