import { useMemo } from 'react'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useViewStore } from '@/store/viewStore'

export interface ChecklistItemStatus {
  id: keyof ReturnType<typeof useChecklistStatus>['items']
  label: string
  isCompleted: boolean
  isAutoDetected: boolean
}

export const useChecklistStatus = () => {
  const bookmarks = useBookmarkStore((s) => s.bookmarks)
  const views = useViewStore((s) => s.views)
  const checklistProgress = useSettingsStore((s) => s.onboarding.checklistProgress)

  // Auto-detect completion status
  const hasBookmarks = bookmarks.length > 0
  const hasViews = views.some((v) => !v.system)
  const hasTags = useMemo(
    () => bookmarks.some((b) => b.tags && b.tags.length > 0),
    [bookmarks]
  )

  const items = useMemo(() => {
    return {
      hasImportedBookmarks: {
        id: 'hasImportedBookmarks' as const,
        label: 'Import your bookmarks from X/Twitter',
        isCompleted: hasBookmarks || checklistProgress.hasImportedBookmarks,
        isAutoDetected: hasBookmarks,
      },
      hasCreatedCollection: {
        id: 'hasCreatedCollection' as const,
        label: 'Create your first collection',
        isCompleted: hasViews || checklistProgress.hasCreatedCollection,
        isAutoDetected: hasViews,
      },
      hasAddedTags: {
        id: 'hasAddedTags' as const,
        label: 'Add tags to organize bookmarks',
        isCompleted: hasTags || checklistProgress.hasAddedTags,
        isAutoDetected: hasTags,
      },
      hasUsedSearchFilters: {
        id: 'hasUsedSearchFilters' as const,
        label: 'Try the search and filter features',
        isCompleted: checklistProgress.hasUsedSearchFilters,
        isAutoDetected: false,
      },
      hasExploredSettings: {
        id: 'hasExploredSettings' as const,
        label: 'Explore settings and customize your experience',
        isCompleted: checklistProgress.hasExploredSettings,
        isAutoDetected: false,
      },
      hasExportedData: {
        id: 'hasExportedData' as const,
        label: 'Export your data as a backup',
        isCompleted: checklistProgress.hasExportedData,
        isAutoDetected: false,
      },
    }
  }, [
    hasBookmarks,
    hasViews,
    hasTags,
    checklistProgress,
  ])

  const itemsArray = Object.values(items)
  const completedCount = itemsArray.filter((item) => item.isCompleted).length
  const totalCount = itemsArray.length
  const progressPercentage = Math.round((completedCount / totalCount) * 100)

  return {
    items,
    itemsArray,
    completedCount,
    totalCount,
    progressPercentage,
    isFullyCompleted: completedCount === totalCount,
  }
}
