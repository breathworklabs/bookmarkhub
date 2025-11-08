/**
 * TagDeduplicator
 * Removes duplicate tags and combines suggestions from multiple sources
 */

import type { TagSuggestion } from '../types'

export class TagDeduplicator {
  /**
   * Deduplicate tag suggestions
   * Combines suggestions for the same tag from multiple sources
   */
  deduplicate(suggestions: TagSuggestion[]): TagSuggestion[] {
    const tagMap = new Map<string, TagSuggestion>()

    suggestions.forEach((suggestion) => {
      const existing = tagMap.get(suggestion.tag)

      if (existing) {
        // Tag already exists - combine with existing
        this.mergeSuggestions(existing, suggestion)
      } else {
        // New tag - add to map
        tagMap.set(suggestion.tag, { ...suggestion })
      }
    })

    // Convert back to array and sort by confidence (descending)
    return Array.from(tagMap.values()).sort(
      (a, b) => b.confidence - a.confidence
    )
  }

  /**
   * Merge two suggestions for the same tag
   * Updates the existing suggestion in place
   */
  private mergeSuggestions(
    existing: TagSuggestion,
    newSuggestion: TagSuggestion
  ): void {
    // Combine sources (avoid duplicates)
    const combinedSources = new Set([
      ...existing.sources,
      ...newSuggestion.sources,
    ])
    existing.sources = Array.from(combinedSources)

    // Boost confidence when multiple sources agree
    // Formula: max(confidence) + 0.1 * (number of additional sources)
    // But never exceed 1.0
    const confidenceBoost = (combinedSources.size - 1) * 0.1
    existing.confidence = Math.min(
      1.0,
      Math.max(existing.confidence, newSuggestion.confidence) + confidenceBoost
    )

    // Combine reasoning if provided
    if (newSuggestion.reasoning) {
      if (existing.reasoning) {
        // Only add if different
        if (!existing.reasoning.includes(newSuggestion.reasoning)) {
          existing.reasoning += `; ${newSuggestion.reasoning}`
        }
      } else {
        existing.reasoning = newSuggestion.reasoning
      }
    }
  }

  /**
   * Remove exact duplicates from an array of tags
   */
  deduplicateSimple(tags: string[]): string[] {
    return Array.from(new Set(tags))
  }

  /**
   * Combine suggestions and remove exact duplicates
   * Useful when you have suggestions from multiple strategies
   */
  combineAndDeduplicate(suggestionsArrays: TagSuggestion[][]): TagSuggestion[] {
    const allSuggestions = suggestionsArrays.flat()
    return this.deduplicate(allSuggestions)
  }
}
