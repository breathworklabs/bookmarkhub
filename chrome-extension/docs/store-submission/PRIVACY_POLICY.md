# Privacy Policy for Markspace Chrome Extension

**Last Updated: November 7, 2024**

## Overview

Markspace ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how the Markspace Chrome Extension handles your data.

## Data Collection and Storage

### What We Collect
Markspace collects and stores the following data **locally on your device only**:

- **X/Twitter Bookmarks**: Tweet content, author information, URLs, timestamps, and engagement metrics from your X/Twitter bookmarks
- **Extension Settings**: Your preferences for sync intervals, notifications, and default options
- **User-Created Data**: Collections, tags, notes, and other organizational data you create within Markspace

### How We Store Data
All data is stored **exclusively on your local device** using:
- Chrome's local storage API
- Browser's localStorage
- IndexedDB for larger datasets

**We do not:**
- Upload your data to any server
- Store your data in the cloud
- Share your data with third parties
- Track your usage or behavior
- Collect any analytics

## Permissions Used

### Required Permissions and Their Purpose

**activeTab**
- Purpose: Access the current X/Twitter tab to extract bookmarks
- Usage: Only activated when you click the extension icon on X/Twitter pages
- Data Access: Reads bookmark data from the currently active X/Twitter tab

**storage**
- Purpose: Save your extension settings locally
- Usage: Stores preferences like sync intervals and notification settings
- Data Access: Only extension configuration, stored locally

**tabs**
- Purpose: Open the Markspace web application
- Usage: Opens a new tab to the Markspace app after bookmark extraction
- Data Access: No data collected, only tab management

**scripting**
- Purpose: Execute bookmark extraction scripts on X/Twitter pages
- Usage: Injects code to read bookmark data from X/Twitter's interface
- Data Access: Reads publicly visible bookmark information from your account

**cookies**
- Purpose: Authenticate with X/Twitter using your existing session
- Usage: Accesses X/Twitter cookies to maintain your login session
- Data Access: Only X/Twitter session cookies, used for authentication
- Note: We never access, store, or transmit your passwords

**host_permissions (x.com, twitter.com)**
- Purpose: Extract bookmarks from X/Twitter pages
- Usage: Access X/Twitter domains to read your bookmark data
- Data Access: Your publicly visible X/Twitter bookmarks

**host_permissions (localhost, 127.0.0.1)**
- Purpose: Communicate with locally-running Markspace application
- Usage: Send extracted bookmarks to your local Markspace instance
- Data Access: Bookmark data stays on your device

## Data Usage

### How Your Data is Used
Your bookmark data is used exclusively for:
- Displaying your bookmarks in the Markspace interface
- Organizing bookmarks with collections and tags
- Searching and filtering your saved content
- Exporting data in various formats (JSON, CSV, HTML)

### What We Don't Do With Your Data
We do not:
- Sell your data to third parties
- Share your data with advertisers
- Use your data for machine learning or AI training (unless locally processed)
- Track which bookmarks you view or organize
- Monitor your usage patterns
- Create user profiles

## Data Security

### Local Storage Security
- All data stored using browser's secure storage APIs
- Data encrypted by the browser's built-in security
- Data access restricted to the extension only
- No transmission of data over the internet

### Your X/Twitter Session
- Extension uses existing X/Twitter session cookies
- No passwords stored or transmitted
- Cookies used only for authenticated API requests
- Session data never sent to external servers

## Data Control and Portability

### Your Rights
You have complete control over your data:

**Access**: View all your data within the Markspace application at any time

**Export**: Download your complete bookmark collection in multiple formats:
- JSON (full data with metadata)
- CSV (spreadsheet-compatible)
- HTML (viewable in any browser)

**Delete**: Clear all data at any time through Settings → Data Management → Clear All Data

**Portability**: Export and import data freely, no lock-in

## Third-Party Services

### X/Twitter Integration
- Markspace interacts with X/Twitter to extract your bookmarks
- Subject to X/Twitter's Privacy Policy and Terms of Service
- We do not control X/Twitter's data practices
- Review X/Twitter's policies at: https://twitter.com/privacy

### No Other Third Parties
Markspace does not integrate with, share data with, or use any other third-party services, analytics platforms, or advertising networks.

## Changes to Bookmarks

### Automatic Updates
- Extension can be configured to periodically check for new bookmarks
- Updates happen locally on your device
- No data sent to external servers during updates

### User-Initiated Actions
All bookmark extraction and updates are initiated by you through:
- Clicking the extension icon
- Configuring automatic sync in settings

## Children's Privacy

Markspace does not knowingly collect data from anyone under the age of 13. The extension requires an X/Twitter account, which has its own age restrictions.

## Data Retention

- Data retained indefinitely on your local device until you delete it
- Uninstalling the extension removes all extension data
- Clearing browser data will remove stored bookmarks
- No data retained on external servers (because we don't use any)

## International Users

Since all data is stored locally on your device, there are no international data transfers. Your data remains in your physical location at all times.

## Updates to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected in:
- The "Last Updated" date at the top of this policy
- Extension updates with version notes
- Notification in the extension (for significant changes)

Continued use of Markspace after changes constitutes acceptance of the updated policy.

## Open Source

Markspace is open source. You can review our code to verify these privacy practices at:
- GitHub: [Repository URL]

## Contact Us

If you have questions about this Privacy Policy or data practices:

**Email**: hello@breathworklabs.com
**Website**: https://breathworklabs.com

## Compliance

Markspace is designed to comply with:
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- Chrome Web Store Developer Program Policies

## Summary

**In Plain English:**
- Your bookmarks stay on your computer
- We don't send anything to the cloud
- We don't track you
- We don't show you ads
- You can export and delete everything
- We only use permissions for core features
- Your privacy is our priority

---

**Breathwork Labs**
Making privacy-first productivity tools
