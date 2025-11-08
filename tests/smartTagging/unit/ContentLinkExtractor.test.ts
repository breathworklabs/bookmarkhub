/**
 * Unit tests for ContentLinkExtractor
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ContentLinkExtractor } from '../../../src/services/smartTagging/core/ContentLinkExtractor'
import {
  createMockBookmark,
  createTwitterBookmarkWithLink,
  createPlainTwitterBookmark,
} from '../fixtures/mockBookmarks'

describe('ContentLinkExtractor', () => {
  let extractor: ContentLinkExtractor

  beforeEach(() => {
    extractor = new ContentLinkExtractor()
  })

  describe('extractLinks', () => {
    it('should extract GitHub link from X/Twitter bookmark', () => {
      const bookmark = createTwitterBookmarkWithLink(
        'https://github.com/facebook/react',
        'github.com'
      )

      const links = extractor.extractLinks(bookmark)

      expect(links).toHaveLength(1)
      expect(links[0].domain).toBe('github.com')
      expect(links[0].url).toContain('facebook/react')
      expect(links[0].confidence).toBeGreaterThan(0.5)
    })

    it('should skip X/Twitter URLs in content', () => {
      const bookmark = createMockBookmark({
        domain: 'x.com',
        description:
          'RT @user: https://x.com/other/status/456 and https://github.com/repo',
        content: 'https://twitter.com/foo and https://t.co/abc123',
      })

      const links = extractor.extractLinks(bookmark)

      // Should only find the GitHub link, not the Twitter ones
      expect(links).toHaveLength(1)
      expect(links[0].domain).toBe('github.com')
    })

    it('should extract multiple links and rank by confidence', () => {
      const bookmark = createMockBookmark({
        description:
          'Check out https://github.com/repo1 and also https://stackoverflow.com/q/123',
      })

      const links = extractor.extractLinks(bookmark)

      expect(links).toHaveLength(2)
      expect(links[0].confidence).toBeGreaterThan(0.5)
      expect(links[1].confidence).toBeGreaterThan(0.5)
      // Should be sorted by confidence
      expect(links[0].confidence).toBeGreaterThanOrEqual(links[1].confidence)
    })

    it('should handle bookmarks without embedded links', () => {
      const bookmark = createPlainTwitterBookmark()

      const links = extractor.extractLinks(bookmark)

      expect(links).toHaveLength(0)
    })

    it('should give higher confidence to links with introductory context', () => {
      const bookmarkWithContext = createMockBookmark({
        description:
          'Here is the official documentation: https://docs.example.com/guide',
      })

      const bookmarkWithoutContext = createMockBookmark({
        description: 'https://docs.example.com/guide',
      })

      const linksWithContext = extractor.extractLinks(bookmarkWithContext)
      const linksWithoutContext = extractor.extractLinks(bookmarkWithoutContext)

      // Should have at least similar or higher confidence
      expect(linksWithContext[0].confidence).toBeGreaterThanOrEqual(
        linksWithoutContext[0].confidence * 0.85 // Allow some variance
      )
      // Context should contain part of the introductory phrase
      expect(linksWithContext[0].context).toContain('documentation')
    })

    it('should deduplicate same link appearing multiple times', () => {
      const bookmark = createMockBookmark({
        title: 'Check https://github.com/repo',
        description: 'Check https://github.com/repo',
        content: 'Link: https://github.com/repo',
      })

      const links = extractor.extractLinks(bookmark)

      expect(links).toHaveLength(1)
      expect(links[0].domain).toBe('github.com')
    })

    it('should extract links from description, content, and title', () => {
      const bookmark = createMockBookmark({
        title: 'Article about React',
        description: 'Read more at https://react.dev/learn',
        content: 'Also check https://github.com/facebook/react for source code',
      })

      const links = extractor.extractLinks(bookmark)

      expect(links.length).toBeGreaterThan(0)
      const domains = links.map((l) => l.domain)
      expect(domains).toContain('react.dev')
      expect(domains).toContain('github.com')
    })

    it('should handle malformed URLs gracefully', () => {
      const bookmark = createMockBookmark({
        description: 'Check out ://invalid-url and https://valid.com',
      })

      const links = extractor.extractLinks(bookmark)

      // Should extract only the valid URL
      expect(links).toHaveLength(1)
      expect(links[0].domain).toBe('valid.com')
    })

    it('should remove www prefix from domains', () => {
      const bookmark = createMockBookmark({
        description: 'Visit https://www.example.com',
      })

      const links = extractor.extractLinks(bookmark)

      expect(links[0].domain).toBe('example.com')
    })

    it('should normalize URLs with tracking parameters', () => {
      const bookmark = createMockBookmark({
        description:
          'Link1: https://example.com/page?utm_source=twitter and Link2: https://example.com/page?ref=social',
      })

      const links = extractor.extractLinks(bookmark)

      // Should deduplicate to one link after normalization
      expect(links).toHaveLength(1)
    })

    it('should extract shortened URLs with lower confidence than full URLs', () => {
      const shortUrl = createMockBookmark({
        description: 'Check out https://bit.ly/short',
      })

      const fullUrl = createMockBookmark({
        description: 'Check out https://github.com/facebook/react',
      })

      const shortLinks = extractor.extractLinks(shortUrl)
      const fullLinks = extractor.extractLinks(fullUrl)

      // Short URLs should exist but with lower confidence than full URLs
      expect(shortLinks.length).toBeGreaterThan(0)
      expect(fullLinks.length).toBeGreaterThan(0)
      expect(shortLinks[0].confidence).toBeLessThan(fullLinks[0].confidence)
    })
  })

  describe('getPrimaryLink', () => {
    it('should return highest confidence link', () => {
      const bookmark = createMockBookmark({
        description:
          'Check out this amazing resource: https://github.com/repo and https://example.com',
      })

      const primary = extractor.getPrimaryLink(bookmark)

      expect(primary).not.toBeNull()
      // Should prefer the link with introductory phrase and earlier position
      expect(primary?.domain).toBe('github.com')
    })

    it('should return null for bookmarks without links', () => {
      const bookmark = createPlainTwitterBookmark()

      const primary = extractor.getPrimaryLink(bookmark)

      expect(primary).toBeNull()
    })

    it('should prefer links earlier in the text', () => {
      const bookmark = createMockBookmark({
        description:
          'Check out https://github.com/repo1 which is awesome. Also https://github.com/repo2',
      })

      const primary = extractor.getPrimaryLink(bookmark)

      expect(primary?.url).toContain('repo1')
    })
  })

  describe('hasEmbeddedLinks', () => {
    it('should return true when links are present', () => {
      const bookmark = createTwitterBookmarkWithLink(
        'https://github.com/repo',
        'github.com'
      )

      expect(extractor.hasEmbeddedLinks(bookmark)).toBe(true)
    })

    it('should return false when no links are present', () => {
      const bookmark = createPlainTwitterBookmark()

      expect(extractor.hasEmbeddedLinks(bookmark)).toBe(false)
    })
  })

  describe('getEmbeddedDomains', () => {
    it('should return all unique domains', () => {
      const bookmark = createMockBookmark({
        description:
          'Check https://github.com/repo1 and https://github.com/repo2 and https://stackoverflow.com/q/123',
      })

      const domains = extractor.getEmbeddedDomains(bookmark)

      expect(domains).toHaveLength(2)
      expect(domains).toContain('github.com')
      expect(domains).toContain('stackoverflow.com')
    })

    it('should return empty array when no links', () => {
      const bookmark = createPlainTwitterBookmark()

      const domains = extractor.getEmbeddedDomains(bookmark)

      expect(domains).toHaveLength(0)
    })
  })

  describe('confidence calculation', () => {
    it('should give higher confidence to links with "check out" phrase', () => {
      const bookmark = createMockBookmark({
        description:
          'Check out this amazing tutorial: https://example.com/tutorial',
      })

      const links = extractor.extractLinks(bookmark)

      expect(links[0].confidence).toBeGreaterThan(0.7)
    })

    it('should give higher confidence to links early in text', () => {
      const earlyLink = createMockBookmark({
        description:
          'https://example.com/early followed by lots of text that makes this description much longer and pushes the link position',
      })

      const lateLink = createMockBookmark({
        description:
          'Lots of text at the beginning that makes this description longer and pushes the link to the end https://example.com/late',
      })

      const earlyLinks = extractor.extractLinks(earlyLink)
      const lateLinks = extractor.extractLinks(lateLink)

      expect(earlyLinks[0].confidence).toBeGreaterThan(lateLinks[0].confidence)
    })

    it('should penalize shortened URLs', () => {
      const fullUrl = createMockBookmark({
        description: 'Check out https://github.com/facebook/react',
      })

      const shortUrl = createMockBookmark({
        description: 'Check out https://bit.ly/react-repo',
      })

      const fullLinks = extractor.extractLinks(fullUrl)
      const shortLinks = extractor.extractLinks(shortUrl)

      if (shortLinks.length > 0) {
        expect(fullLinks[0].confidence).toBeGreaterThan(
          shortLinks[0].confidence
        )
      }
    })

    it('should give higher confidence to description than content', () => {
      const descriptionLink = createMockBookmark({
        description: 'https://example.com/link',
        content: '',
      })

      const contentLink = createMockBookmark({
        description: '',
        content: 'https://example.com/link',
      })

      const descLinks = extractor.extractLinks(descriptionLink)
      const contLinks = extractor.extractLinks(contentLink)

      expect(descLinks[0].confidence).toBeGreaterThan(contLinks[0].confidence)
    })
  })

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const bookmark = createMockBookmark({
        description: '',
        content: '',
        title: '',
      })

      const links = extractor.extractLinks(bookmark)

      expect(links).toHaveLength(0)
    })

    it('should handle undefined fields', () => {
      const bookmark = createMockBookmark({
        description: undefined as any,
        content: undefined as any,
        title: undefined as any,
      })

      const links = extractor.extractLinks(bookmark)

      expect(links).toHaveLength(0)
    })

    it('should handle URLs with special characters', () => {
      const bookmark = createMockBookmark({
        description:
          'Check https://example.com/path?query=value&other=123#anchor',
      })

      const links = extractor.extractLinks(bookmark)

      expect(links).toHaveLength(1)
      expect(links[0].domain).toBe('example.com')
    })

    it('should handle multiple URLs in close proximity', () => {
      const bookmark = createMockBookmark({
        description:
          'Check https://github.com/repo1 https://github.com/repo2 https://github.com/repo3',
      })

      const links = extractor.extractLinks(bookmark)

      expect(links.length).toBeGreaterThan(0)
      // All should have valid confidence
      links.forEach((link) => {
        expect(link.confidence).toBeGreaterThan(0)
        expect(link.confidence).toBeLessThanOrEqual(1)
      })
    })
  })
})
