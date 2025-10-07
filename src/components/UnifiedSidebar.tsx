import { Box, VStack, HStack, Text, Badge, Separator, IconButton } from '@chakra-ui/react'
import { LuMenu, LuStar, LuExternalLink, LuFolderPlus, LuSettings, LuTrash2 } from 'react-icons/lu'
import { useMemo, useCallback, memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useModal } from './modals/ModalProvider'
import CollectionsList from './collections/CollectionsList'
import { useNavigationStyles, useIconButtonStyles } from '../hooks/useStyles'
import { componentStyles } from '../styles/components'

// Optimized selector for bookmark data
const useBookmarkCounts = () => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)

  return useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    return {
      total: bookmarks.filter(b => !b.is_deleted).length,
      starred: bookmarks.filter(b => b.is_starred && !b.is_deleted).length,
      archived: bookmarks.filter(b => b.is_archived && !b.is_deleted).length,
      deleted: bookmarks.filter(b => b.is_deleted).length,
      recent: bookmarks.filter(b => {
        const date = new Date(b.created_at)
        return date >= weekAgo && !b.is_deleted
      }).length
    }
  }, [bookmarks])
}

const UnifiedSidebar = memo(() => {
  const navigate = useNavigate()
  const location = useLocation()
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
    } else if (label === 'All Bookmarks') {
      navigate('/')
    }
  }, [setActiveSidebarItem, setActiveCollection, toggleAIPanel, navigate])

  // create handler inline where used; remove unused local

  const isActive = useCallback((label: string) => {
    // Check route-based active state first
    if (location.pathname === '/trash') {
      return label === 'Trash'
    }
    if (location.pathname === '/settings') {
      return label === 'Settings'
    }
    // Otherwise use the store's activeSidebarItem
    return activeSidebarItem === label
  }, [activeSidebarItem, location.pathname])

  return (
    <Box {...componentStyles.container.sidebar}>
      <VStack alignItems="stretch" gap={6} h="full">
        {/* Logo */}
        <HStack gap={3} pb={4} borderBottomWidth="1px" style={{ borderColor: 'var(--color-border)' }}>
          <Box
            w={8}
            h={8}
            bg="var(--gradient-brand)"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
          >
            X
          </Box>
          <Text fontSize="lg" fontWeight="bold" style={{ color: 'var(--color-text-primary)' }}>
            BookmarkX
          </Text>
        </HStack>

        {/* Main Navigation */}
        <VStack alignItems="stretch" gap={2}>
          <HStack
            {...useNavigationStyles(isActive('All Bookmarks'))}
            p={3}
            borderRadius="12px"
            cursor="pointer"
            fontSize="14px"
            onClick={() => handleNavItemClick('All Bookmarks')}
          >
            <Box w="18px" h="18px">
              <LuMenu size={18} />
            </Box>
            <Text flex={1}>All Bookmarks</Text>
            <Badge
              bg={isActive('All Bookmarks') ? 'rgba(255,255,255,0.2)' : 'var(--color-border)'}
              color={isActive('All Bookmarks') ? 'white' : 'var(--color-text-secondary)'}
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
        <VStack alignItems="stretch" gap={0} flex={1} minH={0}>
          <Box
            borderTopWidth="1px"
            borderBottomWidth="1px"
            style={{ borderColor: 'var(--color-border)' }}
            mb={2}
          >
            <HStack justify="space-between" align="center" px={3} py={3}>
              <Text
                fontWeight="600"
                fontSize="11px"
                letterSpacing="0.8px"
                textTransform="uppercase"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Collections
              </Text>
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Create collection"
                style={{ color: 'var(--color-text-tertiary)' }}
                _hover={{ bg: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                _focus={{ boxShadow: '0 0 0 2px rgba(29, 78, 216, 0.2)', outline: 'none' }}
                minW="24px"
                h="24px"
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
                <LuFolderPlus size={14} />
              </IconButton>
            </HStack>
          </Box>

          <Box flex={1} overflowY="auto">
            <CollectionsList />
          </Box>
        </VStack>

        {/* Bottom Navigation */}
        <VStack alignItems="stretch" gap={2}>
          <Separator style={{ borderColor: 'var(--color-border)' }} />

          <HStack
            {...useNavigationStyles(isActive('AI Insights'))}
            p={3}
            borderRadius="12px"
            cursor="pointer"
            fontSize="14px"
            onClick={() => handleNavItemClick('AI Insights')}
          >
            <Box w="18px" h="18px">
              <LuStar size={18} />
            </Box>
            <Text flex={1}>AI Insights</Text>
            <Badge
              style={{ background: 'var(--color-error)' }}
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
            bg={isActive('Shared') ? 'var(--color-blue)' : 'transparent'}
            color={isActive('Shared') ? 'white' : 'var(--color-text-tertiary)'}
            fontSize="14px"
            fontWeight={isActive('Shared') ? '600' : '500'}
            _hover={{
              bg: isActive('Shared') ? 'var(--color-blue-hover)' : 'var(--color-border)',
              color: isActive('Shared') ? 'white' : 'var(--color-text-primary)'
            }}
            transition="all 0.2s"
            onClick={() => handleNavItemClick('Shared')}
          >
            <Box w="18px" h="18px">
              <LuExternalLink size={18} />
            </Box>
            <Text flex={1}>Shared</Text>
          </HStack>

          <HStack
            p={3}
            borderRadius="12px"
            cursor="pointer"
            bg={isActive('Trash') ? 'var(--color-blue)' : 'transparent'}
            color={isActive('Trash') ? 'white' : 'var(--color-text-tertiary)'}
            fontSize="14px"
            fontWeight={isActive('Trash') ? '600' : '500'}
            _hover={{
              bg: isActive('Trash') ? 'var(--color-blue-hover)' : 'var(--color-border)',
              color: isActive('Trash') ? 'white' : 'var(--color-text-primary)'
            }}
            transition="all 0.2s"
            onClick={() => {
              setActiveCollection(null)
              navigate('/trash')
            }}
          >
            <Box w="18px" h="18px">
              <LuTrash2 size={18} />
            </Box>
            <Text flex={1}>Trash</Text>
            {bookmarkCounts.deleted > 0 && (
              <Badge
                bg={isActive('Trash') ? 'rgba(255,255,255,0.2)' : 'var(--color-border)'}
                color={isActive('Trash') ? 'white' : 'var(--color-text-secondary)'}
                fontSize="11px"
                px={2}
                py={1}
                borderRadius="6px"
              >
                {bookmarkCounts.deleted}
              </Badge>
            )}
          </HStack>

          {/* Settings */}
          <VStack alignItems="stretch" borderTopWidth="1px" style={{ borderColor: 'var(--color-border)' }} pt={4} gap={2}>
            <HStack
              p={3}
              borderRadius="12px"
              cursor="pointer"
              bg={isActive('Settings') ? 'var(--color-blue)' : 'transparent'}
              color={isActive('Settings') ? 'white' : 'var(--color-text-tertiary)'}
              fontSize="14px"
              fontWeight={isActive('Settings') ? '600' : '500'}
              _hover={{
                bg: isActive('Settings') ? 'var(--color-blue-hover)' : 'var(--color-border)',
                color: isActive('Settings') ? 'white' : 'var(--color-text-primary)'
              }}
              transition="all 0.2s"
              onClick={() => {
                setActiveCollection(null)
                navigate('/settings')
              }}
            >
              <Box w="18px" h="18px">
                <LuSettings size={18} />
              </Box>
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