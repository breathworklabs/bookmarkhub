import { type BookmarkInsert } from '@/types/bookmark'

/**
 * Centralized data processing service for bookmark operations
 * Consolidates duplicate logic across the application
 */
export class DataProcessingService {
  /**
   * Extract domain from URL with consistent error handling
   */
  static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace(/^www\./, '')
    } catch {
      return 'unknown'
    }
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Process and categorize images from X/Twitter data
   */
  static processImages(images: string[]): {
    normalProfileImages: string[]
    biggerProfileImages: string[]
    contentImages: string[]
  } {
    const allImages = Array.isArray(images) ? images : []

    return {
      normalProfileImages: allImages.filter(
        (img) => img && typeof img === 'string' && img.includes('_normal')
      ),
      biggerProfileImages: allImages.filter(
        (img) => img && typeof img === 'string' && img.includes('_bigger')
      ),
      contentImages: allImages.filter(
        (img) =>
          img &&
          typeof img === 'string' &&
          !img.includes('_normal') &&
          !img.includes('_bigger')
      ),
    }
  }

  /**
   * Calculate engagement score based on content characteristics
   */
  static calculateEngagementScore(bookmark: {
    content?: string
    text?: string
    has_video?: boolean
    images?: string[]
  }): number {
    let score = 50 // Default middle score

    const text = bookmark.content || bookmark.text || ''
    const images = Array.isArray(bookmark.images) ? bookmark.images : []
    const { contentImages } = this.processImages(images)

    // Content length scoring
    if (text.length > 200) score += 10
    if (text.length > 500) score += 5

    // Media scoring
    if (bookmark.has_video) score += 20
    if (contentImages.length > 0) score += 10
    if (contentImages.length > 2) score += 5

    // Ensure score stays within bounds
    return Math.min(Math.max(score, 0), 100)
  }

  /**
   * Sanitize bookmark data with consistent validation
   */
  static sanitizeBookmark(bookmark: any): BookmarkInsert | null {
    try {
      // Apply defaults and sanitization
      const sanitized: BookmarkInsert = {
        user_id: String(
          bookmark.user_id || 'ae879c80-f3fc-4e05-a837-384e4b9bfb28'
        ),
        title: String(bookmark.title || '').trim(),
        url: String(bookmark.url || '').trim(),
        description: String(
          bookmark.description || bookmark.content || ''
        ).trim(),
        content: String(bookmark.content || bookmark.description || '').trim(),
        author: String(bookmark.author || 'Unknown Author').trim(),
        domain: String(
          bookmark.domain || this.extractDomain(bookmark.url)
        ).trim(),
        source_platform: String(bookmark.source_platform || 'manual').trim(),
        engagement_score: Number(bookmark.engagement_score || 0),
        is_starred: Boolean(bookmark.is_starred || bookmark.isStarred),
        is_read: Boolean(bookmark.is_read || false),
        is_archived: Boolean(bookmark.is_archived || false),
        is_shared: Boolean(bookmark.is_shared || false),
        tags: Array.isArray(bookmark.tags)
          ? bookmark.tags
              .filter((tag: any) => typeof tag === 'string')
              .map((tag: string) => tag.trim())
          : [],
        collections: Array.isArray(bookmark.collections)
          ? bookmark.collections
              .filter((id: any) => typeof id === 'string')
              .map((id: string) => id.trim())
          : ['uncategorized'],
        thumbnail_url: bookmark.thumbnail_url
          ? String(bookmark.thumbnail_url).trim()
          : undefined,
        favicon_url: bookmark.favicon_url
          ? String(bookmark.favicon_url).trim()
          : undefined,
        source_id: bookmark.source_id
          ? String(bookmark.source_id).trim()
          : undefined,
        metadata: bookmark.metadata,
      }

      // Validate required fields
      if (
        !sanitized.title ||
        !sanitized.url ||
        !this.validateUrl(sanitized.url)
      ) {
        return null
      }

      return sanitized
    } catch {
      return null
    }
  }

  /**
   * Create title from text content with consistent truncation
   */
  static createTitleFromText(text: string, maxLength: number = 80): string {
    if (!text || text === '[No text content]') {
      return 'Untitled Bookmark'
    }

    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  /**
   * Extract domain from URL for form data (used in ModalProvider)
   */
  static extractDomainForForm(url: string): string {
    if (!url) return 'unknown'

    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return 'unknown'
    }
  }

  /**
   * Prepare bookmark data for form submission
   */
  static prepareBookmarkForForm(formData: any): BookmarkInsert {
    const domain = formData.domain || this.extractDomainForForm(formData.url)

    return {
      ...formData,
      domain: domain || 'unknown',
      description: formData.description || `Bookmark for ${formData.title}`,
      content: formData.content || `Bookmark for ${formData.title}`,
      author: formData.author || 'Unknown',
    }
  }
}

export default DataProcessingService
