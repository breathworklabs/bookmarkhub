import { describe, it, expect, beforeEach } from 'vitest'
import { useTagCategoriesStore } from '../store/tagCategoriesStore'
import { DEFAULT_TAG_CATEGORIES } from '../types/tags'

describe('TagCategoriesStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useTagCategoriesStore.getState().resetCategories()
  })

  describe('Category Management', () => {
    it('should initialize with default categories', () => {
      const { categories } = useTagCategoriesStore.getState()
      expect(categories).toEqual(DEFAULT_TAG_CATEGORIES)
    })

    it('should add a new category', () => {
      const { addCategory } = useTagCategoriesStore.getState()

      addCategory({
        name: 'Custom Category',
        description: 'A custom test category',
        color: '#FF5733',
      })

      const updatedCategories = useTagCategoriesStore.getState().categories
      expect(updatedCategories.length).toBe(DEFAULT_TAG_CATEGORIES.length + 1)

      const newCategory = updatedCategories.find(cat => cat.name === 'Custom Category')
      expect(newCategory).toBeDefined()
      expect(newCategory?.id).toBe('custom-category')
      expect(newCategory?.color).toBe('#FF5733')
    })

    it('should update an existing category', () => {
      const { updateCategory, categories } = useTagCategoriesStore.getState()
      const firstCategoryId = categories[0].id

      updateCategory(firstCategoryId, {
        name: 'Updated Name',
        color: '#123456'
      })

      const updatedCategory = useTagCategoriesStore.getState().categories.find(
        cat => cat.id === firstCategoryId
      )
      expect(updatedCategory?.name).toBe('Updated Name')
      expect(updatedCategory?.color).toBe('#123456')
    })

    it('should delete a category and remove associated tag mappings', () => {
      const { addCategory, assignTagToCategory, deleteCategory } = useTagCategoriesStore.getState()

      // Add a custom category
      addCategory({
        name: 'Test Category',
        description: 'Test',
        color: '#000000',
      })

      const categoryId = 'test-category'

      // Assign some tags to it
      assignTagToCategory('tag1', categoryId)
      assignTagToCategory('tag2', categoryId)

      // Verify tags are assigned
      let mappings = useTagCategoriesStore.getState().tagCategoryMappings
      expect(mappings['tag1']).toBe(categoryId)
      expect(mappings['tag2']).toBe(categoryId)

      // Delete the category
      deleteCategory(categoryId)

      // Verify category is deleted
      const categories = useTagCategoriesStore.getState().categories
      expect(categories.find(cat => cat.id === categoryId)).toBeUndefined()

      // Verify tag mappings are removed
      mappings = useTagCategoriesStore.getState().tagCategoryMappings
      expect(mappings['tag1']).toBeUndefined()
      expect(mappings['tag2']).toBeUndefined()
    })

    it('should reset categories to defaults', () => {
      const { addCategory, assignTagToCategory, resetCategories } = useTagCategoriesStore.getState()

      // Make some changes
      addCategory({
        name: 'Custom',
        description: 'Test',
        color: '#000',
      })
      assignTagToCategory('test-tag', 'custom')

      // Reset
      resetCategories()

      const state = useTagCategoriesStore.getState()
      expect(state.categories).toEqual(DEFAULT_TAG_CATEGORIES)
      expect(state.tagCategoryMappings).toEqual({})
    })
  })

  describe('Tag-Category Mapping', () => {
    it('should assign a tag to a category', () => {
      const { assignTagToCategory, categories } = useTagCategoriesStore.getState()
      const categoryId = categories[0].id

      assignTagToCategory('test-tag', categoryId)

      const mappings = useTagCategoriesStore.getState().tagCategoryMappings
      expect(mappings['test-tag']).toBe(categoryId)
    })

    it('should remove a tag from a category', () => {
      const { assignTagToCategory, removeTagFromCategory, categories } = useTagCategoriesStore.getState()
      const categoryId = categories[0].id

      assignTagToCategory('test-tag', categoryId)

      let mappings = useTagCategoriesStore.getState().tagCategoryMappings
      expect(mappings['test-tag']).toBe(categoryId)

      removeTagFromCategory('test-tag')

      mappings = useTagCategoriesStore.getState().tagCategoryMappings
      expect(mappings['test-tag']).toBeUndefined()
    })

    it('should get all tags in a category', () => {
      const { assignTagToCategory, getTagsInCategory, categories } = useTagCategoriesStore.getState()
      const categoryId = categories[0].id

      assignTagToCategory('tag1', categoryId)
      assignTagToCategory('tag2', categoryId)
      assignTagToCategory('tag3', categories[1].id) // Different category

      const tagsInCategory = getTagsInCategory(categoryId)
      expect(tagsInCategory).toHaveLength(2)
      expect(tagsInCategory).toContain('tag1')
      expect(tagsInCategory).toContain('tag2')
      expect(tagsInCategory).not.toContain('tag3')
    })

    it('should reassign a tag to a different category', () => {
      const { assignTagToCategory, categories } = useTagCategoriesStore.getState()
      const category1Id = categories[0].id
      const category2Id = categories[1].id

      // Initially assign to category1
      assignTagToCategory('test-tag', category1Id)
      expect(useTagCategoriesStore.getState().tagCategoryMappings['test-tag']).toBe(category1Id)

      // Reassign to category2
      assignTagToCategory('test-tag', category2Id)
      expect(useTagCategoriesStore.getState().tagCategoryMappings['test-tag']).toBe(category2Id)
    })
  })

  describe('Helper Functions', () => {
    it('should get category for tag with explicit assignment', () => {
      const { assignTagToCategory, getCategoryForTag, categories } = useTagCategoriesStore.getState()
      const categoryId = categories[0].id

      assignTagToCategory('test-tag', categoryId)

      const category = getCategoryForTag('test-tag')
      expect(category).toBeDefined()
      expect(category?.id).toBe(categoryId)
    })

    it('should return undefined for tag without category', () => {
      const { getCategoryForTag } = useTagCategoriesStore.getState()

      const category = getCategoryForTag('unassigned-tag')
      expect(category).toBeUndefined()
    })

    it('should get tag with category information', () => {
      const { assignTagToCategory, getTagWithCategory, categories } = useTagCategoriesStore.getState()
      const categoryId = categories[0].id
      const lastUsed = new Date()

      assignTagToCategory('test-tag', categoryId)

      const tagWithCategory = getTagWithCategory('test-tag', 5, lastUsed)

      expect(tagWithCategory.name).toBe('test-tag')
      expect(tagWithCategory.category).toBe(categoryId)
      expect(tagWithCategory.count).toBe(5)
      expect(tagWithCategory.lastUsed).toBe(lastUsed)
    })

    it('should handle tag without category in getTagWithCategory', () => {
      const { getTagWithCategory } = useTagCategoriesStore.getState()
      const lastUsed = new Date()

      const tagWithCategory = getTagWithCategory('unassigned-tag', 3, lastUsed)

      expect(tagWithCategory.name).toBe('unassigned-tag')
      expect(tagWithCategory.category).toBeUndefined()
      expect(tagWithCategory.count).toBe(3)
      expect(tagWithCategory.lastUsed).toBe(lastUsed)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty category name gracefully', () => {
      const { addCategory } = useTagCategoriesStore.getState()

      addCategory({
        name: '',
        description: 'Empty name category',
        color: '#000000',
      })

      const categories = useTagCategoriesStore.getState().categories
      const emptyCategory = categories.find(cat => cat.name === '')
      expect(emptyCategory).toBeDefined()
      expect(emptyCategory?.id).toBe('') // ID will be empty string
    })

    it('should handle special characters in category name', () => {
      const { addCategory } = useTagCategoriesStore.getState()

      addCategory({
        name: 'Special!@#$%Category',
        description: 'Test',
        color: '#000000',
      })

      const categories = useTagCategoriesStore.getState().categories
      const specialCategory = categories.find(cat => cat.name === 'Special!@#$%Category')
      expect(specialCategory).toBeDefined()
      // ID should be normalized
      expect(specialCategory?.id).toBe('special!@#$%category')
    })

    it('should handle getting tags from non-existent category', () => {
      const { getTagsInCategory } = useTagCategoriesStore.getState()

      const tags = getTagsInCategory('non-existent-category')
      expect(tags).toEqual([])
    })

    it('should handle updating non-existent category', () => {
      const { updateCategory } = useTagCategoriesStore.getState()
      const initialCategories = useTagCategoriesStore.getState().categories

      updateCategory('non-existent-id', { name: 'Updated' })

      const updatedCategories = useTagCategoriesStore.getState().categories
      expect(updatedCategories).toEqual(initialCategories)
    })

    it('should handle deleting non-existent category', () => {
      const { deleteCategory } = useTagCategoriesStore.getState()
      const initialCategories = useTagCategoriesStore.getState().categories

      deleteCategory('non-existent-id')

      const updatedCategories = useTagCategoriesStore.getState().categories
      expect(updatedCategories).toEqual(initialCategories)
    })
  })
})
