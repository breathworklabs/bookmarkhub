import { useMemo, useEffect, useRef } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { type Bookmark } from '../types/bookmark'

export const useFilteredBookmarks = (): Bookmark[] => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const selectedTags = useBookmarkStore((state) => state.selectedTags)
  const searchQuery = useBookmarkStore((state) => state.searchQuery)
  const activeTab = useBookmarkStore((state) => state.activeTab)
  const activeSidebarItem = useBookmarkStore((state) => state.activeSidebarItem)
  const authorFilter = useBookmarkStore((state) => state.authorFilter)
  const domainFilter = useBookmarkStore((state) => state.domainFilter)
  const contentTypeFilter = useBookmarkStore((state) => state.contentTypeFilter)
  const dateRangeFilter = useBookmarkStore((state) => state.dateRangeFilter)
  const quickFilters = useBookmarkStore((state) => state.quickFilters)

  // No need for searchBookmarks effect, filtering is done in useMemo

  return useMemo(() => {
    let filtered = bookmarks

    // Filter by sidebar selection first
    switch (activeSidebarItem) {
      case 'Archives':
        filtered = filtered.filter(bookmark => bookmark.is_archived)
        break
      case 'All Bookmarks':
      default:
        // Show all bookmarks
        break
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
          bookmark.domain === 'x.com' ||
          bookmark.domain === 'twitter.com'
        )
        break
      case 4: // Media
        // Filter bookmarks that have media
        filtered = filtered.filter(bookmark =>
          bookmark.thumbnail_url ||
          bookmark.url.includes('youtube.com') ||
          bookmark.url.includes('vimeo.com') ||
          bookmark.url.match(/\.(jpg|jpeg|png|gif|webp|mp4|mp3)$/i)
        )
        break
      default: // All
        break
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(lowerQuery) ||
        bookmark.content.toLowerCase().includes(lowerQuery) ||
        bookmark.author.toLowerCase().includes(lowerQuery) ||
        bookmark.domain.toLowerCase().includes(lowerQuery) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    }

    // Filter by author
    if (authorFilter.trim()) {
      const lowerAuthor = authorFilter.toLowerCase()
      filtered = filtered.filter(bookmark =>
        bookmark.author.toLowerCase().includes(lowerAuthor)
      )
    }

    // Filter by domain
    if (domainFilter.trim()) {
      const lowerDomain = domainFilter.toLowerCase()
      filtered = filtered.filter(bookmark =>
        bookmark.domain.toLowerCase().includes(lowerDomain)
      )
    }

    // Filter by content type
    if (contentTypeFilter) {
      // This would need more logic based on what content types are defined
      // For now, just filter based on some heuristics
      filtered = filtered.filter(bookmark => {
        switch (contentTypeFilter) {
          case 'article':
            return bookmark.content.length > 500
          case 'tweet':
            return bookmark.domain === 'x.com' || bookmark.domain === 'twitter.com'
          case 'video':
            return bookmark.url.includes('youtube.com') || bookmark.url.includes('vimeo.com')
          default:
            return true
        }
      })
    }

    // Filter by date range
    if (dateRangeFilter) {
      const now = new Date()
      filtered = filtered.filter(bookmark => {
        const bookmarkDate = new Date(bookmark.created_at)
        switch (dateRangeFilter) {
          case 'today':
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return bookmarkDate >= today
          case 'week':
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return bookmarkDate >= weekAgo
          case 'month':
            const monthAgo = new Date()
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return bookmarkDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Filter by quick filters
    if (quickFilters.length > 0) {
      filtered = filtered.filter(bookmark => {
        return quickFilters.every(filter => {
          switch (filter) {
            case 'starred':
              return bookmark.is_starred
            case 'unread':
              return !bookmark.is_read
            case 'comments':
              return bookmark.content.includes('comment') || bookmark.content.includes('reply')
            case 'engagement':
              return bookmark.engagement_score > 100
            case 'recent':
              const recent = new Date()
              recent.setDate(recent.getDate() - 1)
              return new Date(bookmark.created_at) >= recent
            case 'archived':
              return bookmark.is_archived
            default:
              return true
          }
        })
      })
    }

    return filtered
  }, [bookmarks, selectedTags, searchQuery, activeTab, activeSidebarItem, authorFilter, domainFilter, contentTypeFilter, dateRangeFilter, quickFilters])
}