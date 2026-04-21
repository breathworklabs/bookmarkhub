import { Box, VStack, HStack, Text } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'

export const BookmarkManagementGuide = () => {
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
          Bookmark Management
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          Learn how to add, approve, delete, and organize your bookmarks
          effectively. BookmarksX gives you complete control over your bookmark
          library.
        </Text>
      </Box>

      {/* Adding Bookmarks */}
      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Adding Bookmarks
        </Text>

        <VStack alignItems="stretch" gap={4}>
          {/* Manual Creation */}
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
                Manual Bookmark Creation
              </Text>
              <VStack alignItems="stretch" gap={2} pl={3}>
                <HStack gap={2} alignItems="flex-start">
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-blue)' }}
                    fontWeight="600"
                  >
                    1.
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Click the "Add Bookmark" button in the header
                  </Text>
                </HStack>
                <HStack gap={2} alignItems="flex-start">
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-blue)' }}
                    fontWeight="600"
                  >
                    2.
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Fill in the bookmark details (title, URL, description)
                  </Text>
                </HStack>
                <HStack gap={2} alignItems="flex-start">
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-blue)' }}
                    fontWeight="600"
                  >
                    3.
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Add tags and select a view
                  </Text>
                </HStack>
                <HStack gap={2} alignItems="flex-start">
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-blue)' }}
                    fontWeight="600"
                  >
                    4.
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Click "Save" to add the bookmark
                  </Text>
                </HStack>
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
                  [GIF: Adding a bookmark manually]
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* Browser Extension */}
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
                Via Browser Extension
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Install the BookmarksX browser extension to save bookmarks while
                browsing. The extension automatically syncs with your app and
                preserves all metadata.
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
                  [Screenshot: Browser extension in action]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Editing Bookmarks */}
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
          Approving Bookmarks
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
                Approve Bookmark Details
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Click the three-dot menu on any bookmark card and select
                "Approve" to open the edit dialog. You can update the title,
                URL, description, tags, and view assignment, then click
                "Approve" to save your changes.
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
                  [GIF: Approving a bookmark]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Deleting & Recovery */}
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
          Deleting & Recovery
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
                Soft Delete (Move to Trash)
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                When you delete a bookmark, it's moved to Trash where it stays
                for 30 days. This gives you time to recover accidentally deleted
                bookmarks. Click the delete icon on any bookmark card to move it
                to Trash.
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
                Restoring from Trash
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Open the Trash view from the sidebar. Select any bookmark and
                click "Restore" to move it back to your active bookmarks. After
                30 days, bookmarks in Trash are automatically deleted
                permanently.
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
                  [GIF: Restoring a bookmark from Trash]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Starring & Archiving */}
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
          Starring & Archiving
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
                Starring Important Bookmarks
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Click the star icon on any bookmark to mark it as important.
                Starred bookmarks get a visual indicator and can be quickly
                accessed via the "Starred" filter. Perfect for your most
                frequently accessed bookmarks!
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
                  [GIF: Starring a bookmark]
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
                Archiving Bookmarks
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Archive bookmarks you've already read or reference material you
                want to keep but don't need to see daily. Archived bookmarks can
                be accessed anytime via the Archive filter, helping you
                declutter your main view.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Bookmark Properties */}
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
          Bookmark Properties
        </Text>

        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
          mb={3}
        >
          Each bookmark stores comprehensive information:
        </Text>

        <Box
          p={4}
          style={{ background: 'var(--color-bg-secondary)' }}
          borderRadius="8px"
          border="1px solid var(--color-border)"
        >
          <VStack alignItems="stretch" gap={2}>
            <Text
              fontSize="sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              • <strong>Title</strong> - Bookmark name (required)
            </Text>
            <Text
              fontSize="sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              • <strong>URL</strong> - Web address (required)
            </Text>
            <Text
              fontSize="sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              • <strong>Author</strong> - Content creator
            </Text>
            <Text
              fontSize="sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              • <strong>Domain</strong> - Website source (auto-detected)
            </Text>
            <Text
              fontSize="sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              • <strong>Description</strong> - Your notes
            </Text>
            <Text
              fontSize="sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              • <strong>Tags</strong> - Multiple tags for categorization
            </Text>
            <Text
              fontSize="sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              • <strong>Views</strong> - Can belong to multiple
              views
            </Text>
            <Text
              fontSize="sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              • <strong>Media</strong> - Images and videos
            </Text>
            <Text
              fontSize="sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              • <strong>Timestamps</strong> - Created and updated dates
            </Text>
            <Text
              fontSize="sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              • <strong>Flags</strong> - Starred, read, archived status
            </Text>
          </VStack>
        </Box>
      </Box>

      {/* Tips */}
      <Box>
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={2}>
            <Alert.Title>Pro Tips</Alert.Title>
            <Alert.Description>
              <VStack alignItems="stretch" gap={2}>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use descriptive titles to make bookmarks easy to find later
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Add notes in the description field for context
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Star your most important bookmarks for quick access
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Archive old bookmarks to keep your active list manageable
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Check Trash regularly to recover accidentally deleted items
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}
