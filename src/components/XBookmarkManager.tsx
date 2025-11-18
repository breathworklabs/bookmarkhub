import { Box, Flex } from '@chakra-ui/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState } from 'react'
import { componentStyles } from '../styles/components'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useSettingsStore } from '../store/settingsStore'
import { useIsMobile } from '../hooks/useMobile'
import { ErrorBoundary } from './ErrorBoundary'
import { DragPreview } from './DragPreview'
import { MobileSidebarDrawer } from './MobileSidebarDrawer'
import { MobileHeaderContainer } from './MobileHeaderContainer'
import AIInsights from './AIInsights'
import UnifiedSidebar from './UnifiedSidebar'
import SearchHeader from './SearchHeader'
import AdvancedFilters from './AdvancedFilters'
import FilterBar from './FilterBar'
import CollectionsActions from './collections/CollectionsActions'
import InfiniteBookmarkGrid from './InfiniteBookmarkGrid'
import { BulkActionsBar } from './BulkActionsBar'
import { DemoModeInfoModal } from './modals/DemoModeInfoModal'

const XBookmarkManager = () => {
  const isMobile = useIsMobile()
  const toggleMobileHeader = useBookmarkStore(
    (state) => state.toggleMobileHeader
  )
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Demo mode modal state
  const showDemoInfoModal = useSettingsStore((state) => state.showDemoInfoModal)
  const setShowDemoInfoModal = useSettingsStore((state) => state.setShowDemoInfoModal)

  return (
    <Box
      {...componentStyles.container.background}
      data-testid="x-bookmark-manager"
      w="100vw"
      h="100vh"
      overflow="hidden"
    >
      {/* Always show main layout - empty state is handled by App.tsx with OnboardingScreen */}
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
            <Flex
              flex={1}
              direction="column"
              w="100%"
              minW={0}
              overflow="hidden"
            >
              {/* Mobile Header with Swipe Gesture */}
              {isMobile ? (
                <>
                  <MobileHeaderContainer>
                    {/* Header */}
                    <ErrorBoundary context="SearchHeader">
                      <SearchHeader
                        onMenuClick={() => setIsMobileDrawerOpen(true)}
                      />
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
                    <SearchHeader
                      onMenuClick={() => setIsMobileDrawerOpen(true)}
                    />
                  </ErrorBoundary>

                  {/* Advanced Filters Panel */}
                  <ErrorBoundary context="AdvancedFilters">
                    <AdvancedFilters />
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

      {/* Demo Mode Info Modal */}
      <DemoModeInfoModal
        isOpen={showDemoInfoModal}
        onClose={() => setShowDemoInfoModal(false)}
      />
    </Box>
  )
}

export default XBookmarkManager
