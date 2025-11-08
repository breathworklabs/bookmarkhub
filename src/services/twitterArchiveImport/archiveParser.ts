/**
 * Twitter Archive bookmark parser
 * Parses bookmarks.js format: window.YTD.bookmarks.part0 = [...]
 */

import { ImportExportError } from '../../utils/errorHandling'
import type {
  TwitterArchiveBookmark,
  ParsedTwitterBookmark,
  ProgressCallback,
} from './types'

/**
 * Parse Twitter archive bookmarks.js file
 * Format: window.YTD.bookmarks.part0 = [{ bookmark: { ... } }]
 *
 * @param fileContent Content of bookmarks.js
 * @param onProgress Optional progress callback
 * @returns Array of parsed bookmarks
 */
export function parseTwitterArchive(
  fileContent: string,
  onProgress?: ProgressCallback
): ParsedTwitterBookmark[] {
  onProgress?.({
    phase: 'parsing',
    current: 0,
    total: 100,
    message: 'Parsing archive format...',
  })

  try {
    // Clean up the JavaScript file content
    // Twitter archives use: window.YTD.bookmarks.part0 = [...]
    let jsonContent = fileContent.trim()

    // Remove the JavaScript assignment
    const patterns = [
      /window\.YTD\.bookmarks\.part\d+\s*=\s*/,
      /window\.YTD\.bookmark\.part\d+\s*=\s*/,
      /YTD\.bookmarks\.part\d+\s*=\s*/,
      /YTD\.bookmark\.part\d+\s*=\s*/,
    ]

    for (const pattern of patterns) {
      if (pattern.test(jsonContent)) {
        jsonContent = jsonContent.replace(pattern, '')
        break
      }
    }

    // Remove trailing semicolon if present
    jsonContent = jsonContent.replace(/;?\s*$/, '')

    onProgress?.({
      phase: 'parsing',
      current: 25,
      total: 100,
      message: 'Extracting bookmark data...',
    })

    // Parse JSON
    const rawData = JSON.parse(jsonContent) as TwitterArchiveBookmark[]

    if (!Array.isArray(rawData)) {
      throw new Error('Parsed data is not an array')
    }

    if (rawData.length === 0) {
      throw ImportExportError.importFailed('No bookmarks found in archive')
    }

    onProgress?.({
      phase: 'parsing',
      current: 50,
      total: 100,
      message: `Processing ${rawData.length} bookmarks...`,
    })

    // Transform to parsed format
    const parsed: ParsedTwitterBookmark[] = []
    const errors: string[] = []

    for (let i = 0; i < rawData.length; i++) {
      try {
        const item = rawData[i]
        const bookmark = item.bookmark

        if (!bookmark) {
          errors.push(`Item ${i}: Missing bookmark data`)
          continue
        }

        // Extract tweet URL from entities or construct it
        let tweetUrl = ''

        // Try to get URL from expanded URLs
        if (bookmark.entities?.urls && bookmark.entities.urls.length > 0) {
          tweetUrl =
            bookmark.entities.urls[0].expanded_url ||
            bookmark.entities.urls[0].url
        }

        // If no URL found, construct from tweet ID and username
        if (!tweetUrl && bookmark.user?.screen_name) {
          tweetUrl = `https://x.com/${bookmark.user.screen_name}/status/${bookmark.tweetId}`
        } else if (!tweetUrl) {
          tweetUrl = `https://x.com/i/web/status/${bookmark.tweetId}`
        }

        // Extract images and video info
        const images: string[] = []
        let hasVideo = false

        if (bookmark.entities?.media) {
          for (const media of bookmark.entities.media) {
            if (media.type === 'photo' && media.mediaUrl) {
              images.push(media.mediaUrl)
            } else if (
              media.type === 'video' ||
              media.type === 'animated_gif'
            ) {
              hasVideo = true
            }
          }
        }

        parsed.push({
          tweetId: bookmark.tweetId,
          text: bookmark.fullText || '',
          url: tweetUrl,
          createdAt: bookmark.createdAt || new Date().toISOString(),
          author: {
            name: bookmark.user?.name || 'Unknown',
            username: bookmark.user?.screen_name || 'unknown',
            profileImage: bookmark.user?.profile_image_url_https,
          },
          media:
            images.length > 0 || hasVideo
              ? {
                  images,
                  hasVideo,
                }
              : undefined,
        })

        // Update progress
        if (i % 100 === 0) {
          onProgress?.({
            phase: 'parsing',
            current: 50 + Math.floor((i / rawData.length) * 50),
            total: 100,
            message: `Processed ${i}/${rawData.length} bookmarks...`,
          })
        }
      } catch (error) {
        errors.push(
          `Item ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    onProgress?.({
      phase: 'parsing',
      current: 100,
      total: 100,
      message: `Parsed ${parsed.length} bookmarks`,
    })

    if (parsed.length === 0) {
      throw ImportExportError.importFailed(
        `Failed to parse any bookmarks. Errors: ${errors.join(', ')}`
      )
    }

    // Log warnings for skipped items
    if (errors.length > 0) {
      console.warn(
        `Skipped ${errors.length} invalid bookmarks:`,
        errors.slice(0, 5)
      )
    }

    return parsed
  } catch (error) {
    if (error instanceof ImportExportError) {
      throw error
    }

    throw ImportExportError.importFailed(
      `Failed to parse archive: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Validate parsed bookmark data
 * @param bookmarks Parsed bookmarks to validate
 * @returns Validation result
 */
export function validateParsedBookmarks(bookmarks: ParsedTwitterBookmark[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!Array.isArray(bookmarks)) {
    errors.push('Bookmarks must be an array')
    return { valid: false, errors }
  }

  if (bookmarks.length === 0) {
    errors.push('No bookmarks found')
    return { valid: false, errors }
  }

  // Validate first few bookmarks
  const sampleSize = Math.min(bookmarks.length, 5)
  for (let i = 0; i < sampleSize; i++) {
    const bookmark = bookmarks[i]

    if (!bookmark.tweetId) {
      errors.push(`Bookmark ${i}: Missing tweetId`)
    }
    if (!bookmark.url) {
      errors.push(`Bookmark ${i}: Missing url`)
    }
    if (!bookmark.author?.username) {
      errors.push(`Bookmark ${i}: Missing author username`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
