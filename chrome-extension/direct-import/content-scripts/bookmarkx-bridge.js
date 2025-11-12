/**
 * Content Script Bridge for BookmarkX (Direct Import Version)
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
    console.error('[BookmarkX Bridge] Error loading settings:', error)
    return null
  }
}

// Auto-sync bookmarks from extension storage to localStorage
async function syncBookmarksToLocalStorage() {
  try {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.log('[BookmarkX Bridge] ⚠️ Extension context invalidated, skipping sync')
      return
    }

    // Get existing data from consolidated localStorage
    const storageKey = 'x-bookmark-manager-data'
    const existingDataStr = localStorage.getItem(storageKey)
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : null

    // Check if user has cleared data - don't sync if they have
    if (existingData?.appState?.hasBeenCleared) {
      console.log('[BookmarkX Bridge] ⚠️ User cleared data, skipping sync')
      return
    }

    // Check if user recently imported from a file - don't sync to prevent overwriting
    if (existingData?.appState?.lastImportSource === 'file') {
      console.log('[BookmarkX Bridge] ⚠️ User imported from file, skipping sync to prevent data overwrite')
      return
    }

    // Get bookmarks from extension storage (using 'extractedBookmarks' key for direct-import)
    const result = await chrome.storage.local.get(['extractedBookmarks'])
    const extensionBookmarks = result.extractedBookmarks || []

    if (extensionBookmarks.length === 0) {
      return // No bookmarks to sync
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

    if (newBookmarks.length === 0 && bookmarksToReplace.length === 0) {
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
  } catch (error) {
    // Silently ignore extension context invalidation errors
    if (error.message?.includes('Extension context invalidated')) {
      return
    }
    console.error('[BookmarkX Bridge] ❌ Error syncing bookmarks:', error)
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
        console.error('[BookmarkX Bridge] Sync error:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Keep channel open for async response
  }
})

// Listen for storage changes in chrome.storage.local
chrome.storage?.onChanged?.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.extractedBookmarks) {
    syncBookmarksToLocalStorage()
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

  // Check for sync request
  if (
    event.data?.type === 'X_REQUEST_SYNC' &&
    event.data?.source === 'x-bookmark-manager-app'
  ) {
    syncBookmarksToLocalStorage()
  }
})
