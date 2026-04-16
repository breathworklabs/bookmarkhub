import { Box, VStack, HStack, Text, Code } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'
import { LuFolderTree } from 'react-icons/lu'

export const ViewsGuide = () => {
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
          Views
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          Views help you organize and filter your bookmarks. The sidebar includes
          built-in system views — All Bookmarks, Starred, Recent, Archived, Trash,
          and Uncategorized — plus the ability to create custom views with your own
          criteria and nested sub-views for advanced organization.
        </Text>
      </Box>

      {/* Creating a View */}
      <Box>
        <HStack gap={2} mb={3}>
          <LuFolderTree size={20} color="var(--color-blue)" />
          <Text
            fontSize="lg"
            fontWeight="600"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Creating a View
          </Text>
        </HStack>

        <VStack alignItems="stretch" gap={4}>
          <Text
            fontSize="sm"
            style={{
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6',
            }}
          >
            Follow these steps to create your first custom view:
          </Text>

          {/* Step 1 */}
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
                  Open the Views Panel
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  In the left sidebar, locate the "Views" section. If you
                  don't see it, make sure your sidebar is expanded.
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
                    [GIF: Highlighting the Views section in the sidebar]
                  </Text>
                </Box>
              </VStack>
            </HStack>
          </Box>

          {/* Step 2 */}
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
                  Click the "New View" Button
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  Look for the "+ New View" button at the top of the
                  Views panel and click it.
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
                    [GIF: Clicking the "New View" button]
                  </Text>
                </Box>
              </VStack>
            </HStack>
          </Box>

          {/* Step 3 */}
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
                  Enter View Details
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  A dialog will appear. Enter a name for your view and
                  optionally add a description. For example:
                </Text>
                <Box
                  p={3}
                  style={{ background: 'var(--color-bg-primary)' }}
                  borderRadius="6px"
                  border="1px solid var(--color-border)"
                >
                  <VStack alignItems="stretch" gap={2}>
                    <HStack gap={2}>
                      <Text
                        fontSize="xs"
                        fontWeight="600"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Name:
                      </Text>
                      <Code
                        fontSize="xs"
                        style={{
                          background: 'var(--color-bg-secondary)',
                          color: 'var(--color-blue)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Web Development
                      </Code>
                    </HStack>
                    <HStack gap={2}>
                      <Text
                        fontSize="xs"
                        fontWeight="600"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Description:
                      </Text>
                      <Code
                        fontSize="xs"
                        style={{
                          background: 'var(--color-bg-secondary)',
                          color: 'var(--color-text-secondary)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Articles and resources about web development
                      </Code>
                    </HStack>
                  </VStack>
                </Box>
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
                    [GIF: Filling out the view creation form]
                  </Text>
                </Box>
              </VStack>
            </HStack>
          </Box>

          {/* Step 4 */}
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
                  Save Your View
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  Click the "Create View" button. Your new view will
                  appear in the Views panel in the sidebar.
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
                    [GIF: View appearing in the sidebar after creation]
                  </Text>
                </Box>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </Box>

      {/* Adding Bookmarks to Views */}
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
          Adding Bookmarks to a View
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Text
            fontSize="sm"
            style={{
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6',
            }}
          >
            There are multiple ways to add bookmarks to a view:
          </Text>

          {/* Method 1: Drag and Drop */}
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
                Method 1: Drag and Drop
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Simply drag a bookmark card from the main area and drop it onto
                a view in the sidebar. The bookmark will be instantly
                added to that view.
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
                  [GIF: Dragging a bookmark to a view]
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* Method 2: Bookmark Menu */}
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
                Method 2: Bookmark Menu
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Click the three-dot menu on any bookmark card, select "Add to
                View", and choose from your list of views.
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
                  [GIF: Using the bookmark menu to add to view]
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* Method 3: Bulk Selection */}
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
                Method 3: Bulk Selection
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Select multiple bookmarks using checkboxes, then click the "Add
                to View" button in the bulk actions toolbar to add all
                selected bookmarks at once.
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
                  [GIF: Bulk adding bookmarks to a view]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Nested Views */}
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
          Creating Nested Views
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Text
            fontSize="sm"
            style={{
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6',
            }}
          >
            You can create views inside other views to build a
            hierarchical organization structure. For example, you might have a
            "Programming" view with nested views for "JavaScript",
            "Python", and "DevOps".
          </Text>

          {/* Creating Nested View */}
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
                To Create a Nested View:
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
                    Right-click on an existing view (the parent)
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
                    Select "Create Subview" from the context menu
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
                    Enter the name and description for the subview
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
                    Click "Create" - the new view will appear nested under
                    the parent
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
                  [GIF: Creating a nested view structure]
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* Example Structure */}
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
                Example View Structure:
              </Text>
              <Box
                p={3}
                style={{ background: 'var(--color-bg-primary)' }}
                borderRadius="6px"
                border="1px solid var(--color-border)"
                fontFamily="monospace"
              >
                <VStack alignItems="stretch" gap={1}>
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    📁 Web Development
                  </Text>
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                    pl={4}
                  >
                    📁 Frontend
                  </Text>
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                    pl={8}
                  >
                    📄 React Resources
                  </Text>
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                    pl={8}
                  >
                    📄 CSS Tricks
                  </Text>
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                    pl={4}
                  >
                    📁 Backend
                  </Text>
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                    pl={8}
                  >
                    📄 Node.js Guides
                  </Text>
                  <Text
                    fontSize="xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                    pl={8}
                  >
                    📄 Database Tutorials
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Tips & Best Practices */}
      <Box
        p={1}
        style={{ background: 'var(--color-border)' }}
        borderRadius="8px"
      />

      <Box>
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={2}>
            <Alert.Title>Tips & Best Practices</Alert.Title>
            <Alert.Description>
              <VStack alignItems="stretch" gap={2}>
                <Text fontSize="sm" lineHeight="1.6">
                  • Keep view names short and descriptive for easier
                  scanning
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use nested views for broader categories (max 3 levels
                  deep recommended)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use system views for quick access to starred, recent, or
                  archived bookmarks
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Combine views with tags for powerful organization and
                  filtering
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Regularly review and reorganize your views as your
                  needs evolve
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>

      {/* Pro Tip */}
      <Box>
        <Alert.Root status="success" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={1}>
            <Alert.Title>Pro Tip: System Views</Alert.Title>
            <Alert.Description>
              <Text fontSize="sm" lineHeight="1.6">
                BookmarkHub includes built-in system views that automatically
                filter your bookmarks: Starred, Recent (last 7 days), Archived,
                Trash, and Uncategorized. You can also create custom views based
                on your workflow — try a "Reading List" for articles or
                "Projects" with sub-views for each active project.
              </Text>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}
