import { Box, VStack, HStack, Text, Badge, Separator, IconButton } from '@chakra-ui/react'
import { LuMenu, LuStar, LuDownload, LuExternalLink, LuFolderPlus } from 'react-icons/lu'
import { useMemo, useCallback, memo } from 'react'
import { theme } from '../styles/theme'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useModal } from './modals/ModalProvider'
import CollectionsList from './collections/CollectionsList'

// Optimized selector for bookmark data
const useBookmarkCounts = () => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)

  return useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    return {
      total: bookmarks.length,
      starred: bookmarks.filter(b => b.is_starred).length,
      archived: bookmarks.filter(b => b.is_archived).length,
      recent: bookmarks.filter(b => {
        const date = new Date(b.created_at)
        return date >= weekAgo
      }).length
    }
  }, [bookmarks])
}

const UnifiedSidebar = memo(() => {
  const activeSidebarItem = useBookmarkStore((state) => state.activeSidebarItem)
  const setActiveSidebarItem = useBookmarkStore((state) => state.setActiveSidebarItem)
  const toggleAIPanel = useBookmarkStore((state) => state.toggleAIPanel)
  const bookmarkCounts = useBookmarkCounts()
  const { showCreateCollection } = useModal()
  const createCollection = useCollectionsStore((state) => state.createCollection)
  const setActiveCollection = useCollectionsStore((state) => state.setActiveCollection)

  // Memoized event handlers
  const handleNavItemClick = useCallback((label: string) => {
    setActiveSidebarItem(label)
    // Clear active collection when clicking sidebar navigation items
    setActiveCollection(null)

    if (label === 'AI Insights') {
      toggleAIPanel()
    }
  }, [setActiveSidebarItem, setActiveCollection, toggleAIPanel])

  const handleCreateCollection = useCallback(() => {
    showCreateCollection({
      onCreate: (collection) => createCollection(collection)
    })
  }, [showCreateCollection, createCollection])

  const isActive = useCallback((label: string) => activeSidebarItem === label, [activeSidebarItem])

  return (
    <Box {...theme.styles.container.sidebar}>
      <VStack alignItems="stretch" gap={6} h="full">
        {/* Logo */}
        <HStack gap={3} pb={4} borderBottomWidth="1px" borderColor="#2a2d35">
          <Box
            w={8}
            h={8}
            bg="linear-gradient(135deg, #1DA1F2, #8B5CF6)"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
          >
            X
          </Box>
          <Text fontSize="lg" fontWeight="bold" color="#e1e5e9">
            BookmarkX
          </Text>
        </HStack>

        {/* Main Navigation */}
        <VStack alignItems="stretch" gap={2}>
          <HStack
            p={3}
            borderRadius="12px"
            cursor="pointer"
            bg={isActive('All Bookmarks') ? '#1d4ed8' : 'transparent'}
            color={isActive('All Bookmarks') ? 'white' : '#71767b'}
            fontSize="14px"
            fontWeight={isActive('All Bookmarks') ? '600' : '500'}
            _hover={{
              bg: isActive('All Bookmarks') ? '#1e40af' : '#2a2d35',
              color: isActive('All Bookmarks') ? 'white' : '#e1e5e9'
            }}
            transition="all 0.2s"
            onClick={() => handleNavItemClick('All Bookmarks')}
          >
            <Box w="18px" h="18px">
              <LuMenu size={18} />
            </Box>
            <Text flex={1}>All Bookmarks</Text>
            <Badge
              bg={isActive('All Bookmarks') ? 'rgba(255,255,255,0.2)' : '#2a2d35'}
              color={isActive('All Bookmarks') ? 'white' : '#9ca3af'}
              fontSize="11px"
              px={2}
              py={1}
              borderRadius="6px"
            >
              {bookmarkCounts.total.toLocaleString()}
            </Badge>
          </HStack>
        </VStack>

        {/* Collections Section */}
        <VStack alignItems="stretch" gap={0} flex={1}>
          <HStack justify="space-between" align="center" px={3} py={2}>
            <Text fontWeight="600" fontSize="14px" color="#e1e5e9">
              Collections
            </Text>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Create collection"
              color="#71767b"
              _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
              onClick={() => showCreateCollection({
                onCreate: async (collectionData) => {
                  try {
                    await createCollection(collectionData)
                  } catch (error) {
                    console.error('Failed to create collection:', error)
                  }
                }
              })}
            >
              <LuFolderPlus size={16} />
            </IconButton>
          </HStack>

          <Box flex={1} overflowY="auto">
            <CollectionsList />
          </Box>
        </VStack>

        {/* Bottom Navigation */}
        <VStack alignItems="stretch" gap={2}>
          <Separator borderColor="#2a2d35" />

          <HStack
            p={3}
            borderRadius="12px"
            cursor="pointer"
            bg={isActive('AI Insights') ? '#1d4ed8' : 'transparent'}
            color={isActive('AI Insights') ? 'white' : '#71767b'}
            fontSize="14px"
            fontWeight={isActive('AI Insights') ? '600' : '500'}
            _hover={{
              bg: isActive('AI Insights') ? '#1e40af' : '#2a2d35',
              color: isActive('AI Insights') ? 'white' : '#e1e5e9'
            }}
            transition="all 0.2s"
            onClick={() => handleNavItemClick('AI Insights')}
          >
            <Box w="18px" h="18px">
              <LuStar size={18} />
            </Box>
            <Text flex={1}>AI Insights</Text>
            <Badge
              bg="#dc2626"
              color="white"
              fontSize="10px"
              px={2}
              py={1}
              borderRadius="6px"
            >
              New
            </Badge>
          </HStack>


          <HStack
            p={3}
            borderRadius="12px"
            cursor="pointer"
            bg={isActive('Shared') ? '#1d4ed8' : 'transparent'}
            color={isActive('Shared') ? 'white' : '#71767b'}
            fontSize="14px"
            fontWeight={isActive('Shared') ? '600' : '500'}
            _hover={{
              bg: isActive('Shared') ? '#1e40af' : '#2a2d35',
              color: isActive('Shared') ? 'white' : '#e1e5e9'
            }}
            transition="all 0.2s"
            onClick={() => handleNavItemClick('Shared')}
          >
            <Box w="18px" h="18px">
              <LuExternalLink size={18} />
            </Box>
            <Text flex={1}>Shared</Text>
          </HStack>

          {/* Settings */}
          <VStack alignItems="stretch" borderTopWidth="1px" borderColor="#2a2d35" pt={4}>
            <HStack
              p={3}
              borderRadius="12px"
              cursor="pointer"
              color="#71767b"
              fontSize="14px"
              fontWeight="500"
              _hover={{
                bg: '#2a2d35',
                color: '#e1e5e9'
              }}
              transition="all 0.2s"
            >
              <Text fontSize="16px" mr={2}>⚙️</Text>
              <Text>Settings</Text>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    </Box>
  )
})

UnifiedSidebar.displayName = 'UnifiedSidebar'

export default UnifiedSidebar