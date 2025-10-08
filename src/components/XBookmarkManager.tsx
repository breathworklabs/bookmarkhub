import { Box, Flex, VStack, Text, Button, HStack } from '@chakra-ui/react';
import { LuImport, LuBookmarkPlus, LuFolderOpen } from 'react-icons/lu';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { componentStyles } from '../styles/components';
import { useBookmarkStore } from '../store/bookmarkStore';
import { ErrorBoundary } from './ErrorBoundary';
import { DragPreview } from './DragPreview';
import AIInsights from './AIInsights';
import UnifiedSidebar from './UnifiedSidebar';
import SearchHeader from './SearchHeader';
import AdvancedFilters from './AdvancedFilters';
import FilterBar from './FilterBar';
import CollectionsActions from './collections/CollectionsActions';
import InfiniteBookmarkGrid from './InfiniteBookmarkGrid';

const XBookmarkManager = () => {
  const { bookmarks } = useBookmarkStore()

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
    <Box {...componentStyles.container.background} data-testid="x-bookmark-manager">
      {bookmarks.length === 0 ? (
        // Empty state - full window
        <Flex
          h="100vh"
          w="100vw"
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
          <Flex h="100vh" w="100vw">
            {/* Sidebar */}
            <ErrorBoundary context="UnifiedSidebar">
              <UnifiedSidebar />
            </ErrorBoundary>

            {/* Main Content */}
            <Flex flex={1} direction="column" w="100%">
              {/* Header */}
              <ErrorBoundary context="SearchHeader">
                <SearchHeader />
              </ErrorBoundary>

              {/* Advanced Filters Panel */}
              <ErrorBoundary context="AdvancedFilters">
                <AdvancedFilters />
              </ErrorBoundary>

              {/* Filter Bar */}
              <ErrorBoundary context="FilterBar">
                <FilterBar />
              </ErrorBoundary>

              {/* Collections Actions Panel */}
              <ErrorBoundary context="CollectionsActions">
                <CollectionsActions />
              </ErrorBoundary>

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

        </DndProvider>
      )}
    </Box>
  );
};

export default XBookmarkManager;