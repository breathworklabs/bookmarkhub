import { Box } from '@chakra-ui/react'
import { memo, useState, type ReactNode } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'

interface MobileHeaderContainerProps {
  children: ReactNode
}

export const MobileHeaderContainer = memo<MobileHeaderContainerProps>(({ children }) => {
  const isMobileHeaderVisible = useBookmarkStore((state) => state.isMobileHeaderVisible)
  const toggleMobileHeader = useBookmarkStore((state) => state.toggleMobileHeader)

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum swipe distance (in px) to trigger collapse/expand
  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isUpSwipe = distance > minSwipeDistance
    const isDownSwipe = distance < -minSwipeDistance

    // Up swipe = collapse header, Down swipe = expand header
    if (isUpSwipe && isMobileHeaderVisible) {
      toggleMobileHeader()
    } else if (isDownSwipe && !isMobileHeaderVisible) {
      toggleMobileHeader()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <Box
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      css={{
        maxHeight: isMobileHeaderVisible ? '500px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
        opacity: isMobileHeaderVisible ? 1 : 0,
      }}
    >
      {children}
    </Box>
  )
})

MobileHeaderContainer.displayName = 'MobileHeaderContainer'
