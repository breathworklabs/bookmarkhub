import { Box, Text } from '@chakra-ui/react'
import { memo, useMemo } from 'react'
import { type Bookmark } from '../../types/bookmark'

interface BookmarkContentProps {
  bookmark: Bookmark
  hasMedia: boolean
}

const BookmarkContent = memo(({ bookmark, hasMedia }: BookmarkContentProps) => {
  const getContent = useMemo(() => {
    return (bookmark as any).content || (bookmark as any).description || 'No content available'
  }, [(bookmark as any).content, (bookmark as any).description])

  return (
    <Box flex={1}>
      <Text
        fontSize="sm"
        lineHeight="1.4"
        color="#e1e5e9"
        mb={hasMedia ? 3 : 0}
        whiteSpace="pre-line"
      >
        {getContent}
      </Text>
    </Box>
  )
})

BookmarkContent.displayName = 'BookmarkContent'

export default BookmarkContent
