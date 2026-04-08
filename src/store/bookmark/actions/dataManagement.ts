import type { StoreSet, StoreGet } from '@/store/bookmark/types'
import { localStorageService } from '@/lib/localStorage'
import { sanitizeBookmark, validateImportData } from '@/lib/dataValidation'
import {
  transformXBookmarks,
  validateXBookmarkData,
} from '@/lib/xBookmarkTransform'
import { downloadFile } from '@/lib/exportFormats'
import { trackOperationPerformance } from '@/lib/performance'
import { logger } from '@/lib/logger'
import { mockBookmarks } from '@/data/mockBookmarks'
import { useSettingsStore } from '@/store/settingsStore'
import { useCollectionsStore } from '@/store/collectionsStore'
import { fetchPopularTechTweets } from '@/lib/fetchLiveTweets'
import { handleStoreError } from '@/store/utils/handleStoreError'

export const createDataManagementActions = (set: StoreSet, get: StoreGet) => ({
  exportBookmarks: async () => {
    try {
      const date = new Date().toISOString().split('T')[0]

      const data = await localStorageService.exportData()
      const jsonContent = JSON.stringify(data, null, 2)
      downloadFile(jsonContent, `x-bookmarks-${date}.json`, 'application/json')
    } catch (error) {
      handleStoreError(set, error, 'exportBookmarks', { notify: true })
    }
  },

  importBookmarks: async (file: File) => {
    const startTime = Date.now()
    try {
      set({ isLoading: true, error: null }, false, 'importBookmarks:start')

      const text = await file.text()
      const data = JSON.parse(text)

      const validation = validateImportData(data)
      if (!validation.valid) {
        throw new Error(`Invalid import data: ${validation.errors.join(', ')}`)
      }

      if (useSettingsStore.getState().isDemoMode) {
        useSettingsStore.getState().setDemoMode(false)
      }

      await localStorageService.importData(data)
      await get().loadBookmarks()

      localStorageService.setHasBeenCleared(false)

      localStorageService.setLastImportSource('file')

      const importedCount = data.bookmarks?.length || 0
      trackOperationPerformance('bookmark_import', startTime, {
        count: importedCount,
      })
    } catch (error) {
      handleStoreError(set, error, 'importBookmarks', { notify: true })
    } finally {
      set({ isLoading: false }, false, 'importBookmarks:complete')
    }
  },

  importXBookmarks: async (data: any[], limit?: number) => {
    try {
      set({ isLoading: true, error: null }, false, 'importXBookmarks:start')

      const validation = validateXBookmarkData(data)
      if (!validation.valid) {
        throw new Error(
          `Invalid X bookmark data: ${validation.errors.join(', ')}`
        )
      }

      if (useSettingsStore.getState().isDemoMode) {
        useSettingsStore.getState().setDemoMode(false)
        await localStorageService.clearAllData()
      }

      const transformedBookmarks = transformXBookmarks(data, limit)

      for (const bookmark of transformedBookmarks) {
        try {
          const sanitized = sanitizeBookmark(bookmark)
          if (sanitized) {
            await localStorageService.createBookmark(sanitized)
          }
        } catch (error) {
          logger.warn(`Failed to import bookmark: ${bookmark.title}`, error)
        }
      }

      localStorageService.setHasBeenCleared(false)

      localStorageService.setLastImportSource('extension')

      await get().loadBookmarks()
    } catch (error) {
      handleStoreError(set, error, 'importXBookmarks', { notify: true })
    } finally {
      set({ isLoading: false }, false, 'importXBookmarks:complete')
    }
  },

  clearAllData: async () => {
    try {
      set({ isLoading: true, error: null }, false, 'clearAllData:start')

      await localStorageService.clearAllData()

      localStorageService.setHasBeenCleared(true)

      set(
        {
          bookmarks: [],
          selectedTags: [],
          searchQuery: '',
          activeTab: 0,
          selectedBookmarks: [],
          activeSidebarItem: 'All Bookmarks',
        },
        false,
        'clearAllData:success'
      )
    } catch (error) {
      handleStoreError(set, error, 'clearAllData', { notify: true })
    } finally {
      set({ isLoading: false }, false, 'clearAllData:complete')
    }
  },

  loadDemoData: async () => {
    try {
      set({ isLoading: true, error: null }, false, 'loadDemoData:start')

      logger.info('Loading demo data...')

      let demoBookmarks = await fetchPopularTechTweets()

      if (demoBookmarks.length === 0) {
        logger.warn(
          'Live tweet fetch failed or returned no data, using static mock bookmarks'
        )
        demoBookmarks = mockBookmarks
      }

      logger.info('Persisting demo bookmarks to localStorage...')
      for (const bookmark of demoBookmarks) {
        try {
          await localStorageService.createBookmark(bookmark)
        } catch (error) {
          logger.warn(
            `Failed to persist demo bookmark: ${bookmark.title}`,
            error
          )
        }
      }

      set(
        {
          bookmarks: demoBookmarks,
          selectedTags: [],
          searchQuery: '',
          activeTab: 0,
          selectedBookmarks: [],
          isLoading: false,
        },
        false,
        'loadDemoData:success'
      )

      get().calculateFilterOptions()

      const collectionsStore = useCollectionsStore.getState()
      logger.info(
        'Initializing collections store with default smart collections...'
      )
      await collectionsStore.initialize()

      localStorageService.setHasBeenCleared(false)

      useSettingsStore.getState().setDemoMode(true)
      useSettingsStore.getState().setShowDemoInfoModal(true)

      const source = demoBookmarks === mockBookmarks ? 'static' : 'live'
      get().addActivityLog(
        'Loaded demo data',
        `${demoBookmarks.length} ${source} sample bookmarks`
      )

      logger.info(
        `Demo mode activated with ${demoBookmarks.length} ${source} bookmarks`
      )
    } catch (error) {
      handleStoreError(set, error, 'loadDemoData', {
        isLoading: false,
        notify: true,
      })
    }
  },

  exitDemoMode: () => {
    useSettingsStore.getState().setDemoMode(false)
    set(
      {
        bookmarks: [],
        selectedTags: [],
        searchQuery: '',
        activeTab: 0,
        selectedBookmarks: [],
      },
      false,
      'exitDemoMode'
    )
    logger.info('Demo mode deactivated')
  },
})
