# Post-Launch Improvements

This document contains recommended improvements to implement after the initial launch. These are categorized by priority and impact.

## Completed ✅

### 1. Fix Test Timing Issues in useInitializeApp.test.ts — ✅ Done (`aa6ad6b`)

**What was done**: Fixed 3 skipped tests by replacing `vi.useFakeTimers()` + `setTimeout` with `waitFor()` from `@testing-library/react`. Root cause was the hook's second useEffect syncing `hasExistingBookmarks` with the store's `bookmarks` array — tests needed to populate both localStorage and the store to prevent state override. All 33 tests now pass.

### 2. Split Large Store Files — ✅ Done (`b34dfdd`)

**What was done**: Split `bookmarkStore.ts` (1,425 lines) into 11 focused modules under `src/store/bookmark/`:

- `types.ts`, `initialState.ts`, `index.ts`
- `actions/crud.ts`, `dataManagement.ts`, `duplicates.ts`, `filters.ts`, `pagination.ts`, `presets.ts`, `ui.ts`, `validation.ts`

Original file becomes a re-export barrel — all 58+ import paths work unchanged.

### 3. Consolidate Error Handling — ✅ Done (`5c87fb3`)

**What was done**: Created `src/store/utils/handleStoreError.ts` — a generic utility that replaces 2 inconsistent patterns (createErrorHandler boilerplate vs logger.error + inline message) with a single call: `handleStoreError(set, error, 'operationName', opts)`. Consolidated 27 catch blocks across `crud.ts`, `dataManagement.ts`, `duplicates.ts`, `validation.ts`, and `collectionsStore.ts`. Net reduction of 166 lines of boilerplate.

### 4. Extract Custom Hooks — ✅ Done (`e516ed5`)

**What was done**:

- `useBookmarkActions(bookmarkId)` — returns memoized `toggleStar`, `remove`, `archive`, `unarchive`, `select`, `deselect`, `toggleSelection`. Uses `getState()` to avoid reactive subscriptions.
- `useCollectionNavigation()` — returns memoized `navigateToCollection(id)` that manages active state, clears selection, and navigates.
- Updated `BookmarkHeader`, `BookmarkActions`, and `CollectionsList` to use the new hooks.

---

## Remaining (Low Priority)

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

**Current state**: Inconsistent import ordering across files. Partially addressed by `@/` path aliases (`4e5abb2`, `018ddca`, `d10a1b3`).

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

### 7. Type Export Consolidation — ❌ Not Recommended

**Assessed**: 50 component prop interfaces across 36 files. All are co-located with their components and used exactly once (zero cross-file imports). Consolidating them would add maintenance overhead (update two files per component change) with no practical benefit. Co-located props interfaces are the React/TypeScript community standard.

---

## Summary

**Completed**: 4/7 items (all high and medium priority)
**Remaining**: 3 low-priority items (~4.5 hours total)
**Time invested**: ~12 hours across 4 sessions

**Notes**:

- All 1099 tests passing, TypeScript compiles cleanly
- All changes are backward compatible — no API surface changes
- Remaining items are nice-to-have cleanup, not blocking anything
