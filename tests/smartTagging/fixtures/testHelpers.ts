/**
 * Test helper utilities for smart tagging tests
 */

import { expect } from 'vitest'
import type {
  TagSuggestion,
  TaggingResult,
} from '../../../src/services/smartTagging/types'

/**
 * Assert that a tag suggestion has the correct shape
 */
export function expectValidTagSuggestion(suggestion: any): void {
  expect(suggestion).toHaveProperty('tag')
  expect(suggestion).toHaveProperty('confidence')
  expect(suggestion).toHaveProperty('sources')

  expect(typeof suggestion.tag).toBe('string')
  expect(typeof suggestion.confidence).toBe('number')
  expect(Array.isArray(suggestion.sources)).toBe(true)

  expect(suggestion.confidence).toBeGreaterThanOrEqual(0)
  expect(suggestion.confidence).toBeLessThanOrEqual(1)
  expect(suggestion.tag.length).toBeGreaterThan(0)
}

/**
 * Assert that a tagging result has the correct shape
 */
export function expectValidTaggingResult(result: any): void {
  expect(result).toHaveProperty('suggestions')
  expect(result).toHaveProperty('autoApplied')
  expect(result).toHaveProperty('needsReview')
  expect(result).toHaveProperty('metrics')

  expect(Array.isArray(result.suggestions)).toBe(true)
  expect(Array.isArray(result.autoApplied)).toBe(true)
  expect(Array.isArray(result.needsReview)).toBe(true)

  // Validate metrics
  expect(result.metrics).toHaveProperty('processingTime')
  expect(result.metrics).toHaveProperty('strategyTimes')
  expect(result.metrics).toHaveProperty('suggestionCounts')

  expect(typeof result.metrics.processingTime).toBe('number')
  expect(result.metrics.processingTime).toBeGreaterThanOrEqual(0)

  // Validate each suggestion
  result.suggestions.forEach((suggestion: any) => {
    expectValidTagSuggestion(suggestion)
  })
}

/**
 * Find a tag suggestion by tag name
 */
export function findSuggestionByTag(
  suggestions: TagSuggestion[],
  tag: string
): TagSuggestion | undefined {
  return suggestions.find((s) => s.tag === tag)
}

/**
 * Assert that a tag exists in suggestions
 */
export function expectTagInSuggestions(
  suggestions: TagSuggestion[],
  tag: string,
  minConfidence?: number
): void {
  const suggestion = findSuggestionByTag(suggestions, tag)
  expect(
    suggestion,
    `Expected to find tag "${tag}" in suggestions`
  ).toBeDefined()

  if (minConfidence !== undefined && suggestion) {
    expect(
      suggestion.confidence,
      `Expected "${tag}" to have confidence >= ${minConfidence}`
    ).toBeGreaterThanOrEqual(minConfidence)
  }
}

/**
 * Assert that a tag does NOT exist in suggestions
 */
export function expectTagNotInSuggestions(
  suggestions: TagSuggestion[],
  tag: string
): void {
  const suggestion = findSuggestionByTag(suggestions, tag)
  expect(
    suggestion,
    `Expected NOT to find tag "${tag}" in suggestions`
  ).toBeUndefined()
}

/**
 * Measure execution time of a function
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; timeMs: number }> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()

  return {
    result,
    timeMs: end - start,
  }
}

/**
 * Assert that execution time is within budget
 */
export async function expectWithinTimeBudget<T>(
  fn: () => Promise<T>,
  maxTimeMs: number
): Promise<T> {
  const { result, timeMs } = await measureExecutionTime(fn)

  expect(
    timeMs,
    `Expected execution to complete within ${maxTimeMs}ms, but took ${timeMs.toFixed(2)}ms`
  ).toBeLessThan(maxTimeMs)

  return result
}

/**
 * Create a delay promise (useful for testing async behavior)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Assert confidence is within valid range
 */
export function expectValidConfidence(confidence: number): void {
  expect(confidence).toBeGreaterThanOrEqual(0)
  expect(confidence).toBeLessThanOrEqual(1)
}

/**
 * Sort suggestions by confidence (descending)
 */
export function sortByConfidence(
  suggestions: TagSuggestion[]
): TagSuggestion[] {
  return [...suggestions].sort((a, b) => b.confidence - a.confidence)
}

/**
 * Get unique tags from suggestions
 */
export function getUniqueTags(suggestions: TagSuggestion[]): string[] {
  return Array.from(new Set(suggestions.map((s) => s.tag)))
}

/**
 * Assert no duplicate tags in suggestions
 */
export function expectNoDuplicateTags(suggestions: TagSuggestion[]): void {
  const tags = suggestions.map((s) => s.tag)
  const uniqueTags = new Set(tags)

  expect(
    tags.length,
    `Expected no duplicate tags, but found: ${JSON.stringify(tags)}`
  ).toBe(uniqueTags.size)
}
