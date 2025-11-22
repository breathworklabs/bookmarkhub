import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'
import {
  Dialog,
  Button,
  HStack,
  Text,
  Box,
  Input,
  VStack,
  Textarea,
  For,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectValueText,
  createListCollection,
} from '@chakra-ui/react'
import type { BookmarkInsert, Bookmark } from '../../types/bookmark'
import type { CollectionInsert } from '../../lib/localStorage'
import { DataProcessingService } from '../../services/dataProcessingService'
import ImageModal from './ImageModal'
import TagManagerModal from '../tags/TagManagerModal'
import TagMergeModal from '../tags/TagMergeModal'
import DuplicateBookmarkDialog from './DuplicateBookmarkDialog'
import TagInput from '../tags/TagInput'
import TagChip from '../tags/TagChip'
import { useCollectionsStore } from '../../store/collectionsStore'
import {
  getCollectionPathString,
  wouldCreateCircularReference,
} from '../../utils/collectionHierarchy'

interface TagMergeOptions {
  initialSourceTags?: string[]
}

interface ModalContextType {
  showDeleteConfirmation: (options: DeleteConfirmationOptions) => void
  showAddTag: (options: AddTagOptions) => void
  showAddBookmark: (options: AddBookmarkOptions) => void
  showEditBookmark: (options: EditBookmarkOptions) => void
  showCreateCollection: (options: CreateCollectionOptions) => void
  showEditCollection: (options: EditCollectionOptions) => void
  showImageModal: (options: ImageModalOptions) => void
  showTagManager: () => void
  showTagMerge: (options?: TagMergeOptions) => void
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
  collection: any // Will use the full Collection type later
  onEdit: (id: string, updates: Partial<any>) => void
  onCancel?: () => void
}

interface ImageModalOptions {
  images: string[]
  initialIndex?: number
  title?: string
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
  type:
    | 'delete'
    | 'addTag'
    | 'addBookmark'
    | 'editBookmark'
    | 'createCollection'
    | 'editCollection'
    | 'imageModal'
    | null
  options: any
}

interface ImageModalState {
  isOpen: boolean
  images: string[]
  initialIndex: number
  title?: string
}

interface TagManagerState {
  isOpen: boolean
}

interface TagMergeState {
  isOpen: boolean
  initialSourceTags: string[]
}

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    options: null,
  })
  const [imageModalState, setImageModalState] = useState<ImageModalState>({
    isOpen: false,
    images: [],
    initialIndex: 0,
    title: undefined,
  })
  const [tagManagerState, setTagManagerState] = useState<TagManagerState>({
    isOpen: false,
  })
  const [tagMergeState, setTagMergeState] = useState<TagMergeState>({
    isOpen: false,
    initialSourceTags: [],
  })
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
    is_shared: false,
    tags: [],
    collections: [],
  })
  const [collectionFormData, setCollectionFormData] =
    useState<CollectionInsert>({
      name: '',
      description: '',
      parentId: null,
      color: 'var(--color-blue)',
      icon: 'folder',
      isPrivate: false,
      isDefault: false,
      isSmartCollection: false,
      userId: 'local-user',
    })

  // Get collections for parent selector
  const collections = useCollectionsStore((state) => state.collections)

  // Get valid parent collections (exclude current collection and its descendants when editing)
  const validParentCollections = useMemo(() => {
    const currentCollectionId =
      modalState.type === 'editCollection'
        ? modalState.options?.collection?.id
        : undefined

    return collections.filter((c) => {
      // Exclude smart collections (they can't be parents)
      if (c.isSmartCollection) return false

      // When editing, exclude self and descendants
      if (currentCollectionId && c.id === currentCollectionId) return false
      if (
        currentCollectionId &&
        wouldCreateCircularReference(currentCollectionId, c.id, collections)
      ) {
        return false
      }

      return true
    })
  }, [collections, modalState.type, modalState.options])

  // Create parent collection options for select
  const parentCollectionOptions = useMemo(() => {
    const items = [
      { label: 'None (Root Level)', value: '__none__' },
      ...validParentCollections.map((c) => ({
        label: getCollectionPathString(c.id, collections, ' → '),
        value: c.id,
      })),
    ]
    return createListCollection({ items })
  }, [validParentCollections, collections])

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
      is_shared: false,
      tags: [],
      collections: ['uncategorized'],
      primaryCollection: 'uncategorized',
    })
  }

  const showEditBookmark = (options: EditBookmarkOptions) => {
    setModalState({ type: 'editBookmark', options })
    setBookmarkFormData({
      user_id:
        options.bookmark.user_id || 'ae879c80-f3fc-4e05-a837-384e4b9bfb28',
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
      is_shared: options.bookmark.is_shared || false,
      tags: options.bookmark.tags || [],
      collections: options.bookmark.collections || [],
    })
  }

  const closeModal = useCallback(() => {
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
      is_shared: false,
      tags: [],
      collections: ['uncategorized'],
      primaryCollection: 'uncategorized',
    })
  }, [])

  const handleDeleteConfirm = () => {
    modalState.options?.onConfirm?.()
    closeModal()
  }

  const handleDeleteCancel = () => {
    modalState.options?.onCancel?.()
    closeModal()
  }

  const handleAddTag = useCallback(() => {
    if (tagInput.trim()) {
      modalState.options?.onAdd?.(tagInput.trim())
      closeModal()
    }
  }, [tagInput, modalState.options])

  const handleAddTagCancel = () => {
    modalState.options?.onCancel?.()
    closeModal()
  }

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAddTag()
      } else if (e.key === 'Escape') {
        closeModal()
      }
    },
    [handleAddTag, closeModal]
  )

  const handleBookmarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookmarkFormData.title.trim() || !bookmarkFormData.url.trim()) {
      return
    }

    // Prepare bookmark data using DataProcessingService
    const bookmarkData: BookmarkInsert =
      DataProcessingService.prepareBookmarkForForm(bookmarkFormData)

    if (modalState.type === 'editBookmark') {
      modalState.options?.onEdit?.(modalState.options.bookmark.id, bookmarkData)
    } else {
      modalState.options?.onAdd?.(bookmarkData)
    }
    closeModal()
  }

  const handleBookmarkFormChange = useCallback(
    (field: keyof BookmarkInsert, value: any) => {
      setBookmarkFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const addBookmarkTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !bookmarkFormData.tags.includes(trimmedTag)) {
      setBookmarkFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }))
    }
  }, [bookmarkFormData.tags])

  const removeBookmarkTag = useCallback((tagToRemove: string) => {
    setBookmarkFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }, [])

  // Collection handlers
  const showCreateCollection = (options: CreateCollectionOptions) => {
    setModalState({ type: 'createCollection', options })
    setCollectionFormData({
      name: '',
      description: '',
      color: 'var(--color-blue)',
      icon: 'folder',
      isPrivate: false,
      isDefault: false,
      isSmartCollection: false,
      userId: 'local-user',
    })
  }

  const showEditCollection = (options: EditCollectionOptions) => {
    setModalState({ type: 'editCollection', options })
    setCollectionFormData({
      name: options.collection.name || '',
      description: options.collection.description || '',
      color: options.collection.color || 'var(--color-blue)',
      icon: options.collection.icon || 'folder',
      isPrivate: options.collection.isPrivate || false,
      isDefault: options.collection.isDefault || false,
      isSmartCollection: options.collection.isSmartCollection || false,
      userId: options.collection.userId || 'local-user',
    })
  }

  const handleCollectionSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!collectionFormData.name.trim()) {
        return
      }

      if (modalState.type === 'editCollection') {
        modalState.options?.onEdit?.(
          modalState.options.collection.id,
          collectionFormData
        )
      } else {
        modalState.options?.onCreate?.(collectionFormData)
      }
      closeModal()
    },
    [collectionFormData, modalState.type, modalState.options]
  )

  const handleCollectionFormChange = useCallback(
    (field: keyof CollectionInsert, value: any) => {
      // Handle special "__none__" value for parentId
      if (field === 'parentId' && value === '__none__') {
        setCollectionFormData((prev) => ({ ...prev, [field]: null }))
      } else {
        setCollectionFormData((prev) => ({ ...prev, [field]: value }))
      }
    },
    []
  )

  const showImageModal = (options: ImageModalOptions) => {
    setImageModalState({
      isOpen: true,
      images: options.images,
      initialIndex: options.initialIndex || 0,
      title: options.title,
    })
  }

  const closeImageModal = () => {
    setImageModalState({
      isOpen: false,
      images: [],
      initialIndex: 0,
      title: undefined,
    })
  }

  const showTagManager = () => {
    setTagManagerState({
      isOpen: true,
    })
  }

  const closeTagManager = () => {
    setTagManagerState({
      isOpen: false,
    })
  }

  const showTagMerge = (options?: TagMergeOptions) => {
    setTagMergeState({
      isOpen: true,
      initialSourceTags: options?.initialSourceTags || [],
    })
  }

  const closeTagMerge = () => {
    setTagMergeState({
      isOpen: false,
      initialSourceTags: [],
    })
  }

  const contextValue: ModalContextType = {
    showDeleteConfirmation,
    showAddTag,
    showAddBookmark,
    showEditBookmark,
    showCreateCollection,
    showEditCollection,
    showImageModal,
    showTagManager,
    showTagMerge,
    closeModal,
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
          <Dialog.Backdrop
            bg="rgba(0, 0, 0, 0.85)"
            backdropFilter="blur(4px)"
          />
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
                  <Text
                    fontSize="xl"
                    fontWeight="700"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {modalState.options?.title || 'Confirm Delete'}
                  </Text>
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body px={6} py={6}>
                <Text style={{ color: 'var(--color-text-primary)' }} mb={3}>
                  {modalState.options?.message}
                </Text>
                {modalState.options?.preview && (
                  <Box
                    style={{
                      background: 'var(--color-bg-primary)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-tertiary)',
                    }}
                    border="1px solid"
                    borderRadius="8px"
                    p={3}
                    fontSize="sm"
                    maxH="60px"
                    overflow="hidden"
                  >
                    "{modalState.options.preview}"
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
                    _hover={{
                      color: 'var(--color-text-primary)',
                      bg: 'rgba(42, 45, 53, 0.5)',
                    }}
                    onClick={handleDeleteCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ background: 'var(--color-error)' }}
                    color="white"
                    borderRadius="10px"
                    _hover={{ bg: 'var(--color-error-hover)' }}
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
          <Dialog.Backdrop
            bg="rgba(0, 0, 0, 0.85)"
            backdropFilter="blur(4px)"
          />
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
                  <Text
                    fontSize="xl"
                    fontWeight="700"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Add New Tag
                  </Text>
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body px={6} py={6}>
                <Input
                  placeholder={
                    modalState.options?.placeholder || 'Enter tag name...'
                  }
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-primary)',
                  }}
                  border="1px solid var(--color-border)"
                  borderRadius="12px"
                  fontSize="14px"
                  h="44px"
                  _placeholder={{ color: 'var(--color-text-tertiary)' }}
                  _hover={{ borderColor: 'var(--color-border-hover)' }}
                  _focus={{
                    borderColor: 'var(--color-blue)',
                    boxShadow: '0 0 0 2px rgba(29, 78, 216, 0.2)',
                    outline: 'none',
                  }}
                  autoFocus
                />
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
                    _hover={{
                      color: 'var(--color-text-primary)',
                      bg: 'rgba(42, 45, 53, 0.5)',
                    }}
                    onClick={handleAddTagCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ background: 'var(--color-blue)' }}
                    color="white"
                    borderRadius="10px"
                    _hover={{ bg: 'var(--color-blue-hover)' }}
                    disabled={
                      !tagInput.trim() ||
                      modalState.options?.existingTags?.includes(
                        tagInput.trim()
                      )
                    }
                    _disabled={{
                      bg: 'var(--color-border-hover)',
                      color: 'var(--color-text-tertiary)',
                      cursor: 'not-allowed',
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
      {(modalState.type === 'addBookmark' ||
        modalState.type === 'editBookmark') && (
        <Dialog.Root
          open={true}
          onOpenChange={(e) => !e.open && closeModal()}
          placement="center"
        >
          <Dialog.Backdrop
            bg="rgba(0, 0, 0, 0.85)"
            backdropFilter="blur(4px)"
          />
          <Dialog.Positioner>
            <Dialog.Content
              style={{ background: 'var(--color-bg-primary)' }}
              border="1px solid var(--color-border)"
              borderRadius="16px"
              boxShadow="0 25px 50px rgba(0, 0, 0, 0.6)"
              maxW="500px"
              w="500px"
              color="white"
              overflow="hidden"
            >
              <form onSubmit={handleBookmarkSubmit}>
                <Dialog.Header
                  bg="var(--gradient-modal)"
                  borderBottomWidth="1px"
                  style={{ borderColor: 'var(--color-border)' }}
                  p={6}
                >
                  <Dialog.Title>
                    <Text
                      fontSize="xl"
                      fontWeight="700"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {modalState.type === 'editBookmark'
                        ? 'Edit Bookmark'
                        : 'Add New Bookmark'}
                    </Text>
                  </Dialog.Title>
                </Dialog.Header>

                <Dialog.Body px={6} pb={4}>
                  <VStack gap={4} align="stretch">
                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="var(--color-text-secondary)">
                        Title *
                      </Text>
                      <Input
                        value={bookmarkFormData.title}
                        onChange={(e) =>
                          handleBookmarkFormChange('title', e.target.value)
                        }
                        placeholder="Enter bookmark title"
                        required
                        style={{
                          background: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                        border="1px solid var(--color-border-hover)"
                        _hover={{ borderColor: 'var(--color-border-hover)' }}
                        _focus={{
                          borderColor: 'var(--color-blue)',
                          boxShadow: '0 0 0 1px var(--color-blue)',
                        }}
                        _placeholder={{ color: 'var(--color-text-tertiary)' }}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="var(--color-text-secondary)">
                        URL *
                      </Text>
                      <Input
                        type="url"
                        value={bookmarkFormData.url}
                        onChange={(e) =>
                          handleBookmarkFormChange('url', e.target.value)
                        }
                        placeholder="https://example.com"
                        required
                        style={{
                          background: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                        border="1px solid var(--color-border-hover)"
                        _hover={{ borderColor: 'var(--color-border-hover)' }}
                        _focus={{
                          borderColor: 'var(--color-blue)',
                          boxShadow: '0 0 0 1px var(--color-blue)',
                        }}
                        _placeholder={{ color: 'var(--color-text-tertiary)' }}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="var(--color-text-secondary)">
                        Author
                      </Text>
                      <Input
                        value={bookmarkFormData.author}
                        onChange={(e) =>
                          handleBookmarkFormChange('author', e.target.value)
                        }
                        placeholder="Author name"
                        style={{
                          background: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                        border="1px solid var(--color-border-hover)"
                        _hover={{ borderColor: 'var(--color-border-hover)' }}
                        _focus={{
                          borderColor: 'var(--color-blue)',
                          boxShadow: '0 0 0 1px var(--color-blue)',
                        }}
                        _placeholder={{ color: 'var(--color-text-tertiary)' }}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="var(--color-text-secondary)">
                        Content
                      </Text>
                      <Textarea
                        value={bookmarkFormData.content}
                        onChange={(e) =>
                          handleBookmarkFormChange('content', e.target.value)
                        }
                        placeholder="Bookmark description or content preview"
                        rows={3}
                        style={{
                          background: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                        border="1px solid var(--color-border-hover)"
                        _hover={{ borderColor: 'var(--color-border-hover)' }}
                        _focus={{
                          borderColor: 'var(--color-blue)',
                          boxShadow: '0 0 0 1px var(--color-blue)',
                        }}
                        _placeholder={{ color: 'var(--color-text-tertiary)' }}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="var(--color-text-secondary)">
                        Tags
                      </Text>
                      {/* Tag Input without displaying selected tags inside it */}
                      <Box w="100%">
                        <TagInput
                          selectedTags={[]}
                          onTagAdd={addBookmarkTag}
                          onTagRemove={() => {}}
                          placeholder="Add tags..."
                          size="md"
                        />
                      </Box>
                      {/* Display selected tags below the input */}
                      {bookmarkFormData.tags.length > 0 && (
                        <HStack wrap="wrap" gap={2}>
                          <For each={bookmarkFormData.tags}>
                            {(tag) => (
                              <TagChip
                                key={tag}
                                tag={tag}
                                isRemovable={true}
                                variant="editable"
                                size="md"
                                onRemove={removeBookmarkTag}
                              />
                            )}
                          </For>
                        </HStack>
                      )}
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
                      _hover={{
                        color: 'var(--color-text-primary)',
                        bg: 'rgba(42, 45, 53, 0.5)',
                      }}
                      onClick={closeModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      style={{ background: 'var(--color-blue)' }}
                      color="white"
                      borderRadius="10px"
                      _hover={{ bg: 'var(--color-blue-hover)' }}
                      _disabled={{
                        bg: 'var(--color-border-hover)',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'not-allowed',
                      }}
                      type="submit"
                      disabled={
                        !bookmarkFormData.title.trim() ||
                        !bookmarkFormData.url.trim()
                      }
                    >
                      {modalState.type === 'editBookmark'
                        ? 'Approve'
                        : 'Add Bookmark'}
                    </Button>
                  </HStack>
                </Dialog.Footer>
              </form>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )}

      {/* Create/Edit Collection Modal */}
      {(modalState.type === 'createCollection' ||
        modalState.type === 'editCollection') && (
        <Dialog.Root
          open={true}
          onOpenChange={(e) => !e.open && closeModal()}
          placement="center"
        >
          <Dialog.Backdrop
            bg="rgba(0, 0, 0, 0.85)"
            backdropFilter="blur(4px)"
          />
          <Dialog.Positioner>
            <Dialog.Content
              style={{ background: 'var(--color-bg-primary)' }}
              border="1px solid var(--color-border)"
              borderRadius="16px"
              boxShadow="0 25px 50px rgba(0, 0, 0, 0.6)"
              maxW="400px"
              w="400px"
              color="white"
              overflow="hidden"
            >
              <form onSubmit={handleCollectionSubmit}>
                <Dialog.Header
                  bg="var(--gradient-modal)"
                  borderBottomWidth="1px"
                  style={{ borderColor: 'var(--color-border)' }}
                  p={6}
                >
                  <Dialog.Title>
                    <Text
                      fontSize="xl"
                      fontWeight="700"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {modalState.type === 'editCollection'
                        ? 'Edit Collection'
                        : 'Create Collection'}
                    </Text>
                  </Dialog.Title>
                </Dialog.Header>

                <Dialog.Body px={6} py={6}>
                  <VStack gap={4} align="stretch">
                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="var(--color-text-secondary)">
                        Name *
                      </Text>
                      <Input
                        value={collectionFormData.name}
                        onChange={(e) =>
                          handleCollectionFormChange('name', e.target.value)
                        }
                        placeholder="Collection name"
                        required
                        style={{
                          background: 'var(--color-bg-tertiary)',
                          color: 'var(--color-text-primary)',
                        }}
                        border="1px solid var(--color-border)"
                        borderRadius="12px"
                        _hover={{ borderColor: 'var(--color-border-hover)' }}
                        _focus={{
                          borderColor: 'var(--color-blue)',
                          boxShadow: '0 0 0 2px rgba(29, 78, 216, 0.2)',
                        }}
                        _placeholder={{ color: 'var(--color-text-tertiary)' }}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="var(--color-text-secondary)">
                        Description
                      </Text>
                      <Textarea
                        value={collectionFormData.description}
                        onChange={(e) =>
                          handleCollectionFormChange(
                            'description',
                            e.target.value
                          )
                        }
                        placeholder="Collection description (optional)"
                        rows={2}
                        style={{
                          background: 'var(--color-bg-tertiary)',
                          color: 'var(--color-text-primary)',
                        }}
                        border="1px solid var(--color-border)"
                        borderRadius="12px"
                        _hover={{ borderColor: 'var(--color-border-hover)' }}
                        _focus={{
                          borderColor: 'var(--color-blue)',
                          boxShadow: '0 0 0 2px rgba(29, 78, 216, 0.2)',
                        }}
                        _placeholder={{ color: 'var(--color-text-tertiary)' }}
                      />
                    </VStack>

                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" color="var(--color-text-secondary)">
                        Parent Collection
                      </Text>
                      <SelectRoot
                        collection={parentCollectionOptions}
                        value={
                          collectionFormData.parentId
                            ? [collectionFormData.parentId]
                            : ['__none__']
                        }
                        onValueChange={(e) =>
                          handleCollectionFormChange('parentId', e.value[0])
                        }
                        size="md"
                      >
                        <SelectTrigger
                          style={{
                            background: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text-primary)',
                          }}
                          border="1px solid var(--color-border)"
                          borderRadius="12px"
                          _hover={{ borderColor: 'var(--color-border-hover)' }}
                        >
                          <SelectValueText placeholder="None (Root Level)" />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            background: 'var(--color-bg-secondary)',
                            color: 'var(--color-text-primary)',
                          }}
                          border="1px solid var(--color-border)"
                          borderRadius="8px"
                        >
                          {parentCollectionOptions.items.map((item) => (
                            <SelectItem key={item.value} item={item}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                      <Text fontSize="xs" color="var(--color-text-tertiary)">
                        Create a sub-collection by selecting a parent, or leave
                        as root level
                      </Text>
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
                      _hover={{
                        color: 'var(--color-text-primary)',
                        bg: 'rgba(42, 45, 53, 0.5)',
                      }}
                      onClick={closeModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      style={{ background: 'var(--color-blue)' }}
                      color="white"
                      borderRadius="10px"
                      _hover={{ bg: 'var(--color-blue-hover)' }}
                      _disabled={{
                        bg: 'var(--color-border-hover)',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'not-allowed',
                      }}
                      type="submit"
                      disabled={!collectionFormData.name.trim()}
                    >
                      {modalState.type === 'editCollection'
                        ? 'Update Collection'
                        : 'Create Collection'}
                    </Button>
                  </HStack>
                </Dialog.Footer>
              </form>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalState.isOpen}
        onClose={closeImageModal}
        images={imageModalState.images}
        initialIndex={imageModalState.initialIndex}
        title={imageModalState.title}
      />

      {/* Tag Manager Modal */}
      <TagManagerModal
        isOpen={tagManagerState.isOpen}
        onClose={closeTagManager}
      />

      {/* Tag Merge Modal */}
      <TagMergeModal
        isOpen={tagMergeState.isOpen}
        onClose={closeTagMerge}
        initialSourceTags={tagMergeState.initialSourceTags}
      />

      {/* Duplicate Bookmark Dialog */}
      <DuplicateBookmarkDialog />
    </ModalContext.Provider>
  )
}
