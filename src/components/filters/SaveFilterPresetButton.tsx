import { Button, Dialog, Input, VStack, Text, HStack, Textarea } from '@chakra-ui/react'
import { LuSave } from 'react-icons/lu'
import { useState, useCallback, memo } from 'react'
import { useBookmarkStore } from '../../store/bookmarkStore'

const SaveFilterPresetButton = memo(() => {
  const saveFilterPreset = useBookmarkStore((state) => state.saveFilterPreset)
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const hasActiveFilters = useBookmarkStore((state) => {
    return (
      state.selectedTags.length > 0 ||
      state.searchQuery.trim() !== '' ||
      state.authorFilter.trim() !== '' ||
      state.domainFilter.trim() !== '' ||
      state.contentTypeFilter.trim() !== '' ||
      state.dateRangeFilter.type !== 'all' ||
      state.quickFilters.length > 0
    )
  })

  const handleOpenDialog = useCallback(() => {
    setIsOpen(true)
    setName('')
    setDescription('')
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setName('')
    setDescription('')
  }, [])

  const handleSavePreset = useCallback(() => {
    if (name.trim()) {
      saveFilterPreset(name.trim(), description.trim() || undefined)
      handleClose()
    }
  }, [name, description, saveFilterPreset, handleClose])

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={handleOpenDialog}
        disabled={!hasActiveFilters}
        style={{
          borderColor: 'var(--color-border)',
          color: hasActiveFilters ? 'var(--color-blue)' : 'var(--color-text-tertiary)',
          background: 'transparent'
        }}
        fontSize="12px"
        h="32px"
        px={3}
        gap={1}
        _hover={{
          borderColor: hasActiveFilters ? 'var(--color-blue)' : 'var(--color-border-hover)',
          color: hasActiveFilters ? 'var(--color-blue-hover)' : 'var(--color-text-primary)',
          bg: 'var(--color-bg-tertiary)'
        }}
        _disabled={{
          opacity: 0.5,
          cursor: 'not-allowed'
        }}
        title={hasActiveFilters ? 'Save current filter combination' : 'Apply some filters first'}
      >
        <LuSave size={14} />
        Save Filters
      </Button>

      <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()} placement="center">
        <Dialog.Backdrop bg="rgba(0, 0, 0, 0.85)" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            style={{ background: 'var(--color-bg-primary)' }}
            border="1px solid var(--color-border)"
            borderRadius="16px"
            boxShadow="0 25px 50px rgba(0, 0, 0, 0.6)"
            maxW="400px"
            w="400px"
            overflow="hidden"
          >
            <Dialog.Header
              bg="var(--gradient-modal)"
              borderBottomWidth="1px"
              style={{ borderColor: 'var(--color-border)' }}
              p={6}
            >
              <Dialog.Title>
                <Text fontSize="xl" fontWeight="700" style={{ color: 'var(--color-text-primary)' }}>
                  Save Filter Preset
                </Text>
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body px={6} py={6}>
              <VStack alignItems="stretch" gap={4}>
                <Text fontSize="sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Save your current filter combination for quick access later.
                </Text>
                <VStack alignItems="stretch" gap={2}>
                  <Text fontSize="sm" color="var(--color-text-secondary)">Name *</Text>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Work Articles, Starred Tweets..."
                    style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}
                    border="1px solid var(--color-border)"
                    borderRadius="12px"
                    _hover={{ borderColor: 'var(--color-border-hover)' }}
                    _focus={{ borderColor: 'var(--color-blue)', boxShadow: '0 0 0 2px rgba(29, 78, 216, 0.2)', outline: 'none' }}
                    _placeholder={{ color: 'var(--color-text-tertiary)' }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && name.trim()) {
                        handleSavePreset()
                      } else if (e.key === 'Escape') {
                        handleClose()
                      }
                    }}
                  />
                </VStack>
                <VStack alignItems="stretch" gap={2}>
                  <Text fontSize="sm" color="var(--color-text-secondary)">Description (optional)</Text>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={3}
                    style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}
                    border="1px solid var(--color-border)"
                    borderRadius="12px"
                    _hover={{ borderColor: 'var(--color-border-hover)' }}
                    _focus={{ borderColor: 'var(--color-blue)', boxShadow: '0 0 0 2px rgba(29, 78, 216, 0.2)', outline: 'none' }}
                    _placeholder={{ color: 'var(--color-text-tertiary)' }}
                  />
                </VStack>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer
              bg="var(--gradient-modal)"
              borderTopWidth="1px"
              style={{ borderColor: 'var(--color-border)' }}
              p={6}
            >
              <HStack gap={3} w="full" justify="flex-end">
                <Button
                  variant="ghost"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  borderRadius="10px"
                  _hover={{ color: 'var(--color-text-primary)', bg: 'rgba(42, 45, 53, 0.5)' }}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePreset}
                  disabled={!name.trim()}
                  style={{ background: 'var(--color-blue)' }}
                  color="white"
                  borderRadius="10px"
                  _hover={{ bg: 'var(--color-blue-hover)' }}
                  _disabled={{
                    bg: 'var(--color-border-hover)',
                    color: 'var(--color-text-tertiary)',
                    cursor: 'not-allowed'
                  }}
                >
                  Save
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
})

SaveFilterPresetButton.displayName = 'SaveFilterPresetButton'

export default SaveFilterPresetButton
