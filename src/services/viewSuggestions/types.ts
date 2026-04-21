import type { ViewInsert } from '@/types/views'

export interface ViewSuggestion {
  /** Unique ID for this suggestion (for React keys and dismiss tracking) */
  id: string
  /** The ViewInsert that would be created if accepted */
  view: ViewInsert
  /** Why we're suggesting this (shown in UI) */
  reasoning: string
  /** How many bookmarks match this suggestion */
  bookmarkCount: number
  /** Confidence 0-1 */
  confidence: number
  /** Type of suggestion */
  type: 'tag-cluster' | 'domain-cluster' | 'frequent-tag'
}

export interface ViewSuggestionOptions {
  /** Max suggestions to return (default: 5) */
  maxSuggestions?: number
  /** Minimum bookmarks for a suggestion (default: 3) */
  minBookmarkCount?: number
  /** Minimum confidence (default: 0.5) */
  minConfidence?: number
}
