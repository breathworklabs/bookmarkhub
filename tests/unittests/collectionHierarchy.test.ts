/**
 * Unit tests for Collection Hierarchy Utilities
 */

import { describe, it, expect } from 'vitest'
import type { Collection } from '../../src/types/collections'
import {
  buildCollectionTree,
  flattenCollectionTree,
  getCollectionDepth,
  getTotalDepth,
  isDescendantOf,
  getAncestorIds,
  getCollectionPath,
  getCollectionPathString,
  getChildCollections,
  getAllDescendants,
  sortCollectionsByHierarchy,
  wouldCreateCircularReference,
  validateParentAssignment,
  getHiddenChildrenCount,
  hasDeepNesting,
  getRootCollections,
  findCollectionByPath,
} from '../../src/utils/collectionHierarchy'

// Mock collections for testing
const mockCollections: Collection[] = [
  {
    id: 'work',
    name: 'Work',
    parentId: null,
    description: '',
    color: '#3b82f6',
    icon: 'folder',
    isPrivate: false,
    isDefault: false,
    isSmartCollection: false,
    userId: 'test-user',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    bookmarkCount: 0,
  },
  {
    id: 'projects',
    name: 'Projects',
    parentId: 'work',
    description: '',
    color: '#3b82f6',
    icon: 'folder',
    isPrivate: false,
    isDefault: false,
    isSmartCollection: false,
    userId: 'test-user',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    bookmarkCount: 0,
  },
  {
    id: '2024',
    name: '2024',
    parentId: 'projects',
    description: '',
    color: '#3b82f6',
    icon: 'folder',
    isPrivate: false,
    isDefault: false,
    isSmartCollection: false,
    userId: 'test-user',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    bookmarkCount: 0,
  },
  {
    id: 'q1',
    name: 'Q1',
    parentId: '2024',
    description: '',
    color: '#3b82f6',
    icon: 'folder',
    isPrivate: false,
    isDefault: false,
    isSmartCollection: false,
    userId: 'test-user',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    bookmarkCount: 0,
  },
  {
    id: 'personal',
    name: 'Personal',
    parentId: null,
    description: '',
    color: '#3b82f6',
    icon: 'folder',
    isPrivate: false,
    isDefault: false,
    isSmartCollection: false,
    userId: 'test-user',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    bookmarkCount: 0,
  },
  {
    id: 'starred',
    name: 'Starred',
    parentId: null,
    description: '',
    color: '#ffd700',
    icon: 'star',
    isPrivate: false,
    isDefault: true,
    isSmartCollection: true,
    userId: 'test-user',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    bookmarkCount: 0,
  },
]

describe('Collection Hierarchy Utilities', () => {
  describe('buildCollectionTree', () => {
    it('should build a tree from flat collection array', () => {
      const tree = buildCollectionTree(mockCollections, null, 0, [])

      // Should have 3 root collections (work, personal, starred)
      expect(tree.length).toBe(3)

      // Work should be in the tree
      const workNode = tree.find((node) => node.collection.id === 'work')
      expect(workNode).toBeDefined()
      expect(workNode?.depth).toBe(0)
    })

    it('should respect expanded state', () => {
      const tree = buildCollectionTree(mockCollections, null, 0, ['work'])

      const workNode = tree.find((node) => node.collection.id === 'work')
      expect(workNode?.isExpanded).toBe(true)
      expect(workNode?.children.length).toBe(1) // Should have Projects child
    })

    it('should not load children if not expanded', () => {
      const tree = buildCollectionTree(mockCollections, null, 0, [])

      const workNode = tree.find((node) => node.collection.id === 'work')
      expect(workNode?.children.length).toBe(0) // Not expanded, no children loaded
    })
  })

  describe('flattenCollectionTree', () => {
    it('should flatten a tree structure back to array', () => {
      const tree = buildCollectionTree(mockCollections, null, 0, [
        'work',
        'projects',
        '2024',
      ])
      const flattened = flattenCollectionTree(tree)

      expect(flattened.length).toBeGreaterThan(0)
      expect(flattened.some((c) => c.id === 'work')).toBe(true)
    })
  })

  describe('getCollectionDepth', () => {
    it('should return 0 for root collections', () => {
      expect(getCollectionDepth('work', mockCollections)).toBe(0)
      expect(getCollectionDepth('personal', mockCollections)).toBe(0)
    })

    it('should return correct depth for nested collections', () => {
      expect(getCollectionDepth('projects', mockCollections)).toBe(1)
      expect(getCollectionDepth('2024', mockCollections)).toBe(2)
      expect(getCollectionDepth('q1', mockCollections)).toBe(3)
    })

    it('should return 0 for non-existent collection', () => {
      expect(getCollectionDepth('nonexistent', mockCollections)).toBe(0)
    })
  })

  describe('getTotalDepth', () => {
    it('should return 1 for leaf nodes', () => {
      const q1 = mockCollections.find((c) => c.id === 'q1')!
      expect(getTotalDepth(q1, mockCollections)).toBe(1)

      const personal = mockCollections.find((c) => c.id === 'personal')!
      expect(getTotalDepth(personal, mockCollections)).toBe(1)
    })

    it('should return correct total depth for parent nodes', () => {
      const work = mockCollections.find((c) => c.id === 'work')!
      expect(getTotalDepth(work, mockCollections)).toBe(4) // work -> projects -> 2024 -> q1

      const projects = mockCollections.find((c) => c.id === 'projects')!
      expect(getTotalDepth(projects, mockCollections)).toBe(3) // projects -> 2024 -> q1
    })
  })

  describe('isDescendantOf', () => {
    it('should return true for direct children', () => {
      expect(isDescendantOf('projects', 'work', mockCollections)).toBe(true)
    })

    it('should return true for nested descendants', () => {
      expect(isDescendantOf('q1', 'work', mockCollections)).toBe(true)
      expect(isDescendantOf('2024', 'work', mockCollections)).toBe(true)
    })

    it('should return false for non-descendants', () => {
      expect(isDescendantOf('work', 'projects', mockCollections)).toBe(false)
      expect(isDescendantOf('personal', 'work', mockCollections)).toBe(false)
    })

    it('should return false for self', () => {
      expect(isDescendantOf('work', 'work', mockCollections)).toBe(false)
    })
  })

  describe('getAncestorIds', () => {
    it('should return empty array for root collections', () => {
      expect(getAncestorIds('work', mockCollections)).toEqual([])
    })

    it('should return correct ancestor chain', () => {
      const ancestors = getAncestorIds('q1', mockCollections)
      expect(ancestors).toEqual(['2024', 'projects', 'work'])
    })

    it('should return immediate parent only for depth-1 collections', () => {
      const ancestors = getAncestorIds('projects', mockCollections)
      expect(ancestors).toEqual(['work'])
    })
  })

  describe('getCollectionPath', () => {
    it('should return path from root to collection', () => {
      const path = getCollectionPath('q1', mockCollections)
      expect(path.length).toBe(4)
      expect(path[0].id).toBe('work')
      expect(path[1].id).toBe('projects')
      expect(path[2].id).toBe('2024')
      expect(path[3].id).toBe('q1')
    })

    it('should return single item for root collection', () => {
      const path = getCollectionPath('work', mockCollections)
      expect(path.length).toBe(1)
      expect(path[0].id).toBe('work')
    })

    it('should return empty array for non-existent collection', () => {
      const path = getCollectionPath('nonexistent', mockCollections)
      expect(path).toEqual([])
    })
  })

  describe('getCollectionPathString', () => {
    it('should return formatted path string', () => {
      const pathString = getCollectionPathString('q1', mockCollections, ' → ')
      expect(pathString).toBe('Work → Projects → 2024 → Q1')
    })

    it('should use custom separator', () => {
      const pathString = getCollectionPathString('q1', mockCollections, ' / ')
      expect(pathString).toBe('Work / Projects / 2024 / Q1')
    })

    it('should return single name for root collection', () => {
      const pathString = getCollectionPathString('work', mockCollections)
      expect(pathString).toBe('Work')
    })
  })

  describe('getChildCollections', () => {
    it('should return direct children only', () => {
      const children = getChildCollections('work', mockCollections)
      expect(children.length).toBe(1)
      expect(children[0].id).toBe('projects')
    })

    it('should return empty array for leaf nodes', () => {
      const children = getChildCollections('q1', mockCollections)
      expect(children).toEqual([])
    })
  })

  describe('getAllDescendants', () => {
    it('should return all nested descendants', () => {
      const descendants = getAllDescendants('work', mockCollections)
      expect(descendants.length).toBe(3) // projects, 2024, q1

      const ids = descendants.map((d) => d.id)
      expect(ids).toContain('projects')
      expect(ids).toContain('2024')
      expect(ids).toContain('q1')
    })

    it('should return empty array for leaf nodes', () => {
      const descendants = getAllDescendants('personal', mockCollections)
      expect(descendants).toEqual([])
    })
  })

  describe('sortCollectionsByHierarchy', () => {
    it('should sort with parents before children', () => {
      const unsorted = [...mockCollections].reverse()
      const sorted = sortCollectionsByHierarchy(unsorted)

      const workIndex = sorted.findIndex((c) => c.id === 'work')
      const projectsIndex = sorted.findIndex((c) => c.id === 'projects')
      const q1Index = sorted.findIndex((c) => c.id === 'q1')

      expect(workIndex).toBeLessThan(projectsIndex)
      expect(projectsIndex).toBeLessThan(q1Index)
    })
  })

  describe('wouldCreateCircularReference', () => {
    it('should detect self-reference', () => {
      expect(
        wouldCreateCircularReference('work', 'work', mockCollections)
      ).toBe(true)
    })

    it('should detect circular reference (parent as child)', () => {
      expect(
        wouldCreateCircularReference('work', 'projects', mockCollections)
      ).toBe(true)
      expect(wouldCreateCircularReference('work', 'q1', mockCollections)).toBe(
        true
      )
    })

    it('should allow valid parent assignments', () => {
      expect(
        wouldCreateCircularReference('personal', 'work', mockCollections)
      ).toBe(false)
      expect(
        wouldCreateCircularReference('q1', 'personal', mockCollections)
      ).toBe(false)
    })
  })

  describe('validateParentAssignment', () => {
    it('should allow null parent', () => {
      const result = validateParentAssignment('projects', null, mockCollections)
      expect(result.valid).toBe(true)
    })

    it('should reject non-existent parent', () => {
      const result = validateParentAssignment(
        'projects',
        'nonexistent',
        mockCollections
      )
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('should reject circular reference', () => {
      const result = validateParentAssignment(
        'work',
        'projects',
        mockCollections
      )
      expect(result.valid).toBe(false)
      expect(result.error).toContain('circular')
    })

    it('should reject smart collection as parent', () => {
      const result = validateParentAssignment(
        'personal',
        'starred',
        mockCollections
      )
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Smart collections')
    })

    it('should reject smart collection being nested', () => {
      const result = validateParentAssignment(
        'starred',
        'work',
        mockCollections
      )
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Smart collections')
    })

    it('should reject exceeding max depth', () => {
      // Try to add another level to q1 (which is already at depth 3)
      // With maxDepth=3, this should fail
      const result = validateParentAssignment(
        'new-collection',
        'q1',
        mockCollections,
        3
      )
      expect(result.valid).toBe(false)
      expect(result.error).toContain('maximum nesting depth')
    })

    it('should allow valid parent assignment', () => {
      const result = validateParentAssignment(
        'new-collection',
        'work',
        mockCollections
      )
      expect(result.valid).toBe(true)
    })
  })

  describe('getHiddenChildrenCount', () => {
    it('should return 0 when below max depth', () => {
      const work = mockCollections.find((c) => c.id === 'work')!
      const count = getHiddenChildrenCount(work, 0, 2, mockCollections)
      expect(count).toBe(0) // At depth 0, not at max yet
    })

    it('should return count of all descendants when at max depth', () => {
      const projects = mockCollections.find((c) => c.id === 'projects')!
      const count = getHiddenChildrenCount(projects, 2, 2, mockCollections)
      expect(count).toBe(2) // 2024 and q1 are hidden
    })

    it('should return 0 when maxDepth is undefined', () => {
      const work = mockCollections.find((c) => c.id === 'work')!
      const count = getHiddenChildrenCount(work, 3, undefined, mockCollections)
      expect(count).toBe(0)
    })
  })

  describe('hasDeepNesting', () => {
    it('should return true for collections with deep subtrees', () => {
      const work = mockCollections.find((c) => c.id === 'work')!
      expect(hasDeepNesting(work, 3, mockCollections)).toBe(true) // Has 4 levels
    })

    it('should return false for shallow collections', () => {
      const personal = mockCollections.find((c) => c.id === 'personal')!
      expect(hasDeepNesting(personal, 3, mockCollections)).toBe(false)
    })

    it('should handle exact depth match', () => {
      const projects = mockCollections.find((c) => c.id === 'projects')!
      expect(hasDeepNesting(projects, 3, mockCollections)).toBe(true) // Exactly 3
    })
  })

  describe('getRootCollections', () => {
    it('should return only collections with no parent', () => {
      const roots = getRootCollections(mockCollections)
      expect(roots.length).toBe(3) // work, personal, starred

      const ids = roots.map((c) => c.id)
      expect(ids).toContain('work')
      expect(ids).toContain('personal')
      expect(ids).toContain('starred')
      expect(ids).not.toContain('projects')
    })
  })

  describe('findCollectionByPath', () => {
    it('should find collection by path string', () => {
      const collection = findCollectionByPath(
        'Work/Projects/2024',
        mockCollections
      )
      expect(collection?.id).toBe('2024')
    })

    it('should handle custom separator', () => {
      const collection = findCollectionByPath(
        'Work → Projects → 2024',
        mockCollections,
        ' → '
      )
      expect(collection?.id).toBe('2024')
    })

    it('should return null for non-existent path', () => {
      const collection = findCollectionByPath(
        'Work/Nonexistent',
        mockCollections
      )
      expect(collection).toBeNull()
    })

    it('should find root collection by single name', () => {
      const collection = findCollectionByPath('Work', mockCollections)
      expect(collection?.id).toBe('work')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty collections array', () => {
      expect(getRootCollections([])).toEqual([])
      expect(getCollectionDepth('test', [])).toBe(0)
      expect(getAllDescendants('test', [])).toEqual([])
    })

    it('should handle circular reference in data (safety)', () => {
      // Create a circular reference (should be prevented by validation, but test safety)
      const circularCollections: Collection[] = [
        {
          ...mockCollections[0],
          id: 'a',
          parentId: 'b',
        },
        {
          ...mockCollections[1],
          id: 'b',
          parentId: 'a',
        },
      ]

      // Functions should not crash or infinite loop
      expect(() => getCollectionDepth('a', circularCollections)).not.toThrow()
      expect(() => isDescendantOf('a', 'b', circularCollections)).not.toThrow()
    })

    it('should handle orphaned collections (parent does not exist)', () => {
      const orphanedCollection: Collection = {
        ...mockCollections[0],
        id: 'orphan',
        parentId: 'nonexistent-parent',
      }

      const collections = [...mockCollections, orphanedCollection]

      // Should handle gracefully
      const depth = getCollectionDepth('orphan', collections)
      expect(depth).toBeGreaterThanOrEqual(0)
    })
  })
})
