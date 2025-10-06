import { Box, Flex, VStack, Text, Button, HStack } from '@chakra-ui/react'
import { LuTrash2, LuArrowLeft } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import toast from 'react-hot-toast'
import { useBookmarkStore } from '../store/bookmarkStore'
import UnifiedSidebar from './UnifiedSidebar'

const SettingsPage = () => {
  const navigate = useNavigate()
  const clearAllData = useBookmarkStore((state) => state.clearAllData)

  const handleClearAllData = async () => {
    if (!confirm('Clear all bookmarks and data? This cannot be undone.\n\nYou can re-import bookmarks from the Chrome extension.')) {
      return
    }

    try {
      await clearAllData()
      toast.success('All data cleared successfully')
      // Reload page to show onboarding
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      console.error('Failed to clear data:', error)
      toast.error('Failed to clear data')
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Flex h="100vh" w="100vw">
        {/* Sidebar */}
        <UnifiedSidebar />

      {/* Main Content */}
      <Flex flex={1} direction="column" w="100%" overflowY="auto" p={8} bg="#0a0e1a">
        <Box maxW="800px" mx="auto" w="100%">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            color="#71767b"
            _hover={{ color: '#e1e5e9', bg: '#1c1f26' }}
            mb={6}
            size="sm"
          >
            <LuArrowLeft size={18} style={{ marginRight: '8px' }} />
            Back to Bookmarks
          </Button>

          {/* Settings Card */}
          <Box
            bg="#1c1f26"
            borderRadius="12px"
            border="1px solid #2a2d35"
            overflow="hidden"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
          >
            {/* Header */}
            <HStack p={6} borderBottomWidth="1px" borderColor="#2a2d35">
              <Text fontSize="16px">⚙️</Text>
              <Text fontSize="xl" fontWeight="600" color="#e1e5e9">
                Settings
              </Text>
            </HStack>

            {/* Content */}
            <VStack alignItems="stretch" p={6} gap={6}>
              {/* Data Management Section */}
              <Box>
                <Text fontSize="sm" fontWeight="600" color="#e1e5e9" mb={4}>
                  Data Management
                </Text>

                <Box p={4} bg="#15171c" borderRadius="8px" border="1px solid #2a2d35">
                  <VStack alignItems="stretch" gap={3}>
                    <VStack alignItems="flex-start" gap={1}>
                      <Text fontSize="sm" fontWeight="500" color="#e1e5e9">
                        Clear All Data
                      </Text>
                      <Text fontSize="xs" color="#71767b" lineHeight="1.4">
                        Delete all bookmarks, collections, and settings. This action cannot be undone.
                      </Text>
                    </VStack>

                    <Button
                      onClick={handleClearAllData}
                      size="sm"
                      bg="#dc2626"
                      color="white"
                      _hover={{ bg: '#b91c1c' }}
                      fontWeight="500"
                      fontSize="13px"
                      h="36px"
                    >
                      <LuTrash2 size={16} style={{ marginRight: '8px' }} />
                      Clear All Data
                    </Button>
                  </VStack>
                </Box>
              </Box>

              {/* Info Section */}
              <Box p={3} bg="#15171c" borderRadius="8px" border="1px solid #2a2d35">
                <Text fontSize="xs" color="#71767b" lineHeight="1.6">
                  💡 <strong style={{ color: '#9ca3af' }}>Tip:</strong> After clearing data, you can
                  re-import your bookmarks using the Chrome extension.
                </Text>
              </Box>
            </VStack>
          </Box>
        </Box>
      </Flex>
    </Flex>
    </DndProvider>
  )
}

export default SettingsPage
