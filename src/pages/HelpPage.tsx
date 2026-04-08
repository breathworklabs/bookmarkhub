import { Box, Flex, VStack, HStack, Text, Button, Code } from '@chakra-ui/react'
import { Alert } from '@chakra-ui/react'
import {
  LuArrowLeft,
  LuBookOpen,
  LuFolderTree,
  LuSparkles,
  LuTag,
  LuSearch,
  LuDownload,
  LuLayers,
  LuSettings,
  LuShield,
  LuSquare,
  LuSquareCheck,
  LuX,
} from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState, useCallback, useEffect } from 'react'
import UnifiedSidebar from '@/components/UnifiedSidebar'
import { useSettingsStore } from '@/store/settingsStore'
import { useChecklistStatus } from '@/hooks/useChecklistStatus'

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
  const [activeTopic, setActiveTopic] = useState<HelpTopic>('getting-started')

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
      icon: LuSparkles,
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
      icon: LuTag,
    },
    {
      id: 'search-filters' as HelpTopic,
      label: 'Search & Filters',
      icon: LuSearch,
    },
    {
      id: 'import-export' as HelpTopic,
      label: 'Import & Export',
      icon: LuDownload,
    },
    {
      id: 'bulk-operations' as HelpTopic,
      label: 'Bulk Operations',
      icon: LuLayers,
    },
    { id: 'settings' as HelpTopic, label: 'Settings', icon: LuSettings },
    {
      id: 'privacy-data' as HelpTopic,
      label: 'Privacy & Data',
      icon: LuShield,
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
                  {activeTopic === 'getting-started' && <GettingStartedGuide />}
                  {activeTopic === 'collections' && <CollectionsGuide />}
                  {activeTopic === 'bookmark-management' && (
                    <BookmarkManagementGuide />
                  )}
                  {activeTopic === 'tags-filtering' && <TagsFilteringGuide />}
                  {activeTopic === 'search-filters' && <SearchFiltersGuide />}
                  {activeTopic === 'import-export' && <ImportExportGuide />}
                  {activeTopic === 'bulk-operations' && <BulkOperationsGuide />}
                  {activeTopic === 'settings' && <SettingsGuide />}
                  {activeTopic === 'privacy-data' && <PrivacyDataGuide />}
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

// Getting Started Guide
const GettingStartedGuide = () => {
  const { itemsArray, completedCount, totalCount, progressPercentage } = useChecklistStatus()
  const toggleChecklistItem = useSettingsStore((s) => s.toggleChecklistItem)
  const checklistDismissed = useSettingsStore((s) => s.onboarding.checklistDismissed)
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
                          _hover={
                            item.isAutoDetected
                              ? {}
                              : { opacity: 0.8 }
                          }
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
                            textDecoration={item.isCompleted ? 'line-through' : 'none'}
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
                  • Use collections for broad categories (Work, Personal, Research)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use tags for flexible cross-categorization (javascript, design, tutorial)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Regular cleanup keeps your bookmarks organized and useful
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Export your data regularly as a backup
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Combine collections, tags, and filters for powerful organization
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}

// Bookmark Management Guide
const BookmarkManagementGuide = () => {
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
          collection.
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
                    Add tags and select a collection
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
                URL, description, tags, and collection assignment, then click
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
                30 days, bookmarks in Trash are automatically deleted permanently.
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
                be accessed anytime via the Archive filter, helping you declutter
                your main view.
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
            <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
              • <strong>Title</strong> - Bookmark name (required)
            </Text>
            <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
              • <strong>URL</strong> - Web address (required)
            </Text>
            <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
              • <strong>Author</strong> - Content creator
            </Text>
            <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
              • <strong>Domain</strong> - Website source (auto-detected)
            </Text>
            <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
              • <strong>Description</strong> - Your notes
            </Text>
            <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
              • <strong>Tags</strong> - Multiple tags for categorization
            </Text>
            <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
              • <strong>Collections</strong> - Can belong to multiple collections
            </Text>
            <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
              • <strong>Media</strong> - Images and videos
            </Text>
            <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
              • <strong>Timestamps</strong> - Created and updated dates
            </Text>
            <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
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

// Tags & Filtering Guide
const TagsFilteringGuide = () => {
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
          Tags & Filtering
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          Tags provide flexible, cross-cutting categorization for your bookmarks.
          Unlike collections, a bookmark can have multiple tags, and tags work
          across collection boundaries.
        </Text>
      </Box>

      {/* Understanding Tags */}
      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Understanding Tags
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
                Tags vs Collections
              </Text>
              <Box
                p={3}
                style={{ background: 'var(--color-bg-primary)' }}
                borderRadius="6px"
              >
                <VStack alignItems="stretch" gap={2}>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <strong>Collections:</strong> Hierarchical, folder-like
                    structure. Best for organizing by projects or broad categories.
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <strong>Tags:</strong> Flat, flexible labels. Best for
                    cross-cutting themes, topics, or attributes.
                  </Text>
                </VStack>
              </Box>
              <Text
                fontSize="sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Pro tip: Use both for maximum organizational power!
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Adding Tags */}
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
          Adding Tags
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
                Manual Tagging
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
                    Click on any bookmark to open the edit dialog
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
                    Enter tags separated by commas (e.g., "react, tutorial, javascript")
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
                    Tags auto-complete from your existing tags
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
                  [GIF: Adding tags to a bookmark]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Smart Tag Suggestions */}
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
            Smart Tag Suggestions
          </Text>
        </HStack>

        <VStack alignItems="stretch" gap={4}>
          <Text
            fontSize="sm"
            style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
          >
            BookmarksX uses AI-powered NLP (Natural Language Processing) to
            analyze your bookmarks and suggest relevant tags automatically.
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
                How Smart Suggestions Work
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Domain Detection:</strong> Suggests tags based on the
                  website (e.g., "github" for github.com)
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>NLP Analysis:</strong> Extracts keywords from titles
                  and descriptions
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Pattern Learning:</strong> Learns from your existing
                  tagging patterns
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>URL Pattern Detection:</strong> Identifies common URL
                  patterns for tech sites
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
                  [GIF: Using smart tag suggestions]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Tag Filtering */}
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
          Filtering by Tags
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
                AND/OR Logic
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                When filtering by multiple tags, choose between:
              </Text>
              <Box
                p={3}
                style={{ background: 'var(--color-bg-primary)' }}
                borderRadius="6px"
              >
                <VStack alignItems="stretch" gap={2}>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Code
                      fontSize="xs"
                      style={{
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-blue)',
                        padding: '2px 6px',
                        marginRight: '8px',
                      }}
                    >
                      AND
                    </Code>
                    Show bookmarks with ALL selected tags
                  </Text>
                  <Text
                    fontSize="sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Code
                      fontSize="xs"
                      style={{
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-blue)',
                        padding: '2px 6px',
                        marginRight: '8px',
                      }}
                    >
                      OR
                    </Code>
                    Show bookmarks with ANY selected tag
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Bulk Tagging */}
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
          Bulk Tagging
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
                Add Tags to Multiple Bookmarks
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Select multiple bookmarks using checkboxes, then click "Bulk Tag"
                to add or remove tags from all selected bookmarks at once. Perfect
                for organizing large imports!
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
        </VStack>
      </Box>

      {/* Tag Manager */}
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
          Tag Manager
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
                Centralized Tag Management
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Access the Tag Manager from Settings to view all tags, see usage
                counts, rename tags, merge similar tags, or delete unused tags.
                Perfect for keeping your tag system organized!
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Tips */}
      <Box>
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={2}>
            <Alert.Title>Best Practices for Tags</Alert.Title>
            <Alert.Description>
              <VStack alignItems="stretch" gap={2}>
                <Text fontSize="sm" lineHeight="1.6">
                  • Keep tags short and consistent (lowercase recommended)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use specific tags for better filtering ("react-hooks" vs "react")
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Create a tagging system early (topic, priority, status)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Regularly review and merge duplicate or similar tags
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Combine tags with collections for powerful organization
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}

// Search & Filters Guide
const SearchFiltersGuide = () => {
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
          Find exactly what you're looking for with powerful full-text search and
          advanced filtering options. Combine multiple filters to narrow down
          results.
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
                  • Collection names
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
            Click the "Filters" button in the header to access advanced filtering
            options:
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
                  • "Work Research" - Work collection + research tag + this week
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

// Import & Export Guide
const ImportExportGuide = () => {
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
          Import & Export
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          Full data portability with support for multiple formats. Import from
          X/Twitter, export to JSON, CSV, or HTML. Your data, your control.
        </Text>
      </Box>

      {/* Import from X/Twitter */}
      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Import from X/Twitter
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
                Export from X/Twitter
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
                    Go to X/Twitter Settings and Privacy
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
                    Request your data archive
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
                    Download and extract the archive
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
                    Locate the bookmarks.json file
                  </Text>
                </HStack>
              </VStack>
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
                Import into BookmarksX
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Click the "Import" button in the header, select "Import from
                X/Twitter", choose your bookmarks.json file, and configure
                duplicate handling preferences. All metadata, media, and
                engagement metrics are preserved!
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
                  [GIF: Complete X/Twitter import process]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Duplicate Handling */}
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
          Duplicate Handling
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
                Automatic Duplicate Detection
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                BookmarksX automatically detects duplicates by URL during import.
                Choose how to handle them:
              </Text>
              <VStack alignItems="stretch" gap={2} pl={3}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Skip:</strong> Don't import duplicates (default,
                  safest)
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Replace:</strong> Update existing bookmark with new
                  data
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Keep Both:</strong> Import as separate bookmark
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
                  [Screenshot: Duplicate handling options]
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Export Options */}
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
          Export Options
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
                Export to JSON
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Full-fidelity export with all metadata, collections, tags, and
                settings. Perfect for backups or transferring to another device.
                Import back anytime without data loss.
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
                Export to CSV
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Spreadsheet-compatible format for Excel or Google Sheets. Great
                for analysis, reporting, or sharing with non-BookmarksX users.
                Includes title, URL, author, domain, tags, and more.
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
                Export to HTML
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Standard browser bookmark format. Import directly into Chrome,
                Firefox, Safari, or Edge. Collections convert to folders. Note:
                Tags and metadata are not preserved in this format.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Tips */}
      <Box>
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={2}>
            <Alert.Title>Import & Export Best Practices</Alert.Title>
            <Alert.Description>
              <VStack alignItems="stretch" gap={2}>
                <Text fontSize="sm" lineHeight="1.6">
                  • Export regularly as backup (weekly or monthly recommended)
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use JSON format for complete data portability
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Store backup exports in multiple secure locations
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Version your exports with dates in filename
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Test imports on small datasets first
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}

// Bulk Operations Guide
const BulkOperationsGuide = () => {
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
                to all selected bookmarks, remove specific tags, or replace
                tags entirely. Perfect for categorizing imports!
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
                keeping them accessible. Great for seasonal content or
                completed projects.
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
                  • Combine with smart tag suggestions for efficient organization
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}

// Settings Guide
const SettingsGuide = () => {
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
          Settings
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          Customize BookmarksX to match your preferences. Configure display,
          privacy, import/export, and accessibility settings.
        </Text>
      </Box>

      {/* Display Settings */}
      <Box>
        <Text
          fontSize="lg"
          fontWeight="600"
          style={{ color: 'var(--color-text-primary)' }}
          mb={3}
        >
          Display Settings
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
                Theme & Appearance
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Theme:</strong> Dark mode, light mode, or auto
                  (follows system)
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Font Size:</strong> Small, medium, or large
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>View Mode:</strong> Grid, list, or compact view
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Cards Per Page:</strong> 10, 20, 30, 50, or 100
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Animations:</strong> Enable or disable for
                  performance
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Sidebar State:</strong> Collapsed or expanded by
                  default
                </Text>
              </VStack>
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
                Media Preview Mode
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Control how media is displayed: Auto (show all), click to load
                (privacy mode), or off (no previews). Click to load prevents
                automatic connections to media servers.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Extension Settings */}
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
          Extension Settings
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
                Browser Extension Configuration
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Auto-Sync:</strong> Set sync interval (5min, 15min,
                  30min, hourly, or off)
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Default Tags:</strong> Auto-applied to new bookmarks
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Default Collection:</strong> Where new bookmarks are
                  saved
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Auto-Open App:</strong> Open BookmarksX when saving
                  bookmarks
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Privacy Settings */}
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
          Privacy Settings
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={3}>
              <Alert.Root status="success" variant="subtle">
                <Alert.Indicator />
                <VStack alignItems="stretch" gap={1}>
                  <Alert.Title>Privacy First</Alert.Title>
                  <Alert.Description>
                    <Text fontSize="sm" lineHeight="1.6">
                      BookmarksX collects NO analytics. All data stays on your
                      device.
                    </Text>
                  </Alert.Description>
                </VStack>
              </Alert.Root>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Available Privacy Controls
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Search History:</strong> Enable/disable or clear
                  search history
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Data Storage:</strong> View storage usage and
                  location
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Clear All Data:</strong> Permanently delete
                  everything (with confirmation)
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Import/Export Settings */}
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
          Import/Export Settings
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
                Default Preferences
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Duplicate Handling:</strong> Skip, replace, or keep
                  both
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Export Format:</strong> Preferred format (JSON, CSV,
                  HTML)
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Include Deleted:</strong> Whether to include trash
                  in exports
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Include Media URLs:</strong> Whether to include media
                  in exports
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Accessibility */}
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
          Accessibility Settings
        </Text>

        <VStack alignItems="stretch" gap={4}>
          <Box
            p={4}
            style={{ background: 'var(--color-bg-secondary)' }}
            borderRadius="8px"
            border="1px solid var(--color-border)"
          >
            <VStack alignItems="stretch" gap={2}>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Keyboard Shortcuts:</strong> Enable/disable and view
                  reference
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Screen Reader Support:</strong> ARIA labels and
                  semantic HTML
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Reduced Motion:</strong> Respect system preference
                  for animations
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Focus Management:</strong> Clear focus indicators
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Tips */}
      <Box>
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={2}>
            <Alert.Title>Settings Tips</Alert.Title>
            <Alert.Description>
              <VStack alignItems="stretch" gap={2}>
                <Text fontSize="sm" lineHeight="1.6">
                  • Settings are saved automatically in localStorage
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Export settings with your data for transfer to other devices
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Try compact view for more bookmarks on screen
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Disable animations if experiencing performance issues
                </Text>
                <Text fontSize="sm" lineHeight="1.6">
                  • Use click-to-load media for privacy when browsing publicly
                </Text>
              </VStack>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}

// Privacy & Data Guide
const PrivacyDataGuide = () => {
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
          Privacy & Data
        </Text>
        <Text
          fontSize="sm"
          style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          BookmarksX is built with privacy as the foundation. Your data never
          leaves your device, and we collect nothing.
        </Text>
      </Box>

      {/* 100% Local Storage */}
      <Box>
        <HStack gap={2} mb={3}>
          <LuShield size={20} color="var(--color-blue)" />
          <Text
            fontSize="lg"
            fontWeight="600"
            style={{ color: 'var(--color-text-primary)' }}
          >
            100% Local Storage
          </Text>
        </HStack>

        <VStack alignItems="stretch" gap={4}>
          <Alert.Root status="success" variant="subtle">
            <Alert.Indicator />
            <VStack alignItems="stretch" gap={2}>
              <Alert.Title>Privacy Guarantee</Alert.Title>
              <Alert.Description>
                <VStack alignItems="stretch" gap={2}>
                  <Text fontSize="sm" lineHeight="1.6">
                    All your data is stored in browser localStorage on your
                    device. No cloud storage, no external servers, no database.
                  </Text>
                  <Text fontSize="sm" lineHeight="1.6">
                    Your bookmarks, tags, collections, and settings stay
                    completely private. We literally cannot access your data
                    because it never reaches us.
                  </Text>
                </VStack>
              </Alert.Description>
            </VStack>
          </Alert.Root>

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
                What This Means For You
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Your data never leaves your device
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • No account required, no sign-up, no login
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • No third parties can access your bookmarks
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • No data breaches are possible
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Complete control over your data
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* No Tracking */}
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
          Zero Tracking
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
                What We DON'T Collect
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ Personal information
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ Browsing history
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ Usage patterns or analytics
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ IP addresses or device information
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ Cookies or fingerprinting
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ✗ Anything at all
                </Text>
              </VStack>
              <Text
                fontSize="sm"
                fontWeight="600"
                style={{ color: 'var(--color-blue)' }}
              >
                No analytics. No tracking. No telemetry. Period.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Data Portability */}
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
          Data Portability
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
                You Own Your Data
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Export your data anytime in standard formats (JSON, CSV, HTML).
                No vendor lock-in, no export fees, no restrictions. Transfer
                between devices, share with others, or migrate to other tools
                freely.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Data Security */}
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
          Data Security
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
                Built-In Protection
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Input Sanitization:</strong> All user input is
                  sanitized to prevent XSS
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>React Protection:</strong> React's built-in XSS
                  prevention
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>Content Security Policy:</strong> Strict CSP headers
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • <strong>No SQL Injection:</strong> No database means no SQL
                  injection risk
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Data Management */}
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
          Data Management
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
                Storage Usage
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                View your current storage usage in Settings. Most browsers
                provide 5-10MB of localStorage space. Monitor usage if you have
                large bookmark collections with extensive media.
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
                Clear All Data
              </Text>
              <Text
                fontSize="sm"
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                Available in Settings with confirmation required. Permanently
                deletes all bookmarks, collections, tags, and settings. Export
                before clearing! This action cannot be undone.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Backup Best Practices */}
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
          Backup Best Practices
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
                Recommended Backup Strategy
              </Text>
              <VStack alignItems="stretch" gap={2}>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Export data weekly or monthly as backup
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Store exports in multiple secure locations
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Version your exports with dates in filename
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Test restore process occasionally
                </Text>
                <Text
                  fontSize="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  • Keep at least 2-3 recent backup versions
                </Text>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Browser Compatibility */}
      <Box>
        <Alert.Root status="info" variant="subtle">
          <Alert.Indicator />
          <VStack alignItems="stretch" gap={2}>
            <Alert.Title>Browser Compatibility</Alert.Title>
            <Alert.Description>
              <Text fontSize="sm" lineHeight="1.6">
                BookmarksX works in all modern browsers with localStorage support
                (Chrome, Firefox, Safari, Edge). Note: Private/Incognito mode may
                have storage limitations that affect functionality.
              </Text>
            </Alert.Description>
          </VStack>
        </Alert.Root>
      </Box>
    </VStack>
  )
}

export default HelpPage
