import { Box, Flex, VStack, Text, Button, HStack } from '@chakra-ui/react';
import { LuImport, LuBookmarkPlus, LuFolderOpen } from 'react-icons/lu';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState } from 'react';
import { componentStyles } from '../styles/components';
import { useBookmarkStore } from '../store/bookmarkStore';
import { useIsMobile } from '../hooks/useMobile';
import { ErrorBoundary } from './ErrorBoundary';
import { DragPreview } from './DragPreview';
import { MobileSidebarDrawer } from './MobileSidebarDrawer';
import { MobileHeaderContainer } from './MobileHeaderContainer';
import AIInsights from './AIInsights';
import UnifiedSidebar from './UnifiedSidebar';
import SearchHeader from './SearchHeader';
import AdvancedFilters from './AdvancedFilters';
import FilterBar from './FilterBar';
import CollectionsActions from './collections/CollectionsActions';
import InfiniteBookmarkGrid from './InfiniteBookmarkGrid';
import { BulkActionsBar } from './BulkActionsBar';

const XBookmarkManager = () => {
  const { bookmarks } = useBookmarkStore()
  const isMobile = useIsMobile()
  const toggleMobileHeader = useBookmarkStore((state) => state.toggleMobileHeader)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const text = await file.text()
          const data = JSON.parse(text)

          // Check if this looks like X bookmark data (array with tweet-like structure)
          if (Array.isArray(data) && data.length > 0 && data[0].tweet_id && data[0].username) {
            await useBookmarkStore.getState().importXBookmarks(data) // Import all bookmarks
          } else {
            await useBookmarkStore.getState().importBookmarks(file)
          }
        } catch (error) {
          console.error('Import failed:', error)
          alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }
    input.click()
  }

  return (
    <Box {...componentStyles.container.background} data-testid="x-bookmark-manager" w="100vw" h="100vh" overflow="hidden">
      {bookmarks.length === 0 ? (
        // Empty state - full window
        <Flex
          h="100%"
          w="100%"
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          gap={8}
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <Box style={{ color: 'var(--color-blue)' }} fontSize="6xl">
            <LuFolderOpen />
          </Box>
          <VStack gap={3}>
            <Text fontSize="2xl" fontWeight="600" style={{ color: 'var(--color-text-primary)' }}>
              No bookmarks yet
            </Text>
            <Text fontSize="lg" maxW="500px">
              Get started by importing your existing bookmarks or adding new ones manually.
            </Text>
          </VStack>
          <HStack gap={4}>
            <Button
              size="lg"
              style={{ background: 'var(--color-blue)' }}
              color="white"
              _hover={{ bg: "var(--color-blue-hover)" }}
              onClick={handleImport}
            >
              <HStack gap={2}>
                <LuImport />
                <Text>Import Bookmarks</Text>
              </HStack>
            </Button>
            <Button
              size="lg"
              variant="outline"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              _hover={{ bg: "var(--color-border)", borderColor: "var(--color-border-hover)" }}
            >
              <HStack gap={2}>
                <LuBookmarkPlus />
                <Text>Add Bookmark</Text>
              </HStack>
            </Button>
          </HStack>
        </Flex>
      ) : (
        // Normal layout with bookmarks - wrapped with DndProvider
        <DndProvider backend={HTML5Backend}>
          <DragPreview />

          {/* Mobile Sidebar Drawer */}
          {isMobile && (
            <MobileSidebarDrawer
              isOpen={isMobileDrawerOpen}
              onClose={() => setIsMobileDrawerOpen(false)}
            />
          )}

          <Flex h="100%" w="100%" overflow="hidden">
            {/* Desktop Sidebar - Hidden on mobile */}
            {!isMobile && (
              <ErrorBoundary context="UnifiedSidebar">
                <UnifiedSidebar />
              </ErrorBoundary>
            )}

            {/* Main Content */}
            <Flex flex={1} direction="column" w="100%" minW={0} overflow="hidden">
              {/* Mobile Header with Swipe Gesture */}
              {isMobile ? (
                <>
                  <MobileHeaderContainer>
                    {/* Header */}
                    <ErrorBoundary context="SearchHeader">
                      <SearchHeader onMenuClick={() => setIsMobileDrawerOpen(true)} />
                    </ErrorBoundary>

                    {/* Advanced Filters Panel */}
                    <ErrorBoundary context="AdvancedFilters">
                      <AdvancedFilters />
                    </ErrorBoundary>

                    {/* Filter Bar */}
                    <ErrorBoundary context="FilterBar">
                      <FilterBar />
                    </ErrorBoundary>
                  </MobileHeaderContainer>

                  {/* Toggle Header Button - Subtle */}
                  <Box
                    position="relative"
                    h="6px"
                    bg="var(--color-bg-primary)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={toggleMobileHeader}
                    _hover={{ bg: 'var(--color-bg-secondary)' }}
                    transition="background-color 0.2s ease"
                  >
                    <Box
                      w="32px"
                      h="3px"
                      borderRadius="full"
                      bg="var(--color-border)"
                      opacity={0.5}
                      transition="opacity 0.2s ease"
                      _hover={{ opacity: 0.8 }}
                    />
                  </Box>
                </>
              ) : (
                <>
                  {/* Desktop Header - No Container */}
                  <ErrorBoundary context="SearchHeader">
                    <SearchHeader onMenuClick={() => setIsMobileDrawerOpen(true)} />
                  </ErrorBoundary>

                  {/* Advanced Filters Panel */}
                  <ErrorBoundary context="AdvancedFilters">
                    <AdvancedFilters />
                  </ErrorBoundary>

                  {/* Filter Bar */}
                  <ErrorBoundary context="FilterBar">
                    <FilterBar />
                  </ErrorBoundary>

                  {/* Collections Actions Panel - Desktop only */}
                  <ErrorBoundary context="CollectionsActions">
                    <CollectionsActions />
                  </ErrorBoundary>
                </>
              )}

              {/* Infinite Scroll Bookmarks Grid */}
              <ErrorBoundary context="InfiniteBookmarkGrid">
                <InfiniteBookmarkGrid />
              </ErrorBoundary>
            </Flex>

            {/* AI Insights Panel */}
            <ErrorBoundary context="AIInsights">
              <AIInsights />
            </ErrorBoundary>
          </Flex>

          {/* Bulk Actions Bar - Floating */}
          <ErrorBoundary context="BulkActionsBar">
            <BulkActionsBar />
          </ErrorBoundary>

        </DndProvider>
      )}
    </Box>
  );
};

export default XBookmarkManager;