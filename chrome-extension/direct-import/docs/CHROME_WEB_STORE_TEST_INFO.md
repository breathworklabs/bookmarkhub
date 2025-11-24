# Chrome Web Store - Test Information

## Test Account Information

**Note:** This extension requires a Twitter/X account with existing bookmarks to properly test. Reviewers can use their own Twitter account or create a test account.

### Option 1: Use Reviewer's Own Twitter Account
- No test credentials needed
- Reviewer can test with their own Twitter bookmarks
- All data stays local to their browser

### Option 2: Create Test Twitter Account
If reviewer needs a test account:
1. Go to twitter.com or x.com
2. Create a free account
3. Save a few tweets as bookmarks (click bookmark icon on any tweet)
4. Navigate to twitter.com/i/bookmarks

---

## Testing Instructions

### Step 1: Install the Extension
1. Install the BookmarkHub extension from the Chrome Web Store
2. Click the extension icon in the toolbar to open the popup
3. Verify the popup displays with "Import Your Bookmarks" heading

### Step 2: Navigate to Twitter Bookmarks
**Option A - From Extension Popup:**
1. Click "Import Bookmarks" button in the popup
2. Extension will automatically open twitter.com/i/bookmarks

**Option B - Manual Navigation:**
1. Go to twitter.com/i/bookmarks (or x.com/i/bookmarks)
2. Make sure you're logged into a Twitter account with some saved bookmarks

### Step 3: Start Import Process
1. On the Twitter bookmarks page, a purple banner will appear in the top-right corner
2. The banner shows "Import Your Bookmarks" with extension icon
3. Click the "Start Import" button on the banner
4. The banner will change to show progress: "Fetching Bookmarks..."
5. Progress bar and bookmark count will update in real-time

### Step 4: Complete Import
1. Once fetching completes, banner turns green: "✓ X Bookmarks Ready"
2. Click "Import into BookmarkHub" button
3. Extension will open bookmarkhub.app (or localhost:5173 in dev mode)
4. Bookmarks will automatically sync to the BookmarkHub web app
5. A success toast notification will appear
6. Page will refresh to show imported bookmarks

### Step 5: Verify Extension Popup States
1. Click the extension icon again
2. Status should show "Last import: X bookmarks on [date/time]"
3. Click the × button on the "How it works" info box
4. Verify the popup compacts properly without white space

---

## Expected Behavior

### ✅ What Should Happen:
- Extension only activates on twitter.com/x.com bookmarks page
- Purple banner appears automatically on the bookmarks page
- Import progress is visible with real-time updates
- Bookmarks are extracted using Twitter's API (fast, no scrolling needed)
- Success banner appears when extraction completes
- BookmarkHub web app opens with imported bookmarks
- All data stays local (no external server communication)

### ❌ What Should NOT Happen:
- Extension should NOT appear on other websites
- Extension should NOT access data from non-Twitter pages
- Extension should NOT send data to external servers
- Extension should NOT track browsing history
- Extension should NOT modify Twitter's UI (only adds overlay banner)

---

## Minimum Test Requirements

**To verify core functionality:**
1. Twitter account with at least 5-10 bookmarks
2. Active internet connection (to access Twitter API)
3. Chrome browser version 88 or higher

**Estimated test time:** 2-3 minutes

---

## DEV_MODE Configuration

The submitted extension has `DEV_MODE = false` in config.js, which means:
- ✅ Redirects to production URL: `https://bookmarkhub.app`
- ✅ No localhost references
- ✅ Ready for public use

If reviewer needs to verify local development setup:
1. Change `DEV_MODE = true` in config.js
2. Redirects will go to `https://localhost:5173` instead

---

## Common Questions

**Q: Do I need to create a BookmarkHub account?**
A: No, the web app works without account creation. Bookmarks are stored in browser localStorage.

**Q: How many bookmarks should I have for testing?**
A: At least 5-10 bookmarks recommended. The extension works with any number from 1 to 1000+.

**Q: Does the extension work on x.com (Twitter's new domain)?**
A: Yes, the extension works on both twitter.com and x.com.

**Q: What if I don't have Twitter bookmarks?**
A: Simply bookmark a few tweets by clicking the bookmark icon (ribbon) on any tweet.

**Q: Where is the bookmark data stored?**
A: Temporarily in chrome.storage.local during import, then transferred to localStorage on bookmarkhub.app. No external servers involved.

---

## Troubleshooting

**If banner doesn't appear:**
1. Refresh the twitter.com/i/bookmarks page
2. Make sure you're logged into Twitter
3. Check Chrome DevTools console for errors

**If import fails:**
1. Verify Twitter account has bookmarks
2. Try refreshing and clicking "Start Import" again
3. Check if Twitter API is accessible

**If BookmarkHub doesn't open:**
1. Check that popup blockers aren't blocking the new tab
2. Verify bookmarkhub.app is accessible

---

## Privacy & Security Notes for Reviewers

- Extension uses NO external servers
- NO data transmission to developer's servers
- NO analytics or tracking
- NO personal information collected beyond bookmark content
- All processing is client-side
- User must explicitly click "Start Import" for any action
- Extension only accesses twitter.com and x.com domains

---

## Support Contact

If reviewers have questions or issues during testing:
- Email: [Your Support Email]
- Documentation: See extension README.md
- Privacy Policy: https://bookmarkhub.app/privacy

---

## Additional Notes

This extension is designed for privacy and simplicity:
- Single purpose: Import Twitter bookmarks
- Minimal permissions (only what's needed)
- Transparent operation (all actions visible to user)
- No background tracking or telemetry
- Open source approach (reviewers can inspect all code)

The extension enhances Twitter's bookmark functionality by providing a better management interface without compromising user privacy.
