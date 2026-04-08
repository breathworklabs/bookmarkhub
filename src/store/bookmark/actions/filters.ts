import type { StoreSet, StoreGet, DateRangeFilter } from '../types'

export const createFilterActions = (set: StoreSet, get: StoreGet) => ({
  setAuthorFilter: (filter: string) =>
    set({ authorFilter: filter }, false, 'setAuthorFilter'),
  setDomainFilter: (filter: string) =>
    set({ domainFilter: filter }, false, 'setDomainFilter'),
  setContentTypeFilter: (filter: string) =>
    set({ contentTypeFilter: filter }, false, 'setContentTypeFilter'),
  setDateRangeFilter: (filter: DateRangeFilter) =>
    set({ dateRangeFilter: filter }, false, 'setDateRangeFilter'),
  toggleQuickFilter: (filter: string) =>
    set(
      (state) => ({
        quickFilters: state.quickFilters.includes(filter)
          ? state.quickFilters.filter((f) => f !== filter)
          : [...state.quickFilters, filter],
      }),
      false,
      'toggleQuickFilter'
    ),
  clearAdvancedFilters: () =>
    set(
      {
        authorFilter: '',
        domainFilter: '',
        contentTypeFilter: '',
        dateRangeFilter: { type: 'all' },
        quickFilters: [],
      },
      false,
      'clearAdvancedFilters'
    ),

  calculateFilterOptions: () => {
    const state = get()
    const bookmarks = state.bookmarks

    const currentHash =
      bookmarks.length +
      '-' +
      bookmarks
        .slice(0, 5)
        .map(
          (b) => `${b.id}-${b.author}-${b.domain}-${(b.tags || []).join(',')}`
        )
        .join('|')

    if (currentHash === state.filterOptionsHash) {
      return
    }

    const authorsSet = new Set<string>()
    const domainsSet = new Set<string>()
    const tagsSet = new Set<string>()

    for (const bookmark of bookmarks) {
      if (bookmark.author && bookmark.author.trim()) {
        authorsSet.add(bookmark.author.trim())
      }

      if (bookmark.domain && bookmark.domain.trim()) {
        domainsSet.add(bookmark.domain.trim())
      }

      if (bookmark.tags && Array.isArray(bookmark.tags)) {
        for (const tag of bookmark.tags) {
          if (tag && typeof tag === 'string' && tag.trim()) {
            tagsSet.add(tag.trim())
          }
        }
      }
    }

    const authors = Array.from(authorsSet).sort()
    const domains = Array.from(domainsSet).sort()
    const tags = Array.from(tagsSet).sort()

    set(
      {
        filterOptions: {
          authors,
          domains,
          tags,
          contentTypes: ['article', 'tweet', 'video', 'image'],
        },
        filterOptionsHash: currentHash,
      },
      false,
      'calculateFilterOptions'
    )
  },
})
