/**
 * Types for Twitter Archive Import Service
 * Handles parsing and processing Twitter data archives
 */

import type { BookmarkInsert } from '../../types/bookmark'

/**
 * Twitter Archive bookmark structure
 * Format: window.YTD.bookmarks.part0 = [{ bookmark: { ... } }]
 */
export interface TwitterArchiveBookmark {
  bookmark: {
    tweetId: string
    fullText: string
    createdAt: string
    expandedUrl?: string
    entities?: {
      media?: Array<{
        mediaUrl: string
        type: string
      }>
      urls?: Array<{
        url: string
        expanded_url: string
        display_url: string
      }>
    }
    user?: {
      name?: string
      screen_name?: string
      profile_image_url_https?: string
    }
  }
}

/**
 * Parsed bookmark data ready for transformation
 */
export interface ParsedTwitterBookmark {
  tweetId: string
  text: string
  url: string
  createdAt: string
  author: {
    name: string
    username: string
    profileImage?: string
  }
  media?: {
    images: string[]
    hasVideo: boolean
  }
}

/**
 * Import progress tracking
 */
export interface ImportProgress {
  phase:
    | 'extracting'
    | 'parsing'
    | 'transforming'
    | 'saving'
    | 'complete'
    | 'error'
  current: number
  total: number
  message: string
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
  bookmarks?: BookmarkInsert[]
}

/**
 * Progress callback function
 */
export type ProgressCallback = (progress: ImportProgress) => void
