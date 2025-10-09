/**
 * Unit tests for LearningStrategy
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { LearningStrategy } from '../../../src/services/smartTagging/strategies/LearningStrategy'
import type { TaggingContext } from '../../../src/services/smartTagging/types'
import { createMockBookmark } from '../fixtures/mockBookmarks'

describe('LearningStrategy', () => {
  let strategy: LearningStrategy
  let context: TaggingContext

  beforeEach(() => {
    strategy = new LearningStrategy()
    context = {
      allBookmarks: [],
      options: {},
    }
  })

  describe('generateTags', () => {
    it('should return empty array when no historical data exists', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
      })

      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions).toHaveLength(0)
    })

    it('should learn from existing bookmarks', async () => {
      // Create historical bookmarks with tags
      const historicalBookmarks = [
        createMockBookmark({ domain: 'github.com', tags: ['code', 'open-source'] }),
        createMockBookmark({ domain: 'github.com', tags: ['code', 'project'] }),
        createMockBookmark({ domain: 'github.com', tags: ['code', 'open-source', 'tool'] }),
      ]

      context.allBookmarks = historicalBookmarks

      // New bookmark from same domain
      const bookmark = createMockBookmark({ domain: 'github.com', tags: [] })

      const suggestions = await strategy.generateTags(bookmark, context)

      // Should suggest 'code' (appears in all 3) and 'open-source' (appears in 2)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some((s) => s.tag === 'code')).toBe(true)
    })

    it('should suggest tags based on domain patterns', async () => {
      const historicalBookmarks = [
        createMockBookmark({ domain: 'stackoverflow.com', tags: ['programming', 'qa'] }),
        createMockBookmark({ domain: 'stackoverflow.com', tags: ['programming', 'help'] }),
        createMockBookmark({ domain: 'stackoverflow.com', tags: ['programming', 'qa'] }),
        createMockBookmark({ domain: 'stackoverflow.com', tags: ['programming'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ domain: 'stackoverflow.com', tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      // 'programming' appears in all 4 bookmarks (100% frequency)
      expect(suggestions.some((s) => s.tag === 'programming')).toBe(true)
    })

    it('should suggest tags based on author patterns', async () => {
      const historicalBookmarks = [
        createMockBookmark({ author: 'John Doe', tags: ['tutorial', 'javascript'] }),
        createMockBookmark({ author: 'John Doe', tags: ['tutorial', 'react'] }),
        createMockBookmark({ author: 'John Doe', tags: ['tutorial', 'web'] }),
        createMockBookmark({ author: 'Jane Smith', tags: ['article', 'python'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ author: 'John Doe', tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      // 'tutorial' appears in all John Doe bookmarks
      expect(suggestions.some((s) => s.tag === 'tutorial')).toBe(true)
    })

    it('should suggest tags based on co-occurrence patterns', async () => {
      const historicalBookmarks = [
        createMockBookmark({ tags: ['react', 'typescript', 'frontend'] }),
        createMockBookmark({ tags: ['react', 'typescript', 'component'] }),
        createMockBookmark({ tags: ['react', 'typescript', 'hooks'] }),
        createMockBookmark({ tags: ['vue', 'javascript'] }),
      ]

      context.allBookmarks = historicalBookmarks

      // New bookmark already has 'react'
      const bookmark = createMockBookmark({ tags: ['react'] })
      const suggestions = await strategy.generateTags(bookmark, context)

      // 'typescript' appears with 'react' in 3 bookmarks
      expect(suggestions.some((s) => s.tag === 'typescript')).toBe(true)
    })

    it('should not suggest tags that are already applied', async () => {
      const historicalBookmarks = [
        createMockBookmark({ domain: 'example.com', tags: ['tag1', 'tag2'] }),
        createMockBookmark({ domain: 'example.com', tags: ['tag1', 'tag2'] }),
      ]

      context.allBookmarks = historicalBookmarks

      // Bookmark already has tag1
      const bookmark = createMockBookmark({ domain: 'example.com', tags: ['tag1'] })
      const suggestions = await strategy.generateTags(bookmark, context)

      // Should not suggest tag1 again
      expect(suggestions.some((s) => s.tag === 'tag1')).toBe(false)
    })

    it('should only suggest high-frequency tags for domains', async () => {
      const historicalBookmarks = [
        createMockBookmark({ domain: 'example.com', tags: ['common', 'common', 'common'] }),
        createMockBookmark({ domain: 'example.com', tags: ['common', 'common', 'rare'] }),
        createMockBookmark({ domain: 'example.com', tags: ['common', 'common', 'rare'] }),
        createMockBookmark({ domain: 'example.com', tags: ['common'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ domain: 'example.com', tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      // 'common' appears frequently (>20%), should be suggested
      expect(suggestions.some((s) => s.tag === 'common')).toBe(true)
    })

    it('should normalize suggested tags', async () => {
      const historicalBookmarks = [
        createMockBookmark({ domain: 'example.com', tags: ['JavaScript', 'REACT'] }),
        createMockBookmark({ domain: 'example.com', tags: ['JavaScript', 'REACT'] }),
        createMockBookmark({ domain: 'example.com', tags: ['JavaScript'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ domain: 'example.com', tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      // Should normalize to lowercase
      expect(suggestions.some((s) => s.tag === 'javascript')).toBe(true)
      expect(suggestions.some((s) => s.tag === 'react')).toBe(true)
    })

    it('should set correct sources', async () => {
      const historicalBookmarks = [
        createMockBookmark({ domain: 'example.com', tags: ['test'] }),
        createMockBookmark({ domain: 'example.com', tags: ['test'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ domain: 'example.com', tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      suggestions.forEach((suggestion) => {
        expect(suggestion.sources).toContain('history')
      })
    })

    it('should set correct strategy name', async () => {
      const historicalBookmarks = [
        createMockBookmark({ domain: 'example.com', tags: ['test'] }),
        createMockBookmark({ domain: 'example.com', tags: ['test'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ domain: 'example.com', tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      suggestions.forEach((suggestion) => {
        expect(suggestion.strategy).toBe('learning')
      })
    })

    it('should include reasoning in suggestions', async () => {
      const historicalBookmarks = [
        createMockBookmark({ domain: 'example.com', tags: ['test'] }),
        createMockBookmark({ domain: 'example.com', tags: ['test'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ domain: 'example.com', tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      expect(suggestions.length).toBeGreaterThan(0)
      suggestions.forEach((suggestion) => {
        expect(suggestion.reasoning).toBeDefined()
        expect(suggestion.reasoning.length).toBeGreaterThan(0)
      })
    })

    it('should handle bookmarks without tags', async () => {
      const historicalBookmarks = [
        createMockBookmark({ domain: 'example.com', tags: [] }),
        createMockBookmark({ domain: 'example.com', tags: undefined }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ domain: 'example.com', tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      // Should not crash, just return empty
      expect(suggestions).toHaveLength(0)
    })

    it('should handle bookmarks without authors', async () => {
      const historicalBookmarks = [
        createMockBookmark({ author: undefined, tags: ['test'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ author: undefined, tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      // Should not crash
      expect(Array.isArray(suggestions)).toBe(true)
    })

    it('should combine suggestions from multiple sources', async () => {
      const historicalBookmarks = [
        // Domain pattern
        createMockBookmark({
          domain: 'github.com',
          author: 'Developer',
          tags: ['code', 'repository'],
        }),
        createMockBookmark({
          domain: 'github.com',
          author: 'Developer',
          tags: ['code', 'repository'],
        }),
        // Author pattern
        createMockBookmark({
          domain: 'other.com',
          author: 'Developer',
          tags: ['tutorial', 'code'],
        }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({
        domain: 'github.com',
        author: 'Developer',
        tags: [],
      })
      const suggestions = await strategy.generateTags(bookmark, context)

      // Should get suggestions from both domain and author patterns
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('should limit co-occurrence suggestions to top 5', async () => {
      const historicalBookmarks = [
        createMockBookmark({ tags: ['base', 'tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ tags: ['base'] })
      const suggestions = await strategy.generateTags(bookmark, context)

      // Co-occurrence suggestions should be limited to 5
      const coOccurrenceSuggestions = suggestions.filter((s) =>
        s.reasoning?.includes('Often used together')
      )
      expect(coOccurrenceSuggestions.length).toBeLessThanOrEqual(5)
    })

    it('should learn only once per context', async () => {
      const historicalBookmarks = [
        createMockBookmark({ domain: 'example.com', tags: ['test'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark1 = createMockBookmark({ domain: 'example.com', tags: [] })
      const bookmark2 = createMockBookmark({ domain: 'example.com', tags: [] })

      // First call learns
      await strategy.generateTags(bookmark1, context)

      // Second call should reuse learned patterns
      const suggestions = await strategy.generateTags(bookmark2, context)

      expect(suggestions.length).toBeGreaterThan(0)
    })
  })

  describe('confidence scores', () => {
    it('should have high confidence for frequent domain tags', async () => {
      const historicalBookmarks = [
        createMockBookmark({ domain: 'example.com', tags: ['frequent'] }),
        createMockBookmark({ domain: 'example.com', tags: ['frequent'] }),
        createMockBookmark({ domain: 'example.com', tags: ['frequent'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ domain: 'example.com', tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      const frequentTag = suggestions.find((s) => s.tag === 'frequent')
      expect(frequentTag).toBeDefined()
      expect(frequentTag!.confidence).toBeGreaterThan(0.5)
    })

    it('should cap domain tag confidence at 0.7', async () => {
      const historicalBookmarks = Array.from({ length: 10 }, () =>
        createMockBookmark({ domain: 'example.com', tags: ['test'] })
      )

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ domain: 'example.com', tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      suggestions.forEach((suggestion) => {
        if (suggestion.reasoning?.includes('example.com')) {
          expect(suggestion.confidence).toBeLessThanOrEqual(0.7)
        }
      })
    })

    it('should cap author tag confidence at 0.65', async () => {
      const historicalBookmarks = Array.from({ length: 10 }, () =>
        createMockBookmark({ author: 'Test Author', tags: ['test'] })
      )

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ author: 'Test Author', tags: [] })
      const suggestions = await strategy.generateTags(bookmark, context)

      suggestions.forEach((suggestion) => {
        if (suggestion.reasoning?.includes('Test Author')) {
          expect(suggestion.confidence).toBeLessThanOrEqual(0.65)
        }
      })
    })

    it('should cap co-occurrence confidence at 0.75', async () => {
      const historicalBookmarks = Array.from({ length: 20 }, () =>
        createMockBookmark({ tags: ['tag1', 'tag2'] })
      )

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ tags: ['tag1'] })
      const suggestions = await strategy.generateTags(bookmark, context)

      suggestions.forEach((suggestion) => {
        expect(suggestion.confidence).toBeLessThanOrEqual(0.75)
      })
    })
  })

  describe('reset', () => {
    it('should clear learned patterns', async () => {
      const historicalBookmarks = [
        createMockBookmark({ domain: 'example.com', tags: ['test'] }),
      ]

      context.allBookmarks = historicalBookmarks

      const bookmark = createMockBookmark({ domain: 'example.com', tags: [] })

      // Learn patterns
      await strategy.generateTags(bookmark, context)

      // Reset
      strategy.reset()

      // Should have no patterns
      const suggestions = await strategy.generateTags(bookmark, { ...context, allBookmarks: [] })
      expect(suggestions).toHaveLength(0)
    })
  })
})
