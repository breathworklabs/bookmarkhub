# BookmarkHub Chrome Extension

A Chrome extension that extracts bookmarks from X/Twitter using your existing session and integrates with the BookmarkHub application.

## 🚀 **Features**

- **Session-Based Extraction**: No API keys required - uses your existing X/Twitter login
- **Direct API Access**: Extracts bookmarks directly from X/Twitter's internal API
- **Bulk Import**: Import all your existing bookmarks at once
- **Duplicate Detection**: Automatically detects and skips duplicate bookmarks
- **Local Storage**: All data stays on your device - no external servers
- **Real-time Progress**: See extraction progress with live updates
- **Integration**: Seamlessly integrates with BookmarkHub app

## 📦 **Installation**

### Development Installation

1. **Clone or download** this extension folder
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Production Installation

_Coming soon - will be available on Chrome Web Store_

## 🔧 **Usage**

### Basic Usage

1. **Navigate to X/Twitter** in your browser
2. **Log into your account** (if not already logged in)
3. **Click the extension icon** in your toolbar
4. **Click "Extract Bookmarks"** to start the process
5. **Wait for completion** - you'll see progress updates
6. **View results** - see how many bookmarks were imported

### Advanced Features

- **View Statistics**: Click "View Stats" to see import history
- **Open Manager**: Click "Open Manager" to access the main app
- **Extract Again**: Re-run extraction to get new bookmarks

## 🏗️ **Architecture**

### File Structure

```
chrome-extension/
├── manifest.json                 # Extension configuration
├── background/
│   └── service-worker.js        # Background script
├── content-scripts/
│   └── twitter-bookmark-extractor.js  # Main extraction logic
├── popup/
│   ├── popup.html              # Extension popup UI
│   ├── popup.js                # Popup logic
│   └── popup.css               # Popup styling
├── utils/
│   ├── twitter-api-client.js   # API client for X/Twitter
│   ├── bookmark-parser.js      # Data transformation
│   └── storage-manager.js      # Local storage management
└── assets/
    └── icons/                  # Extension icons
```

### Key Components

- **TwitterAPIClient**: Handles direct API calls to X/Twitter
- **BookmarkParser**: Transforms Twitter data to bookmark format
- **StorageManager**: Manages local storage and duplicate detection
- **PopupManager**: Handles UI interactions and status updates

## 🔐 **Privacy & Security**

- **Local Storage Only**: All data stays on your device
- **No External Servers**: No data sent to third-party services
- **Session-Based**: Uses your existing X/Twitter login
- **No API Keys**: No need to create or manage API credentials
- **User Control**: You control what data is extracted and stored

## 🛠️ **Development**

### Prerequisites

- Chrome browser with Developer Mode enabled
- Basic understanding of Chrome extensions
- Access to X/Twitter account for testing

### Testing

1. **Load the extension** in Developer Mode
2. **Navigate to X/Twitter** and log in
3. **Open extension popup** and test extraction
4. **Check browser console** for debugging information
5. **Verify data** in Chrome storage (DevTools > Application > Storage)

### Debugging

- **Console Logs**: Check browser console for detailed logs
- **Network Tab**: Monitor API requests in DevTools
- **Storage Tab**: Verify bookmark data in local storage
- **Extension Popup**: Check popup console for UI issues

## 📊 **API Endpoints**

The extension targets these X/Twitter internal API endpoints:

- `https://twitter.com/i/api/2/timeline/bookmark.json`
- `https://twitter.com/i/api/graphql/*/Bookmarks`
- `https://twitter.com/i/api/1.1/bookmarks/list.json`

## 🔄 **Data Flow**

1. **User clicks extension** on X/Twitter page
2. **Extension checks login status** via API call
3. **User clicks "Extract Bookmarks"**
4. **Extension makes API calls** to bookmark endpoints
5. **Data is parsed and transformed** to bookmark format
6. **Duplicates are detected** and filtered out
7. **Bookmarks are saved** to local storage
8. **User gets confirmation** with import statistics

## 🚨 **Troubleshooting**

### Common Issues

**"Please log into Twitter first"**

- Make sure you're logged into X/Twitter in the same browser
- Try refreshing the page and logging in again

**"No bookmarks found"**

- Check if you have any bookmarks on X/Twitter
- Try navigating to your bookmarks page manually

**"Extraction failed"**

- Check your internet connection
- Try again in a few minutes (rate limiting)
- Check browser console for error details

**"Extension not working"**

- Make sure Developer Mode is enabled
- Try reloading the extension
- Check if you're on a supported X/Twitter page

### Getting Help

1. **Check browser console** for error messages
2. **Verify extension permissions** in chrome://extensions/
3. **Test on different X/Twitter pages**
4. **Try reloading the extension**

## 📝 **Changelog**

### Version 1.0.0

- Initial release
- Basic bookmark extraction from X/Twitter
- Session-based authentication
- Duplicate detection
- Local storage integration
- Popup UI with progress tracking

## 🤝 **Contributing**

This extension is part of the BookmarkHub project. For contributions:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## 📄 **License**

This project is part of the BookmarkHub and follows the same license terms.

---

**Note**: This extension is designed to work with the BookmarkHub application. Make sure you have the main app running to fully utilize the extracted bookmarks.
