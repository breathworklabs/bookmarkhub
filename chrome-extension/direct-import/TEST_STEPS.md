# Testing Steps - BookmarkX Direct Import

## Step 1: Reload Extension

1. Go to `chrome://extensions/`
2. Find **BookmarkX - Twitter Bookmark Manager**
3. Click the **reload icon** (circular arrow)
4. Confirm no errors appear

## Step 2: Open Twitter Bookmarks

**Method A: Via Extension**

1. Click the BookmarkX extension icon in toolbar
2. Click "Import Bookmarks"
3. New tab opens to Twitter bookmarks

**Method B: Direct**

1. Navigate to `https://twitter.com/i/bookmarks` or `https://x.com/i/bookmarks`
2. Make sure you're logged in

## Step 3: Check Console

**IMPORTANT: Open DevTools IMMEDIATELY**

1. Press `F12` (or Cmd+Option+I on Mac)
2. Go to **Console** tab
3. Look for these messages:

```
✅ Expected to see:
[BookmarkX] Twitter extractor loaded
[BookmarkX] Showing start banner...
[BookmarkX] Banner added to DOM
[BookmarkX] Button found, adding listener
```

```
❌ If you don't see these:
- Extension didn't inject properly
- Try refreshing the page
- Check you're on /bookmarks URL
```

## Step 4: Look for Purple Banner

After 2 seconds, you should see:

```
┌─────────────────────────────┐
│ 📚 BookmarkX Ready         │
│                             │
│ Click below to start...     │
│                             │
│ [ Start Extraction ]        │
└─────────────────────────────┘
```

**Position:** Top-right corner of the page

**If you don't see it:**

1. Check console for errors
2. Scroll to top of page (banner might be off-screen)
3. Check z-index conflicts with other extensions
4. Try refreshing page

## Step 5: Click Start Extraction

Click the **"Start Extraction"** button

**What should happen:**

1. Banner disappears
2. New progress banner appears
3. Console shows:
   ```
   [BookmarkX] Button clicked!
   [BookmarkX] startExtraction called, isExtracting: false
   [BookmarkX] Starting extraction...
   [BookmarkX] Progress banner shown
   [BookmarkX] Starting auto-scroll...
   ```

**What you should see:**

```
┌─────────────────────────────┐
│ ⏳ Extracting Bookmarks... │
│                             │
│ Found X bookmarks           │
│ (scroll Y/10)               │
│ [████████░░░░] 80%          │
└─────────────────────────────┘
```

## Step 6: Watch It Scroll

The page should:

- ✅ Scroll down automatically every 2 seconds
- ✅ Load more bookmarks as it scrolls
- ✅ Update the counter in real-time
- ✅ Show progress bar filling up

**Console should show:**

```
[BookmarkX] Scrolling... Found 5 bookmarks so far
[BookmarkX] Progress updated: 5 bookmarks, scroll 1
[BookmarkX] Scrolling... Found 15 bookmarks so far
[BookmarkX] Progress updated: 15 bookmarks, scroll 2
[BookmarkX] Scrolling... Found 25 bookmarks so far
...
```

## Step 7: Completion

When finished (after 10 scrolls or reaching end):

**Console shows:**

```
[BookmarkX] Reached end of bookmarks
[BookmarkX] Extracting bookmark data...
[BookmarkX] Found X tweets
[BookmarkX] Extracted bookmark 1: @username
[BookmarkX] Extracted bookmark 2: @username
...
[BookmarkX] Extracted N unique bookmarks
```

**Completion banner appears:**

```
┌─────────────────────────────┐
│ ✓ Bookmarks Extracted!     │
│                             │
│ Successfully extracted      │
│ 50 bookmarks                │
│                             │
│ [ Open in BookmarkX ]       │
└─────────────────────────────┘
```

## Step 8: Verify Data Saved

**Check Chrome Storage:**

1. With DevTools open, go to **Application** tab
2. Expand **Local Storage**
3. Click on `chrome-extension://[extension-id]`
4. Look for `extractedBookmarks` key
5. Click to expand and view the data

**Expected format:**

```json
{
  "extractedBookmarks": [
    {
      "id": "1234567890",
      "username": "someuser",
      "displayName": "Some User",
      "text": "Tweet text...",
      "url": "https://twitter.com/someuser/status/1234567890",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "images": [],
      "profileImage": "https://...",
      "extractedAt": "2024-01-01T12:00:00.000Z"
    },
    ...
  ],
  "extractedAt": "2024-01-01T12:00:00.000Z"
}
```

## Troubleshooting

### Problem: No console messages at all

**Solution:**

1. Check you're on the bookmarks page (`/bookmarks` in URL)
2. Refresh the page
3. Check extension is enabled in `chrome://extensions/`
4. Check for conflicts with other extensions

### Problem: Banner appears but button doesn't work

**Solution:**

1. Check console for click event: `[BookmarkX] Button clicked!`
2. If no message, try clicking multiple times
3. Check for JavaScript errors in console
4. Try disabling other extensions
5. Check if button is behind something (CSS z-index)

### Problem: Scrolls but doesn't extract

**Solution:**

1. Check console for extraction messages
2. Verify tweets are visible on page
3. Try manually scrolling first to load some bookmarks
4. Check DOM selectors haven't changed (see TROUBLESHOOTING.md)

### Problem: Extracts 0 bookmarks

**Solution:**

1. Manually inspect a tweet element:
   - Right-click on a tweet → Inspect
   - Check if `article[data-testid="tweet"]` selector works
   - Check if `[data-testid="User-Name"]` exists
2. Twitter may have changed their HTML structure
3. See TROUBLESHOOTING.md for selector updates

### Problem: Only extracts 5-10 bookmarks

**Solution:**

1. Check how many tweets are actually loaded on the page
2. Manually scroll to load more first
3. Increase `MAX_SCROLL_ATTEMPTS` in code
4. Increase scroll delay from 2000 to 3000ms

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Start banner appears after 2 seconds
- [ ] Button click is registered in console
- [ ] Progress banner appears
- [ ] Page scrolls automatically
- [ ] Counter updates in real-time
- [ ] Progress bar animates
- [ ] Console shows scroll messages
- [ ] Extraction completes
- [ ] Completion banner appears
- [ ] Data saved to Chrome storage
- [ ] Can view data in Application tab
- [ ] "Open in BookmarkX" button works

## Success Criteria

✅ **Minimum viable test:**

- Extracts at least 10 bookmarks (if you have that many)
- Shows all 3 banners (start, progress, complete)
- Saves data to Chrome storage
- Console shows no errors

✅ **Full success:**

- Extracts all bookmarks (or up to 10 scroll attempts)
- Smooth scrolling animation
- Real-time progress updates
- Proper error handling
- Opens BookmarkX with import parameters

## Next Steps After Successful Test

1. Test with different bookmark counts (5, 50, 100+)
2. Test with bookmarks that have images
3. Test with bookmarks that have videos
4. Test "Open in BookmarkX" button
5. Verify BookmarkX can read the data
6. Test export/import flow end-to-end
