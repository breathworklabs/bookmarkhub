import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LocalStorageService, type StoredBookmarkCollection } from '../lib/localStorage'
import type { BookmarkInsert } from '../types/bookmark'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

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
      tags: ['test', 'bookmark'],
      collections: ['uncategorized']
    }

  beforeEach(() => {
    service = new LocalStorageService()
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Bookmark Operations', () => {
    it('should create a new bookmark', async () => {
      localStorageMock.getItem.mockReturnValue('[]')
      localStorageMock.setItem.mockReturnValue(undefined)

      const result = await service.createBookmark(sampleBookmark)

      expect(result).toMatchObject({
        ...sampleBookmark,
        id: 1
      })
      expect(result.created_at).toBeDefined()
      expect(result.updated_at).toBeDefined()
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'x-bookmark-manager-bookmarks',
        expect.any(String)
      )
    })

    it('should load bookmarks from localStorage', async () => {
      const existingBookmarks = [
        {
          id: 1,
          ...sampleBookmark,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingBookmarks))

      const result = await service.getBookmarks()

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject(sampleBookmark)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('x-bookmark-manager-bookmarks')
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

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingBookmarks))
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

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingBookmarks))
      localStorageMock.setItem.mockReturnValue(undefined)

      await service.deleteBookmark(1)

      // Verify setItem was called with the filtered bookmarks
      const setItemCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'x-bookmark-manager-bookmarks'
      )
      expect(setItemCall).toBeDefined()

      const savedBookmarks = JSON.parse(setItemCall![1])
      expect(savedBookmarks).toHaveLength(1)
      expect(savedBookmarks[0].id).toBe(2)
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

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingBookmarks))
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

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingBookmarks))

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

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingBookmarks))

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
          'x-bookmark-manager-collections',
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

        localStorageMock.getItem.mockReturnValue(JSON.stringify(existingCollections))

        const result = await service.getCollections()

        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject(existingCollections[0])
        expect(localStorageMock.getItem).toHaveBeenCalledWith('x-bookmark-manager-collections')
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

        localStorageMock.getItem.mockReturnValue(JSON.stringify(existingCollections))
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

        localStorageMock.getItem.mockReturnValue(JSON.stringify(existingCollections))
        localStorageMock.setItem.mockReturnValue(undefined)

        await service.deleteCollection('test-collection')

        // Verify setItem was called with the filtered collections
        const setItemCall = localStorageMock.setItem.mock.calls.find(
          call => call[0] === 'x-bookmark-manager-collections'
        )
        expect(setItemCall).toBeDefined()

        const savedCollections = JSON.parse(setItemCall![1])
        expect(savedCollections).toHaveLength(1)
        expect(savedCollections[0].id).toBe('another-collection')
      })
    })
  })

  describe('Settings Operations', () => {
    it('should return default settings when none exist', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = await service.getSettings()

      expect(result).toMatchObject({
        theme: 'dark',
        viewMode: 'grid',
        defaultSort: 'newest',
        showMetrics: true,
        compactMode: false,
        autoBackup: true,
        exportFormat: 'json'
      })
    })

    it('should update settings', async () => {
      const existingSettings = {
        theme: 'dark',
        viewMode: 'grid',
        defaultSort: 'newest',
        showMetrics: true,
        compactMode: false,
        autoBackup: true,
        exportFormat: 'json'
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingSettings))
      localStorageMock.setItem.mockReturnValue(undefined)

      const updates = { theme: 'light' as const, viewMode: 'list' as const }
      const result = await service.updateSettings(updates)

      expect(result.theme).toBe('light')
      expect(result.viewMode).toBe('list')
      expect(result.showMetrics).toBe(true) // Should preserve existing values
    })
  })

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
      const settings = { theme: 'dark', viewMode: 'grid', defaultSort: 'newest', showMetrics: true, compactMode: false, autoBackup: true, exportFormat: 'json' }
      const metadata = { version: '1.0.0', totalBookmarks: 1, createdAt: '2024-01-01T00:00:00Z', lastUpdate: '2024-01-01T00:00:00Z' }

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(bookmarks)) // bookmarks
        .mockReturnValueOnce(JSON.stringify(collections)) // collections
        .mockReturnValueOnce(JSON.stringify(bookmarkCollections)) // bookmarkCollections
        .mockReturnValueOnce(JSON.stringify(settings)) // settings
        .mockReturnValueOnce(JSON.stringify(metadata)) // metadata

      const result = await service.exportData()

      expect(result.bookmarks).toHaveLength(1)
      expect(result.collections).toHaveLength(1)
      expect(result.bookmarkCollections).toEqual([])
      expect(result.settings).toMatchObject(settings)
      expect(result.metadata).toMatchObject(metadata)
      expect(result.exportedAt).toBeDefined()
    })

    it('should import data', async () => {
      localStorageMock.setItem.mockReturnValue(undefined)
      localStorageMock.getItem.mockReturnValue(null) // No existing metadata

      const importData = {
        bookmarks: [{ id: 1, ...sampleBookmark, is_deleted: false, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }],
        settings: { theme: 'light' as const, viewMode: 'list' as const, defaultSort: 'title' as const, showMetrics: false, compactMode: true, autoBackup: false, exportFormat: 'csv' as const, defaultCollection: null, duplicateHandling: 'skip' as const }
      }

      await service.importData(importData)

      // Verify bookmarks are saved (with primaryCollection added during import)
      const expectedBookmarks = importData.bookmarks.map(b => ({
        ...b,
        primaryCollection: b.primaryCollection || 'uncategorized'
      }))
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'x-bookmark-manager-bookmarks',
        JSON.stringify(expectedBookmarks)
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'x-bookmark-manager-settings',
        JSON.stringify(importData.settings)
      )

      // Verify default collections are initialized (since no collections in import data)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'x-bookmark-manager-collections',
        expect.any(String)
      )

      // Verify metadata is updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'x-bookmark-manager-metadata',
        expect.any(String)
      )
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