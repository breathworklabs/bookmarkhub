import { Box, VStack, HStack, Text, Badge, For, Button } from '@chakra-ui/react'
import { LuMenu, LuStar, LuDownload, LuExternalLink } from 'react-icons/lu'
import { theme } from '../styles/theme'
import { useBookmarkStore } from '../store/bookmarkStore'
import { SignInModal } from './auth/SignInModal'
import { useState } from 'react'

interface SidebarItem {
  icon: React.ComponentType<{ size: number }>
  label: string
  count?: string | null
  badge?: string
}

const SidebarMenu = () => {
  const activeSidebarItem = useBookmarkStore((state) => state.activeSidebarItem)
  const setActiveSidebarItem = useBookmarkStore((state) => state.setActiveSidebarItem)
  const toggleAIPanel = useBookmarkStore((state) => state.toggleAIPanel)
  const currentUserId = useBookmarkStore((state) => state.currentUserId)
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  const sidebarItems: SidebarItem[] = [
    { icon: LuMenu, label: 'All Bookmarks', count: '2,847' },
    { icon: LuStar, label: 'Starred', count: '156' },
    { icon: LuMenu, label: 'Collections', count: null },
    { icon: LuStar, label: 'AI Insights', badge: 'New' },
    { icon: LuDownload, label: 'Archives', count: null },
    { icon: LuExternalLink, label: 'Shared', count: null },
  ]

  const handleItemClick = (item: SidebarItem) => {
    setActiveSidebarItem(item.label)

    if (item.label === 'AI Insights') {
      toggleAIPanel()
    }
  }

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
                  bg={isActive ? '#1d4ed8' : 'transparent'}
                  color={isActive ? 'white' : '#71767b'}
                  fontSize="14px"
                  fontWeight={isActive ? '600' : '500'}
                  _hover={{
                    bg: isActive ? '#1e40af' : '#2a2d35',
                    color: isActive ? 'white' : '#e1e5e9'
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
                    bg={isActive ? 'rgba(255,255,255,0.2)' : '#2a2d35'}
                    color={isActive ? 'white' : '#9ca3af'}
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
                    bg="#dc2626"
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

        {/* Authentication Status */}
        <VStack alignItems="stretch" borderTopWidth="1px" borderColor="#2a2d35" pt={4} mt="auto">
          {currentUserId ? (
            <HStack
              p={3}
              borderRadius="12px"
              bg="#1a5f3f"
              color="white"
              fontSize="14px"
              fontWeight="500"
            >
              <Text fontSize="16px" mr={2}>👤</Text>
              <VStack alignItems="flex-start" spacing={0} flex={1}>
                <Text fontSize="12px" opacity={0.8}>Signed in</Text>
                <Text fontSize="11px" opacity={0.6}>Real data active</Text>
              </VStack>
            </HStack>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setIsSignInOpen(true)}
              justifyContent="flex-start"
              p={3}
              borderRadius="12px"
              color="#71767b"
              fontSize="14px"
              fontWeight="500"
              _hover={{
                bg: '#2a2d35',
                color: '#e1e5e9'
              }}
            >
              <Text fontSize="16px" mr={2}>🔑</Text>
              Sign In for Real Data
            </Button>
          )}

          {/* Settings */}
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

        <SignInModal open={isSignInOpen} onOpenChange={setIsSignInOpen} />
      </VStack>
    </Box>
  )
}

export default SidebarMenu