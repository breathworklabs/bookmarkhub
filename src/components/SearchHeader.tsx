import { Box, HStack, Input, Button, Spacer } from '@chakra-ui/react'
import { LuMenu } from 'react-icons/lu'
import { theme } from '../styles/theme'
import { useBookmarkStore } from '../store/bookmarkStore'

const SearchHeader = () => {
  const searchQuery = useBookmarkStore((state) => state.searchQuery)
  const setSearchQuery = useBookmarkStore((state) => state.setSearchQuery)
  const isFiltersPanelOpen = useBookmarkStore((state) => state.isFiltersPanelOpen)
  const toggleFiltersPanel = useBookmarkStore((state) => state.toggleFiltersPanel)
  return (
    <Box {...theme.styles.container.header}>
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
              {...theme.styles.searchInput}
              placeholder="Search bookmarks, content, authors..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </HStack>
        </Box>

        <Spacer />

        {/* Action Buttons */}
        <HStack gap={3}>
          <Button
            {...theme.styles.secondaryButton}
            bg={isFiltersPanelOpen ? '#1d4ed8' : 'transparent'}
            color={isFiltersPanelOpen ? 'white' : '#71767b'}
            borderColor={isFiltersPanelOpen ? '#1d4ed8' : '#2a2d35'}
            _hover={{
              bg: isFiltersPanelOpen ? '#1e40af' : '#1a1d23',
              color: isFiltersPanelOpen ? 'white' : '#e1e5e9',
              borderColor: isFiltersPanelOpen ? '#1e40af' : '#3a3d45'
            }}
            onClick={toggleFiltersPanel}
          >
            <LuMenu size={14} />
            Filters
          </Button>
          <Button {...theme.styles.secondaryButton}>
            +
            Import
          </Button>
          <Button {...theme.styles.primaryButton}>
            +
            Add Bookmark
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}

export default SearchHeader