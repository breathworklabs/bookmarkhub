/**
 * Learning-based tagging strategy
 * Learns from user behavior patterns to suggest relevant tags
 */

import type { TaggingStrategy, TagSuggestion, TaggingContext } from '../types'
import type { Bookmark } from '../../../types/bookmark'
import { TagNormalizer } from '../core/TagNormalizer'

interface TagPattern {
  tag: string
  frequency: number
  coOccurrences: Map<string, number> // Other tags that appear with this tag
}

interface DomainPattern {
  domain: string
  tags: Map<string, number> // Tag -> frequency
}

interface AuthorPattern {
  author: string
  tags: Map<string, number> // Tag -> frequency
}

export class LearningStrategy implements TaggingStrategy {
  readonly name = 'learning'
  private normalizer = new TagNormalizer()

  // Pattern caches
  private tagPatterns = new Map<string, TagPattern>()
  private domainPatterns = new Map<string, DomainPattern>()
  private authorPatterns = new Map<string, AuthorPattern>()

  /**
   * Generate tag suggestions based on learned patterns
   */
  async generateTags(bookmark: Bookmark, context: TaggingContext): Promise<TagSuggestion[]> {
    const suggestions: TagSuggestion[] = []

    // Learn from existing bookmarks if not already done
    if (this.tagPatterns.size === 0 && context.allBookmarks.length > 0) {
      this.learnFromBookmarks(context.allBookmarks)
    }

    // Strategy 1: Suggest tags based on domain patterns
    const domainSuggestions = this.suggestFromDomain(bookmark)
    suggestions.push(...domainSuggestions)

    // Strategy 2: Suggest tags based on author patterns
    if (bookmark.author) {
      const authorSuggestions = this.suggestFromAuthor(bookmark)
      suggestions.push(...authorSuggestions)
    }

    // Strategy 3: Suggest tags based on existing tags (co-occurrence)
    if (bookmark.tags && bookmark.tags.length > 0) {
      const coOccurrenceSuggestions = this.suggestFromCoOccurrence(bookmark.tags)
      suggestions.push(...coOccurrenceSuggestions)
    }

    return suggestions
  }

  /**
   * Learn patterns from existing bookmarks
   */
  private learnFromBookmarks(bookmarks: Bookmark[]): void {
    // Only learn from bookmarks that have user-applied tags
    const taggedBookmarks = bookmarks.filter((b) => b.tags && b.tags.length > 0)

    for (const bookmark of taggedBookmarks) {
      const tags = bookmark.tags || []

      // Learn tag patterns and co-occurrences
      this.learnTagPatterns(tags)

      // Learn domain patterns
      this.learnDomainPattern(bookmark.domain, tags)

      // Learn author patterns
      if (bookmark.author) {
        this.learnAuthorPattern(bookmark.author, tags)
      }
    }
  }

  /**
   * Learn tag patterns and co-occurrences
   */
  private learnTagPatterns(tags: string[]): void {
    for (const tag of tags) {
      // Update tag frequency
      let pattern = this.tagPatterns.get(tag)
      if (!pattern) {
        pattern = { tag, frequency: 0, coOccurrences: new Map() }
        this.tagPatterns.set(tag, pattern)
      }
      pattern.frequency++

      // Update co-occurrences
      for (const otherTag of tags) {
        if (otherTag !== tag) {
          const count = pattern.coOccurrences.get(otherTag) || 0
          pattern.coOccurrences.set(otherTag, count + 1)
        }
      }
    }
  }

  /**
   * Learn domain-tag associations
   */
  private learnDomainPattern(domain: string, tags: string[]): void {
    let pattern = this.domainPatterns.get(domain)
    if (!pattern) {
      pattern = { domain, tags: new Map() }
      this.domainPatterns.set(domain, pattern)
    }

    for (const tag of tags) {
      const count = pattern.tags.get(tag) || 0
      pattern.tags.set(tag, count + 1)
    }
  }

  /**
   * Learn author-tag associations
   */
  private learnAuthorPattern(author: string, tags: string[]): void {
    let pattern = this.authorPatterns.get(author)
    if (!pattern) {
      pattern = { author, tags: new Map() }
      this.authorPatterns.set(author, pattern)
    }

    for (const tag of tags) {
      const count = pattern.tags.get(tag) || 0
      pattern.tags.set(tag, count + 1)
    }
  }

  /**
   * Suggest tags based on domain patterns
   */
  private suggestFromDomain(bookmark: Bookmark): TagSuggestion[] {
    const suggestions: TagSuggestion[] = []
    const pattern = this.domainPatterns.get(bookmark.domain)

    if (!pattern) {
      return []
    }

    // Calculate total tags for this domain
    const totalTags = Array.from(pattern.tags.values()).reduce((sum, count) => sum + count, 0)

    // Suggest tags that appear frequently for this domain
    for (const [tag, count] of pattern.tags.entries()) {
      const frequency = count / totalTags
      const normalized = this.normalizer.normalize(tag)

      // Only suggest if frequency is significant (>20%) and tag is valid
      if (frequency > 0.2 && normalized.normalized) {
        // Skip if tag is already applied
        if (bookmark.tags?.includes(normalized.normalized)) {
          continue
        }

        suggestions.push({
          tag: normalized.normalized,
          confidence: Math.min(0.7, frequency), // Cap at 0.7
          reasoning: `Used ${count} times for ${bookmark.domain} bookmarks`,
          sources: ['history'],
          strategy: this.name,
        })
      }
    }

    return suggestions
  }

  /**
   * Suggest tags based on author patterns
   */
  private suggestFromAuthor(bookmark: Bookmark): TagSuggestion[] {
    const suggestions: TagSuggestion[] = []
    const pattern = this.authorPatterns.get(bookmark.author!)

    if (!pattern) {
      return []
    }

    // Calculate total tags for this author
    const totalTags = Array.from(pattern.tags.values()).reduce((sum, count) => sum + count, 0)

    // Suggest tags that appear frequently for this author
    for (const [tag, count] of pattern.tags.entries()) {
      const frequency = count / totalTags
      const normalized = this.normalizer.normalize(tag)

      // Only suggest if frequency is significant (>25%) and tag is valid
      if (frequency > 0.25 && normalized.normalized) {
        // Skip if tag is already applied
        if (bookmark.tags?.includes(normalized.normalized)) {
          continue
        }

        suggestions.push({
          tag: normalized.normalized,
          confidence: Math.min(0.65, frequency), // Cap at 0.65
          reasoning: `Used ${count} times for content by ${bookmark.author}`,
          sources: ['history'],
          strategy: this.name,
        })
      }
    }

    return suggestions
  }

  /**
   * Suggest tags based on co-occurrence patterns
   */
  private suggestFromCoOccurrence(existingTags: string[]): TagSuggestion[] {
    const suggestions: TagSuggestion[] = []
    const candidateTags = new Map<string, number>() // tag -> total co-occurrence score

    // Collect co-occurrence scores from all existing tags
    for (const existingTag of existingTags) {
      const pattern = this.tagPatterns.get(existingTag)
      if (!pattern) {
        continue
      }

      for (const [coTag, count] of pattern.coOccurrences.entries()) {
        // Skip if already in existing tags
        if (existingTags.includes(coTag)) {
          continue
        }

        const currentScore = candidateTags.get(coTag) || 0
        candidateTags.set(coTag, currentScore + count)
      }
    }

    // Convert to suggestions
    for (const [tag, score] of candidateTags.entries()) {
      const normalized = this.normalizer.normalize(tag)

      if (normalized.normalized) {
        // Confidence based on co-occurrence frequency
        // Higher score = more frequent co-occurrence
        const confidence = Math.min(0.75, score / 10) // Cap at 0.75

        suggestions.push({
          tag: normalized.normalized,
          confidence,
          reasoning: `Often used together with ${existingTags.join(', ')}`,
          sources: ['history'],
          strategy: this.name,
        })
      }
    }

    // Sort by confidence and return top suggestions
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
  }

  /**
   * Reset learned patterns (useful for testing)
   */
  reset(): void {
    this.tagPatterns.clear()
    this.domainPatterns.clear()
    this.authorPatterns.clear()
  }
}
