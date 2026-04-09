import { Box, Text, Button, VStack } from '@chakra-ui/react'
import { useMemo, memo, useCallback } from 'react'
import { useViewStore } from '@/store/viewStore'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { SYSTEM_VIEWS } from '@/types/views'
import { useNavigateWithCleanup } from '@/hooks/useNavigateWithCleanup'
import { ViewsTreeItem } from './ViewsTreeItem'

const NAV_ITEM_VIEW_IDS: ReadonlySet<string> = new Set([
  SYSTEM_VIEWS.ALL,
  SYSTEM_VIEWS.STARRED,
  SYSTEM_VIEWS.RECENT,
])

const ViewsTree = memo(() => {
  const views = useViewStore((s) => s.views)
  const activeViewId = useViewStore((s) => s.activeViewId)
  const expandedViews = useViewStore((s) => s.expandedViews)
  const setActiveView = useViewStore((s) => s.setActiveView)
  const toggleViewExpansion = useViewStore((s) => s.toggleViewExpansion)
  const bookmarks = useBookmarkStore((s) => s.bookmarks)
  const clearBookmarkSelection = useBookmarkStore(
    (s) => s.clearBookmarkSelection
  )
  const setActiveSidebarItem = useBookmarkStore((s) => s.setActiveSidebarItem)
  const clearAdvancedFilters = useBookmarkStore((s) => s.clearAdvancedFilters)
  const navigateWithCleanup = useNavigateWithCleanup()

  const handleViewClick = useCallback(
    (view: { id: string }) => {
      setActiveView(view.id)
      clearBookmarkSelection()
      setActiveSidebarItem('All Bookmarks')
      clearAdvancedFilters()
      navigateWithCleanup('/')
    },
    [
      setActiveView,
      clearBookmarkSelection,
      setActiveSidebarItem,
      clearAdvancedFilters,
      navigateWithCleanup,
    ]
  )

  const rootViews = useMemo(
    () =>
      views
        .filter((v) => !v.parentId && !NAV_ITEM_VIEW_IDS.has(v.id))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [views]
  )

  const hasUserViews = useMemo(
    () => views.some((v) => !v.system && !NAV_ITEM_VIEW_IDS.has(v.id)),
    [views]
  )

  if (rootViews.length === 0 && !hasUserViews) {
    return (
      <Box
        p={3}
        mx={2}
        textAlign="center"
        color="var(--color-text-tertiary)"
        fontSize="sm"
        border="1px dashed var(--color-border)"
        borderRadius="md"
        mt={2}
      >
        <Text mb={2} fontSize="xs">
          No views yet
        </Text>
        <Button
          size="sm"
          variant="ghost"
          color="var(--color-blue)"
          _hover={{ bg: 'var(--color-bg-hover)' }}
          fontSize="xs"
          onClick={() => {
            setActiveView(SYSTEM_VIEWS.ALL)
            navigateWithCleanup('/')
          }}
        >
          Create your first
        </Button>
      </Box>
    )
  }

  return (
    <VStack align="stretch" gap={0}>
      {rootViews.map((view) => (
        <ViewsTreeItem
          key={view.id}
          view={view}
          allViews={views}
          bookmarks={bookmarks}
          depth={0}
          activeViewId={activeViewId}
          expandedViews={expandedViews}
          onToggleExpand={toggleViewExpansion}
          onViewClick={handleViewClick}
        />
      ))}
    </VStack>
  )
})

ViewsTree.displayName = 'ViewsTree'

export default ViewsTree
