/**
 * DomainTagStrategy
 * Generates tags based on bookmark domain
 * X/Twitter-aware: checks embedded links first, then bookmark domain
 */

import type { Bookmark } from '@/types/bookmark'
import type { TaggingStrategy, TagSuggestion, TaggingContext } from '@/services/smartTagging/types'
import { ContentLinkExtractor } from '@/services/smartTagging/core/ContentLinkExtractor'
import { findDomainRuleWithSubdomain } from '@/data/smartTagging/domainRules'

export class DomainTagStrategy implements TaggingStrategy {
  readonly name = 'domain' as const

  private linkExtractor = new ContentLinkExtractor()

  async generateTags(
    bookmark: Bookmark,
    context: TaggingContext
  ): Promise<TagSuggestion[]> {
    const suggestions: TagSuggestion[] = []

    // Strategy 1: Check embedded links in content (PRIORITY for X/Twitter)
    const embeddedLinks = this.linkExtractor.extractLinks(bookmark)
    for (const link of embeddedLinks) {
      const rule = findDomainRuleWithSubdomain(link.domain)
      if (rule) {
        rule.tags.forEach((tag) => {
          suggestions.push({
            tag,
            confidence: rule.confidence * link.confidence, // Combine confidences
            sources: ['domain'],
            strategy: 'domain',
            reasoning: `From embedded link: ${link.domain}`,
          })
        })

        // Also add category as a tag if present
        if (rule.category) {
          suggestions.push({
            tag: rule.category,
            confidence: rule.confidence * link.confidence * 0.9,
            sources: ['domain'],
            strategy: 'domain',
            reasoning: `Category from: ${link.domain}`,
          })
        }
      }
    }

    // Strategy 2: Check bookmark domain (FALLBACK for non-X content)
    if (!this.isTwitterDomain(bookmark.domain)) {
      const rule = findDomainRuleWithSubdomain(bookmark.domain)
      if (rule) {
        rule.tags.forEach((tag) => {
          // Check if we already have this tag from embedded links
          const existing = suggestions.find((s) => s.tag === tag)
          if (!existing) {
            suggestions.push({
              tag,
              confidence: rule.confidence,
              sources: ['domain'],
              strategy: 'domain',
              reasoning: `From bookmark domain: ${bookmark.domain}`,
            })
          }
        })

        // Also add category
        if (
          rule.category &&
          !suggestions.find((s) => s.tag === rule.category)
        ) {
          suggestions.push({
            tag: rule.category,
            confidence: rule.confidence * 0.9,
            sources: ['domain'],
            strategy: 'domain',
            reasoning: `Category from: ${bookmark.domain}`,
          })
        }
      }
    }

    // Merge custom domain rules from options
    if (
      context.options.customDomainRules &&
      context.options.customDomainRules.length > 0
    ) {
      for (const customRule of context.options.customDomainRules) {
        const rulePattern = customRule.domain.toString()
        const matches =
          bookmark.domain === rulePattern ||
          embeddedLinks.some((link) => link.domain === rulePattern)

        if (matches) {
          customRule.tags.forEach((tag) => {
            if (!suggestions.find((s) => s.tag === tag)) {
              suggestions.push({
                tag,
                confidence: customRule.confidence,
                sources: ['domain'],
                strategy: 'domain',
                reasoning: `From custom rule: ${rulePattern}`,
              })
            }
          })
        }
      }
    }

    return suggestions
  }

  /**
   * Check if domain is Twitter/X
   */
  private isTwitterDomain(domain: string): boolean {
    const twitterDomains = ['x.com', 'twitter.com', 't.co']
    return twitterDomains.includes(domain.toLowerCase())
  }
}
