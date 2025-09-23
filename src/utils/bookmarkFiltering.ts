import { type Bookmark } from '../types/bookmark'
import { type DateRangeFilter } from '../store/bookmarkStore'

export interface FilterParams {
  bookmarks: Bookmark[]
  selectedTags: string[]
  searchQuery: string
  activeTab: number
  activeSidebarItem: string
  authorFilter: string
  domainFilter: string
  contentTypeFilter: string
  dateRangeFilter: DateRangeFilter
  quickFilters: string[]
  activeCollectionId: string | null
  collectionBookmarks: Record<string, number[]>
}

/**
 * Centralized bookmark filtering logic to eliminate duplication
 * between useFilteredBookmarks and usePaginatedBookmarks
 */
export const filterBookmarks = ({
  bookmarks,
  selectedTags,
  searchQuery,
  activeTab,
  activeSidebarItem,
  authorFilter,
  domainFilter,
  contentTypeFilter,
  dateRangeFilter,
  quickFilters,
  activeCollectionId,
  collectionBookmarks
}: FilterParams): Bookmark[] => {
  let filtered = bookmarks

  // Filter by sidebar selection first
  switch (activeSidebarItem) {
    case 'Collections':
      if (activeCollectionId) {
        const bookmarkIdsInCollection = collectionBookmarks[activeCollectionId] || []
        filtered = filtered.filter(bookmark => bookmarkIdsInCollection.includes(bookmark.id))
      }
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
        filtered = filtered.filter(bookmark => {
          const dateToUse = bookmark.metadata && bookmark.metadata.tweet_date
            ? bookmark.metadata.tweet_date
            : bookmark.created_at
          return new Date(dateToUse) >= today
        })
      }
      break
    case 2: // This Week
      {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        filtered = filtered.filter(bookmark => {
          const dateToUse = bookmark.metadata && bookmark.metadata.tweet_date
            ? bookmark.metadata.tweet_date
            : bookmark.created_at
          return new Date(dateToUse) >= weekAgo
        })
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
  if (dateRangeFilter.type !== 'all') {
    filtered = filtered.filter(bookmark => {
      const dateToUse = bookmark.metadata && bookmark.metadata.tweet_date
        ? bookmark.metadata.tweet_date
        : bookmark.created_at
      const bookmarkDate = new Date(dateToUse)

      switch (dateRangeFilter.type) {
        case 'today': {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return bookmarkDate >= today
        }
        case 'week': {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return bookmarkDate >= weekAgo
        }
        case 'month': {
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return bookmarkDate >= monthAgo
        }
        case 'custom': {
          if (!dateRangeFilter.customStart) return true

          const startDate = new Date(dateRangeFilter.customStart)
          startDate.setHours(0, 0, 0, 0)

          const endDate = dateRangeFilter.customEnd
            ? new Date(dateRangeFilter.customEnd)
            : new Date()
          endDate.setHours(23, 59, 59, 999)

          return bookmarkDate >= startDate && bookmarkDate <= endDate
        }
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
            const dateToUse = bookmark.metadata && bookmark.metadata.tweet_date
              ? bookmark.metadata.tweet_date
              : bookmark.created_at
            return new Date(dateToUse) >= recent
          case 'archived':
            return bookmark.is_archived
          default:
            return true
        }
      })
    })
  }

  // Sort by date descending (newest first) - use tweet_date when available
  const sorted = filtered.sort((a, b) => {
    const dateA = a.metadata && a.metadata.tweet_date
      ? new Date(a.metadata.tweet_date)
      : new Date(a.created_at)
    const dateB = b.metadata && b.metadata.tweet_date
      ? new Date(b.metadata.tweet_date)
      : new Date(b.created_at)

    return dateB.getTime() - dateA.getTime() // Descending order (newest first)
  })

  return sorted
}