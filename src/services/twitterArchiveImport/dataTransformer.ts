/**
 * Transform parsed Twitter Archive bookmarks to BookmarkX format
 */

import type { BookmarkInsert, XTwitterMetadata } from '../../types/bookmark'
import type { ParsedTwitterBookmark, ProgressCallback } from './types'
import { DataProcessingService } from '../dataProcessingService'
import { logger } from '../../lib/logger'

/**
 * Transform parsed Twitter bookmark to BookmarkInsert format
 * @param parsedBookmark Parsed Twitter bookmark
 * @param userId User ID for the bookmark
 * @returns BookmarkInsert object
 */
export function transformTwitterBookmark(
  parsedBookmark: ParsedTwitterBookmark,
  userId: string = 'local-user'
): BookmarkInsert {
  // Extract domain from URL
  const domain =
    DataProcessingService.extractDomain(parsedBookmark.url) || 'x.com'

  // Create title from text
  const title = DataProcessingService.createTitleFromText(
    parsedBookmark.text || '[No text content]',
    80
  )

  // Calculate engagement score
  const engagementScore = DataProcessingService.calculateEngagementScore({
    content: parsedBookmark.text,
    has_video: parsedBookmark.media?.hasVideo,
    images: parsedBookmark.media?.images,
  })

  // Build properly typed metadata
  const metadata: XTwitterMetadata = {
    platform: 'x.com',
    tweet_date: parsedBookmark.createdAt,
    extracted_at: new Date().toISOString(),
    username: parsedBookmark.author.username,
    display_name: parsedBookmark.author.name,
    has_video: parsedBookmark.media?.hasVideo || false,
    images: parsedBookmark.media?.images,
    profile_image_normal: parsedBookmark.author.profileImage,
    profile_image_bigger: parsedBookmark.author.profileImage,
  }

  const bookmark: BookmarkInsert = {
    user_id: userId,
    title,
    url: parsedBookmark.url,
    description: parsedBookmark.text || '[No text content]',
    content: parsedBookmark.text || '[No text content]',
    thumbnail_url: parsedBookmark.media?.images?.[0],
    favicon_url:
      parsedBookmark.author.profileImage || 'https://x.com/favicon.ico',
    author: `${parsedBookmark.author.name} (@${parsedBookmark.author.username})`,
    domain,
    source_platform: 'x.com',
    source_id: parsedBookmark.tweetId,
    engagement_score: Math.min(engagementScore, 100),
    is_starred: false,
    is_read: false,
    is_archived: false,
    is_shared: false,
    tags: ['X', 'Twitter Archive'],
    collections: [],
    metadata,
  }

  return bookmark
}

/**
 * Transform array of parsed Twitter bookmarks
 * @param parsedBookmarks Array of parsed bookmarks
 * @param userId User ID for bookmarks
 * @param onProgress Optional progress callback
 * @returns Array of BookmarkInsert objects
 */
export function transformTwitterBookmarks(
  parsedBookmarks: ParsedTwitterBookmark[],
  userId: string = 'local-user',
  onProgress?: ProgressCallback
): BookmarkInsert[] {
  const transformed: BookmarkInsert[] = []
  const errors: string[] = []

  onProgress?.({
    phase: 'transforming',
    current: 0,
    total: parsedBookmarks.length,
    message: 'Transforming bookmarks...',
  })

  for (let i = 0; i < parsedBookmarks.length; i++) {
    try {
      const bookmark = transformTwitterBookmark(parsedBookmarks[i], userId)
      transformed.push(bookmark)

      // Update progress every 50 bookmarks
      if (i % 50 === 0) {
        onProgress?.({
          phase: 'transforming',
          current: i,
          total: parsedBookmarks.length,
          message: `Transformed ${i}/${parsedBookmarks.length} bookmarks...`,
        })
      }
    } catch (error) {
      errors.push(
        `Failed to transform bookmark ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  onProgress?.({
    phase: 'transforming',
    current: parsedBookmarks.length,
    total: parsedBookmarks.length,
    message: `Transformed ${transformed.length} bookmarks`,
  })

  // Log errors if any
  if (errors.length > 0) {
    logger.warn(
      `Transformation errors (${errors.length})`,
      undefined,
      { context: { errors: errors.slice(0, 5) } }
    )
  }

  return transformed
}
