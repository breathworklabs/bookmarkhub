/**
 * Data validation and migration utilities for localStorage
 */

import type { Bookmark, BookmarkInsert, ExportData, AppSettings, AppMetadata } from '../types/bookmark'

// Validation schemas
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isValidBookmark = (bookmark: any): bookmark is Bookmark => {
  return (
    typeof bookmark === 'object' &&
    bookmark !== null &&
    typeof bookmark.id === 'number' &&
    typeof bookmark.title === 'string' &&
    typeof bookmark.url === 'string' &&
    isValidUrl(bookmark.url) &&
    typeof bookmark.content === 'string' &&
    typeof bookmark.author === 'string' &&
    typeof bookmark.domain === 'string' &&
    typeof bookmark.created_at === 'string' &&
    Array.isArray(bookmark.tags) &&
    bookmark.tags.every((tag: any) => typeof tag === 'string') &&
    typeof bookmark.isStarred === 'boolean' &&
    bookmark.metrics &&
    typeof bookmark.metrics.likes === 'string' &&
    typeof bookmark.metrics.retweets === 'string' &&
    typeof bookmark.metrics.replies === 'string'
  )
}

export const isValidBookmarkInsert = (bookmark: any): bookmark is BookmarkInsert => {
  return (
    typeof bookmark === 'object' &&
    bookmark !== null &&
    typeof bookmark.title === 'string' &&
    typeof bookmark.url === 'string' &&
    isValidUrl(bookmark.url) &&
    typeof bookmark.content === 'string' &&
    typeof bookmark.author === 'string' &&
    typeof bookmark.domain === 'string' &&
    Array.isArray(bookmark.tags) &&
    bookmark.tags.every((tag: any) => typeof tag === 'string') &&
    typeof bookmark.isStarred === 'boolean' &&
    bookmark.metrics &&
    typeof bookmark.metrics.likes === 'string' &&
    typeof bookmark.metrics.retweets === 'string' &&
    typeof bookmark.metrics.replies === 'string'
  )
}

export const isValidSettings = (settings: any): settings is AppSettings => {
  return (
    typeof settings === 'object' &&
    settings !== null &&
    ['dark', 'light'].includes(settings.theme) &&
    ['grid', 'list'].includes(settings.viewMode) &&
    ['newest', 'oldest', 'title', 'domain'].includes(settings.defaultSort) &&
    typeof settings.showMetrics === 'boolean' &&
    typeof settings.compactMode === 'boolean' &&
    typeof settings.autoBackup === 'boolean' &&
    ['json', 'csv', 'html'].includes(settings.exportFormat)
  )
}

export const isValidMetadata = (metadata: any): metadata is AppMetadata => {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    typeof metadata.version === 'string' &&
    typeof metadata.totalBookmarks === 'number' &&
    typeof metadata.createdAt === 'string' &&
    typeof metadata.lastUpdate === 'string'
  )
}

// Sanitization functions
export const sanitizeBookmark = (bookmark: any): BookmarkInsert | null => {
  try {
    const sanitized: BookmarkInsert = {
      title: String(bookmark.title || '').trim(),
      url: String(bookmark.url || '').trim(),
      content: String(bookmark.content || '').trim(),
      author: String(bookmark.author || 'Unknown Author').trim(),
      domain: String(bookmark.domain || extractDomain(bookmark.url)).trim(),
      tags: Array.isArray(bookmark.tags)
        ? bookmark.tags.filter((tag: any) => typeof tag === 'string').map((tag: string) => tag.trim())
        : [],
      isStarred: Boolean(bookmark.isStarred),
      metrics: {
        likes: String(bookmark.metrics?.likes || '0'),
        retweets: String(bookmark.metrics?.retweets || '0'),
        replies: String(bookmark.metrics?.replies || '0')
      },
      thumbnail_url: bookmark.thumbnail_url ? String(bookmark.thumbnail_url).trim() : undefined,
      hasMedia: Boolean(bookmark.hasMedia || bookmark.thumbnail_url)
    }

    // Validate required fields
    if (!sanitized.title || !sanitized.url || !isValidUrl(sanitized.url)) {
      return null
    }

    return sanitized
  } catch {
    return null
  }
}

export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return 'unknown'
  }
}

// Migration functions for backward compatibility
export const migrateBookmarkData = (data: any[]): Bookmark[] => {
  const migrated: Bookmark[] = []

  for (const item of data) {
    // Handle old format (mock data) vs new format (localStorage)
    const sanitized = sanitizeBookmark({
      id: item.id,
      title: item.title,
      url: item.url,
      content: item.content || item.description || '',
      author: typeof item.author === 'string' ? item.author : item.author?.name || 'Unknown Author',
      domain: item.domain || extractDomain(item.url),
      created_at: item.created_at || item.timestamp || new Date().toISOString(),
      updated_at: item.updated_at,
      tags: item.tags || [],
      isStarred: item.isStarred || item.is_starred || false,
      metrics: item.metrics || { likes: '0', retweets: '0', replies: '0' },
      thumbnail_url: item.thumbnail_url,
      hasMedia: item.hasMedia || Boolean(item.thumbnail_url)
    })

    if (sanitized) {
      migrated.push({
        ...sanitized,
        id: item.id || migrated.length + 1,
        created_at: item.created_at || item.timestamp || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      })
    }
  }

  return migrated
}

// Data export utilities
export const createBackupData = (
  bookmarks: Bookmark[],
  settings: AppSettings,
  metadata: AppMetadata
): ExportData => {
  return {
    bookmarks,
    settings,
    metadata,
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  }
}

export const validateImportData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format')
    return { valid: false, errors }
  }

  if (data.bookmarks && !Array.isArray(data.bookmarks)) {
    errors.push('Bookmarks must be an array')
  }

  if (data.bookmarks) {
    const invalidBookmarks = data.bookmarks.filter((bookmark: any, index: number) => {
      const sanitized = sanitizeBookmark(bookmark)
      if (!sanitized) {
        errors.push(`Invalid bookmark at index ${index}`)
        return true
      }
      return false
    })

    if (invalidBookmarks.length > 0) {
      errors.push(`Found ${invalidBookmarks.length} invalid bookmarks`)
    }
  }

  if (data.settings && !isValidSettings(data.settings)) {
    errors.push('Invalid settings format')
  }

  if (data.metadata && !isValidMetadata(data.metadata)) {
    errors.push('Invalid metadata format')
  }

  return { valid: errors.length === 0, errors }
}

// Storage quota utilities
export const estimateStorageSize = (data: any): number => {
  try {
    return JSON.stringify(data).length
  } catch {
    return 0
  }
}

export const checkStorageQuota = async (): Promise<{
  available: number
  used: number
  quota: number
}> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      return {
        available: estimate.quota ? estimate.quota - (estimate.usage || 0) : 0,
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      }
    } catch {
      // Fallback for browsers that don't support the API
      return { available: 5 * 1024 * 1024, used: 0, quota: 5 * 1024 * 1024 } // 5MB fallback
    }
  } else {
    // Fallback for browsers that don't support the API
    return { available: 5 * 1024 * 1024, used: 0, quota: 5 * 1024 * 1024 } // 5MB fallback
  }
}

// Data cleanup utilities
export const cleanupBookmarkData = (bookmarks: Bookmark[]): Bookmark[] => {
  // Remove duplicates by URL
  const seen = new Set<string>()
  const cleaned: Bookmark[] = []

  for (const bookmark of bookmarks) {
    if (!seen.has(bookmark.url)) {
      seen.add(bookmark.url)
      cleaned.push(bookmark)
    }
  }

  // Sort by creation date (newest first)
  return cleaned.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}