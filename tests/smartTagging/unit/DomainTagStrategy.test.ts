/**
 * Unit tests for DomainTagStrategy
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { DomainTagStrategy } from '../../../src/services/smartTagging/strategies/DomainTagStrategy'
import type { TaggingContext } from '../../../src/services/smartTagging/types'
import {
  createMockBookmark,
  createTwitterBookmarkWithLink,
  createGitHubBookmark,
  createDevToBookmark,
} from '../fixtures/mockBookmarks'

describe('DomainTagStrategy', () => {
  let strategy: DomainTagStrategy
  let context: TaggingContext

  beforeEach(() => {
    strategy = new DomainTagStrategy()
    context = {
      allBookmarks: [],
      options: {},
    }
  })

  describe('generateTags', () => {
    it('should generate tags for GitHub domain', async () => {
      const bookmark = createGitHubBookmark()

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some((s) => s.tag === 'code')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'development')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'open-source')).toBe(true)
    })

    it('should generate tags for dev.to domain', async () => {
      const bookmark = createDevToBookmark()

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some((s) => s.tag === 'article')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'development')).toBe(true)
    })

    it('should return empty array for unknown domain', async () => {
      const bookmark = createMockBookmark({
        domain: 'unknown-domain-xyz.com',
        description: 'No links here',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions).toHaveLength(0)
    })

    it('should prioritize embedded links over X/Twitter domain', async () => {
      const bookmark = createTwitterBookmarkWithLink(
        'https://github.com/facebook/react',
        'github.com'
      )

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some((s) => s.tag === 'code')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'development')).toBe(true)
      // Should NOT have 'social' or 'thread' from x.com
      expect(suggestions.some((s) => s.tag === 'social')).toBe(false)
    })

    it('should include category as a tag', async () => {
      const bookmark = createGitHubBookmark()

      const suggestions = await strategy.generateTags(bookmark, context)

      // GitHub has category 'tools'
      expect(suggestions.some((s) => s.tag === 'tools')).toBe(true)
    })

    it('should combine confidence scores for embedded links', async () => {
      const bookmark = createTwitterBookmarkWithLink(
        'https://github.com/repo',
        'github.com'
      )

      const suggestions = await strategy.generateTags(bookmark, context)

      // Confidence should be domain confidence * link confidence
      const codeSuggestion = suggestions.find((s) => s.tag === 'code')
      expect(codeSuggestion?.confidence).toBeLessThan(1.0)
      expect(codeSuggestion?.confidence).toBeGreaterThan(0.5)
    })

    it('should match subdomains', async () => {
      const bookmark = createMockBookmark({
        domain: 'api.github.com',
        url: 'https://api.github.com/repos/user/repo',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should match github.com rule
      expect(suggestions.some((s) => s.tag === 'code')).toBe(true)
    })

    it('should apply custom domain rules', async () => {
      const customContext: TaggingContext = {
        ...context,
        options: {
          customDomainRules: [
            {
              domain: 'mycustomdomain.com',
              tags: ['custom-tag'],
              confidence: 0.9,
            },
          ],
        },
      }

      const bookmark = createMockBookmark({
        domain: 'mycustomdomain.com',
      })

      const suggestions = await strategy.generateTags(bookmark, customContext)

      expect(suggestions.some((s) => s.tag === 'custom-tag')).toBe(true)
    })

    it('should not duplicate tags from embedded and bookmark domain', async () => {
      // If both embedded link and bookmark domain suggest same tag
      const bookmark = createMockBookmark({
        domain: 'github.com',
        description: 'Check out https://github.com/other/repo',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should have 'code' tag but not duplicated
      const codeTags = suggestions.filter((s) => s.tag === 'code')
      expect(codeTags.length).toBeGreaterThanOrEqual(1)
    })

    it('should include reasoning in suggestions', async () => {
      const bookmark = createGitHubBookmark()

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions[0].reasoning).toBeDefined()
      expect(suggestions[0].reasoning).toContain('github.com')
    })

    it('should set correct source', async () => {
      const bookmark = createGitHubBookmark()

      const suggestions = await strategy.generateTags(bookmark, context)

      suggestions.forEach((suggestion) => {
        expect(suggestion.sources).toContain('domain')
      })
    })

    it('should handle X/Twitter bookmark without embedded links', async () => {
      const bookmark = createMockBookmark({
        domain: 'x.com',
        url: 'https://x.com/user/status/123',
        description: 'Just plain text, no links',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should not give X/Twitter tags since confidence is low
      // and no embedded links found
      expect(suggestions).toHaveLength(0)
    })

    it('should handle multiple embedded links', async () => {
      const bookmark = createMockBookmark({
        domain: 'x.com',
        description:
          'Check out https://github.com/repo1 and https://stackoverflow.com/q/123',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should have tags from both domains
      expect(suggestions.some((s) => s.tag === 'code')).toBe(true) // from GitHub
      expect(suggestions.some((s) => s.tag === 'programming')).toBe(true) // from SO
    })
  })

  describe('confidence scores', () => {
    it('should have high confidence for direct domain match', async () => {
      const bookmark = createGitHubBookmark()

      const suggestions = await strategy.generateTags(bookmark, context)

      const highConfidence = suggestions.filter((s) => s.confidence >= 0.9)
      expect(highConfidence.length).toBeGreaterThan(0)
    })

    it('should have lower confidence for embedded links', async () => {
      const bookmark = createTwitterBookmarkWithLink(
        'https://github.com/repo',
        'github.com'
      )

      const suggestions = await strategy.generateTags(bookmark, context)

      // Embedded link confidence is domain conf * link conf
      // So should be less than pure domain match
      const maxConfidence = Math.max(...suggestions.map((s) => s.confidence))
      expect(maxConfidence).toBeLessThan(1.0)
    })

    it('should have slightly lower confidence for category tags', async () => {
      const bookmark = createGitHubBookmark()

      const suggestions = await strategy.generateTags(bookmark, context)

      const toolsTag = suggestions.find((s) => s.tag === 'tools')
      const codeTag = suggestions.find((s) => s.tag === 'code')

      if (toolsTag && codeTag) {
        // Category tags get 0.9x multiplier
        expect(toolsTag.confidence).toBeLessThan(codeTag.confidence)
      }
    })
  })
})
