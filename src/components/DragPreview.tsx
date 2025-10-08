import { Box, HStack, Text } from '@chakra-ui/react'
import { useDragLayer } from 'react-dnd'
import { LuGripVertical, LuBookmark } from 'react-icons/lu'
import { ItemTypes } from '../types/dnd'

const getItemStyles = (
  currentOffset: { x: number; y: number } | null
) => {
  if (!currentOffset) {
    return {
      display: 'none',
    }
  }

  const { x, y } = currentOffset

  // Offset the preview slightly below and to the right of cursor
  // This prevents it from interfering with drop detection
  const offsetX = x + 12
  const offsetY = y + 12

  const transform = `translate(${offsetX}px, ${offsetY}px)`
  return {
    transform,
    WebkitTransform: transform,
  }
}

export const DragPreview = () => {
  const { itemType, isDragging, item, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      currentOffset: monitor.getClientOffset(),
      isDragging: monitor.isDragging(),
    }))

  if (!isDragging || itemType !== ItemTypes.BOOKMARK) {
    return null
  }

  const count = item?.selectedIds?.length || 1
  const title = item?.bookmark?.title || 'Bookmark'

  return (
    <Box
      position="fixed"
      pointerEvents="none"
      zIndex={100}
      left={0}
      top={0}
      width="100%"
      height="100%"
    >
      <Box style={getItemStyles(currentOffset)}>
        <HStack
          bg="var(--color-bg-secondary)"
          border="2px solid var(--color-blue)"
          borderRadius="8px"
          px={3}
          py={2}
          gap={2}
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
          maxW="300px"
          opacity={0.95}
        >
          <LuGripVertical size={16} color="var(--color-text-tertiary)" />
          <LuBookmark size={16} color="var(--color-blue)" />
          <Box flex={1} minW={0}>
            <Text
              fontSize="sm"
              fontWeight="500"
              color="var(--color-text-primary)"
              truncate
            >
              {count > 1 ? `${count} bookmarks` : title}
            </Text>
          </Box>
          {count > 1 && (
            <Box
              bg="var(--color-blue)"
              color="white"
              fontSize="xs"
              fontWeight="600"
              px={2}
              py={1}
              borderRadius="full"
              minW="24px"
              textAlign="center"
            >
              {count}
            </Box>
          )}
        </HStack>
      </Box>
    </Box>
  )
}
