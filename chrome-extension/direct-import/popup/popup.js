// Popup script for BookmarkX Chrome Extension
const importBtn = document.getElementById('importBtn')
const openAppBtn = document.getElementById('openAppBtn')
const status = document.getElementById('status')
const progress = document.getElementById('progress')
const progressFill = document.getElementById('progressFill')
const progressText = document.getElementById('progressText')

// BookmarkX app URL (update this to your deployed URL or localhost)
const BOOKMARKX_URL = 'http://localhost:5173'

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACTION_PROGRESS') {
    updateProgress(message.count, message.total)
  } else if (message.type === 'EXTRACTION_COMPLETE') {
    handleExtractionComplete(message.bookmarks)
  } else if (message.type === 'EXTRACTION_ERROR') {
    handleError(message.error)
  }
})

// Import bookmarks button
importBtn.addEventListener('click', async () => {
  try {
    importBtn.disabled = true
    updateStatus('Opening Twitter bookmarks...', 'info')

    // Open Twitter bookmarks page
    const tab = await chrome.tabs.create({
      url: 'https://twitter.com/i/bookmarks',
      active: true,
    })

    // Wait a bit for the page to load
    setTimeout(() => {
      updateStatus(
        'Page opened! Scroll to load all bookmarks, then the extraction will begin automatically.',
        'info'
      )
      importBtn.disabled = false
    }, 2000)
  } catch (error) {
    console.error('Error opening Twitter:', error)
    handleError('Failed to open Twitter bookmarks page')
    importBtn.disabled = false
  }
})

// Open BookmarkX app
openAppBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: BOOKMARKX_URL })
})

function updateStatus(message, type = 'info') {
  status.innerHTML = `<p>${message}</p>`
  status.className = `status ${type}`
}

function updateProgress(count, total) {
  progress.style.display = 'block'
  const percentage = total > 0 ? (count / total) * 100 : 0
  progressFill.style.width = `${percentage}%`
  progressText.textContent = `Extracted ${count} of ${total} bookmarks...`
}

function handleExtractionComplete(bookmarks) {
  updateStatus(
    `Successfully extracted ${bookmarks.length} bookmarks!`,
    'success'
  )
  progress.style.display = 'none'
  importBtn.disabled = false

  // Save bookmarks to storage
  chrome.storage.local.set(
    {
      extractedBookmarks: bookmarks,
      extractedAt: new Date().toISOString(),
    },
    () => {
      // Open BookmarkX with import flag
      chrome.tabs.create({
        url: `${BOOKMARKX_URL}?import=twitter&count=${bookmarks.length}`,
      })
    }
  )
}

function handleError(error) {
  updateStatus(`Error: ${error}`, 'error')
  progress.style.display = 'none'
  importBtn.disabled = false
}

// Check if there are already extracted bookmarks
chrome.storage.local.get(['extractedBookmarks', 'extractedAt'], (result) => {
  if (result.extractedBookmarks && result.extractedBookmarks.length > 0) {
    const date = new Date(result.extractedAt)
    const formattedDate =
      date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    updateStatus(
      `Last import: ${result.extractedBookmarks.length} bookmarks on ${formattedDate}`,
      'success'
    )
  }
})
