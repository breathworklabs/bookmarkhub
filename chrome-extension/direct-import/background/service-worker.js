// Background service worker for BookmarkX Chrome Extension

// BookmarkX app URL
const BOOKMARKX_URL = 'http://localhost:5173'

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'EXTRACTION_COMPLETE':
      handleExtractionComplete(message.bookmarks, sendResponse)
      return true // Keep channel open for async response

    case 'OPEN_BOOKMARKX':
      openBookmarkX()
      sendResponse({ success: true })
      break

    case 'GET_EXTRACTED_BOOKMARKS':
      // BookmarkX app requesting data via bridge content script
      chrome.storage.local.get(
        ['extractedBookmarks', 'extractedAt'],
        (result) => {
          const bookmarks = result.extractedBookmarks || []
          const extractedAt = result.extractedAt || null
          console.log(
            `[BookmarkX Background] Sending ${bookmarks.length} bookmarks to app`
          )
          sendResponse({
            success: true,
            bookmarks: bookmarks,
            extractedAt: extractedAt,
            count: bookmarks.length,
          })
        }
      )
      return true // Keep channel open for async response

    case 'EXTRACTION_PROGRESS':
      // Forward to popup if open
      chrome.runtime.sendMessage(message).catch(() => {})
      sendResponse({ success: true })
      break

    case 'EXTRACTION_ERROR':
      // Forward to popup if open
      chrome.runtime.sendMessage(message).catch(() => {})
      sendResponse({ success: true })
      break

    default:
      sendResponse({ success: false, error: 'Unknown message type' })
  }

  return true // Keep message channel open
})

function handleExtractionComplete(bookmarks, sendResponse) {
  // Save to storage
  chrome.storage.local.set(
    {
      extractedBookmarks: bookmarks,
      extractedAt: new Date().toISOString(),
    },
    () => {
      // Send response back to content script
      sendResponse({
        success: true,
        saved: bookmarks.length,
      })

      // Notify popup
      chrome.runtime
        .sendMessage({
          type: 'EXTRACTION_COMPLETE',
          bookmarks: bookmarks,
        })
        .catch(() => {
          // Popup might not be open, that's okay
        })
    }
  )
}

function openBookmarkX() {
  chrome.storage.local.get(['extractedBookmarks'], (result) => {
    const bookmarks = result.extractedBookmarks || []
    const count = bookmarks.length
    const targetUrl = `${BOOKMARKX_URL}?import=twitter&count=${count}`

    // Open BookmarkX - the page will request data from extension
    chrome.tabs.create({
      url: targetUrl,
      active: true,
    })
  })
}

// Handle extension icon click (alternative to popup)
chrome.action.onClicked.addListener((tab) => {
  // This won't fire if popup is defined, but good to have as backup
})
