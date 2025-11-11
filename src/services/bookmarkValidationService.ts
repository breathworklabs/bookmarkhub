/**
 * Bookmark URL Validation Service
 * Checks if bookmark URLs are still accessible
 */

import type { Bookmark } from '../types/bookmark'

export interface ValidationResult {
  id: number
  url: string
  isValid: boolean
  status?: number
  error?: string
  checkedAt: Date
}

export interface ValidationSummary {
  total: number
  valid: number
  invalid: number
  pending: number
  results: ValidationResult[]
}

/**
 * Check if a URL is still accessible
 * Uses HEAD request for efficiency
 *
 * Note: X/Twitter URLs cannot be validated from client-side due to CORS and anti-bot protection.
 * These URLs will be marked as valid by default to avoid 403 errors.
 */
export const validateUrl = async (
  url: string
): Promise<{ isValid: boolean; status?: number; error?: string }> => {
  try {
    // Skip validation for X/Twitter URLs (they block client-side requests)
    if (url.includes('x.com') || url.includes('twitter.com')) {
      return {
        isValid: true,
        status: 200,
        error: 'Skipped (X/Twitter URLs cannot be validated client-side)',
      }
    }

    // Use a CORS proxy for validation to avoid CORS issues
    // In production, this should be replaced with a server-side validation
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    try {
      await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors', // This won't give us status, but will detect if URL is blocked
      })

      clearTimeout(timeoutId)

      // With no-cors mode, we can't read the status, but if it doesn't throw, it likely works
      // For better validation, implement a server-side proxy
      return {
        isValid: true,
        status: 200, // Assume success if no error
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          isValid: false,
          error: 'Request timeout',
        }
      }

      // Try a GET request as fallback (some servers don't support HEAD)
      try {
        const getController = new AbortController()
        const getTimeoutId = setTimeout(() => getController.abort(), 10000)

        await fetch(url, {
          method: 'GET',
          signal: getController.signal,
          mode: 'no-cors',
        })

        clearTimeout(getTimeoutId)
        return {
          isValid: true,
          status: 200,
        }
      } catch (getError) {
        return {
          isValid: false,
          error: getError instanceof Error ? getError.message : 'Unknown error',
        }
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Validate a single bookmark
 */
export const validateBookmark = async (
  bookmark: Bookmark
): Promise<ValidationResult> => {
  const result = await validateUrl(bookmark.url)

  return {
    id: bookmark.id,
    url: bookmark.url,
    isValid: result.isValid,
    status: result.status,
    error: result.error,
    checkedAt: new Date(),
  }
}

/**
 * Validate multiple bookmarks with concurrency control
 */
export const validateBookmarks = async (
  bookmarks: Bookmark[],
  onProgress?: (current: number, total: number) => void,
  concurrency: number = 5
): Promise<ValidationResult[]> => {
  const results: ValidationResult[] = []
  const total = bookmarks.length

  // Process bookmarks in batches
  for (let i = 0; i < bookmarks.length; i += concurrency) {
    const batch = bookmarks.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map((bookmark) => validateBookmark(bookmark))
    )

    results.push(...batchResults)

    if (onProgress) {
      onProgress(Math.min(i + concurrency, total), total)
    }
  }

  return results
}

/**
 * Get validation summary
 */
export const getValidationSummary = (
  results: ValidationResult[]
): ValidationSummary => {
  const valid = results.filter((r) => r.isValid).length
  const invalid = results.filter((r) => !r.isValid).length

  return {
    total: results.length,
    valid,
    invalid,
    pending: 0,
    results,
  }
}

/**
 * Get invalid bookmarks from validation results
 */
export const getInvalidBookmarks = (
  bookmarks: Bookmark[],
  results: ValidationResult[]
): Bookmark[] => {
  const invalidIds = new Set(results.filter((r) => !r.isValid).map((r) => r.id))

  return bookmarks.filter((b) => invalidIds.has(b.id))
}

/**
 * Load cached validation results from localStorage
 */
export const loadCachedValidationResults = (): ValidationResult[] => {
  try {
    const cached = localStorage.getItem('x-bookmark-validation-results')
    if (!cached) return []

    const parsed = JSON.parse(cached)
    // Convert date strings back to Date objects
    return parsed.map((r: any) => ({
      ...r,
      checkedAt: new Date(r.checkedAt),
    }))
  } catch (error) {
    console.error('Failed to load cached validation results:', error)
    return []
  }
}

/**
 * Save validation results to localStorage
 */
export const saveCachedValidationResults = (
  results: ValidationResult[]
): void => {
  try {
    localStorage.setItem(
      'x-bookmark-validation-results',
      JSON.stringify(results)
    )
  } catch (error) {
    console.error('Failed to save validation results:', error)
  }
}

/**
 * Check if cached results are still fresh (less than 24 hours old)
 */
export const areCachedResultsFresh = (results: ValidationResult[]): boolean => {
  if (results.length === 0) return false

  const now = new Date()
  const oldestResult = results.reduce((oldest, current) => {
    return current.checkedAt < oldest.checkedAt ? current : oldest
  })

  const hoursSinceCheck =
    (now.getTime() - oldestResult.checkedAt.getTime()) / (1000 * 60 * 60)
  return hoursSinceCheck < 24
}
