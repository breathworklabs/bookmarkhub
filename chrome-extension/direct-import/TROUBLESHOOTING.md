# Troubleshooting Guide - BookmarkHub Direct Import

## Common Issues and Solutions

### 1. "Extension doesn't scroll automatically"

**Symptoms:**

- Page doesn't scroll
- Only extracts a few bookmarks (5-10)
- No visible progress

**Solutions:**

**A. Look for the purple banner**
The extraction happens ON the Twitter page, not in the extension popup:

1. After clicking "Import Bookmarks", Twitter opens in a new tab
2. Wait 2 seconds - a **purple banner appears in top-right**
3. Click **"Start Extraction"** button in the banner
4. Watch it scroll automatically

**B. Check console logs**
Open DevTools on Twitter page (F12):

```
Look for: [BookmarkHub] Twitter extractor loaded
If missing: Extension didn't inject properly
```

**C. Refresh the page**

1. Go to `twitter.com/i/bookmarks`
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Wait for banner to appear

---

### 2. "I don't see the extracted bookmarks"

**Symptoms:**

- Banner says "5 bookmarks extracted"
- Can't find them in BookmarkHub
- Not sure where they went

**Solutions:**

**A. Check Chrome Storage**

1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **Local Storage** → `chrome-extension://[id]`
4. Look for `extractedBookmarks` key
5. Click to view the data

**B. Click "Open in BookmarkHub" button**
The bookmarks are saved, but you need to:

1. Look for completion banner on Twitter page
2. Click **"Open in BookmarkHub"** button
3. BookmarkHub opens with import parameters

**C. Manual import**
If button doesn't work:

1. Copy data from Chrome Storage (see A above)
2. Open BookmarkHub manually
3. Go to Settings → Import
4. Paste the JSON data

---

### 3. "Extension doesn't appear/load"

**Symptoms:**

- No extension icon in toolbar
- Can't find in chrome://extensions/
- Manifest errors

**Solutions:**

**A. Check icon files exist**

```bash
ls chrome-extension/direct-import/assets/
# Should see: icon-16.png, icon-48.png, icon-128.png
```

**B. Reload extension**

1. Go to `chrome://extensions/`
2. Find BookmarkHub extension
3. Click the **reload icon** (circular arrow)

**C. Check for errors**

1. Go to `chrome://extensions/`
2. Look for red "Errors" button
3. Click to see details
4. Common issues:
   - Missing icon files
   - Invalid manifest.json
   - Permission errors

---

### 4. "Only extracts 5-10 bookmarks"

**Symptoms:**

- Have 100+ bookmarks
- Only 5-10 extracted
- Scroll stops too early

**Solutions:**

**A. Increase scroll attempts**
Edit `content-scripts/twitter-extractor.js`:

```javascript
// Line 9: Change from 10 to 20 or more
const MAX_SCROLL_ATTEMPTS = 20
```

**B. Slow down scrolling**
Edit `content-scripts/twitter-extractor.js`:

```javascript
// Line 166: Increase delay from 2000 to 3000
setTimeout(autoScroll, 3000) // 3 seconds between scrolls
```

**C. Manual scroll first**

1. Go to Twitter bookmarks
2. Manually scroll down to load ~50 bookmarks
3. Then click "Start Extraction"
4. It will continue from there

---

### 5. "Content script not injecting"

**Symptoms:**

- No banner appears on Twitter
- Console shows no [BookmarkHub] logs
- Nothing happens

**Solutions:**

**A. Check you're on the right page**
Must be on: `twitter.com/i/bookmarks` or `x.com/i/bookmarks`
Not: `twitter.com/home` or other pages

**B. Check permissions**
In `chrome://extensions/` → BookmarkHub → Details:

- "Site access" should be "On all sites" or "On specific sites"
- Add `twitter.com` and `x.com` if restricted

**C. Manual injection**

1. Go to Twitter bookmarks page
2. Open DevTools (F12) → Console
3. Copy-paste the content of `content-scripts/twitter-extractor.js`
4. Press Enter

---

### 6. "Bookmarks extracted but not showing in BookmarkHub"

**Symptoms:**

- Extraction successful
- BookmarkHub opens but empty
- No import prompt

**Solutions:**

**A. Check URL parameters**
BookmarkHub should open with:

```
http://localhost:5173?import=twitter&count=50
```

If not, the background script didn't trigger correctly.

**B. Check background script logs**

1. Go to `chrome://extensions/`
2. Find BookmarkHub
3. Click "Service worker"
4. Check for errors

**C. Implement import handler in BookmarkHub**
The main app needs to:

```javascript
// In BookmarkHub app
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('import') === 'twitter') {
    // Request data from extension
    chrome.storage.local.get(['extractedBookmarks'], (result) => {
      // Import the bookmarks
      importBookmarks(result.extractedBookmarks)
    })
  }
}, [])
```

---

### 7. "Twitter's DOM changed - selectors not working"

**Symptoms:**

- Extracts 0 bookmarks
- Console shows "Found 0 tweets"
- Twitter updated their HTML

**Solutions:**

**A. Inspect current selectors**

1. Open Twitter bookmarks page
2. Open DevTools (F12) → Elements
3. Check if these selectors still work:
   - `article[data-testid="tweet"]` - Tweet container
   - `[data-testid="User-Name"]` - Username
   - `[data-testid="tweetText"]` - Tweet text

**B. Update selectors**
Edit `content-scripts/twitter-extractor.js` with new selectors:

```javascript
// Line 182: Update tweet selector
const tweets = document.querySelectorAll('article[data-testid="tweet"]')

// Line 215: Update username selector
const usernameElement = tweetElement.querySelector(
  '[data-testid="User-Name"] a[role="link"]'
)
```

**C. Use fallback selectors**
Try multiple selectors:

```javascript
const usernameElement =
  tweetElement.querySelector('[data-testid="User-Name"] a') ||
  tweetElement.querySelector('a[href^="/"][role="link"]') ||
  tweetElement.querySelector('[dir="ltr"] a')
```

---

## Debug Mode

To see detailed logs:

### 1. Enable Verbose Logging

```javascript
// Add to start of content-scripts/twitter-extractor.js
const DEBUG = true
function log(...args) {
  if (DEBUG) console.log('[BookmarkHub DEBUG]', ...args)
}
```

### 2. Monitor All Events

```javascript
// Add listeners
window.addEventListener('scroll', () => log('Scroll event'))
chrome.runtime.onMessage.addListener((msg) => log('Message:', msg))
```

### 3. Export Debug Data

```javascript
// In console after extraction
chrome.storage.local.get(null, (data) => {
  console.log('All storage:', data)
  copy(JSON.stringify(data, null, 2)) // Copies to clipboard
})
```

---

## Performance Issues

### Extension is slow

**A. Reduce scroll speed**

```javascript
// Line 166: Increase timeout
setTimeout(autoScroll, 3000) // Slower = more reliable
```

**B. Process in batches**

```javascript
// Extract bookmarks in chunks
const BATCH_SIZE = 50
tweets.slice(0, BATCH_SIZE).forEach(extractTweetData)
```

**C. Disable animations**

```javascript
// Line 160: Remove smooth scroll
scrollableElement.scrollBy({ top: 1000 }) // Remove behavior: 'smooth'
```

---

## Still Having Issues?

### 1. Check Extension Console

```
chrome://extensions/ → BookmarkHub → "Errors" button
```

### 2. Check Background Worker

```
chrome://extensions/ → BookmarkHub → "Service worker"
```

### 3. Check Twitter Page Console

```
F12 on twitter.com/i/bookmarks → Console tab
```

### 4. Verify All Files Exist

```bash
cd chrome-extension/direct-import
ls -R
# Should see all files listed in README.md
```

### 5. Test with Sample Data

Create test bookmarks:

```javascript
// In DevTools console
chrome.storage.local.set(
  {
    extractedBookmarks: [
      {
        id: '123',
        username: 'test',
        displayName: 'Test User',
        text: 'Test bookmark',
        url: 'https://twitter.com/test/status/123',
        timestamp: new Date().toISOString(),
        images: [],
        profileImage: '',
      },
    ],
  },
  () => console.log('Test data saved')
)
```

---

## Getting Help

If none of these solutions work:

1. **Check Chrome version**: Needs Chrome 88+
2. **Check Manifest V3 support**: Should be enabled by default
3. **Try incognito mode**: Rules out conflicts with other extensions
4. **Disable other extensions**: May conflict with BookmarkHub
5. **Clear extension data**: Remove and reinstall

## Reporting Bugs

Include:

- Chrome version
- Extension version
- Console logs from Twitter page
- Console logs from background worker
- Steps to reproduce
- Screenshots of error messages
