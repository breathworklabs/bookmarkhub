import { Box, Flex } from '@chakra-ui/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState, useEffect } from 'react'
import { componentStyles } from '@/styles/components'
import { useBookmarkStore } from '@/store/bookmarkStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useIsMobile } from '@/hooks/useMobile'
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
import { WhatsNewModal } from './modals/WhatsNewModal'
import { LATEST_CHANGELOG_VERSION } from '@/data/changelog'
import InteractiveTour from './tour/InteractiveTour'

const XBookmarkManager = () => {
  const isMobile = useIsMobile()
  const toggleMobileHeader = useBookmarkStore(
    (state) => state.toggleMobileHeader
  )
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Demo mode modal state
  const showDemoInfoModal = useSettingsStore((state) => state.showDemoInfoModal)
  const setShowDemoInfoModal = useSettingsStore((state) => state.setShowDemoInfoModal)

  // What's New modal state
  const showWhatsNewModal = useSettingsStore((state) => state.showWhatsNewModal)
  const setShowWhatsNewModal = useSettingsStore((state) => state.setShowWhatsNewModal)

  // Tour state
  const hasCompletedTour = useSettingsStore((state) => state.tour.hasCompletedTour)
  const tourDismissed = useSettingsStore((state) => state.tour.tourDismissed)
  const hasSeenSplash = useSettingsStore((state) => state.hasSeenSplash)
  const startTour = useSettingsStore((state) => state.startTour)

  // What's New modal close handler
  const handleWhatsNewClose = () => {
    setShowWhatsNewModal(false)
    useSettingsStore.getState().setLastSeenChangelogVersion(LATEST_CHANGELOG_VERSION)
  }

  // Handle demo modal close - start tour after dismissing demo modal
  const handleDemoModalClose = () => {
    setShowDemoInfoModal(false)
    // Start tour after modal closes if user hasn't completed it yet
    if (!hasCompletedTour && !tourDismissed && !isMobile) {
      // Delay slightly to ensure modal is fully closed
      setTimeout(() => {
        startTour()
      }, 500)
    }
  }

  // Expose startTour for e2e testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__startTour = startTour
    }
  }, [startTour])

  // Auto-start tour for first-time users
  useEffect(() => {
    // Start tour if:
    // 1. User has seen the splash page (not a brand new user)
    // 2. User hasn't completed the tour
    // 3. User hasn't dismissed the tour
    // 4. Not on mobile (tour is better on desktop)
    // 5. Demo modal is not showing (tour will start when modal closes instead)
    if (hasSeenSplash && !hasCompletedTour && !tourDismissed && !isMobile && !showDemoInfoModal) {
      // Delay slightly to ensure all components are mounted
      const timer = setTimeout(() => {
        startTour()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [hasSeenSplash, hasCompletedTour, tourDismissed, isMobile, showDemoInfoModal, startTour])

  // Auto-show What's New for returning users when there are unseen changes
  useEffect(() => {
    if (!hasSeenSplash) return
    if (showDemoInfoModal) return
    const { lastSeenChangelogVersion } = useSettingsStore.getState()
    if (lastSeenChangelogVersion === null || lastSeenChangelogVersion < LATEST_CHANGELOG_VERSION) {
      const timer = setTimeout(() => {
        setShowWhatsNewModal(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [hasSeenSplash, showDemoInfoModal, setShowWhatsNewModal])

  return (
    <Box
      {...componentStyles.container.background}
      data-testid="x-bookmark-manager"
      data-tour="app-container"
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
        onClose={handleDemoModalClose}
      />

      {/* What's New Modal */}
      <WhatsNewModal
        isOpen={showWhatsNewModal}
        onClose={handleWhatsNewClose}
      />

      {/* Interactive Tour */}
      <InteractiveTour />
    </Box>
  )
}

export default XBookmarkManager
