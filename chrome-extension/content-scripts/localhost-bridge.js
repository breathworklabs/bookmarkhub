/**
 * Content Script Bridge for X Bookmark Manager
 * Automatically syncs extension bookmarks to page localStorage
 */

console.log('🔗 X Bookmark Manager: Auto-sync bridge loaded on', window.location.href);

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

    // Get existing bookmarks from page's localStorage
    const storageKey = 'x-bookmark-manager-bookmarks';
    const existingDataStr = localStorage.getItem(storageKey);
    const existingBookmarks = existingDataStr ? JSON.parse(existingDataStr) : [];

    // Phase 2: Improved duplicate detection
    // Check both URL and source_id (Twitter tweet ID) to prevent duplicates
    const newBookmarks = extensionBookmarks.filter(extBookmark => {
      const isDuplicate = existingBookmarks.some(existing => {
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

      return !isDuplicate;
    });

    if (newBookmarks.length === 0) {
      console.log('📊 All extension bookmarks already in localStorage (checked URL & source_id)');
      return;
    }

    // Phase 3: Fix collection assignment to use 'uncategorized'
    const bookmarksWithCorrectCollections = newBookmarks.map(bookmark => ({
      ...bookmark,
      collections: ['uncategorized'],  // Set as uncategorized instead of 'Imported from X'
      primaryCollection: 'uncategorized'
    }));

    console.log(`✓ Prepared ${bookmarksWithCorrectCollections.length} bookmarks with 'uncategorized' collection`);

    // Merge bookmarks with corrected collections
    const allBookmarks = [...existingBookmarks, ...bookmarksWithCorrectCollections];

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

    console.log(`✅ Auto-synced ${bookmarksWithCorrectCollections.length} new bookmarks to localStorage`);
    console.log(`📊 Total bookmarks: ${allBookmarks.length}`);

    // Phase 1 & 4: Notify React app to reload bookmarks and show toast
    // App will handle state updates without page reload
    window.postMessage({
      type: 'X_BOOKMARKS_UPDATED',
      source: 'x-bookmark-manager-extension',
      count: bookmarksWithCorrectCollections.length,
      total: allBookmarks.length
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

// Initial sync on page load
setTimeout(() => {
  console.log('🔄 Running initial bookmark sync...');
  syncBookmarksToLocalStorage();
}, 1000);

// Also sync periodically (every 10 seconds) to catch any updates
setInterval(syncBookmarksToLocalStorage, 10000);

console.log('✅ X Bookmark Manager: Auto-sync enabled (checks every 10 seconds)');
