/**
 * Bookmark Repository
 * Handles all bookmark-related database operations
 */

import type { Bookmark, BookmarkInsert } from '@/types/bookmark'

export type StoredBookmark = Bookmark
export type { BookmarkInsert }

/**
 * Search bookmarks by query (title, URL, description)
 */
export const searchBookmarks = (
  bookmarks: StoredBookmark[],
  query: string
): StoredBookmark[] => {
  const lowerQuery = query.toLowerCase()
  return bookmarks.filter(
    (bookmark) =>
      bookmark.title.toLowerCase().includes(lowerQuery) ||
      bookmark.url.toLowerCase().includes(lowerQuery) ||
      (bookmark.description &&
        bookmark.description.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Get bookmarks by tag
 */
export const getBookmarksByTag = (
  bookmarks: StoredBookmark[],
  tag: string
): StoredBookmark[] => {
  return bookmarks.filter(
    (bookmark) => bookmark.tags && bookmark.tags.includes(tag)
  )
}

/**
 * Get starred bookmarks
 */
export const getStarredBookmarks = (
  bookmarks: StoredBookmark[]
): StoredBookmark[] => {
  return bookmarks.filter(
    (b) => (b as any).is_starred || (b as any).isStarred
  )
}

/**
 * Get deleted/trashed bookmarks
 */
export const getDeletedBookmarks = (
  bookmarks: StoredBookmark[]
): StoredBookmark[] => {
  return bookmarks.filter((b) => (b as any).is_deleted)
}

/**
 * Get active (non-deleted) bookmarks
 */
export const getActiveBookmarks = (
  bookmarks: StoredBookmark[]
): StoredBookmark[] => {
  return bookmarks.filter((b) => !(b as any).is_deleted)
}

/**
 * Find bookmark by ID
 */
export const findBookmarkById = (
  bookmarks: StoredBookmark[],
  id: number
): StoredBookmark | undefined => {
  return bookmarks.find((b) => b.id === id)
}

/**
 * Generate next bookmark ID
 */
export const getNextBookmarkId = (bookmarks: StoredBookmark[]): number => {
  if (bookmarks.length === 0) return 1
  return Math.max(...bookmarks.map((b) => b.id)) + 1
}

/**
 * Create a new bookmark with generated ID and timestamps
 */
export const createBookmarkEntity = (
  bookmarks: StoredBookmark[],
  bookmark: BookmarkInsert
): StoredBookmark => {
  const newId = getNextBookmarkId(bookmarks)
  const now = new Date().toISOString()

  return {
    ...bookmark,
    id: newId,
    created_at: now,
    updated_at: now,
  } as StoredBookmark
}

/**
 * Update an existing bookmark
 */
export const updateBookmarkEntity = (
  bookmarks: StoredBookmark[],
  id: number,
  updates: Partial<BookmarkInsert>
): StoredBookmark[] => {
  return bookmarks.map((b) => {
    if (b.id === id) {
      return {
        ...b,
        ...updates,
        updated_at: new Date().toISOString(),
      }
    }
    return b
  })
}

/**
 * Delete bookmark (soft delete)
 */
export const deleteBookmarkEntity = (
  bookmarks: StoredBookmark[],
  id: number
): StoredBookmark[] => {
  return bookmarks.map((b) => {
    if (b.id === id) {
      return {
        ...b,
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as StoredBookmark
    }
    return b
  })
}

/**
 * Permanently delete bookmark
 */
export const permanentlyDeleteBookmarkEntity = (
  bookmarks: StoredBookmark[],
  id: number
): StoredBookmark[] => {
  return bookmarks.filter((b) => b.id !== id)
}

/**
 * Restore bookmark from trash
 */
export const restoreBookmarkEntity = (
  bookmarks: StoredBookmark[],
  id: number
): StoredBookmark[] => {
  return bookmarks.map((b) => {
    if (b.id === id) {
      const restored = { ...b } as any
      delete restored.is_deleted
      delete restored.deleted_at
      restored.updated_at = new Date().toISOString()
      return restored as StoredBookmark
    }
    return b
  })
}

/**
 * Toggle bookmark star status
 */
export const toggleBookmarkStarEntity = (
  bookmarks: StoredBookmark[],
  id: number
): StoredBookmark[] => {
  return bookmarks.map((b) => {
    if (b.id === id) {
      const currentStarred = (b as any).is_starred || (b as any).isStarred
      return {
        ...b,
        is_starred: !currentStarred,
        isStarred: !currentStarred,
        updated_at: new Date().toISOString(),
      } as StoredBookmark
    }
    return b
  })
}

/**
 * Get bookmarks older than specified days in trash
 */
export const getOldTrashedBookmarks = (
  bookmarks: StoredBookmark[],
  daysOld: number
): StoredBookmark[] => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  return bookmarks.filter((b: any) => {
    if (!b.is_deleted || !b.deleted_at) return false
    const deletedDate = new Date(b.deleted_at)
    return deletedDate < cutoffDate
  })
}

/**
 * Remove old trashed bookmarks
 */
export const cleanupOldTrashedBookmarks = (
  bookmarks: StoredBookmark[],
  daysOld: number
): { bookmarks: StoredBookmark[]; deletedCount: number } => {
  const oldBookmarks = getOldTrashedBookmarks(bookmarks, daysOld)
  const oldIds = new Set(oldBookmarks.map((b) => b.id))

  const remainingBookmarks = bookmarks.filter((b) => !oldIds.has(b.id))

  return {
    bookmarks: remainingBookmarks,
    deletedCount: oldBookmarks.length,
  }
}
