import { Box, Flex, VStack, SimpleGrid, For } from '@chakra-ui/react';
import { theme } from '../styles/theme';
import { useFilteredBookmarks } from '../hooks/useFilteredBookmarks';
import AIInsights from './AIInsights';
import SidebarMenu from './SidebarMenu';
import SearchHeader from './SearchHeader';
import AdvancedFilters from './AdvancedFilters';
import FilterBar from './FilterBar';
import BookmarkCard from './BookmarkCard';

const XBookmarkManager = () => {
  const filteredBookmarks = useFilteredBookmarks()

  return (
    <Box {...theme.styles.container.background}>
      <Flex h="100vh">
        {/* Sidebar */}
        <SidebarMenu />

        {/* Main Content */}
        <Flex flex={1} direction="column">
          {/* Header */}
          <SearchHeader />

          {/* Advanced Filters Panel */}
          <AdvancedFilters />

          {/* Filter Bar */}
          <FilterBar />

          {/* Bookmarks Grid */}
          <Box flex={1} p={4} overflowY="auto">
            <VStack alignItems="stretch" gap={4}>
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3, xl: 4, "2xl": 5 }}
                gap={4}
                w="full"
              >
                <For each={filteredBookmarks}>
                  {(bookmark) => (
                    <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                  )}
                </For>
              </SimpleGrid>
            </VStack>
          </Box>
        </Flex>

        {/* AI Insights Panel */}
        <AIInsights />
      </Flex>
    </Box>
  );
};

export default XBookmarkManager;