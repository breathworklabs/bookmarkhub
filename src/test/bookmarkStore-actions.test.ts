import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBookmarkStore } from '../store/bookmarkStore'
import { localStorageService, type StoredBookmark } from '../lib/localStorage'

const makeStored = (overrides: Partial<StoredBookmark> = {}): StoredBookmark => ({
  id: overrides.id ?? 1,
  user_id: 'local',
  title: overrides.title ?? 'Title',
  url: 'https://example.com',
  description: 'desc',
  content: 'content',
  author: 'author',
  domain: 'example.com',
  source_platform: 'manual',
  engagement_score: 0,
  is_starred: false,
  is_read: false,
  is_archived: false,
    is_deleted: false,
  tags: [],
  collections: ['uncategorized'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

describe('bookmarkStore actions', () => {
  beforeEach(() => {
    useBookmarkStore.setState({ bookmarks: [], error: null, isLoading: false })
    vi.restoreAllMocks()
  })

  it('addBookmark adds a bookmark (happy path)', async () => {
    const created = makeStored({ id: 10, title: 'New' })
    vi.spyOn(localStorageService, 'createBookmark').mockResolvedValueOnce(created)

    await useBookmarkStore.getState().addBookmark({
      ...created,
      id: undefined,
    })

    const state = useBookmarkStore.getState()
    expect(state.bookmarks[0]?.id).toBe(10)
    expect(state.error).toBeNull()
  })

  it('updateBookmark updates an existing bookmark', async () => {
    const existing = makeStored({ id: 1, title: 'Old' })
    const updated = makeStored({ id: 1, title: 'Updated' })

    // seed
    useBookmarkStore.setState({ bookmarks: [existing] })
    vi.spyOn(localStorageService, 'updateBookmark').mockResolvedValueOnce(updated)

    await useBookmarkStore.getState().updateBookmark(1, updated)

    const state = useBookmarkStore.getState()
    expect(state.bookmarks.find(b => b.id === 1)?.title).toBe('Updated')
  })

  it('removeBookmark removes a bookmark (soft delete)', async () => {
    const a = makeStored({ id: 1 })
    const b = makeStored({ id: 2 })
    useBookmarkStore.setState({ bookmarks: [a, b] })

    const deletedA = { ...a, is_deleted: true, deleted_at: new Date().toISOString() }
    vi.spyOn(localStorageService, 'moveToTrash').mockResolvedValueOnce(deletedA)

    await useBookmarkStore.getState().removeBookmark(1)

    const state = useBookmarkStore.getState()
    const bookmark1 = state.bookmarks.find(bm => bm.id === 1)
    expect(bookmark1?.is_deleted).toBe(true)
    expect(bookmark1?.deleted_at).toBeDefined()
  })

  it('toggleStarBookmark flips is_starred and updates state', async () => {
    const existing = makeStored({ id: 5, is_starred: false })
    const toggled = { ...existing, is_starred: true }
    useBookmarkStore.setState({ bookmarks: [existing] })

    vi.spyOn(localStorageService, 'toggleBookmarkStar').mockResolvedValueOnce(toggled)

    await useBookmarkStore.getState().toggleStarBookmark(5)
    expect(useBookmarkStore.getState().bookmarks[0]?.is_starred).toBe(true)
  })

  it('toggleArchiveBookmark toggles is_archived', async () => {
    const existing = makeStored({ id: 7, is_archived: false })
    const updated = { ...existing, is_archived: true }
    useBookmarkStore.setState({ bookmarks: [existing] })

    vi.spyOn(localStorageService, 'getBookmarks').mockResolvedValueOnce([existing])
    vi.spyOn(localStorageService, 'updateBookmark').mockResolvedValueOnce(updated)

    await useBookmarkStore.getState().toggleArchiveBookmark(7)
    expect(useBookmarkStore.getState().bookmarks[0]?.is_archived).toBe(true)
  })
})


