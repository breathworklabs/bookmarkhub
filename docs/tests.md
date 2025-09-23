## Test Coverage Overview

This document tracks current test coverage, key gaps, and the E2E plan.

### Current unit/integration tests (Vitest)
- `src/test/localStorage.test.ts`: Local storage service CRUD, search, settings, export/import, error handling.
- `src/test/collections.test.ts`, `src/test/collections-sidebar-archived-count.test.tsx`: Collections UI/state bits.
- `src/test/filters.test.ts`, `src/test/useFilteredBookmarks.test.ts`: Filtering logic and hook.
- `src/test/bookmark-card-compatibility.test.tsx`, `src/test/bookmark-loading.test.tsx`, `src/test/render-loop.test.tsx`: Rendering/compatibility/load behaviors.
- `src/test/archived-count-logic.test.ts`: Edge counter logic.
- `src/test/auth-flow.test.tsx`: Legacy auth flow (obsolete in local-first mode).
- NEW: `src/test/bookmarkStore-actions.test.ts`: `bookmarkStore` add/update/remove, star/archive.
- NEW: `src/test/collectionsStore-actions.test.ts`: `collectionsStore` create/update/delete, add/remove relations.

### Not covered yet (high-value)
- `bookmarkStore` pagination flags and `updateDisplayedBookmarks` behavior.
- Import/export flows from the store layer, and settings persistence from store to UI.
- `collectionsStore` bulk move and guardrails (cannot delete default collections) at UI level.
- `lib/localStorage` migration logic and smart collections filtering depth; metadata updates on CRUD.
- Hooks: `useInitializeApp`, `usePaginatedBookmarks`, `useIntersectionObserver`, `useClickOutside`.
- `lib/dataValidation` and `lib/xBookmarkTransform` thorough validation/transform tests.

### E2E/Integration plan (Playwright)
Scenarios to automate first:
1. App bootstrap states: onboarding (no data), error path, post-import main app.
2. View toggle persistence (list/grid) and multi-select bulk actions.
3. Drag & drop to collections; disallow drops on smart collections.
4. Infinite scroll: append items, no duplicates, `hasMore` flips.
5. Export/import round-trip: download JSON, import into clean profile, verify counts and relations.

Test infra decisions:
- Use Playwright with cross-browser runs and trace on failure.
- Seed/reset `localStorage` via `addInitScript` per test; keep small canonical fixtures.
- Prefer stable `data-testid` attributes for selectors in interactive UI.

Next steps:
- Add `data-testid` to: view toggle, bookmark card, checkbox, bulk bar, collection items (including smart ones), import/export buttons, onboarding CTA, drag targets.
- Unskip starter specs once test IDs are present.
