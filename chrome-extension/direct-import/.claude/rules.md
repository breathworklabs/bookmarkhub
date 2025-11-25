# Direct Import Extension Rules

## Testing Requirements

After making any changes to files in the `chrome-extension/direct-import/` directory, you MUST run the extension tests to verify nothing is broken.

### How to Run Tests

```bash
cd chrome-extension/direct-import/test
npm test
```

Or run specific test suites:
- `npm run test:popup` - Popup UI tests
- `npm run test:storage` - Chrome storage tests
- `npm run test:bridge` - Bridge tests (requires dev server running)
- `npm run test:integration` - Integration tests

### Test Requirements

- **Popup, Storage, Integration tests**: Can run standalone
- **Bridge tests**: Require the dev server (`npm run dev` from project root)

### What to Test After Changes

| Changed File | Run Tests |
|--------------|-----------|
| `popup/*` | `npm run test:popup` |
| `background/*` | `npm run test:storage` |
| `content-scripts/bookmarkhub-bridge.js` | `npm run test:bridge` |
| `content-scripts/twitter-api-client.js` | `npm run test:integration` |
| `config.js`, `manifest.json` | `npm test` (all tests) |

### Before Committing

Ensure all tests pass before committing changes to the extension:

```bash
cd chrome-extension/direct-import/test && npm test
```

All 35 tests should pass (bridge tests may be skipped if dev server is not running).

## Packaging for Chrome Web Store

When creating a zip file for the extension:

- **Do NOT use multiple dots in the filename** - Chrome Web Store validation will reject it
- Use hyphens instead of dots for version numbers
- Example: `bookmarkhub-extension-v1-0-0.zip` (correct) vs `bookmarkhub-extension-v1.0.0.zip` (incorrect)

```bash
cd chrome-extension/direct-import
zip -r ../bookmarkhub-extension-v1-0-0.zip . \
  -x "*.DS_Store" \
  -x "test/*" \
  -x ".claude/*" \
  -x "*.zip"
```
