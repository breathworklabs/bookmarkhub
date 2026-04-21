import { Box } from '@chakra-ui/react'
import { memo, useMemo } from 'react'
import { type Bookmark } from '@/types/bookmark'
import { sanitizeBookmarkContent } from '@/utils/sanitization'

interface BookmarkContentProps {
  bookmark: Bookmark
  hasMedia: boolean
}

const BookmarkContent = memo(({ bookmark, hasMedia }: BookmarkContentProps) => {
  // Extract content values for dependency array
  const content = bookmark.content
  const description = bookmark.description

  const getContent = useMemo(() => {
    const rawContent = content || description || 'No content available'
    // Sanitize HTML to prevent XSS attacks
    return sanitizeBookmarkContent(rawContent)
  }, [content, description])

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
