import type { StoreSet, StoreGet } from '../types'
import type { Bookmark } from '@/types/bookmark'

export const createUiActions = (set: StoreSet, _get: StoreGet) => ({
  setBookmarks: (bookmarks: Bookmark[]) =>
    set({ bookmarks }, false, 'setBookmarks'),
  setSelectedTags: (tags: string[]) =>
    set({ selectedTags: tags }, false, 'setSelectedTags'),
  addTag: (tag: string) =>
    set(
      (state) => ({ selectedTags: [...state.selectedTags, tag] }),
      false,
      'addTag'
    ),
  removeTag: (tag: string) =>
    set(
      (state) => ({
        selectedTags: state.selectedTags.filter((t) => t !== tag),
      }),
      false,
      'removeTag'
    ),
  clearTags: () => set({ selectedTags: [] }, false, 'clearTags'),
  setSearchQuery: (query: string) =>
    set({ searchQuery: query }, false, 'setSearchQuery'),
  setActiveTab: (tab: number) => set({ activeTab: tab }, false, 'setActiveTab'),
  setSelectedBookmarks: (bookmarks: number[]) =>
    set({ selectedBookmarks: bookmarks }, false, 'setSelectedBookmarks'),
  selectBookmark: (id: number) =>
    set(
      (state) => ({
        selectedBookmarks: [...new Set([...state.selectedBookmarks, id])],
      }),
      false,
      'selectBookmark'
    ),
  deselectBookmark: (id: number) =>
    set(
      (state) => ({
        selectedBookmarks: state.selectedBookmarks.filter((bid) => bid !== id),
      }),
      false,
      'deselectBookmark'
    ),
  toggleBookmarkSelection: (id: number) =>
    set(
      (state) => ({
        selectedBookmarks: state.selectedBookmarks.includes(id)
          ? state.selectedBookmarks.filter((bid) => bid !== id)
          : [...state.selectedBookmarks, id],
      }),
      false,
      'toggleBookmarkSelection'
    ),
  clearBookmarkSelection: () =>
    set({ selectedBookmarks: [] }, false, 'clearBookmarkSelection'),
  setIsLoading: (loading: boolean) =>
    set({ isLoading: loading }, false, 'setIsLoading'),
  setAIPanelOpen: (isOpen: boolean) =>
    set({ isAIPanelOpen: isOpen }, false, 'setAIPanelOpen'),
  toggleAIPanel: () =>
    set(
      (state) => ({ isAIPanelOpen: !state.isAIPanelOpen }),
      false,
      'toggleAIPanel'
    ),
  setFiltersPanelOpen: (isOpen: boolean) =>
    set({ isFiltersPanelOpen: isOpen }, false, 'setFiltersPanelOpen'),
  toggleFiltersPanel: () =>
    set(
      (state) => ({ isFiltersPanelOpen: !state.isFiltersPanelOpen }),
      false,
      'toggleFiltersPanel'
    ),
  setMobileHeaderVisible: (isVisible: boolean) =>
    set({ isMobileHeaderVisible: isVisible }, false, 'setMobileHeaderVisible'),
  toggleMobileHeader: () =>
    set(
      (state) => ({ isMobileHeaderVisible: !state.isMobileHeaderVisible }),
      false,
      'toggleMobileHeader'
    ),
  setActiveSidebarItem: (item: string) =>
    set({ activeSidebarItem: item }, false, 'setActiveSidebarItem'),
  setError: (error: string | null) => set({ error }, false, 'setError'),
})
