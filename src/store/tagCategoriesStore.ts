import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  TagCategory,
  TagWithCategory,
  DEFAULT_TAG_CATEGORIES,
  getTagCategory,
} from '../types/tags'

interface TagCategoriesState {
  // Categories
  categories: TagCategory[]

  // Tag to category assignments
  tagCategoryMappings: Record<string, string> // tag -> categoryId

  // Actions
  addCategory: (category: Omit<TagCategory, 'id'>) => void
  updateCategory: (id: string, updates: Partial<TagCategory>) => void
  deleteCategory: (id: string) => void
  resetCategories: () => void

  // Tag category management
  assignTagToCategory: (tag: string, categoryId: string) => void
  removeTagFromCategory: (tag: string) => void
  getTagsInCategory: (categoryId: string) => string[]

  // Helper functions
  getCategoryForTag: (tag: string) => TagCategory | undefined
  getTagWithCategory: (
    tag: string,
    count: number,
    lastUsed: Date
  ) => TagWithCategory
}

export const useTagCategoriesStore = create<TagCategoriesState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_TAG_CATEGORIES,
      tagCategoryMappings: {},

      addCategory: (categoryData) => {
        const id = categoryData.name.toLowerCase().replace(/\s+/g, '-')
        const newCategory: TagCategory = {
          ...categoryData,
          id,
        }

        set((state) => ({
          categories: [...state.categories, newCategory],
        }))
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        }))
      },

      deleteCategory: (id) => {
        set((state) => {
          // Remove category assignments for tags assigned to this category
          const updatedMappings = { ...state.tagCategoryMappings }
          Object.keys(updatedMappings).forEach((tag) => {
            if (updatedMappings[tag] === id) {
              delete updatedMappings[tag]
            }
          })

          return {
            categories: state.categories.filter((cat) => cat.id !== id),
            tagCategoryMappings: updatedMappings,
          }
        })
      },

      resetCategories: () => {
        set({
          categories: DEFAULT_TAG_CATEGORIES,
          tagCategoryMappings: {},
        })
      },

      assignTagToCategory: (tag, categoryId) => {
        set((state) => ({
          tagCategoryMappings: {
            ...state.tagCategoryMappings,
            [tag]: categoryId,
          },
        }))
      },

      removeTagFromCategory: (tag) => {
        set((state) => {
          const updatedMappings = { ...state.tagCategoryMappings }
          delete updatedMappings[tag]
          return {
            tagCategoryMappings: updatedMappings,
          }
        })
      },

      getTagsInCategory: (categoryId) => {
        const { tagCategoryMappings } = get()
        return Object.keys(tagCategoryMappings).filter(
          (tag) => tagCategoryMappings[tag] === categoryId
        )
      },

      getCategoryForTag: (tag) => {
        const { categories, tagCategoryMappings } = get()

        // Check if tag has an explicit category assignment
        const assignedCategoryId = tagCategoryMappings[tag]
        if (assignedCategoryId) {
          return categories.find((cat) => cat.id === assignedCategoryId)
        }

        // Check if tag uses hierarchical format (category:tag)
        const hierarchicalCategory = getTagCategory(tag, categories)
        if (hierarchicalCategory) {
          return hierarchicalCategory
        }

        return undefined
      },

      getTagWithCategory: (tag, count, lastUsed) => {
        const { getCategoryForTag } = get()
        const category = getCategoryForTag(tag)

        return {
          name: tag,
          category: category?.id,
          count,
          lastUsed,
        }
      },
    }),
    {
      name: 'tag-categories-storage',
      version: 1,
    }
  )
)
