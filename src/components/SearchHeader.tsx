import {
  Box,
  HStack,
  Input,
  Button,
  Spacer,
  Badge,
  IconButton,
  Menu,
  Portal,
  For,
} from '@chakra-ui/react'
import { Tooltip } from '@chakra-ui/react'
import {
  LuMenu,
  LuLayoutGrid,
  LuLayoutList,
  LuBookmarkPlus,
  LuInfo,
  LuCalendar,
  LuChevronDown,
  LuMessageSquare,
  LuImage,
} from 'react-icons/lu'
import { useMemo, useCallback, memo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useSettingsStore } from '../store/settingsStore'
import { useModal } from './modals/ModalProvider'
import { sanitizeBookmark } from '../lib/dataValidation'
import { useButtonStyles, useInputStyles } from '../hooks/useStyles'
import { componentStyles } from '../styles/components'
import { useIsMobile } from '../hooks/useMobile'
import { colors } from '../styles/colors'
import { useFilterReset } from '../utils/filterUtils'
import { useBookmarkSelectors } from '../hooks/selectors/useBookmarkSelectors'
import { useDebounce } from '../hooks/useDebounce'
import toast from 'react-hot-toast'
import { logger } from '../lib/logger'

interface SearchHeaderProps {
  onMenuClick?: () => void // For opening mobile drawer
}

// Filter options for the Time Range dropdown
const FILTER_OPTIONS = [
  { index: 0, label: 'All Time', icon: LuCalendar },
  { index: 1, label: 'Today', icon: LuCalendar },
  { index: 2, label: 'This Week', icon: LuCalendar },
  { index: 3, label: 'Threads', icon: LuMessageSquare },
  { index: 4, label: 'Media', icon: LuImage },
]

// Helper function to get the active filter label
const getActiveFilterLabel = (activeTab: number): string => {
  const option = FILTER_OPTIONS.find((opt) => opt.index === activeTab)
  return option ? option.label : 'All Time'
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
  const viewMode = useSettingsStore((state) => state.display.viewMode)
  const setViewMode = useSettingsStore((state) => state.setViewMode)
  const { showAddBookmark } = useModal()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  // Time Range dropdown selectors
  const { activeTab, setActiveTab } = useBookmarkSelectors()
  const resetFilters = useFilterReset()

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

  // Local state for immediate visual feedback
  const [localSearchValue, setLocalSearchValue] = useState(filterData.searchQuery)

  // Sync local state with external changes (e.g., filter reset)
  useEffect(() => {
    setLocalSearchValue(filterData.searchQuery)
  }, [filterData.searchQuery])

  // Debounced search query setter (300ms delay)
  const debouncedSetSearchQuery = useDebounce(setSearchQuery, 300)

  // Memoized event handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setLocalSearchValue(value) // Immediate visual feedback
      debouncedSetSearchQuery(value) // Debounced store update
    },
    [debouncedSetSearchQuery]
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
            const isXBookmarkData =
              Array.isArray(data) &&
              data.length > 0 &&
              (data[0].tweet_id || data[0].source_id) &&
              data[0].username

            // Check if bookmarks array contains X bookmark data
            const hasXBookmarksInObject =
              data.bookmarks &&
              Array.isArray(data.bookmarks) &&
              data.bookmarks.length > 0 &&
              (data.bookmarks[0].tweet_id || data.bookmarks[0].source_id) &&
              data.bookmarks[0].username

            let importedCount = 0

            if (isXBookmarkData) {
              await importXBookmarks(data) // Import all bookmarks
              importedCount = data.length
            } else if (hasXBookmarksInObject) {
              await importXBookmarks(data.bookmarks) // Import bookmarks array
              importedCount = data.bookmarks.length
            } else if (data.bookmarks && Array.isArray(data.bookmarks)) {
              // Regular export format with bookmarks, settings, metadata
              const importBookmarks =
                useBookmarkStore.getState().importBookmarks
              await importBookmarks(file)
              importedCount = data.bookmarks.length
            } else {
              // Fall back to regular import
              const importBookmarks =
                useBookmarkStore.getState().importBookmarks
              await importBookmarks(file)
              importedCount = data.bookmarks?.length || 0
            }

            // Show success message
            const message = importedCount === 1
              ? '✓ Imported 1 bookmark successfully. Refreshing...'
              : `✓ Imported ${importedCount} bookmarks successfully. Refreshing...`

            toast.success(message, { duration: 2500 })

            // Refresh after showing the message
            setTimeout(() => {
              window.location.reload()
            }, 2500)
          } else {
            alert('Invalid file type. Please upload a .json or .zip file.')
          }
        } catch (error) {
          logger.error('Import failed', { error })
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
          logger.error('Failed to add bookmark', { error })
        }
      },
    })
  }, [showAddBookmark, addBookmark])

  const handleHelpClick = useCallback(() => {
    // Just navigate to help page - sidebar state will be handled by HelpPage
    navigate('/help')
  }, [navigate])

  // Time Range dropdown handlers
  const handleFilterSelect = useCallback(
    (index: number) => {
      setActiveTab(index)
      resetFilters()
    },
    [setActiveTab, resetFilters]
  )

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
              value={localSearchValue}
              onChange={handleSearchChange}
            />
          </HStack>
        </Box>

        <Spacer />

        {/* Action Buttons */}
        <HStack gap={{ base: 2, md: 3 }}>
          {/* Help Button with Tooltip - First item */}
          {!isMobile && (
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
          )}

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

          {/* Time Range Dropdown - Hide on mobile */}
          {!isMobile && (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  {...secondaryButtonStyles}
                  size="sm"
                  px={3}
                  py={2}
                  borderRadius="8px"
                  fontSize="13px"
                  gap={2}
                  flexShrink={0}
                >
                  <LuCalendar size={14} />
                  <Box as="span" fontWeight="600">
                    {getActiveFilterLabel(activeTab)}
                  </Box>
                  <LuChevronDown size={12} />
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content
                    bg="var(--color-bg-tertiary)"
                    borderColor="var(--color-border)"
                    borderRadius="12px"
                    py={2}
                    minW="200px"
                    css={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <For each={FILTER_OPTIONS.slice(0, 3)}>
                      {(option) => {
                        const Icon = option.icon
                        const isActive = activeTab === option.index
                        return (
                          <Menu.Item
                            key={option.index}
                            value={option.label}
                            onClick={() => handleFilterSelect(option.index)}
                            bg={isActive ? colors.primary[500] : 'transparent'}
                            color={isActive ? 'white' : colors.dark.textPrimary}
                            _hover={{
                              bg: isActive
                                ? colors.primary[600]
                                : colors.dark.border,
                              color: isActive
                                ? 'white'
                                : colors.dark.textPrimary,
                            }}
                            px={3}
                            py={2}
                            fontSize="14px"
                            cursor="pointer"
                            transition="all 0.15s ease"
                          >
                            <HStack gap={2}>
                              <Icon size={16} />
                              <Box as="span">{option.label}</Box>
                            </HStack>
                          </Menu.Item>
                        )
                      }}
                    </For>
                    <Menu.Separator
                      my={2}
                      borderColor="var(--color-border)"
                      opacity={0.5}
                    />
                    <For each={FILTER_OPTIONS.slice(3)}>
                      {(option) => {
                        const Icon = option.icon
                        const isActive = activeTab === option.index
                        return (
                          <Menu.Item
                            key={option.index}
                            value={option.label}
                            onClick={() => handleFilterSelect(option.index)}
                            bg={isActive ? colors.primary[500] : 'transparent'}
                            color={isActive ? 'white' : colors.dark.textPrimary}
                            _hover={{
                              bg: isActive
                                ? colors.primary[600]
                                : colors.dark.border,
                              color: isActive
                                ? 'white'
                                : colors.dark.textPrimary,
                            }}
                            px={3}
                            py={2}
                            fontSize="14px"
                            cursor="pointer"
                            transition="all 0.15s ease"
                          >
                            <HStack gap={2}>
                              <Icon size={16} />
                              <Box as="span">{option.label}</Box>
                            </HStack>
                          </Menu.Item>
                        )
                      }}
                    </For>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )}

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
