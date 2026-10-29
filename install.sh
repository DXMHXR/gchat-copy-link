#!/bin/zsh
# Build the Safari extension (signed with the Apple Development certificate)
# and install it to ~/Applications without launching the wrapper app.
set -e
cd "${0:A:h}/GChat Copy Link"
xcodebuild -project "GChat Copy Link.xcodeproj" -scheme "GChat Copy Link" \
  -configuration Release -derivedDataPath build build | grep -E "error|BUILD"
APP="$HOME/Applications/GChat Copy Link.app"
LSREG=/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister
rm -rf "$APP"
mkdir -p "$HOME/Applications"
cp -R "build/Build/Products/Release/GChat Copy Link.app" "$APP"
# Keep Safari from listing the build-folder copy as a second extension.
"$LSREG" -u "$PWD/build/Build/Products/Release/GChat Copy Link.app" 2>/dev/null || true
"$LSREG" -f "$APP"
pluginkit -a "$APP/Contents/PlugIns/GChat Copy Link Extension.appex"
echo "Installed. Reload the Google Chat tab."
