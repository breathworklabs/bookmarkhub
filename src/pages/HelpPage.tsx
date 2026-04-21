import { Box, Flex, VStack, HStack, Text, Button } from '@chakra-ui/react'
import {
  LuArrowLeft,
  LuBookOpen,
  LuSparkles,
  LuTag,
  LuSearch,
  LuDownload,
  LuLayers,
  LuSettings,
  LuShield,
} from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState, useCallback, useEffect } from 'react'
import UnifiedSidebar from '@/components/UnifiedSidebar'
import { useSettingsStore } from '@/store/settingsStore'
import { GettingStartedGuide } from './help/GettingStartedGuide'
import { ViewsGuide } from './help/ViewsGuide'
import { BookmarkManagementGuide } from './help/BookmarkManagementGuide'
import { TagsFilteringGuide } from './help/TagsFilteringGuide'
import { SearchFiltersGuide } from './help/SearchFiltersGuide'
import { ImportExportGuide } from './help/ImportExportGuide'
import { BulkOperationsGuide } from './help/BulkOperationsGuide'
import { SettingsGuide } from './help/SettingsGuide'
import { PrivacyDataGuide } from './help/PrivacyDataGuide'

type HelpTopic =
  | 'getting-started'
  | 'views'
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
      id: 'views' as HelpTopic,
      label: 'Views',
      icon: LuLayers,
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
                  {activeTopic === 'views' && <ViewsGuide />}
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

export default HelpPage
