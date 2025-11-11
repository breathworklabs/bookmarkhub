import { useState, useRef, useEffect } from 'react'
import { Box, Image } from '@chakra-ui/react'

interface LazyImageProps {
  src: string
  alt: string
  w?: string | number
  h?: string | number
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'
  borderRadius?: string
  cursor?: string
  onClick?: (e: React.MouseEvent) => void
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
  zIndex,
}: LazyImageProps) => {
  const imgRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [hasError, setHasError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

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

  const handleError = () => {
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
      style={{ background: 'var(--color-bg-primary)' }}
    >
      {!isVisible ? (
        // Placeholder while not in viewport
        <Box
          w="100%"
          h="100%"
          style={{ background: 'var(--color-bg-tertiary)' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            w="20px"
            h="20px"
            style={{ background: 'var(--color-border)' }}
            borderRadius="2px"
          />
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
            style={{ color: 'var(--color-text-tertiary)' }}
            fontSize="xs"
          >
            📷
          </Box>
        )
      ) : (
        // Actual image - no loading spinner for smoother experience with cached images
        <Image
          ref={imageRef}
          src={src}
          alt={alt}
          w="100%"
          h="100%"
          objectFit={objectFit}
          onError={handleError}
          loading="eager"
        />
      )}
    </Box>
  )
}

export default LazyImage
