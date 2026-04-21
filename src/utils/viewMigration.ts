/**
 * Migration utility: converts legacy collections + filter presets
 * into the unified View format.
 */

import type { View, ViewCriteria, ViewDateRange, ViewShareSettings } from '@/types/views'
import { buildDefaultSystemViews } from '@/store/viewStore'
import { logger } from '@/lib/logger'

// ── Old-format interfaces ─────────────────────────────────────

export interface OldCollectionData {
  id: string
  name: string
  description?: string
  parentId?: string | null
  color?: string
  icon?: string
  isSmartCollection: boolean
  smartCriteria?: { type: string; value?: string; days?: number }
  isDefault: boolean
  bookmarkCount: number
  createdAt: string
  updatedAt: string
  shareSettings?: ViewShareSettings
}

export interface OldFilterPreset {
  id: string
  name: string
  description?: string
  filters: {
    selectedTags: string[]
    searchQuery: string
    authorFilter: string
    domainFilter: string
    contentTypeFilter: string
    dateRangeFilter: { type: string }
    quickFilters: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface OldCollectionBookmarkMap {
  [collectionId: string]: number[]
}

export interface MigrationResult {
  views: View[]
  migrationVersion: number
  migratedAt: string
}

// ── Constants ─────────────────────────────────────────────────

const MIGRATION_FLAG_KEY = 'bookmarkhub_views_migrated'
const VIEWS_STORAGE_KEY = 'bookmarkhub_views'
const FILTER_PRESETS_KEY = 'x-bookmark-filter-presets'
const CONSOLIDATED_KEY = 'x-bookmark-manager-data'
const CURRENT_MIGRATION_VERSION = 1

// ── Smart-criteria → ViewCriteria ─────────────────────────────

export function convertSmartCriteria(criteria: {
  type: string
  value?: string
  days?: number
}): ViewCriteria {
  switch (criteria.type) {
    case 'starred':
      return { starred: true }
    case 'recent':
      return { recentDays: criteria.days ?? 7 }
    case 'archived':
      return { isArchived: true, isDeleted: false }
    case 'uncategorized':
      return { isUncategorized: true, isDeleted: false }
    case 'tag':
      return criteria.value ? { tags: [criteria.value] } : {}
    case 'domain':
      return criteria.value ? { domains: [criteria.value] } : {}
    case 'date_range': {
      const days = criteria.days ?? 7
      let preset: ViewDateRange['preset']
      if (days <= 1) preset = 'today'
      else if (days <= 7) preset = 'week'
      else if (days <= 31) preset = 'month'
      else preset = 'year'
      return { dateRange: { preset } }
    }
    default:
      return {}
  }
}

// ── Filter-preset → ViewCriteria ──────────────────────────────

function mapDateRangeType(type: string): ViewDateRange | undefined {
  switch (type) {
    case 'today':
      return { preset: 'today' }
    case 'week':
      return { preset: 'week' }
    case 'month':
      return { preset: 'month' }
    case 'custom':
      return { preset: 'month' } // best-effort default for custom ranges
    default:
      return undefined
  }
}

function mapQuickFilter(filter: string, criteria: ViewCriteria): ViewCriteria {
  switch (filter) {
    case 'starred':
      return { ...criteria, starred: true }
    case 'unread':
      return { ...criteria, unread: true }
    case 'archived':
      return { ...criteria, isDeleted: false }
    case 'recent':
      return { ...criteria, recentDays: 1 }
    case 'engagement':
      return { ...criteria, minEngagement: 100 }
    case 'broken':
      return { ...criteria, broken: true }
    case 'comments':
      return { ...criteria, withComments: true }
    default:
      return criteria
  }
}

export function convertPresetFilters(
  filters: OldFilterPreset['filters']
): ViewCriteria {
  let criteria: ViewCriteria = {}

  if (filters.selectedTags.length > 0) {
    criteria.tags = [...filters.selectedTags]
    criteria.tagMatch = 'any'
  }

  if (filters.searchQuery.trim()) {
    criteria.query = filters.searchQuery.trim()
  }

  if (filters.authorFilter.trim()) {
    criteria.authors = [filters.authorFilter.trim()]
  }

  if (filters.domainFilter.trim()) {
    criteria.domains = [filters.domainFilter.trim()]
  }

  if (filters.contentTypeFilter) {
    criteria.contentTypes = [filters.contentTypeFilter]
  }

  if (filters.dateRangeFilter && filters.dateRangeFilter.type !== 'all') {
    criteria.dateRange = mapDateRangeType(filters.dateRangeFilter.type)
  }

  for (const qf of filters.quickFilters) {
    criteria = mapQuickFilter(qf, criteria)
  }

  return criteria
}

// ── Main migration ────────────────────────────────────────────

export function migrateToViews(
  oldCollections: OldCollectionData[],
  oldCollectionBookmarks: OldCollectionBookmarkMap,
  oldFilterPresets: OldFilterPreset[]
): MigrationResult {
  const now = new Date().toISOString()
  const views: View[] = buildDefaultSystemViews()

  // Convert user collections → manual views
  let sortOrder = views.length
  for (const coll of oldCollections) {
    // Skip default/smart collections — they're replaced by system views
    if (coll.isDefault || coll.isSmartCollection) continue

    const bookmarkIds = (oldCollectionBookmarks[coll.id] ?? []).map(String)

    views.push({
      id: `view-${coll.id}`,
      name: coll.name,
      icon: coll.icon ? coll.icon.toLowerCase() : 'folder',
      color: coll.color ?? '#4A90D9',
      parentId: coll.parentId ? `view-${coll.parentId}` : null,
      sortOrder: sortOrder++,
      mode: 'manual',
      bookmarkIds,
      criteria: null,
      pinned: true,
      system: false,
      description: coll.description,
      shareSettings: coll.shareSettings,
      createdAt: coll.createdAt,
      updatedAt: now,
      userId: 'local-user',
    })
  }

  // Convert filter presets → dynamic views
  for (const preset of oldFilterPresets) {
    views.push({
      id: `view-preset-${preset.id}`,
      name: preset.name,
      icon: 'filter',
      color: '#4A90D9',
      parentId: null,
      sortOrder: sortOrder++,
      mode: 'dynamic',
      bookmarkIds: [],
      criteria: convertPresetFilters(preset.filters),
      pinned: false,
      system: false,
      description: preset.description,
      createdAt: preset.createdAt,
      updatedAt: now,
      userId: 'local-user',
    })
  }

  return {
    views,
    migrationVersion: CURRENT_MIGRATION_VERSION,
    migratedAt: now,
  }
}

// ── Migration flag helpers ────────────────────────────────────

export function isMigrated(): boolean {
  try {
    const raw = localStorage.getItem(MIGRATION_FLAG_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return (
      typeof parsed === 'object' &&
      parsed !== null &&
      parsed.version >= CURRENT_MIGRATION_VERSION
    )
  } catch {
    return false
  }
}

// ── Load old data from localStorage ───────────────────────────

function loadOldCollections(): OldCollectionData[] {
  try {
    const raw = localStorage.getItem(CONSOLIDATED_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!data.collections) return []
    return data.collections as OldCollectionData[]
  } catch (error) {
    logger.warn('Failed to load old collections for migration', error)
    return []
  }
}

function loadOldCollectionBookmarks(): OldCollectionBookmarkMap {
  try {
    const raw = localStorage.getItem(CONSOLIDATED_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    if (!data.bookmarkCollections) return {}

    // Convert BookmarkCollection[] → Record<collectionId, bookmarkId[]>
    const bookmarkCollections: { bookmarkId: number; collectionId: string }[] =
      data.bookmarkCollections
    const map: OldCollectionBookmarkMap = {}
    for (const bc of bookmarkCollections) {
      if (!map[bc.collectionId]) map[bc.collectionId] = []
      map[bc.collectionId].push(bc.bookmarkId)
    }
    return map
  } catch (error) {
    logger.warn('Failed to load old collection bookmarks for migration', error)
    return {}
  }
}

function loadOldFilterPresets(): OldFilterPreset[] {
  try {
    const raw = localStorage.getItem(FILTER_PRESETS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as OldFilterPreset[]
  } catch (error) {
    logger.warn('Failed to load old filter presets for migration', error)
    return []
  }
}

// ── Run full migration ────────────────────────────────────────

export function runMigration(): MigrationResult {
  if (isMigrated()) {
    return {
      views: readViewsFromMigrationStorage(),
      migrationVersion: CURRENT_MIGRATION_VERSION,
      migratedAt: new Date().toISOString(),
    }
  }

  const collections = loadOldCollections()
  const collectionBookmarks = loadOldCollectionBookmarks()
  const filterPresets = loadOldFilterPresets()

  const result = migrateToViews(collections, collectionBookmarks, filterPresets)

  localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(result.views))
  localStorage.setItem(
    MIGRATION_FLAG_KEY,
    JSON.stringify({ version: CURRENT_MIGRATION_VERSION })
  )

  logger.debug(
    `View migration complete: ${result.views.length} views created (v${CURRENT_MIGRATION_VERSION})`
  )

  return result
}

function readViewsFromMigrationStorage(): View[] {
  try {
    const raw = localStorage.getItem(VIEWS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : parsed.views || []
    }
  } catch {}
  return []
}
