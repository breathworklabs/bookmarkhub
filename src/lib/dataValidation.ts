/**
 * Data validation and migration utilities for localStorage using Zod
 */

import { z } from 'zod'
import type { Bookmark, BookmarkInsert, ExportData, AppSettings, AppMetadata } from '../types/bookmark'

// Zod schemas
export const urlSchema = z.string().url()

export const bookmarkSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  title: z.string().min(1),
  url: urlSchema,
  description: z.string(),
  content: z.string(),
  thumbnail_url: z.string().optional(),
  favicon_url: z.string().optional(),
  author: z.string(),
  domain: z.string(),
  source_platform: z.string(),
  source_id: z.string().optional(),
  engagement_score: z.number(),
  is_starred: z.boolean(),
  is_read: z.boolean(),
  is_archived: z.boolean(),
  tags: z.array(z.string()),
  collections: z.array(z.string()).default(['uncategorized']),
  metadata: z.any().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const bookmarkInsertSchema = bookmarkSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const appSettingsSchema = z.object({
  theme: z.enum(['dark', 'light']),
  viewMode: z.enum(['grid', 'list']),
  defaultSort: z.enum(['newest', 'oldest', 'title', 'domain']),
  showMetrics: z.boolean(),
  compactMode: z.boolean(),
  autoBackup: z.boolean(),
  exportFormat: z.enum(['json', 'csv', 'html']),
  maxBookmarks: z.number().optional(),
  autoTagging: z.boolean().optional(),
})

export const appMetadataSchema = z.object({
  version: z.string(),
  lastBackup: z.string().optional(),
  totalBookmarks: z.number(),
  createdAt: z.string(),
  lastUpdate: z.string(),
  storageUsed: z.number().optional(),
  maxStorage: z.number().optional(),
})

export const exportDataSchema = z.object({
  bookmarks: z.array(bookmarkSchema),
  settings: appSettingsSchema,
  metadata: appMetadataSchema,
  exportedAt: z.string(),
  version: z.string(),
})

// Validation functions
export const isValidUrl = (url: string): boolean => {
  return urlSchema.safeParse(url).success
}

export const isValidBookmark = (bookmark: any): bookmark is Bookmark => {
  return bookmarkSchema.safeParse(bookmark).success
}

export const isValidBookmarkInsert = (bookmark: any): bookmark is BookmarkInsert => {
  return bookmarkInsertSchema.safeParse(bookmark).success
}

export const isValidSettings = (settings: any): settings is AppSettings => {
  return appSettingsSchema.safeParse(settings).success
}

export const isValidMetadata = (metadata: any): metadata is AppMetadata => {
  return appMetadataSchema.safeParse(metadata).success
}

// Sanitization functions
export const sanitizeBookmark = (bookmark: any): BookmarkInsert | null => {
  try {
    // Apply defaults and sanitization
    const sanitized: BookmarkInsert = {
      user_id: String(bookmark.user_id || 'ae879c80-f3fc-4e05-a837-384e4b9bfb28'),
      title: String(bookmark.title || '').trim(),
      url: String(bookmark.url || '').trim(),
      description: String(bookmark.description || bookmark.content || '').trim(),
      content: String(bookmark.content || bookmark.description || '').trim(),
      author: String(bookmark.author || 'Unknown Author').trim(),
      domain: String(bookmark.domain || extractDomain(bookmark.url)).trim(),
      source_platform: String(bookmark.source_platform || 'manual').trim(),
      engagement_score: Number(bookmark.engagement_score || 0),
      is_starred: Boolean(bookmark.is_starred || bookmark.isStarred),
      is_read: Boolean(bookmark.is_read || false),
      is_archived: Boolean(bookmark.is_archived || false),
      tags: Array.isArray(bookmark.tags)
        ? bookmark.tags.filter((tag: any) => typeof tag === 'string').map((tag: string) => tag.trim())
        : [],
      collections: Array.isArray(bookmark.collections)
        ? bookmark.collections.filter((id: any) => typeof id === 'string').map((id: string) => id.trim())
        : ['uncategorized'],
      thumbnail_url: bookmark.thumbnail_url ? String(bookmark.thumbnail_url).trim() : undefined,
      favicon_url: bookmark.favicon_url ? String(bookmark.favicon_url).trim() : undefined,
      source_id: bookmark.source_id ? String(bookmark.source_id).trim() : undefined,
      metadata: bookmark.metadata
    }

    // Validate required fields
    if (!sanitized.title || !sanitized.url || !isValidUrl(sanitized.url)) {
      return null
    }

    // Use Zod to validate the final structure
    const result = bookmarkInsertSchema.safeParse(sanitized)
    return result.success ? result.data : null
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
      user_id: item.user_id || 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
      title: item.title,
      url: item.url,
      description: item.description || item.content || '',
      content: item.content || item.description || '',
      author: typeof item.author === 'string' ? item.author : item.author?.name || 'Unknown Author',
      domain: item.domain || extractDomain(item.url),
      source_platform: item.source_platform || 'manual',
      engagement_score: item.engagement_score || 0,
      is_starred: item.is_starred || item.isStarred || false,
      is_read: item.is_read || false,
      is_archived: item.is_archived || false,
      tags: item.tags || [],
      thumbnail_url: item.thumbnail_url,
      favicon_url: item.favicon_url,
      source_id: item.source_id,
      metadata: item.metadata,
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