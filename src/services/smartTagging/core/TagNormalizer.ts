/**
 * TagNormalizer
 * Cleans and standardizes tags
 */

import type { NormalizationResult, NormalizationReason } from '../types'
import { NORMALIZATION_CONFIG } from '../config'
import { isStopWord } from '../../../data/smartTagging/stopWords'
import { applyTagAlias, hasAlias } from '../../../data/smartTagging/tagAliases'

export class TagNormalizer {
  /**
   * Normalize a tag and return the result with reasoning
   */
  normalize(tag: string): NormalizationResult {
    const original = tag

    // Step 1: Basic cleaning
    let normalized = tag.trim().toLowerCase()

    // Step 2: Check for empty string after trimming
    if (!normalized) {
      return {
        original,
        normalized: null,
        reason: 'invalid',
      }
    }

    // Step 3: Remove special characters (keep hyphens and alphanumeric)
    const beforeSpecialChars = normalized
    normalized = normalized.replace(/[^a-z0-9-]/g, '')

    // Step 4: Remove leading/trailing hyphens
    normalized = normalized.replace(/^-+|-+$/g, '')

    // Step 5: Collapse multiple hyphens into one
    normalized = normalized.replace(/-+/g, '-')

    // Step 6: Check length constraints
    if (normalized.length < NORMALIZATION_CONFIG.minTagLength) {
      return {
        original,
        normalized: null,
        reason: 'too_short',
      }
    }

    if (normalized.length > NORMALIZATION_CONFIG.maxTagLength) {
      // Truncate to max length
      normalized = normalized.substring(0, NORMALIZATION_CONFIG.maxTagLength)
    }

    // Step 7: Check if it's a stop word
    if (isStopWord(normalized)) {
      return {
        original,
        normalized: null,
        reason: 'stop_word',
      }
    }

    // Step 8: Apply aliases
    const beforeAlias = normalized
    normalized = applyTagAlias(normalized)

    const wasAliased = beforeAlias !== normalized

    // Step 9: Final validation
    if (!NORMALIZATION_CONFIG.allowedCharPattern.test(normalized)) {
      return {
        original,
        normalized: null,
        reason: 'special_chars',
      }
    }

    // Determine reason
    let reason: NormalizationReason = 'valid'
    if (wasAliased) {
      reason = 'aliased'
    }

    return {
      original,
      normalized,
      reason,
    }
  }

  /**
   * Normalize a tag and return only the normalized value (or null)
   */
  normalizeTag(tag: string): string | null {
    return this.normalize(tag).normalized
  }

  /**
   * Normalize multiple tags at once
   * Returns only valid normalized tags
   */
  normalizeTags(tags: string[]): string[] {
    return tags
      .map((tag) => this.normalizeTag(tag))
      .filter((tag): tag is string => tag !== null)
  }

  /**
   * Check if a tag would be valid after normalization
   */
  isValid(tag: string): boolean {
    return this.normalizeTag(tag) !== null
  }

  /**
   * Get detailed normalization results for multiple tags
   */
  normalizeWithReasons(tags: string[]): NormalizationResult[] {
    return tags.map((tag) => this.normalize(tag))
  }
}
