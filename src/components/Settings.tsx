import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react'
import { LuTrash2, LuArrowLeft } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useBookmarkStore } from '../store/bookmarkStore'

const Settings = () => {
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
    <Box minH="100vh" style={{ background: 'var(--color-bg-primary)' }} p={8}>
      <Box maxW="800px" mx="auto">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          style={{ color: 'var(--color-text-tertiary)' }}
          _hover={{ color: 'var(--color-text-primary)', bg: '#1c1f26' }}
          mb={6}
          fontSize="14px"
        >
          <HStack gap={2}>
            <LuArrowLeft size={18} />
            <Text>Back to Bookmarks</Text>
          </HStack>
        </Button>

        {/* Settings Card */}
        <Box
          style={{ background: 'var(--color-bg-tertiary)' }}
          borderRadius="12px"
          border="1px solid var(--color-border)"
          overflow="hidden"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
        >
          {/* Header */}
          <HStack p={6} borderBottomWidth="1px" style={{ borderColor: 'var(--color-border)' }}>
            <Text fontSize="16px">⚙️</Text>
            <Text fontSize="xl" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
              Settings
            </Text>
          </HStack>

          {/* Content */}
          <VStack alignItems="stretch" p={6} gap={6}>
            {/* Data Management Section */}
            <Box>
              <Text fontSize="sm" fontWeight="600" style={{ color: 'var(--color-text-primary)' }} mb={4}>
                Data Management
              </Text>

              <Box p={4} style={{ background: 'var(--color-bg-secondary)' }} borderRadius="8px" border="1px solid var(--color-border)">
                <VStack alignItems="stretch" gap={3}>
                  <VStack alignItems="flex-start" gap={1}>
                    <Text fontSize="sm" fontWeight="500" style={{ color: 'var(--color-text-primary)' }}>
                      Clear All Data
                    </Text>
                    <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.4">
                      Delete all bookmarks, collections, and settings. This action cannot be undone.
                    </Text>
                  </VStack>

                  <Button
                    onClick={handleClearAllData}
                    size="sm"
                    style={{ background: 'var(--color-error)' }}
                    color="white"
                    _hover={{ bg: 'var(--color-error-hover)' }}
                    fontWeight="500"
                    fontSize="13px"
                    h="36px"
                  >
                    <HStack gap={2}>
                      <LuTrash2 size={16} />
                      <Text>Clear All Data</Text>
                    </HStack>
                  </Button>
                </VStack>
              </Box>
            </Box>

            {/* Info Section */}
            <Box p={3} style={{ background: 'var(--color-bg-secondary)' }} borderRadius="8px" border="1px solid var(--color-border)">
              <Text fontSize="xs" style={{ color: 'var(--color-text-tertiary)' }} lineHeight="1.6">
                💡 <strong style={{ color: 'var(--color-text-secondary)' }}>Tip:</strong> After clearing data, you can
                re-import your bookmarks using the Chrome extension.
              </Text>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  )
}

export default Settings
