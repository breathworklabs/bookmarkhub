import { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  IconButton,
  SimpleGrid,
  Heading,
  Spacer,
  Separator,
  Badge,
  Card,
  For,
} from '@chakra-ui/react';
import {
  LuStar,
  LuSettings,
  LuPlus,
  LuEye,
  LuDownload,
  LuExternalLink,
  LuRotateCcw,
  LuMenu,
} from 'react-icons/lu';
import { mockBookmarks, type Bookmark } from '../data/mockBookmarks';
import { theme } from '../styles/theme';

const XBookmarkManager = () => {
  const [selectedTags, setSelectedTags] = useState(['tech', 'AI']);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState(0);


  const sidebarItems = [
    { icon: LuMenu, label: 'All Bookmarks', count: '2,847', active: true },
    { icon: LuStar, label: 'Starred', count: '156' },
    { icon: LuEye, label: 'Collections', count: null },
    { icon: LuRotateCcw, label: 'AI Insights', badge: 'New' },
    { icon: LuDownload, label: 'Archives', count: null },
    { icon: LuExternalLink, label: 'Shared', count: null },
  ];

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const BookmarkCard = ({ bookmark }: { bookmark: Bookmark }) => (
    <Card.Root
      bg="#16181c"
      borderWidth="1px"
      borderColor="#2a2d35"
      borderRadius="16px"
      p={4}
      _hover={{
        borderColor: '#4a9eff',
        transform: 'translateY(-1px)',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Header */}
      <HStack gap={3} mb={3}>
        <Box
          w={10}
          h={10}
          borderRadius="full"
          bg="linear-gradient(135deg, #667eea, #764ba2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="sm"
          fontWeight="bold"
          color="white"
        >
          {bookmark.author.name.charAt(0)}
        </Box>
        <VStack alignItems="start" gap={0} flex={1}>
          <Text fontWeight="600" fontSize="sm" color="#e1e5e9">
            {bookmark.author.name}
          </Text>
          <Text fontSize="xs" color="#71767b">
            {bookmark.author.username} · {bookmark.timestamp}
          </Text>
        </VStack>
        <IconButton
          size="xs"
          variant="ghost"
          aria-label="More options"
          color="#71767b"
          _hover={{ bg: '#2a2d35' }}
        >
          <LuMenu />
        </IconButton>
      </HStack>

      {/* Content */}
      <Box flex={1}>
        <Text
          fontSize="sm"
          lineHeight="1.4"
          color="#e1e5e9"
          mb={bookmark.hasMedia ? 3 : 0}
          whiteSpace="pre-line"
        >
          {bookmark.content}
        </Text>

        {/* Media placeholder */}
        {bookmark.hasMedia && (
          <Box
            h="180px"
            bg="#0f1419"
            borderRadius="lg"
            border="1px solid #2a2d35"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="#71767b"
          >
            📷 Media Content
          </Box>
        )}
      </Box>

      {/* Card Footer */}
      <Box mt={4}>
        {/* Metrics */}
        <HStack gap="24px" color="#71767b" fontSize="sm" mb={3}>
          <HStack gap={2} cursor="pointer" _hover={{ color: '#9ca3af' }}>
            <Box w="16px" h="16px" display="flex" alignItems="center" justifyContent="center">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
            </Box>
            <Text>{bookmark.metrics.likes}</Text>
          </HStack>
          <HStack gap={2} cursor="pointer" _hover={{ color: '#9ca3af' }}>
            <Box w="16px" h="16px" display="flex" alignItems="center" justifyContent="center">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
            </Box>
            <Text>{bookmark.metrics.retweets}</Text>
          </HStack>
          <HStack gap={2} cursor="pointer" _hover={{ color: '#9ca3af' }}>
            <Box w="16px" h="16px" display="flex" alignItems="center" justifyContent="center">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
              </svg>
            </Box>
            <Text>{bookmark.metrics.replies}</Text>
          </HStack>
        </HStack>

        <Separator borderColor="#2a2d35" mb={3} />

        {/* Actions and Tags */}
        <HStack justify="space-between" alignItems="center">
          <HStack gap={1}>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Star bookmark"
              color={bookmark.isStarred ? '#ffd700' : '#71767b'}
              borderRadius="full"
              w="32px"
              h="32px"
              minW="32px"
              border="1px solid #2f3336"
              _hover={{
                bg: '#2a2d35',
                color: bookmark.isStarred ? '#ffd700' : '#e1e5e9',
                borderColor: '#3a3d45',
                transform: 'scale(1.1)',
                transition: 'all 0.2s'
              }}
            >
              <LuStar fill={bookmark.isStarred ? 'currentColor' : 'none'} />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Share bookmark"
              color="#71767b"
              borderRadius="full"
              w="32px"
              h="32px"
              minW="32px"
              border="1px solid #2f3336"
              _hover={{
                bg: '#2a2d35',
                color: '#e1e5e9',
                borderColor: '#3a3d45',
                transform: 'scale(1.1)',
                transition: 'all 0.2s'
              }}
            >
              <LuExternalLink />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Archive bookmark"
              color="#71767b"
              borderRadius="full"
              w="32px"
              h="32px"
              minW="32px"
              border="1px solid #2f3336"
              _hover={{
                bg: '#2a2d35',
                color: '#e1e5e9',
                borderColor: '#3a3d45',
                transform: 'scale(1.1)',
                transition: 'all 0.2s'
              }}
            >
              <LuDownload />
            </IconButton>
          </HStack>
          <HStack gap={2}>
            <For each={bookmark.tags}>
              {(tag) => (
                <Badge
                  key={tag}
                  bg="#2a2d35"
                  color="#71767b"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                  _hover={{ bg: '#3a3d45', color: '#e1e5e9' }}
                  cursor="pointer"
                >
                  #{tag}
                </Badge>
              )}
            </For>
          </HStack>
        </HStack>
      </Box>
    </Card.Root>
  );

  return (
    <Box {...theme.styles.container.background}>
      <Flex h="100vh">
        {/* Sidebar */}
        <Box {...theme.styles.container.sidebar}>
          <VStack alignItems="stretch" gap={6} h="full">
            {/* Logo */}
            <HStack gap={3} pb={4} borderBottomWidth="1px" borderColor="gray.700">
              <Box
                w={8}
                h={8}
                bg="linear-gradient(135deg, #1DA1F2, #8B5CF6)"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="bold"
              >
                X
              </Box>
              <Text fontSize="lg" fontWeight="bold" color="white">
                BookmarkX
              </Text>
            </HStack>

            {/* Navigation */}
            <VStack alignItems="stretch" gap={1} flex={1}>
              <For each={sidebarItems}>
                {(item, index) => (
                  <HStack
                    key={index}
                    p={3}
                    borderRadius="lg"
                    cursor="pointer"
                    bg={item.active ? 'blue.500' : 'transparent'}
                    color={item.active ? 'white' : 'gray.300'}
                    _hover={{ bg: item.active ? 'blue.600' : 'gray.700' }}
                  >
                    <item.icon />
                    <Text flex={1}>{item.label}</Text>
                    {item.count && (
                      <Badge colorPalette={item.active ? 'blue' : 'purple'}>
                        {item.count}
                      </Badge>
                    )}
                    {item.badge && (
                      <Badge colorPalette="red">
                        {item.badge}
                      </Badge>
                    )}
                  </HStack>
                )}
              </For>
            </VStack>

            {/* Settings */}
            <HStack
              p={3}
              borderRadius="lg"
              cursor="pointer"
              borderTopWidth="1px"
              borderColor="gray.700"
              mt="auto"
              color="gray.300"
              _hover={{ bg: 'gray.700' }}
            >
              <LuSettings />
              <Text>Settings</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Main Content */}
        <Flex flex={1} direction="column">
          {/* Header */}
          <Box {...theme.styles.container.header}>
            <HStack gap={6} alignItems="center">
              {/* Search Area */}
              <Box position="relative" maxW="400px" flex={1}>
                <HStack {...theme.styles.searchContainer} gap={2}>
                  <Box w="16px" h="16px" color="#71767b">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>
                  <Input
                    {...theme.styles.searchInput}
                    placeholder="Search bookmarks, content, authors..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  />
                </HStack>
              </Box>

              <Spacer />

              {/* Action Buttons */}
              <HStack gap={3}>
                <Button {...theme.styles.secondaryButton}>
                  <LuMenu size={14} />
                  Filters
                </Button>
                <Button {...theme.styles.secondaryButton}>
                  <LuPlus size={14} />
                  Import
                </Button>
                <Button {...theme.styles.primaryButton}>
                  <LuPlus size={14} />
                  Add Bookmark
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* Filter Bar */}
          <Box bg="#0f1419" borderBottomWidth="1px" borderColor="gray.700" px={6} py={4}>
            <HStack justify="space-between" alignItems="center">
              {/* Filter Tabs */}
              <HStack gap={3}>
                {['All', 'Today', 'This Week', 'Threads', 'Media'].map((label, index) => (
                  <Button
                    key={label}
                    variant="ghost"
                    size="sm"
                    px={4}
                    py={2}
                    borderRadius="20px"
                    bg={activeTab === index ? '#1d4ed8' : 'transparent'}
                    color={activeTab === index ? 'white' : '#71767b'}
                    fontWeight={activeTab === index ? '600' : '400'}
                    fontSize="14px"
                    _hover={{
                      bg: activeTab === index ? '#1e40af' : '#2a2d35',
                      color: activeTab === index ? 'white' : '#e1e5e9'
                    }}
                    onClick={() => setActiveTab(index)}
                  >
                    {label}
                  </Button>
                ))}
              </HStack>

              {/* Tags */}
              <HStack gap={3}>
                <For each={selectedTags}>
                  {(tag) => (
                    <HStack
                      key={tag}
                      bg="#1a1d23"
                      border="1px solid #2a2d35"
                      color="#9ca3af"
                      px={3}
                      py={2}
                      borderRadius="16px"
                      fontSize="13px"
                      fontWeight="500"
                      cursor="pointer"
                      _hover={{
                        bg: '#252932',
                        color: '#e1e5e9',
                        borderColor: '#3a3d45'
                      }}
                      onClick={() => removeTag(tag)}
                      gap={2}
                      alignItems="center"
                    >
                      <Text>#{tag}</Text>
                      <Box
                        w="14px"
                        h="14px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="full"
                        _hover={{ bg: '#4a4d55' }}
                      >
                        <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                        </svg>
                      </Box>
                    </HStack>
                  )}
                </For>
              </HStack>
            </HStack>
          </Box>

          {/* Content Area */}
          <Box flex={1} p={6} overflowY="auto">
            <VStack alignItems="stretch" gap={5}>
              {/* View Controls */}
              <HStack justify="space-between">
                <HStack gap={0}>
                  <IconButton
                    aria-label="Grid view"
                    variant={viewMode === 'grid' ? 'solid' : 'outline'}
                    colorPalette={viewMode === 'grid' ? 'blue' : undefined}
                    color={viewMode === 'grid' ? 'white' : 'gray.300'}
                    borderColor={viewMode === 'grid' ? undefined : 'gray.600'}
                    _hover={{ bg: viewMode === 'grid' ? 'blue.600' : 'gray.700' }}
                    onClick={() => setViewMode('grid')}
                  >
                    <LuEye />
                  </IconButton>
                  <IconButton
                    aria-label="List view"
                    variant={viewMode === 'list' ? 'solid' : 'outline'}
                    colorPalette={viewMode === 'list' ? 'blue' : undefined}
                    color={viewMode === 'list' ? 'white' : 'gray.300'}
                    borderColor={viewMode === 'list' ? undefined : 'gray.600'}
                    _hover={{ bg: viewMode === 'list' ? 'blue.600' : 'gray.700' }}
                    onClick={() => setViewMode('list')}
                  >
                    <LuMenu />
                  </IconButton>
                </HStack>

                <Text color="gray.400" fontSize="sm">
                  2,847 bookmarks • 15 collections • 73 tags
                </Text>
              </HStack>

              {/* Bookmarks Grid */}
              <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} gap={4}>
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
        <Box w="320px" bg="#16181c" borderLeftWidth="1px" borderColor="#2a2d35" p={5}>
          <VStack alignItems="stretch" gap={6}>
            <Heading size="md" color="white">AI Insights</Heading>

            <VStack alignItems="stretch" gap={3}>
              <Text fontWeight="semibold" color="white">Trending Topics</Text>
              <For each={['AI & Machine Learning', 'Web Development', 'Tesla & EVs', 'Crypto & Blockchain']}>
                {(topic, index) => (
                  <HStack key={index} justify="space-between" p={2} bg="gray.700" borderRadius="md">
                    <Text fontSize="sm" color="gray.200">{topic}</Text>
                    <Text fontSize="xs" color="gray.400">{Math.floor(Math.random() * 50 + 10)}</Text>
                  </HStack>
                )}
              </For>
            </VStack>

            <VStack alignItems="stretch" gap={3}>
              <Text fontWeight="semibold" color="white">Smart Suggestions</Text>
              <Box p={3} bg="blue.900" borderRadius="md" borderLeftWidth="3px" borderColor="blue.500">
                <Text fontSize="sm" color="blue.200">
                  You have 12 bookmarks about AI that could be organized into a collection.
                </Text>
                <Button size="xs" mt={2} colorPalette="blue">
                  Create Collection
                </Button>
              </Box>

              <Box p={3} bg="green.900" borderRadius="md" borderLeftWidth="3px" borderColor="green.500">
                <Text fontSize="sm" color="green.200">
                  3 of your bookmarked links are no longer available.
                </Text>
                <Button size="xs" mt={2} colorPalette="green">
                  Review Links
                </Button>
              </Box>
            </VStack>

            <VStack alignItems="stretch" gap={3}>
              <Text fontWeight="semibold" color="white">Recent Activity</Text>
              <VStack alignItems="stretch" gap={2}>
                <For each={[
                  { action: 'Added 5 new bookmarks', time: '2 hours ago' },
                  { action: 'Created "Web3 Research" collection', time: '1 day ago' },
                  { action: 'Starred 3 bookmarks', time: '2 days ago' }
                ]}>
                  {(activity, index) => (
                    <HStack key={index} gap={3}>
                      <Box w={2} h={2} bg="blue.500" borderRadius="full" />
                      <VStack alignItems="start" gap={0} flex={1}>
                        <Text fontSize="sm" color="gray.200">{activity.action}</Text>
                        <Text fontSize="xs" color="gray.400">{activity.time}</Text>
                      </VStack>
                    </HStack>
                  )}
                </For>
              </VStack>
            </VStack>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default XBookmarkManager;