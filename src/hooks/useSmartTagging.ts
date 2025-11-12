/**
 * React hook for smart tagging functionality
 */

import { useState, useCallback, useMemo } from 'react'
import { SmartTaggingService } from '../services/smartTagging/SmartTaggingService'
import type {
  TaggingResult,
  TaggingOptions,
  TagSuggestion,
} from '../services/smartTagging/types'
import type { Bookmark } from '../types/bookmark'
import { logger } from '../lib/logger'

interface UseSmartTaggingOptions extends TaggingOptions {
  autoFetch?: boolean // Auto-fetch suggestions when bookmark changes
}

interface UseSmartTaggingReturn {
  // State
  suggestions: TagSuggestion[]
  autoApply: TagSuggestion[]
  isLoading: boolean
  error: Error | null
  metrics: TaggingResult['metrics'] | null

  // Actions
  generateTags: (bookmark: Bookmark, allBookmarks?: Bookmark[]) => Promise<void>
  applyTag: (tag: string, bookmark: Bookmark) => void
  dismissTag: (tag: string) => void
  reset: () => void

  // Utils
  hassuggestions: boolean
}

export function useSmartTagging(
  options: UseSmartTaggingOptions = {}
): UseSmartTaggingReturn {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [autoApply, setAutoApply] = useState<TagSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [metrics, setMetrics] = useState<TaggingResult['metrics'] | null>(null)

  // Memoize options to prevent re-creating on every render
  const memoizedOptions = useMemo(
    () => options,
    [
      options.autoApplyThreshold,
      options.maxSuggestions,
      options.enabledStrategies?.join(','),
      options.customDomainRules?.length,
    ]
  )

  // Create service instance (memoized)
  const service = useMemo(() => new SmartTaggingService(), [])

  /**
   * Generate tag suggestions for a bookmark
   */
  const generateTags = useCallback(
    async (bookmark: Bookmark, allBookmarks: Bookmark[] = []) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await service.generateTags(
          bookmark,
          allBookmarks,
          memoizedOptions
        )

        setSuggestions(result.suggestions)
        setAutoApply(result.autoApply)
        setMetrics(result.metrics)
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to generate tags')
        setError(error)
        logger.error('Error generating tags', error)
      } finally {
        setIsLoading(false)
      }
    },
    [service, memoizedOptions]
  )

  /**
   * Apply a suggested tag to a bookmark
   */
  const applyTag = useCallback((tag: string, bookmark: Bookmark) => {
    // Add tag to bookmark
    if (!bookmark.tags) {
      bookmark.tags = []
    }

    if (!bookmark.tags.includes(tag)) {
      bookmark.tags.push(tag)
    }

    // Remove from suggestions
    setSuggestions((prev) => prev.filter((s) => s.tag !== tag))
    setAutoApply((prev) => prev.filter((s) => s.tag !== tag))
  }, [])

  /**
   * Dismiss a tag suggestion
   */
  const dismissTag = useCallback((tag: string) => {
    setSuggestions((prev) => prev.filter((s) => s.tag !== tag))
    setAutoApply((prev) => prev.filter((s) => s.tag !== tag))
  }, [])

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setSuggestions([])
    setAutoApply([])
    setIsLoading(false)
    setError(null)
    setMetrics(null)
  }, [])

  /**
   * Check if there are any suggestions
   */
  const hassuggestions = suggestions.length > 0 || autoApply.length > 0

  return {
    suggestions,
    autoApply,
    isLoading,
    error,
    metrics,
    generateTags,
    applyTag,
    dismissTag,
    reset,
    hassuggestions,
  }
}

/**
 * Hook for managing tagging options
 */
export function useTaggingOptions(initialOptions: TaggingOptions = {}) {
  const [options, setOptions] = useState<TaggingOptions>(initialOptions)

  const updateOption = useCallback(
    <K extends keyof TaggingOptions>(key: K, value: TaggingOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const toggleStrategy = useCallback((strategyName: string) => {
    setOptions((prev) => {
      const enabledStrategies = prev.enabledStrategies || [
        'domain',
        'url',
        'nlp',
        'learning',
      ]

      const isEnabled = enabledStrategies.includes(strategyName)

      return {
        ...prev,
        enabledStrategies: isEnabled
          ? enabledStrategies.filter((s) => s !== strategyName)
          : [...enabledStrategies, strategyName],
      }
    })
  }, [])

  const resetOptions = useCallback(() => {
    setOptions(initialOptions)
  }, [initialOptions])

  return {
    options,
    updateOption,
    toggleStrategy,
    resetOptions,
  }
}
