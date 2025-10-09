# Nested Collections/Sub-folders Implementation Plan

## ✅ Implementation Status: PHASE 1 COMPLETE (December 2024)

**What's Working:**
- ✅ Nested collections up to 5 levels deep
- ✅ Tree view with 2-level depth limit in sidebar
- ✅ Visual indicators for deep nesting (+N more badges, stacked folder icons)
- ✅ Parent selector in Create/Edit Collection modal with breadcrumb paths
- ✅ Full breadcrumb navigation with clickable ancestors
- ✅ Active state highlighting for all nested items
- ✅ Circular reference prevention and validation
- ✅ Complete hierarchy utility functions
- ✅ Cascade/flatten delete modes

**Future Enhancements (Phase 2):**
- 🔮 Secondary tree panel for deep exploration (3+ levels)
- 🔮 Drag-and-drop collection nesting
- 🔮 Bulk collection operations
- 🔮 Collection templates

---

## Overview
Add support for hierarchical collections (folders/sub-folders) to organize bookmarks in a tree structure with parent-child relationships.

## ~~Current State Analysis~~ → Implementation Complete ✅

### ~~Existing Infrastructure~~ → Fully Implemented ✅
- ✅ `parentId` field fully utilized
- ✅ `expandedCollections` tracking working
- ✅ Tree expansion/collapse actions implemented
- ✅ Complete hierarchy utilities

### ~~Incomplete Implementation~~ → All Core Features Complete ✅
- ✅ UI rendering hierarchical structure with depth limiting
- ✅ Full parent-child relationship logic
- ✅ Circular reference validation
- ~~Drag-and-drop support~~ → Moved to Phase 2

---

## Implementation Plan

### 1. Data Layer (Backend/Storage)

**File:** `src/lib/localStorage.ts`

#### Additions Needed:
- ✅ `parentId` field already exists in Collection type
- Add validation logic to prevent:
  - Circular references (collection can't be its own parent/ancestor)
  - Setting archived/deleted collections as parents
  - Maximum nesting depth (suggest 5 levels)

#### New Helper Methods:
```typescript
// Get ancestor chain for breadcrumb display
getCollectionPath(collectionId: string): Collection[]

// Get direct children of a parent
getChildCollections(parentId: string): Collection[]

// Get all nested children recursively
getAllDescendants(collectionId: string): Collection[]

// Validate parent assignment
validateParentAssignment(collectionId: string, parentId: string): boolean
```

---

### 2. Store Layer (State Management)

**File:** `src/store/collectionsStore.ts`

#### Update Existing Actions:
- **`createCollection`** - Support `parentId` parameter with validation
- **`updateCollection`** - Validate parent changes (prevent circular refs)
- **`deleteCollection`** - Handle children with options:
  - **Option A:** Move children to parent's parent (flatten)
  - **Option B:** Delete all descendants recursively (with user confirmation)

#### New Actions:
```typescript
// Move collection to new parent with validation
moveCollection(collectionId: string, newParentId: string | null): Promise<void>

// Expand/collapse specific collection
expandCollection(id: string): void
collapseCollection(id: string): void

// Bulk expand/collapse operations
expandAll(): void
collapseAll(): void

// Get collection with all ancestors (for breadcrumb)
getCollectionBreadcrumb(collectionId: string): Collection[]
```

---

### 3. UI Components (Presentation)

**File:** `src/components/collections/CollectionsList.tsx`

#### Tree Structure Rendering:

**Main Sidebar (Compact View):**
- Show only **2 levels of depth** in the main sidebar by default
- Add **indentation** (padding-left based on depth level)
- Add **expand/collapse icons** (chevron) for parent collections
- Add **visual indicators** for collections with hidden nested children:
  - **"+N more"** badge showing count of hidden subfolders (e.g., "+3 more")
  - **"..." ellipsis** icon next to folder icon
  - **Subtle gradient** on folder icon indicating deeper content
  - **Different folder icon** (e.g., stacked folders icon) for multi-level collections
- Add **"Expand Full View"** button (🔍 or LuMaximize2 icon) for collections with 3+ nested levels
- Show **bookmark count** including descendants (with toggle option)

**Secondary Panel (Full Tree View):**
- Clicking **"Expand Full View"** opens a **secondary panel** beside the sidebar
- Shows the **complete nested structure** for selected collection branch
- Supports **unlimited depth** in this expanded view
- Can be **pinned** or **dismissed** by user
- Provides **breadcrumb navigation** at the top
- Full **drag-and-drop** functionality for deep reorganization

#### Component Structure:
```typescript
// Main sidebar - compact view (max 2 levels)
<CollectionsList
  maxDepth={2}
  onExpandFullView={(collectionId) => showCollectionTreePanel(collectionId)}
/>

// Secondary panel - full tree view
<CollectionTreePanel
  rootCollectionId={selectedCollectionId}
  isOpen={isTreePanelOpen}
  onClose={closeTreePanel}
  isPinned={isTreePanelPinned}
/>

// Recursive component used in both views
<CollectionTreeItem
  collection={collection}
  depth={0}
  maxDepth={maxDepth} // 2 for sidebar, undefined for panel
  isExpanded={expandedCollections.includes(collection.id)}
  onToggleExpand={toggleCollectionExpansion}
  onExpandFullView={onExpandFullView}
  onMove={moveCollection}
/>
```

#### Drag & Drop Enhancements:
- Allow **dragging collections** to reorder or nest
- **Visual feedback** for valid drop targets
- **Prevent dropping** onto descendants (circular reference)
- Support **"drop between"** for ordering siblings
- Show **drop zones**:
  - Above item (reorder before)
  - On item (nest as child)
  - Below item (reorder after)

#### Create/Edit Collection Modal:
- Add **"Parent Collection" dropdown** selector
- Show **hierarchical breadcrumb** in dropdown
- **Filter out invalid parents** (self, descendants)
- Show **visual hierarchy** in parent selector

#### Two-Panel UI Architecture

**New File:** `src/components/collections/CollectionTreePanel.tsx`

**Purpose:** Dedicated panel for viewing deep nested structures (3+ levels)

**State Management:**
```typescript
interface TreePanelState {
  isOpen: boolean
  isPinned: boolean
  rootCollectionId: string | null
  width: number // Resizable panel
}
```

**Behavior:**
- **Opens:** When user clicks "Expand Full View" (🔍) on any collection with 3+ levels
- **Closes:**
  - Click ✕ button
  - Click outside (if not pinned)
  - Navigate away (if not pinned)
- **Pinned Mode:**
  - Stays open during navigation
  - Saved to localStorage
  - Can be resized (drag right edge)
- **Layout:**
  - Positioned between sidebar and main content
  - Slide-in animation from left
  - Z-index above content, below modals
  - Width: 300-500px (resizable, default 350px)

**Integration:**
```typescript
// Add to UnifiedSidebar or main layout
<>
  <Sidebar>
    <CollectionsList maxDepth={2} />
  </Sidebar>

  <CollectionTreePanel
    isOpen={treePanelState.isOpen}
    isPinned={treePanelState.isPinned}
    rootCollectionId={treePanelState.rootCollectionId}
    width={treePanelState.width}
    onClose={closeTreePanel}
    onPin={togglePinTreePanel}
    onResize={resizeTreePanel}
  />

  <MainContent>
    {/* Bookmarks, etc */}
  </MainContent>
</>
```

---

### 4. Computed Properties & Utils

**New File:** `src/utils/collectionHierarchy.ts`

```typescript
// Convert flat array to nested tree structure
export function buildCollectionTree(collections: Collection[]): CollectionTreeNode[]

// Convert tree back to flat array (for storage)
export function flattenCollectionTree(tree: CollectionTreeNode[]): Collection[]

// Get nesting level/depth
export function getCollectionDepth(collectionId: string, collections: Collection[]): number

// Check if childId is descendant of ancestorId
export function isDescendantOf(
  childId: string,
  ancestorId: string,
  collections: Collection[]
): boolean

// Sort collections with parents before children
export function sortCollectionsByHierarchy(collections: Collection[]): Collection[]

// Get all ancestor IDs
export function getAncestorIds(collectionId: string, collections: Collection[]): string[]

// Get full path as string (e.g., "Work/Projects/2024")
export function getCollectionPathString(collectionId: string, collections: Collection[]): string

// Validate circular reference
export function wouldCreateCircularReference(
  collectionId: string,
  newParentId: string,
  collections: Collection[]
): boolean

// Count total bookmarks including descendants
export function getBookmarkCountWithDescendants(
  collectionId: string,
  collections: Collection[],
  collectionBookmarks: Record<string, number[]>
): number

// Get total depth of collection tree (for visual indicators)
export function getTotalDepth(collection: Collection, collections: Collection[]): number

// Get count of hidden children beyond maxDepth (for "+N more" badge)
export function getHiddenChildrenCount(
  collection: Collection,
  currentDepth: number,
  maxDepth: number | undefined,
  collections: Collection[]
): number

// Check if collection has nested children beyond a certain depth
export function hasDeepNesting(
  collection: Collection,
  minDepth: number,
  collections: Collection[]
): boolean
```

**Types:**
```typescript
export interface CollectionTreeNode {
  collection: Collection
  children: CollectionTreeNode[]
  depth: number
  hasChildren: boolean
  isExpanded: boolean
}
```

---

### 5. Smart Collections Handling

#### Rules:
- Smart collections (Starred, Recent, Archived) **remain top-level only**
- Add validation to **prevent** making smart collections:
  - Children of other collections
  - Parents of other collections
- Smart collections always displayed at **top of list** (separate section)

---

### 6. Search & Filtering

#### Enhancements:
- When searching collections, show **matching items with breadcrumb path**
  - Example: `Work → Projects → 2024 → Q1`
- Add **"Expand to show"** button when clicking search result
- **Highlight path** from root to searched collection
- Option to **search within collection hierarchy** (include descendants)

---

### 7. Testing

**Files:** `tests/unittests/collections-nested.test.ts`

#### Test Cases:
```typescript
describe('Nested Collections', () => {
  // Circular reference prevention
  test('prevents circular reference when setting parent')
  test('prevents setting descendant as parent')

  // Max depth validation
  test('prevents nesting beyond max depth')
  test('allows nesting up to max depth')

  // Cascade delete
  test('deletes all descendants when parent deleted (recursive mode)')
  test('moves children to grandparent when parent deleted (flatten mode)')

  // Tree utilities
  test('buildCollectionTree creates correct hierarchy')
  test('flattenCollectionTree preserves all data')
  test('getCollectionDepth returns correct depth')
  test('isDescendantOf correctly identifies relationships')

  // Drag-and-drop
  test('allows valid collection nesting via drag-drop')
  test('prevents invalid collection nesting via drag-drop')
  test('reorders sibling collections correctly')

  // Smart collections
  test('prevents smart collections from being nested')
  test('prevents smart collections from having children')
}
```

---

### 8. Data Migration

#### Migration Status: ✅ **No Migration Required**
- Existing collections have `parentId?: string | null` (already optional)
- All existing collections automatically become **top-level items** (`parentId: null`)
- No data transformation needed

---

### 9. Settings/Preferences

**File:** `src/store/settingsStore.ts`

#### New Settings:
```typescript
interface CollectionSettings {
  // Whether to expand all collections on load
  defaultCollectionsExpanded: boolean

  // Maximum nesting depth (default: 5)
  maxNestingDepth: number

  // Visual style for tree
  collectionTreeStyle: 'lines' | 'minimal' | 'compact'

  // Show bookmark counts including descendants
  showDescendantCounts: boolean

  // Delete behavior for parents
  deleteParentBehavior: 'flatten' | 'cascade'

  // Auto-expand when navigating to nested collection
  autoExpandOnNavigate: boolean

  // === Two-Panel System Settings ===

  // Max depth to show in sidebar before showing expand button
  sidebarMaxDepth: number // default: 2

  // Tree panel preferences
  treePanelDefaultWidth: number // default: 350
  treePanelPinned: boolean // default: false
  treePanelLastRootCollection: string | null // remember last viewed
}
```

---

### 10. Edge Cases to Handle

#### Critical Edge Cases:
1. **Moving collection with children** to be child of another
   - Validate depth of entire subtree doesn't exceed max

2. **Deleting parent with multiple nested levels**
   - Show preview of affected collections
   - Confirm action with count (e.g., "Delete Work and 12 nested collections?")

3. **Bookmark counts with descendants**
   - Option to show: `5 (+12)` where 5 is direct, 12 is from children
   - Toggle in settings

4. **Active collection indicator with nested items**
   - Highlight both active item AND its path
   - Auto-expand path to active collection

5. **Drag collection onto smart collections**
   - Prevent and show error toast
   - Highlight valid drop zones only

6. **Performance with deep nesting**
   - Virtualize tree if collection count > 100
   - Lazy load children on expand

7. **Import/Export with nested structure**
   - Preserve parent-child relationships
   - Validate on import (fix broken parentIds)

---

## Suggested Implementation Order

### Phase 1: Foundation (Day 1)
1. ✅ Review existing `parentId` infrastructure
2. Create `src/utils/collectionHierarchy.ts` with utility functions
3. Add validation methods to localStorage service
4. Write unit tests for utilities

### Phase 2: Store & Logic (Day 1-2)
5. Update store actions with validation
6. Add new actions (`moveCollection`, `expandAll`, etc.)
7. Update delete logic with cascade/flatten options
8. Test store actions

### Phase 3: UI Components (Day 2)
9. Build recursive `CollectionTreeItem` component
10. Add expand/collapse UI with icons for levels 1-2
11. Implement visual hierarchy (indentation, lines)
12. Update collection counts to include descendants
13. Create `CollectionTreePanel` component for deep tree view
14. Add "Expand Full View" button for collections with 3+ levels
15. Implement panel pin/unpin functionality

### Phase 4: Drag & Drop (Day 2-3)
16. Implement drag-and-drop nesting in sidebar
17. Add drag-and-drop in secondary panel
18. Add drop zone visual feedback
19. Add validation for drop targets
20. Test drag-and-drop edge cases

### Phase 5: Modals & UX (Day 3)
21. Update Create/Edit Collection modal with parent selector
22. Add breadcrumb display in modals and panel header
23. Implement search with hierarchy support
24. Add "expand to show" feature
25. Polish panel animations (slide-in/slide-out)

### Phase 6: Polish & Testing (Day 3)
26. Add integration tests for two-panel system
27. Implement animations for expand/collapse
28. Add visual indicators and polish UI
29. Performance optimization (virtualization if needed)
30. Test panel behavior (pinning, closing, resizing)

### Phase 7: Documentation
31. Update user documentation (explain two-panel system)
32. Add developer documentation
33. Create migration guide (even though no migration needed)

---

## Estimated Complexity

| Area | Complexity | Estimated Time |
|------|-----------|----------------|
| **Backend/Logic** | Medium | 6-8 hours |
| **Utility Functions** | Medium | 4-6 hours |
| **Custom Tree Components** | Medium | 6-8 hours |
| **Tree Panel Component** | Medium | 4-5 hours |
| **Drag & Drop Integration** | Low-Medium | 3-4 hours* |
| **Testing** | Medium | 4-6 hours |
| **Polish & UX** | Low-Medium | 4-6 hours |
| **Documentation** | Low | 2-3 hours |
| **TOTAL** | | **2-3 days** |

*Lower than initially estimated because we're reusing existing `react-dnd` patterns from `CollectionsList.tsx`

**Time Saved by Building Custom:**
- No library learning curve: ~4-6 hours saved
- No custom styling/theming to match Chakra UI: ~2-3 hours saved
- Direct integration with existing code: ~2-3 hours saved
- **Total savings: ~8-12 hours** over using external library

---

## Dependencies

### Tree Component Decision: ✅ **Custom Component**

**Why Custom Instead of Library:**

We will **build a custom tree component** rather than using external libraries like `react-complex-tree` or `react-arborist` because:

1. ✅ **Already have react-dnd** (v16.0.1) - drag-and-drop working in `CollectionsList.tsx`
2. ✅ **Simple tree requirements** - max 5 levels, not thousands of nodes (no need for virtualization)
3. ✅ **Two-panel design is unique** - libraries don't support our specific sidebar/panel split
4. ✅ **Chakra UI consistency** - custom component matches existing design system perfectly
5. ✅ **Lighter bundle** - no additional 50-100KB dependencies
6. ✅ **Faster development** - reuse existing patterns (4-6 hours vs 8-10+ hours learning library API)
7. ✅ **Full control** - easier to maintain and customize for future features

### Custom Component Architecture:

**Core Components to Build:**
```typescript
// src/components/collections/tree/CollectionTreeItem.tsx
// Recursive tree item with drag-and-drop (reuse existing DnD patterns)

// src/components/collections/tree/CollectionTree.tsx
// Container for tree with depth limiting

// src/components/collections/CollectionTreePanel.tsx
// Secondary panel for deep structures
```

**Reuse Existing:**
- `react-dnd` + `react-dnd-html5-backend` (already installed)
- Chakra UI components (`Box`, `HStack`, `Badge`, etc.)
- Existing drag-and-drop logic from `CollectionsList.tsx`
- Zustand store patterns from `collectionsStore.ts`
- Framer Motion for panel slide animations (already installed)

**Implementation Details:**

```typescript
// src/components/collections/tree/CollectionTreeItem.tsx
interface CollectionTreeItemProps {
  collection: Collection
  depth: number
  maxDepth?: number // 2 for sidebar, undefined for panel
  isExpanded: boolean
  onToggleExpand: (id: string) => void
  onExpandFullView?: (id: string) => void
  children?: Collection[]
}

const CollectionTreeItem: React.FC<CollectionTreeItemProps> = ({
  collection,
  depth,
  maxDepth,
  isExpanded,
  onToggleExpand,
  onExpandFullView,
  children
}) => {
  const hasChildren = children && children.length > 0
  const isAtMaxDepth = maxDepth !== undefined && depth >= maxDepth
  const hasDeepNesting = /* check if children have 3+ total levels */

  // Reuse existing useDrop hook pattern from CollectionsList.tsx
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.COLLECTION,
    drop: () => ({ parentId: collection.id }),
    canDrop: (item) => validateNesting(item, collection),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  const hiddenChildrenCount = getHiddenChildrenCount(collection, depth, maxDepth)
  const totalDepth = getTotalDepth(collection)

  return (
    <Box ref={drop} pl={depth * 4}> {/* Indentation based on depth */}
      <HStack justify="space-between">
        <HStack>
          {/* Expand/collapse chevron */}
          {hasChildren && !isAtMaxDepth && (
            <Icon onClick={() => onToggleExpand(collection.id)} />
          )}

          {/* Collection icon - different for multi-level folders */}
          {totalDepth >= 3 ? (
            <LuFolders size={16} /> // Stacked folders icon
          ) : hasChildren ? (
            <LuFolder size={16} />
          ) : (
            <LuFolder size={16} />
          )}

          {/* Ellipsis indicator for hidden children */}
          {isAtMaxDepth && hasChildren && (
            <LuMoreHorizontal size={12} color="var(--color-text-tertiary)" />
          )}

          {/* Collection name */}
          <Text>{collection.name}</Text>
        </HStack>

        <HStack gap={1}>
          {/* Badge showing hidden nested count */}
          {hiddenChildrenCount > 0 && (
            <Badge
              fontSize="10px"
              px={1.5}
              py={0.5}
              bg="var(--color-border)"
              color="var(--color-text-tertiary)"
            >
              +{hiddenChildrenCount} more
            </Badge>
          )}

          {/* Bookmark count */}
          <Badge>{bookmarkCount}</Badge>

          {/* Expand full view button (only if at max depth and has deep children) */}
          {isAtMaxDepth && hasDeepNesting && (
            <IconButton
              size="xs"
              icon={<LuMaximize2 />}
              onClick={() => onExpandFullView?.(collection.id)}
              aria-label="Expand full tree view"
              variant="ghost"
            />
          )}
        </HStack>
      </HStack>

      {/* Recursive children */}
      {hasChildren && isExpanded && !isAtMaxDepth && (
        <Box>
          {children.map(child => (
            <CollectionTreeItem
              key={child.id}
              collection={child}
              depth={depth + 1}
              maxDepth={maxDepth}
              // ... pass through props
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
```

### Internal Dependencies:
- ✅ Drag-and-drop already implemented for bookmarks (reuse patterns)
- ✅ Modal system already in place
- ✅ Store pattern established
- ✅ Chakra UI design system
- ✅ Framer Motion for animations
- ✅ Lucide React icons (already installed):
  - `LuFolder` - Regular single folder
  - `LuFolders` - Stacked folders (multi-level indicator)
  - `LuMoreHorizontal` - Ellipsis for hidden children
  - `LuMaximize2` - Expand full view button
  - `LuChevronRight` / `LuChevronDown` - Expand/collapse

---

## UI/UX Mockup (Text-based)

### Main Sidebar - Compact View (2 Levels Max)

```
Collections
  ├─ 📚 Work                     [45]
  │  ├─ 📂... Projects           [30] +3 more  🔍
  │  └─ 📁 Resources             [12]
  │
  ├─ 📁 Personal                 [8]
  │  ├─ 📁 Finance              [3]
  │  └─ 📁 Travel               [5]
  │
  └─ 📚 Learning                [45]
     ├─ 📂... Tutorials         [20] +2 more  🔍
     ├─ 📁 Documentation        [15]
     └─ 📁 Articles             [10]

─────────────────────────
Smart Collections
  ⭐ Starred                    [12]
  🕐 Recent                     [8]
  📦 Archived                   [34]
```

**Visual Indicators Legend:**
- 📁 = Regular folder (no or shallow nesting)
- 📚 = Multi-level folder (has 3+ total nested levels)
- 📂... = Folder with hidden children at this depth level
- **+N more** = Badge showing count of hidden nested subfolders
- 🔍 = "Expand Full View" button (opens secondary panel)

### Secondary Panel - Full Tree View

When user clicks 🔍 on "Projects", a panel opens beside the sidebar:

```
┌─────────────────────────────────────┐
│ 📁 Work → Projects          📌 ✕    │
├─────────────────────────────────────┤
│                                     │
│  📁 Projects                   [30] │
│    ├─ 📁 2024                  [15] │
│    │  ├─ 📁 Q1                  [5] │
│    │  ├─ 📁 Q2                  [6] │
│    │  └─ 📁 Q3                  [4] │
│    │                                │
│    ├─ 📁 2023                  [10] │
│    │  ├─ 📁 Q3                  [4] │
│    │  └─ 📁 Q4                  [6] │
│    │                                │
│    └─ 📁 Archive                [5] │
│       └─ 📁 2022               [5] │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- 📌 = Pin panel (keeps it open while navigating)
- ✕ = Close panel
- Breadcrumb shows full path
- Unlimited depth supported
- Full drag-and-drop enabled

---

## Success Criteria

### Must Have:
- ✅ Collections can be nested up to 5 levels deep
- ✅ Visual tree structure with expand/collapse
- ✅ Drag-and-drop to nest collections
- ✅ Circular reference prevention
- ✅ Proper parent-child validation

### Should Have:
- ✅ Breadcrumb display in modals
- ✅ Bookmark counts including descendants
- ✅ Search with hierarchy support
- ✅ Auto-expand to active collection

### Nice to Have:
- ✅ Animated expand/collapse transitions
- ✅ Visual connecting lines between levels
- ✅ Keyboard navigation (arrow keys)
- ✅ Bulk operations (move multiple collections)

---

## Future Enhancements

1. **Collection Templates** - Save/reuse collection hierarchies
2. **Collection Permissions** - Nested permissions inheritance
3. **Smart Sub-collections** - Auto-populate based on parent criteria
4. **Collection Views** - Different visualization modes (tree, flat, compact)
5. **Collection Pinning** - Pin frequently used collections to top
6. **Collection Colors/Icons** - Inherited from parent or custom per level

---

## References

- Collection Types: `src/types/collections.ts`
- Collections Store: `src/store/collectionsStore.ts`
- Collections List Component: `src/components/collections/CollectionsList.tsx`
- Local Storage Service: `src/lib/localStorage.ts`
- Drag and Drop Types: `src/types/dnd.ts`
