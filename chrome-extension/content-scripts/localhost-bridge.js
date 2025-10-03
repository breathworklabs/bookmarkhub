/**
 * Content Script Bridge for X Bookmark Manager
 * Automatically syncs extension bookmarks to page localStorage
 */

console.log('🔗 X Bookmark Manager: Auto-sync bridge loaded on', window.location.href);

// Auto-sync bookmarks from extension storage to localStorage
async function syncBookmarksToLocalStorage() {
  try {
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

    // Filter out duplicates
    const newBookmarks = extensionBookmarks.filter(extBookmark =>
      !existingBookmarks.some(existing => existing.url === extBookmark.url)
    );

    if (newBookmarks.length === 0) {
      console.log('📊 All extension bookmarks already in localStorage');
      return;
    }

    // Merge bookmarks
    const allBookmarks = [...existingBookmarks, ...newBookmarks];

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

    console.log(`✅ Auto-synced ${newBookmarks.length} new bookmarks to localStorage`);
    console.log(`📊 Total bookmarks: ${allBookmarks.length}`);

    // Notify the page to reload data
    window.postMessage({
      type: 'X_BOOKMARKS_UPDATED',
      source: 'x-bookmark-manager-extension',
      count: newBookmarks.length,
      total: allBookmarks.length
    }, '*');

    // Trigger storage event so React app detects the change
    window.dispatchEvent(new StorageEvent('storage', {
      key: storageKey,
      newValue: JSON.stringify(allBookmarks),
      oldValue: existingDataStr,
      url: window.location.href,
      storageArea: localStorage
    }));

  } catch (error) {
    console.error('❌ Error syncing bookmarks:', error);
  }
}

// Listen for messages from extension to sync immediately
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SYNC_NOW') {
    console.log('📢 Received SYNC_NOW command from extension');
    syncBookmarksToLocalStorage().then(() => {
      sendResponse({ success: true });
      // Reload the page to show new bookmarks
      window.location.reload();
    });
    return true; // Keep channel open for async response
  }
});

// Listen for storage changes in chrome.storage.local
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.bookmarks) {
    console.log('📦 Extension bookmarks updated, auto-syncing to localStorage...');
    syncBookmarksToLocalStorage().then(() => {
      // Reload page after sync
      setTimeout(() => window.location.reload(), 500);
    });
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
