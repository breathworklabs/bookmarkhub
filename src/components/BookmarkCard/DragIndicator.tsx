import { Box } from '@chakra-ui/react'
import { memo } from 'react'

interface DragIndicatorProps {
  isDragging: boolean
  selectedCount: number
  isSelected: boolean
}

const DragIndicator = memo(({ isDragging, selectedCount, isSelected }: DragIndicatorProps) => {
  if (!isDragging || selectedCount <= 1 || !isSelected) return null

  return (
    <Box
      position="absolute"
      top={2}
      right={2}
      style={{ background: 'var(--color-blue)' }}
      color="white"
      fontSize="xs"
      fontWeight="bold"
      px={2}
      py={1}
      borderRadius="full"
      zIndex={20}
    >
      {selectedCount}
    </Box>
  )
})

DragIndicator.displayName = 'DragIndicator'

export default DragIndicator
