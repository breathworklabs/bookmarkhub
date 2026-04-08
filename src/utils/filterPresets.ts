/**
 * Filter Presets Utility
 * Manages saved filter presets persistence and operations
 */

import { logger } from '@/lib/logger'
import type { DateRangeFilter } from '@/store/bookmarkStore'

const PRESETS_STORAGE_KEY = 'x-bookmark-filter-presets'

export interface SavedFilterPreset {
  id: string
  name: string
  description?: string
  filters: {
    selectedTags: string[]
    searchQuery: string
    authorFilter: string
    domainFilter: string
    contentTypeFilter: string
    dateRangeFilter: DateRangeFilter
    quickFilters: string[]
  }
  createdAt: string
  updatedAt: string
}

/**
 * Generate a unique preset ID
 */
export const generatePresetId = (): string => {
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Create a new filter preset
 */
export const createFilterPreset = (
  name: string,
  filters: SavedFilterPreset['filters'],
  description?: string
): SavedFilterPreset => {
  return {
    id: generatePresetId(),
    name,
    description,
    filters,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Load filter presets from localStorage
 */
export const loadFilterPresets = (): SavedFilterPreset[] => {
  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    logger.warn('Failed to load filter presets', error)
    return []
  }
}

/**
 * Save filter presets to localStorage
 */
export const saveFilterPresets = (presets: SavedFilterPreset[]): void => {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets))
  } catch (error) {
    logger.error('Failed to save filter presets', error)
  }
}

/**
 * Add a new preset to existing presets
 */
export const addPreset = (
  existingPresets: SavedFilterPreset[],
  preset: SavedFilterPreset
): SavedFilterPreset[] => {
  const updatedPresets = [...existingPresets, preset]
  saveFilterPresets(updatedPresets)
  return updatedPresets
}

/**
 * Delete a preset from existing presets
 */
export const deletePreset = (
  existingPresets: SavedFilterPreset[],
  presetId: string
): SavedFilterPreset[] => {
  const updatedPresets = existingPresets.filter((p) => p.id !== presetId)
  saveFilterPresets(updatedPresets)
  return updatedPresets
}

/**
 * Update an existing preset
 */
export const updatePreset = (
  existingPresets: SavedFilterPreset[],
  presetId: string,
  name: string,
  description?: string
): SavedFilterPreset[] => {
  const updatedPresets = existingPresets.map((p) => {
    if (p.id === presetId) {
      return {
        ...p,
        name,
        description,
        updatedAt: new Date().toISOString(),
      }
    }
    return p
  })
  saveFilterPresets(updatedPresets)
  return updatedPresets
}

/**
 * Find a preset by ID
 */
export const findPresetById = (
  presets: SavedFilterPreset[],
  presetId: string
): SavedFilterPreset | undefined => {
  return presets.find((p) => p.id === presetId)
}
