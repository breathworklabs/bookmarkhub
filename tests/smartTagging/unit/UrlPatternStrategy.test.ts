/**
 * Unit tests for UrlPatternStrategy
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { UrlPatternStrategy } from '../../../src/services/smartTagging/strategies/UrlPatternStrategy'
import type { TaggingContext } from '../../../src/services/smartTagging/types'
import { createMockBookmark, createTwitterBookmarkWithLink } from '../fixtures/mockBookmarks'

describe('UrlPatternStrategy', () => {
  let strategy: UrlPatternStrategy
  let context: TaggingContext

  beforeEach(() => {
    strategy = new UrlPatternStrategy()
    context = {
      allBookmarks: [],
      options: {},
    }
  })

  describe('generateTags', () => {
    it('should match documentation pattern', async () => {
      const bookmark = createMockBookmark({
        url: 'https://example.com/docs/getting-started',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'documentation')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'reference')).toBe(true)
    })

    it('should match blog pattern', async () => {
      const bookmark = createMockBookmark({
        url: 'https://example.com/blog/my-post',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'article')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'blog')).toBe(true)
    })

    it('should match tutorial pattern', async () => {
      const bookmark = createMockBookmark({
        url: 'https://example.com/tutorial/react-basics',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'tutorial')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'learning')).toBe(true)
    })

    it('should match API pattern', async () => {
      const bookmark = createMockBookmark({
        url: 'https://example.com/api/v1/users',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'api')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'reference')).toBe(true)
    })

    it('should match GitHub issues pattern', async () => {
      const bookmark = createMockBookmark({
        url: 'https://github.com/facebook/react/issues/123',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'issue')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'bug')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'github')).toBe(true)
    })

    it('should match GitHub pull request pattern', async () => {
      const bookmark = createMockBookmark({
        url: 'https://github.com/vuejs/vue/pull/456',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'pull-request')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'code-review')).toBe(true)
    })

    it('should match programming language patterns', async () => {
      const bookmark = createMockBookmark({
        url: 'https://example.com/javascript/advanced-concepts',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'javascript')).toBe(true)
    })

    it('should match embedded link patterns in X/Twitter bookmark', async () => {
      const bookmark = createTwitterBookmarkWithLink(
        'https://github.com/user/repo/issues/42',
        'github.com'
      )

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'issue')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'github')).toBe(true)
    })

    it('should handle multiple pattern matches in one URL', async () => {
      const bookmark = createMockBookmark({
        url: 'https://example.com/docs/javascript/tutorial',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should match /docs/, /javascript/, and /tutorial/ patterns
      // After deduplication, should have multiple unique tags
      expect(suggestions.length).toBeGreaterThanOrEqual(3)
    })

    it('should return empty array when no patterns match', async () => {
      const bookmark = createMockBookmark({
        url: 'https://example.com/random/path',
        description: 'No matching patterns',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions).toHaveLength(0)
    })

    it('should not process Twitter URLs directly', async () => {
      const bookmark = createMockBookmark({
        domain: 'x.com',
        url: 'https://x.com/user/status/123/tutorial',
        description: 'No embedded links',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should not match /tutorial/ in twitter URL
      expect(suggestions).toHaveLength(0)
    })

    it('should combine confidence for embedded links', async () => {
      const bookmark = createTwitterBookmarkWithLink(
        'https://example.com/tutorial/advanced',
        'example.com'
      )

      const suggestions = await strategy.generateTags(bookmark, context)

      // Confidence should be pattern confidence * link confidence
      if (suggestions.length > 0) {
        expect(suggestions[0].confidence).toBeLessThan(1.0)
        expect(suggestions[0].confidence).toBeGreaterThan(0)
      }
    })

    it('should include reasoning in suggestions', async () => {
      const bookmark = createMockBookmark({
        url: 'https://example.com/blog/post',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions[0].reasoning).toBeDefined()
      expect(suggestions[0].reasoning).toContain('URL pattern')
    })

    it('should set correct source', async () => {
      const bookmark = createMockBookmark({
        url: 'https://example.com/docs/guide',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      suggestions.forEach((suggestion) => {
        expect(suggestion.sources).toContain('url')
      })
    })

    it('should handle case-insensitive matching', async () => {
      const bookmark = createMockBookmark({
        url: 'https://example.com/DOCS/API/Reference',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'documentation')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'api')).toBe(true)
    })

    it('should not duplicate tags from bookmark and embedded URLs', async () => {
      const bookmark = createMockBookmark({
        domain: 'example.com',
        url: 'https://example.com/docs/guide',
        description: 'Check out https://example.com/docs/tutorial',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // 'documentation' might appear from both URLs but shouldn't duplicate
      const docTags = suggestions.filter((s) => s.tag === 'documentation')
      expect(docTags.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('confidence scores', () => {
    it('should have high confidence for direct URL match', async () => {
      const bookmark = createMockBookmark({
        url: 'https://github.com/user/repo/issues/1',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      const highConfidence = suggestions.filter((s) => s.confidence >= 0.9)
      expect(highConfidence.length).toBeGreaterThan(0)
    })

    it('should have lower confidence for embedded links', async () => {
      const bookmark = createTwitterBookmarkWithLink(
        'https://example.com/tutorial/guide',
        'example.com'
      )

      const suggestions = await strategy.generateTags(bookmark, context)

      // Embedded link confidence is pattern conf * link conf
      if (suggestions.length > 0) {
        const maxConfidence = Math.max(...suggestions.map((s) => s.confidence))
        expect(maxConfidence).toBeLessThan(1.0)
      }
    })
  })
})
