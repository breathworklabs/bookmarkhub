# Chrome Web Store Submission Checklist for Markspace

## Pre-Submission Preparation

### ✅ 1. Developer Account
- [ ] Created Chrome Web Store Developer account
- [ ] Paid $5 registration fee
- [ ] Verified email address
- [ ] Completed developer profile

### ✅ 2. Extension Files

**Manifest** (`manifest.json`)
- [x] Updated name to "Markspace - X/Twitter Bookmark Manager"
- [x] Version set to 1.0.0
- [x] Description under 132 characters
- [x] All required fields present
- [x] Valid JSON format
- [ ] Tested locally - no console errors

**Icons**
- [ ] icon16.png (16x16) - Generated from logo_v2 1.png
- [ ] icon32.png (32x32) - Generated from logo_v2 1.png
- [ ] icon48.png (48x48) - Generated from logo_v2 1.png
- [ ] icon128.png (128x128) - Generated from logo_v2 1.png
- [ ] All icons are PNG format
- [ ] All icons have transparent backgrounds (if applicable)

**Code Quality**
- [ ] No console.log statements in production
- [ ] No debug code or TODO comments
- [ ] All files properly formatted
- [ ] No unused files or dependencies
- [ ] Extension tested in Chrome (latest version)
- [ ] All features working as expected

### ✅ 3. Store Listing Materials

**Required Images**
- [ ] Store icon (128x128) - icon128.png
- [ ] Screenshot 1: Extension popup showing extract button (1280x800 or 640x400)
- [ ] Screenshot 2: Bookmark extraction in progress (1280x800 or 640x400)
- [ ] Screenshot 3: Markspace app with organized bookmarks (1280x800 or 640x400)
- [ ] Screenshot 4: Collections and tags interface (1280x800 or 640x400)
- [ ] Screenshot 5: Search and filter functionality (1280x800 or 640x400)

**Optional Promotional Images**
- [ ] Small tile (440x280) - for feature highlighting
- [ ] Marquee (1400x560) - for store homepage featuring
- [ ] Promotional video (YouTube URL)

**Text Content**
- [x] Short description (132 chars): Written in STORE_LISTING.md
- [x] Detailed description (16,000 chars): Written in STORE_LISTING.md
- [x] Privacy policy: Created in PRIVACY_POLICY.md
- [ ] Privacy policy hosted online (required URL)
- [ ] Support email: hello@breathworklabs.com
- [ ] Website URL: https://breathworklabs.com

### ✅ 4. Privacy & Permissions

**Privacy Policy**
- [x] Privacy policy document created
- [ ] Privacy policy uploaded to website/GitHub
- [ ] Policy URL ready for submission
- [x] Policy explains all permissions used
- [x] Policy states data storage practices
- [x] Policy includes contact information

**Permission Justifications**
Prepare explanations for each permission:

- [x] **activeTab**: "Access current X/Twitter tab to extract bookmarks"
- [x] **storage**: "Save user preferences and extension settings locally"
- [x] **tabs**: "Open Markspace app after bookmark extraction"
- [x] **scripting**: "Inject bookmark extraction scripts on X/Twitter pages"
- [x] **cookies**: "Authenticate with X/Twitter using existing session"
- [x] **host_permissions (x.com, twitter.com)**: "Access X/Twitter to extract bookmarks"
- [x] **host_permissions (localhost)**: "Communicate with local Markspace app"

### ✅ 5. Testing

**Functionality Tests**
- [ ] Install extension locally (unpacked)
- [ ] Test on X/Twitter logged-in page
- [ ] Verify bookmark extraction works
- [ ] Test with 0 bookmarks
- [ ] Test with 100+ bookmarks
- [ ] Verify data transfer to Markspace app
- [ ] Test all popup buttons and UI
- [ ] Check extension icon displays correctly
- [ ] Test on Chrome (latest version)
- [ ] Test on Chrome (one version back)

**Error Handling**
- [ ] Test with X/Twitter logged out
- [ ] Test with no internet connection
- [ ] Test with Markspace app not running
- [ ] Verify error messages are clear
- [ ] Check console for errors (should be none)

## Packaging for Submission

### ✅ 6. Create ZIP File

```bash
cd chrome-extension

# Remove any development files
rm -rf node_modules .git .DS_Store

# Create the submission ZIP
zip -r markspace-extension-v1.0.0.zip . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.DS_Store" \
  -x "*SUBMISSION_CHECKLIST.md" \
  -x "*STORE_LISTING.md" \
  -x "*generate-markspace-icons.html"
```

**ZIP Contents Checklist**
- [ ] manifest.json
- [ ] All icon files (16, 32, 48, 128)
- [ ] popup/ directory with HTML, CSS, JS
- [ ] background/ directory with service worker
- [ ] content-scripts/ directory
- [ ] assets/ directory
- [ ] No development files included
- [ ] ZIP file under 100MB
- [ ] Tested: Extracted and loaded as unpacked extension

### ✅ 7. Store Submission Form

**Basic Info**
- [ ] Extension name: "Markspace - X/Twitter Bookmark Manager"
- [ ] Summary: [Use short description from STORE_LISTING.md]
- [ ] Description: [Use detailed description from STORE_LISTING.md]
- [ ] Category: Productivity
- [ ] Language: English

**Privacy**
- [ ] Privacy policy URL: [Your hosted policy URL]
- [ ] Single purpose description: "Extract and organize X/Twitter bookmarks"
- [ ] Permission justifications: [Use prepared explanations]
- [ ] Does NOT use remote code: Confirmed
- [ ] Declares all data collection: Yes (none - local only)

**Distribution**
- [ ] Visibility: Public
- [ ] Regions: All countries
- [ ] Pricing: Free

**Store Listing**
- [ ] Upload icon (128x128)
- [ ] Upload 5 screenshots
- [ ] (Optional) Upload promotional images
- [ ] (Optional) Add video URL
- [ ] Select category: Productivity
- [ ] Add relevant tags (bookmark, twitter, x, organization, manager)

**Contact & Support**
- [ ] Developer name: Breathwork Labs
- [ ] Email: hello@breathworklabs.com
- [ ] Website: https://breathworklabs.com
- [ ] Support URL: https://breathworklabs.com (or GitHub issues)

## Post-Submission

### ✅ 8. After Submitting

**Immediate**
- [ ] Save confirmation email
- [ ] Note submission date
- [ ] Monitor developer dashboard for status

**During Review (1-7 days)**
- [ ] Check email daily for review updates
- [ ] Respond promptly to any reviewer questions
- [ ] Be ready to make changes if requested
- [ ] Monitor dashboard for status changes

**Common Review Issues to Avoid**
- ❌ Permissions not justified
- ❌ Privacy policy missing or incomplete
- ❌ Misleading description or screenshots
- ❌ Broken functionality
- ❌ Missing required fields
- ❌ Poor quality icons or images
- ❌ Name violates trademark
- ❌ Collects data without disclosure

### ✅ 9. If Approved

**Launch**
- [ ] Extension appears in Chrome Web Store
- [ ] Test installation from store
- [ ] Share store link with users
- [ ] Announce launch (social media, website, etc.)

**Store Link Format**
`https://chrome.google.com/webstore/detail/[extension-id]`

**Marketing**
- [ ] Add "Available on Chrome Web Store" badge to website
- [ ] Update README.md with store link
- [ ] Create launch announcement
- [ ] Share with X/Twitter community

### ✅ 10. If Rejected

**Response Plan**
- [ ] Read rejection reason carefully
- [ ] Make required changes
- [ ] Test changes thoroughly
- [ ] Resubmit within 60 days
- [ ] Respond to reviewer comments if needed

**Common Fixes**
- Update permission justifications
- Improve privacy policy clarity
- Fix broken features
- Update screenshots if misleading
- Revise description for accuracy

## Future Updates

### Planning Updates
- [ ] Version numbering scheme: X.Y.Z (major.minor.patch)
- [ ] Keep changelog updated
- [ ] Test updates before submission
- [ ] Review updated content policies
- [ ] Allow 1-3 days for update review

### Update Checklist Template
```markdown
- [ ] Increment version in manifest.json
- [ ] Update changelog
- [ ] Test all functionality
- [ ] Create new ZIP file
- [ ] Upload to dashboard
- [ ] Update store listing (if needed)
- [ ] Add release notes
```

## Important Links

**Chrome Web Store**
- Dashboard: https://chrome.google.com/webstore/devconsole
- Policies: https://developer.chrome.com/docs/webstore/program-policies/
- Best Practices: https://developer.chrome.com/docs/webstore/best_practices/

**Documentation**
- Extension Manifest V3: https://developer.chrome.com/docs/extensions/mv3/
- Publishing Guide: https://developer.chrome.com/docs/webstore/publish/
- Review Process: https://developer.chrome.com/docs/webstore/review-process/

**Support**
- Help Center: https://support.google.com/chrome_webstore/
- Developer Forums: https://groups.google.com/a/chromium.org/g/chromium-extensions

---

## Quick Start Commands

### Generate Icons
```bash
# Open in browser
open chrome-extension/assets/icons/generate-markspace-icons.html
# Then upload: src/assets/logo_v2 1.png
```

### Create Submission ZIP
```bash
cd chrome-extension
zip -r ../markspace-extension-v1.0.0.zip . \
  -x "*.git*" -x "*node_modules*" -x "*.DS_Store" \
  -x "*SUBMISSION_CHECKLIST.md" -x "*STORE_LISTING.md" \
  -x "*generate-markspace-icons.html"
```

### Test Locally
```bash
# 1. Open Chrome
# 2. Navigate to: chrome://extensions/
# 3. Enable "Developer mode"
# 4. Click "Load unpacked"
# 5. Select: chrome-extension/ directory
```

---

**Ready to Submit?**

Make sure ALL boxes are checked before uploading to Chrome Web Store!

Good luck! 🚀
