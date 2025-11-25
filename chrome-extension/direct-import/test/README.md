# BookmarkHub Extension E2E Tests

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:popup       # Popup UI tests
npm run test:storage     # Chrome storage tests
npm run test:bridge      # Bridge content script tests (requires dev server)
npm run test:integration # Full integration tests

# Interactive mode
npm run test:ui
npm run test:debug
```

## Test Suites

### Popup Tests (`tests/popup.spec.js`) - 8 tests
- Popup loads without errors
- UI elements render correctly
- Import button opens Twitter bookmarks
- Open app button works
- Status messages display
- Progress bar behavior

### Storage Tests (`tests/storage.spec.js`) - 8 tests
- Save/retrieve bookmarks from chrome.storage
- Empty storage handling
- Service worker message handling (GET_EXTRACTED_BOOKMARKS, EXTRACTION_COMPLETE)
- Data integrity through storage cycle

### Bridge Tests (`tests/bridge.spec.js`) - 7 tests
**Note**: These tests require the dev server to be running:
```bash
# From project root
npm run dev
```

- Extension detection ping/response
- Bookmark sync to localStorage
- Duplicate handling (skip, replace, keep-both)
- hasBeenCleared flag behavior
- lastImportSource flag behavior
- Storage cleanup after sync

### Integration Tests (`tests/integration.spec.js`) - 12 tests
- Full extraction flow with mock data
- Bookmark transformation validation
- Hashtag extraction
- Media URL extraction
- Engagement metrics
- Large dataset handling (100 bookmarks)

## Files

```
test/
├── package.json              # Test dependencies and scripts
├── playwright.config.js      # Playwright configuration
├── tests/
│   ├── popup.spec.js         # Popup UI tests
│   ├── storage.spec.js       # Chrome storage tests
│   ├── bridge.spec.js        # Bridge content script tests
│   └── integration.spec.js   # Full integration tests
├── fixtures/
│   └── mock-bookmarks.js     # Mock data generators
├── test.html                 # Manual test page
└── test-mode.js              # Console test utilities
```

## Manual Testing

### Interactive Test Page

1. Load the extension in Chrome (chrome://extensions → Load unpacked)
2. Open `test.html` in Chrome
3. Use the buttons to run different extraction tests
4. Check the test console for results

### Console Testing

1. Open any page in Chrome with the extension loaded
2. Open DevTools Console (F12)
3. Copy/paste `test-mode.js` contents into console
4. Use the available commands:
   - `testExtraction(50)` - Test extraction with 50 fake bookmarks
   - `testScroll()` - Test scroll functionality
   - `cleanup()` - Remove test elements

## Requirements

- Node.js 18+
- Chrome browser (extension tests require headed mode)
- Dev server running for bridge tests (`npm run dev` from project root)

## CI/CD Integration

Add to GitHub Actions:

```yaml
- name: Test Chrome Extension
  run: |
    cd chrome-extension/direct-import/test
    npm install
    npx playwright install chromium
    npm test -- tests/popup.spec.js tests/storage.spec.js tests/integration.spec.js
```

Note: Bridge tests require the dev server and are skipped in CI.

## Troubleshooting

**Q: Bridge tests are skipped?**
A: Start the dev server with `npm run dev` from the project root.

**Q: Tests pass but real Twitter extraction fails?**
A: Twitter's HTML structure may have changed. Update selectors in `twitter-api-client.js`.

**Q: Tests are slow?**
A: Extension tests must run in headed mode. Consider running only specific test files.

**Q: "chrome is not defined" error?**
A: The test is running outside extension context. Use `chrome-extension://` URLs for chrome API access.
