/**
 * BookmarkParser - Transform Twitter data to BookmarkHub format
 * Maps Twitter API data to the existing Bookmark interface
 */

class BookmarkParser {
  constructor() {
    this.defaultUser = 'chrome-extension'
  }

  /**
   * Transform Twitter bookmark data to BookmarkHub format
   */
  transformToBookmarkFormat(twitterData) {
    return {
      id: this.generateUniqueId(),
      user_id: this.defaultUser,
      title: this.extractTitle(twitterData),
      url: this.extractUrl(twitterData),
      description: this.extractDescription(twitterData),
      content: twitterData.text || twitterData.full_text || '',
      thumbnail_url: this.extractThumbnail(twitterData),
      favicon_url: 'https://abs.twimg.com/favicons/twitter.ico',
      author: twitterData.displayName || twitterData.user?.name || 'Unknown',
      domain: 'twitter.com',
      source_platform: 'twitter',
      source_id: twitterData.id,
      engagement_score: this.calculateEngagementScore(twitterData),
      is_starred: false,
      is_read: false,
      is_archived: false,
      tags: this.extractTags(twitterData),
      collections: ['Imported from X'],
      metadata: {
        original_twitter_data: twitterData,
        import_date: new Date().toISOString(),
        import_source: 'chrome-extension',
        engagement: twitterData.engagement,
        user: twitterData.user,
      },
      created_at: this.parseTwitterDate(twitterData.createdAt),
      updated_at: new Date().toISOString(),
    }
  }

  /**
   * Generate unique ID for bookmark
   */
  generateUniqueId() {
    return Date.now() + Math.random()
  }

  /**
   * Extract title from tweet text
   */
  extractTitle(twitterData) {
    const text = twitterData.text || twitterData.full_text || ''

    // Remove URLs and mentions for cleaner title
    let title = text
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/@\w+/g, '') // Remove mentions
      .trim()

    // Limit title length
    if (title.length > 100) {
      title = title.substring(0, 100) + '...'
    }

    return title || 'Untitled Bookmark'
  }

  /**
   * Extract URL from Twitter data
   */
  extractUrl(twitterData) {
    if (twitterData.url) {
      return twitterData.url
    }

    // Construct URL from username and tweet ID
    const username = twitterData.username || twitterData.user?.screen_name
    const tweetId = twitterData.id

    if (username && tweetId) {
      return `https://twitter.com/${username}/status/${tweetId}`
    }

    return ''
  }

  /**
   * Extract description from tweet content
   */
  extractDescription(twitterData) {
    const text = twitterData.text || twitterData.full_text || ''

    // Use first 200 characters as description
    if (text.length > 200) {
      return text.substring(0, 200) + '...'
    }

    return text
  }

  /**
   * Extract thumbnail URL from media
   */
  extractThumbnail(twitterData) {
    if (twitterData.media && twitterData.media.length > 0) {
      const media = twitterData.media[0]

      // Prefer video thumbnail for videos
      if (media.type === 'video' && media.video_info?.variants) {
        const thumbnail = media.video_info.variants.find(
          (v) => v.content_type === 'image/jpeg'
        )
        if (thumbnail) return thumbnail.url
      }

      // Use media URL for images
      if (media.media_url_https) {
        return media.media_url_https
      }
    }

    // Use user profile image as fallback
    if (twitterData.user?.profile_image_url_https) {
      return twitterData.user.profile_image_url_https
    }

    return null
  }

  /**
   * Calculate engagement score
   */
  calculateEngagementScore(twitterData) {
    const engagement = twitterData.engagement || {}
    const likes = engagement.likes || 0
    const retweets = engagement.retweets || 0
    const replies = engagement.replies || 0

    // Weighted scoring: likes (1x), retweets (2x), replies (1x)
    return likes + retweets * 2 + replies
  }

  /**
   * Extract tags from tweet content
   */
  extractTags(twitterData) {
    const text = twitterData.text || twitterData.full_text || ''
    const tags = []

    // Extract hashtags
    const hashtagMatches = text.match(/#\w+/g)
    if (hashtagMatches) {
      tags.push(...hashtagMatches.map((tag) => tag.substring(1).toLowerCase()))
    }

    // Add platform tag
    tags.push('twitter')

    // Add content type tags based on media
    if (twitterData.media && twitterData.media.length > 0) {
      const mediaTypes = twitterData.media.map((m) => m.type)
      if (mediaTypes.includes('video')) tags.push('video')
      if (mediaTypes.includes('photo')) tags.push('image')
    }

    return [...new Set(tags)] // Remove duplicates
  }

  /**
   * Parse Twitter date format
   */
  parseTwitterDate(twitterDate) {
    if (!twitterDate) {
      return new Date().toISOString()
    }

    try {
      // Twitter date format: "Wed Oct 05 20:19:24 +0000 2022"
      const date = new Date(twitterDate)
      return date.toISOString()
    } catch (error) {
      console.error('Error parsing Twitter date:', error)
      return new Date().toISOString()
    }
  }

  /**
   * Validate bookmark data
   */
  validateBookmark(bookmark) {
    const required = ['id', 'title', 'url', 'author', 'source_platform']

    for (const field of required) {
      if (!bookmark[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Validate URL format
    try {
      new URL(bookmark.url)
    } catch (error) {
      throw new Error(`Invalid URL format: ${bookmark.url}`)
    }

    return true
  }

  /**
   * Process multiple bookmarks
   */
  processBookmarks(twitterDataArray) {
    const bookmarks = []
    const errors = []

    twitterDataArray.forEach((twitterData, index) => {
      try {
        const bookmark = this.transformToBookmarkFormat(twitterData)
        this.validateBookmark(bookmark)
        bookmarks.push(bookmark)
      } catch (error) {
        console.error(`Error processing bookmark ${index}:`, error)
        errors.push({
          index,
          error: error.message,
          data: twitterData,
        })
      }
    })

    return {
      bookmarks,
      errors,
      successCount: bookmarks.length,
      errorCount: errors.length,
    }
  }
}

// Make class available globally for content scripts
window.BookmarkParser = BookmarkParser
