import { useState } from 'react';
import { Box, Flex, VStack, SimpleGrid, For } from '@chakra-ui/react';
import { mockBookmarks } from '../data/mockBookmarks';
import { theme } from '../styles/theme';
import AIInsights from './AIInsights';
import SidebarMenu from './SidebarMenu';
import SearchHeader from './SearchHeader';
import FilterBar from './FilterBar';
import BookmarkCard from './BookmarkCard';

const XBookmarkManager = () => {
  const [selectedTags, setSelectedTags] = useState(['tech', 'AI']);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState(0);

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Box {...theme.styles.container.background}>
      <Flex h="100vh">
        {/* Sidebar */}
        <SidebarMenu />

        {/* Main Content */}
        <Flex flex={1} direction="column">
          {/* Header */}
          <SearchHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Filter Bar */}
          <FilterBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedTags={selectedTags}
            removeTag={removeTag}
          />

          {/* Bookmarks Grid */}
          <Box flex={1} p={6} overflowY="auto">
            <VStack alignItems="stretch" gap={6}>
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                gap={6}
                w="full"
              >
                <For each={mockBookmarks}>
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