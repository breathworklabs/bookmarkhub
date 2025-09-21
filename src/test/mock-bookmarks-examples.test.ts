// Example usage of mock bookmark factory functions
// This file demonstrates how to use the shared mock data utilities

import { describe, it, expect } from 'vitest'
import {
  createMockBookmark,
  createMockBookmarks,
  createStarredBookmarks,
  createArchivedBookmarks,
  createTaggedBookmarks,
  createMixedBookmarks
} from './test-utils'

describe('Mock Bookmark Factory Examples', () => {
  it('should create a single bookmark with custom options', () => {
    const bookmark = createMockBookmark({
      title: 'Custom Title',
      is_starred: true,
      tags: ['custom', 'tag']
    })

    expect(bookmark.title).toBe('Custom Title')
    expect(bookmark.is_starred).toBe(true)
    expect(bookmark.tags).toEqual(['custom', 'tag'])
    expect(bookmark.id).toBeDefined()
    expect(bookmark.url).toMatch(/^https:\/\/example\d+\.com$/)
  })

  it('should create multiple bookmarks with default settings', () => {
    const bookmarks = createMockBookmarks(3)

    expect(bookmarks).toHaveLength(3)
    expect(bookmarks[0].id).toBe(1)
    expect(bookmarks[1].id).toBe(2)
    expect(bookmarks[2].id).toBe(3)
    bookmarks.forEach(bookmark => {
      expect(bookmark.is_starred).toBe(false)
      expect(bookmark.is_archived).toBe(false)
    })
  })

  it('should create only starred bookmarks', () => {
    const bookmarks = createStarredBookmarks(2)

    expect(bookmarks).toHaveLength(2)
    bookmarks.forEach(bookmark => {
      expect(bookmark.is_starred).toBe(true)
      expect(bookmark.is_archived).toBe(false)
      expect(bookmark.title).toMatch(/^Starred Bookmark \d+$/)
    })
  })

  it('should create only archived bookmarks', () => {
    const bookmarks = createArchivedBookmarks(2)

    expect(bookmarks).toHaveLength(2)
    bookmarks.forEach(bookmark => {
      expect(bookmark.is_archived).toBe(true)
      expect(bookmark.is_starred).toBe(false)
      expect(bookmark.title).toMatch(/^Archived Bookmark \d+$/)
    })
  })

  it('should create bookmarks with specific tags', () => {
    const bookmarks = createTaggedBookmarks('javascript', 3)

    expect(bookmarks).toHaveLength(3)
    bookmarks.forEach((bookmark, index) => {
      expect(bookmark.tags).toContain('javascript')
      expect(bookmark.title).toMatch(/^javascript Bookmark \d+$/)
    })
  })

  it('should create mixed bookmarks with different states', () => {
    const bookmarks = createMixedBookmarks(10)

    const starredCount = bookmarks.filter(b => b.is_starred).length
    const archivedCount = bookmarks.filter(b => b.is_archived).length
    const regularCount = bookmarks.filter(b => !b.is_starred && !b.is_archived).length

    expect(bookmarks).toHaveLength(10)
    expect(starredCount).toBe(3) // ~30% of 10
    expect(archivedCount).toBe(2) // ~20% of 10
    expect(regularCount).toBe(5) // remaining
  })

  it('should create bookmarks with custom configurations', () => {
    const bookmarks = createMockBookmarks(2, [
      { title: 'First Custom', is_starred: true, tags: ['important'] },
      { title: 'Second Custom', is_archived: true, tags: ['old'] }
    ])

    expect(bookmarks).toHaveLength(2)
    expect(bookmarks[0].title).toBe('First Custom')
    expect(bookmarks[0].is_starred).toBe(true)
    expect(bookmarks[0].tags).toEqual(['important'])
    expect(bookmarks[1].title).toBe('Second Custom')
    expect(bookmarks[1].is_archived).toBe(true)
    expect(bookmarks[1].tags).toEqual(['old'])
  })
})