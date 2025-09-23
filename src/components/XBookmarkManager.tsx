import { Box, Flex, VStack, Text, Button, HStack } from '@chakra-ui/react';
import { LuImport, LuBookmarkPlus, LuFolderOpen } from 'react-icons/lu';
import { theme } from '../styles/theme';
import { useBookmarkStore } from '../store/bookmarkStore';
import AIInsights from './AIInsights';
import UnifiedSidebar from './UnifiedSidebar';
import SearchHeader from './SearchHeader';
import AdvancedFilters from './AdvancedFilters';
import FilterBar from './FilterBar';
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
          console.log('File selected:', file.name)
          const text = await file.text()
          const data = JSON.parse(text)

          console.log('Parsed JSON data:', data)

          // Check if this looks like X bookmark data (array with tweet-like structure)
          if (Array.isArray(data) && data.length > 0 && data[0].tweet_id && data[0].username) {
            console.log('Detected X bookmark format, importing as X bookmarks...')
            await useBookmarkStore.getState().importXBookmarks(data) // Import all bookmarks
            console.log('X bookmarks import completed successfully')

          } else {
            console.log('Detected standard bookmark format, using regular import...')
            await useBookmarkStore.getState().importBookmarks(file)
            console.log('Standard bookmarks import completed successfully')
          }

          // Only refresh on successful import
          console.log('Import successful, refreshing UI...')
          // window.location.reload()
        } catch (error) {
          console.error('Import failed:', error)
          alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }
    input.click()
  }

  return (
    <Box {...theme.styles.container.background}>
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
          color="#71767b"
        >
          <Box color="#3b82f6" fontSize="6xl">
            <LuFolderOpen />
          </Box>
          <VStack gap={3}>
            <Text fontSize="2xl" fontWeight="600" color="#e1e5e9">
              No bookmarks yet
            </Text>
            <Text fontSize="lg" maxW="500px">
              Get started by importing your existing bookmarks or adding new ones manually.
            </Text>
          </VStack>
          <HStack gap={4}>
            <Button
              size="lg"
              bg="#1d4ed8"
              color="white"
              _hover={{ bg: "#1e40af" }}
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
              borderColor="#2a2d35"
              color="#e1e5e9"
              _hover={{ bg: "#2a2d35", borderColor: "#3a3d45" }}
            >
              <HStack gap={2}>
                <LuBookmarkPlus />
                <Text>Add Bookmark</Text>
              </HStack>
            </Button>
          </HStack>
        </Flex>
      ) : (
        // Normal layout with bookmarks
        <Flex h="100vh">
          {/* Sidebar */}
          <UnifiedSidebar />

          {/* Main Content */}
          <Flex flex={1} direction="column">
            {/* Header */}
            <SearchHeader />

            {/* Advanced Filters Panel */}
            <AdvancedFilters />

            {/* Filter Bar */}
            <FilterBar />

            {/* Infinite Scroll Bookmarks Grid */}
            <InfiniteBookmarkGrid />
          </Flex>

          {/* AI Insights Panel */}
          <AIInsights />
        </Flex>
      )}
    </Box>
  );
};

export default XBookmarkManager;