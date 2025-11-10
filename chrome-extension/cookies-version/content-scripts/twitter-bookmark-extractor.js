/**
 * Twitter Bookmark Extractor - Content script for X/Twitter bookmark extraction
 * Works from any page - extracts bookmarks directly from browser storage/session
 */

// Utility classes are loaded via manifest.json
// They will be available as global classes

class TwitterBookmarkExtractor {
  constructor() {
    this.apiClient = new TwitterAPIClientDirect()
    this.parser = new BookmarkParser()
    this.storage = new StorageManager()
    this.isExtracting = false

    this.setupMessageListener()
    this.initializeExtractor()
  }

  /**
   * Setup message listener for communication with popup
   */
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse)
      return true // Keep message channel open for async response
    })
  }

  /**
   * Initialize the extractor
   */
  async initializeExtractor() {
    try {
      console.log('Initializing Twitter Bookmark Extractor...')
      console.log('Current URL:', window.location.href)

      // Check if user is logged in
      const isLoggedIn = await this.apiClient.checkTwitterLogin()

      console.log('Login check result:', isLoggedIn)

      if (isLoggedIn) {
        console.log(
          'Twitter Bookmark Extractor initialized - User is logged in'
        )
        this.notifyPopup('ready', { loggedIn: true })
      } else {
        console.log(
          'Twitter Bookmark Extractor initialized - User not logged in'
        )
        console.log('Please make sure you are logged into X/Twitter')
        this.notifyPopup('ready', { loggedIn: false })
      }
    } catch (error) {
      console.error('Error initializing extractor:', error)
      this.notifyPopup('error', { message: 'Failed to initialize extractor' })
    }
  }

  /**
   * Handle messages from popup
   */
  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'extractBookmarks':
          await this.extractBookmarks(sendResponse)
          break

        case 'checkLoginStatus':
          const isLoggedIn = await this.apiClient.checkTwitterLogin()
          sendResponse({ loggedIn: isLoggedIn })
          break

        case 'getStorageStats':
          const stats = await this.storage.getStorageStats()
          sendResponse({ stats })
          break

        default:
          sendResponse({ error: 'Unknown action' })
      }
    } catch (error) {
      console.error('Error handling message:', error)
      sendResponse({ error: error.message })
    }
  }

  /**
   * Extract bookmarks from Twitter
   */
  async extractBookmarks(sendResponse) {
    if (this.isExtracting) {
      sendResponse({ error: 'Extraction already in progress' })
      return
    }

    this.isExtracting = true

    try {
      // Check login status first
      const isLoggedIn = await this.apiClient.checkTwitterLogin()
      if (!isLoggedIn) {
        throw new Error('Please log into Twitter first')
      }

      // Notify popup that extraction started
      this.notifyPopup('extractionStarted', {
        message: 'Starting bookmark extraction...',
      })

      // Extract bookmarks directly from browser data
      const twitterBookmarks = await this.apiClient.extractAllBookmarks()

      if (twitterBookmarks.length === 0) {
        this.notifyPopup('extractionCompleted', {
          message: 'No bookmarks found',
          count: 0,
        })
        sendResponse({ success: true, count: 0, message: 'No bookmarks found' })
        return
      }

      // Transform to bookmark format
      const result = this.parser.processBookmarks(twitterBookmarks)

      if (result.errors.length > 0) {
        console.warn(
          `Processed ${result.successCount} bookmarks with ${result.errorCount} errors`
        )
      }

      // Check for duplicates
      const duplicateCheck = await this.storage.checkForDuplicates(
        result.bookmarks
      )

      // Save unique bookmarks
      if (duplicateCheck.unique.length > 0) {
        const saveSuccess = await this.storage.addBookmarks(
          duplicateCheck.unique
        )

        if (saveSuccess) {
          this.notifyPopup('extractionCompleted', {
            message: `Successfully imported ${duplicateCheck.unique.length} bookmarks`,
            count: duplicateCheck.unique.length,
            duplicates: duplicateCheck.duplicateCount,
          })

          sendResponse({
            success: true,
            count: duplicateCheck.unique.length,
            duplicates: duplicateCheck.duplicateCount,
            errors: result.errorCount,
            message: `Imported ${duplicateCheck.unique.length} new bookmarks`,
          })
        } else {
          throw new Error('Failed to save bookmarks to storage')
        }
      } else {
        this.notifyPopup('extractionCompleted', {
          message: 'All bookmarks already exist',
          count: 0,
          duplicates: duplicateCheck.duplicateCount,
        })

        sendResponse({
          success: true,
          count: 0,
          duplicates: duplicateCheck.duplicateCount,
          message: 'All bookmarks already exist',
        })
      }
    } catch (error) {
      console.error('Error extracting bookmarks:', error)

      this.notifyPopup('extractionError', {
        message: `Extraction failed: ${error.message}`,
      })

      sendResponse({
        success: false,
        error: error.message,
      })
    } finally {
      this.isExtracting = false
    }
  }

  /**
   * Notify popup about status changes
   */
  notifyPopup(type, data) {
    try {
      chrome.runtime.sendMessage({
        type: 'EXTRACTION_STATUS',
        status: type,
        data: data,
      })
    } catch (error) {
      console.error('Error notifying popup:', error)
    }
  }

  /**
   * Get current page information
   */
  getPageInfo() {
    return {
      url: window.location.href,
      hostname: window.location.hostname,
      isLoggedIn: null, // Will be set by API check
    }
  }
}

// Initialize the extractor when the script loads
let extractor

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    extractor = new TwitterBookmarkExtractor()
  })
} else {
  extractor = new TwitterBookmarkExtractor()
}

// Make class available globally
window.TwitterBookmarkExtractor = TwitterBookmarkExtractor
