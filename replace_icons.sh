#!/bin/bash

# Script to replace app icons
# Usage: ./replace_icons.sh path_to_your_logo.png

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 path_to_your_logo.png"
    echo "Example: $0 ./my_karma_logo.png"
    exit 1
fi

LOGO_PATH="$1"
PROJECT_DIR="/home/hello/Desktop/Karma"

if [ ! -f "$LOGO_PATH" ]; then
    echo "Error: Logo file not found at $LOGO_PATH"
    exit 1
fi

echo "🎨 Replacing app icons with your logo..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Installing..."
    sudo apt-get update && sudo apt-get install -y imagemagick
fi

# Create different sizes
echo "📐 Creating different icon sizes..."

# Android icon sizes
convert "$LOGO_PATH" -resize 48x48 "$PROJECT_DIR/android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
convert "$LOGO_PATH" -resize 72x72 "$PROJECT_DIR/android/app/src/main/res/mipmap-hdpi/ic_launcher.png"
convert "$LOGO_PATH" -resize 96x96 "$PROJECT_DIR/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
convert "$LOGO_PATH" -resize 144x144 "$PROJECT_DIR/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
convert "$LOGO_PATH" -resize 192x192 "$PROJECT_DIR/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"

# Create round versions
convert "$LOGO_PATH" -resize 48x48 "$PROJECT_DIR/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"
convert "$LOGO_PATH" -resize 72x72 "$PROJECT_DIR/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"
convert "$LOGO_PATH" -resize 96x96 "$PROJECT_DIR/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"
convert "$LOGO_PATH" -resize 144x144 "$PROJECT_DIR/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"
convert "$LOGO_PATH" -resize 192x192 "$PROJECT_DIR/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"

echo "✅ App icons replaced successfully!"
echo "🔄 Clean and rebuild your app to see the changes:"
echo "   cd $PROJECT_DIR"
echo "   ./android/gradlew clean -p android"
echo "   npx react-native run-android"
