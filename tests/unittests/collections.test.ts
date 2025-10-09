import { describe, it, expect, beforeEach, vi } from 'vitest'
import { localStorageService } from '../../src/lib/localStorage'
import { useCollectionsStore } from '../../src/store/collectionsStore'
import type { CollectionInsert } from '../../src/lib/localStorage'

// Mock localStorage with consolidated storage support
let mockStorage: any = {}

const localStorageMock = {
  getItem: vi.fn((key: string) => {
    return mockStorage[key] || null
  }),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key]
  }),
  clear: vi.fn(() => {
    mockStorage = {}
  }),
}

// Helper to create consolidated storage format
const createConsolidatedStorage = (overrides: any = {}) => {
  const defaultStorage = {
    bookmarks: [],
    collections: [],
    bookmarkCollections: [],
    settings: {
      theme: 'dark',
      viewMode: 'grid',
      defaultSort: 'newest',
      showMetrics: true,
      compactMode: false,
      autoBackup: true,
      exportFormat: 'json',
      defaultCollection: null,
      duplicateHandling: 'skip'
    },
    metadata: {
      version: '1.0.0',
      totalBookmarks: 0,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    },
    version: '2.0.0',
    ...overrides
  }
  return JSON.stringify(defaultStorage)
}

// Mock the global localStorage object that the service actually uses
vi.stubGlobal('localStorage', localStorageMock)

describe('Collections localStorage persistence', () => {
  beforeEach(async () => {
    // Reset all mocks including return values
    localStorageMock.getItem.mockReset()
    localStorageMock.setItem.mockReset()
    localStorageMock.removeItem.mockReset()
    localStorageMock.clear.mockReset()

    // Restore original implementations
    localStorageMock.getItem.mockImplementation((key: string) => mockStorage[key] || null)
    localStorageMock.setItem.mockImplementation((key: string, value: string) => { mockStorage[key] = value })
    localStorageMock.removeItem.mockImplementation((key: string) => { delete mockStorage[key] })
    localStorageMock.clear.mockImplementation(() => { mockStorage = {} })

    mockStorage = {}
    // Initialize with default consolidated storage
    mockStorage['x-bookmark-manager-data'] = createConsolidatedStorage()

    // Reset store state to initial state and wait for any pending operations
    useCollectionsStore.setState({
      collections: [],
      activeCollectionId: null,
      collectionBookmarks: {},
      isCreatingCollection: false,
      collectionFilter: 'all',
      expandedCollections: [],
      isLoading: false,
      error: null
    })

    // Wait a tick to ensure state is properly reset
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  describe('localStorage service', () => {
    it('should create collection and save to localStorage', async () => {
      // beforeEach already sets up empty consolidated storage

      const testCollection: CollectionInsert = {
        name: 'Test Collection',
        description: 'Test description',
        color: '#1d4ed8',
        isPrivate: false,
        isDefault: false,
        isSmartCollection: false,
        userId: 'local-user'
      }

      const result = await localStorageService.createCollection(testCollection)

      // Verify the collection was created with proper fields
      expect(result).toMatchObject({
        name: 'Test Collection',
        description: 'Test description',
        color: '#1d4ed8',
        isPrivate: false,
        isDefault: false,
        isSmartCollection: false,
        userId: 'local-user'
      })

      expect(result.id).toBeDefined()
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
      expect(result.bookmarkCount).toBe(0)

      // Verify localStorage.setItem was called with consolidated storage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'x-bookmark-manager-data',
        expect.stringContaining('Test Collection')
      )
    })

    it('should load collections from localStorage', async () => {
      const mockCollections = [
        {
          id: 'test-1',
          name: 'Test Collection 1',
          description: 'Test description',
          color: '#1d4ed8',
          isPrivate: false,
          isDefault: false,
          isSmartCollection: false,
          userId: 'local-user',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          bookmarkCount: 0
        }
      ]

      mockStorage['x-bookmark-manager-data'] = createConsolidatedStorage({ collections: mockCollections })

      const result = await localStorageService.getCollections()

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject(mockCollections[0])
      expect(localStorageMock.getItem).toHaveBeenCalledWith('x-bookmark-manager-data')
    })

    it('should initialize default collections when localStorage is empty', async () => {
      // Start fresh without storage
      delete mockStorage['x-bookmark-manager-data']

      const result = await localStorageService.getCollections()

      // Should have default collections
      expect(result.length).toBeGreaterThan(0)

      // Should contain default collections
      const defaultNames = result.map(c => c.name)
      expect(defaultNames).toContain('Starred')
      expect(defaultNames).toContain('Recent')
      expect(defaultNames).toContain('Archived')

      // Should save default collections to consolidated localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'x-bookmark-manager-data',
        expect.any(String)
      )
    })
  })

  describe('Collections store', () => {
    it('should create collection through store', async () => {
      // beforeEach already sets up empty consolidated storage

      const store = useCollectionsStore.getState()

      const testCollection: CollectionInsert = {
        name: 'Store Test Collection',
        description: 'Created through store',
        color: '#3b82f6',
        isPrivate: false,
        isDefault: false,
        isSmartCollection: false,
        userId: 'local-user'
      }

      await store.createCollection(testCollection)

      // Verify consolidated localStorage was called
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'x-bookmark-manager-data',
        expect.stringContaining('Store Test Collection')
      )
    })

    it('should load collections on initialize', async () => {
      const mockCollections = [
        {
          id: 'test-1',
          name: 'Existing Collection',
          description: '',
          color: '#1d4ed8',
          isPrivate: false,
          isDefault: false,
          isSmartCollection: false,
          userId: 'local-user',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          bookmarkCount: 0
        }
      ]

      // Set up consolidated storage with the test collection
      mockStorage['x-bookmark-manager-data'] = createConsolidatedStorage({
        collections: mockCollections,
        bookmarkCollections: []
      })

      // Test the localStorage service directly first
      const directCollections = await localStorageService.getCollections()
      expect(directCollections).toHaveLength(1)
      expect(directCollections[0].name).toBe('Existing Collection')

      // Now test the store
      const store = useCollectionsStore.getState()

      // Test initialize method
      await store.initialize()

      // Check if collections were loaded into store
      const state = useCollectionsStore.getState()

      // Check for errors
      if (state.error) {
        console.error('Store error:', state.error)
      }

      expect(state.error).toBeNull()
      expect(state.collections).toHaveLength(1)
      expect(state.collections[0].name).toBe('Existing Collection')
    })

    it('should handle localStorage persistence across store operations', async () => {
      // beforeEach already sets up empty consolidated storage

      const store = useCollectionsStore.getState()

      // Create first collection
      await store.createCollection({
        name: 'Collection 1',
        description: 'First collection',
        color: '#1d4ed8',
        isPrivate: false,
        isDefault: false,
        isSmartCollection: false,
        userId: 'local-user'
      })

      // The collection should now be in mockStorage along with default collections
      // Initialize store (simulating page refresh)
      await store.initialize()

      // Verify collections persisted (including defaults)
      const state = useCollectionsStore.getState()
      expect(state.collections.length).toBeGreaterThan(0)

      // Verify our custom collection is there
      const customCollection = state.collections.find(c => c.name === 'Collection 1')
      expect(customCollection).toBeDefined()
      expect(customCollection?.description).toBe('First collection')
    })
  })

  describe('Integration with bookmark store', () => {
    it('should not interfere when bookmarks load mock data', async () => {
      // Simulate collections existing in localStorage
      const existingCollections = [
        {
          id: 'existing-1',
          name: 'My Collection',
          description: 'Should persist',
          color: '#1d4ed8',
          isPrivate: false,
          isDefault: false,
          isSmartCollection: false,
          userId: 'local-user',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          bookmarkCount: 0
        }
      ]

      // Mock localStorage to return collections but no bookmarks
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'x-bookmark-manager-collections') {
          return JSON.stringify(existingCollections)
        }
        if (key === 'x-bookmark-manager-bookmarks') {
          return null // No bookmarks - should trigger mock data
        }
        return null
      })

      // Initialize collections store
      const collectionsStore = useCollectionsStore.getState()
      await collectionsStore.initialize()

      // Verify collections were loaded despite no bookmarks
      const collectionsState = useCollectionsStore.getState()
      expect(collectionsState.collections).toHaveLength(1)
      expect(collectionsState.collections[0].name).toBe('My Collection')
    })
  })
})