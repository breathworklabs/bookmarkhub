import { Box, HStack, Button, For } from '@chakra-ui/react'
import { useCallback, memo } from 'react'
import { useBookmarkSelectors } from '../hooks/selectors/useBookmarkSelectors'
import { useFilterReset } from '../utils/filterUtils'
import { useFilterTabStyles } from '../hooks/useStyles'
import { componentStyles } from '../styles/components'

// Memoized filter tabs array
const FILTER_TABS = ['All', 'Today', 'This Week', 'Threads', 'Media']

const FilterBar = memo(() => {
  const { activeTab, setActiveTab } = useBookmarkSelectors()

  const resetFilters = useFilterReset()

  // Memoized event handlers
  const handleTabClick = useCallback(
    (index: number) => {
      setActiveTab(index)
      resetFilters()
    },
    [setActiveTab, resetFilters]
  )

  return (
    <Box {...componentStyles.container.filterBar}>
      <HStack
        justify="space-between"
        alignItems="center"
        overflowX="auto"
        overflowY="hidden"
        gap={3}
        css={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          // Enable momentum scrolling on iOS
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Filter Tabs */}
        <HStack gap={3} flexShrink={0}>
          <For each={FILTER_TABS}>
            {(label, index) => {
              const isActive = activeTab === index
              const filterTabStyles = useFilterTabStyles(isActive)
              return (
                <Button
                  key={label}
                  {...filterTabStyles}
                  size="sm"
                  px={4}
                  py={2}
                  borderRadius="20px"
                  fontSize="14px"
                  onClick={() => handleTabClick(index)}
                  flexShrink={0}
                >
                  {label}
                </Button>
              )
            }}
          </For>
        </HStack>
      </HStack>
    </Box>
  )
})

FilterBar.displayName = 'FilterBar'

export default FilterBar
