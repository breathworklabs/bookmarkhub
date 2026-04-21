/**
 * Duplicate Detection Service
 * Detects duplicate bookmarks based on URL and title similarity
 */

import type { Bookmark, BookmarkInsert } from '@/types/bookmark'

/**
 * Normalize URL for comparison by removing trailing slashes, query params, and fragments
 */
export const normalizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    // Remove trailing slash, query params, and hash
    let normalized = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`
    normalized = normalized.replace(/\/$/, '') // Remove trailing slash
    return normalized.toLowerCase()
  } catch {
    // If URL parsing fails, just normalize the string
    return url.toLowerCase().trim().replace(/\/$/, '')
  }
}

/**
 * Normalize title for comparison
 */
export const normalizeTitle = (title: string): string => {
  return title.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy title matching
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[len1][len2]
}

/**
 * Calculate similarity percentage between two strings (0-100)
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 100

  const distance = levenshteinDistance(str1, str2)
  return ((maxLen - distance) / maxLen) * 100
}

export interface DuplicateMatch {
  bookmark: Bookmark
  matchType: 'exact' | 'url' | 'title' | 'similar'
  similarity: number // 0-100
  reason: string
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean
  matches: DuplicateMatch[]
}

/**
 * Detect if a bookmark is a duplicate of existing bookmarks
 */
export const detectDuplicate = (
  newBookmark: BookmarkInsert | Bookmark,
  existingBookmarks: Bookmark[],
  options: {
    checkUrl?: boolean
    checkTitle?: boolean
    titleSimilarityThreshold?: number // 0-100, default 85
  } = {}
): DuplicateDetectionResult => {
  const {
    checkUrl = true,
    checkTitle = true,
    titleSimilarityThreshold = 85,
  } = options

  const matches: DuplicateMatch[] = []
  const newUrl = normalizeUrl(newBookmark.url)
  const newTitle = normalizeTitle(newBookmark.title)

  for (const existing of existingBookmarks) {
    const existingUrl = normalizeUrl(existing.url)
    const existingTitle = normalizeTitle(existing.title)

    // Exact match - same URL and title
    if (
      checkUrl &&
      checkTitle &&
      existingUrl === newUrl &&
      existingTitle === newTitle
    ) {
      matches.push({
        bookmark: existing,
        matchType: 'exact',
        similarity: 100,
        reason: 'Identical URL and title',
      })
      continue
    }

    // URL match
    if (checkUrl && existingUrl === newUrl) {
      matches.push({
        bookmark: existing,
        matchType: 'url',
        similarity: 100,
        reason: 'Same URL',
      })
      continue
    }

    // Title match (exact)
    if (checkTitle && existingTitle === newTitle) {
      matches.push({
        bookmark: existing,
        matchType: 'title',
        similarity: 100,
        reason: 'Identical title',
      })
      continue
    }

    // Fuzzy title match
    if (checkTitle && newTitle.length > 10 && existingTitle.length > 10) {
      const similarity = calculateSimilarity(newTitle, existingTitle)
      if (similarity >= titleSimilarityThreshold) {
        matches.push({
          bookmark: existing,
          matchType: 'similar',
          similarity: Math.round(similarity),
          reason: `Similar title (${Math.round(similarity)}% match)`,
        })
      }
    }
  }

  // Sort matches by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity)

  return {
    isDuplicate: matches.length > 0,
    matches,
  }
}

/**
 * Find exact URL duplicates (fastest check)
 */
export const findUrlDuplicates = (
  url: string,
  existingBookmarks: Bookmark[]
): Bookmark[] => {
  const normalizedUrl = normalizeUrl(url)
  return existingBookmarks.filter(
    (bookmark) => normalizeUrl(bookmark.url) === normalizedUrl
  )
}
