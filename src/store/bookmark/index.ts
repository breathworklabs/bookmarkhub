import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { BookmarkState } from './types'
import { createInitialState } from './initialState'
import { createCrudActions } from './actions/crud'
import { createDataManagementActions } from './actions/dataManagement'
import { createDuplicateActions } from './actions/duplicates'
import { createFilterActions } from './actions/filters'
import { createPaginationActions } from './actions/pagination'
import { createPresetActions } from './actions/presets'
import { createValidationActions } from './actions/validation'
import { createUiActions } from './actions/ui'

export const useBookmarkStore = create<BookmarkState>()(
  devtools(
    (set, get) => ({
      ...createInitialState(),
      ...createCrudActions(set, get),
      ...createDataManagementActions(set, get),
      ...createDuplicateActions(set, get),
      ...createFilterActions(set, get),
      ...createPaginationActions(set, get),
      ...createPresetActions(set, get),
      ...createValidationActions(set, get),
      ...createUiActions(set, get),
    }),
    {
      name: 'bookmark-store',
    }
  )
)

export type { DateRangeFilter, PaginationState, BookmarkState } from './types'
export type { ActivityLog } from '../../utils/activityLogger'
export type { SavedFilterPreset } from '../../utils/filterPresets'
