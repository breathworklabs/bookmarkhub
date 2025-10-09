# Nested Collections/Sub-folders Implementation Plan

## Overview
Add support for hierarchical collections (folders/sub-folders) to organize bookmarks in a tree structure with parent-child relationships.

## Current State Analysis

### Existing Infrastructure ✅
The codebase already has **basic infrastructure** for nested collections:
- `parentId` field exists in Collection type
- `expandedCollections` array in CollectionsState for tracking tree view expansion
- `toggleCollectionExpansion` action in collectionsStore

### Incomplete Implementation ❌
However, the **implementation is incomplete**:
- No UI rendering of hierarchical structure in CollectionsList.tsx
- No logic to handle parent-child relationships
- No validation to prevent circular references
- No drag-and-drop support for nesting collections

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
- Add **"Expand Full View"** icon/button for collections with 3+ nested levels
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
| **UI Components** | Medium-High | 8-10 hours |
| **Drag & Drop** | Medium-High | 6-8 hours |
| **Testing** | Medium | 4-6 hours |
| **Polish & UX** | Low-Medium | 4-6 hours |
| **Documentation** | Low | 2-3 hours |
| **TOTAL** | | **2-3 days** |

---

## Dependencies

### External Libraries (Optional):
- Consider `react-arborist` or `react-complex-tree` for advanced tree UI
- Or build custom recursive component (recommended for full control)

### Internal Dependencies:
- Drag-and-drop already implemented for bookmarks (reuse patterns)
- Modal system already in place
- Store pattern established

---

## UI/UX Mockup (Text-based)

### Main Sidebar - Compact View (2 Levels Max)

```
Collections
  ├─ 📁 Work                     [45]
  │  ├─ 📁 Projects              [30] 🔍
  │  └─ 📁 Resources             [12]
  │
  ├─ 📁 Personal                 [8]
  │  ├─ 📁 Finance              [3]
  │  └─ 📁 Travel               [5]
  │
  └─ 📁 Learning                [45]
     ├─ 📁 Tutorials            [20] 🔍
     ├─ 📁 Documentation        [15]
     └─ 📁 Articles             [10]

─────────────────────────
Smart Collections
  ⭐ Starred                    [12]
  🕐 Recent                     [8]
  📦 Archived                   [34]
```

**Note:** 🔍 icon indicates "Expand Full View" button (appears when collection has 3+ levels)

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
