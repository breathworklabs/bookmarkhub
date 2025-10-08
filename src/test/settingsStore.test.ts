import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '../store/settingsStore'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('SettingsStore', () => {
  beforeEach(() => {
    // Clear localStorage and reset store
    localStorageMock.clear()
    useSettingsStore.getState().resetAllSettings()
  })

  describe('Extension Settings', () => {
    it('should initialize with default extension settings', () => {
      const { extension } = useSettingsStore.getState()

      expect(extension.autoSyncInterval).toBe('manual')
      expect(extension.syncNotifications).toBe(true)
      expect(extension.defaultTags).toEqual([])
      expect(extension.importDuplicates).toBe('skip')
      expect(extension.autoOpenApp).toBe(false)
      expect(extension.defaultCollection).toBeNull()
    })

    it('should update extension settings partially', () => {
      const { updateExtensionSettings } = useSettingsStore.getState()

      updateExtensionSettings({
        syncNotifications: false,
        autoOpenApp: true
      })

      const { extension } = useSettingsStore.getState()
      expect(extension.syncNotifications).toBe(false)
      expect(extension.autoOpenApp).toBe(true)
      // Other settings should remain default
      expect(extension.autoSyncInterval).toBe('manual')
      expect(extension.importDuplicates).toBe('skip')
    })

    it('should set auto sync interval', () => {
      const { setAutoSyncInterval } = useSettingsStore.getState()

      setAutoSyncInterval('15min')

      const { extension } = useSettingsStore.getState()
      expect(extension.autoSyncInterval).toBe('15min')
    })

    it('should set sync notifications', () => {
      const { setSyncNotifications } = useSettingsStore.getState()

      setSyncNotifications(false)

      const { extension } = useSettingsStore.getState()
      expect(extension.syncNotifications).toBe(false)
    })

    it('should set default tags', () => {
      const { setDefaultTags } = useSettingsStore.getState()
      const tags = ['work', 'important', 'todo']

      setDefaultTags(tags)

      const { extension } = useSettingsStore.getState()
      expect(extension.defaultTags).toEqual(tags)
    })

    it('should set import duplicates handling', () => {
      const { setImportDuplicates } = useSettingsStore.getState()

      setImportDuplicates('keep-both')

      const { extension } = useSettingsStore.getState()
      expect(extension.importDuplicates).toBe('keep-both')
    })

    it('should set auto open app', () => {
      const { setAutoOpenApp } = useSettingsStore.getState()

      setAutoOpenApp(true)

      const { extension } = useSettingsStore.getState()
      expect(extension.autoOpenApp).toBe(true)
    })

    it('should set default collection', () => {
      const { setDefaultCollection } = useSettingsStore.getState()
      const collectionId = 'collection-123'

      setDefaultCollection(collectionId)

      const { extension } = useSettingsStore.getState()
      expect(extension.defaultCollection).toBe(collectionId)
    })

    it('should handle clearing default collection', () => {
      const { setDefaultCollection } = useSettingsStore.getState()

      setDefaultCollection('collection-123')
      expect(useSettingsStore.getState().extension.defaultCollection).toBe('collection-123')

      setDefaultCollection(null)
      expect(useSettingsStore.getState().extension.defaultCollection).toBeNull()
    })

    it('should reset extension settings to defaults', () => {
      const { updateExtensionSettings, resetExtensionSettings } = useSettingsStore.getState()

      // Change some settings
      updateExtensionSettings({
        autoSyncInterval: '1hour',
        syncNotifications: false,
        defaultTags: ['test'],
        autoOpenApp: true
      })

      // Reset
      resetExtensionSettings()

      const { extension } = useSettingsStore.getState()
      expect(extension.autoSyncInterval).toBe('manual')
      expect(extension.syncNotifications).toBe(true)
      expect(extension.defaultTags).toEqual([])
      expect(extension.autoOpenApp).toBe(false)
    })
  })

  describe('Display Settings', () => {
    it('should initialize with default display settings', () => {
      const { display } = useSettingsStore.getState()

      expect(display.theme).toBe('dark')
      expect(display.fontSize).toBe('medium')
      expect(display.viewMode).toBe('grid')
      expect(display.cardsPerPage).toBe(20)
      expect(display.compactView).toBe(false)
      expect(display.mediaPreview).toBe('auto')
      expect(display.animationsEnabled).toBe(true)
      expect(display.sortBy).toBe('date')
      expect(display.sortOrder).toBe('desc')
    })

    it('should update display settings partially', () => {
      const { updateDisplaySettings } = useSettingsStore.getState()

      updateDisplaySettings({
        theme: 'light',
        compactView: true,
        cardsPerPage: 50
      })

      const { display } = useSettingsStore.getState()
      expect(display.theme).toBe('light')
      expect(display.compactView).toBe(true)
      expect(display.cardsPerPage).toBe(50)
      // Other settings remain default
      expect(display.fontSize).toBe('medium')
      expect(display.viewMode).toBe('grid')
    })

    it('should set theme', () => {
      const { setTheme } = useSettingsStore.getState()

      setTheme('light')
      expect(useSettingsStore.getState().display.theme).toBe('light')

      setTheme('auto')
      expect(useSettingsStore.getState().display.theme).toBe('auto')
    })

    it('should set font size', () => {
      const { setFontSize } = useSettingsStore.getState()

      setFontSize('large')
      expect(useSettingsStore.getState().display.fontSize).toBe('large')

      setFontSize('small')
      expect(useSettingsStore.getState().display.fontSize).toBe('small')
    })

    it('should set view mode', () => {
      const { setViewMode } = useSettingsStore.getState()

      setViewMode('list')
      expect(useSettingsStore.getState().display.viewMode).toBe('list')

      setViewMode('grid')
      expect(useSettingsStore.getState().display.viewMode).toBe('grid')
    })

    it('should set sort by', () => {
      const { setSortBy } = useSettingsStore.getState()

      setSortBy('title')
      expect(useSettingsStore.getState().display.sortBy).toBe('title')

      setSortBy('domain')
      expect(useSettingsStore.getState().display.sortBy).toBe('domain')
    })

    it('should set sort order', () => {
      const { setSortOrder } = useSettingsStore.getState()

      setSortOrder('asc')
      expect(useSettingsStore.getState().display.sortOrder).toBe('asc')

      setSortOrder('desc')
      expect(useSettingsStore.getState().display.sortOrder).toBe('desc')
    })
  })

  describe('Privacy Settings', () => {
    it('should initialize with default privacy settings', () => {
      const { privacy } = useSettingsStore.getState()

      expect(privacy.analyticsEnabled).toBe(false)
      expect(privacy.searchHistoryEnabled).toBe(true)
    })

    it('should update privacy settings', () => {
      const { updatePrivacySettings } = useSettingsStore.getState()

      updatePrivacySettings({
        analyticsEnabled: true,
        searchHistoryEnabled: false
      })

      const { privacy } = useSettingsStore.getState()
      expect(privacy.analyticsEnabled).toBe(true)
      expect(privacy.searchHistoryEnabled).toBe(false)
    })

    it('should update privacy settings partially', () => {
      const { updatePrivacySettings } = useSettingsStore.getState()

      updatePrivacySettings({
        analyticsEnabled: true
      })

      const { privacy } = useSettingsStore.getState()
      expect(privacy.analyticsEnabled).toBe(true)
      expect(privacy.searchHistoryEnabled).toBe(true) // Unchanged
    })
  })

  describe('Reset Functionality', () => {
    it('should reset all settings to defaults', () => {
      const {
        updateExtensionSettings,
        updateDisplaySettings,
        updatePrivacySettings,
        resetAllSettings
      } = useSettingsStore.getState()

      // Change all settings
      updateExtensionSettings({
        autoSyncInterval: '1hour',
        syncNotifications: false,
        defaultTags: ['test']
      })
      updateDisplaySettings({
        theme: 'light',
        viewMode: 'list',
        fontSize: 'large'
      })
      updatePrivacySettings({
        analyticsEnabled: true,
        searchHistoryEnabled: false
      })

      // Verify changes were applied
      let state = useSettingsStore.getState()
      expect(state.extension.autoSyncInterval).toBe('1hour')
      expect(state.display.theme).toBe('light')
      expect(state.privacy.analyticsEnabled).toBe(true)

      // Reset all
      resetAllSettings()

      // Verify defaults
      state = useSettingsStore.getState()
      expect(state.extension.autoSyncInterval).toBe('manual')
      expect(state.extension.syncNotifications).toBe(true)
      expect(state.extension.defaultTags).toEqual([])
      expect(state.display.theme).toBe('dark')
      expect(state.display.viewMode).toBe('grid')
      expect(state.display.fontSize).toBe('medium')
      expect(state.privacy.analyticsEnabled).toBe(false)
      expect(state.privacy.searchHistoryEnabled).toBe(true)
    })
  })

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle all sync interval options', () => {
      const { setAutoSyncInterval } = useSettingsStore.getState()
      const intervals = ['off', '5min', '15min', '30min', '1hour', 'manual'] as const

      intervals.forEach(interval => {
        setAutoSyncInterval(interval)
        expect(useSettingsStore.getState().extension.autoSyncInterval).toBe(interval)
      })
    })

    it('should handle all duplicate handling options', () => {
      const { setImportDuplicates } = useSettingsStore.getState()
      const options = ['skip', 'replace', 'keep-both'] as const

      options.forEach(option => {
        setImportDuplicates(option)
        expect(useSettingsStore.getState().extension.importDuplicates).toBe(option)
      })
    })

    it('should handle all sort options', () => {
      const { setSortBy } = useSettingsStore.getState()
      const sortOptions = ['date', 'title', 'author', 'domain'] as const

      sortOptions.forEach(option => {
        setSortBy(option)
        expect(useSettingsStore.getState().display.sortBy).toBe(option)
      })
    })

    it('should handle empty default tags array', () => {
      const { setDefaultTags } = useSettingsStore.getState()

      setDefaultTags([])
      expect(useSettingsStore.getState().extension.defaultTags).toEqual([])
    })

    it('should handle large number of default tags', () => {
      const { setDefaultTags } = useSettingsStore.getState()
      const manyTags = Array.from({ length: 100 }, (_, i) => `tag-${i}`)

      setDefaultTags(manyTags)
      expect(useSettingsStore.getState().extension.defaultTags).toEqual(manyTags)
      expect(useSettingsStore.getState().extension.defaultTags.length).toBe(100)
    })

    it('should handle multiple rapid updates', () => {
      const { setTheme, setViewMode, setFontSize } = useSettingsStore.getState()

      // Rapid fire updates
      setTheme('light')
      setTheme('dark')
      setTheme('auto')
      setViewMode('list')
      setViewMode('grid')
      setFontSize('large')
      setFontSize('small')
      setFontSize('medium')

      // Should have latest values
      const { display } = useSettingsStore.getState()
      expect(display.theme).toBe('auto')
      expect(display.viewMode).toBe('grid')
      expect(display.fontSize).toBe('medium')
    })

    it('should preserve unrelated settings when updating', () => {
      const { updateExtensionSettings, updateDisplaySettings } = useSettingsStore.getState()

      // Set extension settings
      updateExtensionSettings({
        autoSyncInterval: '1hour',
        syncNotifications: false
      })

      // Update display settings
      updateDisplaySettings({
        theme: 'light',
        viewMode: 'list'
      })

      const state = useSettingsStore.getState()

      // Extension settings should still be there
      expect(state.extension.autoSyncInterval).toBe('1hour')
      expect(state.extension.syncNotifications).toBe(false)

      // Display settings should be updated
      expect(state.display.theme).toBe('light')
      expect(state.display.viewMode).toBe('list')
    })
  })

  describe('State Consistency', () => {
    it('should maintain state consistency across multiple operations', () => {
      const store = useSettingsStore.getState()

      // Perform a series of operations
      store.setAutoSyncInterval('15min')
      store.setTheme('light')
      store.updatePrivacySettings({ analyticsEnabled: true })
      store.setDefaultTags(['work', 'personal'])
      store.setViewMode('list')
      store.setSortBy('title')
      store.setSortOrder('asc')

      const state = useSettingsStore.getState()

      // Verify all changes are present
      expect(state.extension.autoSyncInterval).toBe('15min')
      expect(state.extension.defaultTags).toEqual(['work', 'personal'])
      expect(state.display.theme).toBe('light')
      expect(state.display.viewMode).toBe('list')
      expect(state.display.sortBy).toBe('title')
      expect(state.display.sortOrder).toBe('asc')
      expect(state.privacy.analyticsEnabled).toBe(true)
    })

    it('should handle setting and resetting default tags', () => {
      const { setDefaultTags, resetExtensionSettings } = useSettingsStore.getState()

      const tags = ['tag1', 'tag2']
      setDefaultTags(tags)

      const { extension } = useSettingsStore.getState()
      expect(extension.defaultTags).toEqual(['tag1', 'tag2'])

      resetExtensionSettings()
      expect(useSettingsStore.getState().extension.defaultTags).toEqual([])
    })
  })
})
