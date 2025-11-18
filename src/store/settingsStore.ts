import { create } from 'zustand'
import { logger } from '../lib/logger'
import { persist } from 'zustand/middleware'

export interface ExtensionSettings {
  autoSyncInterval: 'off' | '5min' | '15min' | '30min' | '1hour' | 'manual'
  syncNotifications: boolean
  defaultTags: string[]
  importDuplicates: 'skip' | 'replace' | 'keep-both'
  autoOpenApp: boolean
  defaultCollection: string | null // Default collection ID for new bookmarks
}

export interface DisplaySettings {
  theme: 'dark' | 'light' | 'auto'
  fontSize: 'small' | 'medium' | 'large'
  viewMode: 'grid' | 'list'
  cardsPerPage: number
  compactView: boolean
  mediaPreview: 'auto' | 'click' | 'off'
  animationsEnabled: boolean
  sortBy: 'date' | 'title' | 'author' | 'domain' // Sorting preference
  sortOrder: 'asc' | 'desc' // Sort direction
  isSidebarCollapsed: boolean // Sidebar collapse state
  previousSidebarState: boolean | null // Previous sidebar state before help navigation
}

export interface PrivacySettings {
  analyticsEnabled: boolean
  searchHistoryEnabled: boolean
}

export interface OnboardingState {
  checklistProgress: {
    hasImportedBookmarks: boolean
    hasCreatedCollection: boolean
    hasAddedTags: boolean
    hasUsedSearchFilters: boolean
    hasExploredSettings: boolean
    hasExportedData: boolean
  }
  checklistDismissed: boolean
}

export interface SettingsState {
  extension: ExtensionSettings
  display: DisplaySettings
  privacy: PrivacySettings
  onboarding: OnboardingState
  hasSeenSplash: boolean
  extensionInstalled: boolean
  isDemoMode: boolean
  showDemoInfoModal: boolean

  // Extension settings actions
  setExtensionInstalled: (installed: boolean) => void
  updateExtensionSettings: (settings: Partial<ExtensionSettings>) => void
  setAutoSyncInterval: (interval: ExtensionSettings['autoSyncInterval']) => void
  setSyncNotifications: (enabled: boolean) => void
  setDefaultTags: (tags: string[]) => void
  setImportDuplicates: (handling: ExtensionSettings['importDuplicates']) => void
  setAutoOpenApp: (enabled: boolean) => void
  setDefaultCollection: (collectionId: string | null) => void

  // Display settings actions
  updateDisplaySettings: (settings: Partial<DisplaySettings>) => void
  setTheme: (theme: DisplaySettings['theme']) => void
  setFontSize: (size: DisplaySettings['fontSize']) => void
  setViewMode: (mode: DisplaySettings['viewMode']) => void
  setSortBy: (sortBy: DisplaySettings['sortBy']) => void
  setSortOrder: (sortOrder: DisplaySettings['sortOrder']) => void
  toggleSidebarCollapsed: () => void
  setPreviousSidebarState: (state: boolean | null) => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Privacy settings actions
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void

  // Onboarding actions
  toggleChecklistItem: (itemKey: keyof OnboardingState['checklistProgress']) => void
  setChecklistDismissed: (dismissed: boolean) => void

  // App state actions
  setHasSeenSplash: (seen: boolean) => void
  setDemoMode: (isDemo: boolean) => void
  setShowDemoInfoModal: (show: boolean) => void

  // Reset actions
  resetExtensionSettings: () => void
  resetAllSettings: () => void
}

const defaultExtensionSettings: ExtensionSettings = {
  autoSyncInterval: 'manual',
  syncNotifications: true,
  defaultTags: [],
  importDuplicates: 'skip',
  autoOpenApp: false,
  defaultCollection: null,
}

const defaultDisplaySettings: DisplaySettings = {
  theme: 'dark',
  fontSize: 'medium',
  viewMode: 'grid',
  cardsPerPage: 20,
  compactView: false,
  mediaPreview: 'auto',
  animationsEnabled: true,
  sortBy: 'date',
  sortOrder: 'desc',
  isSidebarCollapsed: false,
  previousSidebarState: null,
}

const defaultPrivacySettings: PrivacySettings = {
  analyticsEnabled: false,
  searchHistoryEnabled: true,
}

const defaultOnboardingState: OnboardingState = {
  checklistProgress: {
    hasImportedBookmarks: false,
    hasCreatedCollection: false,
    hasAddedTags: false,
    hasUsedSearchFilters: false,
    hasExploredSettings: false,
    hasExportedData: false,
  },
  checklistDismissed: false,
}

// Custom storage that uses consolidated localStorage
// Zustand v5 persist expects StorageValue<S> = { state: S, version?: number }
const consolidatedStorage = {
  getItem: (
    _name: string
  ): { state: SettingsState; version?: number } | null => {
    try {
      const data = localStorage.getItem('x-bookmark-manager-data')
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed.extensionSettings) {
          const settings = parsed.extensionSettings
          // Ensure settings has the correct structure
          if (settings && typeof settings === 'object') {
            // Handle Zustand's persist wrapper format {state, version}
            const actualSettings = settings.state || settings
            // Merge saved settings with defaults to handle new properties
            // Only return the data, not the actions - Zustand will add them
            const fullState = {
              extension: {
                ...defaultExtensionSettings,
                ...(actualSettings.extension || {}),
              },
              display: {
                ...defaultDisplaySettings,
                ...(actualSettings.display || {}),
              },
              privacy: {
                ...defaultPrivacySettings,
                ...(actualSettings.privacy || {}),
              },
              onboarding: {
                ...defaultOnboardingState,
                ...(actualSettings.onboarding || {}),
                checklistProgress: {
                  ...defaultOnboardingState.checklistProgress,
                  ...(actualSettings.onboarding?.checklistProgress || {}),
                },
              },
              hasSeenSplash: actualSettings.hasSeenSplash ?? false,
              isDemoMode: actualSettings.isDemoMode ?? false,
            } as Partial<SettingsState>
            // Return in Zustand v5 persist format
            return {
              state: fullState as SettingsState,
              version: settings.version || 0,
            }
          }
        }
      }
    } catch (error) {
      logger.error('Failed to get settings from consolidated storage:', error)
    }
    return null
  },
  setItem: (
    _name: string,
    value: { state: SettingsState; version?: number }
  ): void => {
    try {
      const data = localStorage.getItem('x-bookmark-manager-data')
      const parsed = data
        ? JSON.parse(data)
        : {
            bookmarks: [],
            collections: [],
            bookmarkCollections: [],
            settings: {},
            metadata: {},
            version: '2.0.0',
          }
      // Store the full StorageValue object
      parsed.extensionSettings = value
      localStorage.setItem('x-bookmark-manager-data', JSON.stringify(parsed))
    } catch (error) {
      logger.error('Failed to save settings to consolidated storage:', error)
    }
  },
  removeItem: (_name: string): void => {
    try {
      const data = localStorage.getItem('x-bookmark-manager-data')
      if (data) {
        const parsed = JSON.parse(data)
        delete parsed.extensionSettings
        localStorage.setItem('x-bookmark-manager-data', JSON.stringify(parsed))
      }
    } catch (error) {
      logger.error(
        'Failed to remove settings from consolidated storage:',
        error
      )
    }
  },
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      extension: defaultExtensionSettings,
      display: defaultDisplaySettings,
      privacy: defaultPrivacySettings,
      onboarding: defaultOnboardingState,
      hasSeenSplash: false,
      extensionInstalled: false,
      isDemoMode: false,
      showDemoInfoModal: false,

      // Extension settings actions
      setExtensionInstalled: (installed) => set({ extensionInstalled: installed }),
      updateExtensionSettings: (settings) =>
        set((state) => ({
          extension: { ...state.extension, ...settings },
        })),

      setAutoSyncInterval: (interval) =>
        set((state) => ({
          extension: { ...state.extension, autoSyncInterval: interval },
        })),

      setSyncNotifications: (enabled) =>
        set((state) => ({
          extension: { ...state.extension, syncNotifications: enabled },
        })),

      setDefaultTags: (tags) =>
        set((state) => ({
          extension: { ...state.extension, defaultTags: tags },
        })),

      setImportDuplicates: (handling) =>
        set((state) => ({
          extension: { ...state.extension, importDuplicates: handling },
        })),

      setAutoOpenApp: (enabled) =>
        set((state) => ({
          extension: { ...state.extension, autoOpenApp: enabled },
        })),

      setDefaultCollection: (collectionId) =>
        set((state) => ({
          extension: { ...state.extension, defaultCollection: collectionId },
        })),

      // Display settings actions
      updateDisplaySettings: (settings) =>
        set((state) => ({
          display: { ...state.display, ...settings },
        })),

      setTheme: (theme) =>
        set((state) => ({
          display: { ...state.display, theme },
        })),

      setFontSize: (size) =>
        set((state) => ({
          display: { ...state.display, fontSize: size },
        })),

      setViewMode: (mode) =>
        set((state) => ({
          display: { ...state.display, viewMode: mode },
        })),

      setSortBy: (sortBy) =>
        set((state) => ({
          display: { ...state.display, sortBy },
        })),

      setSortOrder: (sortOrder) =>
        set((state) => ({
          display: { ...state.display, sortOrder },
        })),

      toggleSidebarCollapsed: () =>
        set((state) => ({
          display: {
            ...state.display,
            isSidebarCollapsed: !state.display.isSidebarCollapsed,
          },
        })),

      setPreviousSidebarState: (state: boolean | null) =>
        set((prevState) => ({
          display: { ...prevState.display, previousSidebarState: state },
        })),

      setSidebarCollapsed: (collapsed) =>
        set((state) => ({
          display: { ...state.display, isSidebarCollapsed: collapsed },
        })),

      // Privacy settings actions
      updatePrivacySettings: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),

      // Onboarding actions
      toggleChecklistItem: (itemKey) =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            checklistProgress: {
              ...state.onboarding.checklistProgress,
              [itemKey]: !state.onboarding.checklistProgress[itemKey],
            },
          },
        })),

      setChecklistDismissed: (dismissed) =>
        set((state) => ({
          onboarding: { ...state.onboarding, checklistDismissed: dismissed },
        })),

      // App state actions
      setHasSeenSplash: (seen) => set({ hasSeenSplash: seen }),
      setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
      setShowDemoInfoModal: (show) => set({ showDemoInfoModal: show }),

      // Reset actions
      resetExtensionSettings: () =>
        set({ extension: defaultExtensionSettings }),

      resetAllSettings: () =>
        set({
          extension: defaultExtensionSettings,
          display: defaultDisplaySettings,
          privacy: defaultPrivacySettings,
          onboarding: defaultOnboardingState,
          hasSeenSplash: false,
          isDemoMode: false,
        }),
    }),
    {
      name: 'x-bookmark-settings',
      storage: consolidatedStorage,
    }
  )
)
