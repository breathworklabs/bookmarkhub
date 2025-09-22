import { Box, HStack, VStack, Text, IconButton, Badge, Card, Separator, For, Wrap, WrapItem, Image, SimpleGrid, Menu, Portal } from '@chakra-ui/react'
import { LuMenu, LuStar, LuExternalLink, LuDownload, LuTrash2, LuPencil, LuShare2, LuPlay } from 'react-icons/lu'
import { type Bookmark } from '../types/bookmark'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useModal } from './modals/ModalProvider'
import LazyImage from './LazyImage'

interface BookmarkCardProps {
  bookmark: Bookmark
}

const BookmarkCard = ({ bookmark }: BookmarkCardProps) => {
  const toggleStarBookmark = useBookmarkStore((state) => state.toggleStarBookmark)
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark)
  const updateBookmark = useBookmarkStore((state) => state.updateBookmark)
  const toggleArchiveBookmark = useBookmarkStore((state) => state.toggleArchiveBookmark)
  const { showDeleteConfirmation, showEditBookmark, showImageModal } = useModal()

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

  const getProfileImage = () => {
    // Check for X bookmark _normal profile image in metadata
    const metadata = (bookmark as any).metadata
    if (metadata && metadata.profile_image_normal) {
      return metadata.profile_image_normal
    }

    // Check for general favicon_url which might contain profile image
    if ((bookmark as any).favicon_url && !(bookmark as any).favicon_url.includes('favicon.ico')) {
      return (bookmark as any).favicon_url
    }

    return null
  }

  const getBadgeImage = () => {
    // Check for X bookmark _bigger profile image in metadata
    const metadata = (bookmark as any).metadata
    if (metadata && metadata.profile_image_bigger) {
      console.log('Found badge image:', metadata.profile_image_bigger)
      return metadata.profile_image_bigger
    }

    console.log('No badge image found. Metadata:', metadata)
    return null
  }

  const getAuthorUsername = () => {
    if (typeof (bookmark as any).author === 'string') {
      return (bookmark as any).domain || 'unknown'
    }
    return (bookmark as any).author?.username || (bookmark as any).domain || 'unknown'
  }

  const getTimestamp = () => {
    // For X bookmarks, prefer tweet_date from metadata
    const metadata = (bookmark as any).metadata
    if (metadata && metadata.tweet_date) {
      return new Date(metadata.tweet_date).toLocaleDateString()
    }

    // Fallback to general timestamp or created_at
    const timestamp = (bookmark as any).timestamp || (bookmark as any).created_at
    if (timestamp) {
      return new Date(timestamp).toLocaleDateString()
    }
    return 'Unknown date'
  }

  const hasMedia = () => {
    // Check for general media fields
    const hasGeneralMedia = (bookmark as any).hasMedia || (bookmark as any).thumbnail_url

    // Check for X bookmark specific media
    const metadata = (bookmark as any).metadata
    const hasXMedia = metadata && (
      (metadata.images && metadata.images.length > 0) ||
      metadata.has_video
    )

    return hasGeneralMedia || hasXMedia
  }

  const getMediaContent = () => {
    const metadata = (bookmark as any).metadata

    // Handle X bookmark media
    if (metadata && (metadata.images || metadata.has_video)) {
      return {
        type: metadata.has_video ? 'video' : 'images',
        images: metadata.images || [],
        hasVideo: metadata.has_video || false
      }
    }

    // Handle general thumbnail
    if ((bookmark as any).thumbnail_url) {
      return {
        type: 'images',
        images: [(bookmark as any).thumbnail_url],
        hasVideo: false
      }
    }

    return null
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
          overflow="hidden"
          bg="linear-gradient(135deg, #667eea, #764ba2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="sm"
          fontWeight="bold"
          color="white"
          position="relative"
        >
          {getProfileImage() ? (
            <LazyImage
              src={getProfileImage()}
              alt={`${getAuthorName()} profile`}
              w="100%"
              h="100%"
              objectFit="cover"
              position="absolute"
              top={0}
              left={0}
              fallback={
                <Box
                  w="100%"
                  h="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="linear-gradient(135deg, #667eea, #764ba2)"
                  color="white"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {getAuthorInitial()}
                </Box>
              }
            />
          ) : null}
          {/* Fallback initial */}
          <Box
            position={getProfileImage() ? "absolute" : "static"}
            zIndex={getProfileImage() ? -1 : 1}
          >
            {getAuthorInitial()}
          </Box>
        </Box>
        <VStack alignItems="start" gap={0} flex={1}>
          <HStack gap={2} alignItems="center">
            <Text fontWeight="600" fontSize="sm" color="#e1e5e9">
              {getAuthorName()}
            </Text>
            {getBadgeImage() && (
              <Box
                w="16px"
                h="16px"
                borderRadius="2px"
                overflow="hidden"
                border="1px solid #1d4ed8"
                flexShrink={0}
                bg="#1d4ed8"
                p="1px"
                title="Verified profile"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <LazyImage
                  src={getBadgeImage()}
                  alt={`${getAuthorName()} verified`}
                  w="14px"
                  h="14px"
                  objectFit="cover"
                  borderRadius="1px"
                  fallback={
                    <Box
                      w="14px"
                      h="14px"
                      bg="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="8px"
                      color="#1d4ed8"
                      borderRadius="1px"
                    >
                      ✓
                    </Box>
                  }
                />
              </Box>
            )}
          </HStack>
          <Text fontSize="xs" color="#71767b">
            {getAuthorUsername()} · {getTimestamp()}
          </Text>
        </VStack>
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Bookmark actions"
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
              <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                <Text fontSize="md" lineHeight="1">☰</Text>
              </Box>
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content
                bg="#1a1d23"
                border="1px solid #2a2d35"
                borderRadius="8px"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                py={1}
                minW="160px"
              >
                <Menu.Item
                  value="archive"
                  color="#e1e5e9"
                  _hover={{
                    bg: '#2a2d35',
                    color: '#ffffff'
                  }}
                  _focus={{
                    bg: '#2a2d35',
                    color: '#ffffff'
                  }}
                  onClick={() => toggleArchiveBookmark(bookmark.id)}
                  px={3}
                  py={2}
                  fontSize="sm"
                  cursor="pointer"
                  transition="all 0.15s ease"
                >
                  <HStack gap={2}>
                    <LuDownload size={14} color={bookmark.is_archived ? '#f59e0b' : '#71767b'} />
                    <Text>{bookmark.is_archived ? 'Unarchive' : 'Archive'}</Text>
                  </HStack>
                </Menu.Item>
                <Menu.Item
                  value="edit"
                  color="#e1e5e9"
                  _hover={{
                    bg: '#2a2d35',
                    color: '#ffffff'
                  }}
                  _focus={{
                    bg: '#2a2d35',
                    color: '#ffffff'
                  }}
                  onClick={() => showEditBookmark({
                    bookmark,
                    onEdit: (id, updatedBookmark) => updateBookmark(id, updatedBookmark)
                  })}
                  px={3}
                  py={2}
                  fontSize="sm"
                  cursor="pointer"
                  transition="all 0.15s ease"
                >
                  <HStack gap={2}>
                    <LuPencil size={14} color="#71767b" />
                    <Text>Edit</Text>
                  </HStack>
                </Menu.Item>
                <Menu.Separator borderColor="#2a2d35" />
                <Menu.Item
                  value="delete"
                  color="#dc2626"
                  _hover={{
                    bg: '#dc2626',
                    color: 'white'
                  }}
                  _focus={{
                    bg: '#dc2626',
                    color: 'white'
                  }}
                  onClick={() => showDeleteConfirmation({
                    title: 'Delete Bookmark',
                    message: 'Are you sure you want to delete this bookmark? This action cannot be undone.',
                    preview: getContent().slice(0, 100) + (getContent().length > 100 ? '...' : ''),
                    onConfirm: () => removeBookmark(bookmark.id)
                  })}
                  px={3}
                  py={2}
                  fontSize="sm"
                  cursor="pointer"
                  transition="all 0.15s ease"
                >
                  <HStack gap={2}>
                    <LuTrash2 size={14} />
                    <Text>Delete</Text>
                  </HStack>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
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

        {/* Media Display */}
        {hasMedia() && (
          <Box mb={3}>
            {(() => {
              const mediaContent = getMediaContent()
              if (!mediaContent) return null

              const { images, hasVideo } = mediaContent

              // Video indicator
              if (hasVideo) {
                return (
                  <Box
                    position="relative"
                    borderRadius="lg"
                    overflow="hidden"
                    border="1px solid #2a2d35"
                    cursor="pointer"
                    _hover={{ filter: 'brightness(1.1)' }}
                    onClick={() => showImageModal({
                      images: images,
                      initialIndex: 0,
                      title: `🎥 ${getContent().slice(0, 100)}${getContent().length > 100 ? '...' : ''}`
                    })}
                  >
                    {images.length > 0 ? (
                      <LazyImage
                        src={images[0]}
                        alt="Video thumbnail"
                        w="100%"
                        h="200px"
                        objectFit="cover"
                      />
                    ) : (
                      <Box
                        h="200px"
                        bg="#0f1419"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="#71767b"
                      >
                        🎥 Video Content
                      </Box>
                    )}
                    {/* Video play overlay */}
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      bg="rgba(0, 0, 0, 0.8)"
                      borderRadius="full"
                      w="60px"
                      h="60px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      border="2px solid rgba(255, 255, 255, 0.8)"
                      _hover={{
                        bg: "rgba(0, 0, 0, 0.9)",
                        borderColor: "white",
                        transform: "translate(-50%, -50%) scale(1.1)"
                      }}
                      transition="all 0.2s ease"
                      cursor="pointer"
                    >
                      <LuPlay size={24} />
                    </Box>
                  </Box>
                )
              }

              // Images
              if (images.length > 0) {
                return (
                  <Box borderRadius="lg" overflow="hidden" border="1px solid #2a2d35">
                    {images.length === 1 ? (
                      <LazyImage
                        src={images[0]}
                        alt="Tweet image"
                        w="100%"
                        h="200px"
                        objectFit="cover"
                        cursor="pointer"
                        _hover={{ filter: 'brightness(1.1)' }}
                        onClick={() => showImageModal({
                          images: images,
                          initialIndex: 0,
                          title: getContent().slice(0, 100) + (getContent().length > 100 ? '...' : '')
                        })}
                      />
                    ) : (
                      <SimpleGrid columns={images.length === 2 ? 2 : 2} gap={1}>
                        <For each={images.slice(0, 4)}>
                          {(imageUrl, index) => (
                            <Box key={`img-${index}`} position="relative">
                              <LazyImage
                                src={String(imageUrl)}
                                alt={`Tweet image ${index + 1}`}
                                w="100%"
                                h={images.length === 2 ? "150px" : "100px"}
                                objectFit="cover"
                                cursor="pointer"
                                _hover={{ filter: 'brightness(1.1)' }}
                                onClick={() => showImageModal({
                                  images: images,
                                  initialIndex: index,
                                  title: getContent().slice(0, 100) + (getContent().length > 100 ? '...' : '')
                                })}
                              />
                              {/* Show +N overlay for additional images */}
                              {index === 3 && images.length > 4 && (
                                <Box
                                  position="absolute"
                                  top="0"
                                  left="0"
                                  right="0"
                                  bottom="0"
                                  bg="rgba(0, 0, 0, 0.7)"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  color="white"
                                  fontWeight="bold"
                                  fontSize="lg"
                                >
                                  +{images.length - 4}
                                </Box>
                              )}
                            </Box>
                          )}
                        </For>
                      </SimpleGrid>
                    )}
                  </Box>
                )
              }

              return null
            })()}
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
          <HStack gap={1} justify="space-between" w="100%">
            <HStack gap={1}>
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Star bookmark"
                title={isStarred() ? 'Unstar bookmark' : 'Star bookmark'}
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
                title="Share bookmark"
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
                <LuShare2 />
              </IconButton>
            </HStack>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="View original tweet"
              title="View original tweet"
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
              onClick={() => window.open(bookmark.url, '_blank')}
            >
              <LuExternalLink />
            </IconButton>
          </HStack>
        </VStack>
      </Box>
    </Card.Root>
  )
}

export default BookmarkCard