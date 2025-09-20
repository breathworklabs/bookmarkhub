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
  Group,
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
import { mockBookmarks, type Bookmark } from '../data/mockBookmarks.ts';

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
      bg="#1a1d23"
      borderWidth="1px"
      borderColor="#2a2d35"
      borderRadius="lg"
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
      <Text
        fontSize="sm"
        lineHeight="1.4"
        color="#e1e5e9"
        mb={bookmark.hasMedia ? 3 : 4}
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
          mb={4}
        >
          📷 Media Content
        </Box>
      )}

      {/* Metrics */}
      <HStack gap={8} color="#71767b" fontSize="sm" mb={3}>
        <HStack gap={2} cursor="pointer" _hover={{ color: '#e91e63' }}>
          <Text>❤️</Text>
          <Text>{bookmark.metrics.likes}</Text>
        </HStack>
        <HStack gap={2} cursor="pointer" _hover={{ color: '#00ba7c' }}>
          <Text>🔄</Text>
          <Text>{bookmark.metrics.retweets}</Text>
        </HStack>
        <HStack gap={2} cursor="pointer" _hover={{ color: '#1d9bf0' }}>
          <Text>💬</Text>
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
            _hover={{ bg: '#2a2d35', color: bookmark.isStarred ? '#ffd700' : '#e1e5e9' }}
          >
            <LuStar fill={bookmark.isStarred ? 'currentColor' : 'none'} />
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Share bookmark"
            color="#71767b"
            _hover={{ bg: '#2a2d35', color: '#e1e5e9' }}
          >
            <LuExternalLink />
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Archive bookmark"
            color="#71767b"
            _hover={{ bg: '#2a2d35', color: '#e1e5e9' }}
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
    </Card.Root>
  );

  return (
    <Box bg="#0f1419" minH="100vh">
      <Flex h="100vh">
        {/* Sidebar */}
        <Box w="280px" bg="#16181c" borderRightWidth="1px" borderColor="gray.700" p={5}>
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
          <Box bg="#0f1419" borderBottomWidth="1px" borderColor="gray.700" p={4}>
            <HStack gap={4}>
              <Group maxW="500px" flex={1}>
                <Input
                  placeholder="Search tweets, content, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Group>

              <Spacer />

              <HStack gap={2}>
                <Button variant="outline" color="gray.300" borderColor="gray.600" _hover={{ bg: 'gray.700' }}>
                  <LuMenu /> Filters
                </Button>
                <Button variant="outline" color="gray.300" borderColor="gray.600" _hover={{ bg: 'gray.700' }}>
                  <LuPlus /> Import
                </Button>
                <Button colorPalette="blue">
                  <LuPlus /> Add Bookmark
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* Filter Bar */}
          <Box bg="#0f1419" borderBottomWidth="1px" borderColor="gray.700" p={4}>
            <HStack gap={4}>
              <HStack gap={2}>
                <Button
                  variant={activeTab === 0 ? 'solid' : 'ghost'}
                  colorPalette={activeTab === 0 ? 'blue' : undefined}
                  color={activeTab === 0 ? 'white' : 'gray.300'}
                  _hover={{ bg: activeTab === 0 ? 'blue.600' : 'gray.700' }}
                  onClick={() => setActiveTab(0)}
                >All</Button>
                <Button
                  variant={activeTab === 1 ? 'solid' : 'ghost'}
                  colorPalette={activeTab === 1 ? 'blue' : undefined}
                  color={activeTab === 1 ? 'white' : 'gray.300'}
                  _hover={{ bg: activeTab === 1 ? 'blue.600' : 'gray.700' }}
                  onClick={() => setActiveTab(1)}
                >Today</Button>
                <Button
                  variant={activeTab === 2 ? 'solid' : 'ghost'}
                  colorPalette={activeTab === 2 ? 'blue' : undefined}
                  color={activeTab === 2 ? 'white' : 'gray.300'}
                  _hover={{ bg: activeTab === 2 ? 'blue.600' : 'gray.700' }}
                  onClick={() => setActiveTab(2)}
                >This Week</Button>
                <Button
                  variant={activeTab === 3 ? 'solid' : 'ghost'}
                  colorPalette={activeTab === 3 ? 'blue' : undefined}
                  color={activeTab === 3 ? 'white' : 'gray.300'}
                  _hover={{ bg: activeTab === 3 ? 'blue.600' : 'gray.700' }}
                  onClick={() => setActiveTab(3)}
                >Threads</Button>
                <Button
                  variant={activeTab === 4 ? 'solid' : 'ghost'}
                  colorPalette={activeTab === 4 ? 'blue' : undefined}
                  color={activeTab === 4 ? 'white' : 'gray.300'}
                  _hover={{ bg: activeTab === 4 ? 'blue.600' : 'gray.700' }}
                  onClick={() => setActiveTab(4)}
                >Media</Button>
              </HStack>

              <Spacer />

              <HStack gap={2}>
                <For each={selectedTags}>
                  {(tag) => (
                    <Badge key={tag} colorPalette="purple" cursor="pointer" onClick={() => removeTag(tag)} color="white">
                      {tag} ×
                    </Badge>
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