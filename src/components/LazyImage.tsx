import { useState, useRef, useEffect } from 'react'
import { Box, Image, Spinner } from '@chakra-ui/react'

interface LazyImageProps {
  src: string
  alt: string
  w?: string | number
  h?: string | number
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'
  borderRadius?: string
  cursor?: string
  onClick?: () => void
  _hover?: any
  fallback?: React.ReactNode
  position?: string
  top?: string | number
  left?: string | number
  right?: string | number
  bottom?: string | number
  zIndex?: number
}

const LazyImage = ({
  src,
  alt,
  w,
  h,
  objectFit = 'cover',
  borderRadius,
  cursor,
  onClick,
  _hover,
  fallback,
  position,
  top,
  left,
  right,
  bottom,
  zIndex
}: LazyImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <Box
      ref={imgRef}
      w={w}
      h={h}
      borderRadius={borderRadius}
      cursor={cursor}
      onClick={onClick}
      _hover={_hover}
      position={position}
      top={top}
      left={left}
      right={right}
      bottom={bottom}
      zIndex={zIndex}
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#0f1419"
    >
      {!isVisible ? (
        // Placeholder while not in viewport
        <Box
          w="100%"
          h="100%"
          bg="#1a1d23"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box w="20px" h="20px" bg="#2a2d35" borderRadius="2px" />
        </Box>
      ) : hasError ? (
        // Error fallback
        fallback || (
          <Box
            w="100%"
            h="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="#71767b"
            fontSize="xs"
          >
            📷
          </Box>
        )
      ) : (
        <>
          {/* Loading spinner */}
          {isLoading && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex={1}
            >
              <Spinner size="sm" color="#71767b" />
            </Box>
          )}

          {/* Actual image */}
          <Image
            src={src}
            alt={alt}
            w="100%"
            h="100%"
            objectFit={objectFit}
            onLoad={handleLoad}
            onError={handleError}
            opacity={isLoading ? 0 : 1}
            transition="opacity 0.3s ease"
          />
        </>
      )}
    </Box>
  )
}

export default LazyImage