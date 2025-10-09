import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCollectionsStore } from '../../src/store/collectionsStore'
import { localStorageService, type StoredCollection } from '../../src/lib/localStorage'

const makeCollection = (overrides: Partial<StoredCollection> = {}): StoredCollection => ({
  id: overrides.id ?? 'c1',
  name: overrides.name ?? 'Col',
  description: overrides.description ?? '',
  isPrivate: false,
  isDefault: false,
  isSmartCollection: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  bookmarkCount: 0,
  userId: 'local-user',
  ...overrides
})

describe('collectionsStore actions', () => {
  beforeEach(() => {
    useCollectionsStore.setState({
      collections: [],
      collectionBookmarks: {},
      isLoading: false,
      error: null,
      activeCollectionId: null,
      expandedCollections: [],
      isCreatingCollection: false,
      collectionFilter: 'all'
    })
    vi.restoreAllMocks()
  })

  it('createCollection adds a collection', async () => {
    const created = makeCollection({ id: 'new', name: 'New' })
    vi.spyOn(localStorageService, 'createCollection').mockResolvedValueOnce(created)

    await useCollectionsStore.getState().createCollection({ ...created })

    const names = useCollectionsStore.getState().collections.map(c => c.name)
    expect(names).toContain('New')
  })

  it('updateCollection updates name/description', async () => {
    const existing = makeCollection({ id: 'x', name: 'Old' })
    const updated = { ...existing, name: 'Updated', description: 'Desc' }
    useCollectionsStore.setState({ collections: [existing] })
    vi.spyOn(localStorageService, 'updateCollection').mockResolvedValueOnce(updated)

    await useCollectionsStore.getState().updateCollection('x', { name: 'Updated', description: 'Desc' })
    expect(useCollectionsStore.getState().collections[0]?.name).toBe('Updated')
  })

  it('deleteCollection removes a collection and relations', async () => {
    const a = makeCollection({ id: 'a' })
    const b = makeCollection({ id: 'b' })
    useCollectionsStore.setState({ collections: [a, b], collectionBookmarks: { a: [1,2], b: [] } })
    vi.spyOn(localStorageService, 'deleteCollection').mockResolvedValueOnce()

    await useCollectionsStore.getState().deleteCollection('a')
    const ids = useCollectionsStore.getState().collections.map(c => c.id)
    expect(ids).toEqual(['b'])
  })

  it('addBookmarkToCollection updates collectionBookmarks map', async () => {
    const c = makeCollection({ id: 'c' })
    useCollectionsStore.setState({ collections: [c], collectionBookmarks: { c: [] } })
    vi.spyOn(localStorageService, 'addBookmarkToCollection').mockResolvedValueOnce()

    await useCollectionsStore.getState().addBookmarkToCollection(1, 'c')
    expect(useCollectionsStore.getState().collectionBookmarks['c']).toEqual([1])
  })

  it('removeBookmarkFromCollection updates collectionBookmarks map', async () => {
    const c = makeCollection({ id: 'c' })
    useCollectionsStore.setState({ collections: [c], collectionBookmarks: { c: [1,2] } })
    vi.spyOn(localStorageService, 'removeBookmarkFromCollection').mockResolvedValueOnce()

    await useCollectionsStore.getState().removeBookmarkFromCollection(2, 'c')
    expect(useCollectionsStore.getState().collectionBookmarks['c']).toEqual([1])
  })
})
