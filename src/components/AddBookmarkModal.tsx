import { useState } from 'react'
import { Button, Input, Textarea, VStack, HStack, Text, Badge, Dialog } from '@chakra-ui/react'
import { useBookmarkStore } from '../store/bookmarkStore'
import { sanitizeBookmark } from '../lib/dataValidation'
import type { BookmarkInsert } from '../types/bookmark'

interface AddBookmarkModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddBookmarkModal = ({ isOpen, onClose }: AddBookmarkModalProps) => {
  const addBookmark = useBookmarkStore((state) => state.addBookmark)
  const [isLoading, setIsLoading] = useState(false)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const [formData, setFormData] = useState<BookmarkInsert>({
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
    tags: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.url.trim()) {
      return
    }

    try {
      setIsLoading(true)

      // Extract domain from URL if not provided
      let domain = formData.domain
      if (!domain && formData.url) {
        try {
          const urlObj = new URL(formData.url)
          domain = urlObj.hostname.replace('www.', '')
        } catch {
          domain = 'unknown'
        }
      }

      const bookmarkData: BookmarkInsert = {
        ...formData,
        domain: domain || 'unknown',
        description: formData.description || `Bookmark for ${formData.title}`,
        content: formData.content || `Bookmark for ${formData.title}`,
        author: formData.author || 'Unknown'
      }

      // Validate the bookmark data
      const validatedBookmark = sanitizeBookmark(bookmarkData)
      if (!validatedBookmark) {
        throw new Error('Invalid bookmark data. Please check your inputs.')
      }

      await addBookmark(validatedBookmark)

      // Reset form
      setFormData({
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
        tags: []
      })
      setTagInput('')

      onClose()
    } catch (error) {
      console.error('Failed to add bookmark:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setTagInput('')
      setIsTagDialogOpen(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag()
    }
  }

  const openTagDialog = () => setIsTagDialogOpen(true)
  const closeTagDialog = () => {
    setIsTagDialogOpen(false)
    setTagInput('')
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="center">
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
        <form onSubmit={handleSubmit}>
          <Dialog.Header
            color="#e1e5e9"
            fontSize="18px"
            fontWeight="600"
            pb={3}
            pt={6}
            px={6}
          >
            <Dialog.Title>Add New Bookmark</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body px={6} pb={4}>
            <VStack gap={4} align="stretch">
              <VStack gap={2} align="stretch">
                <Text fontSize="sm" color="#9ca3af">Title *</Text>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
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
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
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
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
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
                {formData.tags.length > 0 && (
                  <HStack wrap="wrap" gap={2}>
                    {formData.tags.map(tag => (
                      <Badge
                        key={tag}
                        bg="#2a2d35"
                        color="#e1e5e9"
                        px={3}
                        py={1}
                        borderRadius="full"
                        cursor="pointer"
                        _hover={{ bg: '#3a3d45' }}
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </HStack>
                )}
                <Button
                  type="button"
                  onClick={openTagDialog}
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
                onClick={onClose}
                disabled={isLoading}
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
                disabled={isLoading || !formData.title.trim() || !formData.url.trim()}
              >
                {isLoading ? 'Adding...' : 'Add Bookmark'}
              </Button>
            </HStack>
          </Dialog.Footer>
        </form>

        <AddTagDialog
          isOpen={isTagDialogOpen}
          onClose={closeTagDialog}
          onAddTag={handleAddTag}
          tagInput={tagInput}
          setTagInput={setTagInput}
          onKeyPress={handleTagKeyPress}
        />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

const AddTagDialog = ({ isOpen, onClose, onAddTag, tagInput, setTagInput, onKeyPress }: {
  isOpen: boolean
  onClose: () => void
  onAddTag: () => void
  tagInput: string
  setTagInput: (value: string) => void
  onKeyPress: (e: React.KeyboardEvent) => void
}) => (
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
          <Dialog.Title>Add Tag</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body px={6} pb={4}>
          <Input
            placeholder="Enter tag name..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={onKeyPress}
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
              onClick={onAddTag}
              disabled={!tagInput.trim()}
            >
              Add Tag
            </Button>
          </HStack>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Positioner>
  </Dialog.Root>
)

export default AddBookmarkModal