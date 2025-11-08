/**
 * Collection Hierarchy Utilities
 *
 * Utility functions for managing nested collection structures,
 * tree traversal, validation, and hierarchy calculations.
 */

import type { Collection } from '../types/collections'

export interface CollectionTreeNode {
  collection: Collection
  children: CollectionTreeNode[]
  depth: number
  hasChildren: boolean
  isExpanded: boolean
}

/**
 * Build a tree structure from flat collection array
 */
export function buildCollectionTree(
  collections: Collection[],
  parentId: string | null = null,
  depth: number = 0,
  expandedIds: string[] = []
): CollectionTreeNode[] {
  const nodes: CollectionTreeNode[] = []

  // Find all collections with the specified parent
  const children = collections.filter((c) => c.parentId === parentId)

  for (const collection of children) {
    const hasChildren = collections.some((c) => c.parentId === collection.id)
    const isExpanded = expandedIds.includes(collection.id)

    const node: CollectionTreeNode = {
      collection,
      children:
        hasChildren && isExpanded
          ? buildCollectionTree(
              collections,
              collection.id,
              depth + 1,
              expandedIds
            )
          : [],
      depth,
      hasChildren,
      isExpanded,
    }

    nodes.push(node)
  }

  return nodes
}

/**
 * Flatten a tree structure back to a flat array
 */
export function flattenCollectionTree(
  tree: CollectionTreeNode[]
): Collection[] {
  const result: Collection[] = []

  function traverse(nodes: CollectionTreeNode[]) {
    for (const node of nodes) {
      result.push(node.collection)
      if (node.children.length > 0) {
        traverse(node.children)
      }
    }
  }

  traverse(tree)
  return result
}

/**
 * Get the depth/nesting level of a specific collection
 */
export function getCollectionDepth(
  collectionId: string,
  collections: Collection[]
): number {
  const collection = collections.find((c) => c.id === collectionId)
  if (!collection) return 0

  let depth = 0
  let currentParentId = collection.parentId

  // Traverse up the tree to count depth
  while (currentParentId) {
    depth++
    const parent = collections.find((c) => c.id === currentParentId)
    if (!parent) break
    currentParentId = parent.parentId

    // Safety check: prevent infinite loops
    if (depth > 100) {
      console.warn(
        'Possible circular reference detected in collection hierarchy'
      )
      break
    }
  }

  return depth
}

/**
 * Get total depth of a collection's subtree (including all descendants)
 */
export function getTotalDepth(
  collection: Collection,
  collections: Collection[]
): number {
  const children = collections.filter((c) => c.parentId === collection.id)

  if (children.length === 0) {
    return 1 // Leaf node has depth 1
  }

  // Recursively find max depth of children
  const childDepths = children.map((child) => getTotalDepth(child, collections))
  return 1 + Math.max(...childDepths)
}

/**
 * Check if childId is a descendant of ancestorId
 */
export function isDescendantOf(
  childId: string,
  ancestorId: string,
  collections: Collection[]
): boolean {
  if (childId === ancestorId) return false

  const child = collections.find((c) => c.id === childId)
  if (!child || !child.parentId) return false

  // Traverse up the tree
  let currentParentId: string | null | undefined = child.parentId
  const visited = new Set<string>()

  while (currentParentId) {
    if (currentParentId === ancestorId) {
      return true
    }

    // Prevent infinite loops
    if (visited.has(currentParentId)) {
      console.warn('Circular reference detected in collection hierarchy')
      return false
    }
    visited.add(currentParentId)

    const parent = collections.find((c) => c.id === currentParentId)
    if (!parent) break
    currentParentId = parent.parentId
  }

  return false
}

/**
 * Get all ancestor IDs for a collection (from immediate parent to root)
 */
export function getAncestorIds(
  collectionId: string,
  collections: Collection[]
): string[] {
  const ancestors: string[] = []
  const collection = collections.find((c) => c.id === collectionId)
  if (!collection) return ancestors

  let currentParentId = collection.parentId
  const visited = new Set<string>()

  while (currentParentId) {
    if (visited.has(currentParentId)) {
      console.warn('Circular reference detected in collection hierarchy')
      break
    }
    visited.add(currentParentId)

    ancestors.push(currentParentId)
    const parent = collections.find((c) => c.id === currentParentId)
    if (!parent) break
    currentParentId = parent.parentId
  }

  return ancestors
}

/**
 * Get full ancestor chain (collection objects, not just IDs)
 */
export function getCollectionPath(
  collectionId: string,
  collections: Collection[]
): Collection[] {
  const path: Collection[] = []
  const collection = collections.find((c) => c.id === collectionId)
  if (!collection) return path

  path.unshift(collection) // Add current collection first

  let currentParentId = collection.parentId
  const visited = new Set<string>()

  while (currentParentId) {
    if (visited.has(currentParentId)) {
      console.warn('Circular reference detected in collection hierarchy')
      break
    }
    visited.add(currentParentId)

    const parent = collections.find((c) => c.id === currentParentId)
    if (!parent) break

    path.unshift(parent) // Add to beginning to maintain root -> leaf order
    currentParentId = parent.parentId
  }

  return path
}

/**
 * Get path as a formatted string (e.g., "Work / Projects / 2024")
 */
export function getCollectionPathString(
  collectionId: string,
  collections: Collection[],
  separator: string = ' → '
): string {
  const path = getCollectionPath(collectionId, collections)
  return path.map((c) => c.name).join(separator)
}

/**
 * Get all direct children of a collection
 */
export function getChildCollections(
  parentId: string,
  collections: Collection[]
): Collection[] {
  return collections.filter((c) => c.parentId === parentId)
}

/**
 * Get all descendants recursively (entire subtree)
 */
export function getAllDescendants(
  collectionId: string,
  collections: Collection[]
): Collection[] {
  const descendants: Collection[] = []
  const children = collections.filter((c) => c.parentId === collectionId)

  for (const child of children) {
    descendants.push(child)
    // Recursively get descendants of this child
    const childDescendants = getAllDescendants(child.id, collections)
    descendants.push(...childDescendants)
  }

  return descendants
}

/**
 * Sort collections by hierarchy (parents before children)
 */
export function sortCollectionsByHierarchy(
  collections: Collection[]
): Collection[] {
  const sorted: Collection[] = []
  const visited = new Set<string>()

  function addWithAncestors(collection: Collection) {
    // Skip if already added
    if (visited.has(collection.id)) return

    // Add parent first if it exists
    if (collection.parentId) {
      const parent = collections.find((c) => c.id === collection.parentId)
      if (parent) {
        addWithAncestors(parent)
      }
    }

    // Add this collection
    if (!visited.has(collection.id)) {
      sorted.push(collection)
      visited.add(collection.id)
    }
  }

  // Process all collections
  for (const collection of collections) {
    addWithAncestors(collection)
  }

  return sorted
}

/**
 * Validate if setting a new parent would create a circular reference
 */
export function wouldCreateCircularReference(
  collectionId: string,
  newParentId: string,
  collections: Collection[]
): boolean {
  // Can't be your own parent
  if (collectionId === newParentId) {
    return true
  }

  // Check if newParent is a descendant of collection
  return isDescendantOf(newParentId, collectionId, collections)
}

/**
 * Validate parent assignment (checks multiple conditions)
 */
export function validateParentAssignment(
  collectionId: string,
  newParentId: string | null,
  collections: Collection[],
  maxDepth: number = 5
): { valid: boolean; error?: string } {
  // Null parent is always valid (makes it a root collection)
  if (newParentId === null) {
    return { valid: true }
  }

  // Check if parent exists
  const parent = collections.find((c) => c.id === newParentId)
  if (!parent) {
    return { valid: false, error: 'Parent collection not found' }
  }

  // Check for circular reference
  if (wouldCreateCircularReference(collectionId, newParentId, collections)) {
    return { valid: false, error: 'Cannot create circular reference' }
  }

  // Check if it would exceed max depth
  const parentDepth = getCollectionDepth(newParentId, collections)
  const collection = collections.find((c) => c.id === collectionId)
  const subtreeDepth = collection ? getTotalDepth(collection, collections) : 1

  if (parentDepth + subtreeDepth > maxDepth) {
    return {
      valid: false,
      error: `Would exceed maximum nesting depth of ${maxDepth} levels`,
    }
  }

  // Check if parent is a smart collection
  if (parent.isSmartCollection) {
    return { valid: false, error: 'Smart collections cannot have children' }
  }

  // Check if collection itself is a smart collection
  if (collection?.isSmartCollection) {
    return { valid: false, error: 'Smart collections cannot be nested' }
  }

  return { valid: true }
}

/**
 * Get count of hidden children beyond maxDepth (for "+N more" badge)
 */
export function getHiddenChildrenCount(
  collection: Collection,
  currentDepth: number,
  maxDepth: number | undefined,
  collections: Collection[]
): number {
  if (maxDepth === undefined || currentDepth < maxDepth) {
    return 0
  }

  // Count all descendants (they're all hidden)
  return getAllDescendants(collection.id, collections).length
}

/**
 * Check if collection has nested children beyond a certain depth
 */
export function hasDeepNesting(
  collection: Collection,
  minDepth: number,
  collections: Collection[]
): boolean {
  const totalDepth = getTotalDepth(collection, collections)
  return totalDepth >= minDepth
}

/**
 * Count total bookmarks including descendants
 */
export function getBookmarkCountWithDescendants(
  collectionId: string,
  collections: Collection[],
  collectionBookmarks: Record<string, number[]>
): number {
  // Get direct bookmarks
  const directCount = collectionBookmarks[collectionId]?.length || 0

  // Get all descendants
  const descendants = getAllDescendants(collectionId, collections)

  // Sum up bookmarks from all descendants
  const descendantCount = descendants.reduce((sum, desc) => {
    return sum + (collectionBookmarks[desc.id]?.length || 0)
  }, 0)

  return directCount + descendantCount
}

/**
 * Get root collections (collections with no parent)
 */
export function getRootCollections(collections: Collection[]): Collection[] {
  return collections.filter((c) => !c.parentId)
}

/**
 * Find collection by path string (e.g., "Work/Projects/2024")
 */
export function findCollectionByPath(
  path: string,
  collections: Collection[],
  separator: string = '/'
): Collection | null {
  const parts = path.split(separator).map((p) => p.trim())

  let currentCollections = getRootCollections(collections)
  let found: Collection | null = null

  for (const part of parts) {
    found = currentCollections.find((c) => c.name === part) || null
    if (!found) return null
    currentCollections = getChildCollections(found.id, collections)
  }

  return found
}
