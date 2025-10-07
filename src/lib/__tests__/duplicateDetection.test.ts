import { describe, it, expect } from 'vitest'
import {
  normalizeUrl,
  normalizeTitle,
  calculateSimilarity,
  detectDuplicate,
  findUrlDuplicates
} from '../duplicateDetection'
import type { Bookmark } from '../../types/bookmark'

const createMockBookmark = (overrides: Partial<Bookmark> = {}): Bookmark => ({
  id: 1,
  user_id: 'test-user',
  title: 'Test Bookmark',
  url: 'https://example.com/article',
  description: 'Test description',
  content: 'Test content',
  author: 'Test Author',
  domain: 'example.com',
  source_platform: 'manual',
  engagement_score: 0,
  is_starred: false,
  is_read: false,
  is_archived: false,
  tags: [],
  collections: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

describe('duplicateDetection', () => {
  describe('normalizeUrl', () => {
    it('should normalize URLs by removing trailing slashes', () => {
      expect(normalizeUrl('https://example.com/')).toBe('https://example.com')
      expect(normalizeUrl('https://example.com')).toBe('https://example.com')
    })

    it('should remove query parameters', () => {
      expect(normalizeUrl('https://example.com/page?utm_source=test')).toBe('https://example.com/page')
    })

    it('should remove hash fragments', () => {
      expect(normalizeUrl('https://example.com/page#section')).toBe('https://example.com/page')
    })

    it('should lowercase URLs', () => {
      expect(normalizeUrl('HTTPS://EXAMPLE.COM/Page')).toBe('https://example.com/page')
    })
  })

  describe('normalizeTitle', () => {
    it('should lowercase and trim titles', () => {
      expect(normalizeTitle('  Test Title  ')).toBe('test title')
    })

    it('should normalize multiple spaces', () => {
      expect(normalizeTitle('Test    Title')).toBe('test title')
    })
  })

  describe('calculateSimilarity', () => {
    it('should return 100 for identical strings', () => {
      expect(calculateSimilarity('test', 'test')).toBe(100)
    })

    it('should return 0 for completely different strings', () => {
      const similarity = calculateSimilarity('abc', 'xyz')
      expect(similarity).toBeLessThan(50)
    })

    it('should return high similarity for nearly identical strings', () => {
      const similarity = calculateSimilarity('Hello World', 'Hello Worlds')
      expect(similarity).toBeGreaterThan(85)
    })
  })

  describe('detectDuplicate', () => {
    it('should detect exact URL duplicates', () => {
      const existing = createMockBookmark({
        id: 1,
        url: 'https://example.com/article',
        title: 'Article'
      })

      const newBookmark = {
        ...createMockBookmark({
          url: 'https://example.com/article',
          title: 'Different Title'
        })
      }

      const result = detectDuplicate(newBookmark, [existing])

      expect(result.isDuplicate).toBe(true)
      expect(result.matches.length).toBe(1)
      expect(result.matches[0].matchType).toBe('url')
    })

    it('should detect exact title and URL match', () => {
      const existing = createMockBookmark({
        id: 1,
        url: 'https://example.com/article',
        title: 'Same Title'
      })

      const newBookmark = {
        ...createMockBookmark({
          url: 'https://example.com/article',
          title: 'Same Title'
        })
      }

      const result = detectDuplicate(newBookmark, [existing])

      expect(result.isDuplicate).toBe(true)
      expect(result.matches.length).toBe(1)
      expect(result.matches[0].matchType).toBe('exact')
    })

    it('should detect similar titles', () => {
      const existing = createMockBookmark({
        id: 1,
        url: 'https://example.com/different',
        title: 'How to Build a React Application'
      })

      const newBookmark = {
        ...createMockBookmark({
          url: 'https://another-site.com/page',
          title: 'How to Build a React Applications'
        })
      }

      const result = detectDuplicate(newBookmark, [existing])

      expect(result.isDuplicate).toBe(true)
      expect(result.matches.length).toBe(1)
      expect(result.matches[0].matchType).toBe('similar')
      expect(result.matches[0].similarity).toBeGreaterThan(85)
    })

    it('should handle URLs with different query parameters', () => {
      const existing = createMockBookmark({
        id: 1,
        url: 'https://example.com/article?ref=twitter',
        title: 'Article'
      })

      const newBookmark = {
        ...createMockBookmark({
          url: 'https://example.com/article?ref=facebook',
          title: 'Article'
        })
      }

      const result = detectDuplicate(newBookmark, [existing])

      expect(result.isDuplicate).toBe(true)
      expect(result.matches[0].matchType).toBe('exact')
    })

    it('should not detect duplicates for different URLs and titles', () => {
      const existing = createMockBookmark({
        id: 1,
        url: 'https://example.com/article1',
        title: 'First Article'
      })

      const newBookmark = {
        ...createMockBookmark({
          url: 'https://example.com/article2',
          title: 'Second Article'
        })
      }

      const result = detectDuplicate(newBookmark, [existing])

      expect(result.isDuplicate).toBe(false)
      expect(result.matches.length).toBe(0)
    })

    it('should return multiple matches when multiple duplicates exist', () => {
      const existing = [
        createMockBookmark({ id: 1, url: 'https://example.com/article', title: 'Article 1' }),
        createMockBookmark({ id: 2, url: 'https://example.com/article', title: 'Article 2' }),
        createMockBookmark({ id: 3, url: 'https://other.com/page', title: 'Article 1' })
      ]

      const newBookmark = {
        ...createMockBookmark({
          url: 'https://example.com/article',
          title: 'Article 1'
        })
      }

      const result = detectDuplicate(newBookmark, existing)

      expect(result.isDuplicate).toBe(true)
      expect(result.matches.length).toBeGreaterThan(1)
    })
  })

  describe('findUrlDuplicates', () => {
    it('should find all bookmarks with the same URL', () => {
      const bookmarks = [
        createMockBookmark({ id: 1, url: 'https://example.com/article' }),
        createMockBookmark({ id: 2, url: 'https://example.com/article?ref=twitter' }),
        createMockBookmark({ id: 3, url: 'https://other.com/page' })
      ]

      const duplicates = findUrlDuplicates('https://example.com/article', bookmarks)

      expect(duplicates.length).toBe(2)
      expect(duplicates.map(b => b.id)).toContain(1)
      expect(duplicates.map(b => b.id)).toContain(2)
    })

    it('should return empty array when no duplicates exist', () => {
      const bookmarks = [
        createMockBookmark({ id: 1, url: 'https://example.com/article1' }),
        createMockBookmark({ id: 2, url: 'https://example.com/article2' })
      ]

      const duplicates = findUrlDuplicates('https://example.com/article3', bookmarks)

      expect(duplicates.length).toBe(0)
    })
  })
})
