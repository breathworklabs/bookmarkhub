/**
 * NLP-based keyword extraction strategy
 * Uses Compromise.js for lightweight natural language processing
 */

import nlp from 'compromise'
import type { TaggingStrategy, TagSuggestion, TaggingContext } from '../types'
import type { Bookmark } from '../../../types/bookmark'
import { findTechKeywords } from '../../../data/smartTagging/techKeywords'
import { TagNormalizer } from '../core/TagNormalizer'
import { isAmbiguousTechTerm, hasTechContext } from '../../../data/smartTagging/ambiguousTechTerms'

export class NlpKeywordStrategy implements TaggingStrategy {
  readonly name = 'nlp'
  private normalizer = new TagNormalizer()

  /**
   * Extract keywords using NLP and tech keyword matching
   */
  async generateTags(bookmark: Bookmark, _context: TaggingContext): Promise<TagSuggestion[]> {
    const suggestions: TagSuggestion[] = []

    // Extract text content from bookmark
    const textContent = this.extractTextContent(bookmark)
    if (!textContent.trim()) {
      return []
    }

    // Strategy 1: Extract tech keywords (highest confidence)
    const techTags = this.extractTechKeywords(textContent)
    suggestions.push(...techTags)

    // Strategy 2: Extract nouns and proper nouns using NLP
    const nlpTags = this.extractNlpKeywords(textContent)
    suggestions.push(...nlpTags)

    // Strategy 3: Extract hashtags (high confidence for X/Twitter)
    if (this.isTwitterDomain(bookmark.domain)) {
      const hashtagTags = this.extractHashtags(textContent)
      suggestions.push(...hashtagTags)
    }

    return suggestions
  }

  /**
   * Extract all text content from bookmark
   */
  private extractTextContent(bookmark: Bookmark): string {
    const parts: string[] = []

    // Title has highest weight
    if (bookmark.title) {
      parts.push(bookmark.title)
      parts.push(bookmark.title) // Double weight
    }

    // Description
    if (bookmark.description) {
      parts.push(bookmark.description)
    }

    // Content (lower priority)
    if (bookmark.content) {
      // Limit content to first 1000 chars for performance
      parts.push(bookmark.content.slice(0, 1000))
    }

    return parts.join(' ')
  }

  /**
   * Extract known tech keywords from text
   */
  private extractTechKeywords(text: string): TagSuggestion[] {
    const suggestions: TagSuggestion[] = []

    // Use the helper function to find tech keywords
    const keywords = findTechKeywords(text)

    // Check if text has technical context
    const hasTechCtx = hasTechContext(text)

    // Deduplicate keywords
    const uniqueKeywords = Array.from(new Set(keywords))

    for (const keyword of uniqueKeywords) {
      const normalized = this.normalizer.normalize(keyword)
      if (normalized.normalized) {
        // Check if this is an ambiguous term that needs context
        if (isAmbiguousTechTerm(normalized.normalized)) {
          if (!hasTechCtx) {
            // Skip ambiguous terms without tech context
            continue
          }
          // Lower confidence for ambiguous terms even with context
          suggestions.push({
            tag: normalized.normalized,
            confidence: 0.7,
            reasoning: `Tech keyword "${keyword}" found in technical content`,
            sources: ['content'],
            strategy: this.name,
          })
        } else {
          // Non-ambiguous tech keyword
          suggestions.push({
            tag: normalized.normalized,
            confidence: 0.85,
            reasoning: `Tech keyword "${keyword}" found in content`,
            sources: ['content'],
            strategy: this.name,
          })
        }
      }
    }

    return suggestions
  }

  /**
   * Extract keywords using Compromise.js NLP
   */
  private extractNlpKeywords(text: string): TagSuggestion[] {
    const suggestions: TagSuggestion[] = []
    const doc = nlp(text)

    // Only extract proper nouns (more reliable than common nouns)
    // These are capitalized entities like company names, products, brands
    const properNouns = doc
      .match('#ProperNoun+') // Match sequences of proper nouns
      .out('array') as string[]

    // Count word frequency to filter out rare mentions
    const wordFrequency = new Map<string, number>()
    properNouns.forEach((noun) => {
      const normalized = this.normalizer.normalize(noun)
      if (normalized.normalized) {
        wordFrequency.set(normalized.normalized, (wordFrequency.get(normalized.normalized) || 0) + 1)
      }
    })

    // Only suggest proper nouns that appear multiple times OR are in title
    const titleLower = text.toLowerCase()
    wordFrequency.forEach((count, normalizedNoun) => {
      // Must be at least 3 characters
      if (normalizedNoun.length < 3) return

      // Check if it appears in title (higher importance)
      const appearsInTitle = titleLower.includes(normalizedNoun.toLowerCase())

      // Require either: appears 2+ times OR appears in title
      if (count >= 2 || appearsInTitle) {
        const confidence = appearsInTitle ? 0.65 : 0.55
        suggestions.push({
          tag: normalizedNoun,
          confidence,
          reasoning: appearsInTitle
            ? `Key entity "${normalizedNoun}" found in title`
            : `Key entity "${normalizedNoun}" mentioned ${count} times`,
          sources: ['content'],
          strategy: this.name,
        })
      }
    })

    return suggestions
  }

  /**
   * Extract hashtags from X/Twitter content
   */
  private extractHashtags(text: string): TagSuggestion[] {
    const suggestions: TagSuggestion[] = []
    const hashtagRegex = /#(\w+)/g
    const matches = text.matchAll(hashtagRegex)

    for (const match of matches) {
      const hashtag = match[1]
      const normalized = this.normalizer.normalize(hashtag)

      if (normalized.normalized && normalized.normalized.length >= 2) {
        suggestions.push({
          tag: normalized.normalized,
          confidence: 0.8,
          reasoning: `Hashtag #${hashtag} found in tweet`,
          sources: ['content'],
          strategy: this.name,
        })
      }
    }

    return suggestions
  }

  /**
   * Check if domain is X/Twitter
   */
  private isTwitterDomain(domain: string): boolean {
    const twitterDomains = ['x.com', 'twitter.com']
    return twitterDomains.some((d) => domain.toLowerCase().includes(d))
  }
}
