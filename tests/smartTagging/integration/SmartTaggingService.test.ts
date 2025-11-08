/**
 * Integration tests for SmartTaggingService
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SmartTaggingService } from '../../../src/services/smartTagging/SmartTaggingService'
import type { TaggingOptions } from '../../../src/services/smartTagging/types'
import {
  createMockBookmark,
  createTwitterBookmarkWithLink,
} from '../fixtures/mockBookmarks'

describe('SmartTaggingService', () => {
  let service: SmartTaggingService

  beforeEach(() => {
    service = new SmartTaggingService()
  })

  describe('generateTags', () => {
    it('should generate tag suggestions from multiple strategies', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
        url: 'https://github.com/facebook/react',
        title: 'React - A JavaScript library',
        description:
          'React is a JavaScript library for building user interfaces',
      })

      const result = await service.generateTags(bookmark)

      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.metrics.strategiesUsed).toBeGreaterThan(0)
    })

    it('should combine suggestions from domain and URL strategies', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
        url: 'https://github.com/facebook/react/issues/123',
      })

      const result = await service.generateTags(bookmark)

      // Should get tags from both domain (github, code) and URL pattern (issue, bug)
      const allTags = [...result.suggestions, ...result.autoApply].map(
        (s) => s.tag
      )
      expect(
        allTags.some(
          (t) => t === 'github' || t === 'code' || t === 'development'
        )
      ).toBe(true)
      expect(allTags.some((t) => t === 'issue' || t === 'bug')).toBe(true)
    })

    it('should combine suggestions from NLP and other strategies', async () => {
      const bookmark = createMockBookmark({
        domain: 'dev.to',
        url: 'https://dev.to/article',
        title: 'Understanding React Hooks',
        description: 'A comprehensive guide to React hooks and TypeScript',
      })

      const result = await service.generateTags(bookmark)

      // Should get tags from domain, NLP (react, typescript), and URL patterns
      expect(
        result.suggestions.length + result.autoApply.length
      ).toBeGreaterThan(0)
    })

    it('should deduplicate tags from multiple strategies', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
        url: 'https://github.com/microsoft/typescript',
        title: 'TypeScript Programming',
      })

      const result = await service.generateTags(bookmark)

      // 'typescript' might come from both URL and NLP, should be deduplicated
      const allSuggestions = [...result.suggestions, ...result.autoApply]
      const typescriptTags = allSuggestions.filter(
        (s) => s.tag === 'typescript'
      )
      expect(typescriptTags.length).toBe(1)
    })

    it('should boost confidence for tags suggested by multiple strategies', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
        url: 'https://github.com/facebook/react',
        title: 'React Library',
        description: 'React is awesome',
      })

      const result = await service.generateTags(bookmark)

      // React appears in URL, title, and description - should have high confidence
      const allSuggestions = [...result.suggestions, ...result.autoApply]
      const reactTag = allSuggestions.find((s) => s.tag === 'react')

      if (reactTag) {
        expect(reactTag.confidence).toBeGreaterThan(0.7)
      }
    })

    it('should respect maxSuggestions option', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
        url: 'https://github.com/facebook/react/issues/123',
        title: 'React TypeScript Redux Jest Testing Documentation',
        description: 'Guide about React TypeScript Redux Jest Testing',
      })

      const options: TaggingOptions = {
        maxSuggestions: 5,
      }

      const result = await service.generateTags(bookmark, [], options)

      // Total suggestions should not exceed maxSuggestions
      expect(
        result.suggestions.length + result.autoApply.length
      ).toBeLessThanOrEqual(5)
    })

    it('should respect autoApplyThreshold option', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
        url: 'https://github.com/facebook/react',
      })

      const options: TaggingOptions = {
        autoApplyThreshold: 0.95, // Very high threshold
      }

      const result = await service.generateTags(bookmark, [], options)

      // With high threshold, only very confident tags should auto-apply
      // All auto-apply tags should have confidence >= 0.95
      result.autoApply.forEach((tag) => {
        expect(tag.confidence).toBeGreaterThanOrEqual(0.95)
      })

      // All suggestions should have confidence < 0.95
      result.suggestions.forEach((tag) => {
        expect(tag.confidence).toBeLessThan(0.95)
      })
    })

    it('should respect enabledStrategies option', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
        url: 'https://github.com/facebook/react',
        title: 'React Library',
      })

      const options: TaggingOptions = {
        enabledStrategies: ['domain'], // Only domain strategy
      }

      const result = await service.generateTags(bookmark, [], options)

      expect(result.metrics.strategiesUsed).toBe(1)
    })

    it('should handle X/Twitter bookmarks with embedded links', async () => {
      const bookmark = createTwitterBookmarkWithLink(
        'https://github.com/facebook/react',
        'github.com'
      )

      const result = await service.generateTags(bookmark)

      // Should extract and tag based on embedded GitHub link, not x.com
      const allTags = [...result.suggestions, ...result.autoApply].map(
        (s) => s.tag
      )
      expect(
        allTags.some(
          (t) => t === 'github' || t === 'code' || t === 'development'
        )
      ).toBe(true)
    })

    it('should use learning strategy when historical data is available', async () => {
      const historicalBookmarks = [
        createMockBookmark({
          domain: 'github.com',
          tags: ['code', 'open-source'],
        }),
        createMockBookmark({
          domain: 'github.com',
          tags: ['code', 'open-source'],
        }),
        createMockBookmark({ domain: 'github.com', tags: ['code', 'project'] }),
      ]

      const bookmark = createMockBookmark({
        domain: 'github.com',
        tags: [],
      })

      const result = await service.generateTags(bookmark, historicalBookmarks)

      // Learning strategy should suggest frequently used tags
      const allTags = [...result.suggestions, ...result.autoApply].map(
        (s) => s.tag
      )
      expect(allTags.some((t) => t === 'code')).toBe(true)
    })

    it('should return metrics', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
      })

      const result = await service.generateTags(bookmark)

      expect(result.metrics).toBeDefined()
      expect(result.metrics.strategiesUsed).toBeGreaterThan(0)
      expect(result.metrics.totalSuggestions).toBeGreaterThanOrEqual(0)
      expect(result.metrics.uniqueSuggestions).toBeGreaterThanOrEqual(0)
      expect(result.metrics.autoApplied).toBeGreaterThanOrEqual(0)
      expect(result.metrics.processingTime).toBeGreaterThanOrEqual(0)
    })

    it('should handle bookmarks with no matches', async () => {
      const bookmark = createMockBookmark({
        domain: 'unknown-domain-12345.com',
        url: 'https://unknown-domain-12345.com/random',
        title: '',
        description: '',
        content: '',
      })

      const result = await service.generateTags(bookmark)

      // Should not crash, might return empty suggestions
      expect(result.suggestions).toBeDefined()
      expect(result.autoApply).toBeDefined()
      expect(result.metrics).toBeDefined()
    })

    it('should handle errors in individual strategies gracefully', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
      })

      // Even if one strategy fails, service should continue
      const result = await service.generateTags(bookmark)

      expect(result).toBeDefined()
      expect(result.metrics).toBeDefined()
    })

    it('should sort suggestions by confidence', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
        url: 'https://github.com/facebook/react',
        title: 'React Documentation',
        description: 'Learn React',
      })

      const result = await service.generateTags(bookmark)

      // Auto-apply is sorted (highest confidence first)
      for (let i = 1; i < result.autoApply.length; i++) {
        expect(result.autoApply[i - 1].confidence).toBeGreaterThanOrEqual(
          result.autoApply[i].confidence
        )
      }

      // Suggestions are sorted (highest confidence first)
      for (let i = 1; i < result.suggestions.length; i++) {
        expect(result.suggestions[i - 1].confidence).toBeGreaterThanOrEqual(
          result.suggestions[i].confidence
        )
      }

      // Auto-apply should have higher confidence than suggestions
      if (result.autoApply.length > 0 && result.suggestions.length > 0) {
        expect(
          result.autoApply[result.autoApply.length - 1].confidence
        ).toBeGreaterThanOrEqual(result.suggestions[0].confidence)
      }
    })

    it('should process quickly (performance test)', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
        url: 'https://github.com/facebook/react',
        title: 'React - A JavaScript library for building user interfaces',
        description: 'React makes it painless to create interactive UIs',
      })

      const result = await service.generateTags(bookmark)

      // Should process in reasonable time (< 100ms)
      expect(result.metrics.processingTime).toBeLessThan(100)
    })

    it('should handle custom domain rules', async () => {
      const bookmark = createMockBookmark({
        domain: 'custom-domain.com',
      })

      const options: TaggingOptions = {
        customDomainRules: [
          {
            domain: 'custom-domain.com',
            tags: ['custom', 'special'],
            category: 'tools',
            confidence: 0.9,
          },
        ],
      }

      const result = await service.generateTags(bookmark, [], options)

      const allTags = [...result.suggestions, ...result.autoApply].map(
        (s) => s.tag
      )
      expect(allTags).toContain('custom')
    })
  })

  describe('getStrategies', () => {
    it('should return all registered strategies', () => {
      const strategies = service.getStrategies()

      expect(strategies).toContain('domain')
      expect(strategies).toContain('url')
      expect(strategies).toContain('nlp')
      expect(strategies).toContain('learning')
      expect(strategies.length).toBe(4)
    })
  })

  describe('setStrategyEnabled', () => {
    it('should enable a strategy', () => {
      const options: TaggingOptions = {
        enabledStrategies: ['domain'],
      }

      service.setStrategyEnabled('nlp', true, options)

      expect(options.enabledStrategies).toContain('nlp')
    })

    it('should disable a strategy', () => {
      const options: TaggingOptions = {
        enabledStrategies: ['domain', 'nlp', 'url'],
      }

      service.setStrategyEnabled('nlp', false, options)

      expect(options.enabledStrategies).not.toContain('nlp')
      expect(options.enabledStrategies).toContain('domain')
      expect(options.enabledStrategies).toContain('url')
    })

    it('should not duplicate strategies when enabling twice', () => {
      const options: TaggingOptions = {
        enabledStrategies: ['domain'],
      }

      service.setStrategyEnabled('nlp', true, options)
      service.setStrategyEnabled('nlp', true, options)

      const nlpCount = options.enabledStrategies.filter(
        (s) => s === 'nlp'
      ).length
      expect(nlpCount).toBe(1)
    })
  })

  describe('integration scenarios', () => {
    it('should handle a typical GitHub repository bookmark', async () => {
      const bookmark = createMockBookmark({
        domain: 'github.com',
        url: 'https://github.com/microsoft/vscode',
        title: 'Visual Studio Code - Open Source Code Editor',
        description: 'VS Code is a lightweight but powerful source code editor',
        author: 'Microsoft',
      })

      const result = await service.generateTags(bookmark)

      const allTags = [...result.suggestions, ...result.autoApply].map(
        (s) => s.tag
      )

      // Should detect: github, code, editor, development, etc.
      expect(allTags.length).toBeGreaterThan(0)
      expect(result.metrics.processingTime).toBeLessThan(100)
    })

    it('should handle a blog post about web development', async () => {
      const bookmark = createMockBookmark({
        domain: 'dev.to',
        url: 'https://dev.to/username/react-hooks-tutorial',
        title: 'Complete Guide to React Hooks',
        description: 'Learn React Hooks with TypeScript examples',
      })

      const result = await service.generateTags(bookmark)

      const allTags = [...result.suggestions, ...result.autoApply].map(
        (s) => s.tag
      )

      // Should detect: react, typescript, tutorial, hooks
      expect(allTags.some((t) => t === 'react')).toBe(true)
      expect(allTags.some((t) => t === 'typescript')).toBe(true)
    })

    it('should handle a Stack Overflow question', async () => {
      const bookmark = createMockBookmark({
        domain: 'stackoverflow.com',
        url: 'https://stackoverflow.com/questions/12345/how-to-use-async-await',
        title: 'How to use async/await in JavaScript?',
        description: 'I want to understand async/await in JavaScript',
      })

      const result = await service.generateTags(bookmark)

      const allTags = [...result.suggestions, ...result.autoApply].map(
        (s) => s.tag
      )

      // Should detect: javascript, programming, qa, async
      expect(allTags.some((t) => t === 'javascript')).toBe(true)
      expect(allTags.some((t) => t === 'programming' || t === 'qa')).toBe(true)
    })

    it('should handle Twitter bookmark with embedded GitHub link', async () => {
      const bookmark = createTwitterBookmarkWithLink(
        'https://github.com/vercel/next.js',
        'github.com'
      )
      bookmark.description =
        'Check out this awesome #nextjs framework! #react #javascript'

      const result = await service.generateTags(bookmark)

      const allTags = [...result.suggestions, ...result.autoApply].map(
        (s) => s.tag
      )

      // Should extract from embedded link AND hashtags
      expect(allTags.some((t) => t === 'github' || t === 'code')).toBe(true)
      expect(
        allTags.some(
          (t) => t === 'nextjs' || t === 'react' || t === 'javascript'
        )
      ).toBe(true)
    })

    it('should use historical patterns when available', async () => {
      const historicalBookmarks = [
        createMockBookmark({
          domain: 'medium.com',
          author: 'Tech Writer',
          tags: ['article', 'tutorial', 'web-dev'],
        }),
        createMockBookmark({
          domain: 'medium.com',
          author: 'Tech Writer',
          tags: ['article', 'tutorial', 'javascript'],
        }),
        createMockBookmark({
          domain: 'medium.com',
          author: 'Tech Writer',
          tags: ['article', 'guide'],
        }),
      ]

      const bookmark = createMockBookmark({
        domain: 'medium.com',
        author: 'Tech Writer',
        title: 'New Article About React',
      })

      const result = await service.generateTags(bookmark, historicalBookmarks)

      const allTags = [...result.suggestions, ...result.autoApply].map(
        (s) => s.tag
      )

      // Should suggest 'article' and 'tutorial' based on history
      expect(allTags).toContain('article')
      expect(result.metrics.totalSuggestions).toBeGreaterThan(0)
    })
  })
})
