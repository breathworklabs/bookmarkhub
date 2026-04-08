import { Box, IconButton, Text, HStack } from '@chakra-ui/react'
import { LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { useState, useEffect } from 'react'
import LazyImage from '@/components/LazyImage'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  initialIndex?: number
  title?: string
}

const ImageModal = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title,
}: ImageModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
          break
        case 'ArrowRight':
          setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, images.length, onClose])

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]
  const hasMultipleImages = images.length > 1

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0, 0, 0, 0.9)"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={onClose}
    >
      {/* Modal Content */}
      <Box
        position="relative"
        maxW="90vw"
        maxH="90vh"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <IconButton
          position="absolute"
          top="16px"
          right="16px"
          size="lg"
          variant="ghost"
          aria-label="Close image modal"
          color="white"
          bg="rgba(0, 0, 0, 0.5)"
          _hover={{ bg: 'rgba(0, 0, 0, 0.7)' }}
          onClick={onClose}
          zIndex={10}
        >
          <LuX size={24} />
        </IconButton>

        {/* Navigation Buttons */}
        {hasMultipleImages && (
          <>
            <IconButton
              position="absolute"
              left="16px"
              top="50%"
              transform="translateY(-50%)"
              size="lg"
              variant="ghost"
              aria-label="Previous image"
              color="white"
              bg="rgba(0, 0, 0, 0.5)"
              _hover={{ bg: 'rgba(0, 0, 0, 0.7)' }}
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev > 0 ? prev - 1 : images.length - 1
                )
              }
              zIndex={10}
            >
              <LuChevronLeft size={24} />
            </IconButton>

            <IconButton
              position="absolute"
              right="16px"
              top="50%"
              transform="translateY(-50%)"
              size="lg"
              variant="ghost"
              aria-label="Next image"
              color="white"
              bg="rgba(0, 0, 0, 0.5)"
              _hover={{ bg: 'rgba(0, 0, 0, 0.7)' }}
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev < images.length - 1 ? prev + 1 : 0
                )
              }
              zIndex={10}
            >
              <LuChevronRight size={24} />
            </IconButton>
          </>
        )}

        {/* Image */}
        <Box w="60vw" h="60vh">
          <LazyImage
            src={currentImage}
            alt={title || `Image ${currentIndex + 1}`}
            w="100%"
            h="100%"
            objectFit="contain"
            borderRadius="8px"
            fallback={
              <Box
                w="100%"
                h="100%"
                style={{
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-tertiary)',
                }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="8px"
              >
                Failed to load image
              </Box>
            }
          />
        </Box>

        {/* Image Counter and Title */}
        {(hasMultipleImages || title) && (
          <Box
            position="absolute"
            bottom="16px"
            left="50%"
            transform="translateX(-50%)"
            bg="rgba(0, 0, 0, 0.7)"
            color="white"
            px={4}
            py={2}
            borderRadius="8px"
            textAlign="center"
          >
            {title && (
              <Text
                fontSize="sm"
                fontWeight="500"
                mb={hasMultipleImages ? 1 : 0}
              >
                {title}
              </Text>
            )}
            {hasMultipleImages && (
              <HStack gap={2} justify="center">
                <Text fontSize="xs" opacity={0.8}>
                  {currentIndex + 1} of {images.length}
                </Text>
                {/* Dots indicator */}
                <HStack gap={1}>
                  {images.map((_, index) => (
                    <Box
                      key={index}
                      w="6px"
                      h="6px"
                      borderRadius="full"
                      bg={
                        index === currentIndex
                          ? 'white'
                          : 'rgba(255, 255, 255, 0.4)'
                      }
                      cursor="pointer"
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </HStack>
              </HStack>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ImageModal
