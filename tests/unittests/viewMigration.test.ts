import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  migrateToViews,
  convertSmartCriteria,
  convertPresetFilters,
  isMigrated,
  runMigration,
  type OldCollectionData,
  type OldFilterPreset,
  type OldCollectionBookmarkMap,
} from '../../src/utils/viewMigration'
import { SYSTEM_VIEWS } from '../../src/types/views'
import type { View } from '../../src/types/views'

function createLocalStorage() {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
}

type LocalStorageMock = ReturnType<typeof createLocalStorage>

let ls: LocalStorageMock
const originalLocalStorage = window.localStorage

function installLocalStorage(mock: LocalStorageMock) {
  Object.defineProperty(window, 'localStorage', {
    value: mock,
    writable: true,
    configurable: true,
  })
}

afterEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: originalLocalStorage,
    writable: true,
    configurable: true,
  })
})

const makeOldCollection = (
  overrides: Partial<OldCollectionData> = {}
): OldCollectionData => ({
  id: 'coll-1',
  name: 'My Collection',
  description: 'A test collection',
  parentId: null,
  color: '#FF5500',
  icon: 'folder',
  isSmartCollection: false,
  isDefault: false,
  bookmarkCount: 3,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

const makeOldFilterPreset = (
  overrides: Partial<OldFilterPreset> = {}
): OldFilterPreset => ({
  id: 'preset-1',
  name: 'My Preset',
  description: 'A test filter preset',
  filters: {
    selectedTags: ['tech', 'dev'],
    searchQuery: 'react',
    authorFilter: 'Dan Abramov',
    domainFilter: 'github.com',
    contentTypeFilter: 'article',
    dateRangeFilter: { type: 'week' },
    quickFilters: ['starred', 'unread'],
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

describe('convertSmartCriteria', () => {
  it('converts starred criteria', () => {
    expect(convertSmartCriteria({ type: 'starred' })).toEqual({ starred: true })
  })

  it('converts recent criteria with custom days', () => {
    expect(convertSmartCriteria({ type: 'recent', days: 14 })).toEqual({
      recentDays: 14,
    })
  })

  it('converts recent criteria with default 7 days', () => {
    expect(convertSmartCriteria({ type: 'recent' })).toEqual({ recentDays: 7 })
  })

  it('converts archived criteria to isArchived:true + isDeleted:false', () => {
    expect(convertSmartCriteria({ type: 'archived' })).toEqual({
      isArchived: true,
      isDeleted: false,
    })
  })

  it('converts uncategorized criteria', () => {
    expect(convertSmartCriteria({ type: 'uncategorized' })).toEqual({
      isUncategorized: true,
      isDeleted: false,
    })
  })

  it('converts tag criteria with value', () => {
    expect(convertSmartCriteria({ type: 'tag', value: 'javascript' })).toEqual({
      tags: ['javascript'],
    })
  })

  it('converts tag criteria without value to empty criteria', () => {
    expect(convertSmartCriteria({ type: 'tag' })).toEqual({})
  })

  it('converts domain criteria', () => {
    expect(convertSmartCriteria({ type: 'domain', value: 'github.com' })).toEqual({
      domains: ['github.com'],
    })
  })

  it('converts date_range criteria — 1 day → today', () => {
    expect(convertSmartCriteria({ type: 'date_range', days: 1 })).toEqual({
      dateRange: { preset: 'today' },
    })
  })

  it('converts date_range criteria — 7 days → week', () => {
    expect(convertSmartCriteria({ type: 'date_range', days: 7 })).toEqual({
      dateRange: { preset: 'week' },
    })
  })

  it('converts date_range criteria — 31 days → month', () => {
    expect(convertSmartCriteria({ type: 'date_range', days: 31 })).toEqual({
      dateRange: { preset: 'month' },
    })
  })

  it('converts date_range criteria — 365 days → year', () => {
    expect(convertSmartCriteria({ type: 'date_range', days: 365 })).toEqual({
      dateRange: { preset: 'year' },
    })
  })

  it('returns empty criteria for unknown type', () => {
    expect(convertSmartCriteria({ type: 'unknown' })).toEqual({})
  })
})

describe('convertPresetFilters', () => {
  it('converts all filter fields to ViewCriteria', () => {
    const preset = makeOldFilterPreset()
    const criteria = convertPresetFilters(preset.filters)

    expect(criteria.tags).toEqual(['tech', 'dev'])
    expect(criteria.tagMatch).toBe('any')
    expect(criteria.query).toBe('react')
    expect(criteria.authors).toEqual(['Dan Abramov'])
    expect(criteria.domains).toEqual(['github.com'])
    expect(criteria.contentTypes).toEqual(['article'])
    expect(criteria.dateRange).toEqual({ preset: 'week' })
    expect(criteria.starred).toBe(true)
    expect(criteria.unread).toBe(true)
  })

  it('skips empty filters', () => {
    const criteria = convertPresetFilters({
      selectedTags: [],
      searchQuery: '',
      authorFilter: '',
      domainFilter: '',
      contentTypeFilter: '',
      dateRangeFilter: { type: 'all' },
      quickFilters: [],
    })

    expect(criteria.tags).toBeUndefined()
    expect(criteria.query).toBeUndefined()
    expect(criteria.authors).toBeUndefined()
    expect(criteria.domains).toBeUndefined()
  })

  it('maps quick filters correctly', () => {
    const criteria = convertPresetFilters({
      selectedTags: [],
      searchQuery: '',
      authorFilter: '',
      domainFilter: '',
      contentTypeFilter: '',
      dateRangeFilter: { type: 'all' },
      quickFilters: ['broken', 'comments'],
    })

    expect(criteria.broken).toBe(true)
    expect(criteria.withComments).toBe(true)
  })
})

describe('migrateToViews', () => {
  it('creates system views', () => {
    const result = migrateToViews([], {}, [])

    const systemIds = result.views.filter((v) => v.system).map((v) => v.id)
    expect(systemIds).toContain(SYSTEM_VIEWS.ALL)
    expect(systemIds).toContain(SYSTEM_VIEWS.STARRED)
    expect(systemIds).toContain(SYSTEM_VIEWS.RECENT)
    expect(systemIds).toContain(SYSTEM_VIEWS.ARCHIVED)
    expect(systemIds).toContain(SYSTEM_VIEWS.UNCATEGORIZED)
    expect(systemIds).toContain(SYSTEM_VIEWS.TRASH)
  })

  it('skips default collections', () => {
    const coll = makeOldCollection({ id: 'def-1', isDefault: true })
    const result = migrateToViews([coll], {}, [])

    const userViews = result.views.filter((v) => !v.system)
    expect(userViews).toHaveLength(0)
  })

  it('skips smart collections', () => {
    const coll = makeOldCollection({
      id: 'smart-1',
      isSmartCollection: true,
      smartCriteria: { type: 'starred' },
    })
    const result = migrateToViews([coll], {}, [])

    const userViews = result.views.filter((v) => !v.system)
    expect(userViews).toHaveLength(0)
  })

  it('converts user collections to manual views', () => {
    const coll = makeOldCollection({
      id: 'coll-1',
      name: 'React Resources',
      icon: 'Bookmark',
      color: '#FF5500',
      parentId: null,
      description: 'React learning materials',
    })
    const bookmarks: OldCollectionBookmarkMap = {
      'coll-1': [10, 20, 30],
    }

    const result = migrateToViews([coll], bookmarks, [])

    const view = result.views.find((v) => v.id === 'view-coll-1')
    expect(view).toBeDefined()
    expect(view!.name).toBe('React Resources')
    expect(view!.icon).toBe('bookmark')
    expect(view!.color).toBe('#FF5500')
    expect(view!.mode).toBe('manual')
    expect(view!.bookmarkIds).toEqual(['10', '20', '30'])
    expect(view!.criteria).toBeNull()
    expect(view!.system).toBe(false)
    expect(view!.description).toBe('React learning materials')
    expect(view!.createdAt).toBe('2024-01-01T00:00:00Z')
  })

  it('converts bookmark IDs from number to string', () => {
    const coll = makeOldCollection({ id: 'c1' })
    const bookmarks: OldCollectionBookmarkMap = { c1: [1, 2, 99999] }

    const result = migrateToViews([coll], bookmarks, [])
    const view = result.views.find((v) => v.id === 'view-c1')

    expect(view!.bookmarkIds).toEqual(['1', '2', '99999'])
  })

  it('handles missing bookmark map gracefully', () => {
    const coll = makeOldCollection({ id: 'c1' })
    const result = migrateToViews([coll], {}, [])
    const view = result.views.find((v) => v.id === 'view-c1')

    expect(view!.bookmarkIds).toEqual([])
  })

  it('preserves parent-child hierarchy', () => {
    const parent = makeOldCollection({ id: 'parent-1', name: 'Parent' })
    const child = makeOldCollection({
      id: 'child-1',
      name: 'Child',
      parentId: 'parent-1',
    })

    const result = migrateToViews([parent, child], {}, [])

    const parentView = result.views.find((v) => v.id === 'view-parent-1')
    const childView = result.views.find((v) => v.id === 'view-child-1')

    expect(parentView!.parentId).toBeNull()
    expect(childView!.parentId).toBe('view-parent-1')
  })

  it('preserves share settings from collections', () => {
    const shareSettings = {
      shareId: 'share-abc123',
      shareUrl: 'https://example.com/s/abc123',
      expiresAt: null,
      maxAccess: null,
      accessCount: 42,
      sharedAt: '2024-06-01T00:00:00Z',
    }
    const coll = makeOldCollection({
      id: 'shared-1',
      name: 'Shared Collection',
      shareSettings,
    })

    const result = migrateToViews([coll], {}, [])
    const view = result.views.find((v) => v.id === 'view-shared-1')

    expect(view!.shareSettings).toEqual(shareSettings)
  })

  it('handles collection without share settings', () => {
    const coll = makeOldCollection({ id: 'no-share' })
    const result = migrateToViews([coll], {}, [])
    const view = result.views.find((v) => v.id === 'view-no-share')

    expect(view!.shareSettings).toBeUndefined()
  })

  it('converts filter presets to dynamic views', () => {
    const preset = makeOldFilterPreset({
      id: 'preset-1',
      name: 'Dev Filter',
      description: 'Filter for dev content',
    })

    const result = migrateToViews([], {}, [preset])
    const view = result.views.find((v) => v.id === 'view-preset-preset-1')

    expect(view).toBeDefined()
    expect(view!.name).toBe('Dev Filter')
    expect(view!.icon).toBe('filter')
    expect(view!.mode).toBe('dynamic')
    expect(view!.criteria).toBeDefined()
    expect(view!.criteria!.tags).toEqual(['tech', 'dev'])
    expect(view!.criteria!.query).toBe('react')
    expect(view!.system).toBe(false)
    expect(view!.description).toBe('Filter for dev content')
  })

  it('migrates multiple collections and presets together', () => {
    const coll1 = makeOldCollection({ id: 'c1', name: 'Collection 1' })
    const coll2 = makeOldCollection({ id: 'c2', name: 'Collection 2' })
    const preset = makeOldFilterPreset({ id: 'p1', name: 'Preset 1' })
    const bookmarks: OldCollectionBookmarkMap = { c1: [1, 2], c2: [3] }

    const result = migrateToViews([coll1, coll2], bookmarks, [preset])

    const systemCount = result.views.filter((v) => v.system).length
    expect(result.views.length).toBe(systemCount + 3)
    expect(result.migrationVersion).toBe(1)
    expect(result.migratedAt).toBeTruthy()
  })

  it('uses default color when collection has no color', () => {
    const coll = makeOldCollection({ id: 'c1', color: undefined })
    const result = migrateToViews([coll], {}, [])
    const view = result.views.find((v) => v.id === 'view-c1')

    expect(view!.color).toBe('#4A90D9')
  })

  it('uses folder icon when collection has no icon', () => {
    const coll = makeOldCollection({ id: 'c1', icon: undefined })
    const result = migrateToViews([coll], {}, [])
    const view = result.views.find((v) => v.id === 'view-c1')

    expect(view!.icon).toBe('folder')
  })
})

describe('isMigrated', () => {
  beforeEach(() => {
    ls = createLocalStorage()
    installLocalStorage(ls)
  })

  it('returns false when no migration flag exists', () => {
    expect(isMigrated()).toBe(false)
  })

  it('returns false for invalid JSON', () => {
    ls.setItem('bookmarkhub_views_migrated', 'not-json')
    expect(isMigrated()).toBe(false)
  })

  it('returns false for version 0', () => {
    ls.setItem(
      'bookmarkhub_views_migrated',
      JSON.stringify({ version: 0 })
    )
    expect(isMigrated()).toBe(false)
  })

  it('returns true for version 1', () => {
    ls.setItem(
      'bookmarkhub_views_migrated',
      JSON.stringify({ version: 1 })
    )
    expect(isMigrated()).toBe(true)
  })

  it('returns true for future versions', () => {
    ls.setItem(
      'bookmarkhub_views_migrated',
      JSON.stringify({ version: 5 })
    )
    expect(isMigrated()).toBe(true)
  })
})

describe('runMigration', () => {
  beforeEach(() => {
    ls = createLocalStorage()
    installLocalStorage(ls)
  })

  it('migrates from consolidated localStorage data', () => {
    ls.setItem(
      'x-bookmark-manager-data',
      JSON.stringify({
        collections: [makeOldCollection({ id: 'c1', name: 'My Collection' })],
        bookmarkCollections: [
          { bookmarkId: 1, collectionId: 'c1' },
          { bookmarkId: 2, collectionId: 'c1' },
        ],
      })
    )

    const result = runMigration()

    expect(result.views.length).toBeGreaterThan(0)
    expect(result.views.find((v) => v.id === 'view-c1')).toBeDefined()
    expect(
      result.views.find((v) => v.id === 'view-c1')!.bookmarkIds
    ).toEqual(['1', '2'])

    expect(isMigrated()).toBe(true)
    expect(ls.getItem('bookmarkhub_views')).toBeTruthy()
  })

  it('sets migration flag after running', () => {
    ls.setItem('x-bookmark-manager-data', JSON.stringify({}))

    runMigration()

    const flag = JSON.parse(ls.getItem('bookmarkhub_views_migrated')!)
    expect(flag.version).toBe(1)
  })

  it('does not re-migrate if flag already set', () => {
    ls.setItem(
      'bookmarkhub_views_migrated',
      JSON.stringify({ version: 1 })
    )
    ls.setItem(
      'bookmarkhub_views',
      JSON.stringify([
        { id: 'custom-existing', name: 'Existing', system: false },
      ])
    )

    const result = runMigration()

    expect(
      result.views.find((v) => v.id === 'custom-existing')
    ).toBeDefined()
  })

  it('handles empty consolidated storage', () => {
    const result = runMigration()

    expect(result.views.length).toBe(6)
    expect(result.views.every((v) => v.system)).toBe(true)
  })

  it('handles corrupted consolidated storage', () => {
    ls.setItem('x-bookmark-manager-data', 'not-json')

    const result = runMigration()

    expect(result.views.length).toBe(6)
    expect(result.views.every((v) => v.system)).toBe(true)
  })

  it('migrates filter presets from separate storage key', () => {
    ls.setItem(
      'x-bookmark-filter-presets',
      JSON.stringify([makeOldFilterPreset({ id: 'p1', name: 'My Preset' })])
    )

    const result = runMigration()

    expect(result.views.find((v) => v.id === 'view-preset-p1')).toBeDefined()
  })
})

describe('system view criteria consistency', () => {
  it('system views have correct criteria after migration', () => {
    const result = migrateToViews([], {}, [])

    const allView = result.views.find((v) => v.id === SYSTEM_VIEWS.ALL)!
    const starredView = result.views.find((v) => v.id === SYSTEM_VIEWS.STARRED)!
    const recentView = result.views.find((v) => v.id === SYSTEM_VIEWS.RECENT)!
    const archivedView = result.views.find(
      (v) => v.id === SYSTEM_VIEWS.ARCHIVED
    )!
    const uncategorizedView = result.views.find(
      (v) => v.id === SYSTEM_VIEWS.UNCATEGORIZED
    )!
    const trashView = result.views.find((v) => v.id === SYSTEM_VIEWS.TRASH)!

    expect(allView.criteria).toMatchObject({ isArchived: false, isDeleted: false })
    expect(starredView.criteria).toMatchObject({
      starred: true,
      isArchived: false,
      isDeleted: false,
    })
    expect(recentView.criteria).toMatchObject({
      recentDays: 7,
      isArchived: false,
      isDeleted: false,
    })
    expect(archivedView.criteria).toMatchObject({
      isArchived: true,
      isDeleted: false,
    })
    expect(uncategorizedView.criteria).toMatchObject({
      isUncategorized: true,
      isArchived: false,
      isDeleted: false,
    })
    expect(trashView.criteria).toMatchObject({ isDeleted: true })
  })
})

describe('system view reconciliation', () => {
  let useViewStore: typeof import('../../src/store/viewStore').useViewStore

  beforeEach(async () => {
    ls = createLocalStorage()
    installLocalStorage(ls)

    const mod = await import('../../src/store/viewStore')
    useViewStore = mod.useViewStore
    useViewStore.setState({
      views: [],
      activeViewId: SYSTEM_VIEWS.ALL,
      expandedViews: [],
    })
  })

  it('updates stale system view criteria on load', () => {
    const staleViews: View[] = [
      {
        id: SYSTEM_VIEWS.ALL,
        name: 'All Bookmarks',
        icon: 'bookmark',
        color: '#4A90D9',
        parentId: null,
        sortOrder: 0,
        mode: 'dynamic',
        bookmarkIds: [],
        criteria: { isDeleted: false },
        pinned: true,
        system: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: 'local-user',
      },
    ]
    ls.setItem('bookmarkhub_views', JSON.stringify(staleViews))

    useViewStore.getState().loadViews()

    const allView = useViewStore.getState().views.find(
      (v) => v.id === SYSTEM_VIEWS.ALL
    )!
    expect(allView.criteria).toMatchObject({
      isArchived: false,
      isDeleted: false,
    })
    expect(allView.color).toBe('#6366f1')
  })

  it('preserves user views during reconciliation', () => {
    const mixedViews: View[] = [
      {
        id: SYSTEM_VIEWS.ALL,
        name: 'All Bookmarks',
        icon: 'bookmark',
        color: '#4A90D9',
        parentId: null,
        sortOrder: 0,
        mode: 'dynamic',
        bookmarkIds: [],
        criteria: { isDeleted: false },
        pinned: true,
        system: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: 'local-user',
      },
      {
        id: 'view-my-custom',
        name: 'My Custom View',
        icon: 'folder',
        color: '#FF00FF',
        parentId: null,
        sortOrder: 10,
        mode: 'manual',
        bookmarkIds: ['1', '2'],
        criteria: null,
        pinned: false,
        system: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: 'local-user',
      },
    ]
    ls.setItem('bookmarkhub_views', JSON.stringify(mixedViews))

    useViewStore.getState().loadViews()

    const views = useViewStore.getState().views
    const customView = views.find((v) => v.id === 'view-my-custom')!
    expect(customView).toBeDefined()
    expect(customView.name).toBe('My Custom View')
    expect(customView.color).toBe('#FF00FF')
    expect(customView.bookmarkIds).toEqual(['1', '2'])
    expect(customView.system).toBe(false)
  })

  it('does not write to storage when nothing changed', async () => {
    const { buildDefaultSystemViews } = await import(
      '../../src/store/viewStore'
    )

    const freshViews = buildDefaultSystemViews()
    ls.setItem('bookmarkhub_views', JSON.stringify(freshViews))

    ls.setItem.mockClear()
    useViewStore.getState().loadViews()

    const viewWrites = ls.setItem.mock.calls.filter(
      (call: any[]) => call[0] === 'bookmarkhub_views'
    )
    expect(viewWrites.length).toBe(0)
  })

  it('adds missing system views', () => {
    const partialViews: View[] = [
      {
        id: SYSTEM_VIEWS.ALL,
        name: 'All Bookmarks',
        icon: 'bookmark',
        color: '#6366f1',
        parentId: null,
        sortOrder: 0,
        mode: 'dynamic',
        bookmarkIds: [],
        criteria: { isArchived: false, isDeleted: false },
        pinned: true,
        system: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: 'local-user',
      },
    ]
    ls.setItem('bookmarkhub_views', JSON.stringify(partialViews))

    useViewStore.getState().loadViews()

    const views = useViewStore.getState().views
    expect(views.length).toBeGreaterThanOrEqual(1)
    expect(views.find((v) => v.id === SYSTEM_VIEWS.ALL)).toBeDefined()
  })

  it('updates stale archived criteria', () => {
    const staleArchived: View[] = [
      {
        id: SYSTEM_VIEWS.ARCHIVED,
        name: 'Archived',
        icon: 'archive',
        color: '#8E8E93',
        parentId: null,
        sortOrder: 3,
        mode: 'dynamic',
        bookmarkIds: [],
        criteria: { isDeleted: false, isUncategorized: false },
        pinned: true,
        system: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: 'local-user',
      },
    ]
    ls.setItem('bookmarkhub_views', JSON.stringify(staleArchived))

    useViewStore.getState().loadViews()

    const archivedView = useViewStore.getState().views.find(
      (v) => v.id === SYSTEM_VIEWS.ARCHIVED
    )!
    expect(archivedView.criteria).toMatchObject({
      isArchived: true,
      isDeleted: false,
    })
  })
})

describe('real data migration — user export', () => {
  const realCollections = [
    {
      id: 'uncategorized',
      name: 'Uncategorized',
      description: 'Bookmarks that haven\'t been organized into collections',
      isPrivate: false,
      isDefault: true,
      isSmartCollection: true,
      smartCriteria: { type: 'uncategorized' },
      createdAt: '2026-04-07T15:24:49.563Z',
      updatedAt: '2026-04-07T15:24:49.563Z',
      bookmarkCount: 0,
      userId: 'local-user',
    },
    {
      id: 'starred',
      name: 'Starred',
      description: 'Your starred bookmarks',
      isPrivate: false,
      isDefault: true,
      isSmartCollection: true,
      smartCriteria: { type: 'starred' },
      createdAt: '2026-04-07T15:24:49.563Z',
      updatedAt: '2026-04-07T15:24:49.563Z',
      bookmarkCount: 0,
      userId: 'local-user',
    },
    {
      id: 'recent',
      name: 'Recent',
      description: 'Recently added bookmarks',
      isPrivate: false,
      isDefault: true,
      isSmartCollection: true,
      smartCriteria: { type: 'recent', days: 7 },
      createdAt: '2026-04-07T15:24:49.563Z',
      updatedAt: '2026-04-07T15:24:49.563Z',
      bookmarkCount: 0,
      userId: 'local-user',
    },
    {
      id: 'archived',
      name: 'Archived',
      description: 'Archived bookmarks',
      isPrivate: false,
      isDefault: true,
      isSmartCollection: true,
      smartCriteria: { type: 'archived' },
      createdAt: '2026-04-07T15:24:49.563Z',
      updatedAt: '2026-04-07T15:24:49.563Z',
      bookmarkCount: 0,
      userId: 'local-user',
    },
    {
      name: 'Test',
      description: '',
      color: 'var(--color-blue)',
      icon: 'folder',
      isPrivate: false,
      isDefault: false,
      isSmartCollection: false,
      userId: 'local-user',
      id: 'collection-1776325219231-zwcck2210',
      createdAt: '2026-04-16T07:40:19.231Z',
      updatedAt: '2026-04-16T07:40:19.231Z',
      bookmarkCount: 0,
    },
    {
      name: 'Test 2',
      description: '',
      color: 'var(--color-blue)',
      icon: 'folder',
      isPrivate: false,
      isDefault: false,
      isSmartCollection: false,
      userId: 'local-user',
      parentId: 'collection-1776325219231-zwcck2210',
      id: 'collection-1776325234292-en55h9sgd',
      createdAt: '2026-04-16T07:40:34.292Z',
      updatedAt: '2026-04-16T07:40:34.292Z',
      bookmarkCount: 0,
    },
  ]

  const realBookmarkCollections = {
    'collection-1776325219231-zwcck2210': [
      1775575484259.2893,
      1775575484259.0176,
      1775575484259.2427,
    ],
    'collection-1776325234292-en55h9sgd': [
      1775575484259.0068,
      1775575484259.8152,
    ],
  }

  it('skips all 4 smart/default collections', () => {
    const result = migrateToViews(
      realCollections as any,
      realBookmarkCollections,
      []
    )

    const userViews = result.views.filter((v) => !v.system)
    const smartViewIds = userViews.map((v) => v.id)
    expect(smartViewIds).not.toContain('view-uncategorized')
    expect(smartViewIds).not.toContain('view-starred')
    expect(smartViewIds).not.toContain('view-recent')
    expect(smartViewIds).not.toContain('view-archived')
  })

  it('converts "Test" and "Test 2" as manual views', () => {
    const result = migrateToViews(
      realCollections as any,
      realBookmarkCollections,
      []
    )

    const test = result.views.find(
      (v) => v.id === 'view-collection-1776325219231-zwcck2210'
    )
    const test2 = result.views.find(
      (v) => v.id === 'view-collection-1776325234292-en55h9sgd'
    )

    expect(test).toBeDefined()
    expect(test!.name).toBe('Test')
    expect(test!.mode).toBe('manual')
    expect(test!.system).toBe(false)
    expect(test!.bookmarkIds).toEqual([
      '1775575484259.2893',
      '1775575484259.0176',
      '1775575484259.2427',
    ])

    expect(test2).toBeDefined()
    expect(test2!.name).toBe('Test 2')
    expect(test2!.mode).toBe('manual')
    expect(test2!.bookmarkIds).toEqual([
      '1775575484259.0068',
      '1775575484259.8152',
    ])
  })

  it('preserves parent-child: Test 2 is child of Test', () => {
    const result = migrateToViews(
      realCollections as any,
      realBookmarkCollections,
      []
    )

    const test = result.views.find(
      (v) => v.id === 'view-collection-1776325219231-zwcck2210'
    )
    const test2 = result.views.find(
      (v) => v.id === 'view-collection-1776325234292-en55h9sgd'
    )

    expect(test!.parentId).toBeNull()
    expect(test2!.parentId).toBe('view-collection-1776325219231-zwcck2210')
  })

  it('handles CSS variable color from old format', () => {
    const result = migrateToViews(
      realCollections as any,
      realBookmarkCollections,
      []
    )

    const test = result.views.find(
      (v) => v.id === 'view-collection-1776325219231-zwcck2210'
    )!

    expect(test.color).toBe('var(--color-blue)')
  })

  it('float bookmark IDs convert to string correctly', () => {
    const result = migrateToViews(
      realCollections as any,
      realBookmarkCollections,
      []
    )

    const test = result.views.find(
      (v) => v.id === 'view-collection-1776325219231-zwcck2210'
    )!

    for (const id of test.bookmarkIds) {
      expect(typeof id).toBe('string')
    }
  })

  it('total view count: 6 system + 2 user', () => {
    const result = migrateToViews(
      realCollections as any,
      realBookmarkCollections,
      []
    )

    expect(result.views).toHaveLength(8)
    expect(result.views.filter((v) => v.system)).toHaveLength(6)
    expect(result.views.filter((v) => !v.system)).toHaveLength(2)
  })

  it('full runMigration with real data in localStorage', () => {
    ls = createLocalStorage()
    installLocalStorage(ls)

    ls.setItem(
      'x-bookmark-manager-data',
      JSON.stringify({
        collections: realCollections,
        bookmarkCollections: [
          { bookmarkId: 1775575484259.2893, collectionId: 'collection-1776325219231-zwcck2210' },
          { bookmarkId: 1775575484259.0176, collectionId: 'collection-1776325219231-zwcck2210' },
          { bookmarkId: 1775575484259.2427, collectionId: 'collection-1776325219231-zwcck2210' },
          { bookmarkId: 1775575484259.0068, collectionId: 'collection-1776325234292-en55h9sgd' },
          { bookmarkId: 1775575484259.8152, collectionId: 'collection-1776325234292-en55h9sgd' },
        ],
      })
    )

    const result = runMigration()

    expect(result.views).toHaveLength(8)
    expect(result.views.filter((v) => v.system)).toHaveLength(6)

    const test = result.views.find(
      (v) => v.id === 'view-collection-1776325219231-zwcck2210'
    )
    expect(test).toBeDefined()
    expect(test!.bookmarkIds).toHaveLength(3)

    const test2 = result.views.find(
      (v) => v.id === 'view-collection-1776325234292-en55h9sgd'
    )
    expect(test2).toBeDefined()
    expect(test2!.bookmarkIds).toHaveLength(2)
    expect(test2!.parentId).toBe('view-collection-1776325219231-zwcck2210')

    expect(isMigrated()).toBe(true)
  })
})
