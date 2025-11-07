/**
 * StorageManager - Handle local storage integration with BookmarkX
 * Manages bookmark storage and communication with the main app
 */

class StorageManager {
  constructor() {
    this.storageKey = 'bookmarks';
    this.importHistoryKey = 'import_history';
  }

  /**
   * Get existing bookmarks from storage
   */
  async getStoredBookmarks() {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      return result[this.storageKey] || [];
    } catch (error) {
      console.error('Error getting stored bookmarks:', error);
      return [];
    }
  }

  /**
   * Save bookmarks to storage
   */
  async saveBookmarks(bookmarks) {
    try {
      await chrome.storage.local.set({ [this.storageKey]: bookmarks });
      return true;
    } catch (error) {
      console.error('Error saving bookmarks:', error);
      return false;
    }
  }

  /**
   * Add new bookmarks to existing storage
   */
  async addBookmarks(newBookmarks) {
    try {
      const existingBookmarks = await this.getStoredBookmarks();
      const updatedBookmarks = [...existingBookmarks, ...newBookmarks];

      const success = await this.saveBookmarks(updatedBookmarks);

      if (success) {
        // Record import history
        await this.recordImportHistory(newBookmarks.length);

        // Notify main app if it's open
        this.notifyMainApp(newBookmarks);
      }

      return success;
    } catch (error) {
      console.error('Error adding bookmarks:', error);
      return false;
    }
  }

  /**
   * Check for duplicate bookmarks
   */
  async checkForDuplicates(newBookmarks) {
    const existingBookmarks = await this.getStoredBookmarks();
    const duplicates = [];
    const uniqueBookmarks = [];

    newBookmarks.forEach(newBookmark => {
      const isDuplicate = existingBookmarks.some(existing =>
        this.isDuplicateBookmark(existing, newBookmark)
      );

      if (isDuplicate) {
        duplicates.push(newBookmark);
      } else {
        uniqueBookmarks.push(newBookmark);
      }
    });

    return {
      unique: uniqueBookmarks,
      duplicates: duplicates,
      uniqueCount: uniqueBookmarks.length,
      duplicateCount: duplicates.length
    };
  }

  /**
   * Check if two bookmarks are duplicates
   */
  isDuplicateBookmark(existing, newBookmark) {
    // Check by URL (most reliable)
    if (existing.url === newBookmark.url) {
      return true;
    }

    // Check by source_id and platform
    if (existing.source_id === newBookmark.source_id &&
        existing.source_platform === newBookmark.source_platform) {
      return true;
    }

    // Check by content similarity (basic)
    if (existing.content === newBookmark.content &&
        existing.author === newBookmark.author) {
      return true;
    }

    return false;
  }

  /**
   * Record import history
   */
  async recordImportHistory(importedCount) {
    try {
      const result = await chrome.storage.local.get([this.importHistoryKey]);
      const history = result[this.importHistoryKey] || [];

      history.push({
        date: new Date().toISOString(),
        count: importedCount,
        source: 'chrome-extension'
      });

      // Keep only last 10 imports
      if (history.length > 10) {
        history.splice(0, history.length - 10);
      }

      await chrome.storage.local.set({ [this.importHistoryKey]: history });
    } catch (error) {
      console.error('Error recording import history:', error);
    }
  }

  /**
   * Get import history
   */
  async getImportHistory() {
    try {
      const result = await chrome.storage.local.get([this.importHistoryKey]);
      return result[this.importHistoryKey] || [];
    } catch (error) {
      console.error('Error getting import history:', error);
      return [];
    }
  }

  /**
   * Notify main app about new bookmarks
   */
  notifyMainApp(newBookmarks) {
    try {
      // Send message to all tabs with the main app
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.url && (tab.url.includes('localhost') || tab.url.includes('x-bookmark-manager'))) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'NEW_BOOKMARKS_IMPORTED',
              count: newBookmarks.length,
              bookmarks: newBookmarks
            }).catch(() => {
              // Ignore errors if tab doesn't have content script
            });
          }
        });
      });
    } catch (error) {
      console.error('Error notifying main app:', error);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const bookmarks = await this.getStoredBookmarks();
      const history = await this.getImportHistory();

      return {
        totalBookmarks: bookmarks.length,
        importHistory: history,
        lastImport: history.length > 0 ? history[history.length - 1] : null,
        storageSize: JSON.stringify(bookmarks).length
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalBookmarks: 0,
        importHistory: [],
        lastImport: null,
        storageSize: 0
      };
    }
  }

  /**
   * Clear all bookmarks (for testing)
   */
  async clearAllBookmarks() {
    try {
      await chrome.storage.local.remove([this.storageKey, this.importHistoryKey]);
      return true;
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      return false;
    }
  }

  /**
   * Export bookmarks to JSON
   */
  async exportBookmarks() {
    try {
      const bookmarks = await this.getStoredBookmarks();
      const exportData = {
        bookmarks: bookmarks,
        exportDate: new Date().toISOString(),
        exportSource: 'chrome-extension',
        version: '1.0.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
      return null;
    }
  }

  /**
   * Import bookmarks from JSON
   */
  async importBookmarks(jsonData) {
    try {
      const importData = JSON.parse(jsonData);

      if (!importData.bookmarks || !Array.isArray(importData.bookmarks)) {
        throw new Error('Invalid import data format');
      }

      const result = await this.checkForDuplicates(importData.bookmarks);

      if (result.unique.length > 0) {
        await this.addBookmarks(result.unique);
      }

      return {
        success: true,
        imported: result.unique.length,
        duplicates: result.duplicateCount,
        errors: []
      };
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      return {
        success: false,
        imported: 0,
        duplicates: 0,
        errors: [error.message]
      };
    }
  }
}

// Make class available globally for content scripts
window.StorageManager = StorageManager;
