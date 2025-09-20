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
    <Card.Root>
      <Card.Body>
        <VStack gap={3}>
          {/* Header */}
          <HStack>
            <Box
              w={8}
              h={8}
              borderRadius="full"
              bg="gray.300"
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
              <Text fontWeight="bold" fontSize="sm">
                {bookmark.author.name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {bookmark.author.username}
              </Text>
            </VStack>
            <Text fontSize="xs" color="gray.500">
              {bookmark.timestamp}
            </Text>
          </HStack>

          {/* Content */}
          <Text fontSize="sm" lineHeight="1.5">
            {bookmark.content}
          </Text>

          {/* Media placeholder */}
          {bookmark.hasMedia && (
            <Box
              h="150px"
              bg="gray.100"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="gray.500"
            >
              📷 Image Preview
            </Box>
          )}

          {/* Metrics */}
          <HStack gap={6} color="gray.500" fontSize="sm">
            <HStack gap={1}>
              <Box as="span">❤️</Box>
              <Text>{bookmark.metrics.likes}</Text>
            </HStack>
            <HStack gap={1}>
              <Box as="span">🔄</Box>
              <Text>{bookmark.metrics.retweets}</Text>
            </HStack>
            <HStack gap={1}>
              <Box as="span">💬</Box>
              <Text>{bookmark.metrics.replies}</Text>
            </HStack>
          </HStack>

          <Separator />

          {/* Actions and Tags */}
          <HStack justify="space-between">
            <HStack gap={2}>
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Star bookmark"
                color={bookmark.isStarred ? 'yellow.400' : 'gray.400'}
              >
                <LuStar />
              </IconButton>
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Share bookmark"
              >
                <LuExternalLink />
              </IconButton>
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Archive bookmark"
              >
                <LuDownload />
              </IconButton>
            </HStack>
            <HStack gap={1}>
              <For each={bookmark.tags}>
                {(tag) => (
                  <Badge key={tag} colorPalette="purple">
                    {tag}
                  </Badge>
                )}
              </For>
            </HStack>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );

  return (
    <Box bg="gray.50" minH="100vh">
      <Flex h="100vh">
        {/* Sidebar */}
        <Box w="280px" bg="white" borderRightWidth="1px" borderColor="gray.200" p={5}>
          <VStack alignItems="stretch" gap={6} h="full">
            {/* Logo */}
            <HStack gap={3} pb={4} borderBottomWidth="1px" borderColor="gray.200">
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
              <Text fontSize="lg" fontWeight="bold">
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
                    color={item.active ? 'white' : 'black'}
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
              borderColor="gray.200"
              mt="auto"
            >
              <LuSettings />
              <Text>Settings</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Main Content */}
        <Flex flex={1} direction="column">
          {/* Header */}
          <Box bg="white" borderBottomWidth="1px" borderColor="gray.200" p={4}>
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
                <Button variant="outline">
                  <LuMenu /> Filters
                </Button>
                <Button variant="outline">
                  <LuPlus /> Import
                </Button>
                <Button colorPalette="blue">
                  <LuPlus /> Add Bookmark
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* Filter Bar */}
          <Box bg="white" borderBottomWidth="1px" borderColor="gray.200" p={4}>
            <HStack gap={4}>
              <HStack gap={2}>
                <Button variant={activeTab === 0 ? 'solid' : 'ghost'} onClick={() => setActiveTab(0)}>All</Button>
                <Button variant={activeTab === 1 ? 'solid' : 'ghost'} onClick={() => setActiveTab(1)}>Today</Button>
                <Button variant={activeTab === 2 ? 'solid' : 'ghost'} onClick={() => setActiveTab(2)}>This Week</Button>
                <Button variant={activeTab === 3 ? 'solid' : 'ghost'} onClick={() => setActiveTab(3)}>Threads</Button>
                <Button variant={activeTab === 4 ? 'solid' : 'ghost'} onClick={() => setActiveTab(4)}>Media</Button>
              </HStack>

              <Spacer />

              <HStack gap={2}>
                <For each={selectedTags}>
                  {(tag) => (
                    <Badge key={tag} colorPalette="purple" cursor="pointer" onClick={() => removeTag(tag)}>
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
                    onClick={() => setViewMode('grid')}
                  >
                    <LuEye />
                  </IconButton>
                  <IconButton
                    aria-label="List view"
                    variant={viewMode === 'list' ? 'solid' : 'outline'}
                    onClick={() => setViewMode('list')}
                  >
                    <LuMenu />
                  </IconButton>
                </HStack>

                <Text color="gray.500" fontSize="sm">
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
        <Box w="320px" bg="white" borderLeftWidth="1px" borderColor="gray.200" p={5}>
          <VStack alignItems="stretch" gap={6}>
            <Heading size="md">AI Insights</Heading>

            <VStack alignItems="stretch" gap={3}>
              <Text fontWeight="semibold">Trending Topics</Text>
              <For each={['AI & Machine Learning', 'Web Development', 'Tesla & EVs', 'Crypto & Blockchain']}>
                {(topic, index) => (
                  <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm">{topic}</Text>
                    <Text fontSize="xs" color="gray.500">{Math.floor(Math.random() * 50 + 10)}</Text>
                  </HStack>
                )}
              </For>
            </VStack>

            <VStack alignItems="stretch" gap={3}>
              <Text fontWeight="semibold">Smart Suggestions</Text>
              <Box p={3} bg="blue.50" borderRadius="md" borderLeftWidth="3px" borderColor="blue.500">
                <Text fontSize="sm">
                  You have 12 bookmarks about AI that could be organized into a collection.
                </Text>
                <Button size="xs" mt={2} colorPalette="blue">
                  Create Collection
                </Button>
              </Box>

              <Box p={3} bg="green.50" borderRadius="md" borderLeftWidth="3px" borderColor="green.500">
                <Text fontSize="sm">
                  3 of your bookmarked links are no longer available.
                </Text>
                <Button size="xs" mt={2} colorPalette="green">
                  Review Links
                </Button>
              </Box>
            </VStack>

            <VStack alignItems="stretch" gap={3}>
              <Text fontWeight="semibold">Recent Activity</Text>
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
                        <Text fontSize="sm">{activity.action}</Text>
                        <Text fontSize="xs" color="gray.500">{activity.time}</Text>
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