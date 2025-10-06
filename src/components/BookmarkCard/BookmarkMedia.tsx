import { Box, SimpleGrid, For } from '@chakra-ui/react'
import { memo, useCallback } from 'react'
import { type Bookmark } from '../../types/bookmark'
import { useModal } from '../modals/ModalProvider'
import LazyImage from '../LazyImage'

interface BookmarkMediaProps {
  bookmark: Bookmark
  isInBulkMode: boolean
  getContent: string
}

const BookmarkMedia = memo(({ bookmark, isInBulkMode, getContent }: BookmarkMediaProps) => {
  const { showImageModal } = useModal()

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

  const handleImageClick = useCallback((images: string[], initialIndex: number) => {
    if (isInBulkMode) return

    showImageModal({
      images: images,
      initialIndex: initialIndex,
      title: getContent.slice(0, 100) + (getContent.length > 100 ? '...' : '')
    })
  }, [isInBulkMode, showImageModal, getContent])

  if (!hasMedia()) return null

  const mediaContent = getMediaContent()

  // If no specific media content but hasMedia is true, show fallback
  if (!mediaContent && (bookmark as any).hasMedia) {
    return (
      <Box mb={3}>
        <Box
          h="200px"
          style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-tertiary)' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="lg"
          border="1px solid var(--color-border)"
          data-testid="media-placeholder"
        >
          📷 Media Content
        </Box>
      </Box>
    )
  }

  if (!mediaContent) return null

  const { images, hasVideo } = mediaContent

  // Video indicator
  if (hasVideo) {
    return (
      <Box mb={3}>
        <Box
          position="relative"
          borderRadius="lg"
          overflow="hidden"
          border="1px solid var(--color-border)"
          cursor="pointer"
          _hover={{ filter: 'brightness(1.1)' }}
          onClick={() => handleImageClick(images, 0)}
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
              style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-tertiary)' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
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
            ▶
          </Box>
        </Box>
      </Box>
    )
  }

  // Images
  if (images.length > 0) {
    return (
      <Box mb={3}>
        <Box borderRadius="lg" overflow="hidden" border="1px solid var(--color-border)">
          {images.length === 1 ? (
            <LazyImage
              src={images[0]}
              alt="Tweet image"
              w="100%"
              h="200px"
              objectFit="cover"
              cursor={isInBulkMode ? 'default' : 'pointer'}
              _hover={isInBulkMode ? {} : { filter: 'brightness(1.1)' }}
              onClick={(e: React.MouseEvent) => {
                if (isInBulkMode) {
                  e.preventDefault()
                  e.stopPropagation()
                  return
                }
                handleImageClick(images, 0)
              }}
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
                      cursor={isInBulkMode ? 'default' : 'pointer'}
                      _hover={isInBulkMode ? {} : { filter: 'brightness(1.1)' }}
                      onClick={(e: React.MouseEvent) => {
                        if (isInBulkMode) {
                          e.preventDefault()
                          e.stopPropagation()
                          return
                        }
                        handleImageClick(images, index)
                      }}
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
      </Box>
    )
  }

  return null
})

BookmarkMedia.displayName = 'BookmarkMedia'

export default BookmarkMedia
