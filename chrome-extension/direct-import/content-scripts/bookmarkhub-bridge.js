/**
 * Content Script Bridge for BookmarkHub (Direct Import Version)
 * Automatically syncs extension bookmarks to page localStorage
 */

// Sync lock to prevent concurrent syncs
let isSyncing = false
let lastSyncTimestamp = 0

// Debounce helper
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Get settings from consolidated localStorage
function getSettings() {
  try {
    const data = localStorage.getItem('x-bookmark-manager-data')
    if (!data) return null

    const parsed = JSON.parse(data)
    return parsed.extensionSettings?.extension || null
  } catch (error) {
    console.error('[BookmarkHub Bridge] Error loading settings:', error)
    return null
  }
}

// Auto-sync bookmarks from extension storage to localStorage
async function syncBookmarksToLocalStorage() {
  try {
    // Check if already syncing (prevent concurrent syncs)
    if (isSyncing) {
      return
    }

    // Set sync lock
    isSyncing = true
    const syncStartTime = Date.now()

    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      isSyncing = false
      return
    }

    // Get existing data from consolidated localStorage
    const storageKey = 'x-bookmark-manager-data'
    const existingDataStr = localStorage.getItem(storageKey)
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : null

    // Check if user has cleared data - don't sync if they have
    if (existingData?.appState?.hasBeenCleared) {
      isSyncing = false
      return
    }

    // Check if user recently imported from a file - don't sync to prevent overwriting
    if (existingData?.appState?.lastImportSource === 'file') {
      isSyncing = false
      return
    }

    // Get bookmarks from extension storage (using 'extractedBookmarks' key for direct-import)
    const result = await chrome.storage.local.get(['extractedBookmarks'])
    const extensionBookmarks = result.extractedBookmarks || []

      `[BookmarkHub Bridge] 📊 Sync status: ${extensionBookmarks.length} in extension, ${existingData?.bookmarks?.length || 0} in localStorage`
    )

    if (extensionBookmarks.length === 0) {
      isSyncing = false
      return
    }

    // Get extension settings
    const extensionSettings = getSettings()

    const existingBookmarks = existingData?.bookmarks || []

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

      `[BookmarkHub Bridge] 🔍 Duplicate detection complete: ${newBookmarks.length} new, ${bookmarksToReplace.length} to replace, ${extensionBookmarks.length - newBookmarks.length - bookmarksToReplace.length} skipped as duplicates`
    )

    if (newBookmarks.length === 0 && bookmarksToReplace.length === 0) {
      isSyncing = false
      return
    }

    // Apply default tags from settings
    const defaultTags = extensionSettings?.defaultTags || []

    // Set collection to 'uncategorized' and add default tags
    const bookmarksWithCorrectCollections = newBookmarks.map((bookmark) => ({
      ...bookmark,
      collections: ['uncategorized'],
      primaryCollection: 'uncategorized',
      tags: [...(bookmark.tags || []), ...defaultTags].filter(
        (tag, index, self) => self.indexOf(tag) === index
      ),
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

    // Merge bookmarks
    const mergedBookmarks = [
      ...workingBookmarks,
      ...bookmarksWithCorrectCollections,
    ]


    // CRITICAL: Post-merge deduplication to catch any edge cases
    // This prevents duplicates even if concurrent syncs somehow occurred
    const seenUrls = new Map()
    const seenSourceIds = new Map()
    const allBookmarks = []

    for (const bookmark of mergedBookmarks) {
      let isDuplicate = false

      // Check for URL duplicate
      if (bookmark.url) {
        if (seenUrls.has(bookmark.url)) {
          isDuplicate = true
        } else {
          seenUrls.set(bookmark.url, true)
        }
      }

      // Check for source_id duplicate (Twitter bookmarks)
      if (!isDuplicate && bookmark.source_id && bookmark.source_platform) {
        const sourceKey = `${bookmark.source_platform}:${bookmark.source_id}`
        if (seenSourceIds.has(sourceKey)) {
          isDuplicate = true
        } else {
          seenSourceIds.set(sourceKey, true)
        }
      }

      if (!isDuplicate) {
        allBookmarks.push(bookmark)
      }
    }

    const duplicatesRemoved = mergedBookmarks.length - allBookmarks.length
    if (duplicatesRemoved > 0) {
    }


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


    // CRITICAL: Clear extension storage after successful sync
    // This prevents re-syncing the same bookmarks on next sync
    try {
      await chrome.storage.local.remove(['extractedBookmarks'])
    } catch (error) {
      console.warn('[BookmarkHub Bridge] ⚠️ Could not clear extension storage:', error)
      // Non-fatal error, continue with sync
    }

    const totalImported =
      bookmarksWithCorrectCollections.length + bookmarksToReplace.length

    const syncDuration = Date.now() - syncStartTime
    lastSyncTimestamp = Date.now()

    // Notify React app to reload bookmarks
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

    // Release sync lock
    isSyncing = false
  } catch (error) {
    // Release sync lock on error
    isSyncing = false

    // Silently ignore extension context invalidation errors
    if (error.message?.includes('Extension context invalidated')) {
      return
    }
    console.error('[BookmarkHub Bridge] ❌ Error syncing bookmarks:', error)
  }
}

// Listen for messages from extension to sync immediately
chrome.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
  if (request.action === 'SYNC_NOW') {
    syncBookmarksToLocalStorage()
      .then(() => {
        sendResponse({ success: true })
      })
      .catch((error) => {
        console.error('[BookmarkHub Bridge] Sync error:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Keep channel open for async response
  }
})

// Listen for storage changes in chrome.storage.local (debounced to prevent rapid-fire syncs)
const debouncedStorageSync = debounce(() => {
  syncBookmarksToLocalStorage()
}, 1000) // Wait 1 second after last change before syncing

chrome.storage?.onChanged?.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.extractedBookmarks) {
    debouncedStorageSync()
  }
})

// Initial sync on page load
setTimeout(() => {
  syncBookmarksToLocalStorage()
}, 1000)

// Listen for sync requests from the React app
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return

  // Check for extension detection ping
  if (
    event.data?.type === 'X_CHECK_EXTENSION' &&
    event.data?.source === 'x-bookmark-manager-app'
  ) {
    // Respond immediately to let app know extension is installed
    window.postMessage(
      {
        type: 'X_EXTENSION_READY',
        source: 'x-bookmark-manager-extension',
      },
      '*'
    )
    return
  }

  // Check for sync request
  if (
    event.data?.type === 'X_REQUEST_SYNC' &&
    event.data?.source === 'x-bookmark-manager-app'
  ) {
    syncBookmarksToLocalStorage()
  }
})
