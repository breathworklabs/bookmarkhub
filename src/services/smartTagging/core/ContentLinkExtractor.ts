/**
 * ContentLinkExtractor
 * Extracts and analyzes URLs from bookmark content
 * Handles X/Twitter bookmarks with embedded links
 */

import type { Bookmark } from '../../../types/bookmark'
import type { ExtractedLink } from '../types'
import { LINK_EXTRACTION_CONFIG } from '../config'

export class ContentLinkExtractor {
  // Regex to match URLs in text (supports http/https)
  private static readonly URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi

  // Twitter/X domains to skip
  private static readonly TWITTER_DOMAINS = new Set([
    'x.com',
    'twitter.com',
    't.co', // Twitter's URL shortener
    'twimg.com', // Twitter images
  ])

  /**
   * Extract all valid URLs from bookmark content
   */
  extractLinks(bookmark: Bookmark): ExtractedLink[] {
    const sources = [
      { text: bookmark.description || '', weight: 1.0 },
      { text: bookmark.content || '', weight: 0.9 },
      { text: bookmark.title || '', weight: 0.8 },
    ]

    const allLinks: ExtractedLink[] = []

    sources.forEach(({ text, weight }) => {
      if (!text) return

      const links = this.findUrlsInText(text, weight)
      allLinks.push(...links)
    })

    return this.deduplicateLinks(allLinks)
  }

  /**
   * Find URLs in a given text with context
   */
  private findUrlsInText(text: string, sourceWeight: number): ExtractedLink[] {
    // Reset regex state
    ContentLinkExtractor.URL_PATTERN.lastIndex = 0

    const matches = text.matchAll(ContentLinkExtractor.URL_PATTERN)
    const links: ExtractedLink[] = []

    for (const match of matches) {
      const url = match[0]
      const position = match.index || 0

      // Skip X/Twitter links (they're the bookmark source, not the content)
      if (this.isTwitterUrl(url)) {
        continue
      }

      // Extract domain
      const domain = this.extractDomain(url)
      if (!domain) continue

      // Get context (surrounding text)
      const context = this.extractContext(text, position, url.length)

      // Calculate confidence based on position, context, and source
      const confidence = this.calculateLinkConfidence(
        url,
        position,
        text.length,
        context,
        sourceWeight
      )

      // Only include if confidence meets minimum threshold
      if (confidence >= LINK_EXTRACTION_CONFIG.minLinkConfidence) {
        links.push({ url, domain, position, context, confidence })
      }
    }

    return links
  }

  /**
   * Check if URL is a Twitter/X link
   */
  private isTwitterUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.toLowerCase().replace(/^www\./, '')

      return ContentLinkExtractor.TWITTER_DOMAINS.has(domain)
    } catch {
      return false
    }
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace(/^www\./, '')
    } catch {
      return null
    }
  }

  /**
   * Extract context around a URL
   */
  private extractContext(text: string, position: number, urlLength: number): string {
    const windowSize = LINK_EXTRACTION_CONFIG.contextWindowSize
    const start = Math.max(0, position - windowSize)
    const end = Math.min(text.length, position + urlLength + windowSize)

    return text.substring(start, end).trim()
  }

  /**
   * Calculate confidence score for a link
   */
  private calculateLinkConfidence(
    url: string,
    position: number,
    textLength: number,
    context: string,
    sourceWeight: number
  ): number {
    let confidence = 0.5 // Base confidence

    // Factor 1: Position in text (earlier = more relevant)
    // Links in the first 30% of text are usually more important
    const relativePosition = position / textLength
    if (relativePosition < 0.3) {
      confidence += 0.2
    } else if (relativePosition < 0.6) {
      confidence += 0.1
    }

    // Factor 2: Context quality (descriptive words nearby)
    const contextWords = context.split(/\s+/).length
    if (contextWords > 5) {
      confidence += 0.15
    } else if (contextWords > 3) {
      confidence += 0.1
    }

    // Factor 3: URL quality (not shortened)
    if (!this.isShortened(url)) {
      confidence += 0.1
    }

    // Factor 4: Introductory phrases
    if (this.hasIntroductoryPhrase(context)) {
      confidence += 0.15
    }

    // Factor 5: Source weight (description > content > title)
    confidence *= sourceWeight

    return Math.min(confidence, 1.0)
  }

  /**
   * Check if URL is a shortened link
   */
  private isShortened(url: string): boolean {
    const shorteners = ['bit.ly', 'tinyurl', 'goo.gl', 'ow.ly', 'buff.ly']
    const urlLower = url.toLowerCase()
    return shorteners.some((shortener) => urlLower.includes(shortener))
  }

  /**
   * Check for introductory phrases that indicate link relevance
   */
  private hasIntroductoryPhrase(context: string): boolean {
    const introPatterns = [
      /check\s+out/i,
      /here'?s/i,
      /link:/i,
      /via\s/i,
      /from\s/i,
      /source:/i,
      /read\s+more/i,
      /learn\s+more/i,
      /see\s/i,
      /visit\s/i,
    ]

    return introPatterns.some((pattern) => pattern.test(context))
  }

  /**
   * Remove duplicate links, keeping highest confidence
   */
  private deduplicateLinks(links: ExtractedLink[]): ExtractedLink[] {
    const linkMap = new Map<string, ExtractedLink>()

    links.forEach((link) => {
      const normalizedUrl = this.normalizeUrl(link.url)
      const existing = linkMap.get(normalizedUrl)

      if (!existing || link.confidence > existing.confidence) {
        linkMap.set(normalizedUrl, link)
      }
    })

    // Sort by confidence (descending)
    return Array.from(linkMap.values()).sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Normalize URL for deduplication
   * Removes tracking parameters and trailing slashes
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)

      // Remove common tracking parameters
      const trackingParams = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'ref',
        'source',
      ]

      trackingParams.forEach((param) => {
        urlObj.searchParams.delete(param)
      })

      // Remove trailing slash
      let normalized = urlObj.href
      if (normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1)
      }

      return normalized
    } catch {
      return url
    }
  }

  /**
   * Get the most relevant link from a bookmark
   */
  getPrimaryLink(bookmark: Bookmark): ExtractedLink | null {
    const links = this.extractLinks(bookmark)
    return links.length > 0 ? links[0] : null
  }

  /**
   * Check if bookmark has any embedded links
   */
  hasEmbeddedLinks(bookmark: Bookmark): boolean {
    return this.extractLinks(bookmark).length > 0
  }

  /**
   * Get all domains from embedded links
   */
  getEmbeddedDomains(bookmark: Bookmark): string[] {
    const links = this.extractLinks(bookmark)
    return Array.from(new Set(links.map((link) => link.domain)))
  }
}
