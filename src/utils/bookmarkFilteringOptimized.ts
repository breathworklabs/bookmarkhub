import { type Bookmark } from '@/types/bookmark'
import { type DateRangeFilter } from '@/store/bookmarkStore'

/**
 * Filter parameters interface
 */
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
  sortBy?: 'date' | 'title' | 'author' | 'domain'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Helper to get the effective date for a bookmark (prefers tweet_date if available)
 */
const getBookmarkDate = (bookmark: Bookmark): Date => {
  if (
    bookmark.metadata &&
    bookmark.metadata.platform === 'x.com' &&
    bookmark.metadata.tweet_date
  ) {
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
  sortBy = 'date',
  sortOrder = 'desc',
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
  const hasCollectionFilter =
    activeSidebarItem === 'Collections' && activeCollectionId
  const smartCollectionIds = new Set([
    'starred',
    'recent',
    'archived',
    'uncategorized',
  ])
  const isSmartCollection =
    hasCollectionFilter && smartCollectionIds.has(activeCollectionId!)
  const bookmarkIdsInCollection =
    hasCollectionFilter && !isSmartCollection
      ? new Set(collectionBookmarks[activeCollectionId!] || [])
      : null

  // Pre-compute date threshold for 'recent' smart collection
  const recentSmartThreshold = new Date()
  recentSmartThreshold.setDate(recentSmartThreshold.getDate() - 7)

  // Pre-compute date thresholds for activeTab
  // FilterBar tabs: 0=All, 1=Today, 2=This Week, 3=This Month, 4=Threads, 5=Media
  let tabDateThreshold: Date | null = null
  if (activeTab === 1) {
    // Today
    tabDateThreshold = new Date()
    tabDateThreshold.setHours(0, 0, 0, 0)
  } else if (activeTab === 2) {
    // This Week
    tabDateThreshold = new Date()
    tabDateThreshold.setDate(tabDateThreshold.getDate() - 7)
  } else if (activeTab === 3) {
    // This Month
    tabDateThreshold = new Date()
    tabDateThreshold.setMonth(tabDateThreshold.getMonth() - 1)
  }

  // Pre-compute date range thresholds
  let rangeStartDate: Date | null = null
  let rangeEndDate: Date | null = null
  if (hasDateRangeFilter) {
    switch (dateRangeFilter.type) {
      case 'today':
        rangeStartDate = new Date()
        rangeStartDate.setHours(0, 0, 0, 0)
        rangeEndDate = new Date()
        rangeEndDate.setHours(23, 59, 59, 999)
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
    if (hasCollectionFilter) {
      if (isSmartCollection) {
        switch (activeCollectionId) {
          case 'starred':
            if (!bookmark.is_starred) return false
            break
          case 'recent':
            if (getBookmarkDate(bookmark) < recentSmartThreshold) return false
            break
          case 'archived':
            if (!bookmark.is_archived) return false
            break
          case 'uncategorized':
            if (
              bookmark.collections &&
              bookmark.collections.length > 0 &&
              !(
                bookmark.collections.length === 1 &&
                bookmark.collections[0] === 'uncategorized'
              )
            ) {
              return false
            }
            break
        }
      } else if (!bookmarkIdsInCollection!.has(bookmark.id)) {
        return false
      }
    }

    // 3. Tag filter
    if (
      hasTagFilter &&
      !selectedTags.some((tag) => bookmark.tags.includes(tag))
    ) {
      return false
    }

    // 4. Active tab filter
    // FilterBar tabs: 0=All, 1=Today, 2=This Week, 3=This Month, 4=Threads, 5=Media
    if (activeTab >= 1) {
      const bookmarkDate = getBookmarkDate(bookmark)

      if (activeTab === 1 || activeTab === 2 || activeTab === 3) {
        // Today, This Week, or This Month
        if (bookmarkDate < tabDateThreshold!) return false
      } else if (activeTab === 4) {
        // Threads
        const isThread =
          (bookmark.content && bookmark.content.length > 200) ||
          bookmark.domain === 'x.com' ||
          bookmark.domain === 'twitter.com'
        if (!isThread) return false
      } else if (activeTab === 5) {
        // Media
        const hasMedia =
          bookmark.thumbnail_url ||
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
        bookmark.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))

      if (!matchesSearch) return false
    }

    // 6. Author filter
    if (
      hasAuthorFilter &&
      !bookmark.author.toLowerCase().includes(lowerAuthor)
    ) {
      return false
    }

    // 7. Domain filter
    if (
      hasDomainFilter &&
      !bookmark.domain.toLowerCase().includes(lowerDomain)
    ) {
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
          matchesContentType =
            bookmark.domain === 'x.com' || bookmark.domain === 'twitter.com'
          break
        case 'video':
          matchesContentType =
            bookmark.url.includes('youtube.com') ||
            bookmark.url.includes('vimeo.com')
          break
      }
      if (!matchesContentType) return false
    }

    // 9. Date range filter
    if (hasDateRangeFilter && rangeStartDate) {
      const bookmarkDate = getBookmarkDate(bookmark)
      if (rangeEndDate) {
        if (bookmarkDate < rangeStartDate || bookmarkDate > rangeEndDate)
          return false
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
            matches =
              bookmark.content?.includes('comment') ||
              bookmark.content?.includes('reply') ||
              false
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

  // Apply sorting based on sortBy and sortOrder
  return filtered.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'date': {
        const dateA = getBookmarkDate(a)
        const dateB = getBookmarkDate(b)
        comparison = dateB.getTime() - dateA.getTime() // Default descending (newest first)
        break
      }
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'author':
        comparison = a.author.localeCompare(b.author)
        break
      case 'domain':
        comparison = a.domain.localeCompare(b.domain)
        break
      default:
        // Fallback to date
        const dateA = getBookmarkDate(a)
        const dateB = getBookmarkDate(b)
        comparison = dateB.getTime() - dateA.getTime()
    }

    // Apply sort order (reverse if ascending)
    return sortOrder === 'asc' ? -comparison : comparison
  })
}
