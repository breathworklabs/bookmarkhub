import { Box, HStack, Button, For } from '@chakra-ui/react'
import { useCallback, memo } from 'react'
import { useBookmarkSelectors } from '@/hooks/selectors/useBookmarkSelectors'
import { useFilterTabStyles } from '@/hooks/useStyles'
import { componentStyles } from '@/styles/components'

// Memoized filter tabs array
const FILTER_TABS = [
  'All',
  'Today',
  'This Week',
  'This Month',
  'Threads',
  'Media',
]

interface FilterTabButtonProps {
  label: string
  index: number
  isActive: boolean
  onClick: (index: number) => void
}

const FilterTabButton = memo(
  ({ label, index, isActive, onClick }: FilterTabButtonProps) => {
    const filterTabStyles = useFilterTabStyles(isActive)

    return (
      <Button
        {...filterTabStyles}
        size="sm"
        px={4}
        py={2}
        borderRadius="20px"
        fontSize="14px"
        onClick={() => onClick(index)}
        flexShrink={0}
      >
        {label}
      </Button>
    )
  }
)

FilterTabButton.displayName = 'FilterTabButton'

const FilterBar = memo(() => {
  const { activeTab, setActiveTab, setDateRangeFilter } = useBookmarkSelectors()

  const handleTabClick = useCallback(
    (index: number) => {
      setActiveTab(index)

      if (index === 0) {
        setDateRangeFilter({ type: 'all' })
      } else if (index === 1) {
        setDateRangeFilter({ type: 'today' })
      } else if (index === 2) {
        setDateRangeFilter({ type: 'week' })
      } else if (index === 3) {
        setDateRangeFilter({ type: 'month' })
      }
    },
    [setActiveTab, setDateRangeFilter]
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
            {(label, index) => (
              <FilterTabButton
                key={label}
                label={label}
                index={index}
                isActive={activeTab === index}
                onClick={handleTabClick}
              />
            )}
          </For>
        </HStack>
      </HStack>
    </Box>
  )
})

FilterBar.displayName = 'FilterBar'

export default FilterBar
