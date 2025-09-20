import { Box, HStack, Text, Button, For } from '@chakra-ui/react'
import { useBookmarkStore } from '../store/bookmarkStore'

const FilterBar = () => {
  const activeTab = useBookmarkStore((state) => state.activeTab)
  const setActiveTab = useBookmarkStore((state) => state.setActiveTab)
  const selectedTags = useBookmarkStore((state) => state.selectedTags)
  const removeTag = useBookmarkStore((state) => state.removeTag)
  const filterTabs = ['All', 'Today', 'This Week', 'Threads', 'Media']

  return (
    <Box bg="#0f1419" borderBottomWidth="1px" borderColor="gray.700" px={6} py={4}>
      <HStack justify="space-between" alignItems="center">
        {/* Filter Tabs */}
        <HStack gap={3}>
          <For each={filterTabs}>
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
                onClick={() => setActiveTab(index)}
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
              <HStack
                key={tag}
                bg="#1a1d23"
                border="1px solid #2a2d35"
                color="#9ca3af"
                px={3}
                py={2}
                borderRadius="16px"
                fontSize="13px"
                fontWeight="500"
                cursor="pointer"
                _hover={{
                  bg: '#252932',
                  color: '#e1e5e9',
                  borderColor: '#3a3d45'
                }}
                onClick={() => removeTag(tag)}
                gap={2}
                alignItems="center"
              >
                <Text>#{tag}</Text>
                <Box
                  w="14px"
                  h="14px"
                  color="#71767b"
                  _hover={{ color: '#e1e5e9' }}
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Box>
              </HStack>
            )}
          </For>
        </HStack>
      </HStack>
    </Box>
  )
}

export default FilterBar