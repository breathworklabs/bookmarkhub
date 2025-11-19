# Unit Tests

This directory contains unit tests for the BookmarkHub application.

## Test Files

### App.test.tsx

Tests for the main `App` component, focusing on:

- **Extension sync handling**: Tests that the app properly handles bookmark sync messages from the Chrome extension
- **Global message listener**: Ensures the extension sync works from any screen (onboarding, demo, main app)
- **Component rendering**: Basic rendering tests for the app structure

#### Key Regression Tests

1. **Extension sync from onboarding screen** (`should reload page when extension syncs from onboarding screen`)
   - **Bug**: When user was on onboarding screen and ran the extension, the page didn't reload
   - **Root cause**: Message listener was only in `useInitializeApp` hook, which only runs when `AppContent` is rendered (i.e., when there are existing bookmarks)
   - **Fix**: Added global message listener in `App` component (src/App.tsx:28-48) that works regardless of which screen is displayed
   - **Test coverage**: Simulates extension sync completing while on onboarding screen and verifies page reloads

2. **Extension sync from demo screen** (`should reload page when extension syncs from demo screen`)
   - **Bug**: When user loaded demo data and then ran the extension, the page didn't reload to show the real imported bookmarks
   - **Root cause**: Same as above - message listener only existed in `AppContent`
   - **Fix**: Same global message listener fix
   - **Test coverage**: Simulates extension sync completing while viewing demo data and verifies page reloads

### useInitializeApp.test.ts

Tests for the `useInitializeApp` hook, covering:

- Initialization logic
- Performance monitoring
- Extension message handling (in `AppContent` context)
- Auto-sync functionality
- Bookmark validation
- Loading and error states

#### Notable Tests

- **Extension message handling**: Tests that the hook properly handles `X_BOOKMARKS_UPDATED` messages and reloads stores
- **Auto-sync**: Tests that the hook requests sync from extension on mount
- **Bookmark validation**: Tests that bookmarks are validated when they exist
- **Error handling**: Tests proper error handling and toast notifications

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unittests/App.test.tsx
npm test -- tests/unittests/useInitializeApp.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

## Test Coverage

Current test coverage:
- **App.test.tsx**: 12 tests (all passing)
- **useInitializeApp.test.ts**: 29 tests (26 passing, 3 skipped)
- **Total**: 41 tests (38 passing, 3 skipped)

## Skipped Tests

Some tests in `useInitializeApp.test.ts` are skipped because they require refactoring the hook to be more testable:
- `should detect existing bookmarks in localStorage`
- `should validate bookmarks when existing bookmarks exist`
- `should handle validation errors`

These tests are documented with skip reasons and can be enabled once the hook is refactored.

## Writing New Tests

When adding new features or fixing bugs, please:

1. **Add regression tests** for any bugs you fix
2. **Document the bug** in test comments (what was broken, why, how it was fixed)
3. **Test both happy paths and edge cases**
4. **Mock external dependencies** (localStorage, window.location, etc.)
5. **Clean up after tests** (use beforeEach/afterEach hooks)

### Example Regression Test Pattern

```typescript
/**
 * REGRESSION TEST: [Brief description of what this prevents]
 *
 * Bug: [Detailed description of the bug]
 *
 * Root cause: [Why the bug happened]
 *
 * Fix: [How it was fixed, reference to code]
 *
 * This test ensures [what this test guarantees].
 */
it('should [expected behavior]', () => {
  // Test implementation
})
```

## Dependencies

Tests use:
- **vitest**: Test runner
- **@testing-library/react**: React component testing utilities
- **@testing-library/react-hooks**: Hook testing utilities (deprecated, migrated to renderHook from @testing-library/react)

## CI/CD Integration

These tests run automatically on:
- Pull requests
- Pre-commit hooks (via husky)
- CI pipeline (GitHub Actions)

Ensure all tests pass before committing code.
