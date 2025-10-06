import { Box, VStack, HStack, Text, Button, Input, For, Badge, IconButton, Wrap, WrapItem } from '@chakra-ui/react'
import { LuPlus, LuPencil, LuTrash2, LuCheck, LuX, LuTag } from 'react-icons/lu'
import { useState, useCallback, memo } from 'react'
import { useTagCategoriesStore } from '../../store/tagCategoriesStore'
import { useBookmarkStore } from '../../store/bookmarkStore'
import { TagCategory } from '../../types/tags'
import TagChip from './TagChip'

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
    getTagsInCategory,
    assignTagToCategory,
    removeTagFromCategory
  } = useTagCategoriesStore()

  const bookmarks = useBookmarkStore((state) => state.bookmarks)

  const [isCreating, setIsCreating] = useState(false)
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null)
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3b82f6', description: '' })
  const [managingTagsFor, setManagingTagsFor] = useState<string | null>(null)

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

  // Get all unique tags from bookmarks
  const allTags = useCallback(() => {
    const tags = new Set<string>()
    bookmarks.forEach(bookmark => {
      bookmark.tags?.forEach(tag => {
        if (tag && typeof tag === 'string') {
          tags.add(tag)
        }
      })
    })
    return Array.from(tags).sort()
  }, [bookmarks])

  const handleToggleTagAssignment = useCallback((tag: string, categoryId: string) => {
    const categoryTags = getTagsInCategory(categoryId)
    if (categoryTags.includes(tag)) {
      removeTagFromCategory(tag)
    } else {
      assignTagToCategory(tag, categoryId)
    }
  }, [assignTagToCategory, removeTagFromCategory, getTagsInCategory])

  const getUnassignedTags = useCallback((categoryId: string) => {
    const categoryTags = getTagsInCategory(categoryId)
    return allTags().filter(tag => !categoryTags.includes(tag))
  }, [allTags, getTagsInCategory])

  return (
    <VStack align="stretch" gap={4}>
      {/* Header */}
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="600" color="var(--color-text-primary)">
          Tag Categories
        </Text>
        <HStack gap={2}>
          {!isCreating && (
            <Button
              size="sm"
              variant="outline"
              bg="transparent"
              border="1px solid var(--color-border)"
              color="var(--color-text-tertiary)"
              _hover={{ bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border-hover)' }}
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
            color="var(--color-text-tertiary)"
            _hover={{ color: 'var(--color-text-primary)', bg: 'var(--color-border)' }}
            onClick={handleResetCategories}
          >
            Reset to Defaults
          </Button>
        </HStack>
      </HStack>

      {/* Create new category form */}
      {isCreating && (
        <Box p={3} bg="var(--color-bg-tertiary)" border="1px solid var(--color-border)" borderRadius="8px">
          <VStack align="stretch" gap={3}>
            <HStack gap={2}>
              <Input
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                bg="var(--color-bg-primary)"
                border="1px solid var(--color-border)"
                color="var(--color-text-primary)"
                _placeholder={{ color: 'var(--color-text-tertiary)' }}
                size="sm"
                flex={1}
              />
              <HStack gap={1}>
                <Text fontSize="sm" color="var(--color-text-tertiary)">Color:</Text>
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
              bg="var(--color-bg-primary)"
              border="1px solid var(--color-border)"
              color="var(--color-text-primary)"
              _placeholder={{ color: 'var(--color-text-tertiary)' }}
              size="sm"
            />
            <HStack gap={2}>
              <Button
                size="sm"
                bg="var(--color-accent)"
                color="white"
                _hover={{ bg: 'var(--color-success)' }}
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
                color="var(--color-text-tertiary)"
                _hover={{ color: 'var(--color-text-primary)', bg: 'var(--color-border)' }}
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
                bg="var(--color-bg-tertiary)"
                border="1px solid var(--color-border)"
                borderRadius="8px"
                _hover={{ borderColor: 'var(--color-border-hover)' }}
              >
                {isEditing ? (
                  <VStack align="stretch" gap={3}>
                    <HStack gap={2}>
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                        bg="var(--color-bg-primary)"
                        border="1px solid var(--color-border)"
                        color="var(--color-text-primary)"
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
                      bg="var(--color-bg-primary)"
                      border="1px solid var(--color-border)"
                      color="var(--color-text-primary)"
                      _placeholder={{ color: 'var(--color-text-tertiary)' }}
                      size="sm"
                    />
                    <HStack gap={2}>
                      <Button
                        size="sm"
                        bg="var(--color-accent)"
                        color="white"
                        _hover={{ bg: 'var(--color-success)' }}
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
                        color="var(--color-text-tertiary)"
                        _hover={{ color: 'var(--color-text-primary)', bg: 'var(--color-border)' }}
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
                          <Text fontSize="sm" fontWeight="500" color="var(--color-text-primary)">
                            {category.name}
                          </Text>
                          <Badge
                            bg="var(--color-border)"
                            color="var(--color-text-secondary)"
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            borderRadius="4px"
                          >
                            {tagCount} tag{tagCount !== 1 ? 's' : ''}
                          </Badge>
                        </HStack>
                        {category.description && (
                          <Text fontSize="xs" color="var(--color-text-tertiary)">
                            {category.description}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                    <HStack gap={1}>
                      <Button
                        size="sm"
                        variant="outline"
                        bg="transparent"
                        border="1px solid var(--color-border)"
                        color="var(--color-text-tertiary)"
                        _hover={{ bg: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border-hover)' }}
                        onClick={() => setManagingTagsFor(managingTagsFor === category.id ? null : category.id)}
                      >
                        <HStack gap={1}>
                          <LuTag size={12} />
                          <Text fontSize="xs">Manage Tags</Text>
                        </HStack>
                      </Button>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label="Edit category"
                        color="var(--color-text-tertiary)"
                        _hover={{ color: 'var(--color-text-primary)', bg: 'var(--color-border)' }}
                        onClick={() => handleStartEdit(category)}
                      >
                        <LuPencil size={14} />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label="Delete category"
                        color="var(--color-error)"
                        _hover={{ color: '#fca5a5', bg: 'var(--color-border)' }}
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <LuTrash2 size={14} />
                      </IconButton>
                    </HStack>
                  </HStack>
                )}

                {/* Tag Assignment Section */}
                {managingTagsFor === category.id && (
                  <VStack align="stretch" gap={3} mt={3} pt={3} borderTop="1px solid #2a2d35">
                    <Text fontSize="sm" fontWeight="500" color="var(--color-text-primary)">
                      Assign Tags to Category
                    </Text>

                    {/* Assigned Tags */}
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="xs" color="var(--color-text-tertiary)" fontWeight="500">ASSIGNED TAGS</Text>
                      <Wrap>
                        <For each={getTagsInCategory(category.id)}>
                          {(tag) => (
                            <WrapItem key={tag}>
                              <TagChip
                                tag={tag}
                                isActive={true}
                                isRemovable={true}
                                variant="editable"
                                size="sm"
                                onRemove={() => handleToggleTagAssignment(tag, category.id)}
                              />
                            </WrapItem>
                          )}
                        </For>
                        {getTagsInCategory(category.id).length === 0 && (
                          <Text fontSize="xs" color="var(--color-text-tertiary)" fontStyle="italic">
                            No tags assigned to this category
                          </Text>
                        )}
                      </Wrap>
                    </VStack>

                    {/* Available Tags */}
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="xs" color="var(--color-text-tertiary)" fontWeight="500">AVAILABLE TAGS</Text>
                      <Wrap>
                        <For each={getUnassignedTags(category.id)}>
                          {(tag) => (
                            <WrapItem key={tag}>
                              <TagChip
                                tag={tag}
                                isActive={false}
                                isRemovable={false}
                                variant="default"
                                size="sm"
                                onClick={() => handleToggleTagAssignment(tag, category.id)}
                              />
                            </WrapItem>
                          )}
                        </For>
                        {getUnassignedTags(category.id).length === 0 && (
                          <Text fontSize="xs" color="var(--color-text-tertiary)" fontStyle="italic">
                            All tags are assigned to categories
                          </Text>
                        )}
                      </Wrap>
                    </VStack>
                  </VStack>
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
          color="var(--color-text-tertiary)"
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