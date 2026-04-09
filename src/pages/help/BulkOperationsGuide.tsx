import { Box, VStack, HStack, Text } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'
import { LuSparkles } from 'react-icons/lu'

export const BulkOperationsGuide = () => {
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
          Bulk Operations
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          Manage multiple bookmarks at once with powerful bulk operations. Save
          time organizing large bookmark collections.
        </Text>
      </Box>

      {/* Bulk Selection */}
      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Bulk Selection
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
                Select Multiple Bookmarks
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Click the checkbox on bookmark cards to select them. Use "Select
                All" to select everything in the current view. A selection
                toolbar appears showing the count and available actions.
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
                  [GIF: Bulk selection in action]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Bulk Actions */}
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
          Available Bulk Actions
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
                Bulk Move to Collection
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Move or copy multiple bookmarks to a collection at once. Choose
                to move (remove from current) or copy (keep in current, add to
                new). Great for reorganizing after imports!
              </Text>
            </VStack>
          </Box>

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
                Bulk Tagging
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Add or remove tags from multiple bookmarks. You can add new tags
                to all selected bookmarks, remove specific tags, or replace tags
                entirely. Perfect for categorizing imports!
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
                  [GIF: Bulk tagging operation]
                </Text>
              </Box>
            </VStack>
          </Box>

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
                Bulk Delete
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Delete multiple bookmarks at once. They're moved to Trash where
                they can be recovered for 30 days. Requires confirmation to
                prevent accidents.
              </Text>
            </VStack>
          </Box>

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
                Bulk Archive
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Archive multiple bookmarks to declutter your main view while
                keeping them accessible. Great for seasonal content or completed
                projects.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Smart Bulk Tagging */}
      <Box
        p={1}
        style={{ background: 'var(--color-border)' }}
        borderRadius="8px"
      />

      <Box>
        <HStack gap={2} mb={3}>
          <LuSparkles size={20} color="var(--color-blue)" />
          <Text
            fontSize="lg"
            fontWeight="600"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Smart Tag Suggestions for Bulk
          </Text>
        </HStack>

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
                AI-Powered Bulk Tagging
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Select multiple bookmarks and click "Suggest Tags". BookmarksX
                analyzes all selected bookmarks, finds common themes, and
                suggests relevant tags. You can apply suggestions to all
                bookmarks or customize individually.
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
                  [GIF: Bulk smart tagging in action]
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
            <Alert.Title>Bulk Operations Tips</Alert.Title>
            <Alert.Description>
              <VStack alignItems="stretch" gap={2}>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use filters to narrow selection before bulk operations
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Start with small selections to test operations
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Clear selection anytime with the "Clear" button
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Bulk operations are undoable via Trash recovery
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Combine with smart tag suggestions for efficient
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
