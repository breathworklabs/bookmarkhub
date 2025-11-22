#!/bin/bash

# Chrome Web Store Package Builder for BookmarkHub Extension
# This script creates a production-ready ZIP file for Chrome Web Store submission

echo "🚀 BookmarkHub Extension Packager"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current version from manifest
VERSION=$(grep '"version"' manifest.json | cut -d '"' -f 4)
echo -e "${GREEN}Current version: ${VERSION}${NC}"

# Set package name
PACKAGE_NAME="bookmarkhub-extension-v${VERSION}.zip"
OUTPUT_DIR="../.."

echo ""
echo "📋 Pre-flight checks..."

# Check for required files
REQUIRED_FILES=(
  "manifest.json"
  "popup/popup.html"
  "popup/popup.js"
  "background/service-worker.js"
  "assets/icon-16.png"
  "assets/icon-48.png"
  "assets/icon-128.png"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ Missing required file: $file${NC}"
    MISSING_FILES=$((MISSING_FILES + 1))
  else
    echo -e "${GREEN}✅ Found: $file${NC}"
  fi
done

if [ $MISSING_FILES -gt 0 ]; then
  echo -e "${RED}Cannot proceed: Missing $MISSING_FILES required files${NC}"
  exit 1
fi

echo ""
echo "🔍 Checking for development artifacts..."

# Check for console.log statements
CONSOLE_LOGS=$(grep -r "console.log" --include="*.js" . | wc -l)
if [ $CONSOLE_LOGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Warning: Found $CONSOLE_LOGS console.log statements${NC}"
  echo "   Consider removing them for production"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check for localhost references
LOCALHOST=$(grep -r "localhost" --include="*.js" --include="*.json" . | grep -v "CHROME_STORE" | wc -l)
if [ $LOCALHOST -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Warning: Found $LOCALHOST localhost references${NC}"
  echo "   Make sure these are intentional"
fi

echo ""
echo "📦 Creating package..."

# Remove old package if exists
if [ -f "${OUTPUT_DIR}/${PACKAGE_NAME}" ]; then
  echo "Removing old package..."
  rm "${OUTPUT_DIR}/${PACKAGE_NAME}"
fi

# Create ZIP file excluding unwanted files
zip -r "${OUTPUT_DIR}/${PACKAGE_NAME}" . \
  -x "*.DS_Store" \
  -x "*__MACOSX*" \
  -x "*.md" \
  -x "*.sh" \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "*.map" \
  -x "*.log" \
  -x "*.bak" \
  -x "*~" \
  -x "package-lock.json" \
  -x "package.json" \
  -x ".env*" \
  -x "*.test.js" \
  -x "*.spec.js"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Package created successfully!${NC}"
  echo ""
  echo "📊 Package details:"
  echo "   Name: ${PACKAGE_NAME}"
  echo "   Location: ${OUTPUT_DIR}/${PACKAGE_NAME}"

  # Show package size
  SIZE=$(ls -lh "${OUTPUT_DIR}/${PACKAGE_NAME}" | awk '{print $5}')
  echo "   Size: ${SIZE}"

  # Verify it's under Chrome Web Store limit
  SIZE_BYTES=$(stat -f%z "${OUTPUT_DIR}/${PACKAGE_NAME}" 2>/dev/null || stat -c%s "${OUTPUT_DIR}/${PACKAGE_NAME}" 2>/dev/null)
  MAX_SIZE=$((10 * 1024 * 1024)) # 10MB in bytes

  if [ $SIZE_BYTES -lt $MAX_SIZE ]; then
    echo -e "   ${GREEN}✅ Size OK (under 10MB limit)${NC}"
  else
    echo -e "   ${RED}❌ Warning: Package exceeds 10MB limit!${NC}"
  fi

  echo ""
  echo "📝 Package contents:"
  unzip -l "${OUTPUT_DIR}/${PACKAGE_NAME}" | tail -20

  echo ""
  echo -e "${GREEN}🎉 Ready for Chrome Web Store submission!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Go to https://chrome.google.com/webstore/devconsole"
  echo "2. Click 'New Item'"
  echo "3. Upload ${PACKAGE_NAME}"
  echo "4. Fill in store listing details"
  echo "5. Submit for review"

else
  echo -e "${RED}❌ Failed to create package${NC}"
  exit 1
fi