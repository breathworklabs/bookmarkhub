import { Box, Text, Button } from '@chakra-ui/react'
import { useMemo, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollectionsStore } from '../../store/collectionsStore'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useModal } from '../modals/ModalProvider'
import { CollectionTree } from './tree/CollectionTree'

const CollectionsList = memo(() => {
  const {
    collections,
    activeCollectionId,
    collectionBookmarks,
    expandedCollections,
    isLoading,
    error,
    setActiveCollection,
    toggleCollectionExpansion,
    createCollection,
  } = useCollectionsStore()

  const navigate = useNavigate()
  const setActiveSidebarItem = useBookmarkStore(
    (state) => state.setActiveSidebarItem
  )
  const activeSidebarItem = useBookmarkStore((state) => state.activeSidebarItem)
  const { showCreateCollection } = useModal()

  // Handler for collection clicks
  const handleCollectionClick = useCallback(
    (collectionId: string) => {
      const isCurrentlyActive =
        activeSidebarItem === 'Collections' &&
        activeCollectionId === collectionId
      const newActiveId = isCurrentlyActive ? null : collectionId
      setActiveCollection(newActiveId)

      // Clear selected bookmarks when switching collections
      useBookmarkStore.getState().clearBookmarkSelection()

      // Navigate to home page when clicking collections
      navigate('/')

      // Also update the main sidebar state to show we're in collections mode
      if (newActiveId) {
        setActiveSidebarItem('Collections')
      } else {
        setActiveSidebarItem('All Bookmarks')
      }
    },
    [
      activeSidebarItem,
      activeCollectionId,
      setActiveCollection,
      setActiveSidebarItem,
      navigate,
    ]
  )

  // Memoized collection categories
  const userCollections = useMemo(
    () => collections.filter((c) => !c.isDefault),
    [collections]
  )

  if (error) {
    return (
      <Box p={3}>
        <Text color="var(--color-error)" fontSize="sm">
          Error: {error}
        </Text>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box p={3} textAlign="center">
        <Text style={{ color: 'var(--color-text-tertiary)' }} fontSize="sm">
          Loading...
        </Text>
      </Box>
    )
  }

  return (
    <>
      {/* New Tree Component with max depth of 2 for sidebar */}
      <CollectionTree
        collections={collections}
        activeCollectionId={activeCollectionId}
        expandedCollections={expandedCollections}
        collectionBookmarks={collectionBookmarks}
        maxDepth={2}
        onToggleExpand={toggleCollectionExpansion}
        onExpandFullView={(collectionId) => {
          // TODO: Open CollectionTreePanel
          console.log('Expand full view for:', collectionId)
        }}
        onCollectionClick={handleCollectionClick}
      />

      {/* Empty State for User Collections */}
      {userCollections.length === 0 && (
        <Box
          p={3}
          mx={2}
          textAlign="center"
          style={{ color: 'var(--color-text-tertiary)' }}
          fontSize="sm"
          border="1px dashed var(--color-border)"
          borderRadius="md"
          mt={2}
        >
          <Text mb={2} fontSize="xs">
            No collections yet
          </Text>
          <Button
            size="sm"
            variant="ghost"
            color="var(--color-blue)"
            _hover={{ bg: 'var(--color-bg-hover)' }}
            onClick={() =>
              showCreateCollection({
                onCreate: async (collectionData) => {
                  try {
                    await createCollection(collectionData)
                  } catch (error) {
                    console.error('Failed to create collection:', error)
                  }
                },
              })
            }
            fontSize="xs"
          >
            Create your first
          </Button>
        </Box>
      )}
    </>
  )
})

CollectionsList.displayName = 'CollectionsList'

export default CollectionsList
