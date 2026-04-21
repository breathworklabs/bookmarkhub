import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isValidUrl,
  isValidBookmark,
  isValidBookmarkInsert,
  isValidMetadata,
  sanitizeBookmark,
  extractDomain,
  migrateBookmarkData,
  createBackupData,
  validateImportData,
  estimateStorageSize,
  checkStorageQuota,
  cleanupBookmarkData,
  bookmarkSchema,
  bookmarkInsertSchema,
  appMetadataSchema,
  exportDataSchema,
} from '../../src/lib/dataValidation'
import { DataProcessingService } from '../../src/services/dataProcessingService'

// Mock DataProcessingService
vi.mock('../../src/services/dataProcessingService', () => ({
  DataProcessingService: {
    sanitizeBookmark: vi.fn(),
    extractDomain: vi.fn(),
  },
}))

describe('dataValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://test.org')).toBe(true)
      expect(isValidUrl('https://www.example.com/path')).toBe(true)
      expect(isValidUrl('https://example.com:8080')).toBe(true)
    })

    it('should validate URLs with various protocols', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://example.com')).toBe(true)
    })

    it('should validate URLs with query parameters', () => {
      expect(isValidUrl('https://example.com?param=value')).toBe(true)
      expect(isValidUrl('https://example.com?a=1&b=2&c=3')).toBe(true)
    })

    it('should validate URLs with hash fragments', () => {
      expect(isValidUrl('https://example.com#section')).toBe(true)
      expect(isValidUrl('https://example.com/page#top')).toBe(true)
    })

    it('should invalidate malformed URLs', () => {
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('just text')).toBe(false)
      expect(isValidUrl('http://')).toBe(false)
      expect(isValidUrl('https://')).toBe(false)
    })

    it('should invalidate URLs without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false)
      expect(isValidUrl('www.example.com')).toBe(false)
    })

    it('should validate localhost URLs', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('http://127.0.0.1:8080')).toBe(true)
    })

    it('should validate URLs with encoded characters', () => {
      expect(isValidUrl('https://example.com/path%20with%20spaces')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=%E2%9C%93')).toBe(true)
    })

    it('should handle null and undefined', () => {
      expect(isValidUrl(null as any)).toBe(false)
      expect(isValidUrl(undefined as any)).toBe(false)
    })

    it('should handle non-string inputs', () => {
      expect(isValidUrl(123 as any)).toBe(false)
      expect(isValidUrl({} as any)).toBe(false)
      expect(isValidUrl([] as any)).toBe(false)
    })
  })

  describe('isValidBookmark', () => {
    const validBookmark = {
      id: 1, // number not UUID
      user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
      title: 'Example Article',
      url: 'https://example.com/article',
      description: 'An example article',
      content: 'This is the content',
      author: 'John Doe',
      domain: 'example.com',
      source_platform: 'manual',
      engagement_score: 50,
      is_starred: false,
      is_read: false,
      is_archived: false,
      is_shared: false,
      is_deleted: false,
      tags: ['tech', 'news'],
      collections: ['uncategorized'],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    }

    it('should validate a complete valid bookmark', () => {
      expect(isValidBookmark(validBookmark)).toBe(true)
    })

    it('should validate bookmark with optional fields missing', () => {
      const minimalBookmark = {
        id: 1,
        user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
        title: 'Example',
        url: 'https://example.com',
        description: 'Description',
        content: 'Content',
        author: 'Author',
        domain: 'example.com',
        source_platform: 'manual',
        engagement_score: 0,
        is_starred: false,
        is_read: false,
        is_archived: false,
        is_shared: false,
        is_deleted: false,
        tags: [],
        collections: ['uncategorized'],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      }
      expect(isValidBookmark(minimalBookmark)).toBe(true)
    })

    it('should invalidate bookmark without required id', () => {
      const { id, ...bookmarkWithoutId } = validBookmark
      expect(isValidBookmark(bookmarkWithoutId)).toBe(false)
    })

    it('should invalidate bookmark without required user_id', () => {
      const { user_id, ...bookmarkWithoutUserId } = validBookmark
      expect(isValidBookmark(bookmarkWithoutUserId)).toBe(false)
    })

    it('should invalidate bookmark without required title', () => {
      const { title, ...bookmarkWithoutTitle } = validBookmark
      expect(isValidBookmark(bookmarkWithoutTitle)).toBe(false)
    })

    it('should invalidate bookmark without required url', () => {
      const { url, ...bookmarkWithoutUrl } = validBookmark
      expect(isValidBookmark(bookmarkWithoutUrl)).toBe(false)
    })

    it('should invalidate bookmark with invalid URL format', () => {
      expect(
        isValidBookmark({ ...validBookmark, url: 'not-a-valid-url' })
      ).toBe(false)
      expect(isValidBookmark({ ...validBookmark, url: 'example.com' })).toBe(
        false
      )
    })

    it('should invalidate bookmark with invalid id format', () => {
      expect(isValidBookmark({ ...validBookmark, id: 'invalid-id' })).toBe(
        false
      )
      expect(isValidBookmark({ ...validBookmark, id: '123' })).toBe(false)
    })

    it('should allow any numeric engagement_score', () => {
      // Schema doesn't enforce boundaries, just checks it's a number
      expect(isValidBookmark({ ...validBookmark, engagement_score: -1 })).toBe(
        true
      )
      expect(isValidBookmark({ ...validBookmark, engagement_score: 101 })).toBe(
        true
      )
    })

    it('should validate bookmark with engagement_score boundary values', () => {
      expect(isValidBookmark({ ...validBookmark, engagement_score: 0 })).toBe(
        true
      )
      expect(isValidBookmark({ ...validBookmark, engagement_score: 100 })).toBe(
        true
      )
    })

    it('should invalidate bookmark with invalid boolean fields', () => {
      expect(isValidBookmark({ ...validBookmark, is_starred: 'yes' })).toBe(
        false
      )
      expect(isValidBookmark({ ...validBookmark, is_read: 1 })).toBe(false)
    })

    it('should invalidate bookmark with invalid tags array', () => {
      expect(isValidBookmark({ ...validBookmark, tags: 'not-array' })).toBe(
        false
      )
      expect(isValidBookmark({ ...validBookmark, tags: [123, 456] })).toBe(
        false
      )
    })

    it('should invalidate bookmark with invalid collections array', () => {
      expect(
        isValidBookmark({ ...validBookmark, collections: 'not-array' })
      ).toBe(false)
      // Empty array is valid, it gets default(['uncategorized']) from schema
      expect(isValidBookmark({ ...validBookmark, collections: [] })).toBe(true)
    })

    it('should validate bookmark with optional thumbnail_url', () => {
      expect(
        isValidBookmark({
          ...validBookmark,
          thumbnail_url: 'https://example.com/thumb.jpg',
        })
      ).toBe(true)
    })

    it('should validate bookmark with optional favicon_url', () => {
      expect(
        isValidBookmark({
          ...validBookmark,
          favicon_url: 'https://example.com/favicon.ico',
        })
      ).toBe(true)
    })

    it('should validate bookmark with optional metadata', () => {
      expect(
        isValidBookmark({
          ...validBookmark,
          metadata: {
            platform: 'web' as const,
            custom: 'data',
            count: 42,
          },
        })
      ).toBe(true)
    })

    it('should handle null and undefined inputs', () => {
      expect(isValidBookmark(null)).toBe(false)
      expect(isValidBookmark(undefined)).toBe(false)
    })

    it('should handle non-object inputs', () => {
      expect(isValidBookmark('string')).toBe(false)
      expect(isValidBookmark(123)).toBe(false)
      expect(isValidBookmark([])).toBe(false)
    })
  })

  describe('isValidBookmarkInsert', () => {
    const validBookmarkInsert = {
      user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
      title: 'Example Article',
      url: 'https://example.com/article',
      description: 'An example article',
      content: 'This is the content',
      author: 'John Doe',
      domain: 'example.com',
      source_platform: 'manual',
      engagement_score: 50,
      is_starred: false,
      is_read: false,
      is_archived: false,
      is_shared: false,
      tags: ['tech', 'news'],
      collections: ['uncategorized'],
    }

    it('should validate a complete valid bookmark insert', () => {
      expect(isValidBookmarkInsert(validBookmarkInsert)).toBe(true)
    })

    it('should validate bookmark insert without optional id field', () => {
      expect(isValidBookmarkInsert(validBookmarkInsert)).toBe(true)
    })

    it('should validate bookmark insert without optional created_at field', () => {
      expect(isValidBookmarkInsert(validBookmarkInsert)).toBe(true)
    })

    it('should invalidate bookmark insert without required fields', () => {
      const { user_id, ...withoutUserId } = validBookmarkInsert
      expect(isValidBookmarkInsert(withoutUserId)).toBe(false)

      const { title, ...withoutTitle } = validBookmarkInsert
      expect(isValidBookmarkInsert(withoutTitle)).toBe(false)

      const { url, ...withoutUrl } = validBookmarkInsert
      expect(isValidBookmarkInsert(withoutUrl)).toBe(false)
    })

    it('should validate bookmark insert with optional fields', () => {
      expect(
        isValidBookmarkInsert({
          ...validBookmarkInsert,
          thumbnail_url: 'https://example.com/thumb.jpg',
          favicon_url: 'https://example.com/favicon.ico',
          source_id: 'twitter-123',
          metadata: { platform: 'web' as const, custom: 'data' },
        })
      ).toBe(true)
    })

    it('should handle null and undefined inputs', () => {
      expect(isValidBookmarkInsert(null)).toBe(false)
      expect(isValidBookmarkInsert(undefined)).toBe(false)
    })
  })

  describe('isValidMetadata', () => {
    const validMetadata = {
      version: '1.0.0',
      totalBookmarks: 100,
      createdAt: '2024-01-01T10:00:00Z',
      lastUpdate: '2024-01-15T10:00:00Z',
    }

    it('should validate complete valid metadata', () => {
      expect(isValidMetadata(validMetadata)).toBe(true)
    })

    it('should invalidate metadata without required version', () => {
      const { version, ...withoutVersion } = validMetadata
      expect(isValidMetadata(withoutVersion)).toBe(false)
    })

    it('should invalidate metadata without required totalBookmarks', () => {
      const { totalBookmarks, ...withoutTotal } = validMetadata
      expect(isValidMetadata(withoutTotal)).toBe(false)
    })

    it('should allow any numeric totalBookmarks', () => {
      // Schema doesn't enforce min/max, just checks it's a number
      expect(isValidMetadata({ ...validMetadata, totalBookmarks: -1 })).toBe(
        true
      )
    })

    it('should validate metadata with optional fields', () => {
      expect(
        isValidMetadata({
          ...validMetadata,
          lastBackup: '2024-01-14T10:00:00Z',
          storageUsed: 1024,
          maxStorage: 5242880,
          importSource: 'twitter',
        })
      ).toBe(true)
    })

    it('should validate metadata with zero counts', () => {
      expect(
        isValidMetadata({
          ...validMetadata,
          totalBookmarks: 0,
        })
      ).toBe(true)
    })

    it('should handle null and undefined inputs', () => {
      expect(isValidMetadata(null)).toBe(false)
      expect(isValidMetadata(undefined)).toBe(false)
    })
  })

  describe('sanitizeBookmark', () => {
    beforeEach(() => {
      vi.mocked(DataProcessingService.sanitizeBookmark).mockImplementation(
        (bookmark) => ({
          user_id: bookmark.user_id || 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description || '',
          content: bookmark.content || '',
          author: bookmark.author || 'Unknown Author',
          domain: bookmark.domain || 'example.com',
          source_platform: bookmark.source_platform || 'manual',
          engagement_score: bookmark.engagement_score || 0,
          is_starred: bookmark.is_starred || false,
          is_read: bookmark.is_read || false,
          is_archived: bookmark.is_archived || false,
          is_shared: bookmark.is_shared || false,
          tags: bookmark.tags || [],
          collections: bookmark.collections || ['uncategorized'],
        })
      )
    })

    it('should sanitize valid bookmark data', () => {
      const rawBookmark = {
        title: 'Test Article',
        url: 'https://example.com',
        description: 'Test description',
        content: 'Test content',
      }

      const result = sanitizeBookmark(rawBookmark)
      expect(result).not.toBeNull()
      expect(result?.title).toBe('Test Article')
      expect(result?.url).toBe('https://example.com')
    })

    it('should return null when DataProcessingService returns null', () => {
      vi.mocked(DataProcessingService.sanitizeBookmark).mockReturnValue(null)

      const result = sanitizeBookmark({ invalid: 'data' })
      expect(result).toBeNull()
    })

    it('should return null when sanitized data fails schema validation', () => {
      vi.mocked(DataProcessingService.sanitizeBookmark).mockReturnValue({
        // Invalid data - missing required fields
        title: '',
        url: 'invalid-url',
      } as any)

      const result = sanitizeBookmark({ invalid: 'data' })
      expect(result).toBeNull()
    })

    it('should call DataProcessingService.sanitizeBookmark', () => {
      const rawBookmark = { title: 'Test', url: 'https://example.com' }
      sanitizeBookmark(rawBookmark)

      expect(DataProcessingService.sanitizeBookmark).toHaveBeenCalledWith(
        rawBookmark
      )
    })
  })

  describe('extractDomain', () => {
    beforeEach(() => {
      vi.mocked(DataProcessingService.extractDomain).mockImplementation(
        (url) => {
          try {
            const urlObj = new URL(url)
            return urlObj.hostname.replace(/^www\./, '')
          } catch {
            return 'unknown'
          }
        }
      )
    })

    it('should extract domain from valid URL', () => {
      expect(extractDomain('https://example.com/path')).toBe('example.com')
      expect(extractDomain('https://test.org')).toBe('test.org')
    })

    it('should remove www prefix', () => {
      expect(extractDomain('https://www.example.com')).toBe('example.com')
    })

    it('should return "unknown" for invalid URLs', () => {
      expect(extractDomain('')).toBe('unknown')
      expect(extractDomain('not-a-url')).toBe('unknown')
    })

    it('should call DataProcessingService.extractDomain', () => {
      extractDomain('https://example.com')
      expect(DataProcessingService.extractDomain).toHaveBeenCalledWith(
        'https://example.com'
      )
    })
  })

  describe('migrateBookmarkData', () => {
    beforeEach(() => {
      vi.mocked(DataProcessingService.sanitizeBookmark).mockImplementation(
        (bookmark) => ({
          user_id: bookmark.user_id || 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description || '',
          content: bookmark.content || '',
          author: bookmark.author || 'Unknown Author',
          domain: bookmark.domain || 'example.com',
          source_platform: bookmark.source_platform || 'manual',
          engagement_score: bookmark.engagement_score || 0,
          is_starred: bookmark.is_starred || false,
          is_read: bookmark.is_read || false,
          is_archived: bookmark.is_archived || false,
          is_shared: bookmark.is_shared || false,
          is_deleted: false,
          tags: bookmark.tags || [],
          collections: bookmark.collections || ['uncategorized'],
        })
      )
    })

    it('should migrate old format bookmark to new format', () => {
      const oldBookmarks = [
        {
          id: 1,
          user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: 'Old Format',
          url: 'https://example.com',
          description: 'Old description',
          content: 'Old content',
          domain: 'example.com',
          author: 'Author',
          source_platform: 'twitter',
          engagement_score: 50,
          isStarred: true, // Old field
          is_starred: false, // New field - should be overridden
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: ['tag1'],
          collections: ['col1'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ]

      const migrated = migrateBookmarkData(oldBookmarks)

      expect(migrated).toHaveLength(1)
      expect(migrated[0].description).toBe('Old description')
      expect(migrated[0].content).toBe('Old content')
      expect(migrated[0].id).toBe(1)
    })

    it('should handle bookmark with both old and new fields', () => {
      const bookmarks = [
        {
          id: 1,
          user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: 'Mixed Format',
          url: 'https://example.com',
          description: 'New description',
          content: 'New content',
          domain: 'example.com',
          author: 'Author',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          isStarred: true,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: [],
          collections: ['uncategorized'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ]

      const migrated = migrateBookmarkData(bookmarks)

      expect(migrated).toHaveLength(1)
      expect(migrated[0].description).toBe('New description')
      expect(migrated[0].content).toBe('New content')
    })

    it('should handle bookmark with only new format fields', () => {
      const newBookmarks = [
        {
          id: 1,
          user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: 'New Format',
          url: 'https://example.com',
          description: 'Description',
          content: 'Content',
          domain: 'example.com',
          author: 'Author',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: [],
          collections: ['uncategorized'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ]

      const migrated = migrateBookmarkData(newBookmarks)

      expect(migrated).toHaveLength(1)
      expect(migrated[0].description).toBe('Description')
      expect(migrated[0].content).toBe('Content')
      expect(migrated[0].is_starred).toBe(false)
    })

    it('should preserve all other fields during migration', () => {
      const bookmarks = [
        {
          id: 1,
          user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: 'Test',
          url: 'https://example.com',
          description: 'Desc',
          content: 'Content',
          domain: 'example.com',
          author: 'Author',
          source_platform: 'manual',
          engagement_score: 75,
          is_starred: false,
          is_read: true,
          is_archived: false,
          is_shared: true,
          is_deleted: false,
          tags: ['tag1', 'tag2'],
          collections: ['col1', 'col2'],
          thumbnail_url: 'https://example.com/thumb.jpg',
          favicon_url: 'https://example.com/favicon.ico',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
        },
      ]

      const migrated = migrateBookmarkData(bookmarks)

      expect(migrated).toHaveLength(1)
      expect(migrated[0].id).toBe(1)
      expect(migrated[0].engagement_score).toBe(75)
      expect(migrated[0].is_read).toBe(true)
      expect(migrated[0].is_shared).toBe(true)
      expect(migrated[0].tags).toEqual(['tag1', 'tag2'])
      // Collections and optional URLs go through sanitization
      // The mock implementation should preserve these
      expect(migrated[0].collections).toBeDefined()
      expect(Array.isArray(migrated[0].collections)).toBe(true)
    })
  })

  describe('createBackupData', () => {
    it('should create valid backup data structure', () => {
      const bookmarks = [
        {
          id: 1,
          user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: 'Test',
          url: 'https://example.com',
          description: 'Desc',
          content: 'Content',
          author: 'Author',
          domain: 'example.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: [],
          collections: ['uncategorized'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ]

      const metadata = {
        version: '1.0.0',
        totalBookmarks: 1,
        createdAt: '2024-01-01T10:00:00Z',
        lastUpdate: '2024-01-15T10:00:00Z',
      }

      const backup = createBackupData(bookmarks, metadata)

      expect(backup).toHaveProperty('metadata')
      expect(backup).toHaveProperty('bookmarks')
      expect(backup.metadata.version).toBe('1.0.0')
      expect(backup.metadata.totalBookmarks).toBe(1)
      expect(backup.bookmarks).toEqual(bookmarks)
    })

    it('should include exportedAt timestamp', () => {
      const bookmarks = []
      const metadata = {
        version: '1.0.0',
        totalBookmarks: 0,
        createdAt: '2024-01-01T10:00:00Z',
        lastUpdate: '2024-01-15T10:00:00Z',
      }
      const backup = createBackupData(bookmarks, metadata)

      expect(backup.exportedAt).toBeDefined()
      expect(new Date(backup.exportedAt).toString()).not.toBe('Invalid Date')
      expect(backup.version).toBe('1.0.0')
    })
  })

  describe('validateImportData', () => {
    beforeEach(() => {
      vi.mocked(DataProcessingService.sanitizeBookmark).mockImplementation(
        (bookmark) => ({
          user_id: bookmark.user_id || 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description || '',
          content: bookmark.content || '',
          author: bookmark.author || 'Unknown Author',
          domain: bookmark.domain || 'example.com',
          source_platform: bookmark.source_platform || 'manual',
          engagement_score: bookmark.engagement_score || 0,
          is_starred: bookmark.is_starred || false,
          is_read: bookmark.is_read || false,
          is_archived: bookmark.is_archived || false,
          is_shared: bookmark.is_shared || false,
          is_deleted: false,
          tags: bookmark.tags || [],
          collections: bookmark.collections || ['uncategorized'],
        })
      )
    })

    const validImportData = {
      metadata: {
        version: '1.0.0',
        totalBookmarks: 1,
        createdAt: '2024-01-01T10:00:00Z',
        lastUpdate: '2024-01-15T10:00:00Z',
      },
      bookmarks: [
        {
          user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: 'Test',
          url: 'https://example.com',
          description: 'Desc',
          content: 'Content',
          author: 'Author',
          domain: 'example.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: ['tag1'],
          collections: ['col1'],
        },
      ],
    }

    it('should validate correct import data', () => {
      const result = validateImportData(validImportData)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should invalidate null or undefined data', () => {
      expect(validateImportData(null).valid).toBe(false)
      expect(validateImportData(undefined).valid).toBe(false)
      expect(validateImportData(null).errors).toContain('Invalid data format')
    })

    it('should invalidate data with non-array bookmarks', () => {
      // validateImportData checks if bookmarks is an array and adds error
      // But then continues to try filter, so need to provide an empty bookmarks array
      // or update the function logic. Let's test the intended behavior.
      const dataWithNonArrayBookmarks = {
        metadata: validImportData.metadata,
        bookmarks: 'not-an-array' as any,
      }

      const result = validateImportData(dataWithNonArrayBookmarks)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmarks must be an array')
    })

    it('should invalidate data with invalid bookmark', () => {
      vi.mocked(DataProcessingService.sanitizeBookmark).mockReturnValue(null)

      const result = validateImportData({
        ...validImportData,
        bookmarks: [{ invalid: 'bookmark' }],
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('Invalid bookmark'))).toBe(
        true
      )
    })

    it('should invalidate data with invalid metadata', () => {
      const result = validateImportData({
        ...validImportData,
        metadata: { invalid: 'metadata' },
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('Invalid metadata'))).toBe(
        true
      )
    })
  })

  describe('estimateStorageSize', () => {
    it('should estimate storage size for bookmarks', () => {
      const bookmarks = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: 'Test',
          url: 'https://example.com',
          description: 'Description',
          content: 'Content',
          author: 'Author',
          domain: 'example.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          tags: ['tag1'],
          collections: ['col1'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ]

      const size = estimateStorageSize(bookmarks)
      expect(size).toBeGreaterThan(0)
      expect(typeof size).toBe('number')
    })

    it('should return 2 for empty array (JSON.stringify([]).length)', () => {
      const size = estimateStorageSize([])
      expect(size).toBe(2) // "[]" has length 2
    })

    it('should calculate larger size for more bookmarks', () => {
      const oneBookmark = [
        {
          id: '1',
          user_id: 'user1',
          title: 'Test',
          url: 'https://example.com',
          description: '',
          content: '',
          author: 'Author',
          domain: 'example.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          tags: [],
          collections: ['uncategorized'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ]

      const twoBookmarks = [...oneBookmark, { ...oneBookmark[0], id: '2' }]

      const sizeOne = estimateStorageSize(oneBookmark)
      const sizeTwo = estimateStorageSize(twoBookmarks)

      expect(sizeTwo).toBeGreaterThan(sizeOne)
    })
  })

  describe('checkStorageQuota', () => {
    it('should check storage quota and return result', async () => {
      // Mock navigator.storage if available
      const mockEstimate = vi.fn().mockResolvedValue({
        usage: 1000000,
        quota: 10000000,
      })

      if (navigator.storage) {
        vi.spyOn(navigator.storage, 'estimate').mockImplementation(mockEstimate)
      }

      const result = await checkStorageQuota()

      expect(result).toHaveProperty('available')
      expect(result).toHaveProperty('used')
      expect(result).toHaveProperty('quota')
    })

    it('should handle unavailable storage API gracefully', async () => {
      const result = await checkStorageQuota()

      // Should return fallback values
      expect(result.available).toBeGreaterThan(0)
      expect(result.used).toBeGreaterThanOrEqual(0)
      expect(result.quota).toBeGreaterThan(0)
    })
  })

  describe('cleanupBookmarkData', () => {
    it('should remove duplicate bookmarks by URL', () => {
      const bookmarks = [
        {
          id: 1,
          user_id: 'user1',
          title: 'First',
          url: 'https://example.com',
          description: '',
          content: '',
          author: 'Author',
          domain: 'example.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: [],
          collections: ['uncategorized'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          user_id: 'user1',
          title: 'Duplicate',
          url: 'https://example.com',
          description: '',
          content: '',
          author: 'Author',
          domain: 'example.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: [],
          collections: ['uncategorized'],
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
        },
      ]

      const cleaned = cleanupBookmarkData(bookmarks)
      expect(cleaned.length).toBe(1)
      expect(cleaned[0].title).toBe('First') // Keeps first occurrence
    })

    it('should sort bookmarks by created_at date descending', () => {
      const bookmarks = [
        {
          id: 1,
          user_id: 'user1',
          title: 'Oldest',
          url: 'https://example1.com',
          description: '',
          content: '',
          author: 'Author',
          domain: 'example1.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: [],
          collections: ['uncategorized'],
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
        },
        {
          id: 2,
          user_id: 'user1',
          title: 'Newest',
          url: 'https://example2.com',
          description: '',
          content: '',
          author: 'Author',
          domain: 'example2.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: [],
          collections: ['uncategorized'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 3,
          user_id: 'user1',
          title: 'Middle',
          url: 'https://example3.com',
          description: '',
          content: '',
          author: 'Author',
          domain: 'example3.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: [],
          collections: ['uncategorized'],
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-10T10:00:00Z',
        },
      ]

      const cleaned = cleanupBookmarkData(bookmarks)
      expect(cleaned[0].title).toBe('Newest')
      expect(cleaned[1].title).toBe('Middle')
      expect(cleaned[2].title).toBe('Oldest')
    })

    it('should handle empty array', () => {
      const cleaned = cleanupBookmarkData([])
      expect(cleaned).toEqual([])
    })

    it('should preserve all data for unique bookmarks', () => {
      const bookmarks = [
        {
          id: 1,
          user_id: 'user1',
          title: 'Test 1',
          url: 'https://example1.com',
          description: 'Desc 1',
          content: 'Content 1',
          author: 'Author 1',
          domain: 'example1.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: true,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: ['tag1'],
          collections: ['col1'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          user_id: 'user1',
          title: 'Test 2',
          url: 'https://example2.com',
          description: 'Desc 2',
          content: 'Content 2',
          author: 'Author 2',
          domain: 'example2.com',
          source_platform: 'twitter',
          engagement_score: 75,
          is_starred: false,
          is_read: true,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: ['tag2'],
          collections: ['col2'],
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z',
        },
      ]

      const cleaned = cleanupBookmarkData(bookmarks)
      expect(cleaned).toHaveLength(2)
      expect(cleaned[0]).toEqual(bookmarks[1]) // Newest first
      expect(cleaned[1]).toEqual(bookmarks[0])
    })
  })

  describe('Zod Schemas', () => {
    describe('bookmarkSchema', () => {
      it('should validate complete bookmark object', () => {
        const bookmark = {
          id: 1,
          user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: 'Test',
          url: 'https://example.com',
          description: 'Description',
          content: 'Content',
          author: 'Author',
          domain: 'example.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: [],
          collections: ['uncategorized'],
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        }

        const result = bookmarkSchema.safeParse(bookmark)
        expect(result.success).toBe(true)
      })
    })

    describe('bookmarkInsertSchema', () => {
      it('should validate bookmark insert object', () => {
        const bookmarkInsert = {
          user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: 'Test',
          url: 'https://example.com',
          description: 'Description',
          content: 'Content',
          author: 'Author',
          domain: 'example.com',
          source_platform: 'manual',
          engagement_score: 50,
          is_starred: false,
          is_read: false,
          is_archived: false,
          is_shared: false,
          is_deleted: false,
          tags: [],
          collections: ['uncategorized'],
        }

        const result = bookmarkInsertSchema.safeParse(bookmarkInsert)
        expect(result.success).toBe(true)
      })
    })

    describe('appMetadataSchema', () => {
      it('should validate metadata object', () => {
        const metadata = {
          version: '1.0.0',
          totalBookmarks: 100,
          createdAt: '2024-01-01T10:00:00Z',
          lastUpdate: '2024-01-15T10:00:00Z',
        }

        const result = appMetadataSchema.safeParse(metadata)
        expect(result.success).toBe(true)
      })
    })

    describe('exportDataSchema', () => {
      it('should validate export data object', () => {
        const exportData = {
          metadata: {
            version: '1.0.0',
            totalBookmarks: 1,
            createdAt: '2024-01-01T10:00:00Z',
            lastUpdate: '2024-01-15T10:00:00Z',
          },
          bookmarks: [
            {
              id: 1,
              user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
              title: 'Test',
              url: 'https://example.com',
              description: 'Description',
              content: 'Content',
              author: 'Author',
              domain: 'example.com',
              source_platform: 'manual',
              engagement_score: 50,
              is_starred: false,
              is_read: false,
              is_archived: false,
              is_shared: false,
              is_deleted: false,
              tags: [],
              collections: ['uncategorized'],
              created_at: '2024-01-15T10:00:00Z',
              updated_at: '2024-01-15T10:00:00Z',
            },
          ],
          settings: {
            theme: 'dark',
            viewMode: 'grid',
            defaultSort: 'newest',
            showMetrics: true,
            compactMode: false,
            autoBackup: true,
            exportFormat: 'json',
          } as any,
          exportedAt: '2024-01-15T10:00:00Z',
          version: '1.0.0',
        }

        const result = exportDataSchema.safeParse(exportData)
        expect(result.success).toBe(true)
      })
    })
  })
})
