import { Box, Text, Button, VStack } from '@chakra-ui/react'
import { useMemo, memo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useViewStore } from '@/store/viewStore'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { SYSTEM_VIEWS } from '@/types/views'
import { useModal } from '@/components/modals/ModalProvider'
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
  const createView = useViewStore((s) => s.createView)
  const { showCreateCollection } = useModal()

  const location = useLocation()
  const navigateWithCleanup = useNavigateWithCleanup()

  const handleViewClick = useCallback(
    (view: { id: string }) => {
      setActiveView(view.id)
      if (location.pathname !== '/') navigateWithCleanup('/')
    },
    [setActiveView, location.pathname, navigateWithCleanup]
  )

  const rootViews = useMemo(
    () =>
      views
        .filter((v) => !v.parentId && !NAV_ITEM_VIEW_IDS.has(v.id))
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return a.sortOrder - b.sortOrder
        }),
    [views]
  )

  const hasUserViews = useMemo(
    () => views.some((v) => !v.system && !NAV_ITEM_VIEW_IDS.has(v.id)),
    [views]
  )

  const handleCreateView = useCallback(() => {
    showCreateCollection({
      onCreate: (viewData) => {
        createView(viewData)
      },
    })
  }, [showCreateCollection, createView])

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
          onClick={handleCreateView}
        >
          Create your first view
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
