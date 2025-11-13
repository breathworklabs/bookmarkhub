# BookmarkHub Chrome Extension - Direct Import Version

This version of the BookmarkHub Chrome extension uses the **direct DOM extraction** approach to import Twitter/X bookmarks. This is the recommended version for Chrome Web Store submission.

## How It Works

1. **User clicks "Import Bookmarks"** in the extension popup
2. **Extension opens Twitter's bookmarks page** (`https://twitter.com/i/bookmarks`)
3. **Content script auto-scrolls** to load all bookmarks
4. **Extracts bookmark data** from the loaded DOM elements
5. **Saves to Chrome storage** and opens BookmarkHub with imported data

## Technical Approach

### Content Script (`content-scripts/twitter-extractor.js`)

- Detects when on Twitter bookmarks page
- Auto-scrolls to load all bookmarks
- Extracts tweet data from DOM elements:
  - Tweet ID, URL, text
  - Username, display name, profile image
  - Tweet images/videos
  - Timestamps
- Removes duplicates
- Shows completion banner

### Background Service Worker (`background/service-worker.js`)

- Listens for extraction completion
- Saves bookmarks to `chrome.storage.local`
- Opens BookmarkHub app with import parameters
- Handles tab updates for injection

### Popup (`popup/popup.html`, `popup.js`, `popup.css`)

- Clean, user-friendly interface
- "Import Bookmarks" button
- "Open BookmarkHub" button
- Progress tracking
- Status messages

## Installation

### For Development

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `chrome-extension/direct-import` folder
5. The extension icon should appear in your toolbar

### For Testing

1. Click the BookmarkHub extension icon
2. Click "Import Bookmarks"
3. Wait for Twitter bookmarks page to open
4. The extension will auto-scroll and extract
5. When complete, click "Open in BookmarkHub"
6. Your bookmarks will be imported

## Chrome Web Store Submission

This version is designed to pass Chrome Web Store review because:

✅ **Provides real value**: Extracts and organizes Twitter bookmarks better than native Twitter
✅ **Transparent functionality**: Clear UI showing what it does
✅ **Privacy-focused**: All processing happens locally, no data sent to servers
✅ **Proper permissions**: Only requests necessary permissions
✅ **No deception**: Honest description of functionality

### Required Permissions

```json
"permissions": [
  "scripting",  // To inject content script
  "tabs",       // To create/manage tabs
  "storage",    // To save extracted bookmarks
  "activeTab"   // To interact with current tab
],
"host_permissions": [
  "*://twitter.com/*",
  "*://x.com/*"
]
```

### Manifest V3 Compliance

- ✅ Uses Manifest V3
- ✅ Service worker instead of background page
- ✅ Declarative permissions
- ✅ Content Security Policy compliant

## File Structure

```
chrome-extension/direct-import/
├── manifest.json              # Extension manifest
├── popup/
│   ├── popup.html            # Extension popup UI
│   ├── popup.js              # Popup logic
│   └── popup.css             # Popup styles
├── content-scripts/
│   └── twitter-extractor.js  # Twitter page DOM extractor
├── background/
│   └── service-worker.js     # Background service worker
├── assets/
│   ├── icon-16.png          # Extension icons
│   ├── icon-48.png
│   └── icon-128.png
└── README.md                 # This file
```

## Extracted Bookmark Format

Each bookmark is saved with:

```javascript
{
  id: "1234567890",              // Tweet ID
  username: "username",          // Twitter handle
  displayName: "Display Name",   // User's display name
  text: "Tweet content...",      // Tweet text
  url: "https://twitter.com/...", // Full tweet URL
  timestamp: "2024-01-01T12:00:00Z", // ISO timestamp
  images: ["url1", "url2"],      // Array of image URLs
  profileImage: "url",           // User profile image
  extractedAt: "2024-01-01T12:00:00Z" // When extracted
}
```

## Integration with BookmarkHub App

The extension saves bookmarks to `chrome.storage.local` and opens BookmarkHub with URL parameters:

```
http://localhost:5173?import=twitter&count=150
```

The BookmarkHub app should:

1. Detect the `import=twitter` parameter
2. Request bookmark data from Chrome storage via message passing
3. Parse and import the bookmarks
4. Show success message with count

## Development Notes

### Testing Locally

1. Make sure BookmarkHub is running on `localhost:5173`
2. Update `BOOKMARKX_URL` in `popup.js` and `service-worker.js` if using different port
3. Load the extension in Chrome
4. Test the import flow

### Debugging

- Open DevTools for popup: Right-click extension icon → "Inspect popup"
- View service worker logs: `chrome://extensions/` → "Service worker" link
- View content script logs: DevTools on Twitter bookmarks page

### Common Issues

**Extension not injecting on Twitter:**

- Check that you're on `twitter.com/i/bookmarks` or `x.com/i/bookmarks`
- Check console for injection errors
- Try refreshing the page

**No bookmarks extracted:**

- Ensure you've scrolled to load bookmarks
- Check Twitter's DOM structure hasn't changed
- View console logs for errors

**BookmarkHub not receiving data:**

- Check `chrome.storage.local` in DevTools
- Verify BOOKMARKX_URL is correct
- Check CORS settings if needed

## Future Enhancements

- [ ] Settings page for configuration
- [ ] Customizable filters (date range, specific users)
- [ ] Export to different formats (JSON, CSV)
- [ ] Incremental sync (only new bookmarks)
- [ ] Bookmark tagging during import
- [ ] Support for Twitter Lists and Likes

## Security & Privacy

- ✅ All data processing happens locally
- ✅ No external servers contacted
- ✅ No analytics or tracking
- ✅ User data never leaves their browser
- ✅ Open source and auditable

## License

Same as BookmarkHub project

## Support

For issues or questions:

1. Check the [main README](../../README.md)
2. Review the [Chrome extension docs](https://developer.chrome.com/docs/extensions/)
3. Open an issue on GitHub
