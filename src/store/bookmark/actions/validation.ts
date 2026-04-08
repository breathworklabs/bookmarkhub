import type { StoreSet, StoreGet } from '../types'
import {
  validateBookmarks,
  getValidationSummary,
  loadCachedValidationResults,
  saveCachedValidationResults,
  areCachedResultsFresh,
} from '../../../services/bookmarkValidationService'
import { logger } from '../../../lib/logger'
import { addActivityToLogs, getRecentLogs } from '../../../utils/activityLogger'

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
      logger.error('Error validating bookmarks', error)
      set(
        {
          isValidating: false,
          validationProgress: null,
          error: 'Failed to validate bookmarks',
        },
        false,
        'validateAllBookmarks:error'
      )
    }
  },

  getInvalidBookmarksCount: () => {
    const state = get()
    return state.validationSummary?.invalid || 0
  },
})
