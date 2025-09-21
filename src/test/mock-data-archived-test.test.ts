import { describe, it, expect } from 'vitest'
import { mockBookmarks } from '../data/mockBookmarks'

describe('Mock Data Archived Count Test', () => {
  it('should show correct archived count from mock bookmarks', () => {
    console.log('📚 Total mock bookmarks:', mockBookmarks.length)

    // Test different filtering approaches
    console.log('\n🔍 Testing different filter approaches:')

    // Direct boolean check
    const archivedStrict = mockBookmarks.filter(bookmark => bookmark.is_archived === true)
    console.log('1. Strict boolean (=== true):', archivedStrict.length)

    // Truthy check
    const archivedTruthy = mockBookmarks.filter(bookmark => !!bookmark.is_archived)
    console.log('2. Truthy check (!!value):', archivedTruthy.length)

    // Simple boolean check
    const archivedSimple = mockBookmarks.filter(bookmark => bookmark.is_archived)
    console.log('3. Simple boolean check:', archivedSimple.length)

    // Check each bookmark individually
    console.log('\n📋 Individual bookmark analysis:')
    mockBookmarks.forEach((bookmark, index) => {
      console.log(`${index + 1}. "${bookmark.title}"`)
      console.log(`   is_archived: ${bookmark.is_archived} (type: ${typeof bookmark.is_archived})`)
      console.log(`   bookmark.is_archived === true: ${bookmark.is_archived === true}`)
      console.log(`   !!bookmark.is_archived: ${!!bookmark.is_archived}`)
      console.log(`   Boolean(bookmark.is_archived): ${Boolean(bookmark.is_archived)}`)
    })

    // Test what's being returned by the filter
    const filteredBookmarks = mockBookmarks.filter(bookmark => {
      const result = bookmark.is_archived
      console.log(`Filter result for "${bookmark.title}": ${result}`)
      return result
    })

    console.log('\n📊 Filter results:')
    console.log('Filtered bookmarks length:', filteredBookmarks.length)
    console.log('Expected archived count: 0 (all mock bookmarks have is_archived: false)')

    // All mock bookmarks should have is_archived: false
    expect(archivedStrict.length).toBe(0)
    expect(archivedTruthy.length).toBe(0)
    expect(archivedSimple.length).toBe(0)
  })

  it('should test the exact filter logic from CollectionsSidebar', () => {
    // This is the exact logic from CollectionsSidebar
    const getBookmarkCount = (collectionId: string) => {
      if (collectionId === 'archived') {
        return mockBookmarks.filter(bookmark => bookmark.is_archived).length
      }
      return 0
    }

    const archivedCount = getBookmarkCount('archived')
    console.log('🗄️ Archived count using CollectionsSidebar logic:', archivedCount)

    // Should be 0 since all mock bookmarks have is_archived: false
    expect(archivedCount).toBe(0)
  })

  it('should check if there is any data type issue', () => {
    // Check if any bookmark has a non-boolean is_archived value
    const nonBooleanArchived = mockBookmarks.filter(bookmark =>
      typeof bookmark.is_archived !== 'boolean'
    )

    console.log('🔍 Bookmarks with non-boolean is_archived:', nonBooleanArchived.length)

    if (nonBooleanArchived.length > 0) {
      console.log('❌ Found non-boolean is_archived values:')
      nonBooleanArchived.forEach(bookmark => {
        console.log(`   "${bookmark.title}": ${bookmark.is_archived} (${typeof bookmark.is_archived})`)
      })
    }

    // All should be boolean
    expect(nonBooleanArchived.length).toBe(0)
  })
})