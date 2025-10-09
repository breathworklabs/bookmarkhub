/**
 * Smart Tagging Service - Main orchestrator
 * Combines multiple tagging strategies to generate comprehensive tag suggestions
 */

import type {
  TaggingStrategy,
  TaggingResult,
  TaggingOptions,
  TaggingContext,
  TagSuggestion,
} from './types'
import type { Bookmark } from '../../types/bookmark'
import { DEFAULT_TAGGING_OPTIONS } from './config'
import { TagDeduplicator } from './core/TagDeduplicator'
import { DomainTagStrategy } from './strategies/DomainTagStrategy'
import { UrlPatternStrategy } from './strategies/UrlPatternStrategy'
import { NlpKeywordStrategy } from './strategies/NlpKeywordStrategy'
import { LearningStrategy } from './strategies/LearningStrategy'

export class SmartTaggingService {
  private strategies = new Map<string, TaggingStrategy>()
  private deduplicator = new TagDeduplicator()

  constructor() {
    // Register all strategies
    this.registerStrategy(new DomainTagStrategy())
    this.registerStrategy(new UrlPatternStrategy())
    this.registerStrategy(new NlpKeywordStrategy())
    this.registerStrategy(new LearningStrategy())
  }

  /**
   * Register a tagging strategy
   */
  registerStrategy(strategy: TaggingStrategy): void {
    this.strategies.set(strategy.name, strategy)
  }

  /**
   * Generate tag suggestions for a bookmark
   */
  async generateTags(
    bookmark: Bookmark,
    allBookmarks: Bookmark[] = [],
    options: TaggingOptions = {}
  ): Promise<TaggingResult> {
    const startTime = Date.now()
    const mergedOptions = { ...DEFAULT_TAGGING_OPTIONS, ...options }

    // Build context
    const context: TaggingContext = {
      allBookmarks,
      options: mergedOptions,
    }

    // Collect suggestions from all enabled strategies
    const allSuggestions: TagSuggestion[] = []

    for (const strategyName of mergedOptions.enabledStrategies) {
      const strategy = this.strategies.get(strategyName)
      if (!strategy) {
        console.warn(`Strategy "${strategyName}" not found`)
        continue
      }

      try {
        const suggestions = await strategy.generateTags(bookmark, context)
        allSuggestions.push(...suggestions)
      } catch (error) {
        console.error(`Error in strategy "${strategyName}":`, error)
        // Continue with other strategies
      }
    }

    // Deduplicate and boost confidence for tags suggested by multiple sources
    const deduplicated = this.deduplicator.deduplicate(allSuggestions)

    // Sort by confidence (highest first)
    const sorted = deduplicated.sort((a, b) => b.confidence - a.confidence)

    // Apply limit
    const limited = sorted.slice(0, mergedOptions.maxSuggestions)

    // Separate auto-apply vs manual suggestions
    const autoApply = limited.filter((s) => s.confidence >= mergedOptions.autoApplyThreshold)
    const suggestions = limited.filter((s) => s.confidence < mergedOptions.autoApplyThreshold)

    // Calculate metrics
    const endTime = Date.now()
    const metrics = {
      strategiesUsed: mergedOptions.enabledStrategies.length,
      totalSuggestions: allSuggestions.length,
      uniqueSuggestions: deduplicated.length,
      autoApplied: autoApply.length,
      processingTime: endTime - startTime,
    }

    return {
      suggestions,
      autoApply,
      metrics,
    }
  }

  /**
   * Get available strategies
   */
  getStrategies(): string[] {
    return Array.from(this.strategies.keys())
  }

  /**
   * Enable/disable a strategy
   */
  setStrategyEnabled(strategyName: string, enabled: boolean, options: TaggingOptions): void {
    if (enabled) {
      if (!options.enabledStrategies.includes(strategyName)) {
        options.enabledStrategies.push(strategyName)
      }
    } else {
      options.enabledStrategies = options.enabledStrategies.filter((s) => s !== strategyName)
    }
  }
}
