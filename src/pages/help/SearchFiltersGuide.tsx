import { Box, VStack, Text } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'

export const SearchFiltersGuide = () => {
  return (
    <VStack alignItems="stretch" gap={6}>
      {/* Introduction */}
      <Box>
        <Text
          fontSize="xl"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Search & Filters
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          Find exactly what you're looking for with powerful full-text search
          and advanced filtering options. Combine multiple filters to narrow
          down results.
        </Text>
      </Box>

      {/* Full-Text Search */}
      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Full-Text Search
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={3}>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Search Across All Fields
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                The search bar at the top searches across:
              </Text>
              <VStack alignItems="stretch" gap={1} pl={3}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Bookmark titles
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Descriptions and notes
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Authors
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • URLs
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Tags
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • View names
                </Text>
              </VStack>
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
                  [GIF: Using the search bar]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Quick Filters */}
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
          Quick Filters
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={2}>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Filter Bar Tabs
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Use the quick filter tabs for instant filtering:
              </Text>
              <VStack alignItems="stretch" gap={2} pl={3}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>All Bookmarks</strong> - Show everything
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Today</strong> - Bookmarks added today
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>This Week</strong> - Last 7 days
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>This Month</strong> - Last 30 days
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Threads</strong> - Multi-part content
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Media</strong> - Bookmarks with images/videos
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Advanced Filters */}
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
          Advanced Filters
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Text
            fontSize="sm"
            style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
          >
            Click the "Filters" button in the header to access advanced
            filtering options:
          </Text>

          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={3}>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Available Filters
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Author Filter
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Filter by content creator (multi-select supported)
                  </Text>
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Domain Filter
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Group bookmarks by website source
                  </Text>
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Date Range Filter
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Use presets (Today, This Week, This Month) or custom dates
                  </Text>
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Content Type Filter
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Filter by article, tweet, video, image, or other
                  </Text>
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Tag Filter
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Multi-tag selection with AND/OR logic
                  </Text>
                </Box>
              </VStack>
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
                  [Screenshot: Advanced filter panel]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Filter Presets */}
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
          Filter Presets
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={3}>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Save Your Filter Combinations
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Create custom filter presets to quickly access your most common
                filter combinations. For example:
              </Text>
              <VStack alignItems="stretch" gap={2} pl={3}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • "Work Research" - Work view + research tag + this week
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • "Videos to Watch" - Media filter + to-watch tag + unread
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • "Design Inspiration" - Design tag + media filter + starred
                </Text>
              </VStack>
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
                  [GIF: Saving and loading filter presets]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Tips */}
      <Box>
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={2}>
            <Alert.Title>Search & Filter Tips</Alert.Title>
            <Alert.Description>
              <VStack alignItems="stretch" gap={2}>
                <Text fontSize="sm" lineHeight="1.6">
                  • All filters use AND logic - they narrow results
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Search is case-insensitive and matches partial words
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Combine quick filters with advanced filters for precision
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Save frequently used filter combinations as presets
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Clear filters anytime with the "Clear All" button
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}
