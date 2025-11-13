# BookmarkHub Extension Tests

## Quick Start

### Option 1: Visual Test Page (Easiest)

1. **Open the test page:**

   ```bash
   open test/test.html
   ```

   Or drag `test.html` into Chrome

2. **Click the test buttons:**
   - "Basic Extraction" - Tests 10 bookmarks
   - "Medium Test" - Tests 50 bookmarks
   - "Large Test" - Tests 100 bookmarks

3. **Check results** in the console on the page

### Option 2: Browser Console Tests

1. **Load extension** in Chrome (`chrome://extensions/`)

2. **Open any webpage** and press F12 (DevTools)

3. **Copy and paste** `test-mode.js` into console

4. **Run tests:**
   ```javascript
   testExtraction(50) // Test with 50 fake bookmarks
   testScroll() // Test scroll functionality
   cleanup() // Remove test elements
   ```

### Option 3: Automated Playwright Tests

1. **Install dependencies:**

   ```bash
   cd test
   npm install
   npx playwright install chromium
   ```

2. **Run tests:**
   ```bash
   npm test                # Run all tests
   npm run test:headed     # Run with visible browser
   npm run test:ui         # Run with Playwright UI
   npm run test:debug      # Run in debug mode
   ```

## Test Files

- **`test.html`** - Visual test page with buttons
- **`test-mode.js`** - Console test script (copy/paste)
- **`playwright.test.js`** - Automated E2E tests
- **`package.json`** - Test dependencies

## What Gets Tested

### Extraction Logic

- ✅ Finds tweet elements with correct selector
- ✅ Extracts username, text, URL correctly
- ✅ Handles missing data gracefully
- ✅ Deduplicates tweets
- ✅ Works with 10, 50, 100+ bookmarks

### Storage

- ✅ Saves to `chrome.storage.local`
- ✅ Proper data format
- ✅ Timestamp included

### Message Passing

- ✅ Content script → Background script
- ✅ Background script responds
- ✅ Error handling

### Scroll (TODO)

- ⏳ Auto-scroll triggers
- ⏳ Detects new content
- ⏳ Stops when no more content

## Example Test Output

```
=== BOOKMARKX TEST MODE ===
Testing extraction with 50 fake bookmarks

[TEST] Creating 50 fake tweet elements
[TEST] Created 50 fake tweets in DOM
[TEST] Running extraction...
[TEST] Found 50 tweet elements

=== TEST RESULTS ===
✅ Extracted: 50/50 bookmarks
Success rate: 100.0%

Sample bookmark: {
  id: "1234567890",
  username: "elonmusk",
  displayName: "Elon Musk",
  text: "This is a test tweet about AI and the future",
  url: "https://twitter.com/elonmusk/status/1234567890",
  timestamp: "2024-01-01T12:00:00.000Z"
}

✅ ALL TESTS PASSED!
✅ Saved 50 bookmarks to storage
```

## Debugging Failed Tests

### Test fails with "Expected 50, got 0"

**Problem:** Selectors don't match fake elements

**Solution:** Check that fake tweet HTML matches real Twitter structure:

```javascript
// In test-mode.js, check these selectors:
article[data-testid="tweet"]              // Tweet container
[data-testid="User-Name"]                 // Username section
[data-testid="tweetText"]                 // Tweet text
a[href*="/status/"]                       // Tweet link
```

### Test fails with "chrome is not defined"

**Problem:** Not running in extension context

**Solution:**

- Load extension first in `chrome://extensions/`
- Or use test.html which simulates without chrome API

### Extraction works in tests but not on real Twitter

**Problem:** Real Twitter has different HTML structure

**Solution:**

1. Inspect real tweet on Twitter
2. Update selectors in `twitter-extractor.js`
3. Update test HTML to match
4. Re-run tests

## Adding New Tests

### Add a new test to test.html:

```javascript
function testNewFeature() {
  log('Testing new feature...', 'info')

  // Your test code here

  log('✅ Test passed', 'success')
}
```

Add button:

```html
<button onclick="testNewFeature()">Test New Feature</button>
```

### Add Playwright test:

```javascript
test('new feature works', async () => {
  await page.goto(TEST_PAGE)

  // Test actions
  await page.click('button:has-text("Test New Feature")')
  await page.waitForTimeout(1000)

  // Assertions
  const result = await page.locator('#console').textContent()
  expect(result).toContain('Test passed')
})
```

## CI/CD Integration

Add to GitHub Actions:

```yaml
- name: Test Chrome Extension
  run: |
    cd chrome-extension/direct-import/test
    npm install
    npx playwright install chromium
    npm test
```

## Troubleshooting

**Q: Tests pass but real Twitter extraction fails?**

A: Twitter's HTML structure changed. Update selectors.

**Q: Can I test without Twitter account?**

A: Yes! Use test.html or test-mode.js with fake data.

**Q: How do I test the actual scroll behavior?**

A: Use test.html with a scrollable container, or manually test on Twitter.

**Q: Tests are slow?**

A: Adjust timeouts in playwright.test.js. Default is 2-3 seconds per test.

## Next Steps

1. ✅ Run `test.html` to verify extraction logic works
2. ✅ Fix any failing tests
3. ⏳ Test on real Twitter with console open
4. ⏳ Compare results: tests vs. real Twitter
5. ⏳ Update selectors if needed
6. ⏳ Add scroll tests
