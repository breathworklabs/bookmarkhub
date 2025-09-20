import { useMemo } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { type Bookmark } from '../data/mockBookmarks'

export const useFilteredBookmarks = (): Bookmark[] => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const selectedTags = useBookmarkStore((state) => state.selectedTags)
  const searchQuery = useBookmarkStore((state) => state.searchQuery)
  const activeTab = useBookmarkStore((state) => state.activeTab)

  return useMemo(() => {
    let filtered = bookmarks

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(bookmark =>
        bookmark.content.toLowerCase().includes(query) ||
        bookmark.author.name.toLowerCase().includes(query) ||
        bookmark.author.username.toLowerCase().includes(query) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(bookmark =>
        selectedTags.some(tag => bookmark.tags.includes(tag))
      )
    }

    // Filter by active tab
    switch (activeTab) {
      case 1: // Today
        // For demo purposes, show recent bookmarks
        break
      case 2: // This Week
        // For demo purposes, show recent bookmarks
        break
      case 3: // Threads
        // Filter bookmarks that might be threads (longer content)
        filtered = filtered.filter(bookmark => bookmark.content.length > 100)
        break
      case 4: // Media
        filtered = filtered.filter(bookmark => bookmark.hasMedia)
        break
      default: // All
        break
    }

    return filtered
  }, [bookmarks, selectedTags, searchQuery, activeTab])
}