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
  static sanitizeBookmark(bookmark: unknown): BookmarkInsert | null {
    try {
      if (!bookmark || typeof bookmark !== 'object') return null
      const b = bookmark as Record<string, unknown>

      const sanitized: BookmarkInsert = {
        user_id: String(b.user_id || 'ae879c80-f3fc-4e05-a837-384e4b9bfb28'),
        title: String(b.title || '').trim(),
        url: String(b.url || '').trim(),
        description: String(b.description || b.content || '').trim(),
        content: String(b.content || b.description || '').trim(),
        author: String(b.author || 'Unknown Author').trim(),
        domain: String(
          b.domain || this.extractDomain(String(b.url || ''))
        ).trim(),
        source_platform: String(b.source_platform || 'manual').trim(),
        engagement_score: Number(b.engagement_score || 0),
        is_starred: Boolean(b.is_starred || b.isStarred),
        is_read: Boolean(b.is_read || false),
        is_archived: Boolean(b.is_archived || false),
        is_shared: Boolean(b.is_shared || false),
        tags: Array.isArray(b.tags)
          ? b.tags
              .filter((tag: unknown) => typeof tag === 'string')
              .map((tag: string) => tag.trim())
          : [],
        collections: Array.isArray(b.collections)
          ? b.collections
              .filter((id: unknown) => typeof id === 'string')
              .map((id: string) => id.trim())
          : ['uncategorized'],
        thumbnail_url: b.thumbnail_url
          ? String(b.thumbnail_url).trim()
          : undefined,
        favicon_url: b.favicon_url ? String(b.favicon_url).trim() : undefined,
        source_id: b.source_id ? String(b.source_id).trim() : undefined,
        metadata: b.metadata as BookmarkInsert['metadata'],
      }

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
  static prepareBookmarkForForm(
    formData: Record<string, unknown>
  ): BookmarkInsert {
    const domain =
      String(formData.domain || '') ||
      this.extractDomainForForm(String(formData.url || ''))

    return {
      user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
      title: String(formData.title || ''),
      url: String(formData.url || ''),
      description:
        String(formData.description || '') ||
        `Bookmark for ${String(formData.title || '')}`,
      content:
        String(formData.content || '') ||
        `Bookmark for ${String(formData.title || '')}`,
      author: String(formData.author || 'Unknown'),
      domain: domain || 'unknown',
      source_platform: 'manual',
      engagement_score: 0,
      is_starred: false,
      is_read: false,
      is_archived: false,
      is_shared: false,
      tags: Array.isArray(formData.tags)
        ? formData.tags.filter((t): t is string => typeof t === 'string')
        : [],
      collections: ['uncategorized'],
    }
  }
}

export default DataProcessingService
