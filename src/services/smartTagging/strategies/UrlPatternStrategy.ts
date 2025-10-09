/**
 * UrlPatternStrategy
 * Generates tags based on URL path patterns
 * Checks both embedded links and bookmark URL
 */

import type { Bookmark } from '../../../types/bookmark'
import type { TaggingStrategy, TagSuggestion, TaggingContext } from '../types'
import { ContentLinkExtractor } from '../core/ContentLinkExtractor'
import { matchUrlPatterns } from '../../../data/smartTagging/urlPatterns'

export class UrlPatternStrategy implements TaggingStrategy {
  readonly name = 'url' as const

  private linkExtractor = new ContentLinkExtractor()

  async generateTags(bookmark: Bookmark, context: TaggingContext): Promise<TagSuggestion[]> {
    const suggestions: TagSuggestion[] = []
    const processedUrls = new Set<string>()

    // Strategy 1: Check embedded links first (priority for X/Twitter)
    const embeddedLinks = this.linkExtractor.extractLinks(bookmark)
    for (const link of embeddedLinks) {
      const matches = matchUrlPatterns(link.url)
      for (const match of matches) {
        match.tags.forEach((tag) => {
          suggestions.push({
            tag,
            confidence: match.confidence * link.confidence,
            sources: ['url'],
            strategy: 'url',
            reasoning: `URL pattern in: ${link.url}`,
          })
        })
      }
      processedUrls.add(link.url)
    }

    // Strategy 2: Check bookmark URL (if not already processed and not Twitter)
    if (!processedUrls.has(bookmark.url) && !this.isTwitterUrl(bookmark.url)) {
      const matches = matchUrlPatterns(bookmark.url)
      for (const match of matches) {
        match.tags.forEach((tag) => {
          // Check if we already have this tag from embedded links
          const existing = suggestions.find((s) => s.tag === tag)
          if (!existing) {
            suggestions.push({
              tag,
              confidence: match.confidence,
              sources: ['url'],
              strategy: 'url',
              reasoning: `URL pattern in: ${bookmark.url}`,
            })
          }
        })
      }
    }

    return suggestions
  }

  /**
   * Check if URL is a Twitter/X link
   */
  private isTwitterUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.toLowerCase()
      return (
        domain.includes('twitter.com') ||
        domain.includes('x.com') ||
        domain === 't.co'
      )
    } catch {
      return false
    }
  }
}
