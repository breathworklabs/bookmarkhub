import { Box, HStack, Input, Button, Spacer, Badge } from '@chakra-ui/react'
import { LuMenu } from 'react-icons/lu'
import { useMemo, useCallback, memo } from 'react'
import { theme } from '../styles/theme'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useModal } from './modals/ModalProvider'
import { sanitizeBookmark } from '../lib/dataValidation'
import { useButtonStyles, useInputStyles } from '../hooks/useStyles'
import { componentStyles } from '../styles/components'

// Optimized selector to get all filter data at once
const useFilterData = () => {
  const searchQuery = useBookmarkStore((state) => state.searchQuery)
  const isFiltersPanelOpen = useBookmarkStore((state) => state.isFiltersPanelOpen)
  const authorFilter = useBookmarkStore((state) => state.authorFilter)
  const domainFilter = useBookmarkStore((state) => state.domainFilter)
  const contentTypeFilter = useBookmarkStore((state) => state.contentTypeFilter)
  const dateRangeFilter = useBookmarkStore((state) => state.dateRangeFilter)
  const quickFilters = useBookmarkStore((state) => state.quickFilters)

  return useMemo(() => ({
    searchQuery,
    isFiltersPanelOpen,
    authorFilter,
    domainFilter,
    contentTypeFilter,
    dateRangeFilter,
    quickFilters
  }), [searchQuery, isFiltersPanelOpen, authorFilter, domainFilter, contentTypeFilter, dateRangeFilter, quickFilters])
}

const SearchHeader = memo(() => {
  const filterData = useFilterData()
  const setSearchQuery = useBookmarkStore((state) => state.setSearchQuery)
  const addBookmark = useBookmarkStore((state) => state.addBookmark)
  const toggleFiltersPanel = useBookmarkStore((state) => state.toggleFiltersPanel)
  const { showAddBookmark } = useModal()

  // Memoized active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterData.dateRangeFilter.type !== 'all') count++
    if (filterData.authorFilter.trim()) count++
    if (filterData.domainFilter.trim()) count++
    if (filterData.contentTypeFilter.trim()) count++
    if (filterData.quickFilters.length > 0) count += filterData.quickFilters.length
    return count
  }, [
    filterData.dateRangeFilter.type,
    filterData.authorFilter,
    filterData.domainFilter,
    filterData.contentTypeFilter,
    filterData.quickFilters.length
  ])

  const importXBookmarks = useBookmarkStore((state) => state.importXBookmarks)

  // Memoized event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [setSearchQuery])

  const handleToggleFilters = useCallback(() => {
    toggleFiltersPanel()
  }, [toggleFiltersPanel])

  const handleImportXBookmarks = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          console.log('File selected:', file.name)
          const text = await file.text()
          const data = JSON.parse(text)

          console.log('Parsed JSON data, found', data.length, 'items')

          // Check if this looks like X bookmark data (array with tweet-like structure)
          if (Array.isArray(data) && data.length > 0 && data[0].tweet_id && data[0].username) {
            console.log('Detected X bookmark format, importing as X bookmarks...')
            await importXBookmarks(data) // Import all bookmarks
            console.log('X bookmarks import completed successfully')

          } else {
            console.log('Detected standard bookmark format, using regular import...')
            // Fall back to regular import
            const importBookmarks = useBookmarkStore.getState().importBookmarks
            await importBookmarks(file)
            console.log('Standard bookmarks import completed successfully')
          }

          // Only refresh on successful import
          console.log('Import successful, refreshing UI...')
          window.location.reload()
        } catch (error) {
          console.error('Import failed:', error)
          alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }
    input.click()
  }, [importXBookmarks])

  const handleAddBookmark = useCallback(() => {
    showAddBookmark({
      onAdd: async (bookmarkData) => {
        try {
          const validatedBookmark = sanitizeBookmark(bookmarkData)
          if (validatedBookmark) {
            await addBookmark(validatedBookmark)
          }
        } catch (error) {
          console.error('Failed to add bookmark:', error)
        }
      }
    })
  }, [showAddBookmark, addBookmark])
  return (
    <Box {...componentStyles.container.header}>
      <HStack gap={6} alignItems="center">
        {/* Search Area */}
        <Box position="relative" maxW="400px" flex={1}>
          <HStack {...theme.styles.searchContainer} gap={2}>
            <Box w="16px" h="16px" color="#71767b">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            <Input
              {...useInputStyles('search')}
              placeholder="Search bookmarks, content, authors..."
              value={filterData.searchQuery}
              onChange={handleSearchChange}
            />
          </HStack>
        </Box>

        <Spacer />

        {/* Action Buttons */}
        <HStack gap={3}>
          <Button
            {...useButtonStyles('secondary')}
            bg={filterData.isFiltersPanelOpen ? '#1d4ed8' : 'transparent'}
            color={filterData.isFiltersPanelOpen ? 'white' : '#71767b'}
            borderColor={filterData.isFiltersPanelOpen ? '#1d4ed8' : '#2a2d35'}
            _hover={{
              bg: filterData.isFiltersPanelOpen ? '#1e40af' : '#1a1d23',
              color: filterData.isFiltersPanelOpen ? 'white' : '#e1e5e9',
              borderColor: filterData.isFiltersPanelOpen ? '#1e40af' : '#3a3d45'
            }}
            onClick={handleToggleFilters}
            position="relative"
          >
            <LuMenu size={14} />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                size="sm"
                bg="#dc2626"
                color="white"
                borderRadius="full"
                fontSize="11px"
                fontWeight="600"
                px={2}
                py={1}
                position="absolute"
                top="-8px"
                right="-8px"
                zIndex={1}
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button {...useButtonStyles('secondary')} onClick={handleImportXBookmarks}>
            +
            Import
          </Button>
          <Button {...useButtonStyles('primary')} onClick={handleAddBookmark}>
            +
            Add Bookmark
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
})

SearchHeader.displayName = 'SearchHeader'

export default SearchHeader