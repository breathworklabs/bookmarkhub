import { Box } from '@chakra-ui/react'
import { memo, useMemo } from 'react'
import { type Bookmark } from '../../types/bookmark'

interface BookmarkContentProps {
  bookmark: Bookmark
  hasMedia: boolean
}

const BookmarkContent = memo(({ bookmark, hasMedia }: BookmarkContentProps) => {
  const getContent = useMemo(() => {
    return (
      (bookmark as any).content ||
      (bookmark as any).description ||
      'No content available'
    )
  }, [(bookmark as any).content, (bookmark as any).description])

  return (
    <Box flex={1}>
      <Box
        fontSize="sm"
        lineHeight="1.4"
        style={{ color: 'var(--color-text-primary)' }}
        mb={hasMedia ? 3 : 0}
        whiteSpace="pre-line"
        dangerouslySetInnerHTML={{ __html: getContent }}
        css={{
          '& a': {
            color: 'var(--color-accent)',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
          '& .tweet-hashtag': {
            color: 'var(--color-accent)',
          },
          '& .tweet-mention': {
            color: 'var(--color-accent)',
          },
        }}
      />
    </Box>
  )
})

BookmarkContent.displayName = 'BookmarkContent'

export default BookmarkContent
