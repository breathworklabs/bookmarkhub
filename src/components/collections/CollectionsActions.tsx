import { Box, HStack, Text, Button } from '@chakra-ui/react'
import { LuPencil, LuTrash2, LuFolderPlus } from 'react-icons/lu'
import { useCallback, memo } from 'react'
import { useCollectionsStore } from '../../store/collectionsStore'
import { useModal } from '../modals/ModalProvider'

const CollectionsActions = memo(() => {
  const {
    activeCollectionId,
    collections,
    createCollection,
    deleteCollection,
    updateCollection
  } = useCollectionsStore()
  const { showCreateCollection, showDeleteConfirmation, showEditCollection } = useModal()

  // Get the currently active collection
  const activeCollection = collections.find(c => c.id === activeCollectionId)
  const isUserCollection = activeCollection && !activeCollection.isDefault && !activeCollection.isSmartCollection
  const isSmartCollection = activeCollection && activeCollection.isSmartCollection

  const handleCreateCollection = useCallback(() => {
    showCreateCollection({
      onCreate: async (collectionData) => {
        try {
          await createCollection(collectionData)
        } catch (error) {
          console.error('Failed to create collection:', error)
        }
      }
    })
  }, [showCreateCollection, createCollection])

  const handleEditCollection = useCallback(() => {
    if (!activeCollection || !isUserCollection) return

    showEditCollection({
      collection: activeCollection,
      onEdit: async (id, updatedData) => {
        try {
          await updateCollection(id, updatedData)
        } catch (error) {
          console.error('Failed to update collection:', error)
        }
      }
    })
  }, [showEditCollection, activeCollection, isUserCollection, updateCollection])

  const handleDeleteCollection = useCallback(() => {
    if (!activeCollection || !isUserCollection) return

    showDeleteConfirmation({
      title: 'Delete Collection',
      message: `Are you sure you want to delete "${activeCollection.name}"? This action cannot be undone.`,
      preview: 'All bookmarks in this collection will be moved to "Uncategorized".',
      onConfirm: async () => {
        try {
          await deleteCollection(activeCollection.id)
        } catch (error) {
          console.error('Failed to delete collection:', error)
        }
      }
    })
  }, [showDeleteConfirmation, activeCollection, isUserCollection, deleteCollection])

  return (
    <Box bg="#0f1419" borderBottomWidth="1px" borderColor="#2a2d35" px={6} py={3}>
      <HStack justify="space-between" alignItems="center">
        {/* Custom Breadcrumb */}
        <HStack gap={2} alignItems="center">
          <Text fontSize="sm" color="#71767b">
            Collections
          </Text>
          {activeCollection && (
            <>
              <Text fontSize="sm" color="#71767b">
                /
              </Text>
              <Text fontSize="sm" color="#e1e5e9" fontWeight="500">
                {activeCollection.name}
              </Text>
            </>
          )}
        </HStack>

        {/* Action Buttons */}
        <HStack gap={2} h="40px" alignItems="center">
          {!isSmartCollection && (
            <Button
              size="sm"
              variant="ghost"
              color="#71767b"
              _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
              onClick={handleCreateCollection}
              fontSize="sm"
            >
              <HStack gap={1}>
                <LuFolderPlus size={14} />
                <Text>Create Collection</Text>
              </HStack>
            </Button>
          )}

          {isUserCollection && (
            <>
              <Button
                size="sm"
                variant="ghost"
                color="#71767b"
                _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
                onClick={handleEditCollection}
                fontSize="sm"
              >
                <HStack gap={1}>
                  <LuPencil size={14} />
                  <Text>Edit</Text>
                </HStack>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                color="#ef4444"
                _hover={{ color: '#fca5a5', bg: '#2a2d35' }}
                onClick={handleDeleteCollection}
                fontSize="sm"
              >
                <HStack gap={1}>
                  <LuTrash2 size={14} />
                  <Text>Delete</Text>
                </HStack>
              </Button>
            </>
          )}
        </HStack>
      </HStack>
    </Box>
  )
})

CollectionsActions.displayName = 'CollectionsActions'

export default CollectionsActions