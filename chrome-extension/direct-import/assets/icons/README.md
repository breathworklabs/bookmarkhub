# BookmarkHub Extension Icons

This directory contains the icon files for the BookmarkHub Chrome extension.

## Icon Files

The following PNG icons are included:

- **icon16.png** - 16x16px (used in toolbar, small displays)
- **icon32.png** - 32x32px (used in extension management)
- **icon48.png** - 48x48px (used in extension management)
- **icon128.png** - 128x128px (used in Chrome Web Store, installation)

All icons are automatically generated from the project logo at different sizes.

## Updating Icons

If you need to update the extension icons:

1. Replace the source logo: `/src/assets/logo_v2 1.png`
2. Run the following commands from the project root:

```bash
cd chrome-extension/assets/icons
cp ../../../src/assets/logo_v2\ 1.png icon128.png
sips -z 48 48 icon128.png --out icon48.png
sips -z 32 32 icon128.png --out icon32.png
sips -z 16 16 icon128.png --out icon16.png
```

## Icon Usage in Manifest

The icons are referenced in `manifest.json`:

```json
"icons": {
  "16": "assets/icons/icon16.png",
  "32": "assets/icons/icon32.png",
  "48": "assets/icons/icon48.png",
  "128": "assets/icons/icon128.png"
}
```

## Design Guidelines

- Use transparent backgrounds for best results
- Ensure the logo is recognizable at 16x16px
- Maintain consistent branding with the main app
- Test icons on both light and dark themes
