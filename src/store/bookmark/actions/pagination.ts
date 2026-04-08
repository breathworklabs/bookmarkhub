import type { StoreSet, StoreGet } from '@/store/bookmark/types'

export const createPaginationActions = (set: StoreSet, get: StoreGet) => ({
  loadMoreBookmarks: () => {
    const state = get()
    if (state.pagination.isLoading || !state.pagination.hasMore) return

    set(
      {
        pagination: { ...state.pagination, isLoading: true },
      },
      false,
      'loadMoreBookmarks:start'
    )

    get().updateDisplayedBookmarks()
  },

  resetPagination: () => {
    set(
      {
        pagination: {
          currentPage: 1,
          itemsPerPage: 20,
          totalItems: 0,
          hasMore: false,
          isLoading: false,
        },
        displayedBookmarks: [],
      },
      false,
      'resetPagination'
    )

    get().updateDisplayedBookmarks()
  },

  setItemsPerPage: (count: number) => {
    const state = get()
    set(
      {
        pagination: {
          ...state.pagination,
          itemsPerPage: count,
          currentPage: 1,
        },
      },
      false,
      'setItemsPerPage'
    )

    get().updateDisplayedBookmarks()
  },

  updateDisplayedBookmarks: () => {
    const state = get()
    set(
      {
        pagination: {
          ...state.pagination,
          isLoading: false,
        },
      },
      false,
      'updateDisplayedBookmarks'
    )
  },
})
