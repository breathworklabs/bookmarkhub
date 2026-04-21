import type { StoreSet, StoreGet } from '@/store/bookmark/types'
import { localStorageService, type StoredBookmark } from '@/lib/localStorage'
import { sanitizeBookmark } from '@/lib/dataValidation'
import { detectDuplicate } from '@/lib/duplicateDetection'
import { trackOperationPerformance } from '@/lib/performance'
import { logger } from '@/lib/logger'
import { mockBookmarks } from '@/data/mockBookmarks'
import { useSettingsStore } from '@/store/settingsStore'
import { handleStoreError } from '@/store/utils/handleStoreError'

export const createCrudActions = (set: StoreSet, get: StoreGet) => ({
  initialize: async () => {
    const startTime = Date.now()
    try {
      try {
        await localStorageService.cleanupOldTrash(30)
      } catch (error) {
        logger.warn('Failed to cleanup old trash', error)
      }

      const bookmarks = await localStorageService.getBookmarks()

      if (bookmarks.length > 0) {
        set(
          {
            bookmarks,
            selectedTags: [],
            searchQuery: '',
            activeTab: 0,
            selectedBookmarks: [],
            isLoading: false,
          },
          false,
          'initialize:immediateLoad'
        )

        Promise.resolve(get().calculateFilterOptions()).catch((error) => {
          logger.error('Background initialization failed', error)
        })
      } else {
        const hasBeenCleared = localStorageService.getHasBeenCleared()

        if (hasBeenCleared) {
          set(
            {
              bookmarks: [],
              selectedTags: [],
              searchQuery: '',
              activeTab: 0,
              selectedBookmarks: [],
              isLoading: false,
            },
            false,
            'initialize:empty'
          )
        } else {
          set(
            {
              bookmarks: mockBookmarks,
              selectedTags: [],
              searchQuery: '',
              activeTab: 0,
              selectedBookmarks: [],
              isLoading: false,
            },
            false,
            'initialize:mockData'
          )

          get().calculateFilterOptions()
        }
      }

      const bookmarkCount = get().bookmarks.length
      trackOperationPerformance('bookmark_store_init', startTime, {
        count: bookmarkCount,
      })
    } catch (error) {
      handleStoreError(set, error, 'initialize', {
        isLoading: false,
        extra: { bookmarks: [] },
      })
    }
  },

  loadBookmarks: async () => {
    const state = get()

    if (state.isLoading) {
      return
    }

    try {
      set({ isLoading: true, error: null }, false, 'loadBookmarks:start')

      const bookmarks = await localStorageService.getBookmarks()
      set({ bookmarks, isLoading: false }, false, 'loadBookmarks:success')

      get().calculateFilterOptions()
    } catch (error) {
      handleStoreError(set, error, 'loadBookmarks', { isLoading: false })
    }
  },

  addBookmark: async (bookmark: Parameters<typeof sanitizeBookmark>[0]) => {
    try {
      set({ isLoading: true, error: null }, false, 'addBookmark:start')

      const sanitizedBookmark = sanitizeBookmark(bookmark)
      if (!sanitizedBookmark) {
        throw new Error('Invalid bookmark data')
      }

      const { bookmarks } = get()
      const duplicateResult = detectDuplicate(sanitizedBookmark, bookmarks)

      if (duplicateResult.isDuplicate) {
        const duplicateHandling = 'skip'
        if (duplicateHandling === 'skip') {
          set(
            {
              error: 'This bookmark already exists',
              isLoading: false,
            },
            false,
            'addBookmark:duplicate-skipped'
          )
          return
        } else if (duplicateHandling === 'replace') {
          const existingBookmark = duplicateResult.matches[0].bookmark
          await get().updateBookmark(existingBookmark.id, sanitizedBookmark)
          set({ isLoading: false }, false, 'addBookmark:duplicate-replaced')
          return
        } else {
          set(
            {
              duplicateMatches: duplicateResult.matches,
              pendingBookmark: sanitizedBookmark,
              showDuplicateDialog: true,
              isLoading: false,
            },
            false,
            'addBookmark:duplicate-found'
          )
          return
        }
      }

      if (useSettingsStore.getState().isDemoMode) {
        useSettingsStore.getState().setDemoMode(false)
        set({ bookmarks: [] }, false, 'addBookmark:exit-demo')
      }

      const newBookmark =
        await localStorageService.createBookmark(sanitizedBookmark)

      localStorageService.setHasBeenCleared(false)

      set(
        (state) => ({ bookmarks: [newBookmark, ...state.bookmarks] }),
        false,
        'addBookmark:success'
      )

      get().addActivityLog('Added bookmark', sanitizedBookmark.title)
    } catch (error) {
      handleStoreError(set, error, 'addBookmark')
    } finally {
      set({ isLoading: false }, false, 'addBookmark:complete')
    }
  },

  updateBookmark: async (
    id: number,
    bookmark: Partial<Parameters<typeof sanitizeBookmark>[0]>
  ) => {
    try {
      set({ isLoading: true, error: null }, false, 'updateBookmark:start')

      const sanitizedBookmark = sanitizeBookmark(bookmark)
      if (!sanitizedBookmark) {
        throw new Error('Invalid bookmark data')
      }

      const updatedBookmark = await localStorageService.updateBookmark(
        id,
        sanitizedBookmark
      )
      set(
        (state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? updatedBookmark : b
          ),
        }),
        false,
        'updateBookmark:success'
      )

      get().addActivityLog('Updated bookmark', sanitizedBookmark.title)
    } catch (error) {
      handleStoreError(set, error, 'updateBookmark', { notify: true })
    } finally {
      set({ isLoading: false }, false, 'updateBookmark:complete')
    }
  },

  removeBookmark: async (id: number) => {
    try {
      set({ isLoading: true, error: null }, false, 'removeBookmark:start')
      const updatedBookmark = await localStorageService.moveToTrash(id)
      set(
        (state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? updatedBookmark : b
          ),
        }),
        false,
        'removeBookmark:success'
      )

      get().addActivityLog('Moved to trash', updatedBookmark.title)
    } catch (error) {
      handleStoreError(set, error, 'removeBookmark', { notify: true })
    } finally {
      set({ isLoading: false }, false, 'removeBookmark:complete')
    }
  },

  toggleStarBookmark: async (id: number) => {
    try {
      const updatedBookmark = await localStorageService.toggleBookmarkStar(id)
      set(
        (state) => ({
          bookmarks: state.bookmarks.map((bookmark) =>
            bookmark.id === id ? updatedBookmark : bookmark
          ),
        }),
        false,
        'toggleStarBookmark:success'
      )

      if (updatedBookmark.is_starred) {
        get().addActivityLog('Starred bookmark', updatedBookmark.title)
      }
    } catch (error) {
      handleStoreError(set, error, 'toggleStarBookmark', { notify: true })
    }
  },

  toggleArchiveBookmark: async (id: number) => {
    try {
      const bookmarks = await localStorageService.getBookmarks()
      const bookmark = bookmarks.find((b: StoredBookmark) => b.id === id)

      if (!bookmark) {
        throw new Error(`Bookmark with id ${id} not found`)
      }

      const isArchiving = !bookmark.is_archived
      const updatedBookmark = await localStorageService.updateBookmark(id, {
        is_archived: isArchiving,
        collections: isArchiving ? [] : ['uncategorized'],
        primaryCollection: isArchiving ? undefined : 'uncategorized',
      })

      set(
        (state) => ({
          bookmarks: state.bookmarks.map((bookmark) =>
            bookmark.id === id ? updatedBookmark : bookmark
          ),
        }),
        false,
        'toggleArchiveBookmark:success'
      )

      if (updatedBookmark.is_archived) {
        get().addActivityLog('Archived bookmark', updatedBookmark.title)
      } else {
        get().addActivityLog('Unarchived bookmark', updatedBookmark.title)
      }
    } catch (error) {
      handleStoreError(set, error, 'toggleArchiveBookmark', { notify: true })
    }
  },

  searchBookmarks: async (query: string) => {
    if (!query.trim()) {
      await get().loadBookmarks()
      return
    }

    try {
      set({ isLoading: true, error: null }, false, 'searchBookmarks:start')
      const results = await localStorageService.searchBookmarks(query)
      set({ bookmarks: results }, false, 'searchBookmarks:success')
    } catch (error) {
      handleStoreError(set, error, 'searchBookmarks')
    } finally {
      set({ isLoading: false }, false, 'searchBookmarks:complete')
    }
  },
})
