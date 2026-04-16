import { useMemo } from 'react'
import { LuUser } from 'react-icons/lu'
import { useBookmarkSelectors } from '@/hooks/selectors/useBookmarkSelectors'
import { GenericFilter } from './filters/GenericFilter'

const AuthorFilter = () => {
  const { authorFilter, setAuthorFilter, filterOptions } =
    useBookmarkSelectors()

  // Use cached authors from the store
  const authors = useMemo(() => {
    return filterOptions.authors.map((author) => ({
      label: author,
      value: author,
    }))
  }, [filterOptions.authors])

  return (
    <GenericFilter
      type="author"
      label="Author"
      icon={LuUser}
      placeholder="Search by author..."
      value={authorFilter}
      onChange={setAuthorFilter}
      options={authors}
      emptyMessage="No authors found"
    />
  )
}

export default AuthorFilter
