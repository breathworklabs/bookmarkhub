import { Box, Flex, VStack, HStack, Text, Button, Separator } from '@chakra-ui/react'
import { LuArrowLeft, LuShield } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import UnifiedSidebar from '../UnifiedSidebar'

const CookiePolicy = () => {
  const navigate = useNavigate()

  return (
    <DndProvider backend={HTML5Backend}>
      <Flex h="100vh" w="100vw">
        {/* Sidebar */}
        <UnifiedSidebar />

        {/* Main Content */}
        <Flex flex={1} direction="column" w="100%" overflowY="auto" p={8} style={{ background: 'var(--color-bg-primary)' }}>
          <Box maxW="800px" mx="auto" w="100%">
            {/* Back Button */}
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              style={{ color: 'var(--color-text-secondary)' }}
              _hover={{ color: 'var(--color-blue)', bg: 'var(--color-bg-hover)' }}
              _focus={{ boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.2)', outline: 'none' }}
              mb={6}
              size="sm"
            >
              <LuArrowLeft size={18} style={{ marginRight: '8px' }} />
              Back to Bookmarks
            </Button>

            {/* Cookie Policy Card */}
            <Box
              style={{ background: 'var(--color-bg-tertiary)' }}
              borderRadius="12px"
              border="1px solid var(--color-border)"
              overflow="hidden"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
            >
              {/* Header */}
              <HStack p={6} borderBottomWidth="1px" style={{ borderColor: 'var(--color-border)' }}>
                <LuShield size={20} style={{ color: 'var(--color-text-primary)' }} />
                <Text fontSize="lg" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
                  Cookie Policy
                </Text>
                <Text fontSize="sm" style={{ color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                  Last updated: January 2025
                </Text>
              </HStack>

              {/* Content */}
              <VStack alignItems="stretch" p={6} gap={6}>
                {/* Intro */}
                <VStack alignItems="stretch" gap={4}>
                  <Text fontSize="sm" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
                    We use no tracking cookies
                  </Text>
                  <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    X Bookmark Manager is a local-first app. We do not use analytics, advertising, or profiling
                    cookies. We only use essential browser storage (like localStorage or IndexedDB) to keep your
                    preferences and bookmarks on your device.
                  </Text>
                </VStack>

                <Separator />

                {/* What we store */}
                <VStack alignItems="stretch" gap={3}>
                  <HStack gap={2} alignItems="center">
                    <Text fontSize="sm" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
                      What we store locally
                    </Text>
                  </HStack>
                  <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    - Your bookmarks, collections, and tags
                    <br />- View and filter preferences
                    <br />- Consent choice for this notice
                  </Text>
                </VStack>

                <Separator />

                {/* Managing consent */}
                <VStack alignItems="stretch" gap={3}>
                  <HStack gap={2} alignItems="center">
                    <Text fontSize="sm" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
                      Managing your consent
                    </Text>
                  </HStack>
                  <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    You can accept or reject this notice. Rejecting does not limit app functionality since we do not
                    use tracking cookies. Your choice is stored locally and can be changed anytime by clearing the
                    browser storage or returning to this page.
                  </Text>
                </VStack>

                <Separator />

                {/* Contact */}
                <VStack alignItems="stretch" gap={3}>
                  <HStack gap={2} alignItems="center">
                    <Text fontSize="sm" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
                      Questions
                    </Text>
                  </HStack>
                  <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    For any concerns regarding privacy or storage, contact us at{' '}
                    <a href="mailto:hello@breathworklabs.com" style={{ color: 'var(--color-blue)', textDecoration: 'none' }}>
                      hello@breathworklabs.com
                    </a>
                  </Text>
                  <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    <strong>Breathwork Labs</strong>
                    <br />
                    Website:{' '}
                    <a href="https://breathworklabs.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-blue)', textDecoration: 'none' }}>
                      breathworklabs.com
                    </a>
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </DndProvider>
  )
}

export default CookiePolicy
