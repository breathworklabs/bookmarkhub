import { describe, it, expect, beforeEach, vi } from 'vitest'
import { localStorageService } from '../lib/localStorage'
// import type { StoredCollection } from '../lib/localStorage'

describe('localStorage Default Collections Configuration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should have correct smartCriteria configuration for default collections', async () => {
    // This will trigger creation of default collections
    const defaultCollections = await localStorageService.getCollections()

    // Find each default collection
    const starredCollection = defaultCollections.find(c => c.id === 'starred')
    const recentCollection = defaultCollections.find(c => c.id === 'recent')
    const archivedCollection = defaultCollections.find(c => c.id === 'archived')

    // Verify starred collection
    expect(starredCollection).toBeDefined()
    expect(starredCollection?.smartCriteria?.type).toBe('starred')

    // Verify recent collection
    expect(recentCollection).toBeDefined()
    expect(recentCollection?.smartCriteria?.type).toBe('recent')

    // Verify archived collection - THIS WOULD HAVE CAUGHT THE BUG
    expect(archivedCollection).toBeDefined()
    expect(archivedCollection?.smartCriteria?.type).toBe('archived')
    expect(archivedCollection?.smartCriteria?.type).not.toBe('recent') // Explicit check for the bug
  })

  it('should create collections with proper isSmartCollection flags', async () => {
    const defaultCollections = await localStorageService.getCollections()

    const smartCollections = defaultCollections.filter(c => c.isSmartCollection)

    // Should have exactly 3 smart collections: starred, recent, archived
    expect(smartCollections).toHaveLength(3)

    const smartCollectionIds = smartCollections.map(c => c.id).sort()
    expect(smartCollectionIds).toEqual(['archived', 'recent', 'starred'])
  })

  it('should have consistent naming between collection id and smartCriteria type', async () => {
    const defaultCollections = await localStorageService.getCollections()

    const smartCollections = defaultCollections.filter(c => c.isSmartCollection)

    smartCollections.forEach(collection => {
      // The collection ID should match the smartCriteria type
      // This rule would have caught the bug where archived had type: 'recent'
      expect(collection.smartCriteria?.type).toBe(collection.id)
    })
  })

  it('should create archived collection with correct properties', async () => {
    const defaultCollections = await localStorageService.getCollections()

    const archivedCollection = defaultCollections.find(c => c.id === 'archived')

    expect(archivedCollection).toEqual(expect.objectContaining({
      id: 'archived',
      name: 'Archived',
      description: 'Archived bookmarks',
      isPrivate: false,
      isDefault: true,
      isSmartCollection: true,
      smartCriteria: { type: 'archived' }, // This is the critical check
      bookmarkCount: 0,
      userId: 'local-user'
    }))
  })
})