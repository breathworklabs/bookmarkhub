import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { mockBookmarks, type Bookmark } from '../data/mockBookmarks'

interface BookmarkState {
  // State
  bookmarks: Bookmark[]
  selectedTags: string[]
  searchQuery: string
  activeTab: number
  viewMode: 'grid' | 'list'
  isLoading: boolean

  // Actions
  setBookmarks: (bookmarks: Bookmark[]) => void
  addBookmark: (bookmark: Bookmark) => void
  removeBookmark: (id: number) => void
  toggleStarBookmark: (id: number) => void

  setSelectedTags: (tags: string[]) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  clearTags: () => void

  setSearchQuery: (query: string) => void
  setActiveTab: (tab: number) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setIsLoading: (loading: boolean) => void
}

export const useBookmarkStore = create<BookmarkState>()(
  devtools(
    (set) => ({
      // Initial state
      bookmarks: mockBookmarks,
      selectedTags: ['tech', 'AI'],
      searchQuery: '',
      activeTab: 0,
      viewMode: 'grid',
      isLoading: false,

      // Actions
      setBookmarks: (bookmarks) => set({ bookmarks }, false, 'setBookmarks'),

      addBookmark: (bookmark) => set(
        (state) => ({ bookmarks: [...state.bookmarks, bookmark] }),
        false,
        'addBookmark'
      ),

      removeBookmark: (id) => set(
        (state) => ({ bookmarks: state.bookmarks.filter(b => b.id !== id) }),
        false,
        'removeBookmark'
      ),

      toggleStarBookmark: (id) => set(
        (state) => ({
          bookmarks: state.bookmarks.map(bookmark =>
            bookmark.id === id ? { ...bookmark, isStarred: !bookmark.isStarred } : bookmark
          )
        }),
        false,
        'toggleStarBookmark'
      ),

      setSelectedTags: (tags) => set({ selectedTags: tags }, false, 'setSelectedTags'),

      addTag: (tag) => set(
        (state) => ({ selectedTags: [...state.selectedTags, tag] }),
        false,
        'addTag'
      ),

      removeTag: (tag) => set(
        (state) => ({ selectedTags: state.selectedTags.filter(t => t !== tag) }),
        false,
        'removeTag'
      ),

      clearTags: () => set({ selectedTags: [] }, false, 'clearTags'),

      setSearchQuery: (query) => set({ searchQuery: query }, false, 'setSearchQuery'),
      setActiveTab: (tab) => set({ activeTab: tab }, false, 'setActiveTab'),
      setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),
      setIsLoading: (loading) => set({ isLoading: loading }, false, 'setIsLoading')
    }),
    {
      name: 'bookmark-store', // Store name for devtools
    }
  )
)