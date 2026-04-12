import type { Bookmark } from '@/types/bookmark'
import type { View, ViewCriteria } from '@/types/views'

const MS_PER_DAY = 86_400_000

/** Prefer tweet_date for X/Twitter bookmarks, fall back to created_at. */
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

const getDateCutoff = (
  preset: NonNullable<NonNullable<ViewCriteria['dateRange']>['preset']>
): Date => {
  const now = new Date()
  switch (preset) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'week':
      return new Date(now.getTime() - 7 * MS_PER_DAY)
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  }
}

export function matchesCriteria(
  bookmark: Bookmark,
  criteria: ViewCriteria,
  validationInvalidIds?: Set<number>
): boolean {
  if (criteria.isDeleted !== undefined) {
    if (bookmark.is_deleted !== criteria.isDeleted) return false
  } else if (bookmark.is_deleted) {
    return false
  }

  // Archived bookmarks are hidden from all views except Archived and Trash
  if (criteria.isArchived !== undefined) {
    if (bookmark.is_archived !== criteria.isArchived) return false
  } else if (bookmark.is_archived && !bookmark.is_deleted) {
    return false
  }

  if (criteria.starred && !bookmark.is_starred) return false
  if (criteria.unread && bookmark.is_read) return false
  if (criteria.broken) {
    if (!(validationInvalidIds?.has(bookmark.id) ?? false)) return false
  }

  if (criteria.recentDays !== undefined) {
    const age = Date.now() - getBookmarkDate(bookmark).getTime()
    if (age > criteria.recentDays * MS_PER_DAY) return false
  }

  if (criteria.dateRange) {
    const bookmarkDate = getBookmarkDate(bookmark)

    if (criteria.dateRange.preset) {
      if (bookmarkDate < getDateCutoff(criteria.dateRange.preset)) return false
    }

    if (criteria.dateRange.start) {
      const start = new Date(criteria.dateRange.start)
      start.setHours(0, 0, 0, 0)
      if (bookmarkDate < start) return false
    }

    if (criteria.dateRange.end) {
      const end = new Date(criteria.dateRange.end)
      end.setHours(23, 59, 59, 999)
      if (bookmarkDate > end) return false
    }
  }

  if (criteria.tags && criteria.tags.length > 0) {
    const bookmarkTags = new Set(bookmark.tags)
    if (criteria.tagMatch === 'all') {
      if (!criteria.tags.every((t) => bookmarkTags.has(t))) return false
    } else {
      if (!criteria.tags.some((t) => bookmarkTags.has(t))) return false
    }
  }

  if (criteria.excludeTags && criteria.excludeTags.length > 0) {
    const bookmarkTags = new Set(bookmark.tags)
    if (criteria.excludeTags.some((t) => bookmarkTags.has(t))) return false
  }

  if (criteria.query) {
    const lowerQuery = criteria.query.toLowerCase()
    const matchesSearch =
      bookmark.title.toLowerCase().includes(lowerQuery) ||
      bookmark.content.toLowerCase().includes(lowerQuery) ||
      bookmark.author.toLowerCase().includes(lowerQuery) ||
      bookmark.domain.toLowerCase().includes(lowerQuery) ||
      bookmark.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    if (!matchesSearch) return false
  }

  if (criteria.authors && criteria.authors.length > 0) {
    const lowerAuthor = bookmark.author.toLowerCase()
    if (!criteria.authors.some((a) => lowerAuthor.includes(a.toLowerCase())))
      return false
  }

  if (criteria.domains && criteria.domains.length > 0) {
    const lowerDomain = bookmark.domain.toLowerCase()
    if (!criteria.domains.some((d) => lowerDomain.includes(d.toLowerCase())))
      return false
  }

  if (criteria.contentTypes && criteria.contentTypes.length > 0) {
    let matched = false
    for (const ct of criteria.contentTypes) {
      switch (ct) {
        case 'article':
          if (bookmark.content.length > 500) matched = true
          break
        case 'tweet':
          if (bookmark.domain === 'x.com' || bookmark.domain === 'twitter.com')
            matched = true
          break
        case 'video':
          if (
            bookmark.url.includes('youtube.com') ||
            bookmark.url.includes('vimeo.com')
          )
            matched = true
          break
      }
      if (matched) break
    }
    if (!matched) return false
  }

  if (criteria.minEngagement !== undefined) {
    if (bookmark.engagement_score < criteria.minEngagement) return false
  }

  if (criteria.withComments) {
    const content = bookmark.content?.toLowerCase() ?? ''
    if (!content.includes('comment') && !content.includes('reply')) return false
  }

  return true
}

export function getBookmarksForView(
  view: View,
  allBookmarks: Bookmark[],
  validationInvalidIds?: Set<number>,
  manualViewMembership?: Map<string, Set<string>>
): Bookmark[] {
  if (view.mode === 'manual') {
    const viewBookmarkIds = manualViewMembership?.get(view.id)
    if (!viewBookmarkIds || viewBookmarkIds.size === 0) return []
    return allBookmarks.filter((b) => viewBookmarkIds.has(String(b.id)))
  }

  if (!view.criteria) return allBookmarks

  if (view.criteria.isUncategorized && manualViewMembership) {
    const uncategorizedIds = getUncategorizedBookmarkIds(
      allBookmarks,
      manualViewMembership
    )
    return allBookmarks.filter((b) => {
      if (!uncategorizedIds.has(String(b.id))) return false
      return matchesCriteria(b, view.criteria!, validationInvalidIds)
    })
  }

  return allBookmarks.filter((b) =>
    matchesCriteria(b, view.criteria!, validationInvalidIds)
  )
}

export function buildMembershipIndex(views: View[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>()
  for (const view of views) {
    if (view.mode === 'manual' && view.bookmarkIds.length > 0) {
      index.set(view.id, new Set(view.bookmarkIds))
    }
  }
  return index
}

export function getUncategorizedBookmarkIds(
  allBookmarks: Bookmark[],
  membershipIndex: Map<string, Set<string>>
): Set<string> {
  const allCategorized = new Set<string>()
  for (const ids of membershipIndex.values()) {
    for (const id of ids) {
      allCategorized.add(id)
    }
  }

  const uncategorized = new Set<string>()
  for (const bookmark of allBookmarks) {
    const id = String(bookmark.id)
    if (!allCategorized.has(id)) {
      uncategorized.add(id)
    }
  }
  return uncategorized
}
