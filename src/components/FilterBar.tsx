import { Box, HStack, Text, Button, For, Input } from '@chakra-ui/react'
import { Dialog } from '@chakra-ui/react'
import { LuPlus } from 'react-icons/lu'
import { useState } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'

const FilterBar = () => {
  const activeTab = useBookmarkStore((state) => state.activeTab)
  const setActiveTab = useBookmarkStore((state) => state.setActiveTab)
  const selectedTags = useBookmarkStore((state) => state.selectedTags)
  const removeTag = useBookmarkStore((state) => state.removeTag)
  const addTag = useBookmarkStore((state) => state.addTag)
  const filterTabs = ['All', 'Today', 'This Week', 'Threads', 'Media']

  const [isOpen, setIsOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  const onOpen = () => setIsOpen(true)
  const onClose = () => {
    setIsOpen(false)
    setNewTagName('')
  }

  const handleAddTag = () => {
    if (newTagName.trim() && !selectedTags.includes(newTagName.trim())) {
      addTag(newTagName.trim())
      setNewTagName('')
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag()
    }
  }

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
            onClick={onOpen}
            gap={1}
            alignItems="center"
          >
            <LuPlus size={12} />
            Add Tag
          </Button>
        </HStack>
      </HStack>

      {/* Add Tag Dialog */}
      <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="center">
        <Dialog.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="#1a1d23"
            border="1px solid #2a2d35"
            borderRadius="16px"
            boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
            maxW="400px"
            w="400px"
          >
            <Dialog.Header
              color="#e1e5e9"
              fontSize="18px"
              fontWeight="600"
              pb={3}
              pt={6}
              px={6}
            >
              <Dialog.Title>Add New Tag</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body px={6} pb={4}>
              <Input
                placeholder="Enter tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={handleKeyPress}
                bg="#0f1419"
                borderColor="#2a2d35"
                color="#e1e5e9"
                fontSize="14px"
                h="40px"
                _placeholder={{ color: '#71767b' }}
                _hover={{ borderColor: '#3a3d45' }}
                _focus={{
                  borderColor: '#1d4ed8',
                  boxShadow: '0 0 0 1px #1d4ed8',
                  outline: 'none'
                }}
                autoFocus
              />
            </Dialog.Body>
            <Dialog.Footer px={6} pb={6} pt={2}>
              <HStack gap={3} w="full" justify="flex-end">
                <Button
                  variant="outline"
                  size="sm"
                  borderColor="#2a2d35"
                  color="#71767b"
                  bg="transparent"
                  h="36px"
                  px={4}
                  _hover={{
                    borderColor: '#3a3d45',
                    color: '#e1e5e9',
                    bg: '#252932'
                  }}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  bg="#1d4ed8"
                  color="white"
                  h="36px"
                  px={4}
                  _hover={{ bg: '#1e40af' }}
                  _disabled={{
                    bg: '#374151',
                    color: '#6b7280',
                    cursor: 'not-allowed'
                  }}
                  onClick={handleAddTag}
                  isDisabled={!newTagName.trim() || selectedTags.includes(newTagName.trim())}
                >
                  Add Tag
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  )
}

export default FilterBar