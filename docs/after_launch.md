# Post-Launch Improvements

This document contains recommended improvements to implement after the initial launch. These are categorized by priority and impact.

## High Priority

###  1. Fix Test Timing Issues in useInitializeApp.test.ts

**Issue**: 3 tests failing due to async timing in the hook initialization
- `should detect existing bookmarks in localStorage`
- `should validate bookmarks when existing bookmarks exist`
- `should handle validation errors`

**Root Cause**: The `useInitializeApp` hook has an async `checkExistingBookmarks` function that runs on mount (line 35-60 in `src/hooks/useInitializeApp.ts`). The tests were written expecting synchronous behavior, but the actual implementation is async with Promise.all() for store initialization.

**Recommended Fix**:
1. Refactor the hook to make the async initialization more testable:
   - Extract `checkExistingBookmarks` as a separate testable function
   - OR add a callback/promise that resolves when initialization completes
   - OR use a ref to track initialization completion state
2. Update tests to properly mock and wait for async store.initialize() calls
3. Consider using fake timers + `act()` consistently across all async tests

**Files affected**:
- `src/hooks/useInitializeApp.ts` (lines 35-60)
- `tests/unittests/useInitializeApp.test.ts` (lines 127-152, 515-546, 567-598)

**Estimated effort**: 2-3 hours

---

## Medium Priority

### 2. Split Large Store Files

**Current state**: `bookmarkStore.ts` is 1,427 lines

**Recommendation**: Split into smaller, focused files:
```
src/store/bookmark/
  ├── index.ts (main store)
  ├── actions.ts (mutations)
  ├── selectors.ts (derived state)
  ├── middleware.ts (persistence, sync)
  └── types.ts (store-specific types)
```

**Benefits**:
- Easier to navigate and maintain
- Better separation of concerns
- Reduced merge conflicts
- Easier to test individual pieces

**Files affected**: `src/store/bookmarkStore.ts`

**Estimated effort**: 3-4 hours

---

### 3. Consolidate Error Handling with Wrapper

**Current state**: Error handling is duplicated across store methods

**Recommendation**: Create `withStoreErrorHandling` wrapper:
```typescript
const withStoreErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      logger.error(`${operationName} failed`, error)
      toast.error(`Failed to ${operationName}`)
      throw error
    }
  }) as T
}

// Usage:
addBookmark: withStoreErrorHandling(async (bookmark) => {
  // implementation
}, 'add bookmark')
```

**Benefits**:
- DRY principle
- Consistent error messages
- Centralized error handling logic
- Easier to add metrics/analytics

**Estimated effort**: 2-3 hours

---

### 4. Additional Custom Hooks

Extract repeated patterns into reusable hooks:

#### `useBookmarkActions`
```typescript
// Consolidates common bookmark operations
const useBookmarkActions = (bookmarkId: string) => ({
  toggle: () => toggleStarBookmark(bookmarkId),
  remove: () => removeBookmark(bookmarkId),
  moveTo: (collectionId) => addBookmarkToCollection(bookmarkId, collectionId),
})
```

#### `useCollectionNavigation`
```typescript
// Handles collection navigation with cleanup
const useCollectionNavigation = () => {
  const navigate = useNavigate()
  const setActive = useCollectionsStore(state => state.setActiveCollection)

  return useCallback((collectionId: string) => {
    setActive(collectionId)
    navigate(`/collection/${collectionId}`)
  }, [navigate, setActive])
}
```

**Benefits**:
- Reduces component complexity
- Encourages reuse
- Easier to test business logic
- Better separation of concerns

**Estimated effort**: 3-4 hours

---

## Low Priority

### 5. Barrel Exports

**Current state**: Components import from multiple files:
```typescript
import { BookmarkHeader } from '../BookmarkHeader'
import { BookmarkContent } from '../BookmarkContent'
import { BookmarkMedia } from '../BookmarkMedia'
// ... 5 more imports
```

**Recommendation**: Add barrel exports:
```typescript
// src/components/BookmarkCard/index.ts
export * from './BookmarkCard'
export * from './BookmarkHeader'
export * from './BookmarkContent'
// ... etc

// Usage:
import { BookmarkCard, BookmarkHeader, BookmarkContent } from '../BookmarkCard'
```

**Benefits**:
- Cleaner imports
- Easier refactoring
- Better encapsulation

**Estimated effort**: 1-2 hours

---

### 6. Standardize Import Ordering

**Current state**: Inconsistent import ordering across files

**Recommendation**: Add ESLint rule for import sorting:
```javascript
// .eslintrc.js
rules: {
  'import/order': ['error', {
    'groups': [
      'builtin',    // Node built-ins
      'external',   // npm packages
      'internal',   // Absolute imports
      'parent',     // ../
      'sibling',    // ./
      'index'       // ./index
    ],
    'newlines-between': 'always',
    'alphabetize': { 'order': 'asc' }
  }]
}
```

**Benefits**:
- Consistent codebase
- Easier to scan imports
- Reduces merge conflicts

**Estimated effort**: 1 hour (setup) + 30min (auto-fix)

---

### 7. Type Export Consolidation

**Current state**: Types scattered across component files

**Recommendation**: Consolidate related types:
```typescript
// src/types/bookmark.ts - Add exports for component prop types
export type BookmarkCardProps = { bookmark: Bookmark }
export type BookmarkHeaderProps = { bookmark: Bookmark; isSelected: boolean }
// ... etc
```

**Benefits**:
- Single source of truth
- Easier to find type definitions
- Better type reusability

**Estimated effort**: 2 hours

---

## Summary

**Total estimated effort**: 15-20 hours

**Recommended order**:
1. Fix test timing issues (blocks green CI)
2. Split large store files (improves developer experience)
3. Add error handling wrapper (improves reliability)
4. Create additional hooks (improves code reuse)
5. Lower priority items as time permits

**Notes**:
- All current functionality works correctly
- These are code quality improvements, not bug fixes
- Can be implemented incrementally
- Should not block launch
