import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Dialog, Button, HStack, Text, Box, Input, VStack, Textarea, Badge } from '@chakra-ui/react'
import type { BookmarkInsert, Bookmark } from '../../types/bookmark'
import type { CollectionInsert } from '../../lib/localStorage'
import { sanitizeBookmark } from '../../lib/dataValidation'

interface ModalContextType {
  showDeleteConfirmation: (options: DeleteConfirmationOptions) => void
  showAddTag: (options: AddTagOptions) => void
  showAddBookmark: (options: AddBookmarkOptions) => void
  showEditBookmark: (options: EditBookmarkOptions) => void
  showCreateCollection: (options: CreateCollectionOptions) => void
  showEditCollection: (options: EditCollectionOptions) => void
  closeModal: () => void
}

interface DeleteConfirmationOptions {
  title?: string
  message: string
  confirmText?: string
  onConfirm: () => void
  onCancel?: () => void
  preview?: string
}

interface AddTagOptions {
  onAdd: (tagName: string) => void
  onCancel?: () => void
  placeholder?: string
  existingTags?: string[]
}

interface AddBookmarkOptions {
  onAdd: (bookmark: BookmarkInsert) => void
  onCancel?: () => void
}

interface EditBookmarkOptions {
  bookmark: Bookmark
  onEdit: (id: number, bookmark: BookmarkInsert) => void
  onCancel?: () => void
}

interface CreateCollectionOptions {
  onCreate: (collection: CollectionInsert) => void
  onCancel?: () => void
}

interface EditCollectionOptions {
  collection: any  // Will use the full Collection type later
  onEdit: (id: string, updates: Partial<any>) => void
  onCancel?: () => void
}

const ModalContext = createContext<ModalContextType | null>(null)

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

interface ModalState {
  type: 'delete' | 'addTag' | 'addBookmark' | 'editBookmark' | 'createCollection' | 'editCollection' | null
  options: any
}

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalState, setModalState] = useState<ModalState>({ type: null, options: null })
  const [tagInput, setTagInput] = useState('')
  const [bookmarkFormData, setBookmarkFormData] = useState<BookmarkInsert>({
    user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
    title: '',
    url: '',
    description: '',
    content: '',
    author: '',
    domain: '',
    source_platform: 'manual',
    engagement_score: 0,
    is_starred: false,
    is_read: false,
    is_archived: false,
    tags: [],
    collections: []
  })
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')
  const [collectionFormData, setCollectionFormData] = useState<CollectionInsert>({
    name: '',
    description: '',
    color: '#1d4ed8',
    icon: 'folder',
    isPrivate: false,
    isDefault: false,
    isSmartCollection: false,
    userId: 'local-user'
  })

  const showDeleteConfirmation = (options: DeleteConfirmationOptions) => {
    setModalState({ type: 'delete', options })
  }

  const showAddTag = (options: AddTagOptions) => {
    setModalState({ type: 'addTag', options })
    setTagInput('')
  }

  const showAddBookmark = (options: AddBookmarkOptions) => {
    setModalState({ type: 'addBookmark', options })
    setBookmarkFormData({
      user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
      title: '',
      url: '',
      description: '',
      content: '',
      author: '',
      domain: '',
      source_platform: 'manual',
      engagement_score: 0,
      is_starred: false,
      is_read: false,
      is_archived: false,
      tags: [],
      collections: ['uncategorized'],
      primaryCollection: 'uncategorized'
    })
    setIsAddingTag(false)
    setNewTagInput('')
  }

  const showEditBookmark = (options: EditBookmarkOptions) => {
    setModalState({ type: 'editBookmark', options })
    setBookmarkFormData({
      user_id: options.bookmark.user_id || 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
      title: options.bookmark.title || '',
      url: options.bookmark.url || '',
      description: options.bookmark.description || '',
      content: options.bookmark.content || '',
      author: options.bookmark.author || '',
      domain: options.bookmark.domain || '',
      source_platform: options.bookmark.source_platform || 'manual',
      engagement_score: options.bookmark.engagement_score || 0,
      is_starred: options.bookmark.is_starred || false,
      is_read: options.bookmark.is_read || false,
      is_archived: options.bookmark.is_archived || false,
      tags: options.bookmark.tags || [],
      collections: options.bookmark.collections || []
    })
    setIsAddingTag(false)
    setNewTagInput('')
  }

  const closeModal = () => {
    setModalState({ type: null, options: null })
    setTagInput('')
    setBookmarkFormData({
      user_id: 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
      title: '',
      url: '',
      description: '',
      content: '',
      author: '',
      domain: '',
      source_platform: 'manual',
      engagement_score: 0,
      is_starred: false,
      is_read: false,
      is_archived: false,
      tags: [],
      collections: ['uncategorized'],
      primaryCollection: 'uncategorized'
    })
    setIsAddingTag(false)
    setNewTagInput('')
  }

  const handleDeleteConfirm = () => {
    modalState.options?.onConfirm?.()
    closeModal()
  }

  const handleDeleteCancel = () => {
    modalState.options?.onCancel?.()
    closeModal()
  }

  const handleAddTag = () => {
    if (tagInput.trim()) {
      modalState.options?.onAdd?.(tagInput.trim())
      closeModal()
    }
  }

  const handleAddTagCancel = () => {
    modalState.options?.onCancel?.()
    closeModal()
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag()
    } else if (e.key === 'Escape') {
      closeModal()
    }
  }

  const handleBookmarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookmarkFormData.title.trim() || !bookmarkFormData.url.trim()) {
      return
    }

    // Extract domain from URL if not provided
    let domain = bookmarkFormData.domain
    if (!domain && bookmarkFormData.url) {
      try {
        const urlObj = new URL(bookmarkFormData.url)
        domain = urlObj.hostname.replace('www.', '')
      } catch {
        domain = 'unknown'
      }
    }

    const bookmarkData: BookmarkInsert = {
      ...bookmarkFormData,
      domain: domain || 'unknown',
      description: bookmarkFormData.description || `Bookmark for ${bookmarkFormData.title}`,
      content: bookmarkFormData.content || `Bookmark for ${bookmarkFormData.title}`,
      author: bookmarkFormData.author || 'Unknown'
    }

    if (modalState.type === 'editBookmark') {
      modalState.options?.onEdit?.(modalState.options.bookmark.id, bookmarkData)
    } else {
      modalState.options?.onAdd?.(bookmarkData)
    }
    closeModal()
  }

  const handleBookmarkFormChange = (field: keyof BookmarkInsert, value: any) => {
    setBookmarkFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddBookmarkTag = () => {
    const tag = newTagInput.trim()
    if (tag && !bookmarkFormData.tags.includes(tag)) {
      setBookmarkFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setNewTagInput('')
      setIsAddingTag(false)
    }
  }

  const removeBookmarkTag = (tagToRemove: string) => {
    setBookmarkFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleNewTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddBookmarkTag()
    } else if (e.key === 'Escape') {
      setIsAddingTag(false)
      setNewTagInput('')
    }
  }

  // Collection handlers
  const showCreateCollection = (options: CreateCollectionOptions) => {
    setModalState({ type: 'createCollection', options })
    setCollectionFormData({
      name: '',
      description: '',
      color: '#1d4ed8',
      icon: 'folder',
      isPrivate: false,
      isDefault: false,
      isSmartCollection: false,
      userId: 'local-user'
    })
  }

  const showEditCollection = (options: EditCollectionOptions) => {
    setModalState({ type: 'editCollection', options })
    setCollectionFormData({
      name: options.collection.name || '',
      description: options.collection.description || '',
      color: options.collection.color || '#1d4ed8',
      icon: options.collection.icon || 'folder',
      isPrivate: options.collection.isPrivate || false,
      isDefault: options.collection.isDefault || false,
      isSmartCollection: options.collection.isSmartCollection || false,
      userId: options.collection.userId || 'local-user'
    })
  }

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!collectionFormData.name.trim()) {
      return
    }

    if (modalState.type === 'editCollection') {
      modalState.options?.onEdit?.(modalState.options.collection.id, collectionFormData)
    } else {
      modalState.options?.onCreate?.(collectionFormData)
    }
    closeModal()
  }

  const handleCollectionFormChange = (field: keyof CollectionInsert, value: any) => {
    setCollectionFormData(prev => ({ ...prev, [field]: value }))
  }

  const contextValue: ModalContextType = {
    showDeleteConfirmation,
    showAddTag,
    showAddBookmark,
    showEditBookmark,
    showCreateCollection,
    showEditCollection,
    closeModal
  }

  return (
    <ModalContext.Provider value={contextValue}>
      {children}

      {/* Delete Confirmation Modal */}
      {modalState.type === 'delete' && (
        <Dialog.Root
          open={true}
          onOpenChange={(e) => !e.open && closeModal()}
          placement="center"
        >
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
                <Dialog.Title>
                  {modalState.options?.title || 'Confirm Delete'}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body px={6} pb={4}>
                <Text color="#e1e5e9" mb={3}>
                  {modalState.options?.message}
                </Text>
                {modalState.options?.preview && (
                  <Box
                    bg="#0f1419"
                    borderColor="#2a2d35"
                    border="1px solid"
                    borderRadius="8px"
                    p={3}
                    color="#71767b"
                    fontSize="sm"
                    maxH="60px"
                    overflow="hidden"
                  >
                    "{modalState.options.preview}"
                  </Box>
                )}
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
                    onClick={handleDeleteCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    bg="#dc2626"
                    color="white"
                    h="36px"
                    px={4}
                    _hover={{ bg: '#b91c1c' }}
                    onClick={handleDeleteConfirm}
                  >
                    {modalState.options?.confirmText || 'Delete'}
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )}

      {/* Add Tag Modal */}
      {modalState.type === 'addTag' && (
        <Dialog.Root
          open={true}
          onOpenChange={(e) => !e.open && closeModal()}
          placement="center"
        >
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
                  placeholder={modalState.options?.placeholder || "Enter tag name..."}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
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
                    onClick={handleAddTagCancel}
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
                    disabled={!tagInput.trim() || modalState.options?.existingTags?.includes(tagInput.trim())}
                    _disabled={{
                      bg: '#374151',
                      color: '#6b7280',
                      cursor: 'not-allowed'
                    }}
                    onClick={handleAddTag}
                  >
                    Add Tag
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )}

      {/* Add/Edit Bookmark Modal */}
      {(modalState.type === 'addBookmark' || modalState.type === 'editBookmark') && (
        <Dialog.Root
          open={true}
          onOpenChange={(e) => !e.open && closeModal()}
          placement="center"
        >
          <Dialog.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="#1a1d23"
              border="1px solid #2a2d35"
              borderRadius="16px"
              boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
              maxW="500px"
              w="500px"
              color="white"
            >
              <form onSubmit={handleBookmarkSubmit}>
                <Dialog.Header
                  color="#e1e5e9"
                  fontSize="18px"
                  fontWeight="600"
                  pb={3}
                  pt={6}
                  px={6}
                >
                  <Dialog.Title>{modalState.type === 'editBookmark' ? 'Edit Bookmark' : 'Add New Bookmark'}</Dialog.Title>
                </Dialog.Header>

                <Dialog.Body px={6} pb={4}>
                  <VStack gap={4} align="stretch">
                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="#9ca3af">Title *</Text>
                      <Input
                        value={bookmarkFormData.title}
                        onChange={(e) => handleBookmarkFormChange('title', e.target.value)}
                        placeholder="Enter bookmark title"
                        required
                        bg="#2a2d35"
                        border="1px solid #3a3d45"
                        _hover={{ borderColor: '#4a4d55' }}
                        _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="#9ca3af">URL *</Text>
                      <Input
                        type="url"
                        value={bookmarkFormData.url}
                        onChange={(e) => handleBookmarkFormChange('url', e.target.value)}
                        placeholder="https://example.com"
                        required
                        bg="#2a2d35"
                        border="1px solid #3a3d45"
                        _hover={{ borderColor: '#4a4d55' }}
                        _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="#9ca3af">Author</Text>
                      <Input
                        value={bookmarkFormData.author}
                        onChange={(e) => handleBookmarkFormChange('author', e.target.value)}
                        placeholder="Author name"
                        bg="#2a2d35"
                        border="1px solid #3a3d45"
                        _hover={{ borderColor: '#4a4d55' }}
                        _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="#9ca3af">Content</Text>
                      <Textarea
                        value={bookmarkFormData.content}
                        onChange={(e) => handleBookmarkFormChange('content', e.target.value)}
                        placeholder="Bookmark description or content preview"
                        rows={3}
                        bg="#2a2d35"
                        border="1px solid #3a3d45"
                        _hover={{ borderColor: '#4a4d55' }}
                        _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="#9ca3af">Tags</Text>
                      {bookmarkFormData.tags.length > 0 && (
                        <HStack wrap="wrap" gap={2}>
                          {bookmarkFormData.tags.map(tag => (
                            <Badge
                              key={tag}
                              bg="#2a2d35"
                              color="#e1e5e9"
                              px={3}
                              py={1}
                              borderRadius="full"
                              cursor="pointer"
                              _hover={{ bg: '#3a3d45' }}
                              onClick={() => removeBookmarkTag(tag)}
                            >
                              {tag} ×
                            </Badge>
                          ))}
                        </HStack>
                      )}
                      {!isAddingTag ? (
                        <Button
                          type="button"
                          onClick={() => setIsAddingTag(true)}
                          size="sm"
                          variant="outline"
                          bg="transparent"
                          border="1px solid #2a2d35"
                          color="#71767b"
                          alignSelf="flex-start"
                          _hover={{
                            bg: '#1a1d23',
                            color: '#e1e5e9',
                            borderColor: '#3a3d45'
                          }}
                        >
                          + Add Tag
                        </Button>
                      ) : (
                        <HStack gap={2}>
                          <Input
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyDown={handleNewTagKeyDown}
                            placeholder="Enter tag name..."
                            size="sm"
                            bg="#2a2d35"
                            border="1px solid #3a3d45"
                            _hover={{ borderColor: '#4a4d55' }}
                            _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            bg="#1d4ed8"
                            color="white"
                            _hover={{ bg: '#1e40af' }}
                            onClick={handleAddBookmarkTag}
                            disabled={!newTagInput.trim()}
                          >
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddingTag(false)
                              setNewTagInput('')
                            }}
                          >
                            Cancel
                          </Button>
                        </HStack>
                      )}
                    </VStack>
                  </VStack>
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
                      onClick={closeModal}
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
                      type="submit"
                      disabled={!bookmarkFormData.title.trim() || !bookmarkFormData.url.trim()}
                    >
                      {modalState.type === 'editBookmark' ? 'Edit Bookmark' : 'Add Bookmark'}
                    </Button>
                  </HStack>
                </Dialog.Footer>
              </form>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )}

      {/* Create/Edit Collection Modal */}
      {(modalState.type === 'createCollection' || modalState.type === 'editCollection') && (
        <Dialog.Root
          open={true}
          onOpenChange={(e) => !e.open && closeModal()}
          placement="center"
        >
          <Dialog.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="#1a1d23"
              border="1px solid #2a2d35"
              borderRadius="16px"
              boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
              maxW="400px"
              w="400px"
              color="white"
            >
              <form onSubmit={handleCollectionSubmit}>
                <Dialog.Header
                  color="#e1e5e9"
                  fontSize="18px"
                  fontWeight="600"
                  pb={3}
                  pt={6}
                  px={6}
                >
                  <Dialog.Title>{modalState.type === 'editCollection' ? 'Edit Collection' : 'Create Collection'}</Dialog.Title>
                </Dialog.Header>

                <Dialog.Body px={6} pb={4}>
                  <VStack gap={4} align="stretch">
                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="#9ca3af">Name *</Text>
                      <Input
                        value={collectionFormData.name}
                        onChange={(e) => handleCollectionFormChange('name', e.target.value)}
                        placeholder="Collection name"
                        required
                        bg="#2a2d35"
                        border="1px solid #3a3d45"
                        _hover={{ borderColor: '#4a4d55' }}
                        _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="#9ca3af">Description</Text>
                      <Textarea
                        value={collectionFormData.description}
                        onChange={(e) => handleCollectionFormChange('description', e.target.value)}
                        placeholder="Collection description (optional)"
                        rows={2}
                        bg="#2a2d35"
                        border="1px solid #3a3d45"
                        _hover={{ borderColor: '#4a4d55' }}
                        _focus={{ borderColor: '#1d4ed8', boxShadow: '0 0 0 1px #1d4ed8' }}
                      />
                    </VStack>
                  </VStack>
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
                      onClick={closeModal}
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
                      type="submit"
                      disabled={!collectionFormData.name.trim()}
                    >
                      {modalState.type === 'editCollection' ? 'Update Collection' : 'Create Collection'}
                    </Button>
                  </HStack>
                </Dialog.Footer>
              </form>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )}
    </ModalContext.Provider>
  )
}