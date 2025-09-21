import { useMemo, useEffect } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { type Bookmark } from '../lib/database'

export const useFilteredBookmarks = (): Bookmark[] => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const selectedTags = useBookmarkStore((state) => state.selectedTags)
  const searchQuery = useBookmarkStore((state) => state.searchQuery)
  const activeTab = useBookmarkStore((state) => state.activeTab)
  const searchBookmarks = useBookmarkStore((state) => state.searchBookmarks)
  const loadBookmarks = useBookmarkStore((state) => state.loadBookmarks)

  // Handle search when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchBookmarks(searchQuery)
    } else {
      loadBookmarks()
    }
  }, [searchQuery, searchBookmarks, loadBookmarks])

  return useMemo(() => {
    let filtered = bookmarks

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(bookmark =>
        selectedTags.some(tag => bookmark.tags.includes(tag))
      )
    }

    // Filter by active tab
    switch (activeTab) {
      case 1: // Today
        {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          filtered = filtered.filter(bookmark =>
            new Date(bookmark.created_at) >= today
          )
        }
        break
      case 2: // This Week
        {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          filtered = filtered.filter(bookmark =>
            new Date(bookmark.created_at) >= weekAgo
          )
        }
        break
      case 3: // Threads
        // Filter bookmarks that might be threads (longer content or from twitter)
        filtered = filtered.filter(bookmark =>
          (bookmark.content && bookmark.content.length > 200) ||
          bookmark.source_platform === 'twitter'
        )
        break
      case 4: // Media
        // Filter bookmarks that have media
        filtered = filtered.filter(bookmark =>
          bookmark.thumbnail_url ||
          bookmark.source_platform === 'youtube' ||
          bookmark.url.includes('youtube.com') ||
          bookmark.url.includes('vimeo.com') ||
          bookmark.url.match(/\.(jpg|jpeg|png|gif|webp|mp4|mp3)$/i)
        )
        break
      default: // All
        break
    }

    return filtered
  }, [bookmarks, selectedTags, activeTab])
}