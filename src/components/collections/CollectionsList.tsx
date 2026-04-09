import { Box, Text, Button } from '@chakra-ui/react'
import { useMemo, memo } from 'react'
import { useCollectionsStore } from '@/store/collectionsStore'
import { useModal } from '@/components/modals/ModalProvider'
import { CollectionTree } from './tree/CollectionTree'
import { useCollectionNavigation } from '@/hooks/useCollectionNavigation'
import { logger } from '@/lib/logger'

const CollectionsList = memo(() => {
  const collections = useCollectionsStore((s) => s.collections)
  const activeCollectionId = useCollectionsStore((s) => s.activeCollectionId)
  const collectionBookmarks = useCollectionsStore((s) => s.collectionBookmarks)
  const expandedCollections = useCollectionsStore((s) => s.expandedCollections)
  const isLoading = useCollectionsStore((s) => s.isLoading)
  const error = useCollectionsStore((s) => s.error)
  const toggleCollectionExpansion = useCollectionsStore(
    (s) => s.toggleCollectionExpansion
  )
  const createCollection = useCollectionsStore((s) => s.createCollection)

  const handleCollectionClick = useCollectionNavigation()
  const { showCreateCollection } = useModal()

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
                    logger.error('Failed to create collection', { error })
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
