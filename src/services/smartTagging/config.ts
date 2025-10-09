/**
 * Configuration constants for Smart Tagging System
 */

import type { TaggingOptions } from './types'

/**
 * Default configuration for tag generation
 */
export const DEFAULT_TAGGING_OPTIONS: Required<TaggingOptions> = {
  autoApplyThreshold: 0.8,
  maxSuggestions: 10,
  enabledStrategies: ['domain', 'url', 'nlp', 'learning'],
  customDomainRules: [],
}

/**
 * Performance configuration
 */
export const PERFORMANCE_CONFIG = {
  /** Maximum time allowed for tag generation (ms) */
  maxProcessingTime: 100,
  /** Maximum number of similar bookmarks to analyze */
  maxSimilarBookmarks: 5,
  /** Minimum similarity score to consider bookmarks related */
  minSimilarityScore: 0.3,
} as const

/**
 * Link extraction configuration
 */
export const LINK_EXTRACTION_CONFIG = {
  /** Context window around links (characters) */
  contextWindowSize: 20,
  /** Minimum link confidence to consider */
  minLinkConfidence: 0.3,
} as const

/**
 * NLP configuration
 */
export const NLP_CONFIG = {
  /** Maximum keywords to extract */
  maxKeywords: 10,
  /** Minimum keyword length */
  minKeywordLength: 2,
  /** Maximum keyword length */
  maxKeywordLength: 30,
} as const

/**
 * Tag normalization configuration
 */
export const NORMALIZATION_CONFIG = {
  /** Minimum tag length */
  minTagLength: 2,
  /** Maximum tag length */
  maxTagLength: 30,
  /** Character whitelist (lowercase, numbers, hyphens) */
  allowedCharPattern: /^[a-z0-9-]+$/,
} as const
