#!/bin/bash

# Favicon Installation Script
# Run this after downloading favicons from RealFaviconGenerator.net

echo "🎨 Favicon Installation Helper"
echo "=============================="
echo ""

# Check if download folder path is provided
if [ -z "$1" ]; then
    echo "Usage: ./install-favicons.sh /path/to/downloaded/favicon-package"
    echo ""
    echo "Example:"
    echo "  1. Download favicon package from RealFaviconGenerator.net"
    echo "  2. Unzip it to ~/Downloads/favicons/"
    echo "  3. Run: ./install-favicons.sh ~/Downloads/favicons/"
    echo ""
    exit 1
fi

DOWNLOAD_DIR="$1"
TARGET_DIR="public/favicon"

# Check if download directory exists
if [ ! -d "$DOWNLOAD_DIR" ]; then
    echo "❌ Error: Download directory not found: $DOWNLOAD_DIR"
    exit 1
fi

# Check if target directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Error: Target directory not found: $TARGET_DIR"
    echo "   Make sure you're running this from the project root"
    exit 1
fi

echo "📁 Source: $DOWNLOAD_DIR"
echo "📁 Target: $TARGET_DIR"
echo ""

# Copy and rename files
echo "📋 Copying favicon files..."

# Copy ICO
if [ -f "$DOWNLOAD_DIR/favicon.ico" ]; then
    cp "$DOWNLOAD_DIR/favicon.ico" "$TARGET_DIR/favicon.ico"
    echo "✅ favicon.ico"
else
    echo "⚠️  favicon.ico not found"
fi

# Copy 16x16 PNG
if [ -f "$DOWNLOAD_DIR/favicon-16x16.png" ]; then
    cp "$DOWNLOAD_DIR/favicon-16x16.png" "$TARGET_DIR/favicon-16x16.png"
    echo "✅ favicon-16x16.png"
else
    echo "⚠️  favicon-16x16.png not found"
fi

# Copy 32x32 PNG
if [ -f "$DOWNLOAD_DIR/favicon-32x32.png" ]; then
    cp "$DOWNLOAD_DIR/favicon-32x32.png" "$TARGET_DIR/favicon-32x32.png"
    echo "✅ favicon-32x32.png"
else
    echo "⚠️  favicon-32x32.png not found"
fi

# Copy Apple touch icon
if [ -f "$DOWNLOAD_DIR/apple-touch-icon.png" ]; then
    cp "$DOWNLOAD_DIR/apple-touch-icon.png" "$TARGET_DIR/apple-touch-icon.png"
    echo "✅ apple-touch-icon.png"
else
    echo "⚠️  apple-touch-icon.png not found"
fi

# Copy and rename Android Chrome icons
if [ -f "$DOWNLOAD_DIR/android-chrome-192x192.png" ]; then
    cp "$DOWNLOAD_DIR/android-chrome-192x192.png" "$TARGET_DIR/logo192.png"
    echo "✅ logo192.png (from android-chrome-192x192.png)"
else
    echo "⚠️  android-chrome-192x192.png not found"
fi

if [ -f "$DOWNLOAD_DIR/android-chrome-512x512.png" ]; then
    cp "$DOWNLOAD_DIR/android-chrome-512x512.png" "$TARGET_DIR/logo512.png"
    echo "✅ logo512.png (from android-chrome-512x512.png)"
else
    echo "⚠️  android-chrome-512x512.png not found"
fi

echo ""
echo "✨ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Check browser tab for blue favicon"
echo "3. If still not showing, clear browser cache completely"
echo ""
echo "📁 All files are in: $TARGET_DIR"
ls -lh "$TARGET_DIR"
