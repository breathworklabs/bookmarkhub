import { Box, HStack, Input, Button, Spacer } from '@chakra-ui/react'
import { LuMenu, LuPlus } from 'react-icons/lu'
import { theme } from '../styles/theme'

interface SearchHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const SearchHeader = ({ searchQuery, setSearchQuery }: SearchHeaderProps) => {
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
          <Button {...theme.styles.secondaryButton}>
            <LuMenu size={14} />
            Filters
          </Button>
          <Button {...theme.styles.secondaryButton}>
            <LuPlus size={14} />
            Import
          </Button>
          <Button {...theme.styles.primaryButton}>
            <LuPlus size={14} />
            Add Bookmark
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}

export default SearchHeader