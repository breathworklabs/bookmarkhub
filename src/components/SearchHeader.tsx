import { Box, HStack, Input, Button, Spacer, Badge } from '@chakra-ui/react'
import { LuMenu, LuLayoutGrid, LuLayoutList } from 'react-icons/lu'
import { useMemo, useCallback, memo } from 'react'
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
  const viewMode = useBookmarkStore((state) => state.viewMode)
  const setViewMode = useBookmarkStore((state) => state.setViewMode)
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
          const text = await file.text()
          const data = JSON.parse(text)

          // Check if this looks like X bookmark data (array with tweet-like structure)
          if (Array.isArray(data) && data.length > 0 && data[0].tweet_id && data[0].username) {
            await importXBookmarks(data) // Import all bookmarks
          } else {
            // Fall back to regular import
            const importBookmarks = useBookmarkStore.getState().importBookmarks
            await importBookmarks(file)
          }

          // Only refresh on successful import
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
          <HStack {...componentStyles.input.search} gap={2}>
            <Box w="16px" h="16px" style={{ color: 'var(--color-text-tertiary)' }}>
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
          {/* View Toggle */}
          <HStack gap={0} bg="var(--color-bg-secondary)" borderRadius="8px" p="2px">
            <Button
              {...useButtonStyles('secondary')}
              size="sm"
              px={3}
              py={2}
              minW="auto"
              data-testid="view-toggle-grid"
              style={{
                background: viewMode === 'grid' ? 'var(--color-bg-tertiary)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                border: 'none'
              }}
              _hover={{
                bg: viewMode === 'grid' ? 'var(--color-bg-tertiary)' : 'var(--color-bg-hover)',
                color: 'var(--color-text-primary)'
              }}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LuLayoutGrid size={16} />
            </Button>
            <Button
              {...useButtonStyles('secondary')}
              size="sm"
              px={3}
              py={2}
              minW="auto"
              data-testid="view-toggle-list"
              style={{
                background: viewMode === 'list' ? 'var(--color-bg-tertiary)' : 'transparent',
                color: viewMode === 'list' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                border: 'none'
              }}
              _hover={{
                bg: viewMode === 'list' ? 'var(--color-bg-tertiary)' : 'var(--color-bg-hover)',
                color: 'var(--color-text-primary)'
              }}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <LuLayoutList size={16} />
            </Button>
          </HStack>

          <Button
            {...useButtonStyles('secondary')}
            style={{
              background: filterData.isFiltersPanelOpen ? 'var(--color-blue)' : 'transparent',
              color: filterData.isFiltersPanelOpen ? 'white' : 'var(--color-text-tertiary)',
              borderColor: filterData.isFiltersPanelOpen ? 'var(--color-blue)' : 'var(--color-border)'
            }}
            _hover={{
              bg: filterData.isFiltersPanelOpen ? 'var(--color-blue-hover)' : 'var(--color-bg-tertiary)',
              color: filterData.isFiltersPanelOpen ? 'white' : 'var(--color-text-primary)',
              borderColor: filterData.isFiltersPanelOpen ? 'var(--color-blue-hover)' : 'var(--color-border-hover)'
            }}
            onClick={handleToggleFilters}
            position="relative"
          >
            <LuMenu size={14} />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                size="sm"
                style={{ background: 'var(--color-error)' }}
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