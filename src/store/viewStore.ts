import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { handleStoreError } from '@/store/utils/handleStoreError'
import { logger } from '@/lib/logger'
import type { View, ViewInsert, ViewsState } from '@/types/views'
import { SYSTEM_VIEWS } from '@/types/views'

export type { View }

const VIEWS_STORAGE_KEY = 'bookmarkhub_views'

function readViewsFromStorage(): View[] {
  try {
    const raw = localStorage.getItem(VIEWS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (error) {
    logger.warn('Failed to read views from localStorage', error)
  }
  return []
}

function writeViewsToStorage(views: View[]): void {
  try {
    localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(views))
  } catch (error) {
    logger.error('Failed to write views to localStorage', error)
  }
}

function generateId(): string {
  return `view-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function buildDefaultSystemViews(): View[] {
  const now = new Date().toISOString()
  const userId = 'local-user'
  return [
    {
      id: SYSTEM_VIEWS.ALL,
      name: 'All Bookmarks',
      icon: 'bookmark',
      color: '#6366f1',
      parentId: null,
      sortOrder: 0,
      mode: 'dynamic',
      bookmarkIds: [],
      criteria: {},
      pinned: true,
      system: true,
      createdAt: now,
      updatedAt: now,
      userId,
    },
    {
      id: SYSTEM_VIEWS.STARRED,
      name: 'Starred',
      icon: 'star',
      color: '#f59e0b',
      parentId: null,
      sortOrder: 1,
      mode: 'dynamic',
      bookmarkIds: [],
      criteria: { starred: true },
      pinned: true,
      system: true,
      createdAt: now,
      updatedAt: now,
      userId,
    },
    {
      id: SYSTEM_VIEWS.RECENT,
      name: 'Recent',
      icon: 'clock',
      color: '#10b981',
      parentId: null,
      sortOrder: 2,
      mode: 'dynamic',
      bookmarkIds: [],
      criteria: { recentDays: 7 },
      pinned: true,
      system: true,
      createdAt: now,
      updatedAt: now,
      userId,
    },
    {
      id: SYSTEM_VIEWS.ARCHIVED,
      name: 'Archived',
      icon: 'archive',
      color: '#8b5cf6',
      parentId: null,
      sortOrder: 3,
      mode: 'dynamic',
      bookmarkIds: [],
      criteria: {},
      pinned: false,
      system: true,
      createdAt: now,
      updatedAt: now,
      userId,
    },
    {
      id: SYSTEM_VIEWS.TRASH,
      name: 'Trash',
      icon: 'trash-2',
      color: '#ef4444',
      parentId: null,
      sortOrder: 4,
      mode: 'dynamic',
      bookmarkIds: [],
      criteria: { isDeleted: true },
      pinned: false,
      system: true,
      createdAt: now,
      updatedAt: now,
      userId,
    },
    {
      id: SYSTEM_VIEWS.UNCATEGORIZED,
      name: 'Uncategorized',
      icon: 'inbox',
      color: '#64748b',
      parentId: null,
      sortOrder: 5,
      mode: 'dynamic',
      bookmarkIds: [],
      criteria: { isUncategorized: true },
      pinned: false,
      system: true,
      createdAt: now,
      updatedAt: now,
      userId,
    },
  ]
}

interface ViewActions {
  loadViews: () => void
  createView: (insert: ViewInsert) => void
  updateView: (id: string, updates: Partial<View>) => void
  deleteView: (id: string) => void
  reorderView: (id: string, newSortOrder: number) => void

  setActiveView: (id: string) => void
  toggleViewExpansion: (id: string) => void
  pinView: (id: string) => void
  unpinView: (id: string) => void

  addBookmarkToView: (viewId: string, bookmarkId: string) => void
  removeBookmarkFromView: (viewId: string, bookmarkId: string) => void
  moveBookmarksToView: (viewId: string, bookmarkIds: string[]) => void

  setViewFilter: (filter: ViewsState['viewFilter']) => void

  getViewBreadcrumb: (id: string) => View[]
  getBookmarksForView: (viewId: string) => string[]
}

export type ViewStore = ViewsState & ViewActions

export const useViewStore = create<ViewStore>()(
  devtools(
    (set, get) => ({
      views: [],
      activeViewId: SYSTEM_VIEWS.ALL,
      expandedViews: [],
      viewFilter: 'all',
      isLoading: false,
      error: null,

      loadViews: () => {
        try {
          let views = readViewsFromStorage()

          if (views.length === 0) {
            views = buildDefaultSystemViews()
            writeViewsToStorage(views)
          }

          set(
            { views, isLoading: false, error: null },
            false,
            'views:load:success'
          )
        } catch (error) {
          handleStoreError(set, error, 'views:load', { isLoading: false })
        }
      },

      createView: (insert) => {
        try {
          const now = new Date().toISOString()
          const id = generateId()

          const view: View = {
            id,
            name: insert.name,
            icon: insert.icon ?? 'folder',
            color: insert.color ?? '#6366f1',
            parentId: insert.parentId ?? null,
            sortOrder: insert.sortOrder ?? get().views.length,
            mode: insert.mode ?? 'manual',
            bookmarkIds: [],
            criteria: insert.criteria ?? null,
            pinned: insert.pinned ?? false,
            system: false,
            description: insert.description,
            createdAt: now,
            updatedAt: now,
            userId: insert.userId ?? 'local-user',
          }

          const views = [view, ...get().views]
          writeViewsToStorage(views)

          set({ views }, false, 'views:create:success')
        } catch (error) {
          handleStoreError(set, error, 'views:create', { notify: true })
        }
      },

      updateView: (id, updates) => {
        try {
          const views = get().views.map((v) =>
            v.id === id
              ? { ...v, ...updates, updatedAt: new Date().toISOString() }
              : v
          )
          writeViewsToStorage(views)

          set({ views }, false, 'views:update:success')
        } catch (error) {
          handleStoreError(set, error, 'views:update', { notify: true })
        }
      },

      deleteView: (id) => {
        try {
          const view = get().views.find((v) => v.id === id)

          if (!view) return
          if (view.system) {
            throw new Error('Cannot delete system views')
          }

          const views = get().views.filter((v) => v.id !== id)
          writeViewsToStorage(views)

          set(
            (state) => ({
              views,
              activeViewId:
                state.activeViewId === id
                  ? SYSTEM_VIEWS.ALL
                  : state.activeViewId,
            }),
            false,
            'views:delete:success'
          )
        } catch (error) {
          handleStoreError(set, error, 'views:delete', { notify: true })
        }
      },

      reorderView: (id, newSortOrder) => {
        try {
          const views = get().views.map((v) =>
            v.id === id
              ? {
                  ...v,
                  sortOrder: newSortOrder,
                  updatedAt: new Date().toISOString(),
                }
              : v
          )
          writeViewsToStorage(views)

          set({ views }, false, 'views:reorder:success')
        } catch (error) {
          handleStoreError(set, error, 'views:reorder')
        }
      },

      setActiveView: (id) =>
        set({ activeViewId: id }, false, 'views:setActive'),

      toggleViewExpansion: (id) =>
        set(
          (state) => ({
            expandedViews: state.expandedViews.includes(id)
              ? state.expandedViews.filter((eid) => eid !== id)
              : [...state.expandedViews, id],
          }),
          false,
          'views:toggleExpansion'
        ),

      pinView: (id) => {
        try {
          const views = get().views.map((v) =>
            v.id === id
              ? { ...v, pinned: true, updatedAt: new Date().toISOString() }
              : v
          )
          writeViewsToStorage(views)

          set({ views }, false, 'views:pin')
        } catch (error) {
          handleStoreError(set, error, 'views:pin')
        }
      },

      unpinView: (id) => {
        try {
          const view = get().views.find((v) => v.id === id)
          if (view?.system) {
            throw new Error('Cannot unpin system views')
          }

          const views = get().views.map((v) =>
            v.id === id
              ? { ...v, pinned: false, updatedAt: new Date().toISOString() }
              : v
          )
          writeViewsToStorage(views)

          set({ views }, false, 'views:unpin')
        } catch (error) {
          handleStoreError(set, error, 'views:unpin')
        }
      },

      addBookmarkToView: (viewId, bookmarkId) => {
        try {
          const view = get().views.find((v) => v.id === viewId)
          if (!view) throw new Error(`View ${viewId} not found`)
          if (view.mode !== 'manual') {
            throw new Error('Cannot add bookmarks to a dynamic view')
          }
          if (view.bookmarkIds.includes(bookmarkId)) return

          const views = get().views.map((v) =>
            v.id === viewId
              ? {
                  ...v,
                  bookmarkIds: [...v.bookmarkIds, bookmarkId],
                  updatedAt: new Date().toISOString(),
                }
              : v
          )
          writeViewsToStorage(views)

          set({ views }, false, 'views:addBookmark')
        } catch (error) {
          handleStoreError(set, error, 'views:addBookmark', { notify: true })
        }
      },

      removeBookmarkFromView: (viewId, bookmarkId) => {
        try {
          const view = get().views.find((v) => v.id === viewId)
          if (!view) throw new Error(`View ${viewId} not found`)
          if (view.mode !== 'manual') {
            throw new Error('Cannot remove bookmarks from a dynamic view')
          }

          const views = get().views.map((v) =>
            v.id === viewId
              ? {
                  ...v,
                  bookmarkIds: v.bookmarkIds.filter(
                    (bid) => bid !== bookmarkId
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : v
          )
          writeViewsToStorage(views)

          set({ views }, false, 'views:removeBookmark')
        } catch (error) {
          handleStoreError(set, error, 'views:removeBookmark', { notify: true })
        }
      },

      moveBookmarksToView: (viewId, bookmarkIds) => {
        try {
          const view = get().views.find((v) => v.id === viewId)
          if (!view) throw new Error(`View ${viewId} not found`)
          if (view.mode !== 'manual') {
            throw new Error('Cannot add bookmarks to a dynamic view')
          }

          const merged = [...new Set([...view.bookmarkIds, ...bookmarkIds])]

          const views = get().views.map((v) =>
            v.id === viewId
              ? {
                  ...v,
                  bookmarkIds: merged,
                  updatedAt: new Date().toISOString(),
                }
              : v
          )
          writeViewsToStorage(views)

          set({ views }, false, 'views:moveBookmarks')
        } catch (error) {
          handleStoreError(set, error, 'views:moveBookmarks', { notify: true })
        }
      },

      setViewFilter: (filter) =>
        set({ viewFilter: filter }, false, 'views:setFilter'),

      getViewBreadcrumb: (id) => {
        const { views } = get()
        const chain: View[] = []
        let current = views.find((v) => v.id === id)

        while (current) {
          chain.unshift(current)
          if (!current.parentId) break
          current = views.find((v) => v.id === current!.parentId)
        }

        return chain
      },

      getBookmarksForView: (viewId) => {
        const view = get().views.find((v) => v.id === viewId)
        if (!view) return []
        if (view.mode === 'manual') return view.bookmarkIds
        return []
      },
    }),
    { name: 'view-store' }
  )
)
