# Store Access Patterns Guide

**Last Updated:** October 8, 2025
**Status:** Recommended Pattern Documented

---

## Overview

This guide documents the recommended patterns for accessing Zustand stores in the X Bookmark Manager application.

---

## Available Patterns

### 1. ✅ **Selector Hooks (Recommended for New Components)**

**Use:** Centralized selector hooks for consistency and reduced boilerplate

**Location:**

- `/src/hooks/selectors/useBookmarkSelectors.ts`
- `/src/hooks/selectors/useCollectionsSelectors.ts`

**Example:**

```tsx
import { useBookmarkSelectors } from '../hooks/selectors/useBookmarkSelectors'

const MyComponent = () => {
  const { bookmarks, isLoading, addBookmark } = useBookmarkSelectors()

  return <div>{isLoading ? 'Loading...' : `${bookmarks.length} bookmarks`}</div>
}
```

**Advantages:**

- ✅ Consistent API across components
- ✅ Reduces repetitive selector code
- ✅ Single import statement
- ✅ Auto-completion for all available state/actions

**Disadvantages:**

- ⚠️ Returns ALL selectors, even if you only need one
- ⚠️ May cause unnecessary re-renders if not careful

---

### 2. ✅ **Direct Store Access (Acceptable)**

**Use:** When you need fine-grained control over re-renders

**Example:**

```tsx
import { useBookmarkStore } from '../store/bookmarkStore'

const MyComponent = () => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const addBookmark = useBookmarkStore((state) => state.addBookmark)

  return <div>{bookmarks.length} bookmarks</div>
}
```

**Advantages:**

- ✅ Fine-grained control over re-renders
- ✅ Only subscribes to specific state slices
- ✅ Better performance for large components

**Disadvantages:**

- ⚠️ More verbose (multiple lines)
- ⚠️ Inconsistent across codebase

---

### 3. ✅ **Custom Optimized Selectors (For Performance-Critical Components)**

**Use:** When you need multiple related values with optimized re-rendering

**Example:**

```tsx
import { useMemo } from 'react'
import { useBookmarkStore } from '../store/bookmarkStore'

const useFilterData = () => {
  const searchQuery = useBookmarkStore((state) => state.searchQuery)
  const authorFilter = useBookmarkStore((state) => state.authorFilter)
  const domainFilter = useBookmarkStore((state) => state.domainFilter)

  return useMemo(
    () => ({
      searchQuery,
      authorFilter,
      domainFilter,
    }),
    [searchQuery, authorFilter, domainFilter]
  )
}

const MyComponent = () => {
  const filterData = useFilterData()
  // Component only re-renders when filter values change
}
```

**Advantages:**

- ✅ Maximum performance control
- ✅ Optimized re-rendering with useMemo
- ✅ Grouped related state

**Disadvantages:**

- ⚠️ More code to maintain
- ⚠️ Requires understanding of useMemo

---

## Decision Tree

```
Do you need multiple state values and actions?
├─ YES → Are they all from the same store?
│        ├─ YES → Use Selector Hook (Pattern 1)
│        └─ NO  → Use Direct Access (Pattern 2)
│
└─ NO  → Do you need just 1-2 values?
         └─ Use Direct Access (Pattern 2)

Is this a performance-critical component with complex filtering?
└─ YES → Consider Custom Optimized Selector (Pattern 3)
```

---

## Current State of Codebase

### Using Selector Hooks (4 components)

- ✅ `/src/components/AdvancedFilters.tsx`
- ✅ `/src/components/FilterBar.tsx`
- ✅ `/src/components/DomainFilter.tsx`
- ✅ `/src/components/AuthorFilter.tsx`

### Using Direct Access (22+ components)

- `/src/components/SearchHeader.tsx` (Custom optimized selector)
- `/src/components/InfiniteBookmarkGrid.tsx`
- `/src/components/SidebarMenu.tsx`
- `/src/components/BookmarkList.tsx`
- ... and 18+ more

### Using Custom Optimized Selectors (1 component)

- ✅ `/src/components/SearchHeader.tsx` (`useFilterData`)

---

## Recommendations

### For New Components

1. **Default to Selector Hooks** unless you have a specific reason not to
2. **Use Direct Access** when you only need 1-2 values
3. **Use Custom Selectors** only for performance-critical components

### For Existing Components

- ✅ **Keep as-is** - Current mix is acceptable
- ⚠️ **Refactor if touching** - When updating a component, consider switching to selector hooks
- ❌ **Don't refactor en masse** - Risk of introducing bugs

---

## Examples from Codebase

### Good: Using Selector Hook

```tsx
// src/components/FilterBar.tsx
import { useBookmarkSelectors } from '../hooks/selectors/useBookmarkSelectors'

const FilterBar = () => {
  const { selectedTags, addTag, removeTag, clearTags } = useBookmarkSelectors()

  // Clean and concise!
}
```

### Good: Direct Access (Single Value)

```tsx
// When you only need one thing
const MyComponent = () => {
  const viewMode = useBookmarkStore((state) => state.viewMode)
  // Fine for single values
}
```

### Good: Custom Optimized Selector

```tsx
// src/components/SearchHeader.tsx
const useFilterData = () => {
  const searchQuery = useBookmarkStore(state => state.searchQuery)
  const isFiltersPanelOpen = useBookmarkStore(state => state.isFiltersPanelOpen)
  // ... more filters

  return useMemo(() => ({
    searchQuery,
    isFiltersPanelOpen,
    // ... grouped together
  }), [searchQuery, isFiltersPanelOpen, ...])
}
```

---

## Migration Guide (If Needed)

If you decide to migrate a component from direct access to selector hooks:

### Before:

```tsx
import { useBookmarkStore } from '../store/bookmarkStore'

const MyComponent = () => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks)
  const isLoading = useBookmarkStore((state) => state.isLoading)
  const addBookmark = useBookmarkStore((state) => state.addBookmark)
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark)

  // 4 separate lines
}
```

### After:

```tsx
import { useBookmarkSelectors } from '../hooks/selectors/useBookmarkSelectors'

const MyComponent = () => {
  const { bookmarks, isLoading, addBookmark, removeBookmark } =
    useBookmarkSelectors()

  // Single import, cleaner code
}
```

---

## Performance Considerations

### Selector Hook Performance

```tsx
// ⚠️ Re-renders on ANY bookmark store change
const { bookmarks, isLoading, ...everything } = useBookmarkSelectors()

// ✅ Better: Only destructure what you need
const { bookmarks, isLoading } = useBookmarkSelectors()
```

### Direct Access Performance

```tsx
// ✅ Only re-renders when bookmarks change
const bookmarks = useBookmarkStore((state) => state.bookmarks)
```

---

## Conclusion

- **Both patterns are valid** - choose based on your needs
- **Selector hooks** provide consistency and convenience
- **Direct access** provides performance control
- **Custom selectors** provide maximum optimization

The codebase uses a pragmatic mix, which is acceptable. Consistency is nice but not critical for this case.

---

**End of Guide**
