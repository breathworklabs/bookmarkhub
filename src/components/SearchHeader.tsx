import {
  Box,
  HStack,
  Input,
  Button,
  Spacer,
  Badge,
  IconButton,
} from '@chakra-ui/react'
import { Tooltip } from '@chakra-ui/react'
import {
  LuMenu,
  LuLayoutGrid,
  LuLayoutList,
  LuBookmarkPlus,
  LuInfo,
} from 'react-icons/lu'
import { useMemo, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useModal } from './modals/ModalProvider'
import { sanitizeBookmark } from '../lib/dataValidation'
import { useButtonStyles, useInputStyles } from '../hooks/useStyles'
import { componentStyles } from '../styles/components'
import { useIsMobile } from '../hooks/useMobile'

interface SearchHeaderProps {
  onMenuClick?: () => void // For opening mobile drawer
}

// Optimized selector to get all filter data at once
const useFilterData = () => {
  const searchQuery = useBookmarkStore((state) => state.searchQuery)
  const isFiltersPanelOpen = useBookmarkStore(
    (state) => state.isFiltersPanelOpen
  )
  const authorFilter = useBookmarkStore((state) => state.authorFilter)
  const domainFilter = useBookmarkStore((state) => state.domainFilter)
  const contentTypeFilter = useBookmarkStore((state) => state.contentTypeFilter)
  const dateRangeFilter = useBookmarkStore((state) => state.dateRangeFilter)
  const quickFilters = useBookmarkStore((state) => state.quickFilters)

  return useMemo(
    () => ({
      searchQuery,
      isFiltersPanelOpen,
      authorFilter,
      domainFilter,
      contentTypeFilter,
      dateRangeFilter,
      quickFilters,
    }),
    [
      searchQuery,
      isFiltersPanelOpen,
      authorFilter,
      domainFilter,
      contentTypeFilter,
      dateRangeFilter,
      quickFilters,
    ]
  )
}

const SearchHeader = memo<SearchHeaderProps>(({ onMenuClick }) => {
  const filterData = useFilterData()
  const setSearchQuery = useBookmarkStore((state) => state.setSearchQuery)
  const addBookmark = useBookmarkStore((state) => state.addBookmark)
  const toggleFiltersPanel = useBookmarkStore(
    (state) => state.toggleFiltersPanel
  )
  const viewMode = useBookmarkStore((state) => state.viewMode)
  const setViewMode = useBookmarkStore((state) => state.setViewMode)
  const { showAddBookmark } = useModal()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  // Call hooks unconditionally to avoid "Rendered fewer hooks" error
  const secondaryButtonStyles = useButtonStyles('secondary')
  const primaryButtonStyles = useButtonStyles('primary')

  // Memoized active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterData.dateRangeFilter.type !== 'all') count++
    if (filterData.authorFilter.trim()) count++
    if (filterData.domainFilter.trim()) count++
    if (filterData.contentTypeFilter.trim()) count++
    if (filterData.quickFilters.length > 0)
      count += filterData.quickFilters.length
    return count
  }, [
    filterData.dateRangeFilter.type,
    filterData.authorFilter,
    filterData.domainFilter,
    filterData.contentTypeFilter,
    filterData.quickFilters.length,
  ])

  const importXBookmarks = useBookmarkStore((state) => state.importXBookmarks)

  // Memoized event handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    [setSearchQuery]
  )

  const handleToggleFilters = useCallback(() => {
    toggleFiltersPanel()
  }, [toggleFiltersPanel])

  const handleImportXBookmarks = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.zip'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          // Detect file type
          const isZip = file.name.toLowerCase().endsWith('.zip')
          const isJson = file.name.toLowerCase().endsWith('.json')

          if (isZip) {
            // Handle Twitter Archive ZIP import
            const { importTwitterArchive } = await import(
              '../services/twitterArchiveImport'
            )
            const { sanitizeBookmark } = await import('../lib/dataValidation')
            const { localStorageService } = await import('../lib/localStorage')

            const result = await importTwitterArchive(file, 'local-user')

            if (!result.success) {
              throw new Error(result.errors.join(', '))
            }

            if (result.bookmarks && result.bookmarks.length > 0) {
              // Save bookmarks to storage
              for (const bookmark of result.bookmarks) {
                const sanitized = sanitizeBookmark(bookmark)
                if (sanitized) {
                  await localStorageService.createBookmark(sanitized)
                }
              }

              // Reload and refresh
              await useBookmarkStore.getState().loadBookmarks()
              window.location.reload()
            } else {
              alert('No bookmarks found in archive')
            }
          } else if (isJson) {
            // Handle JSON import (X bookmarks or regular export)
            const text = await file.text()
            const data = JSON.parse(text)

            // Check if this looks like X bookmark data (array with tweet-like structure)
            if (
              Array.isArray(data) &&
              data.length > 0 &&
              data[0].tweet_id &&
              data[0].username
            ) {
              await importXBookmarks(data) // Import all bookmarks
            } else {
              // Fall back to regular import
              const importBookmarks =
                useBookmarkStore.getState().importBookmarks
              await importBookmarks(file)
            }

            // Only refresh on successful import
            window.location.reload()
          } else {
            alert('Invalid file type. Please upload a .json or .zip file.')
          }
        } catch (error) {
          console.error('Import failed:', error)
          alert(
            `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
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
      },
    })
  }, [showAddBookmark, addBookmark])

  const handleHelpClick = useCallback(() => {
    navigate('/help')
  }, [navigate])

  return (
    <Box {...componentStyles.container.header}>
      <HStack gap={{ base: 2, md: 6 }} alignItems="center">
        {/* Mobile Hamburger Menu */}
        {isMobile && (
          <IconButton
            aria-label="Open menu"
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            style={{ color: 'var(--color-text-secondary)' }}
            _hover={{
              bg: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <LuMenu size={20} />
          </IconButton>
        )}

        {/* Search Area */}
        <Box position="relative" maxW={{ base: '100%', md: '400px' }} flex={1}>
          <HStack {...componentStyles.input.search} gap={2}>
            <Box
              w="16px"
              h="16px"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
        <HStack gap={{ base: 2, md: 3 }}>
          {/* View Toggle - Hide on mobile */}
          {!isMobile && (
            <HStack
              gap={0}
              bg="var(--color-bg-secondary)"
              borderRadius="8px"
              p="2px"
            >
              <Button
                {...secondaryButtonStyles}
                size="sm"
                px={3}
                py={2}
                minW="auto"
                data-testid="view-toggle-grid"
                style={{
                  background:
                    viewMode === 'grid'
                      ? 'var(--color-bg-tertiary)'
                      : 'transparent',
                  color:
                    viewMode === 'grid'
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-tertiary)',
                  border: 'none',
                }}
                _hover={{
                  bg:
                    viewMode === 'grid'
                      ? 'var(--color-bg-tertiary)'
                      : 'var(--color-bg-hover)',
                  color: 'var(--color-text-primary)',
                }}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LuLayoutGrid size={16} />
              </Button>
              <Button
                {...secondaryButtonStyles}
                size="sm"
                px={3}
                py={2}
                minW="auto"
                data-testid="view-toggle-list"
                style={{
                  background:
                    viewMode === 'list'
                      ? 'var(--color-bg-tertiary)'
                      : 'transparent',
                  color:
                    viewMode === 'list'
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-tertiary)',
                  border: 'none',
                }}
                _hover={{
                  bg:
                    viewMode === 'list'
                      ? 'var(--color-bg-tertiary)'
                      : 'var(--color-bg-hover)',
                  color: 'var(--color-text-primary)',
                }}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <LuLayoutList size={16} />
              </Button>
            </HStack>
          )}

          {/* Help Button with Tooltip */}
          <Tooltip.Root
            positioning={{
              placement: 'bottom',
              strategy: 'fixed',
              offset: { mainAxis: 8 },
            }}
            openDelay={300}
            closeOnClick={false}
          >
            <Tooltip.Trigger asChild>
              <IconButton
                aria-label="Help & Documentation"
                variant="ghost"
                size="sm"
                onClick={handleHelpClick}
                style={{
                  color: 'var(--color-text-tertiary)',
                  border: '1px solid var(--color-border)',
                }}
                _hover={{
                  bg: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border-hover)',
                }}
              >
                <LuInfo size={16} />
              </IconButton>
            </Tooltip.Trigger>
            <Tooltip.Positioner>
              <Tooltip.Content
                bg="var(--color-bg-tertiary)"
                color="var(--color-text-secondary)"
                border="1px solid var(--color-border)"
                borderRadius="4px"
                px={2}
                py={1}
                fontSize="11px"
                fontWeight="400"
                maxW="200px"
                boxShadow="0 1px 4px rgba(0, 0, 0, 0.1)"
                zIndex={9999}
              >
                Help & Documentation
              </Tooltip.Content>
            </Tooltip.Positioner>
          </Tooltip.Root>

          {/* Filters Button - Icon only on mobile */}
          {isMobile ? (
            <IconButton
              aria-label="Toggle filters"
              variant="ghost"
              size="sm"
              onClick={handleToggleFilters}
              position="relative"
              style={{
                background: filterData.isFiltersPanelOpen
                  ? 'var(--color-blue)'
                  : 'transparent',
                color: filterData.isFiltersPanelOpen
                  ? 'white'
                  : 'var(--color-text-tertiary)',
                borderColor: filterData.isFiltersPanelOpen
                  ? 'var(--color-blue)'
                  : 'var(--color-border)',
                border: '1px solid',
              }}
              _hover={{
                bg: filterData.isFiltersPanelOpen
                  ? 'var(--color-blue-hover)'
                  : 'var(--color-bg-tertiary)',
                color: filterData.isFiltersPanelOpen
                  ? 'white'
                  : 'var(--color-text-primary)',
                borderColor: filterData.isFiltersPanelOpen
                  ? 'var(--color-blue-hover)'
                  : 'var(--color-border-hover)',
              }}
            >
              <LuMenu size={16} />
              {activeFilterCount > 0 && (
                <Badge
                  size="sm"
                  style={{ background: 'var(--color-error)' }}
                  color="white"
                  borderRadius="full"
                  fontSize="9px"
                  fontWeight="600"
                  px={1.5}
                  py={0.5}
                  position="absolute"
                  top="-6px"
                  right="-6px"
                  zIndex={1}
                >
                  {activeFilterCount}
                </Badge>
              )}
            </IconButton>
          ) : (
            <Button
              {...secondaryButtonStyles}
              style={{
                background: filterData.isFiltersPanelOpen
                  ? 'var(--color-blue)'
                  : 'transparent',
                color: filterData.isFiltersPanelOpen
                  ? 'white'
                  : 'var(--color-text-tertiary)',
                borderColor: filterData.isFiltersPanelOpen
                  ? 'var(--color-blue)'
                  : 'var(--color-border)',
              }}
              _hover={{
                bg: filterData.isFiltersPanelOpen
                  ? 'var(--color-blue-hover)'
                  : 'var(--color-bg-tertiary)',
                color: filterData.isFiltersPanelOpen
                  ? 'white'
                  : 'var(--color-text-primary)',
                borderColor: filterData.isFiltersPanelOpen
                  ? 'var(--color-blue-hover)'
                  : 'var(--color-border-hover)',
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
          )}

          {/* Import Button - Hide text on mobile */}
          {isMobile ? (
            <IconButton
              aria-label="Import bookmarks"
              {...secondaryButtonStyles}
              size="sm"
              onClick={handleImportXBookmarks}
            >
              +
            </IconButton>
          ) : (
            <Button {...secondaryButtonStyles} onClick={handleImportXBookmarks}>
              + Import
            </Button>
          )}

          {/* Add Bookmark Button - Icon only on mobile */}
          {isMobile ? (
            <IconButton
              aria-label="Add bookmark"
              {...primaryButtonStyles}
              size="sm"
              onClick={handleAddBookmark}
            >
              <LuBookmarkPlus size={16} />
            </IconButton>
          ) : (
            <Button {...primaryButtonStyles} onClick={handleAddBookmark}>
              + Add Bookmark
            </Button>
          )}
        </HStack>
      </HStack>
    </Box>
  )
})

SearchHeader.displayName = 'SearchHeader'

export default SearchHeader
