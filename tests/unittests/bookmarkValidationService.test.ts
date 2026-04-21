import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  validateUrl,
  validateBookmark,
  validateBookmarks,
  getValidationSummary,
  getInvalidBookmarks,
  loadCachedValidationResults,
  saveCachedValidationResults,
  areCachedResultsFresh,
} from '../../src/services/bookmarkValidationService'
import type { Bookmark } from '../../src/types/bookmark'
import type { ValidationResult } from '../../src/services/bookmarkValidationService'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
let localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] || null,
  setItem: (key: string, value: string) => {
    localStorageStore[key] = value
  },
  removeItem: (key: string) => {
    delete localStorageStore[key]
  },
  clear: () => {
    localStorageStore = {}
  },
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Also define on globalThis for better compatibility
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
})

describe('bookmarkValidationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('validateUrl', () => {
    describe('X/Twitter URL Handling', () => {
      it('should skip validation for x.com URLs', async () => {
        const result = await validateUrl('https://x.com/user/status/123')

        expect(result.isValid).toBe(true)
        expect(result.status).toBe(200)
        expect(result.error).toContain('Skipped')
        expect(result.error).toContain('X/Twitter')
        expect(fetch).not.toHaveBeenCalled()
      })

      it('should skip validation for twitter.com URLs', async () => {
        const result = await validateUrl('https://twitter.com/user/status/123')

        expect(result.isValid).toBe(true)
        expect(result.status).toBe(200)
        expect(result.error).toContain('X/Twitter')
        expect(fetch).not.toHaveBeenCalled()
      })

      it('should skip validation for mobile Twitter URLs', async () => {
        const result = await validateUrl('https://mobile.twitter.com/user')

        expect(result.isValid).toBe(true)
        expect(fetch).not.toHaveBeenCalled()
      })
    })

    describe('Successful Validation', () => {
      it('should validate accessible URLs', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
          new Response(null, { status: 200 })
        )

        const result = await validateUrl('https://example.com')

        expect(result.isValid).toBe(true)
        expect(result.status).toBe(200)
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('corsproxy.io'),
          expect.objectContaining({ method: 'HEAD' })
        )
      })

      it('should use HEAD request by default', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
          new Response(null, { status: 200 })
        )

        await validateUrl('https://example.com')

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('corsproxy.io'),
          expect.objectContaining({ method: 'HEAD' })
        )
      })

      it('should route requests through CORS proxy', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
          new Response(null, { status: 200 })
        )

        await validateUrl('https://example.com')

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(encodeURIComponent('https://example.com')),
          expect.anything()
        )
      })
    })

    describe('Fallback to GET Request', () => {
      it('should fallback to GET if HEAD fails', async () => {
        vi.mocked(fetch)
          .mockRejectedValueOnce(new Error('HEAD not supported'))
          .mockResolvedValueOnce(new Response(null, { status: 200 }))

        const result = await validateUrl('https://example.com')

        expect(result.isValid).toBe(true)
        expect(fetch).toHaveBeenCalledTimes(2)
        expect(fetch).toHaveBeenNthCalledWith(
          1,
          expect.stringContaining('corsproxy.io'),
          expect.objectContaining({ method: 'HEAD' })
        )
        expect(fetch).toHaveBeenNthCalledWith(
          2,
          expect.stringContaining('corsproxy.io'),
          expect.objectContaining({ method: 'GET' })
        )
      })

      it('should return error if both HEAD and GET fail', async () => {
        vi.mocked(fetch)
          .mockRejectedValueOnce(new Error('HEAD failed'))
          .mockRejectedValueOnce(new Error('GET failed'))

        const result = await validateUrl('https://example.com')

        expect(result.isValid).toBe(false)
        expect(result.error).toBe('GET failed')
        expect(fetch).toHaveBeenCalledTimes(2)
      })

      it('should detect HTTP error responses', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
          new Response(null, { status: 404 })
        )

        const result = await validateUrl('https://example.com/gone')

        expect(result.isValid).toBe(false)
        expect(result.status).toBe(404)
        expect(result.error).toBe('HTTP 404')
      })

      it('should treat 500 as invalid', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
          new Response(null, { status: 500 })
        )

        const result = await validateUrl('https://example.com/error')

        expect(result.isValid).toBe(false)
        expect(result.status).toBe(500)
      })
    })

    describe('Timeout Handling', () => {
      it('should timeout after 10 seconds for HEAD request', async () => {
        // Use real timers for this test
        vi.useRealTimers()

        const abortError = new Error('AbortError')
        abortError.name = 'AbortError'

        vi.mocked(fetch).mockImplementation(
          (url, options) =>
            new Promise((_, reject) => {
              // Simulate the abort signal timing out
              if (options?.signal) {
                options.signal.addEventListener('abort', () =>
                  reject(abortError)
                )
              }
              // Never resolve - let the timeout trigger
            })
        )

        const result = await validateUrl('https://slow-site.com')

        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Request timeout')

        // Restore fake timers for other tests
        vi.useFakeTimers()
      }, 15000)

      it('should clear timeout on successful request', async () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
        vi.mocked(fetch).mockResolvedValueOnce(
          new Response(null, { status: 200 })
        )

        await validateUrl('https://example.com')

        expect(clearTimeoutSpy).toHaveBeenCalled()
      })
    })

    describe('Error Handling', () => {
      it('should handle network errors', async () => {
        vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

        const result = await validateUrl('https://example.com')

        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Network error')
      })

      it('should handle non-Error exceptions', async () => {
        vi.mocked(fetch).mockRejectedValue('String error')

        const result = await validateUrl('https://example.com')

        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Unknown error')
      })

      it('should handle fetch rejection in outer catch', async () => {
        vi.mocked(fetch).mockImplementation(() => {
          throw new Error('Outer error')
        })

        const result = await validateUrl('https://example.com')

        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Outer error')
      })
    })
  })

  describe('validateBookmark', () => {
    const createMockBookmark = (id: number, url: string): Bookmark => ({
      id,
      user_id: 'test-user',
      title: 'Test Bookmark',
      url,
      description: 'Test description',
      content: 'Test content',
      author: 'Test Author',
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
    })

    it('should validate a bookmark successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(null, { status: 200 })
      )
      const bookmark = createMockBookmark(1, 'https://example.com')

      const result = await validateBookmark(bookmark)

      expect(result.id).toBe(1)
      expect(result.url).toBe('https://example.com')
      expect(result.isValid).toBe(true)
      expect(result.status).toBe(200)
      expect(result.checkedAt).toBeInstanceOf(Date)
    })

    it('should return validation result with error for invalid bookmark', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Not found'))
      const bookmark = createMockBookmark(2, 'https://invalid.com')

      const result = await validateBookmark(bookmark)

      expect(result.id).toBe(2)
      expect(result.url).toBe('https://invalid.com')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should include timestamp in validation result', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(null, { status: 200 })
      )
      const bookmark = createMockBookmark(3, 'https://example.com')
      const now = new Date('2024-01-15T10:00:00Z')
      vi.setSystemTime(now)

      const result = await validateBookmark(bookmark)

      expect(result.checkedAt).toEqual(now)
    })

    it('should handle Twitter/X bookmark URLs', async () => {
      const bookmark = createMockBookmark(4, 'https://x.com/user/status/123')

      const result = await validateBookmark(bookmark)

      expect(result.isValid).toBe(true)
      expect(result.error).toContain('Skipped')
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('validateBookmarks', () => {
    const createMockBookmarks = (count: number): Bookmark[] => {
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        user_id: 'test-user',
        title: `Bookmark ${i + 1}`,
        url: `https://example${i + 1}.com`,
        description: `Description ${i + 1}`,
        content: `Content ${i + 1}`,
        author: 'Author',
        domain: `example${i + 1}.com`,
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
      }))
    }

    it('should validate multiple bookmarks', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))
      const bookmarks = createMockBookmarks(3)

      const results = await validateBookmarks(bookmarks)

      expect(results).toHaveLength(3)
      expect(results[0].id).toBe(1)
      expect(results[1].id).toBe(2)
      expect(results[2].id).toBe(3)
    })

    it('should process bookmarks in batches with default concurrency', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))
      const bookmarks = createMockBookmarks(12)

      await validateBookmarks(bookmarks)

      // With default concurrency of 5, should process in batches
      // Can't directly test Promise.all calls, but can verify all were processed
      expect(fetch).toHaveBeenCalledTimes(12)
    })

    it('should respect custom concurrency limit', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))
      const bookmarks = createMockBookmarks(10)

      await validateBookmarks(bookmarks, undefined, 2)

      // Should process 10 bookmarks with concurrency of 2
      expect(fetch).toHaveBeenCalledTimes(10)
    })

    it('should call onProgress callback', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))
      const bookmarks = createMockBookmarks(7)
      const onProgress = vi.fn()

      await validateBookmarks(bookmarks, onProgress, 3)

      // Should call onProgress for each batch: 3, 6, 7
      expect(onProgress).toHaveBeenCalledTimes(3)
      expect(onProgress).toHaveBeenNthCalledWith(1, 3, 7)
      expect(onProgress).toHaveBeenNthCalledWith(2, 6, 7)
      expect(onProgress).toHaveBeenNthCalledWith(3, 7, 7)
    })

    it('should handle mix of valid and invalid bookmarks', async () => {
      vi.mocked(fetch).mockImplementation((url: any) => {
        if (typeof url === 'string' && url.includes('example2.com')) {
          return Promise.resolve(new Response(null, { status: 404 }))
        }
        return Promise.resolve(new Response(null, { status: 200 }))
      })

      const bookmarks = createMockBookmarks(3)

      const results = await validateBookmarks(bookmarks)

      expect(results).toHaveLength(3)
      expect(results[0].isValid).toBe(true)
      expect(results[1].isValid).toBe(false)
      expect(results[2].isValid).toBe(true)
    })

    it('should handle empty bookmark array', async () => {
      const results = await validateBookmarks([])

      expect(results).toHaveLength(0)
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should handle single bookmark', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))
      const bookmarks = createMockBookmarks(1)

      const results = await validateBookmarks(bookmarks)

      expect(results).toHaveLength(1)
      expect(results[0].id).toBe(1)
    })
  })

  describe('getValidationSummary', () => {
    const createMockResults = (): ValidationResult[] => [
      {
        id: 1,
        url: 'https://example1.com',
        isValid: true,
        status: 200,
        checkedAt: new Date(),
      },
      {
        id: 2,
        url: 'https://example2.com',
        isValid: false,
        error: 'Not found',
        checkedAt: new Date(),
      },
      {
        id: 3,
        url: 'https://example3.com',
        isValid: true,
        status: 200,
        checkedAt: new Date(),
      },
      {
        id: 4,
        url: 'https://example4.com',
        isValid: false,
        error: 'Timeout',
        checkedAt: new Date(),
      },
    ]

    it('should calculate correct summary statistics', () => {
      const results = createMockResults()

      const summary = getValidationSummary(results)

      expect(summary.total).toBe(4)
      expect(summary.valid).toBe(2)
      expect(summary.invalid).toBe(2)
      expect(summary.pending).toBe(0)
      expect(summary.results).toEqual(results)
    })

    it('should handle all valid results', () => {
      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example1.com',
          isValid: true,
          status: 200,
          checkedAt: new Date(),
        },
        {
          id: 2,
          url: 'https://example2.com',
          isValid: true,
          status: 200,
          checkedAt: new Date(),
        },
      ]

      const summary = getValidationSummary(results)

      expect(summary.total).toBe(2)
      expect(summary.valid).toBe(2)
      expect(summary.invalid).toBe(0)
    })

    it('should handle all invalid results', () => {
      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example1.com',
          isValid: false,
          error: 'Error 1',
          checkedAt: new Date(),
        },
        {
          id: 2,
          url: 'https://example2.com',
          isValid: false,
          error: 'Error 2',
          checkedAt: new Date(),
        },
      ]

      const summary = getValidationSummary(results)

      expect(summary.total).toBe(2)
      expect(summary.valid).toBe(0)
      expect(summary.invalid).toBe(2)
    })

    it('should handle empty results array', () => {
      const summary = getValidationSummary([])

      expect(summary.total).toBe(0)
      expect(summary.valid).toBe(0)
      expect(summary.invalid).toBe(0)
      expect(summary.pending).toBe(0)
      expect(summary.results).toEqual([])
    })
  })

  describe('getInvalidBookmarks', () => {
    const createMockBookmarks = (): Bookmark[] => [
      {
        id: 1,
        user_id: 'test-user',
        title: 'Bookmark 1',
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
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 2,
        user_id: 'test-user',
        title: 'Bookmark 2',
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
        user_id: 'test-user',
        title: 'Bookmark 3',
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
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      },
    ]

    it('should return only invalid bookmarks', () => {
      const bookmarks = createMockBookmarks()
      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example1.com',
          isValid: false,
          error: 'Not found',
          checkedAt: new Date(),
        },
        {
          id: 2,
          url: 'https://example2.com',
          isValid: true,
          status: 200,
          checkedAt: new Date(),
        },
        {
          id: 3,
          url: 'https://example3.com',
          isValid: false,
          error: 'Timeout',
          checkedAt: new Date(),
        },
      ]

      const invalid = getInvalidBookmarks(bookmarks, results)

      expect(invalid).toHaveLength(2)
      expect(invalid[0].id).toBe(1)
      expect(invalid[1].id).toBe(3)
    })

    it('should return empty array if all bookmarks are valid', () => {
      const bookmarks = createMockBookmarks()
      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example1.com',
          isValid: true,
          status: 200,
          checkedAt: new Date(),
        },
        {
          id: 2,
          url: 'https://example2.com',
          isValid: true,
          status: 200,
          checkedAt: new Date(),
        },
        {
          id: 3,
          url: 'https://example3.com',
          isValid: true,
          status: 200,
          checkedAt: new Date(),
        },
      ]

      const invalid = getInvalidBookmarks(bookmarks, results)

      expect(invalid).toHaveLength(0)
    })

    it('should return all bookmarks if all are invalid', () => {
      const bookmarks = createMockBookmarks()
      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example1.com',
          isValid: false,
          error: 'Error 1',
          checkedAt: new Date(),
        },
        {
          id: 2,
          url: 'https://example2.com',
          isValid: false,
          error: 'Error 2',
          checkedAt: new Date(),
        },
        {
          id: 3,
          url: 'https://example3.com',
          isValid: false,
          error: 'Error 3',
          checkedAt: new Date(),
        },
      ]

      const invalid = getInvalidBookmarks(bookmarks, results)

      expect(invalid).toHaveLength(3)
    })

    it('should handle empty inputs', () => {
      const invalid = getInvalidBookmarks([], [])

      expect(invalid).toHaveLength(0)
    })
  })

  describe('loadCachedValidationResults', () => {
    it('should load cached results from localStorage', () => {
      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example.com',
          isValid: true,
          status: 200,
          checkedAt: new Date('2024-01-15T10:00:00Z'),
        },
      ]

      localStorageMock.setItem(
        'x-bookmark-validation-results',
        JSON.stringify(results)
      )

      const loaded = loadCachedValidationResults()

      expect(loaded).toHaveLength(1)
      expect(loaded[0].id).toBe(1)
      expect(loaded[0].url).toBe('https://example.com')
      expect(loaded[0].isValid).toBe(true)
      expect(loaded[0].checkedAt).toBeInstanceOf(Date)
    })

    it('should convert date strings to Date objects', () => {
      const dateString = '2024-01-15T10:00:00Z'
      localStorageMock.setItem(
        'x-bookmark-validation-results',
        JSON.stringify([
          {
            id: 1,
            url: 'https://example.com',
            isValid: true,
            checkedAt: dateString,
          },
        ])
      )

      const loaded = loadCachedValidationResults()

      expect(loaded[0].checkedAt).toBeInstanceOf(Date)
      expect(loaded[0].checkedAt).toEqual(new Date(dateString))
    })

    it('should return empty array if no cached data exists', () => {
      const loaded = loadCachedValidationResults()

      expect(loaded).toEqual([])
    })

    it('should handle JSON parse errors', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      localStorageMock.setItem('x-bookmark-validation-results', 'invalid json')

      const loaded = loadCachedValidationResults()

      expect(loaded).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('saveCachedValidationResults', () => {
    it('should save results to localStorage', () => {
      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example.com',
          isValid: true,
          status: 200,
          checkedAt: new Date('2024-01-15T10:00:00Z'),
        },
      ]

      saveCachedValidationResults(results)

      const saved = localStorageMock.getItem('x-bookmark-validation-results')
      expect(saved).toBeDefined()
      expect(JSON.parse(saved!)).toHaveLength(1)
    })

    it('should handle localStorage errors', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const setItemSpy = vi
        .spyOn(localStorageMock, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage full')
        })

      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example.com',
          isValid: true,
          checkedAt: new Date(),
        },
      ]

      saveCachedValidationResults(results)

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
      setItemSpy.mockRestore()
    })

    it('should serialize Date objects correctly', () => {
      const now = new Date('2024-01-15T10:00:00Z')
      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example.com',
          isValid: true,
          checkedAt: now,
        },
      ]

      saveCachedValidationResults(results)

      const saved = localStorageMock.getItem('x-bookmark-validation-results')
      expect(saved).not.toBeNull()
      const parsed = JSON.parse(saved!)
      expect(parsed[0].checkedAt).toBe(now.toISOString())
    })
  })

  describe('areCachedResultsFresh', () => {
    it('should return true for results checked within 24 hours', () => {
      const now = new Date('2024-01-15T10:00:00Z')
      vi.setSystemTime(now)

      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example.com',
          isValid: true,
          checkedAt: new Date('2024-01-15T08:00:00Z'), // 2 hours ago
        },
      ]

      expect(areCachedResultsFresh(results)).toBe(true)
    })

    it('should return false for results checked more than 24 hours ago', () => {
      const now = new Date('2024-01-15T10:00:00Z')
      vi.setSystemTime(now)

      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example.com',
          isValid: true,
          checkedAt: new Date('2024-01-14T09:00:00Z'), // 25 hours ago
        },
      ]

      expect(areCachedResultsFresh(results)).toBe(false)
    })

    it('should check the oldest result in the array', () => {
      const now = new Date('2024-01-15T10:00:00Z')
      vi.setSystemTime(now)

      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example1.com',
          isValid: true,
          checkedAt: new Date('2024-01-15T09:00:00Z'), // 1 hour ago
        },
        {
          id: 2,
          url: 'https://example2.com',
          isValid: true,
          checkedAt: new Date('2024-01-14T09:00:00Z'), // 25 hours ago (oldest)
        },
        {
          id: 3,
          url: 'https://example3.com',
          isValid: true,
          checkedAt: new Date('2024-01-15T08:00:00Z'), // 2 hours ago
        },
      ]

      // Should be false because oldest result is more than 24 hours old
      expect(areCachedResultsFresh(results)).toBe(false)
    })

    it('should return false for empty results array', () => {
      expect(areCachedResultsFresh([])).toBe(false)
    })

    it('should return true for results checked exactly 23 hours ago', () => {
      const now = new Date('2024-01-15T10:00:00Z')
      vi.setSystemTime(now)

      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example.com',
          isValid: true,
          checkedAt: new Date('2024-01-14T11:00:00Z'), // 23 hours ago
        },
      ]

      expect(areCachedResultsFresh(results)).toBe(true)
    })

    it('should handle single result', () => {
      const now = new Date('2024-01-15T10:00:00Z')
      vi.setSystemTime(now)

      const results: ValidationResult[] = [
        {
          id: 1,
          url: 'https://example.com',
          isValid: true,
          checkedAt: new Date('2024-01-15T09:00:00Z'),
        },
      ]

      expect(areCachedResultsFresh(results)).toBe(true)
    })
  })
})
