import { type Bookmark } from '../types/bookmark'
import type { FilterParams } from './bookmarkFiltering'

/**
 * Helper to get the effective date for a bookmark (prefers tweet_date if available)
 */
const getBookmarkDate = (bookmark: Bookmark): Date => {
  if (bookmark.metadata && bookmark.metadata.platform === 'x.com' && bookmark.metadata.tweet_date) {
    return new Date(bookmark.metadata.tweet_date)
  }
  return new Date(bookmark.created_at)
}

/**
 * Optimized single-pass bookmark filtering
 * Instead of creating 9 intermediate arrays, we filter everything in one pass
 */
export const filterBookmarksOptimized = ({
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
  collectionBookmarks,
}: FilterParams): Bookmark[] => {
  // Pre-compute values outside the filter loop
  const hasTagFilter = selectedTags.length > 0
  const hasSearchQuery = searchQuery.trim().length > 0
  const lowerQuery = hasSearchQuery ? searchQuery.toLowerCase() : ''
  const hasAuthorFilter = authorFilter.trim().length > 0
  const lowerAuthor = hasAuthorFilter ? authorFilter.toLowerCase() : ''
  const hasDomainFilter = domainFilter.trim().length > 0
  const lowerDomain = hasDomainFilter ? domainFilter.toLowerCase() : ''
  const hasContentTypeFilter = !!contentTypeFilter
  const hasDateRangeFilter = dateRangeFilter.type !== 'all'
  const hasQuickFilters = quickFilters.length > 0

  // Collection filter
  const hasCollectionFilter = activeSidebarItem === 'Collections' && activeCollectionId
  const bookmarkIdsInCollection = hasCollectionFilter
    ? new Set(collectionBookmarks[activeCollectionId!] || [])
    : null

  // Pre-compute date thresholds for activeTab
  let tabDateThreshold: Date | null = null
  if (activeTab === 1) {
    tabDateThreshold = new Date()
    tabDateThreshold.setHours(0, 0, 0, 0)
  } else if (activeTab === 2) {
    tabDateThreshold = new Date()
    tabDateThreshold.setDate(tabDateThreshold.getDate() - 7)
  }

  // Pre-compute date range thresholds
  let rangeStartDate: Date | null = null
  let rangeEndDate: Date | null = null
  if (hasDateRangeFilter) {
    switch (dateRangeFilter.type) {
      case 'today':
        rangeStartDate = new Date()
        rangeStartDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        rangeStartDate = new Date()
        rangeStartDate.setDate(rangeStartDate.getDate() - 7)
        break
      case 'month':
        rangeStartDate = new Date()
        rangeStartDate.setMonth(rangeStartDate.getMonth() - 1)
        break
      case 'custom':
        if (dateRangeFilter.customStart) {
          rangeStartDate = new Date(dateRangeFilter.customStart)
          rangeStartDate.setHours(0, 0, 0, 0)
          rangeEndDate = dateRangeFilter.customEnd
            ? new Date(dateRangeFilter.customEnd)
            : new Date()
          rangeEndDate.setHours(23, 59, 59, 999)
        }
        break
    }
  }

  // Pre-compute quick filter thresholds
  let recentThreshold: Date | null = null
  const hasRecentFilter = hasQuickFilters && quickFilters.includes('recent')
  if (hasRecentFilter) {
    recentThreshold = new Date()
    recentThreshold.setDate(recentThreshold.getDate() - 1)
  }

  // SINGLE-PASS FILTER: Check all conditions in one iteration
  const filtered = bookmarks.filter((bookmark) => {
    // 1. Skip deleted bookmarks (unless in trash view)
    if (bookmark.is_deleted) return false

    // 2. Collection filter
    if (hasCollectionFilter && !bookmarkIdsInCollection!.has(bookmark.id)) {
      return false
    }

    // 3. Tag filter
    if (hasTagFilter && !selectedTags.some(tag => bookmark.tags.includes(tag))) {
      return false
    }

    // 4. Active tab filter
    if (activeTab >= 1) {
      const bookmarkDate = getBookmarkDate(bookmark)

      if (activeTab === 1 || activeTab === 2) {
        // Today or This Week
        if (bookmarkDate < tabDateThreshold!) return false
      } else if (activeTab === 3) {
        // Threads
        const isThread = (bookmark.content && bookmark.content.length > 200) ||
          bookmark.domain === 'x.com' ||
          bookmark.domain === 'twitter.com'
        if (!isThread) return false
      } else if (activeTab === 4) {
        // Media
        const hasMedia = bookmark.thumbnail_url ||
          bookmark.url.includes('youtube.com') ||
          bookmark.url.includes('vimeo.com') ||
          /\.(jpg|jpeg|png|gif|webp|mp4|mp3)$/i.test(bookmark.url)
        if (!hasMedia) return false
      }
    }

    // 5. Search query filter
    if (hasSearchQuery) {
      const matchesSearch =
        bookmark.title.toLowerCase().includes(lowerQuery) ||
        bookmark.content.toLowerCase().includes(lowerQuery) ||
        bookmark.author.toLowerCase().includes(lowerQuery) ||
        bookmark.domain.toLowerCase().includes(lowerQuery) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(lowerQuery))

      if (!matchesSearch) return false
    }

    // 6. Author filter
    if (hasAuthorFilter && !bookmark.author.toLowerCase().includes(lowerAuthor)) {
      return false
    }

    // 7. Domain filter
    if (hasDomainFilter && !bookmark.domain.toLowerCase().includes(lowerDomain)) {
      return false
    }

    // 8. Content type filter
    if (hasContentTypeFilter) {
      let matchesContentType = true
      switch (contentTypeFilter) {
        case 'article':
          matchesContentType = bookmark.content.length > 500
          break
        case 'tweet':
          matchesContentType = bookmark.domain === 'x.com' || bookmark.domain === 'twitter.com'
          break
        case 'video':
          matchesContentType = bookmark.url.includes('youtube.com') || bookmark.url.includes('vimeo.com')
          break
      }
      if (!matchesContentType) return false
    }

    // 9. Date range filter
    if (hasDateRangeFilter && rangeStartDate) {
      const bookmarkDate = getBookmarkDate(bookmark)
      if (rangeEndDate) {
        if (bookmarkDate < rangeStartDate || bookmarkDate > rangeEndDate) return false
      } else {
        if (bookmarkDate < rangeStartDate) return false
      }
    }

    // 10. Quick filters (all must match)
    if (hasQuickFilters) {
      for (const filter of quickFilters) {
        let matches = true
        switch (filter) {
          case 'starred':
            matches = bookmark.is_starred === true
            break
          case 'unread':
            matches = bookmark.is_read === false
            break
          case 'comments':
            matches = bookmark.content?.includes('comment') || bookmark.content?.includes('reply') || false
            break
          case 'engagement':
            matches = bookmark.engagement_score > 100
            break
          case 'recent':
            matches = getBookmarkDate(bookmark) >= recentThreshold!
            break
          case 'archived':
            matches = bookmark.is_archived === true
            break
        }
        if (!matches) return false
      }
    }

    // All filters passed
    return true
  })

  // Sort by date descending (newest first)
  return filtered.sort((a, b) => {
    const dateA = getBookmarkDate(a)
    const dateB = getBookmarkDate(b)
    return dateB.getTime() - dateA.getTime()
  })
}
