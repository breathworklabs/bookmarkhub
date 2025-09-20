import { Box, VStack, HStack, Text, Badge, For } from '@chakra-ui/react'
import { LuMenu, LuStar, LuEye, LuRotateCcw, LuDownload, LuExternalLink, LuSettings } from 'react-icons/lu'
import { theme } from '../styles/theme'

interface SidebarItem {
  icon: React.ComponentType<{ size: number }>
  label: string
  count?: string | null
  badge?: string
  active?: boolean
}

const SidebarMenu = () => {
  const sidebarItems: SidebarItem[] = [
    { icon: LuMenu, label: 'All Bookmarks', count: '2,847', active: true },
    { icon: LuStar, label: 'Starred', count: '156' },
    { icon: LuEye, label: 'Collections', count: null },
    { icon: LuRotateCcw, label: 'AI Insights', badge: 'New' },
    { icon: LuDownload, label: 'Archives', count: null },
    { icon: LuExternalLink, label: 'Shared', count: null },
  ]

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
            {(item, index) => (
              <HStack
                key={index}
                p={3}
                borderRadius="12px"
                cursor="pointer"
                bg={item.active ? '#1d4ed8' : 'transparent'}
                color={item.active ? 'white' : '#71767b'}
                fontSize="14px"
                fontWeight={item.active ? '600' : '500'}
                _hover={{
                  bg: item.active ? '#1e40af' : '#2a2d35',
                  color: item.active ? 'white' : '#e1e5e9'
                }}
                transition="all 0.2s"
              >
                <Box w="18px" h="18px">
                  <item.icon size={18} />
                </Box>
                <Text flex={1}>{item.label}</Text>
                {item.count && (
                  <Badge
                    bg={item.active ? 'rgba(255,255,255,0.2)' : '#2a2d35'}
                    color={item.active ? 'white' : '#9ca3af'}
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
            )}
          </For>
        </VStack>

        {/* Settings */}
        <HStack
          p={3}
          borderRadius="12px"
          cursor="pointer"
          borderTopWidth="1px"
          borderColor="#2a2d35"
          mt="auto"
          color="#71767b"
          fontSize="14px"
          fontWeight="500"
          _hover={{
            bg: '#2a2d35',
            color: '#e1e5e9'
          }}
          transition="all 0.2s"
        >
          <Box w="18px" h="18px">
            <LuSettings size={18} />
          </Box>
          <Text>Settings</Text>
        </HStack>
      </VStack>
    </Box>
  )
}

export default SidebarMenu