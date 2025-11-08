import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Badge,
  Separator,
  For,
  Flex,
} from '@chakra-ui/react'
import {
  LuFolderPlus,
  LuFolder,
  LuStar,
  LuClock,
  LuArchive,
  LuEllipsis,
  LuFolderOpen,
} from 'react-icons/lu'
import { useDrop } from 'react-dnd'
import { useCollectionsStore } from '../../store/collectionsStore'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useEffect } from 'react'
import { ItemTypes, type DragItem, type DropResult } from '../../types/dnd'
import { useIconButtonStyles } from '../../hooks/useStyles'
import { componentStyles } from '../../styles/components'

// Helper component for droppable collection items
const DroppableCollectionItem = ({
  collection,
  isActive,
  getCollectionIcon,
  getCollectionColor,
  getBookmarkCount,
  handleCollectionClick,
  isUserCollection = false,
}: any) => {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.BOOKMARK,
      drop: (): DropResult => ({
        collectionId: collection.id,
        collectionName: collection.name,
      }),
      canDrop: (_item: DragItem) => {
        // Prevent drops on smart collections (except uncategorized)
        if (collection.isSmartCollection && collection.id !== 'uncategorized') {
          return false
        }
        return true
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [collection.id, collection.isSmartCollection]
  )

  const isDropZone = isOver && canDrop
  const isInvalidDrop = isOver && !canDrop

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
          ? '3px dashed var(--color-blue) !important'
          : isInvalidDrop
            ? '3px dashed var(--color-error) !important'
            : '2px solid transparent'
      }
      boxShadow={isDropZone ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : undefined}
      _hover={{
        bg: isActive(collection.id)
          ? 'var(--color-blue-hover)'
          : 'var(--color-border)',
      }}
      onClick={() => handleCollectionClick(collection.id)}
      transition="all 0.2s ease"
    >
      <HStack justify="space-between">
        <HStack gap={isUserCollection ? 3 : 2}>
          {isUserCollection && (
            <Box
              w="16px"
              h="16px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {/* Future: Show expand/collapse for nested collections */}
            </Box>
          )}
          <Box color={getCollectionColor(collection)}>
            {getCollectionIcon(collection)}
          </Box>
          <Text
            fontSize="sm"
            fontWeight="500"
            lineClamp={isUserCollection ? 1 : undefined}
          >
            {collection.name}
          </Text>
        </HStack>
        <HStack gap={1}>
          <Badge
            size="sm"
            bg={
              isActive(collection.id)
                ? 'rgba(255,255,255,0.2)'
                : isUserCollection
                  ? 'var(--color-border)'
                  : 'var(--color-bg-tertiary)'
            }
            color={
              isActive(collection.id) ? 'white' : 'var(--color-text-tertiary)'
            }
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
          >
            {getBookmarkCount(collection.id)}
          </Badge>
          {isUserCollection && (
            <IconButton
              {...useIconButtonStyles()}
              size="xs"
              variant="ghost"
              aria-label="Collection options"
              color={
                isActive(collection.id) ? 'white' : 'var(--color-text-tertiary)'
              }
              _hover={{
                color: isActive(collection.id)
                  ? 'white'
                  : 'var(--color-text-primary)',
                bg: isActive(collection.id)
                  ? 'rgba(255,255,255,0.1)'
                  : '#3a3d45',
              }}
              onClick={(e) => {
                e.stopPropagation()
                // Future: Show context menu
              }}
            >
              <LuEllipsis size={12} />
            </IconButton>
          )}
        </HStack>
      </HStack>
    </Box>
  )
}

const CollectionsSidebar = () => {
  const {
    collections,
    activeCollectionId,
    collectionBookmarks,
    isLoading,
    error,
    loadCollections,
    setActiveCollection,
    setCreatingCollection,
  } = useCollectionsStore()

  const { bookmarks } = useBookmarkStore()

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  const getCollectionIcon = (collection: any) => {
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
  }

  const getCollectionColor = (collection: any) => {
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
  }

  const isActive = (collectionId: string) => {
    return activeCollectionId === collectionId
  }

  const handleCollectionClick = (collectionId: string) => {
    setActiveCollection(isActive(collectionId) ? null : collectionId)
  }

  const getBookmarkCount = (collectionId: string) => {
    // Handle smart collections with dynamic counts
    if (collectionId === 'starred') {
      return bookmarks.filter((bookmark) => bookmark.is_starred === true).length
    }
    if (collectionId === 'archived') {
      return bookmarks.filter((bookmark) => bookmark.is_archived === true)
        .length
    }
    if (collectionId === 'recent') {
      // Recent: bookmarks from last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return bookmarks.filter(
        (bookmark) => new Date(bookmark.created_at) > sevenDaysAgo
      ).length
    }

    // For regular collections, use the collection bookmarks mapping
    return collectionBookmarks[collectionId]?.length || 0
  }

  // Separate collections into categories
  const defaultCollections = collections.filter((c) => c.isDefault)
  const userCollections = collections.filter((c) => !c.isDefault)

  if (error) {
    return (
      <Box
        p={4}
        style={{ background: 'var(--color-bg-primary)' }}
        borderRight="1px solid #2a2d35"
        h="100%"
        w="280px"
      >
        <Text color="var(--color-error)" fontSize="sm">
          Error loading collections: {error}
        </Text>
      </Box>
    )
  }

  return (
    <Box {...componentStyles.container.sidebar} h="100%" overflow="hidden">
      <VStack align="stretch" gap={0} h="100%">
        {/* Header */}
        <Box p={4} borderBottom="1px solid var(--color-border)">
          <HStack justify="space-between" align="center">
            <Text
              fontWeight="600"
              fontSize="md"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Collections
            </Text>
            <IconButton
              {...useIconButtonStyles()}
              size="sm"
              variant="ghost"
              aria-label="Create collection"
              onClick={() => setCreatingCollection(true)}
            >
              <LuFolderPlus size={16} />
            </IconButton>
          </HStack>
        </Box>

        {/* Collections List */}
        <Box flex={1} overflow="auto" p={2}>
          <VStack align="stretch" gap={1}>
            {/* "All Bookmarks" Special Item */}
            <Box
              px={3}
              py={2}
              borderRadius="md"
              cursor="pointer"
              bg={
                isActive('all-bookmarks') ? 'var(--color-blue)' : 'transparent'
              }
              color={
                isActive('all-bookmarks')
                  ? 'white'
                  : 'var(--color-text-primary)'
              }
              _hover={{
                bg: isActive('all-bookmarks')
                  ? 'var(--color-blue-hover)'
                  : 'var(--color-border)',
              }}
              onClick={() => handleCollectionClick('all-bookmarks')}
            >
              <HStack justify="space-between">
                <HStack gap={3}>
                  <Box style={{ color: 'var(--color-text-tertiary)' }}>
                    <LuFolder size={16} />
                  </Box>
                  <Text fontSize="sm" fontWeight="500">
                    All Bookmarks
                  </Text>
                </HStack>
                <Badge
                  size="sm"
                  bg={
                    isActive('all-bookmarks')
                      ? 'rgba(255,255,255,0.2)'
                      : 'var(--color-border)'
                  }
                  color={
                    isActive('all-bookmarks')
                      ? 'white'
                      : 'var(--color-text-tertiary)'
                  }
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {bookmarks.length}
                </Badge>
              </HStack>
            </Box>

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
                      getCollectionColor={getCollectionColor}
                      getBookmarkCount={getBookmarkCount}
                      handleCollectionClick={handleCollectionClick}
                    />
                  )}
                </For>

                {userCollections.length > 0 && (
                  <Separator
                    style={{ borderColor: 'var(--color-border)' }}
                    my={2}
                  />
                )}
              </>
            )}

            {/* User Collections */}
            {userCollections.length > 0 && (
              <For each={userCollections}>
                {(collection) => (
                  <DroppableCollectionItem
                    key={collection.id}
                    collection={collection}
                    isActive={isActive}
                    getCollectionIcon={getCollectionIcon}
                    getCollectionColor={getCollectionColor}
                    getBookmarkCount={getBookmarkCount}
                    handleCollectionClick={handleCollectionClick}
                    isUserCollection={true}
                  />
                )}
              </For>
            )}

            {/* Empty State for User Collections */}
            {userCollections.length === 0 && (
              <Flex
                direction="column"
                align="center"
                justify="center"
                p={6}
                textAlign="center"
                style={{ color: 'var(--color-text-tertiary)' }}
                borderRadius="md"
                mt={3}
                gap={3}
              >
                <Box style={{ color: 'var(--color-blue)' }} fontSize="2xl">
                  <LuFolderOpen />
                </Box>
                <VStack gap={1}>
                  <Text
                    fontSize="sm"
                    fontWeight="500"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    No custom collections
                  </Text>
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    lineHeight="1.4"
                  >
                    Organize your bookmarks by creating custom collections
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  style={{ background: 'var(--color-blue)' }}
                  color="white"
                  _hover={{ bg: 'var(--color-blue-hover)' }}
                  onClick={() => setCreatingCollection(true)}
                  fontSize="xs"
                  px={3}
                  py={2}
                  h="auto"
                >
                  <HStack gap={1}>
                    <LuFolderPlus size={12} />
                    <Text>Create Collection</Text>
                  </HStack>
                </Button>
              </Flex>
            )}
          </VStack>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Box p={4} textAlign="center">
            <Text style={{ color: 'var(--color-text-tertiary)' }} fontSize="sm">
              Loading collections...
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

export default CollectionsSidebar
