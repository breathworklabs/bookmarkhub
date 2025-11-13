import { Box, VStack, HStack, Text, Badge, For } from '@chakra-ui/react'
import { LuMenu, LuExternalLink, LuSettings } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { componentStyles } from '../styles/components'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useModal } from './modals/ModalProvider'
import { useCollectionsStore } from '../store/collectionsStore'
import { logger } from '../lib/logger'
import { APP_NAME } from '../constants/app'

interface SidebarItem {
  icon: React.ComponentType<{ size: number }>
  label: string
  count?: string | null
  badge?: string
}

const SidebarMenu = () => {
  const navigate = useNavigate()
  const activeSidebarItem = useBookmarkStore((state) => state.activeSidebarItem)
  const setActiveSidebarItem = useBookmarkStore(
    (state) => state.setActiveSidebarItem
  )
  // const toggleAIPanel = useBookmarkStore((state) => state.toggleAIPanel) // Hidden for now - will add later
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const { showCreateCollection } = useModal()
  const createCollection = useCollectionsStore(
    (state) => state.createCollection
  )
  const setActiveCollection = useCollectionsStore(
    (state) => state.setActiveCollection
  )

  // Calculate actual counts
  const totalBookmarks = bookmarks.length

  const sidebarItems: SidebarItem[] = [
    {
      icon: LuMenu,
      label: 'All Bookmarks',
      count: totalBookmarks.toLocaleString(),
    },
    { icon: LuMenu, label: 'Collections', count: null },
    // { icon: LuStar, label: 'AI Insights', badge: 'New' }, // Hidden for now - will add later
    { icon: LuExternalLink, label: 'Shared', count: null },
  ]

  const handleItemClick = (item: SidebarItem) => {
    setActiveSidebarItem(item.label)
    // Clear active collection when clicking sidebar navigation items
    setActiveCollection(null)

    // Hidden for now - will add later
    // if (item.label === 'AI Insights') {
    //   toggleAIPanel()
    // } else
    if (item.label === 'Collections') {
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
  }

  return (
    <Box {...componentStyles.container.sidebar}>
      <VStack alignItems="stretch" gap={6} h="full">
        {/* Logo */}
        <HStack
          gap={3}
          pb={4}
          borderBottomWidth="1px"
          style={{ borderColor: 'var(--color-border)' }}
          cursor="pointer"
          onClick={() => navigate('/')}
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
        >
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
          <Text
            fontSize="lg"
            fontWeight="bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {APP_NAME}
          </Text>
        </HStack>

        {/* Navigation */}
        <VStack alignItems="stretch" gap={2} flex={1}>
          <For each={sidebarItems}>
            {(item, index) => {
              const isActive = activeSidebarItem === item.label
              return (
                <HStack
                  key={index}
                  p={3}
                  borderRadius="12px"
                  cursor="pointer"
                  bg={isActive ? 'var(--color-blue)' : 'transparent'}
                  color={isActive ? 'white' : 'var(--color-text-tertiary)'}
                  fontSize="14px"
                  fontWeight={isActive ? '600' : '500'}
                  _hover={{
                    bg: isActive
                      ? 'var(--color-blue-hover)'
                      : 'var(--color-border)',
                    color: isActive ? 'white' : 'var(--color-text-primary)',
                  }}
                  transition="all 0.2s"
                  onClick={() => handleItemClick(item)}
                >
                  <Box w="18px" h="18px">
                    <item.icon size={18} />
                  </Box>
                  <Text flex={1}>{item.label}</Text>
                  {item.count && (
                    <Badge
                      bg={
                        isActive
                          ? 'rgba(255,255,255,0.2)'
                          : 'var(--color-border)'
                      }
                      color={isActive ? 'white' : 'var(--color-text-secondary)'}
                      fontSize="11px"
                      px={2}
                      py={1}
                      borderRadius="6px"
                    >
                      {item.count}
                    </Badge>
                  )}
                  {item.badge && (
                    <Badge
                      style={{ background: 'var(--color-error)' }}
                      color="white"
                      fontSize="10px"
                      px={2}
                      py={1}
                      borderRadius="6px"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </HStack>
              )
            }}
          </For>
        </VStack>

        {/* Settings */}
        <VStack
          alignItems="stretch"
          borderTopWidth="1px"
          style={{ borderColor: 'var(--color-border)' }}
          pt={4}
          mt="auto"
          gap={2}
        >
          <HStack
            p={3}
            borderRadius="12px"
            cursor="pointer"
            style={{ color: 'var(--color-text-tertiary)' }}
            fontSize="14px"
            fontWeight="500"
            _hover={{
              bg: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            transition="all 0.2s"
            onClick={() => navigate('/settings')}
          >
            <Box w="18px" h="18px">
              <LuSettings size={18} />
            </Box>
            <Text>Settings</Text>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  )
}

export default SidebarMenu
