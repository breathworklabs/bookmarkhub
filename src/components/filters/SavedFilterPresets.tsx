import { Dialog, Button, VStack, HStack, Text, IconButton, For, Input, Badge, Textarea, Box } from '@chakra-ui/react'
import { LuBookmark, LuTrash2, LuCheck, LuX, LuPencil, LuFilter } from 'react-icons/lu'
import { useState, memo, useCallback } from 'react'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { useFilterReset } from '../../utils/filterUtils'
import type { SavedFilterPreset } from '../../store/bookmarkStore'

const SavedFilterPresets = memo(() => {
  const savedFilterPresets = useBookmarkStore((state) => state.savedFilterPresets)
  const loadFilterPreset = useBookmarkStore((state) => state.loadFilterPreset)
  const deleteFilterPreset = useBookmarkStore((state) => state.deleteFilterPreset)
  const updateFilterPreset = useBookmarkStore((state) => state.updateFilterPreset)
  const resetFilters = useFilterReset()

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const handleOpenModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsOpen(false)
    setEditingId(null)
    setEditName('')
    setEditDescription('')
  }, [])

  const handleLoadPreset = useCallback((presetId: string) => {
    loadFilterPreset(presetId)
    resetFilters()
    handleCloseModal()
  }, [loadFilterPreset, resetFilters, handleCloseModal])

  const handleDeletePreset = useCallback((presetId: string) => {
    deleteFilterPreset(presetId)
  }, [deleteFilterPreset])

  const handleStartEdit = useCallback((preset: SavedFilterPreset) => {
    setEditingId(preset.id)
    setEditName(preset.name)
    setEditDescription(preset.description || '')
  }, [])

  const handleSaveEdit = useCallback((presetId: string) => {
    if (editName.trim()) {
      updateFilterPreset(presetId, editName.trim(), editDescription.trim() || undefined)
      setEditingId(null)
      setEditName('')
      setEditDescription('')
    }
  }, [editName, editDescription, updateFilterPreset])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditName('')
    setEditDescription('')
  }, [])

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={handleOpenModal}
        disabled={savedFilterPresets.length === 0}
        style={{
          borderColor: 'var(--color-border)',
          color: savedFilterPresets.length > 0 ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
          background: 'transparent'
        }}
        fontSize="12px"
        h="32px"
        px={3}
        gap={1}
        _hover={{
          borderColor: savedFilterPresets.length > 0 ? 'var(--color-border-hover)' : 'var(--color-border)',
          bg: savedFilterPresets.length > 0 ? 'var(--color-bg-tertiary)' : 'transparent'
        }}
        _disabled={{
          opacity: 0.5,
          cursor: 'not-allowed'
        }}
        title={savedFilterPresets.length > 0 ? 'Load saved filter preset' : 'No saved presets'}
      >
        <LuBookmark size={14} />
        Load Preset
        {savedFilterPresets.length > 0 && (
          <Badge
            bg="var(--color-blue)"
            color="white"
            fontSize="10px"
            px={1.5}
            py={0.5}
            borderRadius="full"
            ml={1}
          >
            {savedFilterPresets.length}
          </Badge>
        )}
      </Button>

      <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleCloseModal()} placement="center">
        <Dialog.Backdrop bg="rgba(0, 0, 0, 0.85)" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            style={{ background: 'var(--color-bg-primary)' }}
            border="1px solid var(--color-border)"
            borderRadius="16px"
            boxShadow="0 25px 50px rgba(0, 0, 0, 0.6)"
            maxW="500px"
            w="500px"
            overflow="hidden"
          >
            <Dialog.Header
              bg="var(--gradient-modal)"
              borderBottomWidth="1px"
              style={{ borderColor: 'var(--color-border)' }}
              p={6}
              textAlign="center"
            >
              <Dialog.Title>
                <Text fontSize="xl" fontWeight="700" style={{ color: 'var(--color-text-primary)' }}>
                  Saved Filter Presets
                </Text>
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body px={6} py={6}>
              {savedFilterPresets.length === 0 ? (
                <Box p={12} textAlign="center">
                  <VStack gap={3}>
                    <Box color="var(--color-text-tertiary)" fontSize="48px">
                      🔖
                    </Box>
                    <Text color="var(--color-text-tertiary)" fontSize="md" fontWeight="500">
                      No saved presets yet
                    </Text>
                    <Text color="var(--color-text-tertiary)" fontSize="sm">
                      Save your current filters for quick access later
                    </Text>
                  </VStack>
                </Box>
              ) : (
                <Box
                  maxH="400px"
                  overflowY="auto"
                  border="1px solid var(--color-border)"
                  borderRadius="12px"
                  bg="var(--color-bg-tertiary)"
                  boxShadow="inset 0 2px 4px rgba(0, 0, 0, 0.1)"
                >
                  <VStack align="stretch" gap={0}>
                    <For each={savedFilterPresets}>
                      {(preset, index) => (
                        <Box
                          key={preset.id}
                          borderBottom={index < savedFilterPresets.length - 1 ? "1px solid rgba(42, 45, 53, 0.5)" : "none"}
                        >
                          <HStack
                            p={4}
                            justify="space-between"
                            align="center"
                            _hover={{ bg: 'rgba(42, 45, 53, 0.5)' }}
                            cursor={editingId === preset.id ? 'default' : 'pointer'}
                            onClick={editingId === preset.id ? undefined : () => handleLoadPreset(preset.id)}
                            transition="background-color 0.2s ease"
                          >
                            {editingId === preset.id ? (
                              <VStack align="stretch" gap={2} flex={1} onClick={(e) => e.stopPropagation()}>
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit(preset.id)
                                    if (e.key === 'Escape') handleCancelEdit()
                                  }}
                                  size="sm"
                                  bg="var(--color-border)"
                                  border="1px solid var(--color-border-hover)"
                                  borderRadius="8px"
                                  _focus={{ borderColor: 'var(--color-blue)' }}
                                  autoFocus
                                />
                                <Textarea
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="Description (optional)"
                                  size="sm"
                                  bg="var(--color-border)"
                                  border="1px solid var(--color-border-hover)"
                                  borderRadius="8px"
                                  rows={2}
                                  _focus={{ borderColor: 'var(--color-blue)' }}
                                />
                                <HStack gap={1}>
                                  <IconButton
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Save"
                                    onClick={() => handleSaveEdit(preset.id)}
                                    color="var(--color-blue)"
                                    borderRadius="8px"
                                    _hover={{ color: 'var(--color-blue-hover)', bg: 'rgba(59, 130, 246, 0.15)' }}
                                  >
                                    <LuCheck size={14} />
                                  </IconButton>
                                  <IconButton
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Cancel"
                                    onClick={handleCancelEdit}
                                    color="var(--color-text-tertiary)"
                                    borderRadius="8px"
                                    _hover={{ color: 'var(--color-text-primary)', bg: 'rgba(42, 45, 53, 0.8)' }}
                                  >
                                    <LuX size={14} />
                                  </IconButton>
                                </HStack>
                              </VStack>
                            ) : (
                              <>
                                <VStack align="start" gap={1.5} flex={1}>
                                  <HStack gap={2}>
                                    <LuBookmark size={14} color="var(--color-blue)" />
                                    <Text fontSize="sm" fontWeight="500" color="var(--color-text-primary)">
                                      {preset.name}
                                    </Text>
                                  </HStack>
                                  {preset.description && (
                                    <Text fontSize="xs" color="var(--color-text-secondary)" ml={5}>
                                      {preset.description}
                                    </Text>
                                  )}
                                  {(preset.filters.selectedTags.length > 0 || preset.filters.quickFilters.length > 0) && (
                                    <HStack gap={1.5} ml={5}>
                                      {preset.filters.selectedTags.length > 0 && (
                                        <Badge
                                          bg="rgba(42, 45, 53, 0.8)"
                                          color="var(--color-text-tertiary)"
                                          fontSize="xs"
                                          px={2.5}
                                          py={1}
                                          borderRadius="full"
                                          fontWeight="500"
                                        >
                                          {preset.filters.selectedTags.length} tags
                                        </Badge>
                                      )}
                                      {preset.filters.quickFilters.length > 0 && (
                                        <Badge
                                          bg="rgba(42, 45, 53, 0.8)"
                                          color="var(--color-text-tertiary)"
                                          fontSize="xs"
                                          px={2.5}
                                          py={1}
                                          borderRadius="full"
                                          fontWeight="500"
                                        >
                                          {preset.filters.quickFilters.length} filters
                                        </Badge>
                                      )}
                                    </HStack>
                                  )}
                                </VStack>
                                <HStack gap={1} onClick={(e) => e.stopPropagation()}>
                                  <IconButton
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Edit preset"
                                    color="var(--color-text-tertiary)"
                                    borderRadius="8px"
                                    _hover={{ color: 'var(--color-text-primary)', bg: 'rgba(42, 45, 53, 0.8)' }}
                                    _focus={{ boxShadow: 'none', outline: 'none' }}
                                    _focusVisible={{ boxShadow: 'none', outline: 'none' }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStartEdit(preset)
                                    }}
                                  >
                                    <LuPencil size={14} />
                                  </IconButton>
                                  <IconButton
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Delete preset"
                                    color="var(--color-error)"
                                    borderRadius="8px"
                                    _hover={{ color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.15)' }}
                                    _focus={{ boxShadow: 'none', outline: 'none' }}
                                    _focusVisible={{ boxShadow: 'none', outline: 'none' }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeletePreset(preset.id)
                                    }}
                                  >
                                    <LuTrash2 size={14} />
                                  </IconButton>
                                </HStack>
                              </>
                            )}
                          </HStack>
                        </Box>
                      )}
                    </For>
                  </VStack>
                </Box>
              )}
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
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
})

SavedFilterPresets.displayName = 'SavedFilterPresets'

export default SavedFilterPresets
