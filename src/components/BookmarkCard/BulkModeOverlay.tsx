import { Box } from '@chakra-ui/react'
import { memo } from 'react'

interface BulkModeOverlayProps {
  isInBulkMode: boolean
  onCardClick: (event: React.MouseEvent) => void
}

const BulkModeOverlay = memo(({ isInBulkMode, onCardClick }: BulkModeOverlayProps) => {
  if (!isInBulkMode) return null

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={5}
      cursor="pointer"
      onClick={onCardClick}
      bg="transparent"
    />
  )
})

BulkModeOverlay.displayName = 'BulkModeOverlay'

export default BulkModeOverlay
