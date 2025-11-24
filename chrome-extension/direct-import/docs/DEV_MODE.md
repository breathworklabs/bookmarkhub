# Development Mode Setup

## 🔧 For Local Development

1. **Enable Dev Mode**:
   ```javascript
   // In config.js, change line 10:
   const DEV_MODE = true  // Enable local development
   ```

2. **Reload Extension**:
   - Go to `chrome://extensions`
   - Click reload button on BookmarkHub extension

3. **Your local app will now open at**:
   - `https://localhost:5173`

## 📦 For Chrome Web Store Submission

1. **Disable Dev Mode**:
   ```javascript
   // In config.js, change line 10:
   const DEV_MODE = false  // Production mode
   ```

2. **Create Package**:
   ```bash
   ./package-for-store.sh
   ```

3. **Submit to Chrome Web Store**

## ✅ Why This Works

- **Chrome Web Store Reviewers**: Will only see production URL (bookmarkhub.app)
- **Your Development**: Just flip `DEV_MODE` flag to work locally
- **No Code Changes Needed**: Just one boolean flag
- **Content Scripts**: Extension works on both localhost and production domains

## 🎯 Current URLs

- **Production**: `https://bookmarkhub.app`
- **Development**: `https://localhost:5173`
- **Local Domain** (optional): `https://bookmarkhub.local`

## ⚠️ Important

**Before submitting to Chrome Web Store:**
- ✅ Set `DEV_MODE = false` in config.js
- ✅ Test the extension loads bookmarkhub.app
- ✅ Run `./package-for-store.sh`
- ✅ Upload the generated ZIP file

The packaging script will warn you if localhost is detected in the code!