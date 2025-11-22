# BookmarkHub Local Development Setup

This guide explains how to run BookmarkHub locally at `https://bookmarkhub.app`.

## Prerequisites

- Node.js and npm installed
- mkcert installed (`brew install mkcert`)
- SwitchHosts or manual hosts file editing

## One-Time Setup

### 1. Install mkcert CA (requires password)

```bash
sudo mkcert -install
```

This command installs the local Certificate Authority so your browser trusts the certificates.

### 2. Update Hosts File

Add this line to `/etc/hosts`:

```
127.0.0.1 bookmarkhub.app
```

**Using SwitchHosts:**
1. Install SwitchHosts (if not already installed)
2. Create a new hosts group
3. Add the line above
4. Enable the group

**Manual Method:**
```bash
sudo nano /etc/hosts
# Add: 127.0.0.1 bookmarkhub.app
# Save and exit
```

### 3. Generate SSL Certificates (Already Done)

The SSL certificates have been generated in `.certs/` directory. If you need to regenerate them:

```bash
mkdir -p .certs
cd .certs
mkcert bookmarkhub.app localhost 127.0.0.1 ::1
cd ..
```

## Running the App

You have two options for running the app:

### Option 1: Direct Access (with port number)

```bash
npm run dev
```

The app will be available at:
- **URL:** https://bookmarkhub.app:5173
- Also accessible at: https://localhost:5173

### Option 2: Via Proxy (without port number)

For a cleaner URL without the port number:

**Terminal 1 - Start Vite:**
```bash
npm run dev
```

**Terminal 2 - Start Proxy (requires sudo):**
```bash
sudo node proxy-server.cjs
```

The app will be available at:
- **URL:** https://bookmarkhub.app (no port needed!)

The proxy server forwards requests from port 443 to the Vite dev server on port 5173.

### Access the App

Open your browser and navigate to:
- Option 1: `https://bookmarkhub.app:5173`
- Option 2: `https://bookmarkhub.app` (if using proxy)

The first time you access it, your browser may show a certificate warning. This is normal for locally-generated certificates. Click "Advanced" and "Proceed" to continue.

## Extension Setup

### Cookies Version (Automated Extractor)

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: `chrome-extension/cookies-version/`

### Direct Import Version

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: `chrome-extension/direct-import/`

Both extensions are now configured to work with `https://bookmarkhub.app` automatically.

## How It Works

### URL Configuration

All components now use a simplified URL configuration:

- **Development:** `https://bookmarkhub.app:5173`
- **Production:** `https://bookmarkhub.app`

The port (5173) is only needed in development. In production, standard HTTPS port (443) is used.

### Extension Integration

Both extensions are configured to:
1. Always use `https://bookmarkhub.app` as the app URL
2. Inject content scripts into pages matching `https://bookmarkhub.app/*`
3. Automatically sync bookmarks when the app is opened

### Import Flow

When you import bookmarks via file upload:

1. File is parsed and validated
2. Bookmarks are saved to localStorage
3. Settings are updated (`setHasSeenSplash`)
4. Success toast is shown
5. Page reloads automatically to show imported bookmarks

## Troubleshooting

### Certificate Errors

If you see certificate errors:

1. Ensure mkcert CA is installed: `mkcert -install`
2. Regenerate certificates:
   ```bash
   cd .certs
   mkcert bookmarkhub.app localhost 127.0.0.1 ::1
   ```
3. Restart your browser

### Can't Access bookmarkhub.app

1. Check hosts file: `cat /etc/hosts | grep bookmarkhub`
2. Verify the entry exists: `127.0.0.1 bookmarkhub.app`
3. Flush DNS cache: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`

### Extension Not Working

1. Ensure extension is loaded from the correct directory
2. Check that content script matches are correct in `manifest.json`
3. Reload the extension: go to `chrome://extensions/` and click the reload icon
4. Check the extension console for errors

### Port Already in Use

If port 5173 is already in use:

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or specify a different port in vite.config.ts
```

## File Structure

```
bookmarksx/
├── .certs/                          # SSL certificates (gitignored)
│   ├── bookmarkhub.app+3.pem        # Certificate
│   └── bookmarkhub.app+3-key.pem    # Private key
├── vite.config.ts                   # Vite config with HTTPS
├── src/constants/app.ts             # App URL constants
├── chrome-extension/
│   ├── cookies-version/             # Automated extractor
│   │   ├── config.js                # Extension config
│   │   └── manifest.json            # Chrome extension manifest
│   └── direct-import/               # Manual import
│       ├── popup/popup.js           # Popup script
│       ├── background/service-worker.js
│       └── manifest.json
└── LOCAL_SETUP.md                   # This file
```

## Production Deployment

When deploying to production:

1. The app will automatically use `https://bookmarkhub.app` (no port)
2. The extension will work without any changes
3. No SSL certificate configuration needed (handled by hosting provider)

The simplified configuration means the same code works in both environments without complex environment detection.
