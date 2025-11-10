/**
 * BookmarkX Integration Utilities
 *
 * Helper functions for integrating with the BookmarkX app
 */

/**
 * Format extracted Twitter bookmark for BookmarkX
 * @param {Object} twitterBookmark - Raw Twitter bookmark data
 * @returns {Object} BookmarkX-compatible bookmark
 */
export function formatForBookmarkX(twitterBookmark) {
  return {
    id: `twitter_${twitterBookmark.id}`,
    url: twitterBookmark.url,
    title: `Tweet by @${twitterBookmark.username}`,
    description: twitterBookmark.text,
    author: {
      username: twitterBookmark.username,
      displayName: twitterBookmark.displayName,
      profileImage: twitterBookmark.profileImage,
    },
    media: twitterBookmark.images.map((url) => ({
      type: 'image',
      url: url,
    })),
    timestamp: twitterBookmark.timestamp,
    source: 'twitter',
    tags: extractHashtags(twitterBookmark.text),
    createdAt: twitterBookmark.extractedAt,
    updatedAt: twitterBookmark.extractedAt,
  }
}

/**
 * Extract hashtags from tweet text
 * @param {string} text - Tweet text
 * @returns {Array<string>} Array of hashtags (without #)
 */
export function extractHashtags(text) {
  const hashtagRegex = /#(\w+)/g
  const matches = text.matchAll(hashtagRegex)
  return Array.from(matches, (match) => match[1].toLowerCase())
}

/**
 * Extract mentions from tweet text
 * @param {string} text - Tweet text
 * @returns {Array<string>} Array of mentions (without @)
 */
export function extractMentions(text) {
  const mentionRegex = /@(\w+)/g
  const matches = text.matchAll(mentionRegex)
  return Array.from(matches, (match) => match[1])
}

/**
 * Validate bookmark data
 * @param {Object} bookmark - Bookmark to validate
 * @returns {boolean} True if valid
 */
export function validateBookmark(bookmark) {
  return !!(
    bookmark &&
    bookmark.id &&
    bookmark.url &&
    bookmark.username &&
    bookmark.timestamp
  )
}

/**
 * Get storage statistics
 * @returns {Promise<Object>} Storage stats
 */
export async function getStorageStats() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['extractedBookmarks'], (result) => {
      const bookmarks = result.extractedBookmarks || []
      const stats = {
        total: bookmarks.length,
        withImages: bookmarks.filter((b) => b.images && b.images.length > 0)
          .length,
        withHashtags: bookmarks.filter(
          (b) => extractHashtags(b.text).length > 0
        ).length,
        uniqueUsers: new Set(bookmarks.map((b) => b.username)).size,
        dateRange: {
          oldest:
            bookmarks.length > 0
              ? new Date(
                  Math.min(...bookmarks.map((b) => new Date(b.timestamp)))
                ).toISOString()
              : null,
          newest:
            bookmarks.length > 0
              ? new Date(
                  Math.max(...bookmarks.map((b) => new Date(b.timestamp)))
                ).toISOString()
              : null,
        },
      }
      resolve(stats)
    })
  })
}

/**
 * Clear extracted bookmarks from storage
 * @returns {Promise<void>}
 */
export async function clearStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['extractedBookmarks', 'extractedAt'], () => {
      resolve()
    })
  })
}

/**
 * Export bookmarks to JSON
 * @returns {Promise<string>} JSON string of bookmarks
 */
export async function exportToJSON() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ['extractedBookmarks', 'extractedAt'],
      (result) => {
        const exportData = {
          version: '1.0',
          source: 'twitter',
          extractedAt: result.extractedAt,
          bookmarks: result.extractedBookmarks || [],
        }
        resolve(JSON.stringify(exportData, null, 2))
      }
    )
  })
}

/**
 * Generate BookmarkX import URL
 * @param {number} count - Number of bookmarks
 * @param {string} source - Source platform (default: 'twitter')
 * @returns {string} Import URL
 */
export function generateImportURL(count, source = 'twitter') {
  const baseURL = 'http://localhost:5173' // Update for production
  return `${baseURL}?import=${source}&count=${count}`
}
