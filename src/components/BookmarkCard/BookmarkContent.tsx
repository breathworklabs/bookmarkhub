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
        dangerouslySetInnerHTML={{ __html: getContent }}
        sx={{
          '& a': {
            color: '#1da1f2',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          },
          '& .tweet-hashtag': {
            color: '#1da1f2'
          },
          '& .tweet-mention': {
            color: '#1da1f2'
          }
        }}
      />
    </Box>
  )
})

BookmarkContent.displayName = 'BookmarkContent'

export default BookmarkContent
