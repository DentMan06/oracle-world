#!/bin/bash

# Oracle World Release Creation Script
# This script ensures proper zip structure and release creation

set -e  # Exit on error

# Check if version is provided
if [ -z "$1" ]; then
    echo "Usage: ./create-release.sh <version>"
    echo "Example: ./create-release.sh 1.1.4"
    exit 1
fi

VERSION=$1
ZIP_NAME="oracle-world-v${VERSION}.zip"

echo "Creating release v${VERSION}..."

# Step 1: Verify we're in the oracle-world directory
if [ ! -f "module.json" ]; then
    echo "Error: Must run from oracle-world directory"
    exit 1
fi

# Step 2: Check that version matches in all files
MODULE_VERSION=$(grep '"version"' module.json | sed 's/.*"version": "\(.*\)".*/\1/')
SCRIPT_VERSION=$(grep "VERSION = " scripts/module.js | sed "s/.*VERSION = '\(.*\)'.*/\1/")
PACKAGE_VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\(.*\)".*/\1/')

echo "Checking version consistency..."
echo "  module.json: ${MODULE_VERSION}"
echo "  module.js:   ${SCRIPT_VERSION}"
echo "  package.json: ${PACKAGE_VERSION}"

if [ "$MODULE_VERSION" != "$VERSION" ] || [ "$SCRIPT_VERSION" != "$VERSION" ] || [ "$PACKAGE_VERSION" != "$VERSION" ]; then
    echo "Error: Version mismatch! All files must be at version ${VERSION}"
    exit 1
fi

# Step 3: Create zip from parent directory with proper structure
echo "Creating zip file..."
cd ..
rm -f "${ZIP_NAME}"
zip -r "${ZIP_NAME}" oracle-world \
    -x "oracle-world/.git/*" \
    -x "oracle-world/.DS_Store" \
    -x "oracle-world/scripts/.DS_Store" \
    -x "oracle-world/node_modules/*" \
    -x "oracle-world/*.zip" \
    -x "oracle-world/tests/*" \
    -x "oracle-world/*.md" \
    -x "oracle-world/vitest.config.js" \
    -x "oracle-world/package.json" \
    -x "oracle-world/create-release.sh"

# Step 4: Move zip to oracle-world directory
mv "${ZIP_NAME}" oracle-world/
cd oracle-world

# Step 5: Verify zip structure
echo ""
echo "Verifying zip structure..."
unzip -l "${ZIP_NAME}" | head -15

echo ""
echo "Zip file created: ${ZIP_NAME}"
echo ""
echo "Next steps:"
echo "1. Review the zip structure above (should start with 'oracle-world/')"
echo "2. Test the zip file locally in Foundry"
echo "3. Run: gh release create v${VERSION} ${ZIP_NAME} --title \"v${VERSION} - <title>\" --notes \"<notes>\""
