import { describe, it, expect, beforeEach, vi } from 'vitest'
import { localStorageService } from '../lib/localStorage'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

vi.stubGlobal('localStorage', localStorageMock)

describe('Archived Count Debug Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should correctly count archived bookmarks from import data format', async () => {
    // Simulate data as it would come from the import script
    const importedBookmarks = [
      {
        id: 7,
        user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
        title: 'React 19 Beta Features',
        url: 'https://react.dev/blog/2024/04/25/react-19',
        description: 'React 19 features',
        content: 'React 19 content...',
        author: 'React Team',
        domain: 'react.dev',
        source_platform: 'manual',
        engagement_score: 0,
        is_starred: true,
        is_read: false,
        is_archived: false, // NOT archived
        tags: ['react', 'javascript'],
        created_at: '2025-09-21T02:22:53.277Z',
        updated_at: '2025-09-21T02:22:53.277Z'
      },
      {
        id: 8,
        user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
        title: 'TypeScript 5.5 Released',
        url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/',
        description: 'TypeScript 5.5 features',
        content: 'TypeScript 5.5 content...',
        author: 'TypeScript Team',
        domain: 'devblogs.microsoft.com',
        source_platform: 'manual',
        engagement_score: 0,
        is_starred: false,
        is_read: false,
        is_archived: false, // NOT archived
        tags: ['typescript', 'javascript'],
        created_at: '2025-09-21T02:22:53.277Z',
        updated_at: '2025-09-21T02:22:53.277Z'
      },
      {
        id: 9,
        user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
        title: 'Old Article to Archive',
        url: 'https://example.com/old-article',
        description: 'This should be archived',
        content: 'Old content...',
        author: 'Test Author',
        domain: 'example.com',
        source_platform: 'manual',
        engagement_score: 0,
        is_starred: false,
        is_read: true,
        is_archived: true, // THIS ONE IS archived
        tags: ['archived', 'old'],
        created_at: '2025-09-21T02:22:53.277Z',
        updated_at: '2025-09-21T02:22:53.277Z'
      }
    ]

    // Mock localStorage to return our test data
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'x-bookmark-manager-bookmarks') {
        return JSON.stringify(importedBookmarks)
      }
      return null
    })

    // Test the localStorage service
    const bookmarks = await localStorageService.getBookmarks()

    console.log('📚 All bookmarks:', bookmarks.length)
    console.log('🔍 Bookmark archived states:')
    bookmarks.forEach((bookmark, index) => {
      console.log(`  ${index + 1}. "${bookmark.title}" - is_archived: ${bookmark.is_archived} (type: ${typeof bookmark.is_archived})`)
    })

    // Count archived bookmarks manually
    const archivedCount = bookmarks.filter(bookmark => {
      console.log(`Checking bookmark "${bookmark.title}": is_archived = ${bookmark.is_archived}`)
      return bookmark.is_archived === true
    }).length

    console.log('🗄️ Manual archived count:', archivedCount)

    // Test with different boolean checks
    const archivedCountStrict = bookmarks.filter(bookmark => bookmark.is_archived === true).length
    const archivedCountTruthy = bookmarks.filter(bookmark => !!bookmark.is_archived).length
    const archivedCountString = bookmarks.filter(bookmark => bookmark.is_archived === 'true').length

    console.log('📊 Count results:')
    console.log('  - Strict boolean check (=== true):', archivedCountStrict)
    console.log('  - Truthy check (!!value):', archivedCountTruthy)
    console.log('  - String check (=== "true"):', archivedCountString)

    // Should have exactly 1 archived bookmark
    expect(archivedCount).toBe(1)
    expect(archivedCountStrict).toBe(1)
  })

  it('should handle string boolean values from CSV import', async () => {
    // Simulate data as it might come from CSV import with string booleans
    const csvImportedBookmarks = [
      {
        id: 1,
        is_starred: 'false',
        is_read: 'false',
        is_archived: 'false',
        title: 'Not Archived Bookmark 1',
        // ... other fields
      },
      {
        id: 2,
        is_starred: 'true',
        is_read: 'false',
        is_archived: 'false',
        title: 'Starred But Not Archived',
        // ... other fields
      },
      {
        id: 3,
        is_starred: 'false',
        is_read: 'true',
        is_archived: 'true', // String 'true' - should be archived
        title: 'Archived Bookmark',
        // ... other fields
      }
    ]

    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'x-bookmark-manager-bookmarks') {
        return JSON.stringify(csvImportedBookmarks)
      }
      return null
    })

    const bookmarks = await localStorageService.getBookmarks()

    console.log('📚 CSV imported bookmarks:')
    bookmarks.forEach((bookmark, index) => {
      console.log(`  ${index + 1}. "${bookmark.title}" - is_archived: ${bookmark.is_archived} (type: ${typeof bookmark.is_archived})`)
    })

    // After normalization, should have proper boolean values
    const archivedCount = bookmarks.filter(bookmark => bookmark.is_archived === true).length
    console.log('🗄️ Archived count after normalization:', archivedCount)

    expect(archivedCount).toBe(1)

    // Verify all values are now proper booleans
    bookmarks.forEach(bookmark => {
      expect(typeof bookmark.is_starred).toBe('boolean')
      expect(typeof bookmark.is_read).toBe('boolean')
      expect(typeof bookmark.is_archived).toBe('boolean')
    })
  })

  it('should match real import data from import-bookmarks.js', async () => {
    // Test with the exact data structure from your import script
    const realImportData = `7,ae879c80-f3fc-4e05-a837-384e4b9bfb28,React 19 Beta Features - What's New,https://react.dev/blog/2024/04/25/react-19,Comprehensive overview of React 19 beta features including Server Components and Actions,React 19 introduces several groundbreaking features that will change how we build React applications...,https://react.dev/images/blog/react-19-beta/react-19-beta-header.png,,React Team,react.dev,manual,,0,true,false,false,"[""react"",""javascript"",""frontend"",""beta""]",,2025-09-21 02:22:53.277114+00,2025-09-21 02:22:53.277114+00
8,ae879c80-f3fc-4e05-a837-384e4b9bfb28,TypeScript 5.5 Released,https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/,New features in TypeScript 5.5 including better performance and new language features,,https://devblogs.microsoft.com/typescript/wp-content/uploads/sites/11/2024/06/5-5-banner.png,,TypeScript Team,devblogs.microsoft.com,manual,,0,false,false,false,"[""typescript"",""javascript"",""programming""]",,2025-09-21 02:22:53.277114+00,2025-09-21 02:22:53.277114+00`

    // Parse the CSV data like the import script does
    function parseCSVLine(line: string) {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      let i = 0

      while (i < line.length) {
        const char = line[i]

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"'
            i += 2
          } else {
            inQuotes = !inQuotes
            i++
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current)
          current = ''
          i++
        } else {
          current += char
          i++
        }
      }
      result.push(current)
      return result
    }

    const lines = realImportData.trim().split('\n')
    const parsedBookmarks = lines.map(line => {
      const fields = parseCSVLine(line)
      return {
        id: parseInt(fields[0]),
        user_id: fields[1],
        title: fields[2],
        url: fields[3],
        description: fields[4],
        content: fields[5],
        thumbnail_url: fields[6] || undefined,
        favicon_url: fields[7] || undefined,
        author: fields[8],
        domain: fields[9],
        source_platform: fields[10],
        source_id: fields[11] || undefined,
        engagement_score: parseInt(fields[12]),
        is_starred: fields[13] === 'true',
        is_read: fields[14] === 'true',
        is_archived: fields[15] === 'true',
        tags: JSON.parse(fields[16]),
        metadata: fields[17] || undefined,
        created_at: fields[18],
        updated_at: fields[19]
      }
    })

    console.log('📊 Parsed real import data:')
    parsedBookmarks.forEach((bookmark, index) => {
      console.log(`  ${index + 1}. "${bookmark.title}" - is_archived: ${bookmark.is_archived} (type: ${typeof bookmark.is_archived})`)
    })

    // Count archived in parsed data
    const archivedInParsed = parsedBookmarks.filter(b => b.is_archived).length
    console.log('🗄️ Archived count in parsed data:', archivedInParsed)

    // Now test through localStorage service
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'x-bookmark-manager-bookmarks') {
        return JSON.stringify(parsedBookmarks)
      }
      return null
    })

    const bookmarks = await localStorageService.getBookmarks()
    const archivedCount = bookmarks.filter(bookmark => bookmark.is_archived === true).length

    console.log('🗄️ Archived count through localStorage service:', archivedCount)

    // Based on the CSV data, both bookmarks have is_archived: false
    expect(archivedInParsed).toBe(0)
    expect(archivedCount).toBe(0)
  })
})