import { Box, Flex, VStack, HStack, Text, Button, Code } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'
import { LuArrowLeft, LuBookOpen, LuFolderTree, LuInfo } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState, useCallback, useEffect } from 'react'
import UnifiedSidebar from '../components/UnifiedSidebar'
import { useSettingsStore } from '../store/settingsStore'

type HelpTopic =
  | 'getting-started'
  | 'collections'
  | 'bookmark-management'
  | 'tags-filtering'
  | 'search-filters'
  | 'import-export'
  | 'bulk-operations'
  | 'settings'
  | 'privacy-data'

const HelpPage = () => {
  const navigate = useNavigate()
  const [activeTopic, setActiveTopic] = useState<HelpTopic>('collections')

  // Collapse sidebar on mount, restore on unmount
  useEffect(() => {
    // Store current sidebar state
    const currentState = useSettingsStore.getState().display.isSidebarCollapsed
    useSettingsStore.getState().setPreviousSidebarState(currentState)

    // Collapse sidebar if not already collapsed
    if (!currentState) {
      useSettingsStore.getState().setSidebarCollapsed(true)
    }

    // Restore on unmount - delayed to avoid animation during navigation
    return () => {
      const prevState = useSettingsStore.getState().display.previousSidebarState
      if (prevState !== null) {
        // Delay to let navigation complete first
        setTimeout(() => {
          useSettingsStore.getState().setSidebarCollapsed(prevState)
          useSettingsStore.getState().setPreviousSidebarState(null)
        }, 50)
      }
    }
  }, [])

  // Handle back navigation
  const handleBackClick = useCallback(() => {
    navigate('/', { replace: true })
  }, [navigate])

  const topics = [
    {
      id: 'getting-started' as HelpTopic,
      label: 'Getting Started',
      icon: LuBookOpen,
    },
    {
      id: 'collections' as HelpTopic,
      label: 'Collections',
      icon: LuFolderTree,
    },
    {
      id: 'bookmark-management' as HelpTopic,
      label: 'Bookmark Management',
      icon: LuBookOpen,
    },
    {
      id: 'tags-filtering' as HelpTopic,
      label: 'Tags & Filtering',
      icon: LuBookOpen,
    },
    {
      id: 'search-filters' as HelpTopic,
      label: 'Search & Filters',
      icon: LuBookOpen,
    },
    {
      id: 'import-export' as HelpTopic,
      label: 'Import & Export',
      icon: LuBookOpen,
    },
    {
      id: 'bulk-operations' as HelpTopic,
      label: 'Bulk Operations',
      icon: LuBookOpen,
    },
    { id: 'settings' as HelpTopic, label: 'Settings', icon: LuBookOpen },
    {
      id: 'privacy-data' as HelpTopic,
      label: 'Privacy & Data',
      icon: LuBookOpen,
    },
  ]

  return (
    <DndProvider backend={HTML5Backend}>
      <Flex h="100vh" w="100vw">
        {/* Sidebar */}
        <UnifiedSidebar />

        {/* Main Content */}
        <Flex
          flex={1}
          direction="column"
          w="100%"
          overflowY="auto"
          p={{ base: 4, md: 8 }}
          style={{ background: 'var(--color-bg-primary)' }}
        >
          <Box maxW="1200px" mx="auto" w="100%">
            {/* Back Button */}
            <Button
              onClick={handleBackClick}
              variant="ghost"
              style={{ color: 'var(--color-text-secondary)' }}
              _hover={{
                color: 'var(--color-blue)',
                bg: 'var(--color-bg-hover)',
              }}
              _focus={{
                boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.2)',
                outline: 'none',
              }}
              mb={6}
              size="sm"
            >
              <LuArrowLeft size={18} style={{ marginRight: '8px' }} />
              Back to Bookmarks
            </Button>

            {/* Help Page Layout */}
            <Flex gap={6} direction={{ base: 'column', md: 'row' }}>
              {/* Left Sidebar Navigation */}
              <Box
                w={{ base: '100%', md: '250px' }}
                flexShrink={0}
                style={{ background: 'var(--color-bg-tertiary)' }}
                borderRadius="12px"
                border="1px solid var(--color-border)"
                p={4}
                h="fit-content"
                position={{ base: 'relative', md: 'sticky' }}
                top={{ base: 'auto', md: '20px' }}
              >
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  style={{ color: 'var(--color-text-primary)' }}
                  mb={3}
                >
                  Help Topics
                </Text>
                <VStack alignItems="stretch" gap={1}>
                  {topics.map((topic) => {
                    const Icon = topic.icon
                    const isActive = activeTopic === topic.id
                    return (
                      <Button
                        key={topic.id}
                        onClick={() => setActiveTopic(topic.id)}
                        variant="ghost"
                        justifyContent="flex-start"
                        size="sm"
                        style={{
                          background: isActive
                            ? 'var(--color-bg-hover)'
                            : 'transparent',
                          color: isActive
                            ? 'var(--color-blue)'
                            : 'var(--color-text-secondary)',
                        }}
                        _hover={{
                          bg: 'var(--color-bg-hover)',
                          color: 'var(--color-blue)',
                        }}
                        fontWeight={isActive ? '600' : '400'}
                        fontSize="13px"
                        h="36px"
                      >
                        <Icon size={16} style={{ marginRight: '8px' }} />
                        {topic.label}
                      </Button>
                    )
                  })}
                </VStack>
              </Box>

              {/* Main Content Area */}
              <Box
                flex={1}
                style={{ background: 'var(--color-bg-tertiary)' }}
                borderRadius="12px"
                border="1px solid var(--color-border)"
                overflow="hidden"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
              >
                {/* Header */}
                <HStack
                  p={6}
                  borderBottomWidth="1px"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <LuBookOpen
                    size={24}
                    style={{ color: 'var(--color-text-primary)' }}
                  />
                  <Text
                    fontSize="2xl"
                    fontWeight="600"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Help & Documentation
                  </Text>
                </HStack>

                {/* Content Sections */}
                <VStack alignItems="stretch" p={6} gap={6}>
                  {activeTopic === 'collections' && <CollectionsGuide />}
                  {activeTopic !== 'collections' && (
                    <Box
                      p={8}
                      textAlign="center"
                      style={{ background: 'var(--color-bg-secondary)' }}
                      borderRadius="8px"
                    >
                      <LuInfo
                        size={48}
                        style={{
                          color: 'var(--color-text-tertiary)',
                          margin: '0 auto 16px',
                        }}
                      />
                      <Text
                        fontSize="md"
                        fontWeight="600"
                        style={{ color: 'var(--color-text-primary)' }}
                        mb={2}
                      >
                        Content Coming Soon
                      </Text>
                      <Text
                        fontSize="sm"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        This help section is under development. Check back soon
                        for detailed guides.
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </DndProvider>
  )
}

const CollectionsGuide = () => {
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
          Collections
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          Collections help you organize your bookmarks into logical groups. You
          can create collections for different topics, projects, or categories,
          and even nest collections inside each other for advanced organization.
        </Text>
      </Box>

      {/* Creating a Collection */}
      <Box>
        <HStack gap={2} mb={3}>
          <LuFolderTree size={20} color="var(--color-blue)" />
          <Text
            fontSize="lg"
            fontWeight="600"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Creating a Collection
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
            Follow these steps to create your first collection:
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
                  Open the Collections Panel
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  In the left sidebar, locate the "Collections" section. If you
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
                    [GIF: Highlighting the Collections section in the sidebar]
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
                  Click the "New Collection" Button
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  Look for the "+ New Collection" button at the top of the
                  Collections panel and click it.
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
                    [GIF: Clicking the "New Collection" button]
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
                  Enter Collection Details
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  A dialog will appear. Enter a name for your collection and
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
                    [GIF: Filling out the collection creation form]
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
                  Save Your Collection
                </Text>
                <Text
                  fontSize="sm"
                  style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  Click the "Create Collection" button. Your new collection will
                  appear in the Collections panel in the sidebar.
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
                    [GIF: Collection appearing in the sidebar after creation]
                  </Text>
                </Box>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </Box>

      {/* Adding Bookmarks to Collections */}
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
          Adding Bookmarks to a Collection
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Text
            fontSize="sm"
            style={{
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6',
            }}
          >
            There are multiple ways to add bookmarks to a collection:
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
                a collection in the sidebar. The bookmark will be instantly
                added to that collection.
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
                  [GIF: Dragging a bookmark to a collection]
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
                Collection", and choose from your list of collections.
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
                  [GIF: Using the bookmark menu to add to collection]
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
                to Collection" button in the bulk actions toolbar to add all
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
                  [GIF: Bulk adding bookmarks to a collection]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Nested Collections */}
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
          Creating Nested Collections
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Text
            fontSize="sm"
            style={{
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6',
            }}
          >
            You can create collections inside other collections to build a
            hierarchical organization structure. For example, you might have a
            "Programming" collection with nested collections for "JavaScript",
            "Python", and "DevOps".
          </Text>

          {/* Creating Nested Collection */}
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
                To Create a Nested Collection:
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
                    Right-click on an existing collection (the parent)
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
                    Select "Create Subcollection" from the context menu
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
                    Enter the name and description for the subcollection
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
                    Click "Create" - the new collection will appear nested under
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
                  [GIF: Creating a nested collection structure]
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
                Example Collection Structure:
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
                  • Keep collection names short and descriptive for easier
                  scanning
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use nested collections for broader categories (max 3 levels
                  deep recommended)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • A bookmark can belong to multiple collections - use this to
                  create different views
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Combine collections with tags for powerful organization and
                  filtering
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Regularly review and reorganize your collections as your
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
            <Alert.Title>Pro Tip: Smart Collections</Alert.Title>
            <Alert.Description>
              <Text fontSize="sm" lineHeight="1.6">
                Create collections based on your workflow or projects. For
                example, have a "Reading List" for articles to read, "Reference"
                for documentation, and "Projects" with subcollections for each
                active project.
              </Text>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}

export default HelpPage
