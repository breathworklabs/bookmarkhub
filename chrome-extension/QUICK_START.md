# Quick Start Guide - BookmarkHub Chrome Extensions

## TL;DR

**Use `direct-import/` for Chrome Web Store submission** ✅

## 5-Minute Setup

### 1. Load Extension in Chrome

```bash
# Open Chrome
chrome://extensions/

# Enable "Developer mode" (top-right)
# Click "Load unpacked"
# Select: /path/to/bookmarksx/chrome-extension/direct-import/
```

### 2. Test the Extension

1. Click the BookmarkHub extension icon in Chrome toolbar
2. Click "Import Bookmarks" button
3. Twitter bookmarks page opens automatically
4. Extension auto-scrolls and extracts bookmarks
5. Click "Open in BookmarkHub" when done
6. Your bookmarks are imported! 🎉

### 3. Verify It Works

```bash
# Start BookmarkHub locally
cd bookmarksx
npm run dev

# Chrome DevTools → Application → Storage → Local Storage
# Look for: extractedBookmarks
```

## What Just Happened?

```
User clicks "Import"
    ↓
Opens twitter.com/i/bookmarks
    ↓
Content script injected
    ↓
Auto-scrolls page
    ↓
Extracts DOM elements
    ↓
Saves to Chrome storage
    ↓
Opens BookmarkHub with params
    ↓
BookmarkHub reads storage
    ↓
Imports bookmarks ✓
```

## File Overview

```
direct-import/
├── manifest.json           # Extension config (permissions, version)
├── popup/
│   ├── popup.html         # UI when clicking extension icon
│   ├── popup.js           # "Import" button logic
│   └── popup.css          # Pretty styling
├── content-scripts/
│   └── twitter-extractor.js  # Extracts tweets from DOM
├── background/
│   └── service-worker.js  # Handles messages, storage
└── assets/
    └── icon-*.png         # Extension icons
```

## Key Code Points

### 1. Popup Opens Twitter (`popup.js:20`)

```javascript
chrome.tabs.create({
  url: 'https://twitter.com/i/bookmarks',
  active: true,
})
```

### 2. Content Script Extracts (`twitter-extractor.js:50`)

```javascript
const tweets = document.querySelectorAll('article[data-testid="tweet"]')
// Extract data from each tweet
```

### 3. Background Saves (`service-worker.js:15`)

```javascript
chrome.storage.local.set({
  extractedBookmarks: bookmarks,
  extractedAt: new Date().toISOString(),
})
```

### 4. Opens BookmarkHub (`service-worker.js:30`)

```javascript
chrome.tabs.create({
  url: `http://localhost:5173?import=twitter&count=${count}`,
})
```

## Before Chrome Web Store Submission

### 1. Update Production URL

**In `popup/popup.js`:**

```javascript
// Change from:
const BOOKMARKX_URL = 'http://localhost:5173'

// To:
const BOOKMARKX_URL = 'https://bookmarksx.vercel.app'
```

**In `background/service-worker.js`:**

```javascript
// Change from:
const BOOKMARKX_URL = 'http://localhost:5173'

// To:
const BOOKMARKX_URL = 'https://bookmarksx.vercel.app'
```

### 2. Test Production Build

```bash
# Build BookmarkHub for production
npm run build

# Test extension with production URL
# Load extension in Chrome
# Try import flow
```

### 3. Prepare Store Assets

- [ ] Create 1280x800 promotional image
- [ ] Create 440x280 small promotional tile
- [ ] Take 1280x800 screenshots (at least 1, max 5)
- [ ] Write privacy policy
- [ ] Write detailed description

### 4. Package Extension

```bash
cd chrome-extension/direct-import
zip -r bookmarkhub-extension.zip . -x "*.DS_Store" -x "__MACOSX"
```

### 5. Submit to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item"
3. Upload `bookmarkhub-extension.zip`
4. Fill in store listing details
5. Submit for review

## Debugging Tips

### Extension Not Working?

**Check popup console:**

```bash
Right-click extension icon → Inspect popup
# Look for errors in Console tab
```

**Check service worker:**

```bash
chrome://extensions/
# Find BookmarkHub extension
# Click "Service worker"
# View logs
```

**Check content script:**

```bash
# Go to twitter.com/i/bookmarks
# Open DevTools (F12)
# Look for logs: [BookmarkHub] ...
```

### No Bookmarks Extracted?

1. **Check you're logged into Twitter**
2. **Ensure on correct page**: `twitter.com/i/bookmarks` or `x.com/i/bookmarks`
3. **Manually scroll** to load some bookmarks first
4. **Check console** for error messages
5. **Refresh page** and try again

### BookmarkHub Not Opening?

1. **Check BOOKMARKX_URL** is correct
2. **Verify BookmarkHub is running** at that URL
3. **Check Chrome storage**: DevTools → Application → Local Storage
4. **Look for**: `extractedBookmarks` key

## Common Modifications

### Change Auto-Scroll Speed

**In `content-scripts/twitter-extractor.js:60`:**

```javascript
// Slower (more reliable):
setTimeout(autoScroll, 3000) // 3 seconds

// Faster (may miss bookmarks):
setTimeout(autoScroll, 1000) // 1 second
```

### Change Scroll Threshold

**In `content-scripts/twitter-extractor.js:12`:**

```javascript
// More scrolls (get more bookmarks):
const MAX_SCROLL_ATTEMPTS = 10

// Fewer scrolls (finish faster):
const MAX_SCROLL_ATTEMPTS = 3
```

### Add More Data Fields

**In `content-scripts/twitter-extractor.js:100`:**

```javascript
return {
  id: tweetId,
  username: username,
  // Add more fields:
  likes: extractLikes(tweetElement),
  retweets: extractRetweets(tweetElement),
  replies: extractReplies(tweetElement),
}
```

## Next Steps

1. ✅ **Test locally** - Make sure import works
2. ✅ **Update URLs** - Change to production
3. ✅ **Prepare assets** - Icons, screenshots, descriptions
4. ✅ **Submit to store** - Chrome Web Store Developer Dashboard
5. ✅ **Wait for review** - Usually 1-3 days
6. ✅ **Publish** - Go live! 🚀

## Help & Support

- **Extension issues**: See [direct-import/README.md](./direct-import/README.md)
- **Chrome Web Store**: [Developer Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- **Manifest V3**: [Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- **BookmarkHub**: See [main README](../README.md)

## FAQ

**Q: Do I need to rebuild BookmarkHub?**
A: No! The extension works with your existing BookmarkHub build.

**Q: Will this work with x.com?**
A: Yes! It works with both twitter.com and x.com domains.

**Q: Can users without the extension use BookmarkHub?**
A: Yes! The extension is just one import method. Users can still manually import JSON files.

**Q: How often should I update the extension?**
A: Update when:

- Twitter's DOM structure changes
- You add new features
- Chrome releases major updates

**Q: Can I monetize the extension?**
A: Follow Chrome Web Store's monetization policies. Keep it free initially for better adoption.

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Web Store](https://chrome.google.com/webstore/devconsole)
- [Twitter's Public API](https://developer.twitter.com/en/docs)

---

**Ready to ship?** Follow the checklist above and you'll have your extension live in no time! 🚀
