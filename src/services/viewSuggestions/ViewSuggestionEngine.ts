import type { Bookmark } from '@/types/bookmark'
import type { View, ViewCriteria } from '@/types/views'
import type {
  ViewSuggestion,
  ViewSuggestionOptions,
} from './types'

function criteriaEquals(a: ViewCriteria, b: ViewCriteria): boolean {
  if (a.tags && b.tags) {
    const tagsA = [...a.tags].sort()
    const tagsB = [...b.tags].sort()
    if (tagsA.length !== tagsB.length) return false
    if (tagsA.some((t, i) => t !== tagsB[i])) return false
    if (a.tagMatch !== b.tagMatch) return false
    return true
  }
  if (a.domains && b.domains) {
    const domA = [...a.domains].sort()
    const domB = [...b.domains].sort()
    if (domA.length !== domB.length) return false
    if (domA.some((d, i) => d !== domB[i])) return false
    return true
  }
  return false
}

function isDuplicateOfExisting(
  suggestion: ViewSuggestion,
  existingViews: View[]
): boolean {
  return existingViews.some(
    (v) =>
      v.mode === 'dynamic' &&
      v.criteria &&
      suggestion.view.criteria &&
      criteriaEquals(v.criteria, suggestion.view.criteria)
  )
}

function isSubsetOf(
  a: ViewSuggestion,
  b: ViewSuggestion
): boolean {
  const aTags = a.view.criteria?.tags ?? []
  const bTags = b.view.criteria?.tags ?? []
  if (aTags.length > 0 && bTags.length > 0) {
    return (
      aTags.length < bTags.length &&
      aTags.every((t) => bTags.includes(t)) &&
      a.view.criteria?.tagMatch === b.view.criteria?.tagMatch
    )
  }
  return false
}

export class ViewSuggestionEngine {
  analyze(
    bookmarks: Bookmark[],
    views: View[],
    options: ViewSuggestionOptions = {}
  ): ViewSuggestion[] {
    const maxSuggestions = options.maxSuggestions ?? 5
    const minBookmarkCount = options.minBookmarkCount ?? 3
    const minConfidence = options.minConfidence ?? 0.5

    const activeBookmarks = bookmarks.filter((b) => !b.is_deleted)
    if (activeBookmarks.length === 0) return []

    const dynamicViews = views.filter((v) => v.mode === 'dynamic' && v.criteria)
    const existingTagViews = new Map<string, ViewCriteria>()
    for (const v of dynamicViews) {
      if (v.criteria) {
        existingTagViews.set(
          this.criteriaKey(v.criteria),
          v.criteria
        )
      }
    }

    const frequentTagSuggestions = this.findFrequentTags(
      activeBookmarks,
      existingTagViews,
      minBookmarkCount
    )

    const coOccurrenceSuggestions = this.findTagCoOccurrences(
      activeBookmarks,
      existingTagViews,
      minBookmarkCount
    )

    const domainSuggestions = this.findDomainClusters(
      activeBookmarks,
      existingTagViews,
      minBookmarkCount
    )

    let allSuggestions: ViewSuggestion[] = [
      ...frequentTagSuggestions,
      ...coOccurrenceSuggestions,
      ...domainSuggestions,
    ]

    allSuggestions = allSuggestions.filter(
      (s) => !isDuplicateOfExisting(s, views)
    )

    allSuggestions = this.deduplicateSubsets(allSuggestions)

    allSuggestions.sort((a, b) => b.confidence - a.confidence)

    return allSuggestions
      .filter(
        (s) =>
          s.bookmarkCount >= minBookmarkCount &&
          s.confidence >= minConfidence
      )
      .slice(0, maxSuggestions)
  }

  private findFrequentTags(
    bookmarks: Bookmark[],
    existingCriteria: Map<string, ViewCriteria>,
    minCount: number
  ): ViewSuggestion[] {
    const tagCounts = new Map<string, number>()
    for (const b of bookmarks) {
      for (const tag of b.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
    }

    const totalBookmarks = bookmarks.length
    const suggestions: ViewSuggestion[] = []

    for (const [tag, count] of tagCounts) {
      if (count < minCount) continue

      const criteria: ViewCriteria = {
        tags: [tag],
        tagMatch: 'any',
      }
      const key = this.criteriaKey(criteria)
      if (existingCriteria.has(key)) continue

      const confidence = Math.min(count / totalBookmarks, 0.9)

      suggestions.push({
        id: `frequent-tag-${tag}`,
        view: {
          name: this.formatTagName(tag),
          icon: 'filter',
          mode: 'dynamic',
          criteria,
          pinned: false,
          description: `All bookmarks tagged "${tag}"`,
        },
        reasoning: `${count} bookmarks share the "${tag}" tag`,
        bookmarkCount: count,
        confidence,
        type: 'frequent-tag',
      })
    }

    return suggestions
  }

  private findTagCoOccurrences(
    bookmarks: Bookmark[],
    existingCriteria: Map<string, ViewCriteria>,
    minCount: number
  ): ViewSuggestion[] {
    const pairCounts = new Map<string, number>()
    const tagCounts = new Map<string, number>()

    for (const b of bookmarks) {
      const tags = [...new Set(b.tags)]
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const pairKey =
            tags[i] < tags[j]
              ? `${tags[i]}|${tags[j]}`
              : `${tags[j]}|${tags[i]}`
          pairCounts.set(pairKey, (pairCounts.get(pairKey) ?? 0) + 1)
        }
      }
    }

    const suggestions: ViewSuggestion[] = []

    for (const [pairKey, pairCount] of pairCounts) {
      if (pairCount < minCount) continue

      const [tag1, tag2] = pairKey.split('|')
      const count1 = tagCounts.get(tag1) ?? 0
      const count2 = tagCounts.get(tag2) ?? 0
      if (count1 === 0 || count2 === 0) continue

      const ratio1 = pairCount / count1
      const ratio2 = pairCount / count2

      if (ratio1 < 0.4 || ratio2 < 0.4) continue

      const criteria: ViewCriteria = {
        tags: [tag1, tag2],
        tagMatch: 'all',
      }
      const key = this.criteriaKey(criteria)
      if (existingCriteria.has(key)) continue

      const confidence = ((ratio1 + ratio2) / 2) * 0.85

      suggestions.push({
        id: `tag-cluster-${tag1}-${tag2}`,
        view: {
          name: `${this.formatTagName(tag1)} + ${this.formatTagName(tag2)}`,
          icon: 'filter',
          mode: 'dynamic',
          criteria,
          pinned: false,
          description: `Bookmarks with both "${tag1}" and "${tag2}"`,
        },
        reasoning: `"${tag1}" and "${tag2}" often appear together (${pairCount} bookmarks)`,
        bookmarkCount: pairCount,
        confidence,
        type: 'tag-cluster',
      })
    }

    return suggestions
  }

  private findDomainClusters(
    bookmarks: Bookmark[],
    existingCriteria: Map<string, ViewCriteria>,
    minCount: number
  ): ViewSuggestion[] {
    const domainBookmarks = new Map<string, Bookmark[]>()

    for (const b of bookmarks) {
      if (!b.domain) continue
      const domain = b.domain.toLowerCase()
      const list = domainBookmarks.get(domain) ?? []
      list.push(b)
      domainBookmarks.set(domain, list)
    }

    const suggestions: ViewSuggestion[] = []

    for (const [domain, domainBks] of domainBookmarks) {
      if (domainBks.length < minCount + 2) continue

      const tagFreq = new Map<string, number>()
      for (const b of domainBks) {
        for (const tag of b.tags) {
          tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1)
        }
      }

      const sortedTags = [...tagFreq.entries()].sort(
        (a, b) => b[1] - a[1]
      )
      const top3Tags = sortedTags.slice(0, 3).map(([tag]) => tag)

      if (top3Tags.length === 0) continue

      const coverage =
        domainBks.filter((b) =>
          b.tags.some((t) => top3Tags.includes(t))
        ).length / domainBks.length

      if (coverage < 0.6) continue

      const criteria: ViewCriteria = {
        domains: [domain],
      }
      const key = this.criteriaKey(criteria)
      if (existingCriteria.has(key)) continue

      const confidence = coverage * 0.8

      suggestions.push({
        id: `domain-cluster-${domain}`,
        view: {
          name: this.formatDomainName(domain),
          icon: 'filter',
          mode: 'dynamic',
          criteria,
          pinned: false,
          description: `All bookmarks from ${domain}`,
        },
        reasoning: `${domainBks.length} bookmarks from ${domain}, commonly tagged: ${top3Tags.slice(0, 3).join(', ')}`,
        bookmarkCount: domainBks.length,
        confidence,
        type: 'domain-cluster',
      })
    }

    return suggestions
  }

  private deduplicateSubsets(
    suggestions: ViewSuggestion[]
  ): ViewSuggestion[] {
    const keep = new Set<number>()

    for (let i = 0; i < suggestions.length; i++) {
      let dominated = false
      for (let j = 0; j < suggestions.length; j++) {
        if (i === j) continue
        if (
          isSubsetOf(suggestions[i], suggestions[j]) &&
          suggestions[j].confidence >= suggestions[i].confidence
        ) {
          dominated = true
          break
        }
      }
      if (!dominated) {
        keep.add(i)
      }
    }

    return suggestions
      .filter((_, i) => keep.has(i))
      .sort((a, b) => b.confidence - a.confidence)
  }

  private criteriaKey(criteria: ViewCriteria): string {
    if (criteria.domains) {
      return `domains:${[...criteria.domains].sort().join(',')}`
    }
    if (criteria.tags) {
      return `tags:${[...criteria.tags].sort().join(',')}:${criteria.tagMatch ?? 'any'}`
    }
    return ''
  }

  private formatTagName(tag: string): string {
    return tag
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  private formatDomainName(domain: string): string {
    const parts = domain.replace(/^www\./, '').split('.')
    return parts.length > 1
      ? parts[parts.length - 2].charAt(0).toUpperCase() +
          parts[parts.length - 2].slice(1)
      : domain.charAt(0).toUpperCase() + domain.slice(1)
  }
}

export const viewSuggestionEngine = new ViewSuggestionEngine()
