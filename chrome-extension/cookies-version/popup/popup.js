/**
 * Simple Popup Script for BookmarkHub Extension
 * Direct extraction without content scripts
 */

class SimplePopupManager {
  constructor() {
    this.isExtracting = false
    this.initializeElements()
    this.setupEventListeners()
    this.initializePopup()
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    this.extractBtn = document.getElementById('extract-bookmarks')
    this.managerBtn = document.getElementById('open-manager')
    this.testBtn = document.getElementById('test-connection')
    this.progressSection = document.getElementById('progress-section')
    this.progressText = document.getElementById('progress-text')
    this.progressBar = document.getElementById('progress-bar')
    this.debugInfo = document.getElementById('debug-info')
    this.debugContent = document.getElementById('debug-content')
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.extractBtn.addEventListener('click', () => this.startExtraction())
    this.managerBtn.addEventListener('click', () => this.openManager())
    this.testBtn.addEventListener('click', () => this.testConnection())

    // Listen for progress updates from background service worker
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'EXTRACTION_PROGRESS') {
        this.handleProgressUpdate(message)
      }
    })
  }

  /**
   * Handle progress updates from service worker
   */
  handleProgressUpdate(progress) {
    const { count, hasMore, batchCount } = progress

    // Update both info card and progress section
    this.showInfo(
      `Extracting... (${count})`,
      `Found <strong>${count} bookmarks</strong> so far. Batch ${batchCount}${hasMore ? ' - continuing...' : ''}`,
      'extracting'
    )

    this.showProgress(
      `Extracting... ${count} bookmarks found (batch ${batchCount})${hasMore ? ' - continuing...' : ''}`
    )
  }

  /**
   * Initialize popup
   */
  async initializePopup() {
    try {
      // Automatically check login status on open
      await this.checkLoginStatus()
    } catch (error) {
      console.error('Error initializing popup:', error)
      this.updateStatus('Error initializing')
    }
  }

  /**
   * Start bookmark extraction - Now fully automated via background service worker!
   */
  async startExtraction() {
    if (this.isExtracting) return

    try {
      this.isExtracting = true
      this.extractBtn.disabled = true

      // Show initial extraction status
      this.showInfo(
        'Starting...',
        'Initializing bookmark extraction from X/Twitter...',
        'extracting'
      )
      this.showProgress('Starting extraction...')

      // Check authentication first
      const authCheck = await chrome.runtime.sendMessage({
        action: 'CHECK_AUTH',
      })

      if (!authCheck.authenticated) {
        this.showInfo(
          'Not Logged In',
          'Opening X/Twitter login page. Please log in and try again.',
          'error'
        )
        this.hideProgress()
        await chrome.tabs.create({ url: 'https://x.com/login' })
        return
      }

      // Update status: authenticated
      this.showInfo(
        'Extracting... (0)',
        'Connected to X/Twitter. Fetching your bookmarks...',
        'extracting'
      )
      this.showProgress('Fetching bookmarks from X/Twitter...')

      // Send extraction request to background service worker
      const result = await chrome.runtime.sendMessage({
        action: 'EXTRACT_BOOKMARKS',
        maxBookmarks: 5000,
      })

      if (result.success) {
        // Show success with details
        this.showInfo(
          'Success!',
          `Extracted <strong>${result.count} bookmarks</strong> (${result.saved} new, ${result.duplicates} duplicates skipped). Syncing to your app...`,
          'success'
        )
        this.showProgress(`✓ Successfully extracted ${result.count} bookmarks`)

        // Check if app is open
        setTimeout(async () => {
          const tabs = await chrome.tabs.query({
            url: ['http://localhost/*', 'http://127.0.0.1/*'],
          })

          if (tabs.length === 0) {
            this.showInfo(
              'Complete!',
              `Extracted <strong>${result.count} bookmarks</strong>. Opening BookmarkHub app to view them...`,
              'success'
            )
          } else {
            this.showInfo(
              'Complete!',
              `Extracted <strong>${result.count} bookmarks</strong>. Refresh your BookmarkHub app to see them!`,
              'success'
            )
          }
          this.hideProgress()
        }, 2000)
      } else {
        this.showInfo('Error', `Extraction failed: ${result.error}`, 'error')
        this.hideProgress()
      }
    } catch (error) {
      console.error('Error during extraction:', error)
      this.showInfo('Error', `Something went wrong: ${error.message}`, 'error')
      this.hideProgress()
    } finally {
      this.isExtracting = false
      this.extractBtn.disabled = false
    }
  }

  /**
   * Extract bookmarks from current Twitter page
   */
  async extractFromCurrentPage(tabId) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          const bookmarks = []

          // Find all tweet articles on the page
          const articles = document.querySelectorAll(
            'article[data-testid="tweet"]'
          )

          articles.forEach((article) => {
            try {
              // Get tweet link to extract username and ID
              const links = article.querySelectorAll('a[href*="/status/"]')
              let tweetUrl = ''
              let username = ''
              let tweetId = ''

              for (const link of links) {
                const href = link.getAttribute('href')
                const match = href.match(/^\/([^\/]+)\/status\/(\d+)/)
                if (match) {
                  username = match[1]
                  tweetId = match[2]
                  tweetUrl = `https://twitter.com${href}`
                  break
                }
              }

              if (!tweetUrl || !tweetId) return

              // Get tweet text
              const textElement = article.querySelector(
                '[data-testid="tweetText"]'
              )
              const text = textElement ? textElement.innerText : ''

              // Get author name
              const userNameElement = article.querySelector(
                '[data-testid="User-Name"]'
              )
              let displayName = username
              if (userNameElement) {
                const nameSpans = userNameElement.querySelectorAll('span')
                if (nameSpans.length > 0) {
                  displayName = nameSpans[0].innerText
                }
              }

              // Get timestamp
              const timeElement = article.querySelector('time')
              const timestamp = timeElement
                ? timeElement.getAttribute('datetime')
                : new Date().toISOString()

              // Get engagement metrics
              const replyBtn = article.querySelector('[data-testid="reply"]')
              const retweetBtn = article.querySelector(
                '[data-testid="retweet"]'
              )
              const likeBtn = article.querySelector('[data-testid="like"]')

              const getCount = (element) => {
                if (!element) return 0
                const text = element.innerText || element.textContent || ''
                const match = text.match(/(\d+)/)
                return match ? parseInt(match[1], 10) : 0
              }

              const replyCount = getCount(replyBtn)
              const retweetCount = getCount(retweetBtn)
              const likeCount = getCount(likeBtn)

              bookmarks.push({
                id: tweetId,
                rest_id: tweetId,
                id_str: tweetId,
                text: text,
                full_text: text,
                created_at: timestamp,
                user: {
                  screen_name: username,
                  name: displayName,
                },
                favorite_count: likeCount,
                retweet_count: retweetCount,
                reply_count: replyCount,
              })
            } catch (error) {
              console.error('Error parsing tweet:', error)
            }
          })

          return bookmarks
        },
      })

      return results && results[0] ? results[0].result : []
    } catch (error) {
      console.error('Error extracting from page:', error)
      throw error
    }
  }

  /**
   * Show detailed extraction results
   */
  showExtractionResults(savedCount, duplicateCount, methods, message) {
    let statusText = ''

    if (savedCount > 0) {
      statusText = `✓ Success! Imported ${savedCount} new bookmarks`
      if (duplicateCount > 0) {
        statusText += ` (${duplicateCount} duplicates skipped)`
      }
    } else if (message) {
      statusText = message
    }

    // Add method details to console
    console.log('Extraction complete:')
    console.log(`- New bookmarks saved: ${savedCount}`)
    console.log(`- Duplicates skipped: ${duplicateCount}`)
    console.log('- Methods used:', methods)

    this.updateStatus(statusText)

    // Show suggestion for more bookmarks
    if (savedCount < 5) {
      setTimeout(() => {
        this.updateStatus(
          statusText +
            ' (For more bookmarks, visit twitter.com/i/bookmarks first)'
        )
      }, 3000)
    }
  }

  /**
   * Get existing bookmarks for duplicate checking
   */
  async getExistingBookmarks() {
    try {
      const result = await chrome.storage.local.get(['bookmarks'])
      return result.bookmarks || []
    } catch (error) {
      console.error('Error getting existing bookmarks:', error)
      return []
    }
  }

  /**
   * Check if URL is a Twitter page
   */
  isTwitterPage(url) {
    if (!url) return false
    return url.includes('twitter.com') || url.includes('x.com')
  }

  /**
   * Transform tweet to bookmark format
   */
  transformTweet(tweet) {
    const text = tweet.full_text || tweet.text || ''
    const username = tweet.user?.screen_name || 'unknown'
    const tweetId = tweet.rest_id || tweet.id_str || tweet.id

    return {
      id: Date.now() + Math.random(),
      user_id: 'chrome-extension',
      title: text.substring(0, 100) || 'Untitled Bookmark',
      url: `https://twitter.com/${username}/status/${tweetId}`,
      description: text.substring(0, 200),
      content: text,
      author: tweet.user?.name || username,
      domain: 'twitter.com',
      source_platform: 'twitter',
      source_id: tweetId,
      engagement_score:
        (tweet.favorite_count || 0) + (tweet.retweet_count || 0) * 2,
      is_starred: false,
      is_read: false,
      is_archived: false,
      tags: ['twitter'],
      collections: ['Imported from X'],
      metadata: {
        original_twitter_data: tweet,
        import_date: new Date().toISOString(),
        import_source: 'chrome-extension',
      },
      created_at: tweet.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  /**
   * Save bookmarks to storage
   */
  async saveBookmarks(bookmarks) {
    try {
      // Get existing bookmarks
      const result = await chrome.storage.local.get(['bookmarks'])
      const existingBookmarks = result.bookmarks || []

      // Add new bookmarks
      const allBookmarks = [...existingBookmarks, ...bookmarks]

      // Save to storage
      await chrome.storage.local.set({ bookmarks: allBookmarks })

      return bookmarks.length
    } catch (error) {
      console.error('Error saving bookmarks:', error)
      throw error
    }
  }

  /**
   * Open main bookmark manager
   * Content script will auto-sync bookmarks to localStorage
   */
  async openManager() {
    try {
      // Get bookmarks count
      const result = await chrome.storage.local.get(['bookmarks'])
      const bookmarks = result.bookmarks || []

      console.log(`📦 ${bookmarks.length} bookmarks ready for auto-sync`)

      // Find localhost tabs (any port)
      const localhostTabs = await chrome.tabs.query({
        url: ['http://localhost/*', 'http://127.0.0.1/*'],
      })

      if (localhostTabs.length > 0) {
        // Use first localhost tab found
        const managerTab = localhostTabs[0]
        console.log(`📍 Opening existing tab at: ${managerTab.url}`)
        await chrome.tabs.update(managerTab.id, { active: true })
        this.updateStatus(
          'Opening app... Bookmarks will auto-sync in a few seconds!'
        )
      } else {
        // Ask user for their app URL
        const appUrl = prompt(
          'Enter your BookmarkHub URL:',
          'http://localhost:3000'
        )

        if (!appUrl) {
          this.updateStatus('Cancelled')
          return
        }

        console.log(`🌐 Creating new tab at: ${appUrl}`)
        await chrome.tabs.create({ url: appUrl })
        this.updateStatus(
          'Opening app... Bookmarks will auto-sync when page loads!'
        )
      }

      // Close popup after a delay
      setTimeout(() => window.close(), 2000)
    } catch (error) {
      console.error('❌ Error opening manager:', error)
      this.updateStatus(`Error: ${error.message}`)
    }
  }

  /**
   * Show info message in the info card
   */
  showInfo(title, message, type = 'default') {
    const infoCard = document.getElementById('requirements-info')
    if (infoCard) {
      const titleEl = infoCard.querySelector('.info-title')
      const textEl = infoCard.querySelector('.info-text')
      if (titleEl) titleEl.textContent = title
      if (textEl) textEl.innerHTML = message

      // Update card styling based on type
      infoCard.className = 'info-card'
      if (type === 'extracting') {
        infoCard.classList.add('extracting')
      } else if (type === 'success') {
        infoCard.classList.add('success')
      } else if (type === 'error') {
        infoCard.classList.add('error')
      }
    }
  }

  /**
   * Update status (for backward compatibility - updates info card)
   */
  updateStatus(message) {
    // Determine title based on message content
    let title = 'Status'
    if (message.includes('Error') || message.includes('❌')) {
      title = 'Error'
    } else if (message.includes('✓') || message.includes('Success')) {
      title = 'Ready'
    } else if (message.includes('Extracting') || message.includes('Starting')) {
      title = 'Extracting'
    } else if (message.includes('Opening')) {
      title = 'Opening App'
    }

    this.showInfo(title, message)
  }

  /**
   * Show progress during extraction
   */
  showProgress(text) {
    if (this.progressSection) {
      this.progressSection.style.display = 'block'
    }
    if (this.progressText) {
      this.progressText.textContent = text
    }
  }

  /**
   * Hide progress section
   */
  hideProgress() {
    if (this.progressSection) {
      this.progressSection.style.display = 'none'
    }
  }

  /**
   * Show/hide progress bar
   */
  showProgress(show) {
    if (this.progressBar) {
      this.progressBar.style.display = show ? 'block' : 'none'
    }
  }

  /**
   * Check login status (called automatically on popup open)
   */
  async checkLoginStatus() {
    this.showInfo('Checking...', 'Verifying your X/Twitter login status...')
    this.extractBtn.disabled = true

    try {
      // Check for Twitter/X auth cookies
      const cookies = await chrome.cookies.getAll({
        domain: '.x.com',
      })

      const authCookie = cookies.find((c) => c.name === 'auth_token')

      if (!authCookie) {
        this.showInfo(
          'Login Required',
          'Please open <strong>X/Twitter</strong> in a new tab and log in to your account before extracting bookmarks.'
        )
        this.extractBtn.disabled = true
        return
      }

      this.showInfo(
        'Ready to Go',
        "You're logged in! Click <strong>Extract Bookmarks</strong> to start."
      )
      this.extractBtn.disabled = false
    } catch (error) {
      console.error('Error checking login status:', error)
      this.showInfo('Error', 'Could not verify login status. Please try again.')
      this.extractBtn.disabled = true
    }
  }

  /**
   * Test connection (manual button click)
   */
  async testConnection() {
    await this.checkLoginStatus()
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SimplePopupManager()
})
