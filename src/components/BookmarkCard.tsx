import { memo } from 'react'
import BookmarkCardComponent from './BookmarkCard/BookmarkCard'

const BookmarkCard = memo(BookmarkCardComponent)

BookmarkCard.displayName = 'BookmarkCard'

export default BookmarkCard
