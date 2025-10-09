/**
 * CollectionTree - Container component for hierarchical collection display
 *
 * Renders a tree of collections with configurable depth limiting
 */

import { VStack } from '@chakra-ui/react'
import { memo, useMemo } from 'react'
import type { Collection } from '../../../types/collections'
import { CollectionTreeItem } from './CollectionTreeItem'
import { CollectionSection } from './CollectionSection'
import { getRootCollections } from '../../../utils/collectionHierarchy'
import { useCollectionsStore } from '../../../store/collectionsStore'

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
  // Get section collapse state from store
  const toggleSectionCollapse = useCollectionsStore(state => state.toggleSectionCollapse)
  const isSectionCollapsed = useCollectionsStore(state => state.isSectionCollapsed)

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
    <VStack align="stretch" gap={2}>
      {/* Smart Collections Section */}
      {defaultCollections.length > 0 && (
        <CollectionSection
          title="Smart Collections"
          isCollapsed={isSectionCollapsed('smart')}
          onToggle={() => toggleSectionCollapse('smart')}
          count={defaultCollections.length}
        >
          <VStack align="stretch" gap={1}>
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
          </VStack>
        </CollectionSection>
      )}

      {/* My Collections Section */}
      {userCollections.length > 0 && (
        <CollectionSection
          title="My Collections"
          isCollapsed={isSectionCollapsed('user')}
          onToggle={() => toggleSectionCollapse('user')}
          count={userCollections.length}
        >
          <VStack align="stretch" gap={1}>
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
        </CollectionSection>
      )}
    </VStack>
  )
})

CollectionTree.displayName = 'CollectionTree'
