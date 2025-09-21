import { Box, VStack, HStack, Text, Button, IconButton, Badge, For } from '@chakra-ui/react'
import { LuFolder, LuStar, LuClock, LuArchive, LuEllipsis } from 'react-icons/lu'
import { useCollectionsStore } from '../../store/collectionsStore'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useModal } from '../modals/ModalProvider'

const CollectionsList = () => {
  const {
    collections,
    activeCollectionId,
    collectionBookmarks,
    isLoading,
    error,
    setActiveCollection,
    createCollection
  } = useCollectionsStore()

  const setActiveSidebarItem = useBookmarkStore((state) => state.setActiveSidebarItem)
  const { showCreateCollection } = useModal()

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
          return '#3b82f6'
        case 'archived':
          return '#6b7280'
        default:
          return '#71767b'
      }
    }
    return collection.color || '#71767b'
  }

  const isActive = (collectionId: string) => {
    return activeCollectionId === collectionId
  }

  const handleCollectionClick = (collectionId: string) => {
    const newActiveId = isActive(collectionId) ? null : collectionId
    setActiveCollection(newActiveId)

    // Also update the main sidebar state to show we're in collections mode
    if (newActiveId) {
      setActiveSidebarItem('Collections')
    } else {
      setActiveSidebarItem('All Bookmarks')
    }
  }

  const getBookmarkCount = (collectionId: string) => {
    return collectionBookmarks[collectionId]?.length || 0
  }

  // Separate collections into categories
  const defaultCollections = collections.filter(c => c.isDefault)
  const userCollections = collections.filter(c => !c.isDefault)

  if (error) {
    return (
      <Box p={3}>
        <Text color="#ef4444" fontSize="sm">
          Error: {error}
        </Text>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box p={3} textAlign="center">
        <Text color="#71767b" fontSize="sm">
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
              <Box
                key={collection.id}
                px={3}
                py={2}
                borderRadius="md"
                cursor="pointer"
                bg={isActive(collection.id) ? '#1d4ed8' : 'transparent'}
                color={isActive(collection.id) ? 'white' : '#e1e5e9'}
                _hover={{
                  bg: isActive(collection.id) ? '#1e40af' : '#2a2d35'
                }}
                onClick={() => handleCollectionClick(collection.id)}
              >
                <HStack justify="space-between">
                  <HStack gap={3}>
                    <Box color={getCollectionColor(collection)}>
                      {getCollectionIcon(collection)}
                    </Box>
                    <Text fontSize="sm" fontWeight="500">
                      {collection.name}
                    </Text>
                  </HStack>
                  <Badge
                    size="sm"
                    bg={isActive(collection.id) ? 'rgba(255,255,255,0.2)' : '#2a2d35'}
                    color={isActive(collection.id) ? 'white' : '#71767b'}
                    fontSize="xs"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {getBookmarkCount(collection.id)}
                  </Badge>
                </HStack>
              </Box>
            )}
          </For>
        </>
      )}

      {/* User Collections */}
      {userCollections.length > 0 && (
        <>
          {defaultCollections.length > 0 && (
            <Box h="1px" bg="#2a2d35" my={2} />
          )}
          <For each={userCollections}>
            {(collection) => (
              <Box
                key={collection.id}
                px={3}
                py={2}
                borderRadius="md"
                cursor="pointer"
                bg={isActive(collection.id) ? '#1d4ed8' : 'transparent'}
                color={isActive(collection.id) ? 'white' : '#e1e5e9'}
                _hover={{
                  bg: isActive(collection.id) ? '#1e40af' : '#2a2d35'
                }}
                onClick={() => handleCollectionClick(collection.id)}
              >
                <HStack justify="space-between">
                  <HStack gap={3}>
                    <Box color={getCollectionColor(collection)}>
                      {getCollectionIcon(collection)}
                    </Box>
                    <Text fontSize="sm" fontWeight="500" lineClamp={1}>
                      {collection.name}
                    </Text>
                  </HStack>
                  <HStack gap={1}>
                    <Badge
                      size="sm"
                      bg={isActive(collection.id) ? 'rgba(255,255,255,0.2)' : '#2a2d35'}
                      color={isActive(collection.id) ? 'white' : '#71767b'}
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {getBookmarkCount(collection.id)}
                    </Badge>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      aria-label="Collection options"
                      color={isActive(collection.id) ? 'white' : '#71767b'}
                      _hover={{
                        color: isActive(collection.id) ? 'white' : '#e1e5e9',
                        bg: isActive(collection.id) ? 'rgba(255,255,255,0.1)' : '#3a3d45'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        // Future: Show context menu
                      }}
                    >
                      <LuEllipsis size={12} />
                    </IconButton>
                  </HStack>
                </HStack>
              </Box>
            )}
          </For>
        </>
      )}

      {/* Empty State for User Collections */}
      {userCollections.length === 0 && (
        <Box
          p={3}
          textAlign="center"
          color="#71767b"
          fontSize="sm"
          border="1px dashed #2a2d35"
          borderRadius="md"
          mt={2}
        >
          <Text mb={2} fontSize="xs">No collections yet</Text>
          <Button
            size="sm"
            variant="ghost"
            color="#1d4ed8"
            _hover={{ bg: '#2a2d35' }}
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
}

export default CollectionsList