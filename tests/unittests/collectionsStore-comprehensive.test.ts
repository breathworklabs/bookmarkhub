import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useCollectionsStore } from '../../src/store/collectionsStore'
import { localStorageService } from '../../src/lib/localStorage'
import type { Collection } from '../../src/types/collections'

const createTestCollection = (overrides: Partial<Collection> = {}): Collection => ({
  id: 'col-1',
  name: 'Test Collection',
  description: 'Test description',
  color: '#3b82f6',
  icon: 'folder',
  isPrivate: false,
  isDefault: false,
  isSmartCollection: false,
  parentId: null,
  children: [],
  bookmarkCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'test-user',
  ...overrides
})

describe('collectionsStore - Comprehensive', () => {
  beforeEach(() => {
    useCollectionsStore.setState({
      collections: [],
      activeCollectionId: null,
      collectionBookmarks: {},
      isCreatingCollection: false,
      collectionFilter: 'all',
      expandedCollections: [],
      collapsedSections: [],
      isLoading: false,
      error: null
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('active collection', () => {
    it('should set active collection', () => {
      useCollectionsStore.getState().setActiveCollection('col-123')

      expect(useCollectionsStore.getState().activeCollectionId).toBe('col-123')
    })

    it('should clear active collection', () => {
      useCollectionsStore.setState({ activeCollectionId: 'col-123' })
      useCollectionsStore.getState().setActiveCollection(null)

      expect(useCollectionsStore.getState().activeCollectionId).toBeNull()
    })
  })

  describe('collection expansion', () => {
    it('should toggle collection expansion on', () => {
      useCollectionsStore.getState().toggleCollectionExpansion('col-1')

      expect(useCollectionsStore.getState().expandedCollections).toContain('col-1')
    })

    it('should toggle collection expansion off', () => {
      useCollectionsStore.setState({ expandedCollections: ['col-1'] })
      useCollectionsStore.getState().toggleCollectionExpansion('col-1')

      expect(useCollectionsStore.getState().expandedCollections).not.toContain('col-1')
    })

    it('should expand collection', () => {
      useCollectionsStore.getState().expandCollection('col-1')

      expect(useCollectionsStore.getState().expandedCollections).toContain('col-1')
    })

    it('should not duplicate expanded collection', () => {
      useCollectionsStore.setState({ expandedCollections: ['col-1'] })
      useCollectionsStore.getState().expandCollection('col-1')

      expect(useCollectionsStore.getState().expandedCollections).toEqual(['col-1'])
    })

    it('should collapse collection', () => {
      useCollectionsStore.setState({ expandedCollections: ['col-1', 'col-2'] })
      useCollectionsStore.getState().collapseCollection('col-1')

      expect(useCollectionsStore.getState().expandedCollections).toEqual(['col-2'])
    })

    it('should expand all collections', () => {
      const collections = [
        createTestCollection({ id: 'col-1' }),
        createTestCollection({ id: 'col-2' }),
        createTestCollection({ id: 'col-3' })
      ]

      useCollectionsStore.setState({ collections })
      useCollectionsStore.getState().expandAll()

      const expanded = useCollectionsStore.getState().expandedCollections
      expect(expanded).toContain('col-1')
      expect(expanded).toContain('col-2')
      expect(expanded).toContain('col-3')
    })

    it('should collapse all collections', () => {
      useCollectionsStore.setState({
        expandedCollections: ['col-1', 'col-2', 'col-3']
      })

      useCollectionsStore.getState().collapseAll()

      expect(useCollectionsStore.getState().expandedCollections).toEqual([])
    })
  })

  describe('section collapse', () => {
    it('should toggle section collapse on', () => {
      useCollectionsStore.getState().toggleSectionCollapse('smart-collections')

      expect(useCollectionsStore.getState().collapsedSections).toContain('smart-collections')
    })

    it('should toggle section collapse off', () => {
      useCollectionsStore.setState({ collapsedSections: ['smart-collections'] })
      useCollectionsStore.getState().toggleSectionCollapse('smart-collections')

      expect(useCollectionsStore.getState().collapsedSections).toEqual([])
    })

    it('should check if section is collapsed', () => {
      useCollectionsStore.setState({ collapsedSections: ['smart-collections'] })

      expect(useCollectionsStore.getState().isSectionCollapsed('smart-collections')).toBe(true)
      expect(useCollectionsStore.getState().isSectionCollapsed('user-collections')).toBe(false)
    })
  })

  describe('UI state', () => {
    it('should set creating collection state', () => {
      useCollectionsStore.getState().setCreatingCollection(true)

      expect(useCollectionsStore.getState().isCreatingCollection).toBe(true)
    })

    it('should toggle creating collection state', () => {
      useCollectionsStore.getState().setCreatingCollection(true)
      expect(useCollectionsStore.getState().isCreatingCollection).toBe(true)

      useCollectionsStore.getState().setCreatingCollection(false)
      expect(useCollectionsStore.getState().isCreatingCollection).toBe(false)
    })

    it('should set collection filter', () => {
      useCollectionsStore.getState().setCollectionFilter('private')

      expect(useCollectionsStore.getState().collectionFilter).toBe('private')
    })

    it('should set error message', () => {
      useCollectionsStore.getState().setError('Test error')

      expect(useCollectionsStore.getState().error).toBe('Test error')
    })

    it('should clear error message', () => {
      useCollectionsStore.setState({ error: 'Previous error' })
      useCollectionsStore.getState().setError(null)

      expect(useCollectionsStore.getState().error).toBeNull()
    })

    it('should set loading state', () => {
      useCollectionsStore.getState().setLoading(true)

      expect(useCollectionsStore.getState().isLoading).toBe(true)
    })
  })

  // Collection breadcrumb tests skipped - uses lazy require that doesn't work in vitest

  describe('load collections', () => {
    it('should load collections successfully', async () => {
      const collections = [
        createTestCollection({ id: 'col-1' }),
        createTestCollection({ id: 'col-2' })
      ]

      vi.spyOn(localStorageService, 'getCollections').mockResolvedValue(collections)
      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValue([])

      await useCollectionsStore.getState().loadCollections()

      const state = useCollectionsStore.getState()
      expect(state.collections).toHaveLength(2)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should not load if already loading', async () => {
      const spy = vi.spyOn(localStorageService, 'getCollections')
      useCollectionsStore.setState({ isLoading: true })

      await useCollectionsStore.getState().loadCollections()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should handle load error', async () => {
      vi.spyOn(localStorageService, 'getCollections').mockRejectedValue(
        new Error('Load failed')
      )

      await useCollectionsStore.getState().loadCollections()

      const state = useCollectionsStore.getState()
      expect(state.error).toBeTruthy()
      expect(state.isLoading).toBe(false)
    })

    it('should build collection bookmarks map', async () => {
      const collections = [createTestCollection({ id: 'col-1' })]
      const bookmarks = [{ id: 1 }, { id: 2 }]

      vi.spyOn(localStorageService, 'getCollections').mockResolvedValue(collections)
      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValue(
        bookmarks as any
      )

      await useCollectionsStore.getState().loadCollections()

      const state = useCollectionsStore.getState()
      expect(state.collectionBookmarks['col-1']).toEqual([1, 2])
    })
  })

  describe('initialize', () => {
    it('should initialize collections quickly', async () => {
      const collections = [createTestCollection({ id: 'col-1' })]

      vi.spyOn(localStorageService, 'getCollections').mockResolvedValue(collections)
      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValue([])

      await useCollectionsStore.getState().initialize()

      const state = useCollectionsStore.getState()
      expect(state.collections).toHaveLength(1)
      expect(state.isLoading).toBe(false)
    })

    it('should not initialize if already loading', async () => {
      const spy = vi.spyOn(localStorageService, 'getCollections')
      useCollectionsStore.setState({ isLoading: true })

      await useCollectionsStore.getState().initialize()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should handle initialization error', async () => {
      vi.spyOn(localStorageService, 'getCollections').mockRejectedValue(
        new Error('Init failed')
      )

      await useCollectionsStore.getState().initialize()

      const state = useCollectionsStore.getState()
      expect(state.error).toBeTruthy()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('create collection', () => {
    it('should create collection successfully', async () => {
      const newCollection = createTestCollection({ id: 'new-col' })

      vi.spyOn(localStorageService, 'createCollection').mockResolvedValue(newCollection)
      vi.spyOn(localStorageService, 'getCollections').mockResolvedValue([newCollection])
      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValue([])

      await useCollectionsStore.getState().createCollection({
        name: 'New Collection',
        description: 'Test',
        color: '#3b82f6',
        userId: 'test'
      })

      // Should reload collections
      expect(localStorageService.createCollection).toHaveBeenCalled()
    })

    it('should handle create error', async () => {
      vi.spyOn(localStorageService, 'createCollection').mockRejectedValue(
        new Error('Create failed')
      )

      await useCollectionsStore.getState().createCollection({
        name: 'New Collection',
        description: 'Test',
        color: '#3b82f6',
        userId: 'test'
      })

      const state = useCollectionsStore.getState()
      expect(state.error).toBeTruthy()
    })
  })

  describe('update collection', () => {
    it('should update collection successfully', async () => {
      const updated = createTestCollection({ id: 'col-1', name: 'Updated' })

      vi.spyOn(localStorageService, 'updateCollection').mockResolvedValue(updated)
      vi.spyOn(localStorageService, 'getCollections').mockResolvedValue([updated])
      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValue([])

      await useCollectionsStore.getState().updateCollection('col-1', {
        name: 'Updated'
      })

      expect(localStorageService.updateCollection).toHaveBeenCalled()
    })

    it('should handle update error', async () => {
      vi.spyOn(localStorageService, 'updateCollection').mockRejectedValue(
        new Error('Update failed')
      )

      await useCollectionsStore.getState().updateCollection('col-1', {
        name: 'Updated'
      })

      const state = useCollectionsStore.getState()
      expect(state.error).toBeTruthy()
    })
  })

  describe('delete collection', () => {
    it('should delete collection with flatten mode', async () => {
      vi.spyOn(localStorageService, 'deleteCollection').mockResolvedValue(undefined)
      vi.spyOn(localStorageService, 'getCollections').mockResolvedValue([])
      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValue([])

      await useCollectionsStore.getState().deleteCollection('col-1', 'flatten')

      expect(localStorageService.deleteCollection).toHaveBeenCalledWith('col-1', 'flatten')
    })

    it('should delete collection with cascade mode', async () => {
      vi.spyOn(localStorageService, 'deleteCollection').mockResolvedValue(undefined)
      vi.spyOn(localStorageService, 'getCollections').mockResolvedValue([])
      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValue([])

      await useCollectionsStore.getState().deleteCollection('col-1', 'cascade')

      expect(localStorageService.deleteCollection).toHaveBeenCalledWith('col-1', 'cascade')
    })

    it('should handle delete error', async () => {
      vi.spyOn(localStorageService, 'deleteCollection').mockRejectedValue(
        new Error('Delete failed')
      )

      await useCollectionsStore.getState().deleteCollection('col-1')

      const state = useCollectionsStore.getState()
      expect(state.error).toBeTruthy()
    })
  })

  describe('bookmark-collection operations', () => {
    it('should add bookmark to collection', async () => {
      vi.spyOn(localStorageService, 'addBookmarkToCollection').mockResolvedValue(undefined)

      await useCollectionsStore.getState().addBookmarkToCollection(1, 'col-1')

      expect(localStorageService.addBookmarkToCollection).toHaveBeenCalledWith(1, 'col-1')
    })

    it('should remove bookmark from collection', async () => {
      vi.spyOn(localStorageService, 'removeBookmarkFromCollection').mockResolvedValue(undefined)

      await useCollectionsStore.getState().removeBookmarkFromCollection(1, 'col-1')

      expect(localStorageService.removeBookmarkFromCollection).toHaveBeenCalledWith(1, 'col-1')
    })

    it('should get bookmarks by collection', async () => {
      const bookmarks = [{ id: 1 }, { id: 2 }]
      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValue(
        bookmarks as any
      )

      await useCollectionsStore.getState().getBookmarksByCollection('col-1')

      const state = useCollectionsStore.getState()
      expect(state.collectionBookmarks['col-1']).toEqual([1, 2])
    })

    it('should move multiple bookmarks', async () => {
      vi.spyOn(localStorageService, 'addBookmarkToCollection').mockResolvedValue(undefined)

      await useCollectionsStore.getState().moveMultipleBookmarks([1, 2, 3], 'col-target')

      expect(localStorageService.addBookmarkToCollection).toHaveBeenCalledTimes(3)
    })
  })

  describe('move collection', () => {
    it('should move collection to new parent', async () => {
      const updated = createTestCollection({ id: 'col-1', parentId: 'new-parent' })

      vi.spyOn(localStorageService, 'updateCollection').mockResolvedValue(updated)
      vi.spyOn(localStorageService, 'getCollections').mockResolvedValue([updated])
      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValue([])

      await useCollectionsStore.getState().moveCollection('col-1', 'new-parent')

      expect(localStorageService.updateCollection).toHaveBeenCalledWith('col-1', {
        parentId: 'new-parent'
      })
    })

    it('should move collection to root', async () => {
      const updated = createTestCollection({ id: 'col-1', parentId: null })

      vi.spyOn(localStorageService, 'updateCollection').mockResolvedValue(updated)
      vi.spyOn(localStorageService, 'getCollections').mockResolvedValue([updated])
      vi.spyOn(localStorageService, 'getBookmarksByCollection').mockResolvedValue([])

      await useCollectionsStore.getState().moveCollection('col-1', null)

      expect(localStorageService.updateCollection).toHaveBeenCalledWith('col-1', {
        parentId: null
      })
    })
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const initialState = useCollectionsStore.getState()

      expect(initialState.collections).toEqual([])
      expect(initialState.activeCollectionId).toBeNull()
      expect(initialState.collectionBookmarks).toEqual({})
      expect(initialState.isCreatingCollection).toBe(false)
      expect(initialState.collectionFilter).toBe('all')
      expect(initialState.expandedCollections).toEqual([])
      expect(initialState.collapsedSections).toEqual([])
      expect(initialState.isLoading).toBe(false)
      expect(initialState.error).toBeNull()
    })
  })
})
