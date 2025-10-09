/**
 * Unit tests for TagNormalizer
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TagNormalizer } from '../../../src/services/smartTagging/core/TagNormalizer'

describe('TagNormalizer', () => {
  let normalizer: TagNormalizer

  beforeEach(() => {
    normalizer = new TagNormalizer()
  })

  describe('normalize', () => {
    it('should lowercase tags', () => {
      const result = normalizer.normalize('JavaScript')

      expect(result.normalized).toBe('javascript')
      expect(result.reason).toBe('valid')
    })

    it('should trim whitespace', () => {
      const result = normalizer.normalize('  react  ')

      expect(result.normalized).toBe('react')
      expect(result.reason).toBe('valid')
    })

    it('should remove special characters except hyphens', () => {
      const result = normalizer.normalize('custom@#$%tag')

      expect(result.normalized).toBe('customtag')
      expect(result.reason).toBe('valid')
    })

    it('should keep hyphens in the middle', () => {
      const result = normalizer.normalize('web-development')

      expect(result.normalized).toBe('web-development')
      expect(result.reason).toBe('valid')
    })

    it('should remove leading and trailing hyphens', () => {
      const result = normalizer.normalize('-tag-')

      expect(result.normalized).toBe('tag')
      expect(result.reason).toBe('valid')
    })

    it('should collapse multiple hyphens', () => {
      const result = normalizer.normalize('web---dev')

      expect(result.normalized).toBe('web-dev')
      expect(result.reason).toBe('valid')
    })

    it('should reject tags that are too short', () => {
      const result = normalizer.normalize('a')

      expect(result.normalized).toBeNull()
      expect(result.reason).toBe('too_short')
    })

    it('should reject empty strings', () => {
      const result = normalizer.normalize('')

      expect(result.normalized).toBeNull()
      expect(result.reason).toBe('invalid')
    })

    it('should reject whitespace-only strings', () => {
      const result = normalizer.normalize('   ')

      expect(result.normalized).toBeNull()
      expect(result.reason).toBe('invalid')
    })

    it('should reject stop words', () => {
      const result = normalizer.normalize('the')

      expect(result.normalized).toBeNull()
      expect(result.reason).toBe('stop_word')
    })

    it('should reject "and" as stop word', () => {
      const result = normalizer.normalize('and')

      expect(result.normalized).toBeNull()
      expect(result.reason).toBe('stop_word')
    })

    it('should apply tag aliases', () => {
      const result = normalizer.normalize('js')

      expect(result.normalized).toBe('javascript')
      expect(result.reason).toBe('aliased')
    })

    it('should apply typescript alias', () => {
      const result = normalizer.normalize('ts')

      expect(result.normalized).toBe('typescript')
      expect(result.reason).toBe('aliased')
    })

    it('should apply python alias', () => {
      const result = normalizer.normalize('py')

      expect(result.normalized).toBe('python')
      expect(result.reason).toBe('aliased')
    })

    it('should handle react.js to react', () => {
      const result = normalizer.normalize('react.js')

      expect(result.normalized).toBe('react')
      expect(result.reason).toBe('aliased')
    })

    it('should truncate very long tags', () => {
      const longTag = 'a'.repeat(50)
      const result = normalizer.normalize(longTag)

      expect(result.normalized).not.toBeNull()
      expect(result.normalized!.length).toBe(30) // Max length
    })

    it('should handle mixed case with special chars', () => {
      const result = normalizer.normalize('React-Native!!!')

      expect(result.normalized).toBe('react-native')
      expect(result.reason).toBe('valid')
    })

    it('should reject tags that become empty after cleaning', () => {
      const result = normalizer.normalize('###')

      expect(result.normalized).toBeNull()
      // Empty after cleaning is too short
      expect(result.reason).toBe('too_short')
    })

    it('should handle unicode characters', () => {
      const result = normalizer.normalize('café')

      expect(result.normalized).toBe('caf')
      expect(result.reason).toBe('valid')
    })

    it('should preserve original tag in result', () => {
      const original = 'JavaScript!'
      const result = normalizer.normalize(original)

      expect(result.original).toBe(original)
    })
  })

  describe('normalizeTag', () => {
    it('should return normalized tag directly', () => {
      const tag = normalizer.normalizeTag('JavaScript')

      expect(tag).toBe('javascript')
    })

    it('should return null for invalid tags', () => {
      const tag = normalizer.normalizeTag('the')

      expect(tag).toBeNull()
    })
  })

  describe('normalizeTags', () => {
    it('should normalize multiple tags', () => {
      const tags = normalizer.normalizeTags(['JavaScript', 'React', 'Node.js'])

      expect(tags).toHaveLength(3)
      expect(tags).toContain('javascript')
      expect(tags).toContain('react')
      expect(tags).toContain('nodejs')
    })

    it('should filter out invalid tags', () => {
      const tags = normalizer.normalizeTags(['JavaScript', 'the', 'React', 'a', 'Vue'])

      expect(tags).toHaveLength(3)
      expect(tags).not.toContain('the')
      expect(tags).not.toContain('a')
    })

    it('should handle empty array', () => {
      const tags = normalizer.normalizeTags([])

      expect(tags).toHaveLength(0)
    })

    it('should handle array with all invalid tags', () => {
      const tags = normalizer.normalizeTags(['the', 'a', 'an', ''])

      expect(tags).toHaveLength(0)
    })

    it('should deduplicate after normalization', () => {
      const tags = normalizer.normalizeTags(['js', 'JavaScript', 'JAVASCRIPT'])

      // All normalize to 'javascript'
      expect(tags.filter((t) => t === 'javascript')).toHaveLength(3)
    })
  })

  describe('isValid', () => {
    it('should return true for valid tags', () => {
      expect(normalizer.isValid('javascript')).toBe(true)
      expect(normalizer.isValid('web-dev')).toBe(true)
      expect(normalizer.isValid('react')).toBe(true)
    })

    it('should return false for invalid tags', () => {
      expect(normalizer.isValid('the')).toBe(false)
      expect(normalizer.isValid('a')).toBe(false)
      expect(normalizer.isValid('')).toBe(false)
      expect(normalizer.isValid('   ')).toBe(false)
    })
  })

  describe('normalizeWithReasons', () => {
    it('should return detailed results for multiple tags', () => {
      const results = normalizer.normalizeWithReasons(['JavaScript', 'the', 'js'])

      expect(results).toHaveLength(3)
      expect(results[0].normalized).toBe('javascript')
      expect(results[0].reason).toBe('valid')
      expect(results[1].normalized).toBeNull()
      expect(results[1].reason).toBe('stop_word')
      expect(results[2].normalized).toBe('javascript')
      expect(results[2].reason).toBe('aliased')
    })
  })

  describe('edge cases', () => {
    it('should handle numbers in tags', () => {
      const result = normalizer.normalize('web3')

      expect(result.normalized).toBe('web3')
      expect(result.reason).toBe('valid')
    })

    it('should handle tags with only numbers', () => {
      const result = normalizer.normalize('2024')

      expect(result.normalized).toBe('2024')
      expect(result.reason).toBe('valid')
    })

    it('should handle tags with hyphens and numbers', () => {
      const result = normalizer.normalize('node-v18')

      expect(result.normalized).toBe('node-v18')
      expect(result.reason).toBe('valid')
    })

    it('should reject single character after cleaning', () => {
      const result = normalizer.normalize('!')

      expect(result.normalized).toBeNull()
      // Empty after cleaning is too short
      expect(result.reason).toBe('too_short')
    })

    it('should handle tags that become too short after cleaning', () => {
      const result = normalizer.normalize('a!')

      expect(result.normalized).toBeNull()
      expect(result.reason).toBe('too_short')
    })
  })

  describe('alias handling', () => {
    it('should handle multiple aliases correctly', () => {
      const aliases = [
        ['k8s', 'kubernetes'],
        ['ml', 'machine-learning'],
        ['ai', 'artificial-intelligence'],
        ['db', 'database'],
      ]

      aliases.forEach(([input, expected]) => {
        const result = normalizer.normalize(input)
        expect(result.normalized).toBe(expected)
        expect(result.reason).toBe('aliased')
      })
    })

    it('should preserve non-aliased tags', () => {
      const result = normalizer.normalize('customtag')

      expect(result.normalized).toBe('customtag')
      expect(result.reason).toBe('valid')
    })
  })
})
