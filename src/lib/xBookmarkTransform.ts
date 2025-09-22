import type { BookmarkInsert } from '../types/bookmark'

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
export function transformXBookmark(xBookmark: XBookmarkData, userId: string = 'local-user'): BookmarkInsert {
  // Extract domain from URL
  let domain = ''
  try {
    const urlObj = new URL(xBookmark.url)
    domain = urlObj.hostname.replace(/^www\./, '')
  } catch {
    domain = 'x.com'
  }

  // Create title from text (truncated for readability)
  const title = xBookmark.text.length > 80
    ? xBookmark.text.substring(0, 80) + '...'
    : xBookmark.text

  // Extract hashtags as tags
  const hashtags = xBookmark.text.match(/#\w+/g) || []
  const tags = hashtags.map(tag => tag.substring(1).toLowerCase())

  // Add platform-specific tags
  const platformTags = ['twitter', 'x-com']
  if (xBookmark.has_video) {
    platformTags.push('video')
  }

  // Separate different types of images
  const allImages = xBookmark.images || []
  const normalProfileImages = allImages.filter(img => img.includes('_normal'))
  const biggerProfileImages = allImages.filter(img => img.includes('_bigger'))
  const contentImages = allImages.filter(img => !img.includes('_normal') && !img.includes('_bigger'))

  console.log('Processing bookmark:', xBookmark.display_name)
  console.log('All images:', allImages)
  console.log('Normal images:', normalProfileImages)
  console.log('Bigger images:', biggerProfileImages)
  console.log('Content images:', contentImages)

  // Add images tag if there are content images
  if (contentImages.length > 0) {
    platformTags.push('images')
  }

  // Calculate engagement score (basic scoring for now)
  let engagementScore = 50 // Default middle score
  if (xBookmark.text.length > 200) engagementScore += 10 // Longer content
  if (hashtags.length > 0) engagementScore += 10 // Has hashtags
  if (xBookmark.has_video) engagementScore += 20 // Has video
  if (contentImages.length > 0) engagementScore += 10 // Has content images

  const bookmark: BookmarkInsert = {
    user_id: userId,
    title: title,
    url: xBookmark.url,
    description: xBookmark.text,
    content: xBookmark.text,
    thumbnail_url: contentImages.length > 0 ? contentImages[0] : undefined,
    favicon_url: normalProfileImages.length > 0 ? normalProfileImages[0] : `https://x.com/favicon.ico`,
    author: `${xBookmark.display_name} (@${xBookmark.username})`,
    domain: domain,
    source_platform: 'x.com',
    source_id: xBookmark.tweet_id,
    engagement_score: Math.min(engagementScore, 100),
    is_starred: false,
    is_read: false,
    is_archived: false,
    tags: [...new Set([...tags, ...platformTags])], // Remove duplicates
    collections: [],
    metadata: {
      tweet_date: xBookmark.tweet_date,
      extracted_at: xBookmark.extracted_at,
      username: xBookmark.username,
      display_name: xBookmark.display_name,
      has_video: xBookmark.has_video || false,
      images: contentImages, // Only content images, not profile images
      profile_image_normal: normalProfileImages.length > 0 ? normalProfileImages[0] : undefined,
      profile_image_bigger: biggerProfileImages.length > 0 ? biggerProfileImages[0] : undefined
    }
  }

  return bookmark
}

/**
 * Transform array of X bookmark data to our format
 * @param xBookmarks Array of X bookmark data
 * @param limit Optional limit for testing (default: no limit)
 */
export function transformXBookmarks(xBookmarks: XBookmarkData[], limit?: number): BookmarkInsert[] {
  const bookmarksToProcess = limit ? xBookmarks.slice(0, limit) : xBookmarks

  return bookmarksToProcess.map(xBookmark =>
    transformXBookmark(xBookmark)
  )
}

/**
 * Validate X bookmark data structure
 */
export function validateXBookmarkData(data: any): { valid: boolean; errors: string[] } {
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
    if (!item.text) errors.push(`Item ${i}: Missing required field 'text'`)
    if (!item.username) errors.push(`Item ${i}: Missing required field 'username'`)
    if (!item.display_name) errors.push(`Item ${i}: Missing required field 'display_name'`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}