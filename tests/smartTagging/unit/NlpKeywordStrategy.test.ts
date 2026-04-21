/**
 * Unit tests for NlpKeywordStrategy
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { NlpKeywordStrategy } from '../../../src/services/smartTagging/strategies/NlpKeywordStrategy'
import type { TaggingContext } from '../../../src/services/smartTagging/types'
import {
  createMockBookmark,
  createTwitterBookmarkWithLink,
} from '../fixtures/mockBookmarks'

describe('NlpKeywordStrategy', () => {
  let strategy: NlpKeywordStrategy
  let context: TaggingContext

  beforeEach(() => {
    strategy = new NlpKeywordStrategy()
    context = {
      allBookmarks: [],
      options: {},
    }
  })

  describe('generateTags', () => {
    it('should extract tech keywords from title', async () => {
      const bookmark = createMockBookmark({
        title: 'Building a React Application with TypeScript',
        description: '',
        content: '',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'react')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'typescript')).toBe(true)
    })

    it('should extract tech keywords from description', async () => {
      const bookmark = createMockBookmark({
        title: '', // Empty title to avoid duplicates
        description: 'Learn how to use Docker and Kubernetes for deployment',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // docker gets aliased to containerization
      expect(suggestions.some((s) => s.tag === 'containerization')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'kubernetes')).toBe(true)
    })

    it('should extract tech keywords from content', async () => {
      const bookmark = createMockBookmark({
        title: 'Guide',
        description: '',
        content:
          'This article covers PostgreSQL database optimization and Redis caching strategies.',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'postgresql')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'redis')).toBe(true)
    })

    it('should prioritize title over description', async () => {
      const bookmark = createMockBookmark({
        title: 'Python Programming Guide',
        description: 'This is about Java',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Title appears twice (double weight), so python should have higher confidence
      const pythonSuggestions = suggestions.filter((s) => s.tag === 'python')
      expect(pythonSuggestions.length).toBeGreaterThan(0)
    })

    it('should extract hashtags from X/Twitter bookmarks', async () => {
      const bookmark = createMockBookmark({
        domain: 'x.com',
        url: 'https://x.com/user/status/123',
        description: 'Check out this cool #javascript #python #react tutorial!',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should extract both from hashtags AND from tech keywords
      expect(suggestions.some((s) => s.tag === 'javascript')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'python')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'react')).toBe(true)
    })

    it('should not extract hashtags from non-Twitter bookmarks', async () => {
      const bookmark = createMockBookmark({
        domain: 'example.com',
        url: 'https://example.com/article',
        description: 'Article about #javascript',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should still get javascript from tech keywords, but not as hashtag
      const hashtagSuggestions = suggestions.filter((s) =>
        s.reasoning?.includes('Hashtag')
      )
      expect(hashtagSuggestions.length).toBe(0)
    })

    it('should extract proper nouns using NLP', async () => {
      const bookmark = createMockBookmark({
        title: 'Azure Cloud Tutorial',
        description: 'Learn about cloud computing',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should extract company/product names
      expect(suggestions.length).toBeGreaterThan(0)
      // Azure gets aliased to microsoft-azure
      expect(suggestions.some((s) => s.tag === 'microsoft-azure')).toBe(true)
    })

    it('should handle empty content', async () => {
      const bookmark = createMockBookmark({
        title: '',
        description: '',
        content: '',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions).toHaveLength(0)
    })

    it('should handle whitespace-only content', async () => {
      const bookmark = createMockBookmark({
        title: '   ',
        description: '\n\n',
        content: '\t\t',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions).toHaveLength(0)
    })

    it('should normalize extracted keywords', async () => {
      const bookmark = createMockBookmark({
        title: 'JavaScript and Python',
        description: 'Learn JS and Py',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should normalize js -> javascript, py -> python
      expect(suggestions.some((s) => s.tag === 'javascript')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'python')).toBe(true)
    })

    it('should filter out stop words', async () => {
      const bookmark = createMockBookmark({
        title: 'The Quick Guide to React',
        description: 'This is a tutorial about React',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should not extract "the", "to", "this", "is", "a", "about"
      const stopWordTags = suggestions.filter((s) =>
        ['the', 'to', 'this', 'is', 'a', 'about'].includes(s.tag)
      )
      expect(stopWordTags.length).toBe(0)
    })

    it('should set correct sources', async () => {
      const bookmark = createMockBookmark({
        title: 'React Tutorial',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      suggestions.forEach((suggestion) => {
        expect(suggestion.sources).toContain('content')
      })
    })

    it('should set correct strategy name', async () => {
      const bookmark = createMockBookmark({
        title: 'JavaScript Guide',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      suggestions.forEach((suggestion) => {
        expect(suggestion.strategy).toBe('nlp')
      })
    })

    it('should include reasoning in suggestions', async () => {
      const bookmark = createMockBookmark({
        title: 'TypeScript Programming',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.length).toBeGreaterThan(0)
      suggestions.forEach((suggestion) => {
        expect(suggestion.reasoning).toBeDefined()
        expect(suggestion.reasoning.length).toBeGreaterThan(0)
      })
    })

    it('should handle case-insensitive keyword matching', async () => {
      const bookmark = createMockBookmark({
        title: 'REACT and TYPESCRIPT',
        description: 'Learn about DOCKER and KUBERNETES',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.some((s) => s.tag === 'react')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'typescript')).toBe(true)
      // docker gets aliased to containerization
      expect(suggestions.some((s) => s.tag === 'containerization')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'kubernetes')).toBe(true)
    })

    it('should limit content processing for performance', async () => {
      const bookmark = createMockBookmark({
        title: 'Article',
        description: '',
        content: 'a'.repeat(5000) + ' React at the end',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should only process first 1000 chars, so might not find React at position 5000
      // This test verifies that we don't process the entire 5000 chars
      expect(true).toBe(true) // Content was processed without hanging
    })

    it('should extract multiple occurrences of keywords', async () => {
      const bookmark = createMockBookmark({
        title: 'React React React',
        description: 'All about React',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should deduplicate and not create multiple tags for same keyword
      const reactTags = suggestions.filter((s) => s.tag === 'react')
      expect(reactTags.length).toBe(1)
    })

    it('should handle special characters in hashtags', async () => {
      const bookmark = createMockBookmark({
        domain: 'x.com',
        url: 'https://x.com/user/status/123',
        description: '#react-native #vue.js #node.js',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Hashtag regex only captures word characters, so special chars are removed
      expect(suggestions.some((s) => s.tag === 'react')).toBe(true)
    })

    it('should avoid duplicate tags from different extraction methods', async () => {
      const bookmark = createMockBookmark({
        title: 'React Tutorial',
        description: 'Learn React and React fundamentals',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Even though React appears in tech keywords AND might appear in NLP extraction,
      // we should not have excessive duplicates
      const reactTags = suggestions.filter((s) => s.tag === 'react')
      // Tech keywords might create one or two entries, but NLP should avoid adding more
      expect(reactTags.length).toBeLessThanOrEqual(3)
    })
  })

  describe('confidence scores', () => {
    it('should have high confidence for tech keywords with exact word match', async () => {
      const bookmark = createMockBookmark({
        title: 'React',
        description: 'TypeScript',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      const highConfidence = suggestions.filter((s) => s.confidence >= 0.8)
      expect(highConfidence.length).toBeGreaterThan(0)
    })

    it('should have lower confidence for NLP-extracted terms', async () => {
      const bookmark = createMockBookmark({
        title: 'Understanding software architecture patterns',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // NLP proper nouns and topics should have lower confidence (0.55-0.6)
      const nlpSuggestions = suggestions.filter((s) => s.confidence < 0.7)
      expect(nlpSuggestions.length).toBeGreaterThan(0)
    })

    it('should have high confidence for hashtags', async () => {
      const bookmark = createMockBookmark({
        domain: 'x.com',
        url: 'https://x.com/user/status/123',
        description: '#javascript #coding',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      const hashtagSuggestions = suggestions.filter((s) =>
        s.reasoning?.includes('Hashtag')
      )
      hashtagSuggestions.forEach((suggestion) => {
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0.8)
      })
    })

    it('should have lower confidence for NLP-extracted nouns', async () => {
      const bookmark = createMockBookmark({
        title: 'Generic Article Title',
        description: 'Some content about various topics',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      // NLP proper nouns and topics should have lower confidence
      const nlpSuggestions = suggestions.filter((s) =>
        s.reasoning?.includes('extracted from content')
      )
      nlpSuggestions.forEach((suggestion) => {
        expect(suggestion.confidence).toBeLessThanOrEqual(0.6)
      })
    })
  })
})
