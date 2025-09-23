import { Box, HStack, Text, Button, For } from '@chakra-ui/react'
import { useMemo, useCallback, memo } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useModal } from './modals/ModalProvider'
import TagChip from './tags/TagChip'

// Memoized filter tabs array
const FILTER_TABS = ['All', 'Today', 'This Week', 'Threads', 'Media']

const FilterBar = memo(() => {
  const activeTab = useBookmarkStore((state) => state.activeTab)
  const setActiveTab = useBookmarkStore((state) => state.setActiveTab)
  const selectedTags = useBookmarkStore((state) => state.selectedTags)
  const removeTag = useBookmarkStore((state) => state.removeTag)
  const addTag = useBookmarkStore((state) => state.addTag)
  const setActiveSidebarItem = useBookmarkStore((state) => state.setActiveSidebarItem)
  const setActiveCollection = useCollectionsStore((state) => state.setActiveCollection)
  const { showAddTag } = useModal()

  // Memoized event handlers
  const handleAddTag = useCallback(() => {
    showAddTag({
      placeholder: "Enter tag name...",
      existingTags: selectedTags,
      onAdd: (tagName: string) => {
        addTag(tagName)
        // Reset sidebar to All Bookmarks and clear active collection when adding tags
        setActiveSidebarItem('All Bookmarks')
        setActiveCollection(null)
      }
    })
  }, [showAddTag, selectedTags, addTag, setActiveSidebarItem, setActiveCollection])

  const handleTabClick = useCallback((index: number) => {
    setActiveTab(index)
    // Reset sidebar to All Bookmarks and clear active collection when changing tabs
    setActiveSidebarItem('All Bookmarks')
    setActiveCollection(null)
  }, [setActiveTab, setActiveSidebarItem, setActiveCollection])

  const handleRemoveTag = useCallback((tag: string) => {
    removeTag(tag)
  }, [removeTag])

  return (
    <Box bg="#0f1419" borderBottomWidth="1px" borderColor="gray.700" px={6} py={4}>
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
                  // Reset sidebar to All Bookmarks and clear active collection when removing tags
                  setActiveSidebarItem('All Bookmarks')
                  setActiveCollection(null)
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
        </HStack>
      </HStack>

    </Box>
  )
})

FilterBar.displayName = 'FilterBar'

export default FilterBar