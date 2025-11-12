import type { BookmarkInsert, XTwitterMetadata } from '../types/bookmark'
import { DataProcessingService } from '../services/dataProcessingService'

// X/Twitter bookmark data structure from the JSON file
interface XBookmarkData {
  id: number
  display_name: string
  username: string
  text: string
  url: string
  tweet_id: string
  tweet_date: string
  extracted_at: string
  timestamp: string
  images?: string[]
  has_video?: boolean
}

/**
 * Transform X/Twitter bookmark data to our Bookmark format
 */
export function transformXBookmark(
  xBookmark: XBookmarkData,
  userId: string = 'local-user'
): BookmarkInsert {
  if (!xBookmark) {
    throw new Error('xBookmark is null or undefined')
  }

  if (!xBookmark.url) {
    throw new Error('xBookmark.url is required')
  }

  // Handle missing or empty text (could be media-only posts, retweets, etc.)
  const text = xBookmark.text || '[No text content]'

  // Extract domain from URL
  const domain = DataProcessingService.extractDomain(xBookmark.url) || 'x.com'

  // Create title from text (truncated for readability)
  const title = DataProcessingService.createTitleFromText(text, 80)

  // For now, just add X platform tag
  const platformTags = ['X']

  // Separate different types of images
  const { normalProfileImages, biggerProfileImages, contentImages } =
    DataProcessingService.processImages(xBookmark.images || [])

  // Calculate engagement score
  const engagementScore = DataProcessingService.calculateEngagementScore({
    content: text,
    has_video: xBookmark.has_video,
    images: xBookmark.images,
  })

  const bookmark: BookmarkInsert = {
    user_id: userId,
    title: title,
    url: xBookmark.url,
    description: text,
    content: text,
    thumbnail_url: contentImages.length > 0 ? contentImages[0] : undefined,
    favicon_url:
      normalProfileImages.length > 0
        ? normalProfileImages[0]
        : `https://x.com/favicon.ico`,
    author: `${xBookmark.display_name} (@${xBookmark.username})`,
    domain: domain,
    source_platform: 'x.com',
    source_id: xBookmark.tweet_id,
    engagement_score: Math.min(engagementScore, 100),
    is_starred: false,
    is_read: false,
    is_archived: false,
    is_shared: false,
    tags: platformTags,
    collections: [],
    metadata: {
      platform: 'x.com',
      tweet_date: xBookmark.tweet_date,
      extracted_at: xBookmark.extracted_at,
      username: xBookmark.username,
      display_name: xBookmark.display_name,
      has_video: xBookmark.has_video || false,
      images: contentImages, // Only content images, not profile images
      profile_image_normal:
        normalProfileImages.length > 0 ? normalProfileImages[0] : undefined,
      profile_image_bigger:
        biggerProfileImages.length > 0 ? biggerProfileImages[0] : undefined,
    } satisfies XTwitterMetadata,
  }

  return bookmark
}

/**
 * Transform array of X bookmark data to our format
 * @param xBookmarks Array of X bookmark data
 * @param limit Optional limit for testing (default: no limit)
 */
export function transformXBookmarks(
  xBookmarks: XBookmarkData[],
  limit?: number
): BookmarkInsert[] {
  if (!Array.isArray(xBookmarks)) {
    throw new Error('xBookmarks must be an array')
  }

  const bookmarksToProcess = limit ? xBookmarks.slice(0, limit) : xBookmarks

  return bookmarksToProcess.map((xBookmark, index) => {
    try {
      return transformXBookmark(xBookmark)
    } catch (error) {
      console.error(`Error transforming bookmark at index ${index}:`, error)
      console.error('Bookmark data:', xBookmark)
      throw new Error(
        `Failed to transform bookmark at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  })
}

/**
 * Validate X bookmark data structure
 */
export function validateXBookmarkData(data: any): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!Array.isArray(data)) {
    errors.push('Data must be an array of bookmarks')
    return { valid: false, errors }
  }

  // Check first few items for required fields
  const sampleSize = Math.min(data.length, 3)
  for (let i = 0; i < sampleSize; i++) {
    const item = data[i]
    if (!item.id) errors.push(`Item ${i}: Missing required field 'id'`)
    if (!item.url) errors.push(`Item ${i}: Missing required field 'url'`)
    // text is optional - could be media-only posts
    if (!item.username)
      errors.push(`Item ${i}: Missing required field 'username'`)
    if (!item.display_name)
      errors.push(`Item ${i}: Missing required field 'display_name'`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
