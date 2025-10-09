/**
 * Type definitions for Smart Tagging System
 * X/Twitter-aware auto-tagging with rule-based NLP
 */

import type { Bookmark } from '../../types/bookmark'

// ==================== Core Types ====================

/**
 * A tag suggestion with metadata
 */
export interface TagSuggestion {
  /** The normalized tag text */
  tag: string
  /** Confidence score 0-1 */
  confidence: number
  /** Which strategies generated this tag */
  sources: TagSource[]
  /** Strategy that generated this suggestion */
  strategy: string
  /** Reasoning for the suggestion */
  reasoning: string
}

/**
 * Source of a tag suggestion
 */
export type TagSource = 'domain' | 'url' | 'nlp' | 'learning' | 'content' | 'history'

/**
 * Result of tag generation
 */
export interface TaggingResult {
  /** Manual suggestions (confidence < threshold) */
  suggestions: TagSuggestion[]
  /** High confidence tags to auto-apply (confidence >= threshold) */
  autoApply: TagSuggestion[]
  /** Performance metrics */
  metrics: TaggingMetrics
}

/**
 * Performance metrics for a tagging operation
 */
export interface TaggingMetrics {
  /** Number of strategies used */
  strategiesUsed: number
  /** Total suggestions before deduplication */
  totalSuggestions: number
  /** Unique suggestions after deduplication */
  uniqueSuggestions: number
  /** Number of tags auto-applied */
  autoApplied: number
  /** Total processing time in ms */
  processingTime: number
}

/**
 * Configuration options for tag generation
 */
export interface TaggingOptions {
  /** Minimum confidence to auto-apply (default: 0.8) */
  autoApplyThreshold?: number
  /** Maximum number of suggestions (default: 10) */
  maxSuggestions?: number
  /** Enable/disable specific strategies */
  enabledStrategies?: string[]
  /** Custom domain rules to merge with defaults */
  customDomainRules?: DomainRule[]
}

// ==================== Strategy Interfaces ====================

/**
 * Base interface for all tagging strategies
 */
export interface TaggingStrategy {
  /** Unique identifier for the strategy */
  readonly name: string
  /** Generate tag suggestions for a bookmark */
  generateTags(
    bookmark: Bookmark,
    context: TaggingContext
  ): Promise<TagSuggestion[]>
}

/**
 * Context passed to strategies
 */
export interface TaggingContext {
  /** All bookmarks for learning */
  allBookmarks: Bookmark[]
  /** Configuration options */
  options: TaggingOptions
}

// ==================== Domain Rules ====================

/**
 * Rule mapping a domain to tags
 */
export interface DomainRule {
  /** Domain pattern (exact or wildcard) */
  domain: string | RegExp
  /** Tags to apply */
  tags: string[]
  /** Optional category */
  category?: string
  /** Base confidence score 0-1 */
  confidence: number
  /** Optional description */
  description?: string
}

/**
 * Result of domain matching
 */
export interface DomainMatch {
  rule: DomainRule
  matchType: 'exact' | 'subdomain' | 'pattern'
  confidence: number
}

// ==================== URL Patterns ====================

/**
 * Pattern for matching URLs
 */
export interface UrlPattern {
  /** Regex or string pattern */
  pattern: RegExp | string
  /** Tags to apply if matched */
  tags: string[]
  /** Base confidence score */
  confidence: number
  /** Optional description */
  description?: string
}

/**
 * Result of URL pattern matching
 */
export interface UrlPatternMatch {
  pattern: UrlPattern
  matchedUrl: string
  confidence: number
}

// ==================== Keyword Extraction ====================

/**
 * Extracted keyword with metadata
 */
export interface ExtractedKeyword {
  /** The keyword text */
  text: string
  /** Confidence score */
  confidence: number
  /** How it was extracted */
  source: KeywordSource
  /** Optional context */
  context?: string
}

/**
 * Source of keyword extraction
 */
export type KeywordSource = 'entity' | 'topic' | 'noun' | 'tech' | 'custom'

// ==================== Link Extraction ====================

/**
 * Extracted link from bookmark content
 */
export interface ExtractedLink {
  /** The full URL */
  url: string
  /** Domain extracted from URL */
  domain: string
  /** Position in text (character index) */
  position: number
  /** Surrounding text context */
  context: string
  /** Confidence score for this link's relevance */
  confidence: number
}

// ==================== Learning ====================

/**
 * Similarity score between bookmarks
 */
export interface SimilarityScore {
  /** The similar bookmark */
  bookmark: Bookmark
  /** Similarity score 0-1 */
  score: number
  /** What fields matched */
  matchedFields: SimilarityField[]
}

/**
 * Field used for similarity matching
 */
export type SimilarityField = 'domain' | 'author' | 'title' | 'description' | 'tags'

// ==================== Normalization ====================

/**
 * Result of tag normalization
 */
export interface NormalizationResult {
  /** Original tag */
  original: string
  /** Normalized tag (or null if invalid) */
  normalized: string | null
  /** Why it was normalized/rejected */
  reason: NormalizationReason
}

/**
 * Reason for normalization decision
 */
export type NormalizationReason =
  | 'valid'
  | 'too_short'
  | 'stop_word'
  | 'special_chars'
  | 'aliased'
  | 'invalid'

// ==================== Settings ====================

/**
 * User preferences for smart tagging
 */
export interface SmartTaggingSettings {
  /** Enable/disable feature */
  enabled: boolean
  /** Auto-tag on bookmark creation */
  autoTagOnCreate: boolean
  /** Auto-tag on import */
  autoTagOnImport: boolean
  /** Confidence threshold for auto-apply */
  autoApplyThreshold: number
  /** Max suggestions to show */
  maxSuggestions: number
  /** Enabled strategies */
  enabledStrategies: TagSource[]
  /** Show confidence scores in UI */
  showConfidence: boolean
  /** Show reasoning in UI */
  showReasoning: boolean
}
