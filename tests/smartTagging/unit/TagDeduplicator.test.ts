/**
 * Unit tests for TagDeduplicator
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TagDeduplicator } from '../../../src/services/smartTagging/core/TagDeduplicator'
import type { TagSuggestion } from '../../../src/services/smartTagging/types'

describe('TagDeduplicator', () => {
  let deduplicator: TagDeduplicator

  beforeEach(() => {
    deduplicator = new TagDeduplicator()
  })

  describe('deduplicate', () => {
    it('should keep unique tags unchanged', () => {
      const suggestions: TagSuggestion[] = [
        { tag: 'javascript', confidence: 0.9, sources: ['domain'] },
        { tag: 'react', confidence: 0.8, sources: ['nlp'] },
        { tag: 'web', confidence: 0.7, sources: ['url'] },
      ]

      const result = deduplicator.deduplicate(suggestions)

      expect(result).toHaveLength(3)
      expect(result[0].tag).toBe('javascript')
      expect(result[1].tag).toBe('react')
      expect(result[2].tag).toBe('web')
    })

    it('should combine duplicate tags from different sources', () => {
      const suggestions: TagSuggestion[] = [
        { tag: 'javascript', confidence: 0.8, sources: ['domain'] },
        { tag: 'javascript', confidence: 0.7, sources: ['nlp'] },
      ]

      const result = deduplicator.deduplicate(suggestions)

      expect(result).toHaveLength(1)
      expect(result[0].tag).toBe('javascript')
      expect(result[0].sources).toHaveLength(2)
      expect(result[0].sources).toContain('domain')
      expect(result[0].sources).toContain('nlp')
    })

    it('should boost confidence when multiple sources agree', () => {
      const suggestions: TagSuggestion[] = [
        { tag: 'react', confidence: 0.7, sources: ['domain'] },
        { tag: 'react', confidence: 0.8, sources: ['nlp'] },
      ]

      const result = deduplicator.deduplicate(suggestions)

      expect(result).toHaveLength(1)
      // Should take max confidence (0.8) + boost (0.1 for second source)
      expect(result[0].confidence).toBeCloseTo(0.9, 1)
    })

    it('should not exceed confidence of 1.0', () => {
      const suggestions: TagSuggestion[] = [
        { tag: 'javascript', confidence: 0.95, sources: ['domain'] },
        { tag: 'javascript', confidence: 0.9, sources: ['nlp'] },
        { tag: 'javascript', confidence: 0.85, sources: ['url'] },
      ]

      const result = deduplicator.deduplicate(suggestions)

      expect(result[0].confidence).toBeLessThanOrEqual(1.0)
    })

    it('should sort results by confidence (descending)', () => {
      const suggestions: TagSuggestion[] = [
        { tag: 'low', confidence: 0.5, sources: ['nlp'] },
        { tag: 'high', confidence: 0.9, sources: ['domain'] },
        { tag: 'medium', confidence: 0.7, sources: ['url'] },
      ]

      const result = deduplicator.deduplicate(suggestions)

      expect(result[0].tag).toBe('high')
      expect(result[1].tag).toBe('medium')
      expect(result[2].tag).toBe('low')
    })

    it('should handle empty array', () => {
      const result = deduplicator.deduplicate([])

      expect(result).toHaveLength(0)
    })

    it('should combine reasoning from multiple sources', () => {
      const suggestions: TagSuggestion[] = [
        {
          tag: 'react',
          confidence: 0.8,
          sources: ['domain'],
          reasoning: 'From domain: react.dev',
        },
        {
          tag: 'react',
          confidence: 0.7,
          sources: ['nlp'],
          reasoning: 'Found in content',
        },
      ]

      const result = deduplicator.deduplicate(suggestions)

      expect(result[0].reasoning).toContain('From domain: react.dev')
      expect(result[0].reasoning).toContain('Found in content')
    })

    it('should not duplicate reasoning', () => {
      const suggestions: TagSuggestion[] = [
        {
          tag: 'javascript',
          confidence: 0.8,
          sources: ['domain'],
          reasoning: 'From GitHub',
        },
        {
          tag: 'javascript',
          confidence: 0.7,
          sources: ['nlp'],
          reasoning: 'From GitHub',
        },
      ]

      const result = deduplicator.deduplicate(suggestions)

      // Should only appear once
      const reasoningParts = result[0].reasoning?.split(';') || []
      expect(
        reasoningParts.filter((r) => r.includes('From GitHub'))
      ).toHaveLength(1)
    })

    it('should handle suggestions without reasoning', () => {
      const suggestions: TagSuggestion[] = [
        { tag: 'web', confidence: 0.8, sources: ['domain'] },
        { tag: 'web', confidence: 0.7, sources: ['url'] },
      ]

      const result = deduplicator.deduplicate(suggestions)

      expect(result).toHaveLength(1)
      // Should not crash, reasoning is optional
    })

    it('should preserve highest confidence when merging', () => {
      const suggestions: TagSuggestion[] = [
        { tag: 'typescript', confidence: 0.6, sources: ['nlp'] },
        { tag: 'typescript', confidence: 0.9, sources: ['domain'] },
        { tag: 'typescript', confidence: 0.7, sources: ['url'] },
      ]

      const result = deduplicator.deduplicate(suggestions)

      // Should use 0.9 as base + boosts
      expect(result[0].confidence).toBeGreaterThanOrEqual(0.9)
    })
  })

  describe('deduplicateSimple', () => {
    it('should remove duplicate strings', () => {
      const tags = ['javascript', 'react', 'javascript', 'vue', 'react']

      const result = deduplicator.deduplicateSimple(tags)

      expect(result).toHaveLength(3)
      expect(result).toContain('javascript')
      expect(result).toContain('react')
      expect(result).toContain('vue')
    })

    it('should handle empty array', () => {
      const result = deduplicator.deduplicateSimple([])

      expect(result).toHaveLength(0)
    })

    it('should handle array with no duplicates', () => {
      const tags = ['a', 'b', 'c']

      const result = deduplicator.deduplicateSimple(tags)

      expect(result).toHaveLength(3)
    })

    it('should handle array with all duplicates', () => {
      const tags = ['tag', 'tag', 'tag']

      const result = deduplicator.deduplicateSimple(tags)

      expect(result).toHaveLength(1)
      expect(result[0]).toBe('tag')
    })
  })

  describe('combineAndDeduplicate', () => {
    it('should combine multiple arrays and deduplicate', () => {
      const array1: TagSuggestion[] = [
        { tag: 'javascript', confidence: 0.8, sources: ['domain'] },
        { tag: 'react', confidence: 0.7, sources: ['nlp'] },
      ]

      const array2: TagSuggestion[] = [
        { tag: 'javascript', confidence: 0.9, sources: ['url'] },
        { tag: 'vue', confidence: 0.6, sources: ['nlp'] },
      ]

      const result = deduplicator.combineAndDeduplicate([array1, array2])

      expect(result).toHaveLength(3)

      const jsTag = result.find((s) => s.tag === 'javascript')
      expect(jsTag?.sources).toHaveLength(2)
      expect(jsTag?.sources).toContain('domain')
      expect(jsTag?.sources).toContain('url')
    })

    it('should handle empty arrays', () => {
      const result = deduplicator.combineAndDeduplicate([[], []])

      expect(result).toHaveLength(0)
    })

    it('should handle single array', () => {
      const array: TagSuggestion[] = [
        { tag: 'test', confidence: 0.8, sources: ['domain'] },
      ]

      const result = deduplicator.combineAndDeduplicate([array])

      expect(result).toHaveLength(1)
      expect(result[0].tag).toBe('test')
    })

    it('should sort combined results by confidence', () => {
      const array1: TagSuggestion[] = [
        { tag: 'low', confidence: 0.5, sources: ['nlp'] },
      ]

      const array2: TagSuggestion[] = [
        { tag: 'high', confidence: 0.9, sources: ['domain'] },
      ]

      const array3: TagSuggestion[] = [
        { tag: 'medium', confidence: 0.7, sources: ['url'] },
      ]

      const result = deduplicator.combineAndDeduplicate([
        array1,
        array2,
        array3,
      ])

      expect(result[0].tag).toBe('high')
      expect(result[1].tag).toBe('medium')
      expect(result[2].tag).toBe('low')
    })
  })

  describe('edge cases', () => {
    it('should handle very low confidence values', () => {
      const suggestions: TagSuggestion[] = [
        { tag: 'test', confidence: 0.01, sources: ['nlp'] },
        { tag: 'test', confidence: 0.02, sources: ['url'] },
      ]

      const result = deduplicator.deduplicate(suggestions)

      expect(result).toHaveLength(1)
      expect(result[0].confidence).toBeGreaterThan(0)
      expect(result[0].confidence).toBeLessThanOrEqual(1.0)
    })

    it('should handle confidence exactly at 1.0', () => {
      const suggestions: TagSuggestion[] = [
        { tag: 'perfect', confidence: 1.0, sources: ['domain'] },
      ]

      const result = deduplicator.deduplicate(suggestions)

      expect(result[0].confidence).toBe(1.0)
    })

    it('should handle many duplicate sources', () => {
      const suggestions: TagSuggestion[] = [
        { tag: 'popular', confidence: 0.7, sources: ['domain'] },
        { tag: 'popular', confidence: 0.7, sources: ['url'] },
        { tag: 'popular', confidence: 0.7, sources: ['nlp'] },
        { tag: 'popular', confidence: 0.7, sources: ['learning'] },
      ]

      const result = deduplicator.deduplicate(suggestions)

      expect(result).toHaveLength(1)
      expect(result[0].sources).toHaveLength(4)
      // Should have significant confidence boost
      expect(result[0].confidence).toBeGreaterThan(0.7)
    })
  })
})
