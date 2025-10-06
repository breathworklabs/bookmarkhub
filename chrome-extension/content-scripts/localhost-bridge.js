/**
 * Content Script Bridge for X Bookmark Manager
 * Automatically syncs extension bookmarks to page localStorage
 */

console.log('🔗 X Bookmark Manager: Auto-sync bridge loaded on', window.location.href);

// Get settings from localStorage
function getSettings() {
  try {
    const settingsStr = localStorage.getItem('x-bookmark-settings');
    if (!settingsStr) return null;

    const settings = JSON.parse(settingsStr);
    return settings.state?.extension || null;
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
}

// Auto-sync bookmarks from extension storage to localStorage
async function syncBookmarksToLocalStorage() {
  try {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.log('⚠️ Extension context invalidated, skipping sync');
      return;
    }

    // Get bookmarks from extension storage
    const result = await chrome.storage.local.get(['bookmarks']);
    const extensionBookmarks = result.bookmarks || [];

    if (extensionBookmarks.length === 0) {
      return; // No bookmarks to sync
    }

    // Get extension settings
    const extensionSettings = getSettings();

    // Get existing bookmarks from page's localStorage
    const storageKey = 'x-bookmark-manager-bookmarks';
    const existingDataStr = localStorage.getItem(storageKey);
    const existingBookmarks = existingDataStr ? JSON.parse(existingDataStr) : [];

    // Phase 2: Improved duplicate detection with settings
    // Apply duplicate handling setting (skip, replace, keep-both)
    const duplicateHandling = extensionSettings?.importDuplicates || 'skip';

    const newBookmarks = [];
    const bookmarksToReplace = [];

    extensionBookmarks.forEach(extBookmark => {
      const duplicateIndex = existingBookmarks.findIndex(existing => {
        // Check URL match
        if (existing.url === extBookmark.url) return true;

        // Check source_id match for Twitter bookmarks
        if (
          extBookmark.source_id &&
          existing.source_id === extBookmark.source_id &&
          existing.source_platform === extBookmark.source_platform
        ) {
          return true;
        }

        return false;
      });

      if (duplicateIndex !== -1) {
        // Found duplicate
        if (duplicateHandling === 'replace') {
          bookmarksToReplace.push({ index: duplicateIndex, bookmark: extBookmark });
        } else if (duplicateHandling === 'keep-both') {
          newBookmarks.push(extBookmark);
        }
        // 'skip' - do nothing
      } else {
        // No duplicate
        newBookmarks.push(extBookmark);
      }
    });

    if (newBookmarks.length === 0 && bookmarksToReplace.length === 0) {
      console.log('📊 All extension bookmarks already in localStorage (checked URL & source_id)');
      return;
    }

    // Apply default tags from settings
    const defaultTags = extensionSettings?.defaultTags || [];

    // Phase 3: Fix collection assignment to use 'uncategorized' and add default tags
    const bookmarksWithCorrectCollections = newBookmarks.map(bookmark => ({
      ...bookmark,
      collections: ['uncategorized'],  // Set as uncategorized instead of 'Imported from X'
      primaryCollection: 'uncategorized',
      tags: [...(bookmark.tags || []), ...defaultTags].filter((tag, index, self) => self.indexOf(tag) === index) // Merge and dedupe tags
    }));

    console.log(`✓ Prepared ${bookmarksWithCorrectCollections.length} bookmarks with 'uncategorized' collection`);
    if (defaultTags.length > 0) {
      console.log(`✓ Applied default tags: ${defaultTags.join(', ')}`);
    }

    // Replace duplicates if needed
    let workingBookmarks = [...existingBookmarks];
    bookmarksToReplace.forEach(({ index, bookmark }) => {
      workingBookmarks[index] = {
        ...bookmark,
        collections: ['uncategorized'],
        primaryCollection: 'uncategorized',
        tags: [...(bookmark.tags || []), ...defaultTags].filter((tag, idx, self) => self.indexOf(tag) === idx)
      };
    });

    // Merge bookmarks with corrected collections
    const allBookmarks = [...workingBookmarks, ...bookmarksWithCorrectCollections];

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(allBookmarks));

    // Update metadata
    const metadata = {
      version: '1.0.0',
      totalBookmarks: allBookmarks.length,
      lastUpdate: new Date().toISOString(),
      importSource: 'chrome-extension-api'
    };
    localStorage.setItem('x-bookmark-manager-metadata', JSON.stringify(metadata));

    const totalImported = bookmarksWithCorrectCollections.length + bookmarksToReplace.length;
    console.log(`✅ Auto-synced ${totalImported} bookmarks to localStorage (${bookmarksWithCorrectCollections.length} new, ${bookmarksToReplace.length} replaced)`);
    console.log(`📊 Total bookmarks: ${allBookmarks.length}`);

    // Phase 1 & 4: Notify React app to reload bookmarks and show toast
    // App will handle state updates without page reload
    // Check if notifications are enabled
    const showNotification = extensionSettings?.syncNotifications !== false;

    window.postMessage({
      type: 'X_BOOKMARKS_UPDATED',
      source: 'x-bookmark-manager-extension',
      count: totalImported,
      total: allBookmarks.length,
      showNotification: showNotification
    }, '*');

    console.log('📢 Notified React app - will update without page reload');

  } catch (error) {
    // Silently ignore extension context invalidation errors
    if (error.message?.includes('Extension context invalidated')) {
      console.log('⚠️ Extension was reloaded, please refresh this page');
      return;
    }
    console.error('❌ Error syncing bookmarks:', error);
  }
}

// Listen for messages from extension to sync immediately
chrome.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
  if (request.action === 'SYNC_NOW') {
    console.log('📢 Received SYNC_NOW command from extension');
    syncBookmarksToLocalStorage().then(() => {
      sendResponse({ success: true });
      // No page reload needed - React app will handle updates
    }).catch(error => {
      console.error('Sync error:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }
});

// Listen for storage changes in chrome.storage.local
chrome.storage?.onChanged?.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.bookmarks) {
    console.log('📦 Extension bookmarks updated, auto-syncing to localStorage...');
    syncBookmarksToLocalStorage();
    // No page reload needed - React app will handle updates via window message
  }
});

// Get sync interval from settings
function getSyncIntervalMs() {
  const settings = getSettings();
  const interval = settings?.autoSyncInterval || 'manual';

  const intervals = {
    'off': 0,
    '5min': 5 * 60 * 1000,
    '15min': 15 * 60 * 1000,
    '30min': 30 * 60 * 1000,
    '1hour': 60 * 60 * 1000,
    'manual': 0
  };

  return intervals[interval] || 0;
}

// Initial sync on page load
setTimeout(() => {
  console.log('🔄 Running initial bookmark sync...');
  syncBookmarksToLocalStorage();
}, 1000);

// Setup periodic sync based on settings
let syncIntervalId = null;

function setupPeriodicSync() {
  // Clear existing interval
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }

  const intervalMs = getSyncIntervalMs();

  if (intervalMs > 0) {
    syncIntervalId = setInterval(syncBookmarksToLocalStorage, intervalMs);
    const intervalText = intervalMs >= 60000 ? `${intervalMs / 60000} minutes` : `${intervalMs / 1000} seconds`;
    console.log(`✅ X Bookmark Manager: Auto-sync enabled (checks every ${intervalText})`);
  } else {
    console.log('✅ X Bookmark Manager: Manual sync mode (auto-sync disabled)');
  }
}

setupPeriodicSync();

// Listen for settings changes and update interval
window.addEventListener('storage', (e) => {
  if (e.key === 'x-bookmark-settings') {
    console.log('⚙️ Settings changed, updating sync interval...');
    setupPeriodicSync();
  }
});
