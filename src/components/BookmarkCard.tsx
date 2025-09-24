import { memo } from 'react'
import { type Bookmark } from '../types/bookmark'
import BookmarkCardComponent from './BookmarkCard/BookmarkCard'

interface BookmarkCardProps {
  bookmark: Bookmark
}

const BookmarkCard = memo(({ bookmark }: BookmarkCardProps) => {
  return <BookmarkCardComponent bookmark={bookmark} />
})

BookmarkCard.displayName = 'BookmarkCard'

export default BookmarkCard
