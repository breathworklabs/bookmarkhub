import { Box, VStack, HStack, Text, Button, Badge, For } from '@chakra-ui/react'
import { LuFolder, LuStar, LuClock, LuArchive } from 'react-icons/lu'
import { useMemo, useCallback, memo } from 'react'
import { useDrop } from 'react-dnd'
import { useNavigate } from 'react-router-dom'
import { useCollectionsStore } from '../../store/collectionsStore'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useModal } from '../modals/ModalProvider'
import { ItemTypes, type DragItem, type DropResult } from '../../types/dnd'

// Helper component for droppable collection items
const DroppableCollectionItem = ({
  collection,
  isActive,
  getCollectionIcon,
  getCollectionColor,
  getBookmarkCount,
  handleCollectionClick
}: any) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.BOOKMARK,
    drop: (): DropResult => ({
      collectionId: collection.id,
      collectionName: collection.name
    }),
    canDrop: (item: DragItem) => {
      // Prevent drops on smart collections (except uncategorized)
      if (collection.isSmartCollection && collection.id !== 'uncategorized') {
        return false
      }

      // Prevent duplicate: check if bookmark is already in this collection
      const bookmarkCollections = (item.bookmark as any).collections || []
      if (bookmarkCollections.includes(collection.id)) {
        return false
      }

      return true
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [collection.id, collection.isSmartCollection])

  const isDropZone = isOver && canDrop
  const isInvalidDrop = isOver && !canDrop

  // Determine the type of invalid drop for better visual feedback
  const getInvalidDropType = () => {
    if (!isInvalidDrop) return null

    if (collection.isSmartCollection && collection.id !== 'uncategorized') {
      return 'smart-collection'
    }

    // For duplicate detection, we need to access the current drag item
    // This will be determined in the visual feedback below
    return 'duplicate'
  }


  return (
    <Box
      ref={drop}
      key={collection.id}
      px={3}
      py={2}
      borderRadius="md"
      cursor="pointer"
      bg={
        isDropZone
          ? 'var(--color-blue) !important'
          : isActive(collection.id)
            ? 'var(--color-blue)'
            : 'transparent'
      }
      color={isActive(collection.id) ? 'white' : 'var(--color-text-primary)'}
      border={
        isDropZone
          ? '3px dashed #3b82f6 !important'
          : isInvalidDrop
            ? getInvalidDropType() === 'smart-collection'
              ? '3px dashed #f59e0b !important'  // Orange for smart collections
              : '3px dashed #ef4444 !important'  // Red for duplicates
            : '2px solid transparent'
      }
      boxShadow={
        isDropZone
          ? '0 0 0 2px rgba(59, 130, 246, 0.5)'
          : undefined
      }
      _hover={{
        bg: isActive(collection.id) ? 'var(--color-blue-hover)' : 'var(--color-border)'
      }}
      onClick={() => handleCollectionClick(collection.id)}
      transition="all 0.2s ease"
    >
      <HStack justify="space-between" align="center">
        <HStack gap={2} align="center" flex={1} minW={0}>
          <Box color={getCollectionColor(collection, isActive(collection.id))} flexShrink={0}>
            {getCollectionIcon(collection)}
          </Box>
          <Text
            fontSize="sm"
            fontWeight="500"
            truncate
            flex={1}
          >
            {collection.name}
          </Text>
        </HStack>
        <HStack gap={1} flexShrink={0}>
          <Badge
            bg={isActive(collection.id) ? 'rgba(255,255,255,0.2)' : 'var(--color-border)'}
            color={isActive(collection.id) ? 'white' : 'var(--color-text-secondary)'}
            fontSize="11px"
            px={2}
            py={1}
            borderRadius="6px"
          >
            {getBookmarkCount(collection.id)}
          </Badge>
        </HStack>
      </HStack>
    </Box>
  )
}

const CollectionsList = memo(() => {
  const {
    collections,
    activeCollectionId,
    collectionBookmarks,
    isLoading,
    error,
    setActiveCollection,
    createCollection
  } = useCollectionsStore()

  const navigate = useNavigate()
  const setActiveSidebarItem = useBookmarkStore((state) => state.setActiveSidebarItem)
  const activeSidebarItem = useBookmarkStore((state) => state.activeSidebarItem)
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const { showCreateCollection } = useModal()

  // Memoized bookmark counts for smart collections
  const smartCollectionCounts = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return {
      starred: bookmarks.filter(bookmark => bookmark.is_starred).length,
      archived: bookmarks.filter(bookmark => bookmark.is_archived).length,
      recent: bookmarks.filter(bookmark =>
        new Date(bookmark.created_at) > sevenDaysAgo
      ).length
    }
  }, [bookmarks])

  // Memoized helper functions
  const getCollectionIcon = useCallback((collection: any) => {
    if (collection.isSmartCollection) {
      switch (collection.id) {
        case 'starred':
          return <LuStar size={16} />
        case 'recent':
          return <LuClock size={16} />
        case 'archived':
          return <LuArchive size={16} />
        default:
          return <LuFolder size={16} />
      }
    }
    return <LuFolder size={16} />
  }, [])

  const getCollectionColor = useCallback((collection: any, isActiveCollection: boolean = false) => {
    // If collection is active, always use white for visibility
    if (isActiveCollection) {
      return 'white'
    }

    if (collection.isSmartCollection) {
      switch (collection.id) {
        case 'starred':
          return '#ffd700'
        case 'recent':
          return 'var(--color-blue)'
        case 'archived':
          return 'var(--color-text-tertiary)'
        default:
          return 'var(--color-text-tertiary)'
      }
    }
    return collection.color || 'var(--color-text-tertiary)'
  }, [])

  const isActive = useCallback((collectionId: string) => {
    return activeSidebarItem === 'Collections' && activeCollectionId === collectionId
  }, [activeSidebarItem, activeCollectionId])

  const handleCollectionClick = useCallback((collectionId: string) => {
    const newActiveId = isActive(collectionId) ? null : collectionId
    setActiveCollection(newActiveId)

    // Navigate to home page when clicking collections
    navigate('/')

    // Also update the main sidebar state to show we're in collections mode
    if (newActiveId) {
      setActiveSidebarItem('Collections')
    } else {
      setActiveSidebarItem('All Bookmarks')
    }
  }, [isActive, setActiveCollection, setActiveSidebarItem, navigate])

  const getBookmarkCount = useCallback((collectionId: string) => {
    // Handle smart collections with pre-calculated counts
    if (collectionId === 'starred') {
      return smartCollectionCounts.starred
    }
    if (collectionId === 'archived') {
      return smartCollectionCounts.archived
    }
    if (collectionId === 'recent') {
      return smartCollectionCounts.recent
    }

    // For regular collections, use the collection bookmarks mapping
    return collectionBookmarks[collectionId]?.length || 0
  }, [smartCollectionCounts, collectionBookmarks])

  // Memoized collection categories
  const { defaultCollections, userCollections } = useMemo(() => ({
    defaultCollections: collections.filter(c => c.isDefault),
    userCollections: collections.filter(c => !c.isDefault)
  }), [collections])

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
    <VStack align="stretch" gap={1} px={2}>
      {/* Default Collections */}
      {defaultCollections.length > 0 && (
        <>
          <For each={defaultCollections}>
            {(collection) => (
              <DroppableCollectionItem
                key={collection.id}
                collection={collection}
                isActive={isActive}
                getCollectionIcon={getCollectionIcon}
                getCollectionColor={(collection: any) => getCollectionColor(collection, isActive(collection.id))}
                getBookmarkCount={getBookmarkCount}
                handleCollectionClick={handleCollectionClick}
              />
            )}
          </For>
        </>
      )}

      {/* User Collections */}
      {userCollections.length > 0 && (
        <>
          {defaultCollections.length > 0 && (
            <Box h="1px" style={{ background: 'var(--color-border)' }} my={2} />
          )}
          <For each={userCollections}>
            {(collection) => (
              <DroppableCollectionItem
                key={collection.id}
                collection={collection}
                isActive={isActive}
                getCollectionIcon={getCollectionIcon}
                getCollectionColor={(collection: any) => getCollectionColor(collection, isActive(collection.id))}
                getBookmarkCount={getBookmarkCount}
                handleCollectionClick={handleCollectionClick}
              />
            )}
          </For>
        </>
      )}

      {/* Empty State for User Collections */}
      {userCollections.length === 0 && (
        <Box
          p={3}
          textAlign="center"
          style={{ color: 'var(--color-text-tertiary)' }}
          fontSize="sm"
          border="1px dashed #2a2d35"
          borderRadius="md"
          mt={2}
        >
          <Text mb={2} fontSize="xs">No collections yet</Text>
          <Button
            size="sm"
            variant="ghost"
            color="var(--color-blue)"
            _hover={{ bg: 'var(--color-bg-hover)' }}
            onClick={() => showCreateCollection({
              onCreate: async (collectionData) => {
                try {
                  await createCollection(collectionData)
                } catch (error) {
                  console.error('Failed to create collection:', error)
                }
              }
            })}
            fontSize="xs"
          >
            Create your first
          </Button>
        </Box>
      )}
    </VStack>
  )
})

CollectionsList.displayName = 'CollectionsList'

export default CollectionsList