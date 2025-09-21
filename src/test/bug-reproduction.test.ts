import { describe, it, expect } from 'vitest'

/**
 * This test demonstrates how the localStorage configuration bug could have been caught.
 * The original bug was: archived collection had smartCriteria: { type: 'recent' }
 * instead of smartCriteria: { type: 'archived' }
 *
 * This would have caused the archived collection to show recent bookmarks (6)
 * instead of just archived bookmarks (1).
 */

describe('Bug Reproduction: Misconfigured smartCriteria', () => {
  it('demonstrates the original bug - archived with wrong smartCriteria', () => {
    // This is what the buggy configuration looked like:
    const buggyArchivedCollection = {
      id: 'archived',
      name: 'Archived',
      smartCriteria: { type: 'recent' } // BUG: should be 'archived'
    }

    // Mock bookmarks: 6 total, 1 archived, 6 recent (all created today)
    const mockBookmarks = [
      { is_archived: false, created_at: '2025-09-21T02:22:53.277Z' },
      { is_archived: false, created_at: '2025-09-21T02:22:53.277Z' },
      { is_archived: false, created_at: '2025-09-21T02:22:53.277Z' },
      { is_archived: true,  created_at: '2025-09-21T02:22:53.277Z' }, // Only 1 archived
      { is_archived: false, created_at: '2025-09-21T02:22:53.277Z' },
      { is_archived: false, created_at: '2025-09-21T02:22:53.277Z' }
    ]

    // Simulate the buggy filtering logic
    function getBuggyArchivedCount(bookmarks: any[], collection: any) {
      if (collection.smartCriteria.type === 'recent') {
        // Bug: archived collection using recent logic
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return bookmarks.filter(b => new Date(b.created_at) > sevenDaysAgo).length
      }
      if (collection.smartCriteria.type === 'archived') {
        // Correct: archived collection using archived logic
        return bookmarks.filter(b => b.is_archived).length
      }
      return 0
    }

    // With buggy config, archived collection would show 6 (recent count)
    const buggyCount = getBuggyArchivedCount(mockBookmarks, buggyArchivedCollection)
    expect(buggyCount).toBe(6) // This is the bug - showing all recent instead of just archived

    // With correct config, archived collection should show 1
    const correctArchivedCollection = {
      ...buggyArchivedCollection,
      smartCriteria: { type: 'archived' } // Fixed
    }
    const correctCount = getBuggyArchivedCount(mockBookmarks, correctArchivedCollection)
    expect(correctCount).toBe(1) // This is correct - only archived bookmarks

    // The test that would have caught the bug:
    expect(buggyArchivedCollection.smartCriteria.type).not.toBe('recent')
    expect(buggyArchivedCollection.smartCriteria.type).toBe('archived') // This would have failed
  })

  it('validates that collection id should match smartCriteria type for smart collections', () => {
    const collections = [
      { id: 'starred', smartCriteria: { type: 'starred' } },
      { id: 'recent', smartCriteria: { type: 'recent' } },
      { id: 'archived', smartCriteria: { type: 'archived' } }
    ]

    collections.forEach(collection => {
      // This rule would have caught the bug
      expect(collection.smartCriteria.type).toBe(collection.id)
    })
  })
})