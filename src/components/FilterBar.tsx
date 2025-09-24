import { Box, HStack, Button, For } from '@chakra-ui/react'
import { LuSettings } from 'react-icons/lu'
import { useCallback, memo } from 'react'
import { useBookmarkSelectors } from '../hooks/selectors/useBookmarkSelectors'
import { useFilterReset } from '../utils/filterUtils'
import { useModal } from './modals/ModalProvider'
import TagChip from './tags/TagChip'

// Memoized filter tabs array
const FILTER_TABS = ['All', 'Today', 'This Week', 'Threads', 'Media']

const FilterBar = memo(() => {
  const {
    activeTab,
    setActiveTab,
    selectedTags,
    removeTag,
    addTag
  } = useBookmarkSelectors()

  const resetFilters = useFilterReset()
  const { showAddTag, showTagManager } = useModal()

  // Memoized event handlers
  const handleAddTag = useCallback(() => {
    showAddTag({
      placeholder: "Enter tag name...",
      existingTags: selectedTags,
      onAdd: (tagName: string) => {
        addTag(tagName)
        resetFilters()
      }
    })
  }, [showAddTag, selectedTags, addTag, resetFilters])

  const handleTabClick = useCallback((index: number) => {
    setActiveTab(index)
    resetFilters()
  }, [setActiveTab, resetFilters])

  const handleRemoveTag = useCallback((tag: string) => {
    removeTag(tag)
  }, [removeTag])

  return (
    <Box
      bg="linear-gradient(135deg, #0f1419 0%, #1a1d23 100%)"
      borderBottomWidth="1px"
      borderColor="gray.700"
      px={6}
      py={4}
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
    >
      <HStack justify="space-between" alignItems="center">
        {/* Filter Tabs */}
        <HStack gap={3}>
          <For each={FILTER_TABS}>
            {(label, index) => (
              <Button
                key={label}
                variant="ghost"
                size="sm"
                px={4}
                py={2}
                borderRadius="20px"
                bg={activeTab === index ? '#1d4ed8' : 'transparent'}
                color={activeTab === index ? 'white' : '#71767b'}
                fontWeight={activeTab === index ? '600' : '400'}
                fontSize="14px"
                _hover={{
                  bg: activeTab === index ? '#1e40af' : '#2a2d35',
                  color: activeTab === index ? 'white' : '#e1e5e9'
                }}
                onClick={() => handleTabClick(index)}
              >
                {label}
              </Button>
            )}
          </For>
        </HStack>

        {/* Tags */}
        <HStack gap={3}>
          <For each={selectedTags}>
            {(tag) => (
              <TagChip
                key={tag}
                tag={tag}
                isActive={true}
                isRemovable={true}
                variant="filter"
                size="md"
                onRemove={(removedTag) => {
                  handleRemoveTag(removedTag)
                  resetFilters()
                }}
              />
            )}
          </For>

          {/* Add Tag Button */}
          <Button
            size="sm"
            variant="outline"
            bg="transparent"
            border="1px solid #2a2d35"
            color="#71767b"
            px={3}
            py={2}
            borderRadius="16px"
            fontSize="13px"
            fontWeight="500"
            _hover={{
              bg: '#1a1d23',
              color: '#e1e5e9',
              borderColor: '#3a3d45'
            }}
            onClick={handleAddTag}
            gap={1}
            alignItems="center"
          >
            +
            Add Tag
          </Button>

          {/* Manage Tags Button */}
          <Button
            size="sm"
            variant="ghost"
            color="#71767b"
            px={2}
            py={2}
            borderRadius="16px"
            fontSize="13px"
            fontWeight="500"
            _hover={{
              bg: '#1a1d23',
              color: '#e1e5e9'
            }}
            onClick={showTagManager}
            gap={1}
            alignItems="center"
            title="Manage Tags"
          >
            <LuSettings size={14} />
          </Button>
        </HStack>
      </HStack>

    </Box>
  )
})

FilterBar.displayName = 'FilterBar'

export default FilterBar