import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCollectionsStore } from '../../src/store/collectionsStore'
import { localStorageService, type StoredCollection } from '../../src/lib/localStorage'

vi.mock('../../src/lib/shareApi', () => ({
  createShare: vi.fn(),
  revokeShare: vi.fn(),
}))

const makeCollection = (overrides: Partial<StoredCollection> = {}): StoredCollection => ({
  id: overrides.id ?? 'c1',
  name: overrides.name ?? 'My Collection',
  description: '',
  isPrivate: false,
  isDefault: false,
  isSmartCollection: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  bookmarkCount: 0,
  userId: 'local-user',
  ...overrides,
})

const resetStore = () => {
  useCollectionsStore.setState({
    collections: [],
    collectionBookmarks: {},
    isLoading: false,
    error: null,
    activeCollectionId: null,
    expandedCollections: [],
    isCreatingCollection: false,
    collectionFilter: 'all',
    collapsedSections: [],
  })
}

describe('collectionsStore share actions', () => {
  beforeEach(() => {
    resetStore()
    vi.restoreAllMocks()
  })

  describe('shareCollection', () => {
    it('updates collection shareSettings on success', async () => {
      const col = makeCollection({ id: 'c1', name: 'Dev Tools' })
      useCollectionsStore.setState({ collections: [col] })

      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValueOnce([])

      const { createShare } = await import('../../src/lib/shareApi')
      vi.mocked(createShare).mockResolvedValueOnce({
        id: 'share-xyz',
        shareUrl: 'https://example.com/s/share-xyz',
        expiresAt: '2026-04-23T00:00:00.000Z',
      })

      const result = await useCollectionsStore.getState().shareCollection('c1', {
        expiryDays: 7,
        maxAccess: 5,
      })

      expect(result).toEqual({
        shareUrl: 'https://example.com/s/share-xyz',
        expiresAt: '2026-04-23T00:00:00.000Z',
      })

      const updated = useCollectionsStore.getState().collections.find((c) => c.id === 'c1')
      expect(updated?.shareSettings?.shareId).toBe('share-xyz')
      expect(updated?.shareSettings?.shareUrl).toBe('https://example.com/s/share-xyz')
      expect(updated?.shareSettings?.maxAccess).toBe(5)
      expect(updated?.shareSettings?.accessCount).toBe(0)
    })

    it('sets error and returns null when collection not found', async () => {
      useCollectionsStore.setState({ collections: [] })

      const result = await useCollectionsStore.getState().shareCollection('missing', {})

      expect(result).toBeNull()
      expect(useCollectionsStore.getState().error).toBeTruthy()
    })

    it('sets error and returns null on API failure', async () => {
      const col = makeCollection({ id: 'c1' })
      useCollectionsStore.setState({ collections: [col] })

      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValueOnce([])

      const { createShare } = await import('../../src/lib/shareApi')
      vi.mocked(createShare).mockRejectedValueOnce(new Error('Network error'))

      const result = await useCollectionsStore.getState().shareCollection('c1', {})

      expect(result).toBeNull()
      expect(useCollectionsStore.getState().error).toBe('Network error')
    })

    it('clears isLoading after completion', async () => {
      const col = makeCollection({ id: 'c1' })
      useCollectionsStore.setState({ collections: [col] })

      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValueOnce([])

      const { createShare } = await import('../../src/lib/shareApi')
      vi.mocked(createShare).mockRejectedValueOnce(new Error('fail'))

      await useCollectionsStore.getState().shareCollection('c1', {})

      expect(useCollectionsStore.getState().isLoading).toBe(false)
    })
  })

  describe('revokeShare', () => {
    it('clears shareSettings on success', async () => {
      const col = makeCollection({
        id: 'c1',
        shareSettings: {
          shareId: 'share-xyz',
          shareUrl: 'https://example.com/s/share-xyz',
          expiresAt: null,
          maxAccess: null,
          accessCount: 2,
          sharedAt: new Date().toISOString(),
        },
      } as any)
      useCollectionsStore.setState({ collections: [col] })

      const { revokeShare } = await import('../../src/lib/shareApi')
      vi.mocked(revokeShare).mockResolvedValueOnce(true)

      await useCollectionsStore.getState().revokeShare('c1')

      const updated = useCollectionsStore.getState().collections.find((c) => c.id === 'c1')
      expect(updated?.shareSettings).toBeUndefined()
    })

    it('calls revokeShare API with the correct shareId', async () => {
      const col = makeCollection({
        id: 'c1',
        shareSettings: {
          shareId: 'share-abc',
          shareUrl: 'https://example.com/s/share-abc',
          expiresAt: null,
          maxAccess: null,
          accessCount: 0,
          sharedAt: new Date().toISOString(),
        },
      } as any)
      useCollectionsStore.setState({ collections: [col] })

      const { revokeShare } = await import('../../src/lib/shareApi')
      vi.mocked(revokeShare).mockResolvedValueOnce(true)

      await useCollectionsStore.getState().revokeShare('c1')

      expect(revokeShare).toHaveBeenCalledWith('share-abc')
    })

    it('sets error when no active share exists', async () => {
      const col = makeCollection({ id: 'c1' }) // no shareSettings
      useCollectionsStore.setState({ collections: [col] })

      await useCollectionsStore.getState().revokeShare('c1')

      expect(useCollectionsStore.getState().error).toBeTruthy()
    })

    it('sets error on API failure', async () => {
      const col = makeCollection({
        id: 'c1',
        shareSettings: {
          shareId: 'share-xyz',
          shareUrl: 'https://example.com/s/share-xyz',
          expiresAt: null,
          maxAccess: null,
          accessCount: 0,
          sharedAt: new Date().toISOString(),
        },
      } as any)
      useCollectionsStore.setState({ collections: [col] })

      const { revokeShare } = await import('../../src/lib/shareApi')
      vi.mocked(revokeShare).mockRejectedValueOnce(new Error('Delete failed'))

      await useCollectionsStore.getState().revokeShare('c1')

      expect(useCollectionsStore.getState().error).toBe('Delete failed')
    })

    it('clears isLoading after completion', async () => {
      const col = makeCollection({
        id: 'c1',
        shareSettings: {
          shareId: 'share-xyz',
          shareUrl: 'https://example.com/s/share-xyz',
          expiresAt: null,
          maxAccess: null,
          accessCount: 0,
          sharedAt: new Date().toISOString(),
        },
      } as any)
      useCollectionsStore.setState({ collections: [col] })

      const { revokeShare } = await import('../../src/lib/shareApi')
      vi.mocked(revokeShare).mockRejectedValueOnce(new Error('fail'))

      await useCollectionsStore.getState().revokeShare('c1')

      expect(useCollectionsStore.getState().isLoading).toBe(false)
    })
  })
})
