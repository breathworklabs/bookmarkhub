/**
 * Smart Tagging Service - Public API
 */

export { SmartTaggingService } from './SmartTaggingService'

export type {
  TagSuggestion,
  TaggingResult,
  TaggingOptions,
  TaggingStrategy,
  TaggingContext,
  TaggingMetrics,
} from './types'

export { DEFAULT_TAGGING_OPTIONS } from './config'

// Core utilities
export { ContentLinkExtractor } from './core/ContentLinkExtractor'
export { TagNormalizer } from './core/TagNormalizer'
export { TagDeduplicator } from './core/TagDeduplicator'

// Strategies
export { DomainTagStrategy } from './strategies/DomainTagStrategy'
export { UrlPatternStrategy } from './strategies/UrlPatternStrategy'
export { NlpKeywordStrategy } from './strategies/NlpKeywordStrategy'
export { LearningStrategy } from './strategies/LearningStrategy'
