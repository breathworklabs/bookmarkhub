/**
 * Tests for two specific correctness guarantees in collectionsStore:
 *
 * 1. Race-condition safety in initialize():
 *    The background bookmark-map load uses a functional set that merges
 *    current state ON TOP of the loaded data:
 *      set((state) => ({ collectionBookmarks: { ...loaded, ...state.collectionBookmarks } }))
 *    This means any writes that happened to collectionBookmarks while the
 *    async load was in flight are preserved and never overwritten.
 *
 * 2. Deduplication in addBookmarkToCollection():
 *    The state update wraps the id list in `new Set(...)` so calling the
 *    action twice with the same bookmarkId never creates a duplicate entry.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useCollectionsStore } from '../../src/store/collectionsStore'
import { localStorageService } from '../../src/lib/localStorage'
import { useBookmarkStore } from '../../src/store/bookmarkStore'

// ---------------------------------------------------------------------------
// Minimal bookmark shape that satisfies the store's .find() / .map() calls
// inside addBookmarkToCollection without needing the full Bookmark type.
// ---------------------------------------------------------------------------
const makeStoredBookmark = (id: number) => ({
  id,
  user_id: 'local',
  title: `Bookmark ${id}`,
  url: `https://example.com/${id}`,
  description: '',
  content: '',
  author: '',
  domain: 'example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  source_platform: 'manual' as const,
  is_starred: false,
  is_read: false,
  is_archived: false,
  is_shared: false,
  is_deleted: false,
  tags: [],
  thumbnail_url: '',
  favicon_url: '',
  engagement_score: 0,
  collections: [] as string[],
})

// ---------------------------------------------------------------------------
// Helper: build a minimal collection object accepted by getCollections mock
// ---------------------------------------------------------------------------
const makeCollection = (id: string) => ({
  id,
  name: id,
  description: '',
  isPrivate: false,
  isDefault: false,
  isSmartCollection: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  bookmarkCount: 0,
  userId: 'local-user',
})

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------
beforeEach(() => {
  useCollectionsStore.setState({
    collections: [],
    collectionBookmarks: {},
    isLoading: false,
    error: null,
    activeCollectionId: null,
    expandedCollections: [],
    collapsedSections: [],
    isCreatingCollection: false,
    collectionFilter: 'all',
  })

  // Seed bookmarkStore with a minimal state so the dynamic import inside
  // addBookmarkToCollection finds something sensible.
  useBookmarkStore.setState({
    bookmarks: [],
    activityLogs: [],
  } as any)

  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// 1. Race-condition: initialize() background load must NOT overwrite
//    concurrent state updates from addBookmarkToCollection()
// ---------------------------------------------------------------------------
describe('initialize() – race condition with concurrent addBookmarkToCollection', () => {
  it(
    'preserves a bookmark added during the background load phase',
    async () => {
      const COL_A = 'col-a'
      const COL_B = 'col-b'
      const MOVED_ID = 42

      // Two collections in storage.
      const collections = [makeCollection(COL_A), makeCollection(COL_B)]
      vi.spyOn(localStorageService, 'getCollections').mockResolvedValue(
        collections as any
      )

      // Deferred promise that controls when the background load for COL_A
      // resolves.  COL_B resolves immediately.
      let resolveColA!: (value: any[]) => void
      const colADeferred = new Promise<any[]>((res) => {
        resolveColA = res
      })

      vi.spyOn(
        localStorageService,
        'getBookmarksByCollection'
      ).mockImplementation((colId: string) => {
        if (colId === COL_A) return colADeferred
        // COL_B: bookmark 99 was already there from storage
        return Promise.resolve([{ id: 99 }])
      })

      // Also stub addBookmarkToCollection (called by addBookmarkToCollection action)
      vi.spyOn(
        localStorageService,
        'addBookmarkToCollection'
      ).mockResolvedValue(undefined)

      // Seed bookmarkStore with MOVED_ID so the action can find it
      const movedBookmark = makeStoredBookmark(MOVED_ID)
      useBookmarkStore.setState({ bookmarks: [movedBookmark] } as any)

      // ---- Start initialize() but don't await it yet ----
      const initPromise = useCollectionsStore.getState().initialize()

      // Allow the microtask queue to run:
      //   - getCollections() resolves
      //   - quickLoad set() fires (collections are now in state)
      //   - the background for-loop starts; COL_A is paused, COL_B awaited
      await Promise.resolve()
      await Promise.resolve()

      // Wait for getCollections + quickLoad to definitely have fired
      // (we need a tick or two more for the for-loop to hit COL_A and pause)
      await new Promise((r) => setTimeout(r, 0))

      // ---- While initialize() is awaiting COL_A, call addBookmarkToCollection ----
      await useCollectionsStore
        .getState()
        .addBookmarkToCollection(MOVED_ID, COL_B)

      // Verify: COL_B now contains MOVED_ID in the store
      expect(
        useCollectionsStore.getState().collectionBookmarks[COL_B]
      ).toContain(MOVED_ID)

      // ---- Now let the background load for COL_A complete ----
      resolveColA([{ id: 1 }, { id: 2 }])
      await initPromise

      // ---- Final assertions ----

      // COL_A should have the ids loaded from storage
      expect(
        useCollectionsStore.getState().collectionBookmarks[COL_A]
      ).toEqual([1, 2])

      // COL_B must still contain MOVED_ID (not overwritten by the background load)
      expect(
        useCollectionsStore.getState().collectionBookmarks[COL_B]
      ).toContain(MOVED_ID)
    }
  )

  it(
    'state that was written concurrently wins over the loaded data for the same key',
    async () => {
      const COL = 'col-1'
      const COL_B = 'col-b'
      const collections = [makeCollection(COL), makeCollection(COL_B)]

      vi.spyOn(localStorageService, 'getCollections').mockResolvedValue(
        collections as any
      )

      // Storage says COL has [10] and COL_B has [20]
      vi.spyOn(
        localStorageService,
        'getBookmarksByCollection'
      ).mockImplementation((colId: string) => {
        if (colId === COL) return Promise.resolve([{ id: 10 }] as any)
        return Promise.resolve([{ id: 20 }] as any)
      })

      // Simulate a concurrent write that happened before the background load
      // completed: COL has been updated to [99] in state.
      // The merge strategy is: state wins over loaded data per collection key.
      // This means [99] completely replaces [10] for COL, while COL_B (not
      // written by a concurrent action) gets the loaded value [20].
      useCollectionsStore.setState({
        collectionBookmarks: { [COL]: [99] },
      })

      await useCollectionsStore.getState().initialize()

      const state = useCollectionsStore.getState()

      // COL: the state value [99] wins — loaded [10] is discarded for this key
      expect(state.collectionBookmarks[COL]).toEqual([99])

      // COL_B: no concurrent state write, so the loaded value [20] is used
      expect(state.collectionBookmarks[COL_B]).toEqual([20])
    }
  )
})

// ---------------------------------------------------------------------------
// 2. Deduplication: addBookmarkToCollection called twice with the same id
// ---------------------------------------------------------------------------
describe('addBookmarkToCollection() – deduplication via new Set()', () => {
  it('does not create duplicate ids when called twice with the same bookmarkId', async () => {
    const COL = 'col-dedup'
    const BM_ID = 7

    useCollectionsStore.setState({
      collections: [makeCollection(COL) as any],
      collectionBookmarks: { [COL]: [] },
    })

    vi.spyOn(
      localStorageService,
      'addBookmarkToCollection'
    ).mockResolvedValue(undefined)

    const bookmark = makeStoredBookmark(BM_ID)
    useBookmarkStore.setState({ bookmarks: [bookmark] } as any)

    // Call the action twice with the identical bookmark + collection
    await useCollectionsStore.getState().addBookmarkToCollection(BM_ID, COL)
    await useCollectionsStore.getState().addBookmarkToCollection(BM_ID, COL)

    const ids = useCollectionsStore.getState().collectionBookmarks[COL]
    expect(ids).toEqual([BM_ID]) // exactly one entry, no duplicate
  })

  it('keeps other bookmarks intact when deduplication is triggered', async () => {
    const COL = 'col-mixed'
    const EXISTING_ID = 3
    const DUPLICATE_ID = 7

    useCollectionsStore.setState({
      collections: [makeCollection(COL) as any],
      // Start with one bookmark already present
      collectionBookmarks: { [COL]: [EXISTING_ID] },
    })

    vi.spyOn(
      localStorageService,
      'addBookmarkToCollection'
    ).mockResolvedValue(undefined)

    const bookmark = makeStoredBookmark(DUPLICATE_ID)
    useBookmarkStore.setState({ bookmarks: [bookmark] } as any)

    // Add the same new bookmark twice
    await useCollectionsStore
      .getState()
      .addBookmarkToCollection(DUPLICATE_ID, COL)
    await useCollectionsStore
      .getState()
      .addBookmarkToCollection(DUPLICATE_ID, COL)

    const ids = useCollectionsStore.getState().collectionBookmarks[COL]

    // Original bookmark preserved
    expect(ids).toContain(EXISTING_ID)
    // New bookmark present exactly once
    expect(ids.filter((id) => id === DUPLICATE_ID)).toHaveLength(1)
    // Total count is exactly 2
    expect(ids).toHaveLength(2)
  })

  it('handles deduplication when the collection entry does not yet exist in the map', async () => {
    const COL = 'col-new'
    const BM_ID = 55

    // collectionBookmarks has no key for COL yet
    useCollectionsStore.setState({
      collections: [makeCollection(COL) as any],
      collectionBookmarks: {},
    })

    vi.spyOn(
      localStorageService,
      'addBookmarkToCollection'
    ).mockResolvedValue(undefined)

    const bookmark = makeStoredBookmark(BM_ID)
    useBookmarkStore.setState({ bookmarks: [bookmark] } as any)

    await useCollectionsStore.getState().addBookmarkToCollection(BM_ID, COL)
    await useCollectionsStore.getState().addBookmarkToCollection(BM_ID, COL)

    const ids = useCollectionsStore.getState().collectionBookmarks[COL]
    expect(ids).toEqual([BM_ID])
  })
})
