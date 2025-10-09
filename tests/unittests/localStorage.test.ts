import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LocalStorageService, type StoredBookmarkCollection } from '../../src/lib/localStorage'
import type { BookmarkInsert } from '../../src/types/bookmark'

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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

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

describe('LocalStorageService', () => {
  let service: LocalStorageService

  const sampleBookmark: BookmarkInsert = {
      user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
      title: 'Test Bookmark',
      url: 'https://example.com',
      description: 'This is a test bookmark',
      content: 'This is a test bookmark',
      author: 'Test Author',
      domain: 'example.com',
      source_platform: 'manual',
      engagement_score: 10,
      is_starred: false,
      is_read: false,
      is_archived: false,
      is_shared: false,
      tags: ['test', 'bookmark'],
      collections: ['uncategorized']
    }

  beforeEach(() => {
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
    service = new LocalStorageService()
  })

  describe('Bookmark Operations', () => {
    it('should create a new bookmark', async () => {
      const result = await service.createBookmark(sampleBookmark)

      expect(result).toMatchObject({
        ...sampleBookmark,
        id: 1
      })
      expect(result.created_at).toBeDefined()
      expect(result.updated_at).toBeDefined()
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'x-bookmark-manager-data',
        expect.any(String)
      )
    })

    it('should load bookmarks from localStorage', async () => {
      const existingBookmarks = [
        {
          id: 1,
          ...sampleBookmark,
          is_deleted: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockStorage['x-bookmark-manager-data'] = createConsolidatedStorage({ bookmarks: existingBookmarks })

      const result = await service.getBookmarks()

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject(sampleBookmark)
    })

    it('should return empty array when no bookmarks exist', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = await service.getBookmarks()

      expect(result).toEqual([])
    })

    it('should update a bookmark', async () => {
      const existingBookmarks = [
        {
          id: 1,
          ...sampleBookmark,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockStorage["x-bookmark-manager-data"] = createConsolidatedStorage({ bookmarks: existingBookmarks })
      localStorageMock.setItem.mockReturnValue(undefined)

      const updates = { title: 'Updated Title', is_starred: true }
      const result = await service.updateBookmark(1, updates)

      expect(result.title).toBe('Updated Title')
      expect(result.is_starred).toBe(true)
      expect(result.updated_at).not.toBe('2024-01-01T00:00:00Z')
    })

    it('should delete a bookmark', async () => {
      const existingBookmarks = [
        {
          id: 1,
          ...sampleBookmark,
          is_deleted: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          ...sampleBookmark,
          title: 'Second Bookmark',
          is_deleted: false,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      ]

      mockStorage["x-bookmark-manager-data"] = createConsolidatedStorage({ bookmarks: existingBookmarks })
      localStorageMock.setItem.mockReturnValue(undefined)

      await service.deleteBookmark(1)

      // Verify setItem was called with the filtered bookmarks
      const setItemCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'x-bookmark-manager-data'
      )
      expect(setItemCall).toBeDefined()

      const savedData = JSON.parse(setItemCall![1])
      expect(savedData.bookmarks).toHaveLength(1)
      expect(savedData.bookmarks[0].id).toBe(2)
    })

    it('should toggle bookmark star status', async () => {
      const existingBookmarks = [
        {
          id: 1,
          ...sampleBookmark,
          isStarred: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockStorage["x-bookmark-manager-data"] = createConsolidatedStorage({ bookmarks: existingBookmarks })
      localStorageMock.setItem.mockReturnValue(undefined)

      const result = await service.toggleBookmarkStar(1)

      expect(result.is_starred).toBe(true)
    })

    it('should search bookmarks by query', async () => {
      const existingBookmarks = [
        {
          id: 1,
          title: 'React Tutorial',
          content: 'Learn React hooks and components',
          author: 'React Team',
          domain: 'reactjs.org',
          url: 'https://reactjs.org/tutorial',
          tags: ['react', 'tutorial'],
          is_starred: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
          title: 'Vue.js Guide',
          url: 'https://vuejs.org/guide',
          description: 'Getting started with Vue.js',
          content: 'Getting started with Vue.js',
          author: 'Vue Team',
          domain: 'vuejs.org',
          source_platform: 'manual',
          engagement_score: 8,
          is_starred: false,
          is_read: false,
          is_archived: false,
          tags: ['vue', 'tutorial'],
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      ]

      mockStorage["x-bookmark-manager-data"] = createConsolidatedStorage({ bookmarks: existingBookmarks })

      const reactResults = await service.searchBookmarks('react')
      expect(reactResults).toHaveLength(1)
      expect(reactResults[0].title).toBe('React Tutorial')

      const tutorialResults = await service.searchBookmarks('tutorial')
      expect(tutorialResults).toHaveLength(2)

      const emptyResults = await service.searchBookmarks('')
      expect(emptyResults).toHaveLength(2)
    })

    it('should get starred bookmarks', async () => {
      const existingBookmarks = [
        {
          id: 1,
          ...sampleBookmark,
          title: 'Starred Bookmark',
          is_starred: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          ...sampleBookmark,
          title: 'Regular Bookmark',
          is_starred: false,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      ]

      mockStorage["x-bookmark-manager-data"] = createConsolidatedStorage({ bookmarks: existingBookmarks })

      const result = await service.getStarredBookmarks()

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Starred Bookmark')
    })

    describe('Collection Operations', () => {
      it('should create a new collection', async () => {
        localStorageMock.getItem.mockReturnValue('[]')
        localStorageMock.setItem.mockReturnValue(undefined)

        const collectionData = {
          name: 'Test Collection',
          description: 'A test collection',
          color: '#1d4ed8',
          icon: 'folder',
          isPrivate: false,
          isDefault: false,
          isSmartCollection: false,
          userId: 'local-user'
        }

        const result = await service.createCollection(collectionData)

        expect(result).toMatchObject({
          ...collectionData,
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          bookmarkCount: 0
        })
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'x-bookmark-manager-data',
          expect.any(String)
        )
      })

      it('should load collections from localStorage', async () => {
        const existingCollections = [
          {
            id: 'test-collection',
            name: 'Test Collection',
            description: 'A test collection',
            isPrivate: false,
            isDefault: false,
            isSmartCollection: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            bookmarkCount: 0,
            userId: 'local-user'
          }
        ]

        mockStorage["x-bookmark-manager-data"] = createConsolidatedStorage({ collections: existingCollections })

        const result = await service.getCollections()

        // Should return the existing collection (not default collections since we have data)
        const testCollection = result.find(c => c.id === 'test-collection')
        expect(testCollection).toBeDefined()
        expect(testCollection).toMatchObject(existingCollections[0])
        expect(localStorageMock.getItem).toHaveBeenCalledWith('x-bookmark-manager-data')
      })

      it('should initialize default collections when none exist', async () => {
        localStorageMock.getItem.mockReturnValue(null)
        localStorageMock.setItem.mockReturnValue(undefined)

        const result = await service.getCollections()

        expect(result).toHaveLength(4) // uncategorized, starred, recent, archived
        expect(result.find(c => c.id === 'uncategorized')).toBeDefined()
        expect(result.find(c => c.id === 'starred')).toBeDefined()
        expect(result.find(c => c.id === 'recent')).toBeDefined()
        expect(result.find(c => c.id === 'archived')).toBeDefined()
      })

      it('should update a collection', async () => {
        const existingCollections = [
          {
            id: 'test-collection',
            name: 'Test Collection',
            description: 'A test collection',
            isPrivate: false,
            isDefault: false,
            isSmartCollection: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            bookmarkCount: 0,
            userId: 'local-user'
          }
        ]

        mockStorage["x-bookmark-manager-data"] = createConsolidatedStorage({ collections: existingCollections })
        localStorageMock.setItem.mockReturnValue(undefined)

        const updates = { name: 'Updated Collection', description: 'Updated description' }
        const result = await service.updateCollection('test-collection', updates)

        expect(result.name).toBe('Updated Collection')
        expect(result.description).toBe('Updated description')
        expect(result.updatedAt).not.toBe('2024-01-01T00:00:00Z')
      })

      it('should delete a collection', async () => {
        const existingCollections = [
          {
            id: 'test-collection',
            name: 'Test Collection',
            description: 'A test collection',
            isPrivate: false,
            isDefault: false,
            isSmartCollection: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            bookmarkCount: 0,
            userId: 'local-user'
          },
          {
            id: 'another-collection',
            name: 'Another Collection',
            description: 'Another test collection',
            isPrivate: false,
            isDefault: false,
            isSmartCollection: false,
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
            bookmarkCount: 0,
            userId: 'local-user'
          }
        ]

        mockStorage["x-bookmark-manager-data"] = createConsolidatedStorage({ collections: existingCollections })
        localStorageMock.setItem.mockReturnValue(undefined)

        await service.deleteCollection('test-collection')

        // Verify setItem was called with the filtered collections
        const setItemCall = localStorageMock.setItem.mock.calls.find(
          call => call[0] === 'x-bookmark-manager-data'
        )
        expect(setItemCall).toBeDefined()

        const savedData = JSON.parse(setItemCall![1])
        expect(savedData.collections).toHaveLength(1)
        expect(savedData.collections[0].id).toBe('another-collection')
      })
    })
  })

  // Settings operations removed - now managed by settingsStore
  // describe('Settings Operations', () => { ... })

  describe('Export/Import Operations', () => {
    it('should export all data', async () => {
      const bookmarks = [{ id: 1, ...sampleBookmark, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }]
      const collections = [{
        id: 'test-collection',
        name: 'Test Collection',
        description: 'Test collection',
        isPrivate: false,
        isDefault: false,
        isSmartCollection: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        bookmarkCount: 0,
        userId: 'local-user'
      }]
      const bookmarkCollections: StoredBookmarkCollection[] = []
      const settings = { theme: 'dark', viewMode: 'grid', defaultSort: 'newest', showMetrics: true, compactMode: false, autoBackup: true, exportFormat: 'json', defaultCollection: null, duplicateHandling: 'skip' }
      const metadata = { version: '1.0.0', totalBookmarks: 1, createdAt: '2024-01-01T00:00:00Z', lastUpdate: '2024-01-01T00:00:00Z' }

      // Set up consolidated storage with test data
      mockStorage['x-bookmark-manager-data'] = createConsolidatedStorage({
        bookmarks,
        collections,
        bookmarkCollections,
        settings,
        metadata
      })

      const result = await service.exportData()

      expect(result.bookmarks).toHaveLength(1)
      expect(result.collections).toHaveLength(1)
      expect(result.bookmarkCollections).toEqual([])
      // Settings are now managed by settingsStore, not in exported data
      expect(result.metadata).toMatchObject(metadata)
      expect(result.exportedAt).toBeDefined()
    })

    it('should import data', async () => {
      // Start fresh - remove existing storage
      delete mockStorage['x-bookmark-manager-data']

      const importData = {
        bookmarks: [{ id: 1, ...sampleBookmark, is_deleted: false, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }],
        settings: { theme: 'light' as const, viewMode: 'list' as const, defaultSort: 'title' as const, showMetrics: false, compactMode: true, autoBackup: false, exportFormat: 'csv' as const, defaultCollection: null, duplicateHandling: 'skip' as const }
      }

      await service.importData(importData)

      // Verify consolidated storage was saved
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'x-bookmark-manager-data',
        expect.any(String)
      )

      // Verify the saved data contains expected bookmarks with primaryCollection
      const savedCalls = localStorageMock.setItem.mock.calls.filter(call => call[0] === 'x-bookmark-manager-data')
      expect(savedCalls.length).toBeGreaterThan(0)

      const lastSave = savedCalls[savedCalls.length - 1]
      const savedData = JSON.parse(lastSave[1])

      expect(savedData.bookmarks).toBeDefined()
      expect(savedData.bookmarks[0]).toMatchObject({
        ...importData.bookmarks[0],
        primaryCollection: 'uncategorized'
      })
      // Settings are now managed by settingsStore, not in consolidated storage
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })

      const result = await service.getBookmarks()
      expect(result).toEqual([])
    })

    it('should handle JSON parse errors', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const result = await service.getBookmarks()
      expect(result).toEqual([])
    })

    it('should throw error when bookmark not found for update', async () => {
      localStorageMock.getItem.mockReturnValue('[]')

      await expect(service.updateBookmark(999, { title: 'Updated' }))
        .rejects.toThrow('Bookmark with id 999 not found')
    })

    it('should throw error when bookmark not found for delete', async () => {
      localStorageMock.getItem.mockReturnValue('[]')

      await expect(service.deleteBookmark(999))
        .rejects.toThrow('Bookmark with id 999 not found')
    })
  })

  describe('Storage Information', () => {
    it('should provide storage information', async () => {
      const metadata = {
        version: '1.0.0',
        totalBookmarks: 0,
        createdAt: '2024-01-01T00:00:00Z',
        lastUpdate: '2024-01-01T00:00:00Z'
      }

      localStorageMock.getItem
        .mockReturnValueOnce('[]') // for bookmarks
        .mockReturnValueOnce(JSON.stringify(metadata)) // for metadata

      const result = await service.getStorageInfo()

      expect(result).toMatchObject({
        isAvailable: true,
        usedSpace: expect.any(Number),
        totalBookmarks: 0,
        lastUpdate: expect.any(String)
      })
    })
  })
})