/**
 * CollectionTree - Container component for hierarchical collection display
 *
 * Renders a tree of collections with configurable depth limiting
 */

import { VStack } from '@chakra-ui/react'
import { memo, useMemo } from 'react'
import type { Collection } from '../../../types/collections'
import { CollectionTreeItem } from './CollectionTreeItem'
import { getRootCollections } from '../../../utils/collectionHierarchy'

interface CollectionTreeProps {
  collections: Collection[]
  activeCollectionId: string | null
  expandedCollections: string[]
  collectionBookmarks: Record<string, number[]>
  maxDepth?: number // 2 for sidebar, undefined for full tree panel
  onToggleExpand: (id: string) => void
  onExpandFullView?: (id: string) => void
  onCollectionClick: (id: string) => void
}

export const CollectionTree = memo<CollectionTreeProps>(({
  collections,
  activeCollectionId,
  expandedCollections,
  collectionBookmarks,
  maxDepth,
  onToggleExpand,
  onExpandFullView,
  onCollectionClick
}) => {
  // Get root-level collections (no parent)
  const rootCollections = useMemo(
    () => getRootCollections(collections),
    [collections]
  )

  // Separate default collections from user collections
  const { defaultCollections, userCollections } = useMemo(() => ({
    defaultCollections: rootCollections.filter(c => c.isDefault),
    userCollections: rootCollections.filter(c => !c.isDefault)
  }), [rootCollections])

  return (
    <VStack align="stretch" gap={1} px={2}>
      {/* Default Collections (Smart Collections) */}
      {defaultCollections.map(collection => (
        <CollectionTreeItem
          key={collection.id}
          collection={collection}
          collections={collections}
          depth={0}
          maxDepth={maxDepth}
          isExpanded={expandedCollections.includes(collection.id)}
          isActive={activeCollectionId === collection.id}
          activeCollectionId={activeCollectionId}
          expandedCollections={expandedCollections}
          collectionBookmarks={collectionBookmarks}
          onToggleExpand={onToggleExpand}
          onExpandFullView={onExpandFullView}
          onCollectionClick={onCollectionClick}
        />
      ))}

      {/* Divider between default and user collections */}
      {defaultCollections.length > 0 && userCollections.length > 0 && (
        <div style={{
          height: '1px',
          background: 'var(--color-border)',
          margin: '8px 0'
        }} />
      )}

      {/* User Collections */}
      {userCollections.map(collection => (
        <CollectionTreeItem
          key={collection.id}
          collection={collection}
          collections={collections}
          depth={0}
          maxDepth={maxDepth}
          isExpanded={expandedCollections.includes(collection.id)}
          isActive={activeCollectionId === collection.id}
          activeCollectionId={activeCollectionId}
          expandedCollections={expandedCollections}
          collectionBookmarks={collectionBookmarks}
          onToggleExpand={onToggleExpand}
          onExpandFullView={onExpandFullView}
          onCollectionClick={onCollectionClick}
        />
      ))}
    </VStack>
  )
})

CollectionTree.displayName = 'CollectionTree'
