import { Box, VStack, HStack, Text, Button, Input, For, Badge, IconButton } from '@chakra-ui/react'
import { LuPlus, LuPencil, LuTrash2, LuCheck, LuX } from 'react-icons/lu'
import { useState, useCallback, memo } from 'react'
import { useTagCategoriesStore } from '../../store/tagCategoriesStore'
import { TagCategory } from '../../types/tags'

interface EditingCategory {
  id: string
  name: string
  color: string
  description?: string
}

const TagCategoriesManager = memo(() => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    resetCategories,
    getTagsInCategory
  } = useTagCategoriesStore()

  const [isCreating, setIsCreating] = useState(false)
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null)
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3b82f6', description: '' })

  // Available colors for categories
  const availableColors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ef4444', // Red
    '#ec4899', // Pink
    '#6b7280', // Gray
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#84cc16'  // Lime
  ]

  const handleCreateCategory = useCallback(() => {
    if (newCategory.name.trim()) {
      addCategory({
        name: newCategory.name.trim(),
        color: newCategory.color,
        description: newCategory.description.trim() || undefined
      })
      setNewCategory({ name: '', color: '#3b82f6', description: '' })
      setIsCreating(false)
    }
  }, [newCategory, addCategory])

  const handleStartEdit = useCallback((category: TagCategory) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      color: category.color,
      description: category.description || ''
    })
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (editingCategory && editingCategory.name.trim()) {
      updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        color: editingCategory.color,
        description: editingCategory.description?.trim() || undefined
      })
      setEditingCategory(null)
    }
  }, [editingCategory, updateCategory])

  const handleCancelEdit = useCallback(() => {
    setEditingCategory(null)
  }, [])

  const handleDeleteCategory = useCallback((categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? Tags assigned to this category will become uncategorized.')) {
      deleteCategory(categoryId)
    }
  }, [deleteCategory])

  const handleResetCategories = useCallback(() => {
    if (confirm('Are you sure you want to reset all categories to defaults? This will remove any custom categories and assignments.')) {
      resetCategories()
    }
  }, [resetCategories])

  return (
    <VStack align="stretch" gap={4}>
      {/* Header */}
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="600" color="#e1e5e9">
          Tag Categories
        </Text>
        <HStack gap={2}>
          {!isCreating && (
            <Button
              size="sm"
              variant="outline"
              bg="transparent"
              border="1px solid #2a2d35"
              color="#71767b"
              _hover={{ bg: '#1a1d23', color: '#e1e5e9', borderColor: '#3a3d45' }}
              onClick={() => setIsCreating(true)}
            >
              <HStack gap={1}>
                <LuPlus size={14} />
                <Text>Add Category</Text>
              </HStack>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            color="#71767b"
            _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
            onClick={handleResetCategories}
          >
            Reset to Defaults
          </Button>
        </HStack>
      </HStack>

      {/* Create new category form */}
      {isCreating && (
        <Box p={3} bg="#1a1d23" border="1px solid #2a2d35" borderRadius="8px">
          <VStack align="stretch" gap={3}>
            <HStack gap={2}>
              <Input
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                bg="#0f1419"
                border="1px solid #2a2d35"
                color="#e1e5e9"
                _placeholder={{ color: '#71767b' }}
                size="sm"
                flex={1}
              />
              <HStack gap={1}>
                <Text fontSize="sm" color="#71767b">Color:</Text>
                <For each={availableColors.slice(0, 5)}>
                  {(color) => (
                    <Box
                      key={color}
                      w="20px"
                      h="20px"
                      bg={color}
                      borderRadius="4px"
                      cursor="pointer"
                      border={newCategory.color === color ? '2px solid white' : '1px solid #2a2d35'}
                      onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                    />
                  )}
                </For>
              </HStack>
            </HStack>
            <Input
              placeholder="Description (optional)"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              bg="#0f1419"
              border="1px solid #2a2d35"
              color="#e1e5e9"
              _placeholder={{ color: '#71767b' }}
              size="sm"
            />
            <HStack gap={2}>
              <Button
                size="sm"
                bg="#10b981"
                color="white"
                _hover={{ bg: '#059669' }}
                onClick={handleCreateCategory}
                disabled={!newCategory.name.trim()}
              >
                <HStack gap={1}>
                  <LuCheck size={14} />
                  <Text>Create</Text>
                </HStack>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                color="#71767b"
                _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
                onClick={() => {
                  setIsCreating(false)
                  setNewCategory({ name: '', color: '#3b82f6', description: '' })
                }}
              >
                <HStack gap={1}>
                  <LuX size={14} />
                  <Text>Cancel</Text>
                </HStack>
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Categories list */}
      <VStack align="stretch" gap={2}>
        <For each={categories}>
          {(category) => {
            const tagCount = getTagsInCategory(category.id).length
            const isEditing = editingCategory?.id === category.id

            return (
              <Box
                key={category.id}
                p={3}
                bg="#1a1d23"
                border="1px solid #2a2d35"
                borderRadius="8px"
                _hover={{ borderColor: '#3a3d45' }}
              >
                {isEditing ? (
                  <VStack align="stretch" gap={3}>
                    <HStack gap={2}>
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                        bg="#0f1419"
                        border="1px solid #2a2d35"
                        color="#e1e5e9"
                        size="sm"
                        flex={1}
                      />
                      <HStack gap={1}>
                        <For each={availableColors.slice(0, 5)}>
                          {(color) => (
                            <Box
                              key={color}
                              w="20px"
                              h="20px"
                              bg={color}
                              borderRadius="4px"
                              cursor="pointer"
                              border={editingCategory.color === color ? '2px solid white' : '1px solid #2a2d35'}
                              onClick={() => setEditingCategory(prev => prev ? ({ ...prev, color }) : null)}
                            />
                          )}
                        </For>
                      </HStack>
                    </HStack>
                    <Input
                      placeholder="Description (optional)"
                      value={editingCategory.description}
                      onChange={(e) => setEditingCategory(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                      bg="#0f1419"
                      border="1px solid #2a2d35"
                      color="#e1e5e9"
                      _placeholder={{ color: '#71767b' }}
                      size="sm"
                    />
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        bg="#10b981"
                        color="white"
                        _hover={{ bg: '#059669' }}
                        onClick={handleSaveEdit}
                        disabled={!editingCategory.name.trim()}
                      >
                        <HStack gap={1}>
                          <LuCheck size={14} />
                          <Text>Save</Text>
                        </HStack>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        color="#71767b"
                        _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
                        onClick={handleCancelEdit}
                      >
                        <HStack gap={1}>
                          <LuX size={14} />
                          <Text>Cancel</Text>
                        </HStack>
                      </Button>
                    </HStack>
                  </VStack>
                ) : (
                  <HStack justify="space-between" align="center">
                    <HStack gap={3} align="flex-start">
                      <Box
                        w="16px"
                        h="16px"
                        bg={category.color}
                        borderRadius="4px"
                        flexShrink={0}
                        mt="2px"
                      />
                      <VStack align="flex-start" gap={1} flex={1}>
                        <HStack gap={2} align="center">
                          <Text fontSize="sm" fontWeight="500" color="#e1e5e9">
                            {category.name}
                          </Text>
                          <Badge
                            bg="#2a2d35"
                            color="#9ca3af"
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            borderRadius="4px"
                          >
                            {tagCount} tag{tagCount !== 1 ? 's' : ''}
                          </Badge>
                        </HStack>
                        {category.description && (
                          <Text fontSize="xs" color="#71767b">
                            {category.description}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                    <HStack gap={1}>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label="Edit category"
                        color="#71767b"
                        _hover={{ color: '#e1e5e9', bg: '#2a2d35' }}
                        onClick={() => handleStartEdit(category)}
                      >
                        <LuPencil size={14} />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label="Delete category"
                        color="#ef4444"
                        _hover={{ color: '#fca5a5', bg: '#2a2d35' }}
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <LuTrash2 size={14} />
                      </IconButton>
                    </HStack>
                  </HStack>
                )}
              </Box>
            )
          }}
        </For>
      </VStack>

      {categories.length === 0 && (
        <Box
          p={6}
          textAlign="center"
          color="#71767b"
          border="1px dashed #2a2d35"
          borderRadius="8px"
        >
          <Text fontSize="sm">No categories defined</Text>
          <Text fontSize="xs" mt={1}>
            Create categories to organize your tags by theme or purpose
          </Text>
        </Box>
      )}
    </VStack>
  )
})

TagCategoriesManager.displayName = 'TagCategoriesManager'

export default TagCategoriesManager