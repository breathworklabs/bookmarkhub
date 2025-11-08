/**
 * TwitterAPIClient - Direct extraction from browser storage/session
 * No navigation required - extracts data directly from browser data
 */

class TwitterAPIClientDirect {
  constructor() {
    this.baseUrl = 'https://twitter.com/i/api'
    this.maxRequests = 50
    this.requestDelay = 1000
  }

  /**
   * Check if user is logged into Twitter
   */
  async checkTwitterLogin() {
    try {
      // Method 1: Check session storage for Twitter session data
      if (this.checkSessionStorage()) {
        console.log('Login detected via session storage')
        return true
      }

      // Method 2: Check localStorage for Twitter session data
      if (this.checkLocalStorage()) {
        console.log('Login detected via localStorage')
        return true
      }

      // Method 3: Check cookies for Twitter session
      if (this.checkCookies()) {
        console.log('Login detected via cookies')
        return true
      }

      return false
    } catch (error) {
      console.error('Error checking Twitter login:', error)
      return false
    }
  }

  /**
   * Extract all bookmarks directly from browser data
   */
  async extractAllBookmarks() {
    console.log('Starting direct bookmark extraction...')

    try {
      // Method 1: Try to get bookmarks from localStorage/sessionStorage
      const storedBookmarks = this.extractBookmarksFromStorage()
      if (storedBookmarks.length > 0) {
        console.log(`Found ${storedBookmarks.length} bookmarks in storage`)
        return storedBookmarks
      }

      // Method 2: Make direct API call using existing session
      const apiBookmarks = await this.fetchBookmarksDirectly()
      if (apiBookmarks.length > 0) {
        console.log(`Found ${apiBookmarks.length} bookmarks via API`)
        return apiBookmarks
      }

      console.log('No bookmarks found in any method')
      return []
    } catch (error) {
      console.error('Error in bookmark extraction:', error)
      throw error
    }
  }

  /**
   * Extract bookmarks from browser storage
   */
  extractBookmarksFromStorage() {
    const bookmarks = []

    try {
      // Check localStorage for cached bookmark data
      const localKeys = Object.keys(localStorage)
      for (const key of localKeys) {
        if (
          key.includes('bookmark') ||
          key.includes('timeline') ||
          key.includes('tweet')
        ) {
          try {
            const data = JSON.parse(localStorage.getItem(key))
            if (data && this.isBookmarkData(data)) {
              const parsedBookmarks = this.parseStorageBookmarks(data)
              bookmarks.push(...parsedBookmarks)
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }

      // Check sessionStorage for cached bookmark data
      const sessionKeys = Object.keys(sessionStorage)
      for (const sessionKey of sessionKeys) {
        if (
          sessionKey.includes('bookmark') ||
          sessionKey.includes('timeline') ||
          sessionKey.includes('tweet')
        ) {
          try {
            const data = JSON.parse(sessionStorage.getItem(sessionKey))
            if (data && this.isBookmarkData(data)) {
              const parsedBookmarks = this.parseStorageBookmarks(data)
              bookmarks.push(...parsedBookmarks)
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      console.error('Error extracting from storage:', error)
    }

    return this.removeDuplicateBookmarks(bookmarks)
  }

  /**
   * Make direct API call to get bookmarks
   */
  async fetchBookmarksDirectly() {
    try {
      // Try different bookmark API endpoints
      const endpoints = [
        '/2/timeline/bookmark.json',
        '/1.1/bookmarks/list.json',
      ]

      for (const endpoint of endpoints) {
        try {
          const url = `${this.baseUrl}${endpoint}?count=100&include_entities=true&tweet_mode=extended`

          const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
              Accept: 'application/json',
              'X-Twitter-Active-User': 'yes',
              'X-Twitter-Auth-Type': 'OAuth2Session',
              'X-Twitter-Client-Language': 'en',
            },
          })

          if (response.ok) {
            const data = await response.json()
            const bookmarks = this.parseAPIResponse(data)
            if (bookmarks.length > 0) {
              console.log(
                `Successfully fetched ${bookmarks.length} bookmarks from ${endpoint}`
              )
              return bookmarks
            }
          }
        } catch (error) {
          console.log(`Failed to fetch from ${endpoint}:`, error.message)
        }
      }

      return []
    } catch (error) {
      console.error('Error fetching bookmarks directly:', error)
      return []
    }
  }

  /**
   * Check if data looks like bookmark data
   */
  isBookmarkData(data) {
    if (!data || typeof data !== 'object') return false

    // Check for common bookmark data structures
    if (data.instructions && Array.isArray(data.instructions)) return true
    if (data.tweets && Array.isArray(data.tweets)) return true
    if (data.bookmarks && Array.isArray(data.bookmarks)) return true
    if (data.timeline && data.timeline.instructions) return true

    return false
  }

  /**
   * Parse bookmark data from storage
   */
  parseStorageBookmarks(data) {
    const bookmarks = []

    try {
      // Handle different data structures
      if (data.instructions) {
        bookmarks.push(...this.parseTimelineInstructions(data.instructions))
      }

      if (data.tweets) {
        data.tweets.forEach((tweet) => {
          const bookmark = this.transformTweetToBookmark(tweet)
          if (bookmark) bookmarks.push(bookmark)
        })
      }

      if (data.bookmarks) {
        data.bookmarks.forEach((bookmark) => {
          const transformed = this.transformTweetToBookmark(bookmark)
          if (transformed) bookmarks.push(transformed)
        })
      }
    } catch (error) {
      console.error('Error parsing storage bookmarks:', error)
    }

    return bookmarks
  }

  /**
   * Parse API response
   */
  parseAPIResponse(data) {
    const bookmarks = []

    try {
      if (data.instructions) {
        bookmarks.push(...this.parseTimelineInstructions(data.instructions))
      }

      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((item) => {
          const bookmark = this.transformTweetToBookmark(item)
          if (bookmark) bookmarks.push(bookmark)
        })
      }
    } catch (error) {
      console.error('Error parsing API response:', error)
    }

    return bookmarks
  }

  /**
   * Parse timeline instructions
   */
  parseTimelineInstructions(instructions) {
    const bookmarks = []

    instructions.forEach((instruction) => {
      if (instruction.type === 'TimelineAddEntries') {
        instruction.entries.forEach((entry) => {
          if (entry.content?.entryType === 'TimelineTimelineItem') {
            const tweet = entry.content.itemContent?.tweet_results?.result
            if (tweet) {
              const bookmark = this.transformTweetToBookmark(tweet)
              if (bookmark) bookmarks.push(bookmark)
            }
          }
        })
      }
    })

    return bookmarks
  }

  /**
   * Transform tweet data to bookmark format
   */
  transformTweetToBookmark(tweet) {
    try {
      return {
        id: tweet.rest_id || tweet.id_str || tweet.id,
        text: tweet.full_text || tweet.text || '',
        username: tweet.user?.screen_name || 'Unknown',
        displayName: tweet.user?.name || tweet.user?.screen_name || 'Unknown',
        url: `https://twitter.com/${tweet.user?.screen_name}/status/${tweet.rest_id || tweet.id_str}`,
        createdAt: tweet.created_at || new Date().toISOString(),
        media: tweet.extended_entities?.media || [],
        engagement: {
          likes: tweet.favorite_count || 0,
          retweets: tweet.retweet_count || 0,
          replies: tweet.reply_count || 0,
        },
        user: {
          id: tweet.user?.id_str,
          screen_name: tweet.user?.screen_name,
          name: tweet.user?.name,
          profile_image_url: tweet.user?.profile_image_url_https,
        },
      }
    } catch (error) {
      console.error('Error transforming tweet:', error)
      return null
    }
  }

  /**
   * Remove duplicate bookmarks
   */
  removeDuplicateBookmarks(bookmarks) {
    const seen = new Set()
    return bookmarks.filter((bookmark) => {
      if (seen.has(bookmark.id)) {
        return false
      }
      seen.add(bookmark.id)
      return true
    })
  }

  /**
   * Check session storage for Twitter session data
   */
  checkSessionStorage() {
    try {
      const sessionKeys = Object.keys(sessionStorage)
      const sessionIndicators = [
        'auth_token',
        'ct0',
        'guest_id',
        'personalization_id',
        'twitter_session',
        'user_id',
      ]

      for (const key of sessionKeys) {
        if (
          sessionIndicators.some((indicator) =>
            key.toLowerCase().includes(indicator)
          )
        ) {
          return true
        }
      }
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Check localStorage for Twitter session data
   */
  checkLocalStorage() {
    try {
      const localKeys = Object.keys(localStorage)
      const sessionIndicators = [
        'auth_token',
        'ct0',
        'guest_id',
        'personalization_id',
        'twitter_session',
        'user_id',
        'twitter_ads_id',
      ]

      for (const key of localKeys) {
        if (
          sessionIndicators.some((indicator) =>
            key.toLowerCase().includes(indicator)
          )
        ) {
          return true
        }
      }
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Check cookies for Twitter session
   */
  checkCookies() {
    try {
      const cookies = document.cookie.split(';')
      const sessionCookies = [
        'auth_token',
        'ct0',
        'guest_id',
        'personalization_id',
        'twitter_session',
      ]

      for (const cookie of cookies) {
        const cookieName = cookie.split('=')[0].trim()
        if (
          sessionCookies.some((sessionCookie) =>
            cookieName.includes(sessionCookie)
          )
        ) {
          return true
        }
      }
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Make class available globally for content scripts
window.TwitterAPIClientDirect = TwitterAPIClientDirect
