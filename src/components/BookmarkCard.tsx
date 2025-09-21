import { Box, HStack, VStack, Text, IconButton, Badge, Card, Separator, For, Wrap, WrapItem } from '@chakra-ui/react'
import { LuMenu, LuStar, LuExternalLink, LuDownload } from 'react-icons/lu'
import { type Bookmark } from '../types/bookmark'
import { useBookmarkStore } from '../store/bookmarkStore'

interface BookmarkCardProps {
  bookmark: Bookmark
}

const BookmarkCard = ({ bookmark }: BookmarkCardProps) => {
  const toggleStarBookmark = useBookmarkStore((state) => state.toggleStarBookmark)

  // Helper functions to handle both mock and database bookmark formats
  const getAuthorName = () => {
    if (typeof (bookmark as any).author === 'string') {
      return (bookmark as any).author || 'Unknown Author'
    }
    return (bookmark as any).author?.name || 'Unknown Author'
  }

  const getAuthorInitial = () => {
    const name = getAuthorName()
    return name.charAt(0).toUpperCase()
  }

  const getAuthorUsername = () => {
    if (typeof (bookmark as any).author === 'string') {
      return (bookmark as any).domain || 'unknown'
    }
    return (bookmark as any).author?.username || (bookmark as any).domain || 'unknown'
  }

  const getTimestamp = () => {
    // Handle both timestamp (mock) and created_at (database) formats
    const timestamp = (bookmark as any).timestamp || (bookmark as any).created_at
    if (timestamp) {
      return new Date(timestamp).toLocaleDateString()
    }
    return 'Unknown date'
  }

  const hasMedia = () => {
    return (bookmark as any).hasMedia || (bookmark as any).thumbnail_url
  }

  const getContent = () => {
    return (bookmark as any).content || (bookmark as any).description || 'No content available'
  }

  const getMetrics = () => {
    return (bookmark as any).metrics || { likes: '0', retweets: '0', replies: '0' }
  }

  const isStarred = () => {
    return (bookmark as any).isStarred || (bookmark as any).is_starred || false
  }

  const getTags = (): string[] => {
    const tags = (bookmark as any).tags || []
    // Ensure we return an array of strings
    return Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string') : []
  }

  return (
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
          {getAuthorInitial()}
        </Box>
        <VStack alignItems="start" gap={0} flex={1}>
          <Text fontWeight="600" fontSize="sm" color="#e1e5e9">
            {getAuthorName()}
          </Text>
          <Text fontSize="xs" color="#71767b">
            {getAuthorUsername()} · {getTimestamp()}
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
          mb={hasMedia() ? 3 : 0}
          whiteSpace="pre-line"
        >
          {getContent()}
        </Text>

        {/* Media placeholder */}
        {hasMedia() && (
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
            <Text>{getMetrics().likes}</Text>
          </HStack>
          <HStack gap={2} cursor="pointer" _hover={{ color: '#9ca3af' }}>
            <Box w="16px" h="16px" display="flex" alignItems="center" justifyContent="center">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
            </Box>
            <Text>{getMetrics().retweets}</Text>
          </HStack>
          <HStack gap={2} cursor="pointer" _hover={{ color: '#9ca3af' }}>
            <Box w="16px" h="16px" display="flex" alignItems="center" justifyContent="center">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
              </svg>
            </Box>
            <Text>{getMetrics().replies}</Text>
          </HStack>
        </HStack>

        <Separator borderColor="#2a2d35" mb={3} />

        {/* Actions and Tags */}
        <VStack alignItems="stretch" gap={2}>
          {getTags().length > 0 && (
            <Wrap gap={2}>
              <For each={getTags()}>
                {(tag) => (
                  <WrapItem key={tag}>
                    <Badge
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
                  </WrapItem>
                )}
              </For>
            </Wrap>
          )}
          <HStack gap={1}>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Star bookmark"
              color={isStarred() ? '#ffd700' : '#71767b'}
              borderRadius="full"
              w="32px"
              h="32px"
              minW="32px"
              border="1px solid #2f3336"
              _hover={{
                bg: '#2a2d35',
                color: isStarred() ? '#ffd700' : '#e1e5e9',
                borderColor: '#3a3d45',
                transform: 'scale(1.1)',
                transition: 'all 0.2s'
              }}
              onClick={() => toggleStarBookmark(bookmark.id)}
            >
              <LuStar fill={isStarred() ? 'currentColor' : 'none'} />
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
        </VStack>
      </Box>
    </Card.Root>
  )
}

export default BookmarkCard