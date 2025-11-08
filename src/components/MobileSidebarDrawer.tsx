import { Box } from '@chakra-ui/react'
import { memo, useState, useRef, useEffect } from 'react'
import UnifiedSidebar from './UnifiedSidebar'
import { mobileConfig } from '../styles/responsive'

interface MobileSidebarDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const MobileSidebarDrawer = memo<MobileSidebarDrawerProps>(
  ({ isOpen, onClose }) => {
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState(0)
    const drawerRef = useRef<HTMLDivElement>(null)

    // Minimum swipe distance (in px) to trigger close
    const minSwipeDistance = 50

    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null)
      setTouchStart(e.targetTouches[0].clientX)
      setIsDragging(true)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!touchStart) return

      const currentTouch = e.targetTouches[0].clientX
      const diff = currentTouch - touchStart

      setTouchEnd(currentTouch)

      // Only allow left swipe (negative offset)
      if (diff < 0) {
        setDragOffset(diff)
      } else {
        setDragOffset(0)
      }
    }

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) {
        setIsDragging(false)
        setDragOffset(0)
        return
      }

      const distance = touchStart - touchEnd
      const isLeftSwipe = distance > minSwipeDistance

      if (isLeftSwipe) {
        onClose()
      }

      setTouchStart(null)
      setTouchEnd(null)
      setIsDragging(false)
      setDragOffset(0)
    }

    // Reset drag state when drawer closes
    useEffect(() => {
      if (!isOpen) {
        setDragOffset(0)
        setIsDragging(false)
        setTouchStart(null)
        setTouchEnd(null)
      }
    }, [isOpen])

    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.5)"
            zIndex={999}
            onClick={onClose}
            css={{
              animation: 'fadeIn 0.2s ease-in-out',
              '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          />
        )}

        {/* Drawer */}
        <Box
          ref={drawerRef}
          position="fixed"
          top={0}
          left={0}
          bottom={0}
          w={{ base: '85vw', sm: mobileConfig.drawerWidth }}
          maxW="400px"
          bg="var(--color-bg-sidebar)"
          zIndex={1000}
          overflowY="auto"
          overflowX="hidden"
          boxShadow="2px 0 8px rgba(0, 0, 0, 0.2)"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          css={{
            transform: isOpen
              ? `translateX(${dragOffset}px)`
              : 'translateX(-100%)',
            transition: isDragging ? 'none' : 'transform 0.3s ease-in-out',
            '& > div': {
              width: '100% !important',
              padding: '20px',
            },
          }}
        >
          <UnifiedSidebar onItemClick={onClose} />
        </Box>
      </>
    )
  }
)

MobileSidebarDrawer.displayName = 'MobileSidebarDrawer'
