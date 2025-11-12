/**
 * Content Script Bridge for BookmarkX
 * Automatically syncs extension bookmarks to page localStorage
 */

// Get settings from consolidated localStorage
function getSettings() {
  try {
    const data = localStorage.getItem('x-bookmark-manager-data')
    if (!data) return null

    const parsed = JSON.parse(data)
    return parsed.extensionSettings?.extension || null
  } catch (error) {
    console.error('Error loading settings:', error)
    return null
  }
}

// Auto-sync bookmarks from extension storage to localStorage
async function syncBookmarksToLocalStorage() {
  try {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.log('⚠️ Extension context invalidated, skipping sync')
      return
    }

    // Get existing data from consolidated localStorage
    const storageKey = 'x-bookmark-manager-data'
    const existingDataStr = localStorage.getItem(storageKey)
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : null

    // Check if user has cleared data - don't sync if they have
    if (existingData?.appState?.hasBeenCleared) {
      console.log('⚠️ User cleared data, skipping sync')
      return
    }

    // Check if user recently imported from a file - don't sync to prevent overwriting
    if (existingData?.appState?.lastImportSource === 'file') {
      console.log('⚠️ User imported from file, skipping sync to prevent data overwrite')
      return
    }

    // Get bookmarks from extension storage
    const result = await chrome.storage.local.get(['bookmarks'])
    const extensionBookmarks = result.bookmarks || []

    if (extensionBookmarks.length === 0) {
      return // No bookmarks to sync
    }

    // Get extension settings
    const extensionSettings = getSettings()

    const existingBookmarks = existingData?.bookmarks || []

    // Phase 2: Improved duplicate detection with settings
    // Apply duplicate handling setting (skip, replace, keep-both)
    const duplicateHandling = extensionSettings?.importDuplicates || 'skip'

    const newBookmarks = []
    const bookmarksToReplace = []

    extensionBookmarks.forEach((extBookmark) => {
      const duplicateIndex = existingBookmarks.findIndex((existing) => {
        // Check URL match
        if (existing.url === extBookmark.url) return true

        // Check source_id match for Twitter bookmarks
        if (
          extBookmark.source_id &&
          existing.source_id === extBookmark.source_id &&
          existing.source_platform === extBookmark.source_platform
        ) {
          return true
        }

        return false
      })

      if (duplicateIndex !== -1) {
        // Found duplicate
        if (duplicateHandling === 'replace') {
          bookmarksToReplace.push({
            index: duplicateIndex,
            bookmark: extBookmark,
          })
        } else if (duplicateHandling === 'keep-both') {
          newBookmarks.push(extBookmark)
        }
        // 'skip' - do nothing
      } else {
        // No duplicate
        newBookmarks.push(extBookmark)
      }
    })

    if (newBookmarks.length === 0 && bookmarksToReplace.length === 0) {
      return
    }

    // Apply default tags from settings
    const defaultTags = extensionSettings?.defaultTags || []

    // Phase 3: Fix collection assignment to use 'uncategorized' and add default tags
    const bookmarksWithCorrectCollections = newBookmarks.map((bookmark) => ({
      ...bookmark,
      collections: ['uncategorized'], // Set as uncategorized instead of 'Imported from X'
      primaryCollection: 'uncategorized',
      tags: [...(bookmark.tags || []), ...defaultTags].filter(
        (tag, index, self) => self.indexOf(tag) === index
      ), // Merge and dedupe tags
    }))

    // Replace duplicates if needed
    let workingBookmarks = [...existingBookmarks]
    bookmarksToReplace.forEach(({ index, bookmark }) => {
      workingBookmarks[index] = {
        ...bookmark,
        collections: ['uncategorized'],
        primaryCollection: 'uncategorized',
        tags: [...(bookmark.tags || []), ...defaultTags].filter(
          (tag, idx, self) => self.indexOf(tag) === idx
        ),
      }
    })

    // Merge bookmarks with corrected collections
    const allBookmarks = [
      ...workingBookmarks,
      ...bookmarksWithCorrectCollections,
    ]

    // Update consolidated storage
    const updatedData = existingData || {
      bookmarks: [],
      collections: [],
      bookmarkCollections: [],
      settings: {
        theme: 'dark',
        viewMode: 'grid',
        defaultSort: 'newest',
        showMetrics: true,
        compactMode: false,
        autoBackup: false,
        exportFormat: 'json',
        defaultCollection: null,
        duplicateHandling: 'skip',
      },
      metadata: {
        version: '1.0.0',
        totalBookmarks: 0,
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
      },
      version: '2.0.0',
    }

    // Update bookmarks and metadata
    updatedData.bookmarks = allBookmarks
    updatedData.metadata = {
      ...updatedData.metadata,
      totalBookmarks: allBookmarks.length,
      lastUpdate: new Date().toISOString(),
      importSource: 'chrome-extension-api',
    }

    // Preserve appState and mark import source
    updatedData.appState = {
      ...(existingData?.appState || {}),
      lastImportSource: 'extension',
      lastImportTimestamp: new Date().toISOString(),
    }

    // Save consolidated storage
    localStorage.setItem(storageKey, JSON.stringify(updatedData))

    const totalImported =
      bookmarksWithCorrectCollections.length + bookmarksToReplace.length

    // Phase 1 & 4: Notify React app to reload bookmarks and show toast
    // App will handle state updates without page reload
    // Check if notifications are enabled
    const showNotification = extensionSettings?.syncNotifications !== false

    window.postMessage(
      {
        type: 'X_BOOKMARKS_UPDATED',
        source: 'x-bookmark-manager-extension',
        count: totalImported,
        total: allBookmarks.length,
        showNotification: showNotification,
      },
      '*'
    )
  } catch (error) {
    // Silently ignore extension context invalidation errors
    if (error.message?.includes('Extension context invalidated')) {
      return
    }
    console.error('❌ Error syncing bookmarks:', error)
  }
}

// Listen for messages from extension to sync immediately
chrome.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
  if (request.action === 'SYNC_NOW') {
    console.log('📢 Received SYNC_NOW command from extension')
    syncBookmarksToLocalStorage()
      .then(() => {
        sendResponse({ success: true })
        // No page reload needed - React app will handle updates
      })
      .catch((error) => {
        console.error('Sync error:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Keep channel open for async response
  }
})

// Listen for storage changes in chrome.storage.local
chrome.storage?.onChanged?.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.bookmarks) {
    syncBookmarksToLocalStorage()
    // No page reload needed - React app will handle updates via window message
  }
})

// Get sync interval from settings
function getSyncIntervalMs() {
  const settings = getSettings()
  const interval = settings?.autoSyncInterval || 'manual'

  const intervals = {
    off: 0,
    '5min': 5 * 60 * 1000,
    '15min': 15 * 60 * 1000,
    '30min': 30 * 60 * 1000,
    '1hour': 60 * 60 * 1000,
    manual: 0,
  }

  return intervals[interval] || 0
}

// Initial sync on page load
setTimeout(() => {
  console.log('🔄 Running initial bookmark sync...')
  syncBookmarksToLocalStorage()
}, 1000)

// Setup periodic sync based on settings
let syncIntervalId = null

function setupPeriodicSync() {
  // Clear existing interval
  if (syncIntervalId) {
    clearInterval(syncIntervalId)
    syncIntervalId = null
  }

  const intervalMs = getSyncIntervalMs()

  if (intervalMs > 0) {
    syncIntervalId = setInterval(syncBookmarksToLocalStorage, intervalMs)
  }
}

setupPeriodicSync()

// Listen for settings changes in consolidated storage and update interval
window.addEventListener('storage', (e) => {
  if (e.key === 'x-bookmark-manager-data') {
    setupPeriodicSync()
  }
})

// Listen for sync requests from the React app
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return

  // Check for sync request
  if (
    event.data?.type === 'X_REQUEST_SYNC' &&
    event.data?.source === 'x-bookmark-manager-app'
  ) {
    console.log('📢 Received sync request from app, syncing bookmarks...')
    syncBookmarksToLocalStorage()
  }
})
