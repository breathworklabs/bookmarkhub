import type { StoreSet, StoreGet } from '@/store/bookmark/types'
import {
  createFilterPreset,
  addPreset,
  deletePreset,
  updatePreset,
  findPresetById,
} from '@/utils/filterPresets'

export const createPresetActions = (set: StoreSet, get: StoreGet) => ({
  saveFilterPreset: (name: string, description?: string) => {
    const state = get()
    const newPreset = createFilterPreset(
      name,
      {
        selectedTags: [...state.selectedTags],
        searchQuery: state.searchQuery,
        authorFilter: state.authorFilter,
        domainFilter: state.domainFilter,
        contentTypeFilter: state.contentTypeFilter,
        dateRangeFilter: { ...state.dateRangeFilter },
        quickFilters: [...state.quickFilters],
      },
      description
    )

    const updatedPresets = addPreset(state.savedFilterPresets, newPreset)
    set({ savedFilterPresets: updatedPresets }, false, 'saveFilterPreset')
  },

  loadFilterPreset: (presetId: string) => {
    const state = get()
    const preset = findPresetById(state.savedFilterPresets, presetId)

    if (preset) {
      set(
        {
          selectedTags: [...preset.filters.selectedTags],
          searchQuery: preset.filters.searchQuery,
          authorFilter: preset.filters.authorFilter,
          domainFilter: preset.filters.domainFilter,
          contentTypeFilter: preset.filters.contentTypeFilter,
          dateRangeFilter: { ...preset.filters.dateRangeFilter },
          quickFilters: [...preset.filters.quickFilters],
        },
        false,
        'loadFilterPreset'
      )

      get().resetPagination()
    }
  },

  deleteFilterPreset: (presetId: string) => {
    const state = get()
    const updatedPresets = deletePreset(state.savedFilterPresets, presetId)
    set({ savedFilterPresets: updatedPresets }, false, 'deleteFilterPreset')
  },

  updateFilterPreset: (
    presetId: string,
    name: string,
    description?: string
  ) => {
    const state = get()
    const updatedPresets = updatePreset(
      state.savedFilterPresets,
      presetId,
      name,
      description
    )
    set({ savedFilterPresets: updatedPresets }, false, 'updateFilterPreset')
  },
})
