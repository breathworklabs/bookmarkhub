import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'
import {
  LuFolderTree,
  LuTag,
  LuSearch,
  LuDownload,
  LuSquare,
  LuSquareCheck,
  LuX,
} from 'react-icons/lu'
import { useSettingsStore } from '@/store/settingsStore'
import { useChecklistStatus } from '@/hooks/useChecklistStatus'

export const GettingStartedGuide = () => {
  const { itemsArray, completedCount, totalCount, progressPercentage } =
    useChecklistStatus()
  const toggleChecklistItem = useSettingsStore((s) => s.toggleChecklistItem)
  const checklistDismissed = useSettingsStore(
    (s) => s.onboarding.checklistDismissed
  )
  const setChecklistDismissed = useSettingsStore((s) => s.setChecklistDismissed)

  return (
    <VStack alignItems="stretch" gap={6}>
      {/* Welcome Section */}
      <Box>
        <Text
          fontSize="xl"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Welcome to BookmarkHub
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
          mb={4}
        >
          BookmarkHub is a privacy-focused bookmark management tool designed
          specifically for X/Twitter content. All your data stays on your device
          - no servers, no tracking, complete privacy.
        </Text>
        <Alert.Root status="success" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={1}>
            <Alert.Title>100% Privacy Guaranteed</Alert.Title>
            <Alert.Description>
              <Text fontSize="sm" lineHeight="1.6">
                Your bookmarks are stored locally in your browser. We never
                collect, store, or share your data. No account needed!
              </Text>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>

      {/* Key Features */}
      <Box
        p={1}
        style={{ background: 'var(--color-border)' }}
        borderRadius="8px"
      />

      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Key Features
        </Text>
        <VStack alignItems="stretch" gap={3}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <HStack gap={3} alignItems="flex-start">
              <LuFolderTree
                size={20}
                style={{ color: 'var(--color-blue)', marginTop: '2px' }}
              />
              <VStack alignItems="stretch" gap={1}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Collections & Organization
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Create nested collections to organize bookmarks into
                  hierarchical structures
                </Text>
              </VStack>
            </HStack>
          </Box>

          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <HStack gap={3} alignItems="flex-start">
              <LuTag
                size={20}
                style={{ color: 'var(--color-blue)', marginTop: '2px' }}
              />
              <VStack alignItems="stretch" gap={1}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Smart Tagging
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  AI-powered tag suggestions using NLP to automatically
                  categorize bookmarks
                </Text>
              </VStack>
            </HStack>
          </Box>

          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <HStack gap={3} alignItems="flex-start">
              <LuSearch
                size={20}
                style={{ color: 'var(--color-blue)', marginTop: '2px' }}
              />
              <VStack alignItems="stretch" gap={1}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Powerful Search & Filters
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Full-text search with advanced filters for author, domain,
                  date range, and content type
                </Text>
              </VStack>
            </HStack>
          </Box>

          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <HStack gap={3} alignItems="flex-start">
              <LuDownload
                size={20}
                style={{ color: 'var(--color-blue)', marginTop: '2px' }}
              />
              <VStack alignItems="stretch" gap={1}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Import & Export
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Import from X/Twitter, export to JSON, CSV, or HTML for data
                  portability
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </Box>

      {/* Quick Start Guide */}
      <Box
        p={1}
        style={{ background: 'var(--color-border)' }}
        borderRadius="8px"
      />

      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Quick Start Guide
        </Text>

        {/* Step 1: Import */}
        <VStack alignItems="stretch" gap={4}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <HStack gap={3} alignItems="flex-start">
              <Box
                w="24px"
                h="24px"
                borderRadius="50%"
                style={{ background: 'var(--color-blue)' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Text fontSize="xs" fontWeight="600" color="white">
                  1
                </Text>
              </Box>
              <VStack alignItems="stretch" gap={2} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Import Your Bookmarks
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  Install the BookmarkHub Chrome extension to import your
                  X/Twitter bookmarks automatically. Alternatively, you can
                  manually upload a JSON file. Click the "Import" button in the
                  header to get started.
                </Text>
                <Box
                  mt={2}
                  p={4}
                  style={{ background: 'var(--color-bg-primary)' }}
                  borderRadius="6px"
                  border="1px dashed var(--color-border)"
                  textAlign="center"
                >
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    [GIF: Import process from header button]
                  </Text>
                </Box>
              </VStack>
            </HStack>
          </Box>

          {/* Step 2: Collections */}
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <HStack gap={3} alignItems="flex-start">
              <Box
                w="24px"
                h="24px"
                borderRadius="50%"
                style={{ background: 'var(--color-blue)' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Text fontSize="xs" fontWeight="600" color="white">
                  2
                </Text>
              </Box>
              <VStack alignItems="stretch" gap={2} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Organize with Collections
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  Create your first collection to organize bookmarks. In the
                  sidebar, click "+ New Collection" and give it a name like "Web
                  Development" or "Reading List".
                </Text>
                <Box
                  mt={2}
                  p={4}
                  style={{ background: 'var(--color-bg-primary)' }}
                  borderRadius="6px"
                  border="1px dashed var(--color-border)"
                  textAlign="center"
                >
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    [Screenshot: Creating a collection in sidebar]
                  </Text>
                </Box>
              </VStack>
            </HStack>
          </Box>

          {/* Step 3: Tags */}
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <HStack gap={3} alignItems="flex-start">
              <Box
                w="24px"
                h="24px"
                borderRadius="50%"
                style={{ background: 'var(--color-blue)' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Text fontSize="xs" fontWeight="600" color="white">
                  3
                </Text>
              </Box>
              <VStack alignItems="stretch" gap={2} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Add Tags for Flexibility
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  Use tags for cross-cutting categorization. Click on any
                  bookmark and add tags like "react", "tutorial", or
                  "inspiration". Try the "Suggest Tags" feature for AI-powered
                  recommendations!
                </Text>
                <Box
                  mt={2}
                  p={4}
                  style={{ background: 'var(--color-bg-primary)' }}
                  borderRadius="6px"
                  border="1px dashed var(--color-border)"
                  textAlign="center"
                >
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    [GIF: Adding tags with smart suggestions]
                  </Text>
                </Box>
              </VStack>
            </HStack>
          </Box>

          {/* Step 4: Search */}
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <HStack gap={3} alignItems="flex-start">
              <Box
                w="24px"
                h="24px"
                borderRadius="50%"
                style={{ background: 'var(--color-blue)' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Text fontSize="xs" fontWeight="600" color="white">
                  4
                </Text>
              </Box>
              <VStack alignItems="stretch" gap={2} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Search & Filter Your Bookmarks
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  Use the search bar at the top to find bookmarks by title,
                  description, or tags. Click "Filters" to narrow results by
                  author, domain, date range, or content type.
                </Text>
                <Box
                  mt={2}
                  p={4}
                  style={{ background: 'var(--color-bg-primary)' }}
                  borderRadius="6px"
                  border="1px dashed var(--color-border)"
                  textAlign="center"
                >
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    [Screenshot: Search bar and filter options]
                  </Text>
                </Box>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </Box>

      {/* First Steps Checklist */}
      {!checklistDismissed && (
        <>
          <Box
            p={1}
            style={{ background: 'var(--color-border)' }}
            borderRadius="8px"
          />

          <Box>
            <Alert.Root status="info" variant="subtle">
              <Alert.Indicator />
              <VStack alignItems="stretch" gap={2} width="100%">
                <HStack justifyContent="space-between" width="100%">
                  <Alert.Title>
                    First Steps Checklist ({completedCount}/{totalCount})
                  </Alert.Title>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setChecklistDismissed(true)}
                    aria-label="Dismiss checklist"
                  >
                    <LuX size={14} />
                  </Button>
                </HStack>
                <Alert.Description>
                  <VStack alignItems="stretch" gap={2}>
                    {/* Progress Bar */}
                    <Box>
                      <Box
                        h="6px"
                        borderRadius="3px"
                        style={{ background: 'var(--color-bg-tertiary)' }}
                        overflow="hidden"
                      >
                        <Box
                          h="100%"
                          w={`${progressPercentage}%`}
                          style={{ background: 'var(--color-accent-primary)' }}
                          transition="width 0.3s ease"
                        />
                      </Box>
                      <Text
                        fontSize="xs"
                        style={{ color: 'var(--color-text-tertiary)' }}
                        mt={1}
                      >
                        {progressPercentage}% complete
                      </Text>
                    </Box>

                    {/* Checklist Items */}
                    {itemsArray.map((item) => {
                      const Icon = item.isCompleted ? LuSquareCheck : LuSquare
                      return (
                        <HStack
                          key={item.id}
                          gap={2}
                          alignItems="flex-start"
                          cursor={item.isAutoDetected ? 'default' : 'pointer'}
                          onClick={() => {
                            if (!item.isAutoDetected) {
                              toggleChecklistItem(item.id)
                            }
                          }}
                          opacity={item.isCompleted ? 0.7 : 1}
                          _hover={item.isAutoDetected ? {} : { opacity: 0.8 }}
                        >
                          <Icon
                            size={16}
                            style={{
                              marginTop: '2px',
                              color: item.isCompleted
                                ? 'var(--color-accent-primary)'
                                : 'var(--color-text-tertiary)',
                            }}
                          />
                          <Text
                            fontSize="sm"
                            lineHeight="1.6"
                            textDecoration={
                              item.isCompleted ? 'line-through' : 'none'
                            }
                          >
                            {item.label}
                            {item.isAutoDetected && item.isCompleted && (
                              <Text
                                as="span"
                                fontSize="xs"
                                style={{ color: 'var(--color-text-tertiary)' }}
                                ml={2}
                              >
                                ✓ Auto-detected
                              </Text>
                            )}
                          </Text>
                        </HStack>
                      )
                    })}
                  </VStack>
                </Alert.Description>
              </VStack>
            </Alert.Root>
          </Box>
        </>
      )}

      {/* Tips for Success */}
      <Box>
        <Alert.Root status="success" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={2}>
            <Alert.Title>Tips for Success</Alert.Title>
            <Alert.Description>
              <VStack alignItems="stretch" gap={2}>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use collections for broad categories (Work, Personal,
                  Research)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use tags for flexible cross-categorization (javascript,
                  design, tutorial)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Regular cleanup keeps your bookmarks organized and useful
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Export your data regularly as a backup
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Combine collections, tags, and filters for powerful
                  organization
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}
