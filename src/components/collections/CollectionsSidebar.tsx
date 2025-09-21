import { Box, VStack, HStack, Text, Button, IconButton, Badge, Separator, For, Flex } from '@chakra-ui/react'
import { LuFolderPlus, LuFolder, LuStar, LuClock, LuArchive, LuEllipsis, LuFolderOpen } from 'react-icons/lu'
import { useCollectionsStore } from '../../store/collectionsStore'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useEffect } from 'react'

const CollectionsSidebar = () => {
  const {
    collections,
    activeCollectionId,
    collectionBookmarks,
    isLoading,
    error,
    loadCollections,
    setActiveCollection,
    setCreatingCollection
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
    setActiveCollection(isActive(collectionId) ? null : collectionId)
  }

  const getBookmarkCount = (collectionId: string) => {
    // Handle smart collections with dynamic counts
    if (collectionId === 'starred') {
      return bookmarks.filter(bookmark => bookmark.is_starred).length
    }
    if (collectionId === 'archived') {
      return bookmarks.filter(bookmark => bookmark.is_archived).length
    }
    if (collectionId === 'recent') {
      // Recent: bookmarks from last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return bookmarks.filter(bookmark =>
        new Date(bookmark.created_at) > sevenDaysAgo
      ).length
    }

    // For regular collections, use the collection bookmarks mapping
    return collectionBookmarks[collectionId]?.length || 0
  }

  // Separate collections into categories
  const defaultCollections = collections.filter(c => c.isDefault)
  const userCollections = collections.filter(c => !c.isDefault)

  if (error) {
    return (
      <Box p={4} bg="#0f1419" borderRight="1px solid #2a2d35" h="100%" w="280px">
        <Text color="#ef4444" fontSize="sm">
          Error loading collections: {error}
        </Text>
      </Box>
    )
  }

  return (
    <Box bg="#0f1419" borderRight="1px solid #2a2d35" h="100%" w="280px" overflow="hidden">
      <VStack align="stretch" gap={0} h="100%">
        {/* Header */}
        <Box p={4} borderBottom="1px solid #2a2d35">
          <HStack justify="space-between" align="center">
            <Text fontWeight="600" fontSize="md" color="#e1e5e9">
              Collections
            </Text>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Create collection"
              color="#71767b"
              _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
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
              bg={isActive('all-bookmarks') ? '#1d4ed8' : 'transparent'}
              color={isActive('all-bookmarks') ? 'white' : '#e1e5e9'}
              _hover={{
                bg: isActive('all-bookmarks') ? '#1e40af' : '#2a2d35'
              }}
              onClick={() => handleCollectionClick('all-bookmarks')}
            >
              <HStack justify="space-between">
                <HStack gap={3}>
                  <Box color="#71767b">
                    <LuFolder size={16} />
                  </Box>
                  <Text fontSize="sm" fontWeight="500">
                    All Bookmarks
                  </Text>
                </HStack>
                <Badge
                  size="sm"
                  bg={isActive('all-bookmarks') ? 'rgba(255,255,255,0.2)' : '#2a2d35'}
                  color={isActive('all-bookmarks') ? 'white' : '#71767b'}
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

                {userCollections.length > 0 && (
                  <Separator borderColor="#2a2d35" my={2} />
                )}
              </>
            )}

            {/* User Collections */}
            {userCollections.length > 0 && (
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
                        {/* Expand/Collapse Button (for future nested collections) */}
                        <Box w="16px" h="16px" display="flex" alignItems="center" justifyContent="center">
                          {/* Future: Show expand/collapse for nested collections */}
                        </Box>
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
            )}

            {/* Empty State for User Collections */}
            {userCollections.length === 0 && (
              <Flex
                direction="column"
                align="center"
                justify="center"
                p={6}
                textAlign="center"
                color="#71767b"
                borderRadius="md"
                mt={3}
                gap={3}
              >
                <Box color="#3b82f6" fontSize="2xl">
                  <LuFolderOpen />
                </Box>
                <VStack gap={1}>
                  <Text fontSize="sm" fontWeight="500" color="#e1e5e9">
                    No custom collections
                  </Text>
                  <Text fontSize="xs" color="#71767b" lineHeight="1.4">
                    Organize your bookmarks by creating custom collections
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  bg="#1d4ed8"
                  color="white"
                  _hover={{ bg: '#1e40af' }}
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
            <Text color="#71767b" fontSize="sm">
              Loading collections...
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

export default CollectionsSidebar